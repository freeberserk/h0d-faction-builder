import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolveFactionCatalogueItem,summarizeFactionCatalogue} from "../scripts/h0d-catalogue-links.js";
const defs=[
 {key:"arc-solaire",name:"Arc solaire",kind:"weapon",catalogue:{pret_pour_builder:true},
  props:{H0D_Arme_Degats:"1d8",H0D_Arme_Equipee:false,H0D_Arme_Portee:15}},
 {key:"plan-echo",name:"Plan ECHO",kind:"armor",catalogue:{pret_pour_builder:false},
  props:{H0D_Armure_Bonus_Defense:0}}
];
const mock={resolveDefinition:({key,name,kind})=>{
 const matches=defs.filter(x=>(x.key===key||x.name===name)&&x.kind===kind);
 return matches.length?{status:key?"key":"name",definition:matches[0],key:matches[0].key,candidates:[matches[0].key]}:
  {status:"missing",definition:null,candidates:[]};
}};
const exact={key:"npc-arc",name:"Arc solaire",props:{H0D_Arme_Degats:"1d8",H0D_Arme_Portee:15,H0D_Arme_Equipee:true}};
const clean=resolveFactionCatalogueItem(exact,"weapon",mock);
assert.equal(clean.status,"canonique");
assert.equal(clean.key,"arc-solaire");
assert.equal(clean.props.H0D_Arme_Equipee,true);
assert.equal(clean.props.H0D_Arme_Degats,"1d8");
const divergent={...exact,props:{...exact.props,H0D_Arme_Degats:"2d8"}};
const review=resolveFactionCatalogueItem(divergent,"weapon",mock);
assert.equal(review.status,"divergence-a-valider");
assert.deepEqual(review.differences,["H0D_Arme_Degats"]);
assert.equal(review.props.H0D_Arme_Degats,"2d8","Ne jamais écraser la fiche PDF du PNJ.");
assert.equal(resolveFactionCatalogueItem({name:"Plan ECHO",props:{}},"armor",mock).status,"plan-incomplet");
assert.equal(resolveFactionCatalogueItem({name:"Arc solaire",props:{}},"armor",mock).status,"missing","Pas de confusion arme/armure.");
assert.equal(resolveFactionCatalogueItem({name:"Arc tribal",props:{}},"weapon",mock).status,"missing");
assert.equal(resolveFactionCatalogueItem(exact,"weapon",null).status,"catalogue-absent");
const summary=summarizeFactionCatalogue([
 {kind:"weapon",entry:exact,archetypeKey:"test"},
 {kind:"weapon",entry:divergent,archetypeKey:"test"},
 {kind:"weapon",entry:{name:"Arc tribal",props:{}},archetypeKey:"test"}
],mock);
assert.equal(summary.total,3);
assert.equal(summary.counts.canonique,1);
assert.equal(summary.counts["divergence-a-valider"],1);
assert.equal(summary.counts.missing,1);
const source=readFileSync(new URL("../scripts/h0d-faction-builder.js",import.meta.url),"utf8");
assert(source.includes('equipmentCatalogueAudit,'));
assert(source.includes('catalogueKey:link.key??null'));
assert(source.includes('resolveFactionCatalogueItem(row.entry,row.kind,catalogueEquipmentApi())'));
console.log("OK — liaison canonique stricte, écarts PNJ signalés et préservés, aucun rapprochement inventé.");
