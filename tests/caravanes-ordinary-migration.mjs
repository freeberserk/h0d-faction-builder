import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const base=new URL("../",import.meta.url);
const [builder,helper,data]=await Promise.all([
 readFile(new URL("scripts/h0d-faction-builder.js",base),"utf8"),
 readFile(new URL("scripts/h0d-caravanes-stats.js",base),"utf8"),
 readFile(new URL("data/caravanes-libres.json",base),"utf8")
]);
const source=JSON.parse(data),copy=x=>structuredClone(x),hooks={};
const foundry={utils:{deepClone:copy,escapeHTML:x=>String(x),getRoute:x=>x},
 applications:{api:{DialogV2:{confirm:async()=>true}}}};
const game={user:{isGM:true},actors:[],modules:{get:()=>null}};
const ui={notifications:{info:()=>{},warn:()=>{},error:()=>{}}};
const Hooks={on:(k,fn)=>hooks[k]=fn,once:()=>{}};
const get=await new Function("foundry","game","ui","Hooks","fetch",
 helper.replace(/export\s+(?=const|function)/g,"")+
 "\n"+builder.replace(/^import[^\n]+\n/gm,"")+
 "\nreturn {loadCaravanesProfils,ARCHETYPES,LOADOUTS,caravanScores,caravanMods,caravanAttackPlan,upgradeCaravanesProfilesSafely};"
)(foundry,game,ui,Hooks,async()=>({ok:true,json:async()=>source}));
await get.loadCaravanesProfils();
for(const profile of source.profils){
 const key=profile.id==="messager-de-caravane"?"messager-caravane":profile.id;
 const arch=get.ARCHETYPES.get(key),load=get.LOADOUTS.get(arch.defaultLoadout);
 const priorScores=get.caravanScores(profile.id,profile.menace);
 const priorMods=get.caravanMods(profile.id,profile.menace);
 const plan=get.caravanAttackPlan({attaque:arch.sourceAttack},priorMods,load.weapons);
 const props=copy(arch.actor.props);
 for(const [stat,val]of Object.entries(priorMods)){
   props["H0D_Creature_"+stat+"_MOD"]=String(val);
   props["H0D_Creature_"+stat+"_SCORE"]=String(priorScores[stat]);
 }
 delete props.H0D_Creature_Niveau_PNJ;
 delete props.H0D_Creature_Statut_PNJ;
 props.H0D_Creature_Attaque_Base=String(plan.base);
 const items=load.weapons.map((w,i)=>({
   id:"item"+i,system:{props:{...copy(w.props),H0D_Arme_Bonus_Attaque:plan.weaponBonuses[i]}},
   getFlag:(_ns,k)=>({generated:true,kind:"weapon",entryKey:w.key})[k],
   update:async function(u){for(const [path,val]of Object.entries(u))this.system.props[path.slice("system.props.".length)]=val;}
 }));
 items.get=id=>items.find(x=>x.id===id);
 const actor={name:arch.label,system:{props},items,flags:{},
 getFlag:(_ns,k)=>({generated:true,factionKey:"caravanes-libres",archetypeKey:key})[k],
 setFlag:async(_ns,k,v)=>{actor.flags[k]=v;},
 update:async u=>{for(const [path,val] of Object.entries(u))props[path.slice("system.props.".length)]=val;}
 };
 game.actors=[actor];
 const start=items.map(w=>Number(props.H0D_Creature_Attaque_Base)+
  (w.system.props.H0D_Arme_Categorie==="distance"?priorMods.DEX:priorMods.FOR)+
  Number(w.system.props.H0D_Arme_Bonus_Attaque));
 const migrated=await get.upgradeCaravanesProfilesSafely();
 assert.equal(migrated.updated,1,profile.nom+": migration failed");
 assert.equal(Number(props.H0D_Creature_Niveau_PNJ),profile.menace+1,profile.nom+": wrong NPC level");
 const newMods=get.caravanMods(profile.id,profile.menace+1);
 const totals=items.map(w=>Number(props.H0D_Creature_Attaque_Base)+
  (w.system.props.H0D_Arme_Categorie==="distance"?newMods.DEX:newMods.FOR)+
  Number(w.system.props.H0D_Arme_Bonus_Attaque));
 assert.deepEqual(totals,start,profile.nom+": attack total changed");
 assert.ok(actor.flags.caravanesOrdinaryCRMigrationBackup);
 const again=await get.upgradeCaravanesProfilesSafely();
 assert.equal(again.updated,0,profile.nom+": migration not idempotent");
 assert.equal(again.skipped,1);
}
console.log("OK: all 14 v0.3.1 actors migrated to ordinary NPC level (CR+1), attacks unchanged, rerun skips.");
