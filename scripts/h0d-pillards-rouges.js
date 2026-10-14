/**
 * 10 Pillards Rouges du PDF validé, Menaces 2–5.
 * Données mécaniques: PDF ; scores/niveaux: adaptation Modern SRD documentée.
 */
import {scoreToMod,ordinaryNpcLevelFromCR} from "./h0d-caravanes-stats.js";

export const PILLARDS_FILE="data/pillards-rouges.json";
const STATS=["FOR","DEX","CON","INT","SAG","CHA"];
const clean=x=>String(x).normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const weaponActions={
  "sang-neuf-rouge":{"Lame courte de fosse":"Lame courte de fosse","Couteau de preuve":"Couteau de preuve","Bouclier de ferraille leger":"Coup de bouclier nerveux"},
  "maraudeur-rouge":{"Hache dentee de recuperation":"Hache dentee","Couteau de prise":"Couteau de prise","Javelot de ferraille":"Javelot de ferraille"},
  "myrmidon-rouge":{"Chaine d'ancrage":"Chaine d'ancrage","Filet lourd de ferraille":"Filet lourd"},
  "bruleur-rouge":{"Couteau brule":"Couteau brule"},
  "briseur-rouge":{"Marteau rouge a deux mains":"Marteau rouge a deux mains"},
  "artilleur-rouge":{"Canon de machine arrache":"Canon de machine arrache","Couteau de secours":"Couteau de secours"},
  "dompteur-rouge":{"Fouet conducteur":"Fouet conducteur","Perche de choc":"Perche de choc"},
  "chef-bande-rouge":{"Lame d'écorcheur":"Lame d'ecorcheur","Crochet barbelé":"Crochet barbele","Marteau court de chef":"Marteau de chef - variante"},
  "conducteur-ferraille":{"Machette courte":"Machette courte"},
  "roi-rouge":{"Grande arme du Roi Rouge : hache-marteau de machine ou arme massive a deux mains":"Grande arme du Roi Rouge"}
};
const ranged=new Set(["Javelot de ferraille","Filet lourd de ferraille","Canon de machine arrache"]);
const specialArmor=/\barmure\b|bouclier/i;
const isArmor=x=>specialArmor.test(x);
const isShield=x=>/bouclier/i.test(x);
function abilityProfile(profile) {
  const s=Object.fromEntries(STATS.map((k,i)=>[k,profile.score_base[i]]));
  const level=profile.type==="héroïque" ? profile.menace:ordinaryNpcLevelFromCR(profile.menace);
  // Le PDF ne fournit aucun score : seuls les niveaux et scores ci-dessous
  // sont une convention MJ, sans altérer ATQ/DEF/PV/sauvegardes du PDF.
  const increments=Math.floor(level/4);
  if(increments)s[profile.augmentation_carac_niv4]+=increments;
  const mods=Object.fromEntries(STATS.map(k=>[k,scoreToMod(s[k])]));
  return {scores:s,mods,level};
}
function weapon(name,action,p) {
  const attackMatch=action.effect.match(/(?:^|\s)\+(\d+)\b/);
  const dice=action.effect.match(/\b\d+d\d+(?:\s*[+-]\s*\d+)?\b/i);
  const range=action.effect.match(/portee\s*(\d+(?:[.,]\d+)?)\s*m/i);
  const category=ranged.has(name)?"distance":"melee";
  const element=/\bchoc\b/i.test(action.effect)?"Choc":/\bfeu\b/i.test(action.effect)?"Feu":"Aucun";
  return {key:"pillard-"+p.id+"-arme-"+clean(name),name,props:{
    H0D_Arme_Categorie:category,H0D_Arme_Carac_Attaque:"aucune",H0D_Arme_Carac_Degats:"aucune",
    H0D_Arme_Bonus_Attaque:0,H0D_Arme_Degats:dice?dice[0].replace(/\s+/g,""):"0",
    H0D_Arme_Bonus_Degats:0,H0D_Arme_Type_Degats:"Autre",H0D_Arme_Portee:range?Number(range[1].replace(",",".")):0,
    H0D_Arme_Critique_Seuil:20,H0D_Arme_Critique_Multiplicateur:2,
    H0D_Arme_Equipee:true,H0D_Arme_Active:true,H0D_Arme_Mode_Munition:"Aucune",
    H0D_Arme_Element:element,H0D_Stockage:"PJ",H0D_Arme_Origine:"Pillards Rouges",
    H0D_Arme_Notes:"PDF p. "+p.pages_pdf[0]+" — "+action.name+": "+action.effect+". ATQ totale du profil : +"+p.stats.attaque+". Les bonus conditionnels ne sont PAS cumulés automatiquement."
  }};
}
function armor(name,p) {
  return {key:"pillard-"+p.id+"-armure-"+clean(name),name,props:{
    H0D_Armure_Type:isShield(name)?"bouclier":"armure",
    H0D_Armure_Zone:isShield(name)?"bras":"corps",H0D_Armure_Active:true,
    H0D_Armure_Bonus_Defense:0,H0D_Armure_Origine:"Pillards Rouges",H0D_Stockage:"PJ",
    H0D_Armure_Description:"Équipement du PDF p. "+p.pages_pdf[0]+". La DEF du profil est DÉJÀ une valeur finale incluant les protections ; bonus neutre pour éviter un cumul."
  }};
}
function object(name,p) {
  const consumable=/bombe|fumigene|injecteur|reservoir|bobine/i.test(name);
  const kit=/trousse|outils|cle|gants|boitier/i.test(name);
  return {key:"pillard-"+p.id+"-objet-"+clean(name),name,props:{
    H0D_Objet_Type:consumable?"Consommable":kit?"Kit":"Outil",
    H0D_Objet_Sous_Type:name,H0D_Objet_Quantite:1,H0D_Stockage:"PJ",
    H0D_Objet_Actif:false,H0D_Objet_Identifie:true,
    H0D_Objet_Origine:"Pillards Rouges",H0D_Objet_Etat:"Intact",
    H0D_Objet_Description:"Équipement/élément de scène du PDF p. "+p.pages_pdf[0]+". Quantité non précisée ; une fiche = type d'objet, pas nombre de charges."
  }};
}
function capacities(p) {
  const rows={};
  const add=(n,dd,effect)=>{rows[String(Object.keys(rows).length)]={
    H0D_Creature_Capacite_Nom:n,H0D_Creature_Capacite_DD:dd,H0D_Creature_Capacite_Effet:effect
  }};
  for(const a of p.actions){
    const dd=a.effect.match(/\bDD\s*(\d+)/i);
    add(a.name,dd?Number(dd[1]):0,a.effect);
  }
  for(const t of p.traits){
    const dd=t.effect.match(/\bDD\s*(\d+)/i);
    add(t.name,dd?Number(dd[1]):0,t.effect);
  }
  return rows;
}
export function buildPillardsDefinitions(source) {
  if(source.schema!=="h0d-pillards-rouges-v1"||source.profils?.length!==10||source.rencontres?.length!==7)
    throw new Error("Données Pillards Rouges incorrectes : 10 profils et 7 rencontres requis.");
  const archetypes=[],loadouts=[],seen=new Set();
  for(const p of source.profils){
    if(seen.has(p.id)||p.menace<2||p.menace>5)throw new Error("Profil dupliqué ou Menace invalide : "+p.id);
    seen.add(p.id);
    const profile=abilityProfile(p),stats=p.stats;
    const common={
      H0D_Creature_Type:"Faction",H0D_Creature_Profil:p.nom,H0D_Creature_Role:p.role,
      H0D_Creature_Menace:String(p.menace),H0D_Creature_Niveau_PNJ:String(profile.level),
      H0D_Creature_Statut_PNJ:p.type==="héroïque"?"Héroïque":"Ordinaire",
      H0D_Creature_Faction:"PillardsRouges",H0D_Creature_Faction_Autre:"",
      H0D_Creature_XP:"0",H0D_Creature_PV_Base:String(stats.pv),H0D_Creature_PV_Actuels:String(stats.pv),
      H0D_Creature_DEF_Base:String(stats.def),H0D_Creature_DEF_Divers:"0",
      H0D_Creature_Attaque_Base:"0",H0D_Creature_Attaque_Divers:"0",H0D_Creature_Degats_Divers:"0",
      H0D_Creature_Initiative_Base:String(stats.initiative),H0D_Creature_Initiative_Divers:"0",
      H0D_Creature_Vitesse_Base:String(stats.vitesse_m),H0D_Creature_Vitesse_Divers:"0",
      H0D_Creature_Vigueur_Base:String(stats.vigueur),H0D_Creature_Vigueur_Divers:"0",
      H0D_Creature_Reflexes_Base:String(stats.reflexes),H0D_Creature_Reflexes_Divers:"0",
      H0D_Creature_Volonte_Base:String(stats.volonte),H0D_Creature_Volonte_Divers:"0",
      H0D_Creature_Aptitudes_Table:{},H0D_Creature_Capacites_Table:capacities(p),
      H0D_Creature_Notes:p.fonction+"\n"+p.note_mj+
        "\nSource : "+source.source.fichier+", p. "+p.pages_pdf[0]+
        ". DD général "+stats.dd+". Scores : adaptation SRD (absents du PDF)."+
        (p.id==="conducteur-ferraille"?" Le chariot est un élément de scène distinct, avec ses PV/DEF consignés dans les capacités.":"")+
        (p.id==="artilleur-rouge"?" Vitesse : 9 m à pied / 6 m avec harnais, selon le PDF.":"")+
        (p.id==="roi-rouge"?" Niveau 5 héroïque : convention de conversion CR/niveau (non précisé dans le PDF).":"")
    };
    for(const stat of STATS){
      common["H0D_Creature_"+stat+"_SCORE"]=String(profile.scores[stat]);
      common["H0D_Creature_"+stat+"_MOD"]=String(profile.mods[stat]);
    }
    const variants=p.variantes?.length?p.variantes:[{id:"standard",nom:"Standard",equipement:[]}];
    const loadoutIds=[];
    for(const variant of variants){
      const key=p.id+"-"+variant.id,all=[...p.equipement,...variant.equipement??[]];
      const weapons=[],armors=[],objects=[];
      const lookup=weaponActions[p.id]||{};
      for(const name of all){
        const actionName=lookup[name];
        const action=p.actions.find(a=>a.name===actionName);
        if(isArmor(name))armors.push(armor(name,p));
        if(action)weapons.push(weapon(name,action,p));
        else if(!isArmor(name))objects.push(object(name,p));
      }
      // Le PDF fixe l'ATQ totale : base + mod FOR/DEX + bonus d'arme.
      const maxMod=Math.max(0,...weapons.map(w=>profile.mods[w.props.H0D_Arme_Categorie==="distance"?"DEX":"FOR"]));
      const base=stats.attaque-maxMod;
      if(base<0)throw new Error("ATQ inférieure aux modificateurs : "+p.id);
      for(const w of weapons){
        const ability=profile.mods[w.props.H0D_Arme_Categorie==="distance"?"DEX":"FOR"];
        w.props.H0D_Arme_Bonus_Attaque=stats.attaque-base-ability;
      }
      const loadout={key,label:p.variantes?"Variante "+variant.nom:"Équipement du PDF",
        factionKey:"pillards-rouges",archetypeKey:p.id,
        weapons,armor:armors,objects,resources:[],modifiers:[]};
      loadouts.push(loadout);loadoutIds.push(key);
      // Base d'ATQ identique entre les variantes si les profils utilisent
      // au moins une attaque mêlée ; ici les deux variantes du Chef sont mêlée.
      if(loadoutIds.length===1)common.H0D_Creature_Attaque_Base=String(base);
      else if(base!==Number(common.H0D_Creature_Attaque_Base))throw new Error("Variantes du Chef incompatible en ATQ.");
    }
    // Les quelques profils n'ayant qu'une arme de zone ou objets sans jet
    // conservent le bonus d'ATQ PDF dans le champ base.
    if(!loadouts.filter(l=>l.archetypeKey===p.id).some(l=>l.weapons.length)){
      common.H0D_Creature_Attaque_Base=String(stats.attaque);
    }
    archetypes.push({key:p.id,label:p.nom,factionKey:"pillards-rouges",
      sourceAttack:stats.attaque,sourceDataset:source.source.fichier,
      actor:{props:common},defaultLoadout:loadoutIds[0],allLoadouts:loadoutIds});
  }
  return {faction:source.faction,archetypes,loadouts,encounters:source.rencontres};
}
export async function loadPillardsRouges({moduleId,registerFaction,registerArchetype,registerLoadout}){
  const path="modules/"+moduleId+"/"+PILLARDS_FILE;
  const url=foundry.utils.getRoute?foundry.utils.getRoute(path):path;
  const res=await fetch(url);
  if(!res.ok)throw new Error("Jeu de données Pillards Rouges indisponible : HTTP "+res.status);
  const source=await res.json();
  const prepared=buildPillardsDefinitions(source);
  registerFaction(prepared.faction);
  for(const a of prepared.archetypes)registerArchetype(a);
  for(const l of prepared.loadouts)registerLoadout(l);
  return prepared;
}
