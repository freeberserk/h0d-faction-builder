/**
 * H0D Faction Builder — rosters Dent d'Ambre et HelioSium.
 * Source : les deux PDF fournis, datés lors de l'import.
 * Toutes les statistiques de combat, capacités et équipements sont celles des PDF.
 * Les 6 caractéristiques SRD et le niveau technique CSB sont des ADAPTATIONS
 * explicites : ils ne sont pas chiffrés par les PDF. Aucun XP n'est inventé.
 */
import {ABILITY_NAMES,scoreToMod} from "./h0d-caravanes-stats.js";

export const EXTRA_FACTIONS=Object.freeze([
  {key:"dent-ambre",path:"data/dent-ambre-pnj.json",expected:10},
  {key:"heliosium",path:"data/heliosium-endgame.json",expected:11}
]);
const slug=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/[’']/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const trim=s=>String(s??"").trim();
/** Valeurs de caractéristiques ADAPTÉES du tableau ordinaire SRD 15/14/13/12/10/8. */
const SCORES=Object.freeze({
 "chasseur-de-la-dent":[12,15,13,10,14,8],
 "recuperateur-du-clan":[12,13,14,15,10,8],
 "eclaireur-de-la-dent":[10,15,12,13,14,8],
 "gardien-de-la-dent":[15,10,14,8,13,12],
 "soigneur-du-clan":[8,13,12,14,15,10],
 "artisan-de-la-forge":[12,13,14,15,10,8],
 "gardien-des-focus":[8,13,12,15,14,10],
 "dresseur-de-machines":[10,13,12,15,14,8],
 "sentinelle-de-la-dent":[10,15,12,13,14,8],
 "maitre-darmes-de-la-dent":[15,14,13,8,12,10],
 "auxiliaire-restaure":[15,13,14,8,12,10],
 "sentinelle-heliosium":[10,15,12,14,13,8],
 "lancier-de-convergence":[15,10,14,8,13,12],
 "artilleur-de-convergence":[8,15,12,14,13,10],
 "ingenieur-heliosium":[8,13,12,15,14,10],
 "inquisiteur-heliosium":[15,12,14,10,13,8],
 "elu-de-la-convergence":[8,13,12,15,14,10],
 "officier-de-convergence":[13,14,12,15,10,8],
 "avatar-invoque":[15,12,14,8,13,10],
 "archange-heliosium":[15,14,13,10,12,8],
 "corps-veritable-dheliosium":[15,14,13,8,12,10]
});
/** Carte de correspondance explicite équipement -> action du PDF. */
const WEAPONS=Object.freeze({
 "chasseur-de-la-dent":{"Arc de chasse":"Arc de chasse","Lance de chasse":"Lance de chasse"},
 "recuperateur-du-clan":{"Hache-outil":"Hache-outil"},
 "eclaireur-de-la-dent":{"Arc court":"Arc court","Couteau":"Couteau"},
 "gardien-de-la-dent":{"Lance renforcée":"Lance renforcée","Javelots x3":"Javelot"},
 "soigneur-du-clan":{"Bâton-câble":"Bâton-câble","Fronde simple":"Fronde"},
 "artisan-de-la-forge":{"Marteau de forge léger":"Marteau de forge"},
 "gardien-des-focus":{"Fronde mécanique":"Fronde mécanique","Dague de récupération":"Dague"},
 "dresseur-de-machines":{"Lance de chasse":"Lance de chasse"},
 "sentinelle-de-la-dent":{"Arc de chasse":"Arc de sentinelle","Lance courte":"Lance courte"},
 "maitre-darmes-de-la-dent":{"Lance renforcée ou arme personnelle de vétéran":"Arme de maître","Arc de chasse":"Arc de vétéran"},
 "auxiliaire-restaure":{"Lance de convergence légère":"Lance de convergence"},
 "sentinelle-heliosium":{"Arme de service légère":"Arme de service"},
 "lancier-de-convergence":{"Grande lance de convergence":"Grande lance"},
 "artilleur-de-convergence":{"Plateforme mobile canon":"Canon de convergence"},
 "ingenieur-heliosium":{},
 "inquisiteur-heliosium":{"Gantelet de rupture / masse de brèche":"Gantelet de rupture"},
 "elu-de-la-convergence":{},
 "officier-de-convergence":{"Lame / projecteur léger":"Arme de commandement"},
 "avatar-invoque":{},
 "archange-heliosium":{"Lame de convergence":"Lame de convergence","Serres mécaniques":"Serres","Projecteur énergétique":"Décharge atmosphérique"},
 "corps-veritable-dheliosium":{}
});
const ARMOR=/\barmure\b|\bbouclier\b|\bpavois\b|\bcuir renforcé\b|\bblindage\b|\bmanteau\b|\bcape\b|\bplaques\b|\bchâssis\b/i;
const SHIELD=/\bbouclier\b|\bpavois\b/i;
const CONSUMABLE=/\bcellules?\b|\bmunitions?\b|\bbombes?\b|\bfumigènes?\b/i;
function capacityRows(p,source){
 const rows={};
 const add=(nom,dd,effet)=>{rows[String(Object.keys(rows).length)]={
  H0D_Creature_Capacite_Nom:nom,H0D_Creature_Capacite_DD:dd,
  H0D_Creature_Capacite_Effet:effet
 }};
 for(const action of p.actions){
  const match=trim(action.attaque_dd).match(/DD\s*(\d+)/i);
  add(action.nom,match?Number(match[1]):0,[
    "Type : "+action.type,"ATQ/DD : "+action.attaque_dd,
    "Effet : "+action.degats_effet,"Portée : "+action.portee,
    "Recharge : "+action.recharge,action.notes?"Notes : "+action.notes:""
  ].filter(Boolean).join(" · "));
 }
 for(const trait of p.traits){
  const str=typeof trait==="string"?trait:trait.nom+" : "+trait.effet;
  const pos=str.indexOf(":");
  add(pos>=0?str.slice(0,pos).trim():str,0,pos>=0?str.slice(pos+1).trim():str);
 }
 for(const rule of source.regles_communes??[]){
  // Règle commune du clan : usage limité aux circonstances de métier.
  if(!p.traits.some(t=>slug(typeof t==="string"?t:t.nom)===slug(rule.nom)))
    add(rule.nom,0,rule.effet);
  else add(rule.nom+" — portée exacte",0,rule.effet);
 }
 if(p.stats.plateforme){
  const st=p.stats.plateforme;
  add("Plateforme mobile autonome — fiche séparée",0,
   "La plateforme n'est PAS les PV de l'opérateur : PV "+st.pv+
   ", DEF "+st.def+", ATQ +"+st.attaque+", vitesse "+st.vitesse+
   ". Traiter ses dégâts, sa destruction et son repli séparément.");
 }
 if(p.stats.coeur){
  const st=p.stats.coeur;
  add("Phase finale — Cœur HelioSium",22,
   "Phase finale distincte : PV "+st.pv+", DEF "+st.def+", ATQ +"+st.attaque+
   ". Les PV 1300 appartiennent au Titan et ne doivent pas être additionnés avec les 850 PV du Cœur.");
 }
 if(p.id==="avatar-invoque")add("Assemblage conditionnel",0,
   "Apparition uniquement si un Élu est présent et si deux modules cohérents issus des machines ou composants de la scène sont disponibles.");
 if(p.id==="corps-veritable-dheliosium")add("Interdit en génération aléatoire",0,
   "Boss final explicitement choisi par le MJ ; combat multiphase, pièces ciblables, Portes Mortes et objectifs de campagne.");
 return rows;
}
function makeWeapon(name,action,p,source,mods,base){
 const distance=/distance|tir|projecteur|arc|fronde|javelot|canon|service/i.test(action.type+" "+name);
 const ability=distance?mods.DEX:mods.FOR;
 const desired=Number(trim(action.attaque_dd).match(/^\+(\d+)/)?.[1]??p.stats.attaque);
 const dice=trim(action.degats_effet).match(/\b\d+d\d+(?:\s*[+-]\s*\d+)?/i);
 const range=trim(action.portee).match(/(\d+(?:[.,]\d+)?)\s*m/);
 const platform=p.id==="artilleur-de-convergence"&&name==="Plateforme mobile canon";
 return {key:"pdf-"+p.id+"-arme-"+slug(name),name,props:{
  H0D_Arme_Categorie:distance?"distance":"melee",
  H0D_Arme_Carac_Attaque:"aucune",H0D_Arme_Carac_Degats:"aucune",
  H0D_Arme_Bonus_Attaque:desired-base-ability,
  H0D_Arme_Degats:dice?dice[0].replace(/\s+/g,""):"0",
  H0D_Arme_Bonus_Degats:0,H0D_Arme_Type_Degats:"Autre",
  H0D_Arme_Portee:range?Number(range[1].replace(",",".")):0,
  H0D_Arme_Critique_Seuil:20,H0D_Arme_Critique_Multiplicateur:2,
  H0D_Arme_Equipee:true,H0D_Arme_Active:true,H0D_Arme_Mode_Munition:"Aucune",
  H0D_Arme_Element:/électr|electric|énergie|choc/i.test(action.degats_effet)?"Choc":"Aucun",
  H0D_Stockage:"PJ",H0D_Arme_Origine:source.faction.label,
  H0D_Arme_Notes:"Source PDF p."+p.pages_pdf.join(",")+". Action "+action.nom+
    ", ATQ "+action.attaque_dd+", effet "+action.degats_effet+
    ". "+(platform?"Arme installée sur la plateforme SÉPARÉE (40 PV/DEF 16), pas sur le corps du PNJ. ":"")+
    "Dégâts PDF maintenus : ne pas ajouter un second bonus FOR aux armes propulsées."
 }};
}
function makeArmor(name,p,source){
 return {key:"pdf-"+p.id+"-armure-"+slug(name),name,props:{
  H0D_Armure_Type:SHIELD.test(name)?"bouclier":"armure",
  H0D_Armure_Zone:SHIELD.test(name)?"bras":"corps",
  H0D_Armure_Active:true,H0D_Armure_Bonus_Defense:0,
  H0D_Armure_Origine:source.faction.label,H0D_Stockage:"PJ",
  H0D_Armure_Description:"PDF p."+p.pages_pdf.join(",")+
   ". La DEF du PNJ englobe déjà son équipement : +0 additionnel (aucun cumul avec les boucliers du clan)."
 }};
}
function makeObject(name,p,source){
 return {key:"pdf-"+p.id+"-objet-"+slug(name),name,props:{
  H0D_Objet_Type:CONSUMABLE.test(name)?"Consommable":/kit|outils|pinces|nécessaire/i.test(name)?"Kit":"Outil",
  H0D_Objet_Sous_Type:name,H0D_Objet_Quantite:1,H0D_Stockage:"PJ",
  H0D_Objet_Actif:false,H0D_Objet_Identifie:true,H0D_Objet_Origine:source.faction.label,
  H0D_Objet_Etat:"Intact",
  H0D_Objet_Description:"Mention PDF p."+p.pages_pdf.join(",")+
   ". Quantité de charges non spécifiée ; ne représente pas des unités réelles de stock."
 }};
}
/**
 * Données validables hors Foundry. Aucun Actor n'est créé par cette fonction.
 * Les profils HelioSium gardent leurs conditions dans archetype.encounter.
 */
export function buildDentHelioDefinitions(source){
 const isDent=source?.schema==="h0d-dent-ambre-v1";
 const isHelio=source?.schema==="h0d-heliosium-endgame-v1";
 if(!isDent&&!isHelio)throw new Error("Format PNJ Dent/HelioSium inconnu.");
 const expected=isDent?10:11;
 if(source.profils?.length!==expected)throw new Error("Roster incomplet : "+source.faction?.key);
 const archetypes=[],loadouts=[],seen=new Set();
 for(const p of source.profils){
  if(seen.has(p.id)||!SCORES[p.id]||!Number.isInteger(p.menace)||p.menace<1||p.menace>15)
   throw new Error("Profil invalide ou dupliqué : "+p.id);
  seen.add(p.id);
  const level=p.menace===15?15:p.menace+1; // Convention de niveau, PAS le niveau indiqué dans le PDF
  const scores=Object.fromEntries(ABILITY_NAMES.map((k,i)=>[k,SCORES[p.id][i]]));
  scores[ABILITY_NAMES[SCORES[p.id].indexOf(15)]]+=Math.floor(level/4);
  const mods=Object.fromEntries(ABILITY_NAMES.map(k=>[k,scoreToMod(scores[k])]));
  const actionMap=new Map(p.actions.map(a=>[slug(a.nom),a]));
  const matched=WEAPONS[p.id]??{},weapons=[],armor=[],objects=[];
  const attackSpecs=p.equipement.map(name=>matched[name]).filter(Boolean)
    .map(actionName=>actionMap.get(slug(actionName)));
  if(attackSpecs.some(a=>!a))throw new Error("Action non trouvée pour "+p.id);
  // BBA technique fixé sous l'ATQ du PDF pour ne pas ajouter la FOR/DEX deux fois.
  const physicalMods=attackSpecs.map(a=>/distance|arc|fronde|javelot|projecteur|tir/i.test(a.type+" "+a.nom)?mods.DEX:mods.FOR);
  const base=Math.max(0,p.stats.attaque-Math.max(0,...physicalMods));
  for(const name of p.equipement){
   if(matched[name]){
    const a=actionMap.get(slug(matched[name]));
    weapons.push(makeWeapon(name,a,p,source,mods,base));
   }else if(ARMOR.test(name))armor.push(makeArmor(name,p,source));
   else objects.push(makeObject(name,p,source));
  }
  const st=p.stats,props={
   H0D_Creature_Type:"Faction",H0D_Creature_Profil:p.nom,H0D_Creature_Role:p.role,
   H0D_Creature_Menace:String(p.menace),H0D_Creature_Niveau_PNJ:String(level),
   H0D_Creature_Statut_PNJ:(isHelio&&p.menace>=6)?"Héroïque":"Ordinaire",
   H0D_Creature_Faction:source.faction.factionValue,
   H0D_Creature_Faction_Autre:source.faction.factionOther??"",
   H0D_Creature_XP:"0",H0D_Creature_PV_Base:String(st.pv),
   H0D_Creature_PV_Actuels:String(st.pv),
   H0D_Creature_DEF_Base:String(st.def),H0D_Creature_DEF_Divers:"0",
   H0D_Creature_Attaque_Base:String(base),H0D_Creature_Attaque_Divers:"0",
   H0D_Creature_Degats_Divers:"0",H0D_Creature_Initiative_Base:String(st.initiative),
   H0D_Creature_Initiative_Divers:"0",
   H0D_Creature_Vitesse_Base:String(parseFloat(String(st.vitesse).replace(",","."))),
   H0D_Creature_Vitesse_Divers:"0",H0D_Creature_Vigueur_Base:String(st.vigueur),
   H0D_Creature_Vigueur_Divers:"0",H0D_Creature_Reflexes_Base:String(st.reflexes),
   H0D_Creature_Reflexes_Divers:"0",H0D_Creature_Volonte_Base:String(st.volonte),
   H0D_Creature_Volonte_Divers:"0",H0D_Creature_Aptitudes_Table:{},
   H0D_Creature_Capacites_Table:capacityRows(p,source),
   H0D_Creature_Notes:[
    p.phrase,"Rôle : "+p.role+".",p.origine?"Origine : "+p.origine+".":"",
    p.fonction_reseau?"Réseau : "+p.fonction_reseau+".":"",
    p.liaison?"Liaison : "+p.liaison+".":"",
    "Source : "+source.source.fichier+", p. "+p.pages_pdf.join(", ")+".",
    "DD PDF : "+String(st.dd_expression??st.dd)+".",
    "Vitesse PDF : "+st.vitesse+".",
    "Six caractéristiques, niveau PNJ et statut héroïque : adaptations du Faction Builder, absents de la source PDF.",
    "XP non chiffré : la valeur 0 n'est PAS un coût XP gratuit.",
    p.rencontre?"Rareté : "+p.rencontre.rarete+" ; apparition aléatoire : "+p.rencontre.generation_aleatoire+".":"",
    p.rencontre?.condition?"Condition : "+p.rencontre.condition+".":"",
    ...(p.notes_specifiques??[]),
    isDent?"Clan : métiers civils en premier ; Enfants de la Dent limité au territoire et au métier.":"",
    p.id==="dresseur-de-machines"?"Piratage simple seulement sur machine dressée compatible, PAS de contrôle illimité.":"",
    p.id==="elu-de-la-convergence"?"Noyau local : destruction = perte définitive de coordination locale. Protection ABSOLUE.":"",
    p.id==="officier-de-convergence"?"Adaptations persistantes possibles uniquement sur décision explicite du MJ.":"",
    p.id==="avatar-invoque"?"Assemblage uniquement avec Élu et pièces de machines disponibles. Deux modules à choisir en scène.":"",
    p.id==="corps-veritable-dheliosium"?"UNIQUE : boss final multistade ; JAMAIS de génération aléatoire. Phase finale Cœur PV850/DEF17/ATQ+17 en phase séparée.":""
   ].filter(Boolean).join("\n")
  };
  for(const stat of ABILITY_NAMES){
   props["H0D_Creature_"+stat+"_SCORE"]=String(scores[stat]);
   props["H0D_Creature_"+stat+"_MOD"]=String(mods[stat]);
  }
  const loadoutKey=p.id+"-pdf";
  archetypes.push({
   key:p.id,label:p.nom,factionKey:source.faction.key,sourceAttack:st.attaque,
   sourceDataset:source.source.fichier,actor:{props},
   encounter:isHelio?{...p.rencontre,role:p.role,liaison:p.liaison,
    jeu_final:true, pieces_ciblables:/inquisiteur|archange|avatar|corps-veritable/.test(p.id)}:
    {generation_aleatoire:"oui",role:p.role,jeu_final:false},
   defaultLoadout:loadoutKey
  });
  loadouts.push({key:loadoutKey,label:"Équipement PDF",
   factionKey:source.faction.key,archetypeKey:p.id,weapons,armor,objects,resources:[],modifiers:[]});
 }
 return {faction:source.faction,archetypes,loadouts,source,
   encounters:isHelio?source.rencontres??[]:[]};
}
export async function loadDentHelioPdf({moduleId,registerFaction,registerArchetype,registerLoadout}){
 const loaded=[];
 for(const {key,path,expected} of EXTRA_FACTIONS){
  const local="modules/"+moduleId+"/"+path;
  const url=globalThis.foundry?.utils?.getRoute?foundry.utils.getRoute(local):local;
  const response=await fetch(url);
  if(!response.ok)throw new Error(key+" : données PDF indisponibles (HTTP "+response.status+").");
  const prepared=buildDentHelioDefinitions(await response.json());
  if(prepared.archetypes.length!==expected)throw new Error("Roster incomplet : "+key);
  registerFaction(prepared.faction);
  for(const archetype of prepared.archetypes)registerArchetype(archetype);
  for(const loadout of prepared.loadouts)registerLoadout(loadout);
  loaded.push({key,count:expected,encounters:prepared.encounters});
 }
 return loaded;
}
