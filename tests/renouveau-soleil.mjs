import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildNewFactionDefinitions} from "../scripts/h0d-renouveau-soleil.js";
const source=name=>JSON.parse(readFileSync(new URL("../data/"+name+".json",import.meta.url),"utf8"));
let count=0;
for(const [name,number,actionCount,traitCount] of [
 ["culte-renouveau",15,78,53],["heritiers-soleil",9,45,29]
]){
 const data=source(name),prepared=buildNewFactionDefinitions(data);
 assert.equal(data.profils.length,number);
 assert.equal(prepared.archetypes.length,number);
 assert.equal(prepared.loadouts.length,number);
 assert.equal(data.profils.reduce((a,p)=>a+p.actions.length,0),actionCount);
 assert.equal(data.profils.reduce((a,p)=>a+p.traits.length,0),traitCount);
 assert.equal(new Set(prepared.archetypes.map(a=>a.key)).size,number);
 for(const p of data.profils){
   const arch=prepared.archetypes.find(a=>a.key===p.id);
   const loadout=prepared.loadouts.find(l=>l.archetypeKey===p.id);
   assert(arch&&loadout,"Profil PDF introuvable : "+p.id);
   const props=arch.actor.props;
   for(const [key,original] of [
     ["PV_Base","pv"],["DEF_Base","def"],
     ["Initiative_Base","initiative"],["Vigueur_Base","vigueur"],
     ["Reflexes_Base","reflexes"],["Volonte_Base","volonte"]
   ])assert.equal(Number(props["H0D_Creature_"+key]),p.stats[original],p.id+" "+key);
   assert.equal(Number(arch.sourceAttack),p.stats.attaque);
   assert.equal(Number(props.H0D_Creature_Vitesse_Base),parseFloat(p.stats.vitesse),p.id+" vitesse");
   assert.equal(props.H0D_Creature_XP,"0","XP de Menace ne doit pas être inventé.");
   assert(Number(props.H0D_Creature_Niveau_PNJ)>0);
   // Les capacités du PDF sont conservées dans la table du template CSB.
   const rows=Object.values(props.H0D_Creature_Capacites_Table);
   assert(rows.length>=p.actions.length+p.traits.length);
   for(let i=0;i<rows.length;i++)assert.equal(
     props.H0D_Creature_Capacites_Table[String(i)],rows[i],
     "Lignes de tableau CSB attendues 0..N-1"
   );
   for(const action of p.actions){
      assert(rows.some(r=>r.H0D_Creature_Capacite_Nom===action.nom
          &&r.H0D_Creature_Capacite_Effet.includes(action.degats_effet)),
        "Capacité manquante : "+p.id+" "+action.nom);
   }
   for(const w of loadout.weapons){
     const stat=w.props.H0D_Arme_Categorie==="distance"?"DEX":"FOR";
     const attack=Number(props.H0D_Creature_Attaque_Base)+
       Number(props["H0D_Creature_"+stat+"_MOD"])+Number(w.props.H0D_Arme_Bonus_Attaque);
     assert.equal(attack,p.stats.attaque,
       "L'attaque PDF ne doit pas être modifiée : "+p.id+" "+w.name);
   }
   assert.equal(loadout.weapons.length+loadout.armor.length+loadout.objects.length,p.equipement.length,
     "L'inventaire PDF doit être intégral : "+p.id);
 }
 count+=number;
}
const cult=buildNewFactionDefinitions(source("culte-renouveau"));
const solar=buildNewFactionDefinitions(source("heritiers-soleil"));
assert.equal(cult.archetypes.filter(p=>p.pdfBranch==="V2").length,3);
assert.equal(solar.archetypes.find(p=>p.key==="aspirant-solaire").defaultLoadout,
 "aspirant-solaire-standard","Clé historique Aspirant solaire à préserver.");
assert.equal(cult.archetypes.find(p=>p.key==="intercesseur-des-machines").actor.props
 .H0D_Creature_Notes.includes("aucun piratage réel"),true);
assert.equal(cult.archetypes.find(p=>p.key==="elu").actor.props
 .H0D_Creature_Capacites_Table["0"].H0D_Creature_Capacite_Nom,"Impulsion neurale");
const champ=solar.archetypes.find(p=>p.key==="champion-solaire-archange");
assert.equal(champ.actor.props.H0D_Creature_Menace,"6");
assert.equal(champ.actor.props.H0D_Creature_PV_Base,"80");
assert.equal(champ.actor.props.H0D_Creature_DEF_Base,"20");
assert(champ.actor.props.H0D_Creature_Notes.includes("sans IA consciente"));
assert(solar.archetypes.every(a=>a.actor.props.H0D_Creature_Capacites_Table));
console.log("OK — "+count+" profils PDF ; 123 actions, 82 traits ; combats et inventaires intégraux.");
