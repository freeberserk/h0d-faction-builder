/**
 * H0D — Profils validés Culte du Renouveau & Héritiers du Soleil.
 * Données de combat / capacités = PDF. Scores et niveau = adaptation Modern SRD,
 * absents des PDF. XP = 0 (inconnu), jamais menace => XP.
 */
import {ABILITY_NAMES,ordinaryNpcLevelFromCR,scoreToMod,caravanAttackPlan} from "./h0d-caravanes-stats.js";

export const PDF_FACTION_SOURCES=Object.freeze([
  ["culte-renouveau","data/culte-renouveau.json",15],
  ["heritiers-soleil","data/heritiers-soleil.json",9]
]);
const slug=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const SCORES={
  "pelerin-du-signe":[10,12,13,8,14,15],
  "gardien-du-sanctuaire":[15,10,14,8,13,12],
  "precheur-du-renouveau":[8,10,12,13,14,15],
  "intercesseur-des-machines":[8,13,12,14,15,10],
  "oracle-du-renouveau":[8,12,10,14,15,13],
  "debusqueur-de-reliques":[12,15,13,14,10,8],
  "eclaireur-des-ruines":[10,15,12,14,13,8],
  "analyste-des-vestiges":[8,12,10,15,14,13],
  "traqueur":[12,15,13,10,14,8],
  "greffe":[15,10,14,8,13,12],
  "inquisiteur":[15,12,14,8,13,10],
  "elu":[10,13,12,15,14,8],
  "precheur-de-croisade":[10,12,13,8,14,15],
  "intercesseur-de-machine-de-guerre":[10,13,12,14,15,8],
  "traqueur-assassin":[12,15,13,10,14,8],
  "aspirant-solaire":[14,12,15,8,13,10],
  "eclaireur-solaire":[10,15,12,13,14,8],
  "artisan-solaire":[12,13,14,15,10,8],
  "soldat-solaire":[15,12,14,8,13,10],
  "garde-du-bastion":[15,10,14,8,13,12],
  "artilleur-solaire":[10,15,12,14,13,8],
  "ingenieur-des-cellules":[10,12,13,15,14,8],
  "capitaine-solaire":[14,12,13,10,8,15],
  "champion-solaire-archange":[15,14,13,8,12,10]
};
// Noms EXACTS des équipements et actions des PDF : aucun armement n'est inféré
// à partir d'une action offensive sans objet physique correspondant.
const ARMES={
 "pelerin-du-signe":{"Baton de marche":"Baton de pelerin","Couteau rituel":"Couteau rituel"},
 "gardien-du-sanctuaire":{"Lance rituelle":"Lance rituelle"},
 "precheur-du-renouveau":{"Baton sacre":"Baton sacre"},
 "intercesseur-des-machines":{"Baton sonore":"Baton sonore"},
 "oracle-du-renouveau":{"Baton-relais":"Baton-relais"},
 "debusqueur-de-reliques":{"Pioche fine":"Pioche courte"},
 "eclaireur-des-ruines":{"Arc court":"Arc court","Couteau":"Couteau"},
 "analyste-des-vestiges":{"Baton court":"Baton court"},
 "traqueur":{"Arc long leger":"Arc de traque","Lance courte":"Lance courte"},
 "greffe":{}, // Membre greffé = capacité, pas arme détachable
 "inquisiteur":{"Lame ou hallebarde d Inquisition":"Lame d Inquisition"},
 "elu":{}, // Impulsion IA = capacité et non arme corporelle
 "precheur-de-croisade":{"Baton-lame de croisade":"Baton-lame"},
 "intercesseur-de-machine-de-guerre":{"Baton-relais acoustique":"Baton-relais"},
 "traqueur-assassin":{"Arc de traque renforce":"Arc de traque renforce","Lame silencieuse":"Lame silencieuse"},
 "aspirant-solaire":{"Lance courte solaire":"Lance courte","Javelots solaires":"Javelot solaire"},
 "eclaireur-solaire":{"Arc solaire":"Arc solaire","Lance légère":"Lance légère"},
 "artisan-solaire":{"Marteau-outil":"Marteau-outil"},
 "soldat-solaire":{"Hallebarde solaire":"Hallebarde solaire"},
 "garde-du-bastion":{"Grande lance solaire":"Grande lance"},
 "artilleur-solaire":{"Projecteur thermique":"Projecteur thermique"},
 "ingenieur-des-cellules":{"Bâton conducteur":"Bâton conducteur"},
 "capitaine-solaire":{"Lame solaire":"Lame solaire"},
 "champion-solaire-archange":{"Lame solaire lourde":"Lame de l’Archange","Projecteur palmaire":"Projecteur palmaire"}
};
const armure=/armure|bouclier|pavois|robe renforcee|robe renforcée/i;
const bouclier=/bouclier|pavois/i;
const stock=/bombe|fumigene|fumigène|encens|cellule|reliquaire/i;
function capabilityRows(profile,source){
  const rows={};
  function add(name,dd,effect){rows[String(Object.keys(rows).length)]={
    H0D_Creature_Capacite_Nom:name,
    H0D_Creature_Capacite_DD:dd,
    H0D_Creature_Capacite_Effet:effect
  };}
  for(const a of profile.actions){
    const match=String(a.attaque_dd+" "+(a.notes??"")).match(/\bDD\s*(\d+)/i);
    add(a.nom,match?Number(match[1]):0,[
      "Type: "+a.type,"ATQ/DD: "+a.attaque_dd,"Effet: "+a.degats_effet,
      "Portée: "+a.portee,"Recharge: "+a.recharge,
      a.notes?"Notes: "+a.notes:""
    ].filter(Boolean).join(" · "));
  }
  for(const t of profile.traits){
    const colon=t.indexOf(":");
    add(colon>=0?t.slice(0,colon).trim():t,0,colon>=0?t.slice(colon+1).trim():t);
  }
  for(const rule of source.regles_communes??[]){
    // Une simple mention « Discipline solaire. » ou « Marque du Renouveau. »
    // ne contient pas le fonctionnement : ajouter la règle complète du PDF.
    const detailed=profile.traits.some(t=>
      slug(t.split(":")[0])===slug(rule.nom)&&t.includes(":")
    );
    if(!detailed)add(rule.nom+" — règle commune",0,rule.effet);
  }
  return rows;
}
function makeWeapon(name,action,p,source){
  const dice=String(action.degats_effet).match(/\b\d+d\d+(?:\s*[+-]\s*\d+)?\b/i);
  const reach=String(action.portee).match(/(\d+(?:[.,]\d+)?)\s*m/);
  const distance=/distance|tir/i.test(action.type)||/arc|javelot|projecteur/i.test(name);
  return {key:"pdf-"+p.id+"-weapon-"+slug(name),name,props:{
    H0D_Arme_Categorie:distance?"distance":"melee",
    H0D_Arme_Carac_Attaque:"aucune",H0D_Arme_Carac_Degats:"aucune",
    H0D_Arme_Bonus_Attaque:0,H0D_Arme_Degats:dice?dice[0].replace(/\s+/g,""):"0",
    H0D_Arme_Bonus_Degats:0,H0D_Arme_Type_Degats:"Autre",
    H0D_Arme_Portee:reach?Number(reach[1].replace(",",".")):0,
    H0D_Arme_Critique_Seuil:20,H0D_Arme_Critique_Multiplicateur:2,
    H0D_Arme_Equipee:true,H0D_Arme_Active:true,H0D_Arme_Mode_Munition:"Aucune",
    H0D_Arme_Element:/electri|choc/i.test(action.degats_effet)?"Choc":/\bfeu\b/i.test(action.degats_effet)?"Feu":"Aucun",
    H0D_Stockage:"PJ",H0D_Arme_Origine:source.faction.label,
    H0D_Arme_Notes:"Source PDF p."+p.pages_pdf[0]+": "+action.nom+" : "+action.attaque_dd+
      " / "+action.degats_effet+" / "+action.portee+" / "+action.recharge+
      ". Ne pas ajouter une deuxième fois l'ATQ ou les effets conditionnels."
  }};
}
function makeArmor(name,p,source){
  const shield=bouclier.test(name);
  return {key:"pdf-"+p.id+"-armor-"+slug(name),name,props:{
    H0D_Armure_Type:shield?"bouclier":"armure",H0D_Armure_Zone:shield?"bras":"corps",
    H0D_Armure_Active:true,H0D_Armure_Bonus_Defense:0,H0D_Armure_Origine:source.faction.label,
    H0D_Stockage:"PJ",
    H0D_Armure_Description:"Source PDF p."+p.pages_pdf[0]+
      ". La DEF du profil est déjà globale ; bonus supplémentaire neutre."
  }};
}
function makeObject(name,p,source){
  return {key:"pdf-"+p.id+"-object-"+slug(name),name,props:{
    H0D_Objet_Type:stock.test(name)?"Consommable":"Outil",H0D_Objet_Sous_Type:name,
    H0D_Objet_Quantite:1,H0D_Stockage:"PJ",H0D_Objet_Actif:false,
    H0D_Objet_Identifie:true,H0D_Objet_Origine:source.faction.label,H0D_Objet_Etat:"Intact",
    H0D_Objet_Description:"Source PDF p."+p.pages_pdf[0]+
      ". Quantité/charges non spécifiées : une fiche représente le type d'objet."
  }};
}
export function buildNewFactionDefinitions(source){
  if(source.schema!=="h0d-pnj-faction-pdf-v1")throw new Error("Source de faction PDF invalide.");
  const expected=source.faction?.key==="culte-renouveau"?15:
    source.faction?.key==="heritiers-soleil"?9:null;
  if(!expected||source.profils?.length!==expected)throw new Error("Roster source absent ou incomplet.");
  const archetypes=[],loadouts=[],seen=new Set();
  for(const p of source.profils){
    if(seen.has(p.id)||!Number.isInteger(p.menace)||p.menace<1||p.menace>6)
      throw new Error("Identifiant ou Menace incorrect : "+p.id);
    seen.add(p.id);
    const base=SCORES[p.id];if(!base)throw new Error("Scores SRD non attribués : "+p.id);
    const level=ordinaryNpcLevelFromCR(p.menace);
    const scores=Object.fromEntries(ABILITY_NAMES.map((k,i)=>[k,base[i]]));
    scores[ABILITY_NAMES[base.indexOf(15)]]+=Math.floor(level/4);
    const mods=Object.fromEntries(ABILITY_NAMES.map(k=>[k,scoreToMod(scores[k])]));
    const actionMap=new Map(p.actions.map(a=>[slug(a.nom),a]));
    const weapons=[],armor=[],objects=[];
    for(const name of p.equipement){
      const linked=ARMES[p.id]?.[name];
      const action=linked?actionMap.get(slug(linked)):null;
      if(linked&&!action)throw new Error("Arme non liée à une action PDF : "+p.id+" "+name);
      if(action)weapons.push(makeWeapon(name,action,p,source));
      else if(armure.test(name))armor.push(makeArmor(name,p,source));
      else objects.push(makeObject(name,p,source));
    }
    const plan=caravanAttackPlan(p.stats,mods,weapons);
    weapons.forEach((w,i)=>w.props.H0D_Arme_Bonus_Attaque=plan.weaponBonuses[i]);
    const st=p.stats;
    const props={
      H0D_Creature_Type:"Faction",H0D_Creature_Profil:p.nom,H0D_Creature_Role:p.role,
      H0D_Creature_Menace:String(p.menace),H0D_Creature_Niveau_PNJ:String(level),
      H0D_Creature_Statut_PNJ:"Ordinaire",H0D_Creature_Faction:source.faction.factionValue,
      H0D_Creature_Faction_Autre:"",H0D_Creature_XP:"0",
      H0D_Creature_PV_Base:String(st.pv),H0D_Creature_PV_Actuels:String(st.pv),
      H0D_Creature_DEF_Base:String(st.def),H0D_Creature_DEF_Divers:"0",
      H0D_Creature_Attaque_Base:String(plan.base),H0D_Creature_Attaque_Divers:"0",
      H0D_Creature_Degats_Divers:"0",H0D_Creature_Initiative_Base:String(st.initiative),
      H0D_Creature_Initiative_Divers:"0",
      H0D_Creature_Vitesse_Base:String(parseFloat(String(st.vitesse).replace(",","."))),
      H0D_Creature_Vitesse_Divers:"0",H0D_Creature_Vigueur_Base:String(st.vigueur),
      H0D_Creature_Vigueur_Divers:"0",H0D_Creature_Reflexes_Base:String(st.reflexes),
      H0D_Creature_Reflexes_Divers:"0",H0D_Creature_Volonte_Base:String(st.volonte),
      H0D_Creature_Volonte_Divers:"0",H0D_Creature_Aptitudes_Table:{},
      H0D_Creature_Capacites_Table:capabilityRows(p,source),
      H0D_Creature_Notes:[
        p.phrase,"Rôle : "+p.role+".","Branche / domaine : "+p.branche+".",
        "Source : "+source.source.fichier+", p. "+p.pages_pdf.join(", ")+".",
        "DD général du PDF : "+st.dd+". Vitesse du PDF : "+st.vitesse+".",
        "Caractéristiques et niveau : adaptation Modern SRD ; valeurs absentes du PDF.",
        "XP non documenté : 0 signifie inconnu, pas une rencontre gratuite.",
        ...(p.branche==="V2"?["V2 radicalisée : déblocage narratif, pas automatiquement selon le niveau."]:[]),
        ...(p.id==="intercesseur-des-machines"||p.id==="intercesseur-de-machine-de-guerre"?
          ["Intercesseur : aucun piratage réel ; action sur les routines seulement."]:[]),
        ...(p.id==="elu"?["Élu : contrôle limité à ce qu'autorise l'IA/le réseau."]:[]),
        ...(p.id==="champion-solaire-archange"?
          ["Champion : Menace 6 uniquement en armure Archange, vol assisté ; sans IA consciente."]:[ ])
      ].join("\n")
    };
    for(const key of ABILITY_NAMES){
      props["H0D_Creature_"+key+"_SCORE"]=String(scores[key]);
      props["H0D_Creature_"+key+"_MOD"]=String(mods[key]);
    }
    // Conserver la clé de l'Aspirant solaire existant pour éviter un doublon
    // lors de la création d'une version validée par le nouveau PDF.
    const loadoutKey=p.id==="aspirant-solaire"?"aspirant-solaire-standard":p.id+"-pdf";
    archetypes.push({key:p.id,label:p.nom,factionKey:source.faction.key,sourceAttack:st.attaque,
      sourceDataset:source.source.fichier,pdfBranch:p.branche,
      actor:{props},defaultLoadout:loadoutKey});
    loadouts.push({key:loadoutKey,label:"Équipement validé PDF",
      factionKey:source.faction.key,archetypeKey:p.id,weapons,armor,objects,
      resources:[],modifiers:[]});
  }
  return {faction:source.faction,archetypes,loadouts,source};
}
export async function loadNewFactionPdf({moduleId,registerFaction,registerArchetype,registerLoadout}){
  const loaded=[];
  for(const [key,path,count] of PDF_FACTION_SOURCES){
    const local="modules/"+moduleId+"/"+path;
    const url=globalThis.foundry?.utils?.getRoute?foundry.utils.getRoute(local):local;
    const res=await fetch(url);
    if(!res.ok)throw new Error("Données "+key+" indisponibles : HTTP "+res.status);
    const prepared=buildNewFactionDefinitions(await res.json());
    if(prepared.archetypes.length!==count)throw new Error("Roster incomplet : "+key);
    registerFaction(prepared.faction);
    for(const arch of prepared.archetypes)registerArchetype(arch);
    for(const loadout of prepared.loadouts)registerLoadout(loadout);
    loaded.push({key,count});
  }
  return loaded;
}
