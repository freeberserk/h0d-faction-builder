import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const raw=await readFile(new URL("../scripts/h0d-faction-menu.js",import.meta.url),"utf8");
const m=await import("data:text/javascript,"+encodeURIComponent(raw));
const factions=[
  {key:"dent-ambre",label:"Clan de la Dent d'Ambre",hasProfiles:true},
  {key:"caravanes-libres",label:"Caravanes Libres",hasProfiles:true},
  {key:"pillards-rouges",label:"Pillards Rouges",hasProfiles:false}
];
const archetypes=[
  {key:"garde",label:"Garde",factionKey:"dent-ambre",actor:{props:{H0D_Creature_Menace:1}}},
  {key:"messager",label:"Messager",factionKey:"caravanes-libres",actor:{props:{H0D_Creature_Menace:1}}},
  {key:"medecin",label:"Médecin",factionKey:"caravanes-libres",actor:{props:{H0D_Creature_Menace:3}}}
];
const council=[
  {key:"kael",name:"Kael",role:"Voie"},
  {key:"brok",name:"Brok",role:"Forge"}
];
assert.deepEqual(m.groupsForFaction("dent-ambre",factions,true).map(x=>x.key),["council","profiles"]);
assert.deepEqual(m.groupsForFaction("caravanes-libres",factions,true).map(x=>x.key),["profiles"]);
assert.deepEqual(m.groupsForFaction("pillards-rouges",factions,true),[]);
assert.deepEqual(m.groupsForFaction(m.MAINTENANCE_KEY,factions,true).map(x=>x.key),["repair-capabilities","upgrade-caravanes","sync-perception"]);
assert.deepEqual(m.targetsForGroup("dent-ambre","council",archetypes,council).map(x=>x.key),["kael","brok"]);
assert.deepEqual(m.targetsForGroup("caravanes-libres","profiles",archetypes,council).map(x=>x.key),["messager","medecin"]);
assert.equal(m.actionsForGroup("profiles")[0].key,"skip","Non-destructive default");
assert.equal(m.actionsForGroup("council")[0].key,"open","Unique actors must not be overwritten");
for(const rawChoice of [
 {faction:"dent-ambre",group:"council",target:"kael",action:"create"},
 {faction:"dent-ambre",group:"profiles",target:"garde",action:"skip"},
 {faction:"caravanes-libres",group:"profiles",target:"medecin",action:"skip"},
 {faction:m.MAINTENANCE_KEY,group:"repair-capabilities"},
 {faction:m.MAINTENANCE_KEY,group:"sync-perception"}
])assert.equal(m.resolveMenuSelection(rawChoice,factions,archetypes,council).ok,true);
for(const invalid of [
 {faction:"dent-ambre",group:"council",target:"kael",action:"replace"},
 {faction:"dent-ambre",group:"council",target:"medecin",action:"create"},
 {faction:"caravanes-libres",group:"council",target:"brok",action:"create"},
 {faction:"pillards-rouges",group:"profiles",target:"garde",action:"skip"}
])assert.equal(m.resolveMenuSelection(invalid,factions,archetypes,council).ok,false);
const ui=m.menuHTML({factions,esc:x=>x});
assert.match(ui,/data-h0d-run/);
assert.match(ui,/data-h0d-status/);
assert.match(ui,/data-role="target" style="display:none"/);
// Catch accidental reintroduction of single-use DialogV2.input.
const builder=await readFile(new URL("../scripts/h0d-faction-builder.js",import.meta.url),"utf8");
assert.match(builder,/DialogV2\.wait\(\{/);
assert.doesNotMatch(builder,/DialogV2\.input\(\{/);
assert.match(builder,/new FormData\(form\)/);
assert.match(builder,/button\.disabled=true/);
assert.match(builder,/buttons:\[\{action:"close"/);
assert.match(builder,/const confirmed=await foundry\.applications\.api\.DialogV2\.confirm/);
console.log("OK: hierarchical menu, scoped actions, persistent operation, guarded destructive modes.");
