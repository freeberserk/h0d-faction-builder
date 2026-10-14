import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const raw=await readFile(new URL("../scripts/h0d-faction-menu.js",import.meta.url),"utf8");
const mod=await import("data:text/javascript,"+encodeURIComponent(raw));
const factions=[{key:"pillards-rouges",label:"Pillards Rouges",hasProfiles:true,hasEncounters:true}];
const archetypes=[{key:"chef-bande-rouge",label:"Chef de bande",factionKey:"pillards-rouges",actor:{props:{H0D_Creature_Menace:"4"}}},
 {key:"roi-rouge",label:"Roi Rouge",factionKey:"pillards-rouges",actor:{props:{H0D_Creature_Menace:"5"}}}];
const encounters=[{id:"avant-poste",nom:"Avant-poste rouge",effet:"Capture des prisonniers."}];
const loadouts=[
 {key:"chef-bande-rouge-ecorcheur",archetypeKey:"chef-bande-rouge",label:"Variante Écorcheur"},
 {key:"chef-bande-rouge-casseur",archetypeKey:"chef-bande-rouge",label:"Variante Casseur de rotules"}
];
assert.deepEqual(mod.groupsForFaction("pillards-rouges",factions,false).map(x=>x.key),["profiles","encounters"]);
assert.deepEqual(mod.targetsForGroup("pillards-rouges","encounters",archetypes,[],encounters).map(x=>x.key),["avant-poste"]);
assert.equal(mod.actionsForGroup("encounters")[0].key,"prepare");
assert.deepEqual(mod.resolveMenuSelection({
 faction:"pillards-rouges",group:"encounters",target:"avant-poste",action:"prepare"
},factions,archetypes,[],encounters,loadouts),{
 ok:true,kind:"encounter",faction:"pillards-rouges",group:"encounters",target:"avant-poste",action:"prepare"
});
const c=mod.resolveMenuSelection({
 faction:"pillards-rouges",group:"profiles",target:"chef-bande-rouge",action:"skip",
 loadout:"chef-bande-rouge-casseur"
},factions,archetypes,[],encounters,loadouts);
assert.equal(c.ok,true);assert.equal(c.loadout,"chef-bande-rouge-casseur");
assert.equal(mod.resolveMenuSelection({
 faction:"pillards-rouges",group:"profiles",target:"chef-bande-rouge",action:"skip",
 loadout:"not-from-chef"
},factions,archetypes,[],encounters,loadouts).ok,false);
assert.equal(mod.resolveMenuSelection({
 faction:"pillards-rouges",group:"council",target:"kael",action:"create"
},factions,archetypes,[],encounters,loadouts).ok,false);
const html=mod.menuHTML({factions,esc:s=>s});
assert.match(html,/data-role="loadout"/);
assert.match(html,/data-h0d-run/);
console.log("OK: Pillards submenu, valid encounter selection, safe dynamic Chef variants");
