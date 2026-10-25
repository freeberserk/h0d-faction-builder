/**
 * H0D Faction Builder — HELIOS / document de référence de 7 pages.
 * « Menace » décrit un danger industriel, PAS une spécialité militaire.
 * Les 10 concepts non chiffrés sont référencés SANS être créables en Actors.
 * Le seul profil de combat chiffré ici est le Gardien Nexus (p. 6).
 */
export const HELIOS_SOURCE_PATH="data/helios-reference.json";
const normalize=s=>String(s??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/[’']/g,"").toLowerCase()
 .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const appendRow=(rows,nom,effet,dd=0)=>{
 rows[String(Object.keys(rows).length)]={
  H0D_Creature_Capacite_Nom:nom,H0D_Creature_Capacite_DD:dd,
  H0D_Creature_Capacite_Effet:effet
 };
};
const factionProps=(faction,entry)=>({
 H0D_Creature_Type:"Faction",
 H0D_Creature_Profil:entry.nom,
 H0D_Creature_Role:entry.fonction,
 H0D_Creature_Faction:faction.factionValue,
 H0D_Creature_Faction_Autre:faction.factionOther,
 H0D_Creature_Menace:entry.menace===null?"":String(entry.menace),
 H0D_Creature_XP:"0"
});
const H0D_SOURCE="HELIOS_Faction_Builder_Source(1).pdf";
function createConcept(profile,source){
 if(profile.combat?.statut!=="non_chiffre")
  throw new Error("Profil concept attendu : "+profile.nom);
 if(profile.menace!==null&&(!Number.isInteger(profile.menace)||profile.menace<1||profile.menace>5))
  throw new Error("Menace de concept incorrecte : "+profile.nom);
 const rows={};
 appendRow(rows,"Fonction première",profile.fonction);
 for(const capacity of profile.capacites)appendRow(rows,capacity,
  "Fonction documentée p. "+profile.documentation.page+
  " ; portée / DD / dégâts NON chiffrés par le PDF.");
 appendRow(rows,"Protocole HELIOS","Travail normal → Avertissement → Évitement / redirection → Protection de fonction → Neutralisation.");
 appendRow(rows,"Humains = vivant","Les humains sont évalués, soignés, évacués ou contenus comme tout organisme vivant.");
 const notes=[
  "PROFIL CONCEPTUEL — STATISTIQUES DE COMBAT À DÉFINIR AVANT CRÉATION.",
  "Source : "+H0D_SOURCE+", p. "+profile.documentation.page+".",
  "HELIOS n'est pas une armée. Fonction : "+profile.fonction+".",
  "PV, DEF, ATQ, initiatives, sauvegardes, DD, équipement, XP non documentés ; ne rien inférer de la Menace.",
  profile.forme??"",profile.comportement?.join(" ; ")??"",
  "Non hostile par défaut. La perturbation de sa fonction peut provoquer une neutralisation progressive.",
 ].filter(Boolean).join("\n");
 return {
  key:profile.id,label:profile.nom,factionKey:source.faction.key,
  sourceDataset:H0D_SOURCE,combatReady:false,
  incomplete:true,actor:{props:{
    ...factionProps(source.faction,profile),
    H0D_Creature_Capacites_Table:rows,
    H0D_Creature_Notes:notes
  }},
  encounter:{
   generation_aleatoire:"non",role:profile.fonction,
   profileStatus:"concept",combatReady:false,
   hostileDefault:false,
   condition:"Unité fonctionnelle — à contextualiser. Combat sans fiche chiffrée non générable."
  }
 };
}
function weapon(action,nexus){
 const dice=action.effet.match(/\b(\d+d\d+(?:\s*[+-]\s*\d+)?)/i);
 const portee=action.portee.match(/(\d+)\s*m/);
 const distance=!!portee;
 return {
  key:"helios-nexus-arme-"+normalize(action.nom),
  name:action.nom,
  props:{
   H0D_Arme_Categorie:distance?"distance":"melee",
   H0D_Arme_Carac_Attaque:"aucune",
   H0D_Arme_Carac_Degats:"aucune",
   H0D_Arme_Bonus_Attaque:0,
   H0D_Arme_Bonus_Degats:0,
   H0D_Arme_Degats:dice?dice[1].replace(/\s+/g,""):"0",
   H0D_Arme_Type_Degats:"Autre",
   H0D_Arme_Portee:portee?Number(portee[1]):0,
   H0D_Arme_Critique_Seuil:20,H0D_Arme_Critique_Multiplicateur:2,
   H0D_Arme_Equipee:true,H0D_Arme_Active:true,
   H0D_Arme_Mode_Munition:"Aucune",H0D_Arme_Element:action.nom==="Arc de puissance"?"Choc":"Aucun",
   H0D_Stockage:"PJ",H0D_Arme_Origine:"HELIOS",
   H0D_Arme_Notes:action.effet+" | Condition : "+action.condition+
     " | "+action.portee+". ATTENTION : "+(action.nom==="Canon Gauss"?
      "autorisé UNIQUEMENT connecté ET en protocole d'Éradication ; condition à vérifier manuellement.":
      action.nom==="Jet haute pression"?"nécessite connexion ET eau disponibles.":"outil fonctionnel et non arme militaire.")
  }
 };
}
function makeNexus(source){
 const n=source.nexus,st=n.combat;
 if(n.menace!==13||st.pv!==220||st.def_connecte!==24||st.def_autonome!==20||
  st.attaque!==15||st.dd!==22||n.actions.length!==8||n.pieces.length!==7)
  throw new Error("Gardien Nexus : statistiques ou capacités de référence manquantes.");
 const rows={};
 for(const a of n.actions){
  appendRow(rows,a.nom,
   "ATQ/DD : "+a.attaque_dd+" · Effet : "+a.effet+
   " · Portée : "+a.portee+" · Condition STRICTE : "+a.condition,
   Number(a.attaque_dd.match(/DD\s*(\d+)/)?.[1]??0));
 }
 for(const part of n.pieces)
  appendRow(rows,"Pièce ciblable — "+part.nom,
   "PV pièce : "+part.pv+" · Destruction : "+part.destruction+
   " · Dégâts sur pièce transférés au corps conformément à la règle de campagne.");
 for(const phase of n.escalation)
  appendRow(rows,"Protocole "+phase.niveau+" — "+phase.nom,phase.effet);
 appendRow(rows,"Retour au calme",n.retour_au_calme);
 appendRow(rows,"Ombilical Nexus",n.alimentation.connecte+
  " · "+n.alimentation.cable_sectionne+
  " · "+n.alimentation.connecteur_detruit);
 const props={
  ...factionProps(source.faction,n),
  H0D_Creature_Niveau_PNJ:"14", // Adaptation technique Menace+1, PAS niveau du PDF
  H0D_Creature_Statut_PNJ:"Héroïque",
  H0D_Creature_PV_Base:"220",H0D_Creature_PV_Actuels:"220",
  H0D_Creature_DEF_Base:"24",H0D_Creature_DEF_Divers:"0",
  H0D_Creature_Attaque_Base:"15",H0D_Creature_Attaque_Divers:"0",
  H0D_Creature_Degats_Divers:"0",
  H0D_Creature_Initiative_Base:"2",H0D_Creature_Initiative_Divers:"0",
  H0D_Creature_Vitesse_Base:"9",H0D_Creature_Vitesse_Divers:"0",
  H0D_Creature_Vigueur_Base:"14",H0D_Creature_Vigueur_Divers:"0",
  H0D_Creature_Reflexes_Base:"3",H0D_Creature_Reflexes_Divers:"0",
  H0D_Creature_Volonte_Base:"8",H0D_Creature_Volonte_Divers:"0",
  H0D_Creature_Aptitudes_Table:{},H0D_Creature_Capacites_Table:rows,
  H0D_Creature_Notes:[
   "Source : "+H0D_SOURCE+", p. 5–7.",
   "Menace 13, PV 220, DEF 24 connecté / 20 autonome, ATQ +15, DD 22.",
   "L'état NORMAL est docké. Activation sur seuil critique seulement. Aucune hostilité automatique.",
   "Escalade : Diagnostic → Correction → Contention → Neutralisation → Éradication.",
   "Éradication uniquement après échec des mesures précédentes ET menace persistante ou aggravée.",
   "Canon Gauss uniquement si connecté ET protocole Éradication.",
   "Câble sectionné : autonomie, pas de mort ni arrêt automatique ; connecter détruit = pas de reconnexion.",
   "Le bouclier Nexus détruit réduit la DEF de 4 ; les autres pièces ont des effets explicites.",
   "Les dégâts aux pièces sont aussi infligés au corps (règle H0D).",
   "Six scores de caractéristiques à 10 et niveau technique 14 : ADAPTATIONS CSB neutres, absentes du PDF.",
   "XP NON documentés : champ 0 = inconnu, pas une rencontre gratuite.",
   "Pas de doctrine militaire : le Gardien soigne et protège le vivant, humains compris."
  ].join("\n")
 };
 for(const stat of ["FOR","DEX","CON","INT","SAG","CHA"]){
  props["H0D_Creature_"+stat+"_SCORE"]="10";
  props["H0D_Creature_"+stat+"_MOD"]="0";
 }
 const weapons=n.actions.filter(a=>["+15"].includes(a.attaque_dd)&&
  ["Bras de manutention","Jet haute pression","Canon Gauss"].includes(a.nom))
  .map(a=>weapon(a,n));
 const extra={
  role:n.fonction,hostileDefault:false,profileStatus:"chiffre",combatReady:true,
  generation_aleatoire:"non",
  condition:"Seuil critique du complexe requis. Éradication après échec de la contention et menace persistante.",
  state:"docké",
  connectedDef:24,autonomousDef:20,
  escalationMax:4,requiresCable:true,piecesCiblables:true,source:H0D_SOURCE
 };
 return {
  archetype:{
   key:n.id,label:n.nom,factionKey:source.faction.key,sourceDataset:H0D_SOURCE,
   combatReady:true,actor:{props},encounter:extra,
   defaultLoadout:"gardien-nexus-connecte"
  },
  loadouts:[
   {key:"gardien-nexus-connecte",label:"Connecté à l'ombilical (DEF 24)",
    factionKey:"helios",archetypeKey:n.id,
    actor:{props:{H0D_Creature_DEF_Base:"24",
      H0D_Creature_Notes:props.H0D_Creature_Notes+"\nVARIANTE : connecté, accès à la haute puissance et aux ressources du Nexus."}},
    weapons,armor:[],objects:[],resources:[],modifiers:[]},
   {key:"gardien-nexus-autonome",label:"Autonome, sans ombilical (DEF 20)",
    factionKey:"helios",archetypeKey:n.id,
    actor:{props:{H0D_Creature_DEF_Base:"20",
      H0D_Creature_Notes:props.H0D_Creature_Notes+"\nVARIANTE : autonome DEF 20 ; mousse, jet haute pression, arc et Canon Gauss indisponibles sans alimentation/connecteur."}},
    weapons,armor:[],objects:[],resources:[],modifiers:[]}
  ]
 };
}
export function buildHeliosDefinitions(source){
 if(source?.schema!=="h0d-helios-reference-v1")throw new Error("HELIOS : données PDF invalides.");
 if(source.faction?.key!=="helios"||source.concepts?.length!==10)
  throw new Error("HELIOS : 10 concepts (9 unités et Gardien du Cycle) requis.");
 const ids=new Set();const archetypes=[];
 for(const profile of source.concepts){
  if(ids.has(profile.id)||profile.id===source.nexus.id)throw new Error("Identifiant HELIOS dupliqué.");
  ids.add(profile.id);
  archetypes.push(createConcept(profile,source));
 }
 const nexus=makeNexus(source);
 archetypes.push(nexus.archetype);
 return {archetypes,loadouts:nexus.loadouts,source,
  summary:{concepts:10,combatReady:1,parts:7,actions:8}};
}
export async function loadHeliosPdf({moduleId,registerFaction,registerArchetype,registerLoadout}){
 const base="modules/"+moduleId+"/"+HELIOS_SOURCE_PATH;
 const url=globalThis.foundry?.utils?.getRoute?foundry.utils.getRoute(base):base;
 const response=await fetch(url);
 if(!response.ok)throw new Error("Source HELIOS indisponible (HTTP "+response.status+")");
 const prepared=buildHeliosDefinitions(await response.json());
 registerFaction(prepared.source.faction);
 for(const arch of prepared.archetypes)registerArchetype(arch);
 for(const loadout of prepared.loadouts)registerLoadout(loadout);
 return prepared;
}
