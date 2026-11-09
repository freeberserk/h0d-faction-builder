import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const source=await readFile(new URL("../scripts/h0d-launcher-macro.js",import.meta.url),"utf8");
const manifest=JSON.parse(await readFile(new URL("../module.json",import.meta.url),"utf8"));
const mainSource=await readFile(new URL("../"+manifest.esmodules[0],import.meta.url),"utf8");
assert.match(mainSource,/import \\{ensureManagedLauncherMacro\\} from ["']\\.\\/h0d-launcher-macro\\.js["']/,
  "Le module doit charger le gestionnaire sécurisé de macros.");
assert.match(mainSource,/return ensureManagedLauncherMacro\\(\\{/,
  "Le lanceur doit passer par le gestionnaire sécurisé.");
assert.doesNotMatch(mainSource,/game\\.macros\\?\\.getName\\(/,
  "Les macros de lancement ne doivent plus être retrouvées par nom seul.");
assert.match(source,/export async function ensureManagedLauncherMacro/);
assert.ok(!source.includes("game.macros?.getName("),"Ne jamais gérer une macro uniquement par son nom.");

const moduleId="h0d-test";
const name="H0D — Test Launcher";
const command="game.h0dTest.open();";
const img="icons/svg/gears.svg";
function makeMacro(value={}){
  const macro={
    name:value.name??name,
    type:value.type??"script",
    scope:value.scope??"global",
    command:value.command??command,
    flags:structuredClone(value.flags??{}),
    updates:[],
    getFlag(namespace,key){return this.flags?.[namespace]?.[key];},
    async update(payload){
      this.updates.push(structuredClone(payload));
      for(const [path,v] of Object.entries(payload)){
        if(!path.startsWith("flags.")){this[path]=v;continue;}
        const parts=path.slice("flags.".length).split(".");
        let o=this.flags;
        for(const key of parts.slice(0,-1))o=o[key]??={};
        o[parts.at(-1)]=structuredClone(v);
      }
      return this;
    }
  };
  return macro;
}
function environment(initial=[],isGM=true){
  const macros=[...initial],messages=[];
  const game={user:{isGM},macros:{contents:macros}};
  const Macro={
    create:async payload=>{
      const macro=makeMacro(payload);
      macros.push(macro);
      return macro;
    }
  };
  const ensure=new Function("game","Macro",
    source.replace(/^export /m,"")+"\nreturn ensureManagedLauncherMacro;"
  )(game,Macro);
  const run=(overrides={})=>ensure({
    moduleId,name,command,img,
    notify:(level,message)=>messages.push({level,message}),
    ...overrides
  });
  return {macros,messages,run};
}
const managed=(cmd=command)=>({
  [moduleId]:{launcher:{managed:true,generatedCommand:cmd}}
});

// 1. Première installation : macro marquée ; redémarrage strictement idempotent.
{
  const w=environment();
  const m=await w.run();
  assert.equal(w.macros.length,1);
  assert.equal(m.flags[moduleId].launcher.managed,true);
  assert.equal(m.flags[moduleId].launcher.generatedCommand,command);
  await w.run();
  assert.equal(w.macros.length,1);
  assert.equal(m.updates.length,0);
}

// 2. Une ancienne macro officiellement connue peut être adoptée, sans réécriture.
{
  const old=makeMacro();
  const w=environment([old]);
  await w.run();
  assert.equal(w.macros.length,1);
  assert.equal(old.command,command);
  assert.deepEqual(Object.keys(old.updates[0]),["flags."+moduleId+".launcher"]);
  assert.equal(old.getFlag(moduleId,"launcher").managed,true);
}

// 3. Une macro utilisateur de même nom est préservée ; un lanceur distinct est créé.
{
  const custom=makeMacro({command:"ui.notifications.info('Ma macro !');"});
  const w=environment([custom]);
  const official=await w.run();
  assert.equal(custom.command,"ui.notifications.info('Ma macro !');");
  assert.equal(custom.updates.length,0);
  assert.equal(w.macros.length,2);
  assert.equal(official.name,name+" (module officiel)");
  assert.equal(official.getFlag(moduleId,"launcher").managed,true);
  await w.run();
  assert.equal(w.macros.length,2,"Un redémarrage ne doit pas dupliquer le lanceur.");
}

// 4. Une macro officiellement marquée, mais personnalisée, est totalement conservée.
{
  const custom=makeMacro({command:"console.log('Ma version');",flags:managed()});
  const w=environment([custom]);
  await w.run({command:"game.h0dTest.openNewUI();"});
  assert.equal(custom.command,"console.log('Ma version');");
  assert.equal(custom.updates.length,0);
  assert.equal(w.macros.length,1);
  assert.equal(w.messages.at(-1).level,"warn");
}

// 5. Mise à jour uniquement sur macro marquée dont la commande est encore intacte.
{
  const official=makeMacro({flags:managed()});
  const w=environment([official]);
  await w.run({command:"game.h0dTest.openNewUI();"});
  assert.equal(official.command,"game.h0dTest.openNewUI();");
  assert.equal(official.getFlag(moduleId,"launcher").generatedCommand,"game.h0dTest.openNewUI();");
  assert.equal(official.updates.length,1);
  assert.equal(w.macros.length,1);
}

// 6. Macro officielle renommée : pas de doublon ni retour au nom d'origine.
{
  const renamed=makeMacro({name:"Mon lanceur préféré",flags:managed()});
  const w=environment([renamed]);
  await w.run();
  assert.equal(renamed.name,"Mon lanceur préféré");
  assert.equal(w.macros.length,1);
}

// 7. Une macro appartenant à un AUTRE module ne doit jamais être adoptée.
{
  const foreign=makeMacro({flags:{"un-autre-module":{launcher:{managed:true,generatedCommand:command}}}});
  const w=environment([foreign]);
  const fresh=await w.run();
  assert.equal(foreign.updates.length,0);
  assert.equal(w.macros.length,2);
  assert.equal(fresh.getFlag(moduleId,"launcher").managed,true);
}

// 8. Plusieurs macros marquées : ne modifier aucune macro par ambiguïté.
{
  const first=makeMacro({flags:managed()}),second=makeMacro({name:"Doublon officiel",flags:managed()});
  const w=environment([first,second]);
  await w.run({command:"nouvelle commande"});
  assert.equal(first.updates.length+second.updates.length,0);
  assert.equal(w.macros.length,2);
  assert.equal(w.messages.at(-1).level,"warn");
}

// 9. Le module ne crée et ne met à jour rien côté joueur.
{
  const w=environment([],false);
  assert.equal(await w.run(),null);
  assert.equal(w.macros.length,0);
}

// 10. Aucun changement de type/scope personnalisés sur les macros marquées.
{
  const custom=makeMacro({type:"chat",flags:managed()});
  const w=environment([custom]);
  await w.run({command:"game.h0dTest.openNewUI();"});
  assert.equal(custom.updates.length,0);
}

console.log("OK: macros H0D — propriété, adoption sûre, personnalisations et collisions préservées.");
