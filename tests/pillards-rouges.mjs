import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const base=new URL("../",import.meta.url);
const [raw,helper,loader]=await Promise.all([
  readFile(new URL("data/pillards-rouges.json",base),"utf8"),
  readFile(new URL("scripts/h0d-caravanes-stats.js",base),"utf8"),
  readFile(new URL("scripts/h0d-pillards-rouges.js",base),"utf8")
]);
const data=JSON.parse(raw);
const combined=helper.replace(/\bexport\s+(?=const|function)/g,"")+"\n"+
  loader.replace(/^import[^\n]*\n/gm,"").replace(/\bexport\s+(?=const|function|async)/g,"")+
  "\nreturn {buildPillardsDefinitions};";
const {buildPillardsDefinitions}=new Function(combined)();
const out=buildPillardsDefinitions(data);
assert.equal(out.archetypes.length,10);
assert.equal(out.loadouts.length,11,"10 profils dont 2 variantes du Chef");
assert.equal(out.encounters.length,7);
assert.equal(new Set(out.archetypes.map(x=>x.key)).size,10);
assert.ok(!out.archetypes.some(x=>Number(x.actor.props.H0D_Creature_Menace)===1));
assert.equal(data.profils.reduce((s,p)=>s+p.actions.length,0),59);
assert.equal(data.profils.reduce((s,p)=>s+p.traits.length,0),32);
const ids=new Set(out.archetypes.map(x=>x.key));
for(const group of out.encounters){
  for(const part of group.composition)if(part.id)assert.ok(ids.has(part.id),group.nom+": unknown profile "+part.id);
}
for(const profile of data.profils){
  const arch=out.archetypes.find(x=>x.key===profile.id);
  const props=arch.actor.props;
  assert.equal(Number(props.H0D_Creature_PV_Base),profile.stats.pv);
  assert.equal(Number(props.H0D_Creature_DEF_Base),profile.stats.def);
  assert.equal(Number(props.H0D_Creature_Initiative_Base),profile.stats.initiative);
  assert.equal(Number(props.H0D_Creature_Vigueur_Base),profile.stats.vigueur);
  assert.equal(Number(props.H0D_Creature_Reflexes_Base),profile.stats.reflexes);
  assert.equal(Number(props.H0D_Creature_Volonte_Base),profile.stats.volonte);
  assert.equal(Number(props.H0D_Creature_Niveau_PNJ),profile.type==="héroïque"?profile.menace:profile.menace+1);
  const scores=["FOR","DEX","CON","INT","SAG","CHA"];
  const scored=scores.map(k=>Number(props["H0D_Creature_"+k+"_SCORE"]));
  assert.equal(scored.reduce((a,b)=>a+b),72+Math.floor(Number(props.H0D_Creature_Niveau_PNJ)/4));
  for(const [i,key]of scores.entries())
    assert.equal(Number(props["H0D_Creature_"+key+"_MOD"]),Math.floor((scored[i]-10)/2));
  const caps=props.H0D_Creature_Capacites_Table;
  assert.deepEqual(Object.keys(caps),Array.from({length:profile.actions.length+profile.traits.length},(_,i)=>String(i)),"CSB sequential rows");
  const capacityEffects=Object.values(caps).map(x=>x.H0D_Creature_Capacite_Effet);
  for(const a of [...profile.actions,...profile.traits])assert.ok(capacityEffects.includes(a.effect),profile.id+" missing ability "+a.name);
  for(const loadout of out.loadouts.filter(x=>x.archetypeKey===profile.id)){
    for(const w of loadout.weapons){
      const at=Number(props.H0D_Creature_Attaque_Base)+
        Number(props["H0D_Creature_"+(w.props.H0D_Arme_Categorie==="distance"?"DEX":"FOR")+"_MOD"])+
        Number(w.props.H0D_Arme_Bonus_Attaque);
      assert.equal(at,profile.stats.attaque,profile.id+" "+w.name);
      assert.equal(typeof w.props.H0D_Arme_Portee,"number");
      assert.equal(w.props.H0D_Arme_Equipee,true);
    }
    for(const a of loadout.armor)assert.equal(a.props.H0D_Armure_Bonus_Defense,0,profile.id+" duplicated defence");
  }
}
const chef=out.loadouts.filter(x=>x.archetypeKey==="chef-bande-rouge");
assert.deepEqual(chef.map(x=>x.label),["Variante Écorcheur","Variante Casseur de rotules"]);
assert.notDeepEqual(chef[0].weapons.map(x=>x.name),chef[1].weapons.map(x=>x.name));
const sang=out.loadouts.find(x=>x.archetypeKey==="sang-neuf-rouge");
assert.ok(sang.armor.some(x=>x.name==="Bouclier de ferraille leger"),"shield is armor");
assert.ok(sang.weapons.some(x=>x.name==="Bouclier de ferraille leger"),"shield bash is attack");
const art=out.archetypes.find(x=>x.key==="artilleur-rouge");
assert.ok(art.actor.props.H0D_Creature_Notes.includes("6 m avec harnais"));
const king=out.archetypes.find(x=>x.key==="roi-rouge");
assert.equal(king.actor.props.H0D_Creature_Statut_PNJ,"Héroïque");
assert.equal(king.actor.props.H0D_Creature_Niveau_PNJ,"5");
console.log("OK: 10 Pillards, 11 loadouts, 59 actions, 32 traits, 7 encounters; PDF attacks/stats intact, SRD and CSB validated.");
