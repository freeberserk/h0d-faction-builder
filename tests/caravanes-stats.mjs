import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const code=await readFile(new URL("../scripts/h0d-caravanes-stats.js",import.meta.url),"utf8");
const {ABILITY_NAMES,CARAVAN_MODS,caravanMods,caravanWeaponAbility,caravanAttackPlan,caravanCompactNotes}=
  await import("data:text/javascript,"+encodeURIComponent(code));
const source=JSON.parse(await readFile(new URL("../data/caravanes-libres.json",import.meta.url),"utf8"));
assert.equal(source.profils.length,14);
assert.equal(Object.keys(CARAVAN_MODS).length,14);
for(const profile of source.profils){
 const mods=caravanMods(profile.id);
 assert.equal(Object.keys(mods).length,6);
 assert.ok(ABILITY_NAMES.every(key=>Number.isInteger(mods[key])&&mods[key]>=0&&mods[key]<=5));
 assert.ok(Math.max(...Object.values(mods))<=5);
 const weapons=profile.id==="conducteur-de-brise-route"
   ? [{props:{H0D_Arme_Categorie:"melee"}}]
   : [{props:{H0D_Arme_Categorie:"melee"}},{props:{H0D_Arme_Categorie:"distance"}}];
 const plan=caravanAttackPlan(profile.stats,mods,weapons);
 assert.ok(plan.base>=0);
 for(const [index,weapon] of weapons.entries()){
   const attack=plan.base+caravanWeaponAbility(weapon,mods)+plan.weaponBonuses[index];
   assert.equal(attack,profile.stats.attaque,profile.nom+": source attack must stay exact");
 }
 const notes=caravanCompactNotes(profile,source);
 assert.ok(notes.length<=700,profile.nom+": notes should be concise");
 assert.ok(!notes.includes("Règle commune"),profile.nom+": no duplicate of capacity table");
 assert.ok(!notes.includes("Action :"),profile.nom+": no duplicate attack descriptions");
}
console.log("OK: 14 caravan profiles, 6 valid ability mods, identical attacks, concise notes");
