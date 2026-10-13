import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const code=await readFile(new URL("../scripts/h0d-caravanes-stats.js",import.meta.url),"utf8");
const {STANDARD_ARRAY,ABILITY_NAMES,CARAVAN_BASE_SCORES,ordinaryNpcLevelFromCR,caravanScores,caravanMods,scoreToMod,caravanWeaponAbility,caravanAttackPlan,caravanCompactNotes}=
  await import("data:text/javascript,"+encodeURIComponent(code));
const source=JSON.parse(await readFile(new URL("../data/caravanes-libres.json",import.meta.url),"utf8"));
assert.equal(source.profils.length,14);
assert.equal(Object.keys(CARAVAN_BASE_SCORES).length,14);
const sort=xs=>[...xs].sort((a,b)=>a-b);
for(const profile of source.profils){
 const level=ordinaryNpcLevelFromCR(profile.menace);
 assert.equal(level,profile.menace+1,"Ordinary NPC CR = level - 1");
 const mods=caravanMods(profile.id,level);
 const scores=caravanScores(profile.id,level);
 const base=CARAVAN_BASE_SCORES[profile.id];
 assert.deepEqual(sort(base),sort(STANDARD_ARRAY),profile.nom+": requires exact SRD array");
 assert.equal(Object.keys(scores).length,6);
 assert.ok(ABILITY_NAMES.every(key=>Number.isInteger(scores[key])&&mods[key]===scoreToMod(scores[key])));
 const increases=ABILITY_NAMES.map((name,i)=>scores[name]-base[i]);
 assert.equal(increases.reduce((a,b)=>a+b,0),Math.floor(level/4),profile.nom+": wrong SRD leveling");
 assert.ok(increases.every(n=>Number.isInteger(n)&&n>=0&&n<=1),profile.nom+": too many boosts");
 const weapons=profile.id==="conducteur-de-brise-route"
   ? [{props:{H0D_Arme_Categorie:"melee"}}]
   : [{props:{H0D_Arme_Categorie:"melee"}},{props:{H0D_Arme_Categorie:"distance"}}];
 const plan=caravanAttackPlan(profile.stats,mods,weapons);
 assert.ok(plan.base>=0);
 for(const [index,weapon] of weapons.entries()){
   const attack=plan.base+caravanWeaponAbility(weapon,mods)+plan.weaponBonuses[index];
   assert.equal(attack,profile.stats.attaque,profile.nom+": unchanged PDF attack");
 }
 const notes=caravanCompactNotes(profile,source);
 assert.ok(notes.length<=700,profile.nom+": notes too long");
 assert.ok(!notes.includes("Règle commune")&&!notes.includes("Action :"),profile.nom+": duplicated capacity text");
}
console.log("OK: 14 scores SRD, ordinary CR=level-1, boost at NPC level 4 (Menace 3), unchanged attacks");
