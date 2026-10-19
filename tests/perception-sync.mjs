import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const main=await readFile(new URL("../scripts/h0d-faction-builder.js", import.meta.url),"utf8");
const menu=await readFile(new URL("../scripts/h0d-faction-menu.js", import.meta.url),"utf8");
const council=await readFile(new URL("../scripts/h0d-council-unique.js", import.meta.url),"utf8");
assert.match(main,/const MODULE_VERSION = "0\.6\.1"/);
for(const key of ["H0D_Creature_Perception","H0D_Creature_Perception_Portee","H0D_Creature_Sens_Speciaux","H0D_Creature_Sens_Portee"])
  assert.ok(main.includes(key),"Champ absent : "+key);
assert.ok(main.includes("syncFactionPerception"),"Synchronisation faction absente");
assert.ok(menu.includes("sync-perception"),"Action maintenance PER absente");
assert.ok(council.includes("perceptionPropsForActor"),"Conseil non raccordé à PER");
console.log("Faction perception sync OK");
