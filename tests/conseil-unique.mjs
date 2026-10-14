import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const source=JSON.parse(await readFile(new URL("../data/conseil-dent-ambre.json",import.meta.url),"utf8"));
const fsRoot=new URL("../",import.meta.url);
assert.equal(source.schema,"h0d-council-unique-v1");
assert.equal(source.characters.length,9);
assert.equal(source.characters.reduce((s,x)=>s+x.items.length,0),49);
assert.deepEqual(source.characters.map(x=>x.key).sort(),["brok","eron","isha","kael","maela","nerys","odran","sava","tarek"]);
const std=[8,10,12,13,14,15],stats=["FOR","DEX","CON","INT","SAG","CHA"];
const attackTargets={brok:6,eron:2,isha:3,kael:4,maela:7,nerys:4,odran:4,sava:5,tarek:7};
const preferred={brok:"Marteau de forge de Brok",eron:"Bâton de marche d’Eron",isha:"Fronde simple",kael:"Lance courte du Conseil",
maela:"Arc de chasse de Maela",nerys:"Fronde mécanique",odran:"Bâton-câble d’Odran",sava:"Fronde mécanique",tarek:"Lance courte du Mur-de-Fer"};
for(const npc of source.characters){
 const p=npc.actor.props;
 assert.equal(p.H0D_Creature_Statut_PNJ,"Héroïque");
 assert.equal(Number(p.H0D_Creature_Niveau_PNJ),4);
 assert.equal(Number(p.H0D_Creature_Menace),4);
 const scores=stats.map(k=>Number(p["H0D_Creature_"+k+"_SCORE"]));
 assert.equal(scores.reduce((a,b)=>a+b),73,npc.key+": 72 base + one level four boost");
 assert.deepEqual(scores.map(x=>x===16?15:x).sort((a,b)=>a-b),std,npc.key+": SRD array");
 for(const stat of stats)assert.equal(Number(p["H0D_Creature_"+stat+"_MOD"]),Math.floor((Number(p["H0D_Creature_"+stat+"_SCORE"])-10)/2));
 assert.ok(!Object.keys(p).some(k=>k.includes("_Container")),"Stale Actor item cache");
 for(const item of npc.items){
   assert.ok(["weapon","armor","object"].includes(item.kind));
   assert.ok(!Object.keys(item.props).some(k=>k.includes("_Container")),"Stale Item cache");
   if(item.kind==="weapon"){
     assert.equal(typeof item.props.H0D_Arme_Portee,"number");
     assert.equal(item.props.H0D_Arme_Equipee,true);
   }
 }
 const weapon=npc.items.find(x=>x.name===preferred[npc.key]);
 assert.ok(weapon,npc.key+": missing main weapon");
 const cat=weapon.props.H0D_Arme_Categorie;
 const bonus=Number(p["H0D_Creature_"+(cat==="distance"?"DEX":"FOR")+"_MOD"]);
 const attack=Number(p.H0D_Creature_Attaque_Base)+bonus+Number(weapon.props.H0D_Arme_Bonus_Attaque);
 assert.equal(attack,attackTargets[npc.key],npc.key+": exported attack changed");
 for(const mode of ["portrait","token"]){
   const asset=npc.image[mode];
   assert.ok(asset.startsWith("modules/h0d-faction-builder/assets/conseil/"));
   const raw=await readFile(new URL(asset.replace("modules/h0d-faction-builder/",""),fsRoot));
   assert.equal(raw.toString("ascii",0,4),"RIFF");
   assert.equal(raw.toString("ascii",8,12),"WEBP");
 }
}
const original=await readFile(new URL("../scripts/h0d-council-unique.js",import.meta.url),"utf8");
const {installCouncilUnique,isLegacyCouncilActor}=await import("data:text/javascript,"+encodeURIComponent(original));
globalThis.game={user:{isGM:true},actors:[]};
globalThis.ui={notifications:{info:()=>{},warn:()=>{},error:()=>{}}};
globalThis.foundry={utils:{getRoute:x=>x,escapeHTML:x=>x},
  applications:{api:{DialogV2:{confirm:async()=>true}}}};
globalThis.fetch=async()=>({ok:true,json:async()=>source});
const updated=[],folders=[],templateStub={id:"template",system:{props:{},templateSystemUniqueVersion:1},prototypeToken:{}};
globalThis.Actor={implementation:{createDocuments:async([payload])=>{
 const items=[];items.get=id=>items.find(x=>x.id===id);
 const actor={id:"created-"+payload.name,name:payload.name,img:payload.img,prototypeToken:payload.prototypeToken,
  system:{props:{}},items,flags:payload.flags,
  getFlag:(ns,k)=>actor.flags[ns]?.[k],sheet:{render:()=>{actor.opened=true;}},
  update:async values=>{updated.push(values);if(values.system?.props)actor.system.props=values.system.props;},
  createEmbeddedDocuments:async(_kind,entries)=>{const out=entries.map((data,i)=>({
    id:"item-"+i,name:data.name,system:{props:{}},
    update:async x=>{if(x.system?.props)out[i].system.props=x.system.props;}
  }));items.push(...out);return out;},
  delete:async()=>{game.actors=game.actors.filter(x=>x!==actor);}
 };
 game.actors.push(actor);return [actor];
}}};
const council=await installCouncilUnique({
 moduleId:"h0d-faction-builder",rootFolder:"H0D — Factions générées",
 templateState:()=>({ok:true}),template:()=>templateStub,actorTemplateKey:"actor-creature",
 clone:x=>structuredClone(x),ensureFolder:async(name,parent)=>{const t={name,parent,id:"folder"+folders.length};folders.push(t);return t;},
 systemFromTemplate:()=>({props:{}}),
 forceTemplateAndProps:async(doc,t,p)=>{doc.system.props=structuredClone(p);},
 itemData:(entry,kind)=>({name:entry.name,kind}),notify:()=>{}
});
const brok=await council.create("brok");
assert.equal(brok.items.length,5);
assert.ok(brok.img.endsWith("/brok.webp"));
assert.ok(brok.prototypeToken.texture.src.includes("tokens/brok.webp"));
assert.equal(brok.system.props.H0D_Creature_Statut_PNJ,"Héroïque");
await assert.rejects(council.create("brok"));
await council.open("brok");assert.equal(brok.opened,true);
const kael=source.characters.find(x=>x.key==="kael");
const older={id:kael.sourceActorId,name:kael.name,img:"custom.png",items:[],system:{props:{PV:33}},flags:{},
 getFlag:()=>undefined,update:async function(changes){this.flags["h0d-faction-builder"]={councilUnique:true,councilKey:"kael"};this.edits=changes;}};
game.actors.push(older);
const adopted=await council.adopt("kael");
assert.equal(adopted,older);
assert.equal(older.img,"custom.png");
assert.equal(older.system.props.PV,33);
assert.ok(!Object.keys(older.edits).some(k=>k.startsWith("system.")));
const legacies=[
  ["brok","Brok - Maitres de la Forge"],
  ["eron","Eron - Maitre des Soins"],
  ["isha","Isha - Maitresse des Récits"]
];
game.actors=[];
for (const [key,name] of legacies){
  const npc=source.characters.find(x=>x.key===key);
  const old={id:"legacy-"+key,name,img:"https://forge-vtt.example/old/"+key+".png",
    items:[{name:"Original "+key}],system:{props:{PV:27,Notes:"Journal de campagne privé"}},
    flags:{"h0d-conseil":{packVersion:"1.0",equivalentLevel:4}},
    getFlag:function(ns,k){return this.flags[ns]?.[k];},
    update:async function(changes){this.edits=changes;
      for(const [k,v] of Object.entries(changes)){
        if(k.startsWith("flags.h0d-faction-builder."))this.flags["h0d-faction-builder"]={
          ...(this.flags["h0d-faction-builder"]??{}),[k.split(".").at(-1)]:v};
      }
    }
  };
  game.actors.push(old);
  assert.equal(isLegacyCouncilActor(old,npc),true,key+": legacy alias not recognized");
  await assert.rejects(council.create(key),/existe déjà/,key+": should never duplicate the legacy Actor");
  const adopted=await council.adopt(key);
  assert.equal(adopted,old);
  assert.equal(old.img,"https://forge-vtt.example/old/"+key+".png");
  assert.equal(old.items.length,1);
  assert.equal(old.system.props.PV,27);
  assert.equal(old.system.props.Notes,"Journal de campagne privé");
  assert.ok(Object.keys(old.edits).every(k=>k.startsWith("flags.")),key+": adoption must write flags only");
  assert.ok(old.flags["h0d-faction-builder"].councilUnique,key+": adoption did not mark actor");
  const sameName={...old,flags:{},getFlag:()=>undefined};
  assert.equal(isLegacyCouncilActor(sameName,npc),false,"An untagged namesake must not be recognized as legacy Council.");
  game.actors=[];
}
console.log("OK: 9 heroic Council entries; legacy Brok/Eron/Isha recognized and adopted without duplicates or data changes.");
