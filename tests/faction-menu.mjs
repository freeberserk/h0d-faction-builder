import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const src=await readFile(new URL("../scripts/h0d-faction-menu.js",import.meta.url),"utf8");
const {groupsForFaction,targetsForGroup,actionsForGroup,resolveMenuSelection,menuHTML}=
  await import("data:text/javascript,"+encodeURIComponent(src));
const factions=[
 {key:"dent-ambre",label:"Dent d'Ambre",hasProfiles:true},
 {key:"caravanes-libres",label:"Caravanes Libres",hasProfiles:true},
 {key:"autres",label:"Autres",hasProfiles:false}
];
const archetypes=[
 {key:"guerrier-clan",label:"Guerrier",factionKey:"dent-ambre",actor:{props:{H0D_Creature_Menace:1}}},
 {key:"caravanier",label:"Caravanier",factionKey:"caravanes-libres",actor:{props:{H0D_Creature_Menace:1}}}
];
const members=[{key:"kael",name:"Kael",role:"Guide"},{key:"brok",name:"Brok",role:"Forge"}];
assert.deepEqual(groupsForFaction("dent-ambre",factions,true).map(x=>x.key),["council","profiles"]);
assert.deepEqual(groupsForFaction("caravanes-libres",factions,true).map(x=>x.key),["profiles"]);
assert.deepEqual(groupsForFaction("__maintenance__",factions,true).map(x=>x.key),["repair-capabilities","upgrade-caravanes","sync-perception"]);
assert.deepEqual(targetsForGroup("dent-ambre","council",archetypes,members).map(x=>x.key),["kael","brok"]);
assert.deepEqual(targetsForGroup("caravanes-libres","profiles",archetypes,members).map(x=>x.key),["caravanier"]);
assert.equal(actionsForGroup("council").length,3);
assert.equal(actionsForGroup("profiles")[0].key,"skip");
assert.deepEqual(resolveMenuSelection({faction:"dent-ambre",group:"council",target:"kael",action:"open"},factions,archetypes,members),
 {ok:true,kind:"council",faction:"dent-ambre",group:"council",target:"kael",action:"open"});
assert.equal(resolveMenuSelection({faction:"caravanes-libres",group:"council",target:"kael",action:"create"},factions,archetypes,members).ok,false);
assert.equal(resolveMenuSelection({faction:"dent-ambre",group:"council",target:"kael",action:"replace"},factions,archetypes,members).ok,false);
assert.equal(resolveMenuSelection({faction:"__maintenance__",group:"repair-capabilities"},factions,archetypes,members).kind,"maintenance");
assert.equal(resolveMenuSelection({faction:"__maintenance__",group:"sync-perception"},factions,archetypes,members).action,"sync-perception");
assert.ok(menuHTML({factions,esc:x=>x}).includes('data-h0d-run'));
console.log("OK: dynamic faction/Conseil subgroup, target/action validation and safe defaults");
