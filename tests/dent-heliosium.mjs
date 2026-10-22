import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildDentHelioDefinitions} from "../scripts/h0d-dent-heliosium.js";
const input=path=>JSON.parse(readFileSync(new URL("../data/"+path+".json",import.meta.url),"utf8"));
const dent=input("dent-ambre-pnj"),helio=input("heliosium-endgame");
const configs=[[dent,10,54,32],[helio,11,67,65]];
for(const [data,expected,actionCount,traitCount] of configs){
 const transformed=buildDentHelioDefinitions(data);
 assert.equal(data.profils.length,expected);
 assert.equal(transformed.archetypes.length,expected);
 assert.equal(transformed.loadouts.length,expected);
 assert.equal(data.profils.reduce((n,p)=>n+p.actions.length,0),actionCount);
 assert.equal(data.profils.reduce((n,p)=>n+p.traits.length,0),traitCount);
 assert.equal(new Set(data.profils.map(p=>p.id)).size,expected);
 for(const profile of data.profils){
  const a=transformed.archetypes.find(x=>x.key===profile.id);
  const load=transformed.loadouts.find(x=>x.archetypeKey===profile.id);
  assert(a&&load,"Archetype / équipements introuvables : "+profile.id);
  assert.equal(a.sourceAttack,profile.stats.attaque);
  const props=a.actor.props;
  for(const [key,sKey] of Object.entries({
   PV_Base:"pv",DEF_Base:"def",Initiative_Base:"initiative",
   Vigueur_Base:"vigueur",Reflexes_Base:"reflexes",Volonte_Base:"volonte"
  }))assert.equal(+props["H0D_Creature_"+key],profile.stats[sKey],profile.id+" "+key);
  assert.equal(+props.H0D_Creature_Menace,profile.menace);
  assert.equal(props.H0D_Creature_XP,"0","Ne jamais inventer un XP de Menace.");
  assert.equal(+props.H0D_Creature_Vitesse_Base,parseFloat(profile.stats.vitesse.replace(",",".")));
  const capacities=Object.values(props.H0D_Creature_Capacites_Table);
  assert(capacities.length>=profile.actions.length+profile.traits.length,profile.id);
  for(let i=0;i<capacities.length;i++)assert.equal(
   props.H0D_Creature_Capacites_Table[String(i)],capacities[i],
   "CSB doit voir les lignes 0..N-1");
  for(const action of profile.actions)assert(capacities.some(c=>
   c.H0D_Creature_Capacite_Nom===action.nom &&
   c.H0D_Creature_Capacite_Effet.includes(action.degats_effet)),
   profile.id+" action "+action.nom+" absente");
  assert.equal(load.weapons.length+load.armor.length+load.objects.length,profile.equipement.length);
  for(const weapon of load.weapons){
   const related=profile.actions.find(x=>weapon.props.H0D_Arme_Notes.includes("Action "+x.nom+","));
   assert(related,"Arme non liée à une action PDF : "+profile.id+" "+weapon.name);
   const attack=Number(props.H0D_Creature_Attaque_Base)+
     Number(props["H0D_Creature_"+(weapon.props.H0D_Arme_Categorie==="distance"?"DEX":"FOR")+"_MOD"])+
     Number(weapon.props.H0D_Arme_Bonus_Attaque);
   const target=Number(related.attaque_dd.match(/^\+(\d+)/)?.[1]??profile.stats.attaque);
   assert.equal(attack,target,"ATQ finale PDF conservée : "+profile.id+" "+weapon.name);
  }
 }
}
const hunter=buildDentHelioDefinitions(dent).archetypes.find(p=>p.key==="chasseur-de-la-dent");
assert.equal(hunter.actor.props.H0D_Creature_PV_Base,"14");
assert.equal(hunter.actor.props.H0D_Creature_DEF_Base,"13");
const tamer=buildDentHelioDefinitions(dent).archetypes.find(p=>p.key==="dresseur-de-machines");
assert(tamer.actor.props.H0D_Creature_Notes.includes("PAS de contrôle illimité"));
assert(tamer.actor.props.H0D_Creature_Capacites_Table["0"]);
const transformed=buildDentHelioDefinitions(helio);
assert.equal(transformed.encounters.length,9);
const operator=transformed.archetypes.find(p=>p.key==="artilleur-de-convergence");
assert.equal(operator.actor.props.H0D_Creature_PV_Base,"38");
assert.equal(operator.actor.props.H0D_Creature_DEF_Base,"15");
assert.equal(operator.sourceAttack,4);
assert(operator.actor.props.H0D_Creature_Notes.includes("PV 40"));
const cannon=transformed.loadouts.find(p=>p.archetypeKey==="artilleur-de-convergence").weapons.find(w=>w.name==="Plateforme mobile canon");
assert(cannon);
assert.equal(+cannon.props.H0D_Arme_Bonus_Attaque+
 +operator.actor.props.H0D_Creature_Attaque_Base+
 +operator.actor.props.H0D_Creature_DEX_MOD,7);
const boss=transformed.archetypes.find(p=>p.key==="corps-veritable-dheliosium");
assert.equal(boss.actor.props.H0D_Creature_PV_Base,"1300");
assert.equal(boss.actor.props.H0D_Creature_DEF_Base,"18");
assert.equal(boss.encounter.generation_aleatoire,"non");
assert(boss.actor.props.H0D_Creature_Notes.includes("PV850"));
assert.equal(transformed.encounters.find(r=>r.id==="corps-veritable").generation_aleatoire,"non");
const avatar=transformed.archetypes.find(p=>p.key==="avatar-invoque");
assert.equal(avatar.encounter.generation_aleatoire,"conditionnelle");
const other=transformed.archetypes.find(p=>p.key==="lancier-de-convergence");
assert(other.actor.props.H0D_Creature_Capacites_Table &&
 Object.values(other.actor.props.H0D_Creature_Capacites_Table).some(r=>r.H0D_Creature_Capacite_Nom==="Mur de lances"));
console.log("OK — 21 profils PDF, 121 actions, 97 traits; boss et Avatar restreints; opérateur ≠ plateforme.");
