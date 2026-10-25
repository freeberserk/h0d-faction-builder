import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildHeliosDefinitions} from '../scripts/h0d-helios.js';

const source=JSON.parse(readFileSync(new URL('../data/helios-reference.json',import.meta.url),'utf8'));
const {archetypes,loadouts,summary}=buildHeliosDefinitions(source);
assert.equal(source.schema,'h0d-helios-reference-v1');
assert.equal(source.concepts.length,10);
assert.equal(archetypes.length,11);
assert.equal(summary.concepts,10);
assert.equal(summary.combatReady,1);
assert.equal(new Set(archetypes.map(x=>x.key)).size,11);

for(const [i,profile] of source.concepts.entries()){
 const arch=archetypes[i];
 assert.equal(arch.key,profile.id);
 assert.equal(arch.actor.props.H0D_Creature_Profil,profile.nom);
 assert.equal(arch.combatReady,false);
 assert.equal(arch.incomplete,true);
 assert.equal(arch.actor.props.H0D_Creature_XP,'0');
 assert(!Object.prototype.hasOwnProperty.call(arch.actor.props,'H0D_Creature_PV_Base'),
  'Aucun PV inventé pour un profil concept');
 assert(!Object.prototype.hasOwnProperty.call(arch.actor.props,'H0D_Creature_DEF_Base'));
 assert(!Object.prototype.hasOwnProperty.call(arch.actor.props,'H0D_Creature_Attaque_Base'));
 assert(arch.actor.props.H0D_Creature_Notes.includes('À DÉFINIR'));
 assert.equal(arch.encounter.generation_aleatoire,'non');
}
assert.deepEqual(source.concepts.slice(0,9).map(x=>x.menace),[1,1,2,2,3,3,3,4,5]);
assert.equal(source.concepts[9].nom,'Gardien du Cycle');
assert.equal(source.concepts[9].menace,null);
assert.equal(source.concepts[9].hostile_par_defaut,false);

const nexus=archetypes.find(x=>x.key==='gardien-nexus');
assert(nexus);
assert.equal(nexus.combatReady,true);
assert.equal(nexus.encounter.hostileDefault,false);
assert.equal(nexus.encounter.generation_aleatoire,'non');
const p=nexus.actor.props;
assert.equal(p.H0D_Creature_Menace,'13');
assert.equal(p.H0D_Creature_PV_Base,'220');
assert.equal(p.H0D_Creature_DEF_Base,'24');
assert.equal(p.H0D_Creature_Attaque_Base,'15');
assert.equal(p.H0D_Creature_Initiative_Base,'2');
assert.equal(p.H0D_Creature_Vigueur_Base,'14');
assert.equal(p.H0D_Creature_Reflexes_Base,'3');
assert.equal(p.H0D_Creature_Volonte_Base,'8');
assert.equal(p.H0D_Creature_XP,'0');
assert.equal(source.nexus.actions.length,8);
assert.equal(source.nexus.pieces.length,7);
assert.equal(source.nexus.escalation.length,5);
const rows=Object.values(p.H0D_Creature_Capacites_Table);
assert.equal(rows.length,8+7+5+2);
for(const action of source.nexus.actions){
 assert(rows.some(x=>x.H0D_Creature_Capacite_Nom===action.nom &&
  x.H0D_Creature_Capacite_Effet.includes(action.condition)));
}
for(const part of source.nexus.pieces){
 assert(rows.some(x=>x.H0D_Creature_Capacite_Nom==='Pièce ciblable — '+part.nom &&
  x.H0D_Creature_Capacite_Effet.includes('PV pièce : '+part.pv)));
}
assert(rows.some(x=>x.H0D_Creature_Capacite_Nom==='Protocole 4 — Éradication'));
assert.equal(source.nexus.escalation[4].niveau,4);
assert.equal(loadouts.length,2);
const connected=loadouts.find(l=>l.key==='gardien-nexus-connecte');
const autonomous=loadouts.find(l=>l.key==='gardien-nexus-autonome');
assert.equal(connected.actor.props.H0D_Creature_DEF_Base,'24');
assert.equal(autonomous.actor.props.H0D_Creature_DEF_Base,'20');
assert(autonomous.actor.props.H0D_Creature_Notes.includes('indisponibles'));
assert.equal(connected.weapons.length,3);
const gauss=connected.weapons.find(w=>w.name==='Canon Gauss');
assert(gauss);
assert.equal(gauss.props.H0D_Arme_Degats,'8d10');
assert(gauss.props.H0D_Arme_Portee,30);
assert(gauss.props.H0D_Arme_Notes.includes("Éradication"));
assert(gauss.props.H0D_Arme_Notes.includes("UNIQUEMENT"));
for(const w of connected.weapons){
 const atk=+p.H0D_Creature_Attaque_Base+
  +p.H0D_Creature_FOR_MOD*(w.props.H0D_Arme_Categorie==='melee')+
  +p.H0D_Creature_DEX_MOD*(w.props.H0D_Arme_Categorie==='distance')+
  +w.props.H0D_Arme_Bonus_Attaque;
 assert.equal(atk,15,'Attaque PDF inchangée');
}
const main=readFileSync(new URL('../scripts/h0d-faction-builder.js',import.meta.url),'utf8');
assert(main.includes('if(arch.combatReady===false||arch.incomplete===true)'));
assert(main.includes('...clone(chosenLoadout?.actor?.props??{})'),
 'Les deux variantes doivent modifier DEF lors de création');
assert(main.includes('await loadHeliosPdf('));
assert(main.includes('heliosReference:HELIOS_REFERENCE'));
console.log('OK — HELIOS : 9 unités de service + Gardien du Cycle non chiffrés, Nexus chiffré, 8 actions, 7 pièces, 5 protocoles ; défense 24/20 et éradication verrouillée.');
