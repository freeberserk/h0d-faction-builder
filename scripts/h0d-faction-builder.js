import {ABILITY_NAMES,ordinaryNpcLevelFromCR,caravanScores,caravanMods,scoreToMod,legacyCaravanMods,caravanAttackPlan,caravanCompactNotes} from "./h0d-caravanes-stats.js";
import {menuHTML,attachFactionMenu,resolveMenuSelection} from "./h0d-faction-menu.js";
import {installCouncilUnique} from "./h0d-council-unique.js";

const MODULE_ID = "h0d-faction-builder";
const MODULE_VERSION = "0.5.0";
let COUNCIL=null;
const ROOT_FOLDER = "H0D — Factions générées";

/*
 * v0.1.2 = profils Menace 1 validés intégrés.
 *
 * Faction : {key,label,folder?, factionValue?}
 * Archétype :
 * {
 *   key,label,factionKey,img?,
 *   actor:{props:{...H0D_Creature_*}},
 *   weapons?:[{key,name,img?,props:{...H0D_Arme_*}}],
 *   armor?:[{key,name,img?,props:{...H0D_Armure_*}}],
 *   objects?:[{key,name,img?,props:{...H0D_Objet_*}}],
 *   resources?:[{key,name,img?,props:{...H0D_Ressource_*}}],
 *   modifiers?:[{key,name,img?,props:{...H0D_CM_*}}],
 *   defaultLoadout?: "loadout-key"
 * }
 * Loadout :
 * {key,label,factionKey?, archetypeKey?, weapons?, armor?, objects?, resources?, modifiers?}
 */

const FACTIONS = new Map();
const ARCHETYPES = new Map();
const LOADOUTS = new Map();

const TEMPLATE_KEYS = {
  actor:"actor-creature",
  weapon:"item-arme",
  armor:"item-armure",
  object:"item-objet",
  resource:"item-ressource",
  modifier:"item-modificateur"
};

function clone(v){ return foundry.utils.deepClone(v); }
function esc(v){ return foundry.utils.escapeHTML(String(v ?? "")); }
function notify(type,msg){ ui.notifications?.[type]?.(msg); }

function tmApi(){
  const mod=game.modules?.get("h0d-template-manager");
  return mod?.active && mod.api ? mod.api : null;
}
function template(key){
  try { return tmApi()?.getTemplate?.(key) ?? null; }
  catch(err){ console.warn(`${MODULE_ID} | template ${key}`,err); return null; }
}
function templateVersion(t){ return Number(t?.system?.templateSystemUniqueVersion ?? 0); }

function templateState(){
  const api=tmApi();
  if(!api) return {ok:false,message:"H0D Template Manager v0.3.0+ est requis."};
  const actor=template(TEMPLATE_KEYS.actor), weapon=template(TEMPLATE_KEYS.weapon), armor=template(TEMPLATE_KEYS.armor);
  if(!actor || !weapon || !armor) return {ok:false,message:"Templates Créature/Arme/Armure incomplets."};
  return {ok:true,message:`${actor.name} · équipement H0D disponible`};
}

function normalizeEntry(e){
  if(!e?.key || !e?.name) throw new Error("Équipement invalide : key et name requis.");
  return clone(e);
}
function normalizeFaction(f){
  if(!f?.key || !f?.label) throw new Error("Faction invalide : key et label requis.");
  return clone(f);
}
function normalizeArchetype(a){
  if(!a?.key || !a?.label || !a?.factionKey) throw new Error("Archétype invalide : key, label et factionKey requis.");
  const out=clone(a); out.actor??={}; out.actor.props??={};
  for(const field of ["weapons","armor","objects","resources","modifiers"]) out[field]=(out[field]??[]).map(normalizeEntry);
  return out;
}
function normalizeLoadout(l){
  if(!l?.key || !l?.label) throw new Error("Loadout invalide : key et label requis.");
  const out=clone(l);
  for(const field of ["weapons","armor","objects","resources","modifiers"]) out[field]=(out[field]??[]).map(normalizeEntry);
  return out;
}

function registerFaction(d){ const v=normalizeFaction(d); FACTIONS.set(v.key,v); return v; }
function registerFactions(ds=[]){ return ds.map(registerFaction); }
function registerArchetype(d){ const v=normalizeArchetype(d); ARCHETYPES.set(v.key,v); return v; }
function registerArchetypes(ds=[]){ return ds.map(registerArchetype); }
function registerLoadout(d){ const v=normalizeLoadout(d); LOADOUTS.set(v.key,v); return v; }
function registerLoadouts(ds=[]){ return ds.map(registerLoadout); }

const MENACE_1_FACTIONS = [
  {
    "key": "dent-ambre",
    "label": "Clan de la Dent d'Ambre",
    "factionValue": "DentAmbre",
    "folder": "Clan de la Dent d'Ambre"
  },
  {
    "key": "caravanes-libres",
    "label": "Caravanes Libres",
    "factionValue": "CaravanesLibres",
    "folder": "Caravanes Libres"
  },
  {
    "key": "pillards-rouges",
    "label": "Pillards Rouges",
    "factionValue": "PillardsRouges",
    "folder": "Pillards Rouges"
  },
  {
    "key": "culte-renouveau",
    "label": "Culte du Renouveau",
    "factionValue": "Renouveau",
    "folder": "Culte du Renouveau"
  },
  {
    "key": "heritiers-soleil",
    "label": "Héritiers du Soleil",
    "factionValue": "HeritiersSoleil",
    "folder": "Héritiers du Soleil"
  },
  {
    "key": "helios",
    "label": "HELIOS",
    "factionValue": "Autre",
    "factionOther": "HELIOS",
    "folder": "HELIOS"
  },
  {
    "key": "elysium-9",
    "label": "ELYSIUM-9",
    "factionValue": "Autre",
    "factionOther": "ELYSIUM-9",
    "folder": "ELYSIUM-9"
  },
  {
    "key": "elysium-10",
    "label": "ELYSIUM-10",
    "factionValue": "Autre",
    "factionOther": "ELYSIUM-10",
    "folder": "ELYSIUM-10"
  },
  {
    "key": "heliosium",
    "label": "HelioSium",
    "factionValue": "Autre",
    "factionOther": "HelioSium",
    "folder": "HelioSium"
  }
];

const MENACE_1_ARCHETYPES = [
  {
    "key": "chasseur-novice",
    "label": "Chasseur novice de la Dent",
    "factionKey": "dent-ambre",
    "actor": {
      "props": {
        "H0D_Creature_Type": "Faction",
        "H0D_Creature_Profil": "Chasseur novice",
        "H0D_Creature_Role": "Patrouilleur",
        "H0D_Creature_Menace": "1",
        "H0D_Creature_XP": "0",
        "H0D_Creature_Faction": "DentAmbre",
        "H0D_Creature_Faction_Autre": "",
        "H0D_Creature_FOR_MOD": "0",
        "H0D_Creature_DEX_MOD": "0",
        "H0D_Creature_CON_MOD": "0",
        "H0D_Creature_INT_MOD": "0",
        "H0D_Creature_SAG_MOD": "0",
        "H0D_Creature_CHA_MOD": "0",
        "H0D_Creature_PV_Base": "10",
        "H0D_Creature_PV_Actuels": "10",
        "H0D_Creature_DEF_Base": "10",
        "H0D_Creature_DEF_Divers": "0",
        "H0D_Creature_Attaque_Base": "3",
        "H0D_Creature_Attaque_Divers": "0",
        "H0D_Creature_Degats_Divers": "0",
        "H0D_Creature_Initiative_Base": "1",
        "H0D_Creature_Initiative_Divers": "0",
        "H0D_Creature_Vitesse_Base": "9",
        "H0D_Creature_Vitesse_Divers": "0",
        "H0D_Creature_Vigueur_Base": "0",
        "H0D_Creature_Vigueur_Divers": "0",
        "H0D_Creature_Reflexes_Base": "0",
        "H0D_Creature_Reflexes_Divers": "0",
        "H0D_Creature_Volonte_Base": "0",
        "H0D_Creature_Volonte_Divers": "0",
        "H0D_Creature_Resistances": "",
        "H0D_Creature_Faiblesses": "",
        "H0D_Creature_Etat_Feu": "Aucun",
        "H0D_Creature_Etat_Gel": "Aucun",
        "H0D_Creature_Etat_Choc": "Aucun",
        "H0D_Creature_Etat_Acide": "Aucun",
        "H0D_Creature_Etats_Notes": "",
        "H0D_Creature_Aptitudes_Table": {},
        "H0D_Creature_Capacites_Table": {},
        "H0D_Creature_Notes": "Patrouilleur jeune, pas fanatique. Bon allié ou rival de village.\nAttaque principale : Arc / lance courte — dégâts 1d6.\n\nLes caractéristiques, sauvegardes et XP ne sont pas chiffrés dans la fiche source : ils restent à 0."
      }
    },
    "defaultLoadout": "chasseur-novice-standard"
  },
  {
    "key": "messager-caravane",
    "label": "Messager de caravane",
    "factionKey": "caravanes-libres",
    "actor": {
      "props": {
        "H0D_Creature_Type": "Faction",
        "H0D_Creature_Profil": "Messager de caravane",
        "H0D_Creature_Role": "Éclaireur / convoyeur",
        "H0D_Creature_Menace": "1",
        "H0D_Creature_XP": "0",
        "H0D_Creature_Faction": "CaravanesLibres",
        "H0D_Creature_Faction_Autre": "",
        "H0D_Creature_FOR_MOD": "0",
        "H0D_Creature_DEX_MOD": "0",
        "H0D_Creature_CON_MOD": "0",
        "H0D_Creature_INT_MOD": "0",
        "H0D_Creature_SAG_MOD": "0",
        "H0D_Creature_CHA_MOD": "0",
        "H0D_Creature_PV_Base": "10",
        "H0D_Creature_PV_Actuels": "10",
        "H0D_Creature_DEF_Base": "10",
        "H0D_Creature_DEF_Divers": "0",
        "H0D_Creature_Attaque_Base": "3",
        "H0D_Creature_Attaque_Divers": "0",
        "H0D_Creature_Degats_Divers": "0",
        "H0D_Creature_Initiative_Base": "2",
        "H0D_Creature_Initiative_Divers": "0",
        "H0D_Creature_Vitesse_Base": "9",
        "H0D_Creature_Vitesse_Divers": "0",
        "H0D_Creature_Vigueur_Base": "0",
        "H0D_Creature_Vigueur_Divers": "0",
        "H0D_Creature_Reflexes_Base": "0",
        "H0D_Creature_Reflexes_Divers": "0",
        "H0D_Creature_Volonte_Base": "0",
        "H0D_Creature_Volonte_Divers": "0",
        "H0D_Creature_Resistances": "",
        "H0D_Creature_Faiblesses": "",
        "H0D_Creature_Etat_Feu": "Aucun",
        "H0D_Creature_Etat_Gel": "Aucun",
        "H0D_Creature_Etat_Choc": "Aucun",
        "H0D_Creature_Etat_Acide": "Aucun",
        "H0D_Creature_Etats_Notes": "",
        "H0D_Creature_Aptitudes_Table": {},
        "H0D_Creature_Capacites_Table": {},
        "H0D_Creature_Notes": "Version plus faible du garde de convoi. Fuit si la cargaison est perdue.\nAttaque principale : Arbalète légère / couteau — dégâts 1d6.\n\nLes caractéristiques, sauvegardes et XP ne sont pas chiffrés dans la fiche source : ils restent à 0."
      }
    },
    "defaultLoadout": "messager-caravane-standard"
  },
  {
    "key": "pillard-recrue",
    "label": "Pillard recrue",
    "factionKey": "pillards-rouges",
    "actor": {
      "props": {
        "H0D_Creature_Type": "Faction",
        "H0D_Creature_Profil": "Pillard recrue",
        "H0D_Creature_Role": "Pilleur faible",
        "H0D_Creature_Menace": "1",
        "H0D_Creature_XP": "0",
        "H0D_Creature_Faction": "PillardsRouges",
        "H0D_Creature_Faction_Autre": "",
        "H0D_Creature_FOR_MOD": "0",
        "H0D_Creature_DEX_MOD": "0",
        "H0D_Creature_CON_MOD": "0",
        "H0D_Creature_INT_MOD": "0",
        "H0D_Creature_SAG_MOD": "0",
        "H0D_Creature_CHA_MOD": "0",
        "H0D_Creature_PV_Base": "12",
        "H0D_Creature_PV_Actuels": "12",
        "H0D_Creature_DEF_Base": "11",
        "H0D_Creature_DEF_Divers": "0",
        "H0D_Creature_Attaque_Base": "3",
        "H0D_Creature_Attaque_Divers": "0",
        "H0D_Creature_Degats_Divers": "0",
        "H0D_Creature_Initiative_Base": "1",
        "H0D_Creature_Initiative_Divers": "0",
        "H0D_Creature_Vitesse_Base": "9",
        "H0D_Creature_Vitesse_Divers": "0",
        "H0D_Creature_Vigueur_Base": "0",
        "H0D_Creature_Vigueur_Divers": "0",
        "H0D_Creature_Reflexes_Base": "0",
        "H0D_Creature_Reflexes_Divers": "0",
        "H0D_Creature_Volonte_Base": "0",
        "H0D_Creature_Volonte_Divers": "0",
        "H0D_Creature_Resistances": "",
        "H0D_Creature_Faiblesses": "",
        "H0D_Creature_Etat_Feu": "Aucun",
        "H0D_Creature_Etat_Gel": "Aucun",
        "H0D_Creature_Etat_Choc": "Aucun",
        "H0D_Creature_Etat_Acide": "Aucun",
        "H0D_Creature_Etats_Notes": "",
        "H0D_Creature_Aptitudes_Table": {},
        "H0D_Creature_Capacites_Table": {},
        "H0D_Creature_Notes": "Agressif en groupe, lâche seul. Peut appeler un maraudeur.\nAttaque principale : Hache de ferraille / arc court — dégâts 1d6+1.\n\nLes caractéristiques, sauvegardes et XP ne sont pas chiffrés dans la fiche source : ils restent à 0."
      }
    },
    "defaultLoadout": "pillard-recrue-standard"
  },
  {
    "key": "adepte-renouveau",
    "label": "Adepte du Renouveau",
    "factionKey": "culte-renouveau",
    "actor": {
      "props": {
        "H0D_Creature_Type": "Faction",
        "H0D_Creature_Profil": "Adepte du Renouveau",
        "H0D_Creature_Role": "Fanatique mineur",
        "H0D_Creature_Menace": "1",
        "H0D_Creature_XP": "0",
        "H0D_Creature_Faction": "Renouveau",
        "H0D_Creature_Faction_Autre": "",
        "H0D_Creature_FOR_MOD": "0",
        "H0D_Creature_DEX_MOD": "0",
        "H0D_Creature_CON_MOD": "0",
        "H0D_Creature_INT_MOD": "0",
        "H0D_Creature_SAG_MOD": "0",
        "H0D_Creature_CHA_MOD": "0",
        "H0D_Creature_PV_Base": "12",
        "H0D_Creature_PV_Actuels": "12",
        "H0D_Creature_DEF_Base": "10",
        "H0D_Creature_DEF_Divers": "0",
        "H0D_Creature_Attaque_Base": "3",
        "H0D_Creature_Attaque_Divers": "0",
        "H0D_Creature_Degats_Divers": "0",
        "H0D_Creature_Initiative_Base": "0",
        "H0D_Creature_Initiative_Divers": "0",
        "H0D_Creature_Vitesse_Base": "9",
        "H0D_Creature_Vitesse_Divers": "0",
        "H0D_Creature_Vigueur_Base": "0",
        "H0D_Creature_Vigueur_Divers": "0",
        "H0D_Creature_Reflexes_Base": "0",
        "H0D_Creature_Reflexes_Divers": "0",
        "H0D_Creature_Volonte_Base": "0",
        "H0D_Creature_Volonte_Divers": "0",
        "H0D_Creature_Resistances": "",
        "H0D_Creature_Faiblesses": "",
        "H0D_Creature_Etat_Feu": "Aucun",
        "H0D_Creature_Etat_Gel": "Aucun",
        "H0D_Creature_Etat_Choc": "Aucun",
        "H0D_Creature_Etat_Acide": "Aucun",
        "H0D_Creature_Etats_Notes": "",
        "H0D_Creature_Aptitudes_Table": {},
        "H0D_Creature_Capacites_Table": {},
        "H0D_Creature_Notes": "Fanatique mais manipulable. Protège les signes anciens.\nAttaque principale : Dague / fronde — dégâts 1d4+1.\n\nLes caractéristiques, sauvegardes et XP ne sont pas chiffrés dans la fiche source : ils restent à 0."
      }
    },
    "defaultLoadout": "adepte-renouveau-standard"
  },
  {
    "key": "aspirant-solaire",
    "label": "Aspirant solaire",
    "factionKey": "heritiers-soleil",
    "actor": {
      "props": {
        "H0D_Creature_Type": "Faction",
        "H0D_Creature_Profil": "Aspirant solaire",
        "H0D_Creature_Role": "Soldat novice",
        "H0D_Creature_Menace": "1",
        "H0D_Creature_XP": "0",
        "H0D_Creature_Faction": "HeritiersSoleil",
        "H0D_Creature_Faction_Autre": "",
        "H0D_Creature_FOR_MOD": "0",
        "H0D_Creature_DEX_MOD": "0",
        "H0D_Creature_CON_MOD": "0",
        "H0D_Creature_INT_MOD": "0",
        "H0D_Creature_SAG_MOD": "0",
        "H0D_Creature_CHA_MOD": "0",
        "H0D_Creature_PV_Base": "12",
        "H0D_Creature_PV_Actuels": "12",
        "H0D_Creature_DEF_Base": "11",
        "H0D_Creature_DEF_Divers": "0",
        "H0D_Creature_Attaque_Base": "3",
        "H0D_Creature_Attaque_Divers": "0",
        "H0D_Creature_Degats_Divers": "0",
        "H0D_Creature_Initiative_Base": "1",
        "H0D_Creature_Initiative_Divers": "0",
        "H0D_Creature_Vitesse_Base": "9",
        "H0D_Creature_Vitesse_Divers": "0",
        "H0D_Creature_Vigueur_Base": "0",
        "H0D_Creature_Vigueur_Divers": "0",
        "H0D_Creature_Reflexes_Base": "0",
        "H0D_Creature_Reflexes_Divers": "0",
        "H0D_Creature_Volonte_Base": "0",
        "H0D_Creature_Volonte_Divers": "0",
        "H0D_Creature_Resistances": "",
        "H0D_Creature_Faiblesses": "",
        "H0D_Creature_Etat_Feu": "Aucun",
        "H0D_Creature_Etat_Gel": "Aucun",
        "H0D_Creature_Etat_Choc": "Aucun",
        "H0D_Creature_Etat_Acide": "Aucun",
        "H0D_Creature_Etats_Notes": "",
        "H0D_Creature_Aptitudes_Table": {},
        "H0D_Creature_Capacites_Table": {},
        "H0D_Creature_Notes": "Version recrue du zélote solaire. Fier, discipliné, susceptible.\nAttaque principale : Lame solaire légère — dégâts 1d6.\n\nLes caractéristiques, sauvegardes et XP ne sont pas chiffrés dans la fiche source : ils restent à 0."
      }
    },
    "defaultLoadout": "aspirant-solaire-standard"
  },
  {
    "key": "drone-maintenance-mineur",
    "label": "Drone de maintenance mineur",
    "factionKey": "helios",
    "actor": {
      "props": {
        "H0D_Creature_Type": "Faction",
        "H0D_Creature_Profil": "Drone de maintenance mineur",
        "H0D_Creature_Role": "Maintenance / défense passive",
        "H0D_Creature_Menace": "1",
        "H0D_Creature_XP": "0",
        "H0D_Creature_Faction": "Autre",
        "H0D_Creature_Faction_Autre": "HELIOS",
        "H0D_Creature_FOR_MOD": "0",
        "H0D_Creature_DEX_MOD": "0",
        "H0D_Creature_CON_MOD": "0",
        "H0D_Creature_INT_MOD": "0",
        "H0D_Creature_SAG_MOD": "0",
        "H0D_Creature_CHA_MOD": "0",
        "H0D_Creature_PV_Base": "10",
        "H0D_Creature_PV_Actuels": "10",
        "H0D_Creature_DEF_Base": "10",
        "H0D_Creature_DEF_Divers": "0",
        "H0D_Creature_Attaque_Base": "3",
        "H0D_Creature_Attaque_Divers": "0",
        "H0D_Creature_Degats_Divers": "0",
        "H0D_Creature_Initiative_Base": "0",
        "H0D_Creature_Initiative_Divers": "0",
        "H0D_Creature_Vitesse_Base": "6",
        "H0D_Creature_Vitesse_Divers": "0",
        "H0D_Creature_Vigueur_Base": "0",
        "H0D_Creature_Vigueur_Divers": "0",
        "H0D_Creature_Reflexes_Base": "0",
        "H0D_Creature_Reflexes_Divers": "0",
        "H0D_Creature_Volonte_Base": "0",
        "H0D_Creature_Volonte_Divers": "0",
        "H0D_Creature_Resistances": "",
        "H0D_Creature_Faiblesses": "",
        "H0D_Creature_Etat_Feu": "Aucun",
        "H0D_Creature_Etat_Gel": "Aucun",
        "H0D_Creature_Etat_Choc": "Aucun",
        "H0D_Creature_Etat_Acide": "Aucun",
        "H0D_Creature_Etats_Notes": "",
        "H0D_Creature_Aptitudes_Table": {},
        "H0D_Creature_Capacites_Table": {},
        "H0D_Creature_Notes": "Non hostile sauf intrusion. Peut réparer, bloquer une porte ou alerter.\nAttaque principale : Bras-outil — dégâts 1d4+1.\n\nLes caractéristiques, sauvegardes et XP ne sont pas chiffrés dans la fiche source : ils restent à 0."
      }
    },
    "defaultLoadout": "drone-maintenance-mineur-standard"
  },
  {
    "key": "heritier-elys9-novice",
    "label": "Héritier Elys-9 novice",
    "factionKey": "elysium-9",
    "actor": {
      "props": {
        "H0D_Creature_Type": "Faction",
        "H0D_Creature_Profil": "Héritier Elys-9 novice",
        "H0D_Creature_Role": "Endoctriné mineur",
        "H0D_Creature_Menace": "1",
        "H0D_Creature_XP": "0",
        "H0D_Creature_Faction": "Autre",
        "H0D_Creature_Faction_Autre": "ELYSIUM-9",
        "H0D_Creature_FOR_MOD": "0",
        "H0D_Creature_DEX_MOD": "0",
        "H0D_Creature_CON_MOD": "0",
        "H0D_Creature_INT_MOD": "0",
        "H0D_Creature_SAG_MOD": "0",
        "H0D_Creature_CHA_MOD": "0",
        "H0D_Creature_PV_Base": "12",
        "H0D_Creature_PV_Actuels": "12",
        "H0D_Creature_DEF_Base": "11",
        "H0D_Creature_DEF_Divers": "0",
        "H0D_Creature_Attaque_Base": "3",
        "H0D_Creature_Attaque_Divers": "0",
        "H0D_Creature_Degats_Divers": "0",
        "H0D_Creature_Initiative_Base": "1",
        "H0D_Creature_Initiative_Divers": "0",
        "H0D_Creature_Vitesse_Base": "9",
        "H0D_Creature_Vitesse_Divers": "0",
        "H0D_Creature_Vigueur_Base": "0",
        "H0D_Creature_Vigueur_Divers": "0",
        "H0D_Creature_Reflexes_Base": "0",
        "H0D_Creature_Reflexes_Divers": "0",
        "H0D_Creature_Volonte_Base": "0",
        "H0D_Creature_Volonte_Divers": "0",
        "H0D_Creature_Resistances": "",
        "H0D_Creature_Faiblesses": "",
        "H0D_Creature_Etat_Feu": "Aucun",
        "H0D_Creature_Etat_Gel": "Aucun",
        "H0D_Creature_Etat_Choc": "Aucun",
        "H0D_Creature_Etat_Acide": "Aucun",
        "H0D_Creature_Etats_Notes": "",
        "H0D_Creature_Aptitudes_Table": {},
        "H0D_Creature_Capacites_Table": {},
        "H0D_Creature_Notes": "Humain endoctriné / manipulé. Parle peu, observe beaucoup.\nAttaque principale : Lame blanche légère — dégâts 1d6.\n\nLes caractéristiques, sauvegardes et XP ne sont pas chiffrés dans la fiche source : ils restent à 0."
      }
    },
    "defaultLoadout": "heritier-elys9-novice-standard"
  },
  {
    "key": "agent-blanc-mineur",
    "label": "Agent blanc mineur",
    "factionKey": "elysium-10",
    "actor": {
      "props": {
        "H0D_Creature_Type": "Faction",
        "H0D_Creature_Profil": "Agent blanc mineur",
        "H0D_Creature_Role": "Agent radical faible",
        "H0D_Creature_Menace": "1",
        "H0D_Creature_XP": "0",
        "H0D_Creature_Faction": "Autre",
        "H0D_Creature_Faction_Autre": "ELYSIUM-10",
        "H0D_Creature_FOR_MOD": "0",
        "H0D_Creature_DEX_MOD": "0",
        "H0D_Creature_CON_MOD": "0",
        "H0D_Creature_INT_MOD": "0",
        "H0D_Creature_SAG_MOD": "0",
        "H0D_Creature_CHA_MOD": "0",
        "H0D_Creature_PV_Base": "14",
        "H0D_Creature_PV_Actuels": "14",
        "H0D_Creature_DEF_Base": "11",
        "H0D_Creature_DEF_Divers": "0",
        "H0D_Creature_Attaque_Base": "3",
        "H0D_Creature_Attaque_Divers": "0",
        "H0D_Creature_Degats_Divers": "0",
        "H0D_Creature_Initiative_Base": "2",
        "H0D_Creature_Initiative_Divers": "0",
        "H0D_Creature_Vitesse_Base": "9",
        "H0D_Creature_Vitesse_Divers": "0",
        "H0D_Creature_Vigueur_Base": "0",
        "H0D_Creature_Vigueur_Divers": "0",
        "H0D_Creature_Reflexes_Base": "0",
        "H0D_Creature_Reflexes_Divers": "0",
        "H0D_Creature_Volonte_Base": "0",
        "H0D_Creature_Volonte_Divers": "0",
        "H0D_Creature_Resistances": "",
        "H0D_Creature_Faiblesses": "",
        "H0D_Creature_Etat_Feu": "Aucun",
        "H0D_Creature_Etat_Gel": "Aucun",
        "H0D_Creature_Etat_Choc": "Aucun",
        "H0D_Creature_Etat_Acide": "Aucun",
        "H0D_Creature_Etats_Notes": "",
        "H0D_Creature_Aptitudes_Table": {},
        "H0D_Creature_Capacites_Table": {},
        "H0D_Creature_Notes": "Froid, efficace, sans haine. Signe avant-coureur.\nAttaque principale : Lame blanche / pistolet ancien faible — dégâts 1d6.\n\nLes caractéristiques, sauvegardes et XP ne sont pas chiffrés dans la fiche source : ils restent à 0."
      }
    },
    "defaultLoadout": "agent-blanc-mineur-standard"
  },
  {
    "key": "pacificateur-instable",
    "label": "Pacificateur instable",
    "factionKey": "heliosium",
    "actor": {
      "props": {
        "H0D_Creature_Type": "Faction",
        "H0D_Creature_Profil": "Pacificateur instable",
        "H0D_Creature_Role": "Neutralisation",
        "H0D_Creature_Menace": "1",
        "H0D_Creature_XP": "0",
        "H0D_Creature_Faction": "Autre",
        "H0D_Creature_Faction_Autre": "HelioSium",
        "H0D_Creature_FOR_MOD": "0",
        "H0D_Creature_DEX_MOD": "0",
        "H0D_Creature_CON_MOD": "0",
        "H0D_Creature_INT_MOD": "0",
        "H0D_Creature_SAG_MOD": "0",
        "H0D_Creature_CHA_MOD": "0",
        "H0D_Creature_PV_Base": "14",
        "H0D_Creature_PV_Actuels": "14",
        "H0D_Creature_DEF_Base": "11",
        "H0D_Creature_DEF_Divers": "0",
        "H0D_Creature_Attaque_Base": "3",
        "H0D_Creature_Attaque_Divers": "0",
        "H0D_Creature_Degats_Divers": "0",
        "H0D_Creature_Initiative_Base": "0",
        "H0D_Creature_Initiative_Divers": "0",
        "H0D_Creature_Vitesse_Base": "9",
        "H0D_Creature_Vitesse_Divers": "0",
        "H0D_Creature_Vigueur_Base": "0",
        "H0D_Creature_Vigueur_Divers": "0",
        "H0D_Creature_Reflexes_Base": "0",
        "H0D_Creature_Reflexes_Divers": "0",
        "H0D_Creature_Volonte_Base": "0",
        "H0D_Creature_Volonte_Divers": "0",
        "H0D_Creature_Resistances": "",
        "H0D_Creature_Faiblesses": "",
        "H0D_Creature_Etat_Feu": "Aucun",
        "H0D_Creature_Etat_Gel": "Aucun",
        "H0D_Creature_Etat_Choc": "Aucun",
        "H0D_Creature_Etat_Acide": "Aucun",
        "H0D_Creature_Etats_Notes": "",
        "H0D_Creature_Aptitudes_Table": {},
        "H0D_Creature_Capacites_Table": {},
        "H0D_Creature_Notes": "Cherche à neutraliser plutôt qu'à tuer. Très rare avant Acte V.\nAttaque principale : Entrave / impulsion faible — dégâts 1d6.\n\nLes caractéristiques, sauvegardes et XP ne sont pas chiffrés dans la fiche source : ils restent à 0."
      }
    },
    "defaultLoadout": "pacificateur-instable-standard"
  }
];

const MENACE_1_LOADOUTS = [
  {
    "key": "chasseur-novice-standard",
    "label": "Équipement standard",
    "factionKey": "dent-ambre",
    "archetypeKey": "chasseur-novice",
    "weapons": [
      {
        "key": "arc-tribal",
        "name": "Arc tribal",
        "props": {
          "H0D_Arme_Categorie": "distance",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d6",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Perforant",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "Clan de la Dent d'Ambre",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "",
          "H0D_Arme_Notes": "Attaque principale du profil : Arc / lance courte."
        }
      },
      {
        "key": "lance-courte",
        "name": "Lance courte",
        "props": {
          "H0D_Arme_Categorie": "melee",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d6",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Perforant",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "Clan de la Dent d'Ambre",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "",
          "H0D_Arme_Notes": "Attaque principale du profil : Arc / lance courte."
        }
      }
    ],
    "armor": [
      {
        "key": "armure-legere-cuir-machine",
        "name": "Armure légère de cuir/machine",
        "props": {
          "H0D_Armure_Type": "armure",
          "H0D_Armure_Zone": "corps",
          "H0D_Armure_Active": true,
          "H0D_Armure_Bonus_Defense": "0",
          "H0D_Armure_Encombrement": "0",
          "H0D_Armure_Malus": "",
          "H0D_Stockage": "PJ",
          "H0D_Armure_Resistances": "",
          "H0D_Armure_Resistance_Feu": "0",
          "H0D_Armure_Resistance_Gel": "0",
          "H0D_Armure_Resistance_Choc": "0",
          "H0D_Armure_Resistance_Acide": "0",
          "H0D_Armure_Etat": "",
          "H0D_Armure_Origine": "Clan de la Dent d'Ambre",
          "H0D_Armure_Description": "Équipement associé du Chasseur novice.",
          "H0D_Armure_Traits_Table": {}
        }
      }
    ],
    "objects": [
      {
        "key": "couteau-chasse",
        "name": "Couteau de chasse",
        "props": {
          "H0D_Objet_Type": "Outil",
          "H0D_Objet_Sous_Type": "Couteau de chasse",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "Clan de la Dent d'Ambre",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "Équipement associé du Chasseur novice.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      }
    ],
    "resources": [],
    "modifiers": []
  },
  {
    "key": "messager-caravane-standard",
    "label": "Équipement standard",
    "factionKey": "caravanes-libres",
    "archetypeKey": "messager-caravane",
    "weapons": [
      {
        "key": "arbalete-legere",
        "name": "Arbalète légère",
        "props": {
          "H0D_Arme_Categorie": "distance",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d6",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Perforant",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "Caravanes Libres",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "",
          "H0D_Arme_Notes": "Attaque principale du profil : Arbalète légère / couteau."
        }
      }
    ],
    "armor": [],
    "objects": [
      {
        "key": "couteau-utilitaire",
        "name": "Couteau utilitaire",
        "props": {
          "H0D_Objet_Type": "Outil",
          "H0D_Objet_Sous_Type": "Couteau utilitaire",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "Caravanes Libres",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "Équipement associé du Messager de caravane.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      },
      {
        "key": "sacoche-pieces",
        "name": "Sacoche de pièces",
        "props": {
          "H0D_Objet_Type": "Divers",
          "H0D_Objet_Sous_Type": "Sacoche",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "Caravanes Libres",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "Sacoche de pièces du messager.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      },
      {
        "key": "cape-voyage",
        "name": "Cape de voyage",
        "props": {
          "H0D_Objet_Type": "Divers",
          "H0D_Objet_Sous_Type": "Cape de voyage",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "Caravanes Libres",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "Équipement de voyage du messager.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      }
    ],
    "resources": [],
    "modifiers": []
  },
  {
    "key": "pillard-recrue-standard",
    "label": "Équipement standard",
    "factionKey": "pillards-rouges",
    "archetypeKey": "pillard-recrue",
    "weapons": [
      {
        "key": "hache-ferraille",
        "name": "Hache de ferraille",
        "props": {
          "H0D_Arme_Categorie": "melee",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d6+1",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Tranchant",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "Pillards Rouges",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "",
          "H0D_Arme_Notes": "Attaque principale du profil : Hache de ferraille / arc court."
        }
      },
      {
        "key": "arc-court",
        "name": "Arc court",
        "props": {
          "H0D_Arme_Categorie": "distance",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d6+1",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Perforant",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "Pillards Rouges",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "",
          "H0D_Arme_Notes": "Attaque principale du profil : Hache de ferraille / arc court."
        }
      }
    ],
    "armor": [
      {
        "key": "armure-bricolee",
        "name": "Armure bricolée",
        "props": {
          "H0D_Armure_Type": "armure",
          "H0D_Armure_Zone": "corps",
          "H0D_Armure_Active": true,
          "H0D_Armure_Bonus_Defense": "0",
          "H0D_Armure_Encombrement": "0",
          "H0D_Armure_Malus": "",
          "H0D_Stockage": "PJ",
          "H0D_Armure_Resistances": "",
          "H0D_Armure_Resistance_Feu": "0",
          "H0D_Armure_Resistance_Gel": "0",
          "H0D_Armure_Resistance_Choc": "0",
          "H0D_Armure_Resistance_Acide": "0",
          "H0D_Armure_Etat": "",
          "H0D_Armure_Origine": "Pillards Rouges",
          "H0D_Armure_Description": "Armure bricolée du Pillard recrue. Aucun bonus chiffré distinct n'est donné par la fiche source.",
          "H0D_Armure_Traits_Table": {}
        }
      }
    ],
    "objects": [
      {
        "key": "trophee-machine",
        "name": "Trophée machine",
        "props": {
          "H0D_Objet_Type": "PieceMachine",
          "H0D_Objet_Sous_Type": "Trophée machine",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "Pillards Rouges",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "Trophée récupéré sur une machine.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      }
    ],
    "resources": [],
    "modifiers": []
  },
  {
    "key": "adepte-renouveau-standard",
    "label": "Équipement standard",
    "factionKey": "culte-renouveau",
    "archetypeKey": "adepte-renouveau",
    "weapons": [
      {
        "key": "dague-rituelle",
        "name": "Dague rituelle",
        "props": {
          "H0D_Arme_Categorie": "melee",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d4+1",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Perforant",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "Culte du Renouveau",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "",
          "H0D_Arme_Notes": "Attaque principale du profil : Dague / fronde."
        }
      },
      {
        "key": "fronde",
        "name": "Fronde",
        "props": {
          "H0D_Arme_Categorie": "distance",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d4+1",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Contondant",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "Culte du Renouveau",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "",
          "H0D_Arme_Notes": "Attaque principale du profil : Dague / fronde."
        }
      }
    ],
    "armor": [
      {
        "key": "robe-usee",
        "name": "Robe usée",
        "props": {
          "H0D_Armure_Type": "autre",
          "H0D_Armure_Zone": "corps",
          "H0D_Armure_Active": true,
          "H0D_Armure_Bonus_Defense": "0",
          "H0D_Armure_Encombrement": "0",
          "H0D_Armure_Malus": "",
          "H0D_Stockage": "PJ",
          "H0D_Armure_Resistances": "",
          "H0D_Armure_Resistance_Feu": "0",
          "H0D_Armure_Resistance_Gel": "0",
          "H0D_Armure_Resistance_Choc": "0",
          "H0D_Armure_Resistance_Acide": "0",
          "H0D_Armure_Etat": "",
          "H0D_Armure_Origine": "Culte du Renouveau",
          "H0D_Armure_Description": "Robe usée de l'Adepte. Aucun bonus de DEF distinct n'est fourni.",
          "H0D_Armure_Traits_Table": {}
        }
      }
    ],
    "objects": [
      {
        "key": "pendentif-ruine",
        "name": "Pendentif de ruine",
        "props": {
          "H0D_Objet_Type": "Antique",
          "H0D_Objet_Sous_Type": "Pendentif de ruine",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "Culte du Renouveau",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "Objet rituel associé au profil.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      }
    ],
    "resources": [],
    "modifiers": []
  },
  {
    "key": "aspirant-solaire-standard",
    "label": "Équipement standard",
    "factionKey": "heritiers-soleil",
    "archetypeKey": "aspirant-solaire",
    "weapons": [
      {
        "key": "lame-courte-solaire",
        "name": "Lame courte solaire",
        "props": {
          "H0D_Arme_Categorie": "melee",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d6",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Autre",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "Héritiers du Soleil",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "",
          "H0D_Arme_Notes": "Attaque principale : Lame solaire légère. La fiche source ne précise pas un type de dégâts élémentaire."
        }
      }
    ],
    "armor": [
      {
        "key": "bouclier-leger",
        "name": "Bouclier léger",
        "props": {
          "H0D_Armure_Type": "bouclier",
          "H0D_Armure_Zone": "corps",
          "H0D_Armure_Active": true,
          "H0D_Armure_Bonus_Defense": "0",
          "H0D_Armure_Encombrement": "0",
          "H0D_Armure_Malus": "",
          "H0D_Stockage": "PJ",
          "H0D_Armure_Resistances": "",
          "H0D_Armure_Resistance_Feu": "0",
          "H0D_Armure_Resistance_Gel": "0",
          "H0D_Armure_Resistance_Choc": "0",
          "H0D_Armure_Resistance_Acide": "0",
          "H0D_Armure_Etat": "",
          "H0D_Armure_Origine": "Héritiers du Soleil",
          "H0D_Armure_Description": "Bouclier léger de l'Aspirant solaire. Aucun bonus distinct n'est chiffré dans la source.",
          "H0D_Armure_Traits_Table": {}
        }
      }
    ],
    "objects": [
      {
        "key": "amulette-solaire",
        "name": "Amulette solaire",
        "props": {
          "H0D_Objet_Type": "Divers",
          "H0D_Objet_Sous_Type": "Amulette solaire",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "Héritiers du Soleil",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "Objet associé du profil.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      },
      {
        "key": "torche-ou-huile",
        "name": "Torche / huile",
        "props": {
          "H0D_Objet_Type": "Divers",
          "H0D_Objet_Sous_Type": "Torche ou huile",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "Héritiers du Soleil",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "La fiche source indique « torche ou huile » sans imposer une variante.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      }
    ],
    "resources": [],
    "modifiers": []
  },
  {
    "key": "drone-maintenance-mineur-standard",
    "label": "Équipement standard",
    "factionKey": "helios",
    "archetypeKey": "drone-maintenance-mineur",
    "weapons": [
      {
        "key": "bras-outil-integre",
        "name": "Bras-outil intégré",
        "props": {
          "H0D_Arme_Categorie": "melee",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d4+1",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Autre",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "HELIOS",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "",
          "H0D_Arme_Notes": "Attaque principale : Bras-outil."
        }
      }
    ],
    "armor": [],
    "objects": [
      {
        "key": "lampe",
        "name": "Lampe",
        "props": {
          "H0D_Objet_Type": "Outil",
          "H0D_Objet_Sous_Type": "Lampe",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "HELIOS",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "Équipement intégré du drone.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      },
      {
        "key": "module-diagnostic",
        "name": "Module de diagnostic",
        "props": {
          "H0D_Objet_Type": "Outil",
          "H0D_Objet_Sous_Type": "Diagnostic",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "HELIOS",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "Module de diagnostic du drone.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      }
    ],
    "resources": [],
    "modifiers": []
  },
  {
    "key": "heritier-elys9-novice-standard",
    "label": "Équipement standard",
    "factionKey": "elysium-9",
    "archetypeKey": "heritier-elys9-novice",
    "weapons": [
      {
        "key": "lame-blanche-legere",
        "name": "Lame blanche légère",
        "props": {
          "H0D_Arme_Categorie": "melee",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d6",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Autre",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "ELYSIUM-9",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "",
          "H0D_Arme_Notes": "Attaque principale : Lame blanche légère."
        }
      }
    ],
    "armor": [
      {
        "key": "masque-incomplet",
        "name": "Masque incomplet",
        "props": {
          "H0D_Armure_Type": "autre",
          "H0D_Armure_Zone": "corps",
          "H0D_Armure_Active": true,
          "H0D_Armure_Bonus_Defense": "0",
          "H0D_Armure_Encombrement": "0",
          "H0D_Armure_Malus": "",
          "H0D_Stockage": "PJ",
          "H0D_Armure_Resistances": "",
          "H0D_Armure_Resistance_Feu": "0",
          "H0D_Armure_Resistance_Gel": "0",
          "H0D_Armure_Resistance_Choc": "0",
          "H0D_Armure_Resistance_Acide": "0",
          "H0D_Armure_Etat": "",
          "H0D_Armure_Origine": "ELYSIUM-9",
          "H0D_Armure_Description": "Masque incomplet porté par l'Héritier Elys-9 novice.",
          "H0D_Armure_Traits_Table": {}
        }
      }
    ],
    "objects": [
      {
        "key": "focus-brouille",
        "name": "Fragment de Focus brouillé",
        "props": {
          "H0D_Objet_Type": "Focus",
          "H0D_Objet_Sous_Type": "Fragment brouillé",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "ELYSIUM-9",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "Fragment de Focus brouillé associé au profil.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      }
    ],
    "resources": [],
    "modifiers": []
  },
  {
    "key": "agent-blanc-mineur-standard",
    "label": "Équipement standard",
    "factionKey": "elysium-10",
    "archetypeKey": "agent-blanc-mineur",
    "weapons": [
      {
        "key": "lame-blanche",
        "name": "Lame blanche",
        "props": {
          "H0D_Arme_Categorie": "melee",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d6",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Autre",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "ELYSIUM-10",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "",
          "H0D_Arme_Notes": "Attaque principale : Lame blanche / pistolet ancien faible."
        }
      },
      {
        "key": "pistolet-ancien-faible",
        "name": "Pistolet ancien faible",
        "props": {
          "H0D_Arme_Categorie": "distance",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d6",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Autre",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "ELYSIUM-10",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "",
          "H0D_Arme_Notes": "Attaque principale : Lame blanche / pistolet ancien faible."
        }
      }
    ],
    "armor": [
      {
        "key": "manteau-clair",
        "name": "Manteau clair",
        "props": {
          "H0D_Armure_Type": "autre",
          "H0D_Armure_Zone": "corps",
          "H0D_Armure_Active": true,
          "H0D_Armure_Bonus_Defense": "0",
          "H0D_Armure_Encombrement": "0",
          "H0D_Armure_Malus": "",
          "H0D_Stockage": "PJ",
          "H0D_Armure_Resistances": "",
          "H0D_Armure_Resistance_Feu": "0",
          "H0D_Armure_Resistance_Gel": "0",
          "H0D_Armure_Resistance_Choc": "0",
          "H0D_Armure_Resistance_Acide": "0",
          "H0D_Armure_Etat": "",
          "H0D_Armure_Origine": "ELYSIUM-10",
          "H0D_Armure_Description": "Manteau clair de l'Agent blanc mineur.",
          "H0D_Armure_Traits_Table": {}
        }
      }
    ],
    "objects": [
      {
        "key": "relais-courte-portee",
        "name": "Relais court-portée",
        "props": {
          "H0D_Objet_Type": "Outil",
          "H0D_Objet_Sous_Type": "Relais court-portée",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "ELYSIUM-10",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "Relais de communication associé au profil.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      }
    ],
    "resources": [],
    "modifiers": []
  },
  {
    "key": "pacificateur-instable-standard",
    "label": "Équipement standard",
    "factionKey": "heliosium",
    "archetypeKey": "pacificateur-instable",
    "weapons": [
      {
        "key": "gantelet-entrave",
        "name": "Gantelet d'entrave",
        "props": {
          "H0D_Arme_Categorie": "speciale",
          "H0D_Arme_Carac_Attaque": "aucune",
          "H0D_Arme_Carac_Degats": "aucune",
          "H0D_Arme_Bonus_Attaque": "0",
          "H0D_Arme_Degats": "1d6",
          "H0D_Arme_Bonus_Degats": "0",
          "H0D_Arme_Type_Degats": "Autre",
          "H0D_Arme_Portee": "0",
          "H0D_Arme_Mains": "1",
          "H0D_Arme_Critique_Seuil": "20",
          "H0D_Arme_Critique_Multiplicateur": "2",
          "H0D_Arme_Equipee": true,
          "H0D_Stockage": "PJ",
          "H0D_Arme_Active": true,
          "H0D_Arme_Encombrement": "0",
          "H0D_Arme_Zone": "",
          "H0D_Arme_Mode_Munition": "Aucune",
          "H0D_Arme_Type_Munition": "Fleche",
          "H0D_Arme_Consommation_Munition": "1",
          "H0D_Arme_Recharge": "",
          "H0D_Arme_Munitions": "0",
          "H0D_Arme_Munitions_Max": "0",
          "H0D_Arme_Element": "Aucun",
          "H0D_Arme_Origine": "HelioSium",
          "H0D_Arme_Cout": "",
          "H0D_Arme_Traits_Table": {},
          "H0D_Arme_Effet_Special": "Dégâts non létaux.",
          "H0D_Arme_Notes": "Attaque principale : Entrave / impulsion faible."
        }
      }
    ],
    "armor": [
      {
        "key": "armure-organique-legere",
        "name": "Armure organique légère",
        "props": {
          "H0D_Armure_Type": "armure",
          "H0D_Armure_Zone": "corps",
          "H0D_Armure_Active": true,
          "H0D_Armure_Bonus_Defense": "0",
          "H0D_Armure_Encombrement": "0",
          "H0D_Armure_Malus": "",
          "H0D_Stockage": "PJ",
          "H0D_Armure_Resistances": "",
          "H0D_Armure_Resistance_Feu": "0",
          "H0D_Armure_Resistance_Gel": "0",
          "H0D_Armure_Resistance_Choc": "0",
          "H0D_Armure_Resistance_Acide": "0",
          "H0D_Armure_Etat": "",
          "H0D_Armure_Origine": "HelioSium",
          "H0D_Armure_Description": "Armure organique légère. Aucun bonus de DEF distinct n'est fourni par la source.",
          "H0D_Armure_Traits_Table": {}
        }
      }
    ],
    "objects": [
      {
        "key": "relais-vert-blanc",
        "name": "Relais vert-blanc",
        "props": {
          "H0D_Objet_Type": "Outil",
          "H0D_Objet_Sous_Type": "Relais vert-blanc",
          "H0D_Objet_Quantite": "1",
          "H0D_Stockage": "PJ",
          "H0D_Objet_Actif": false,
          "H0D_Objet_Identifie": true,
          "H0D_Objet_Charge_Unitaire": "0",
          "H0D_Objet_Valeur": "0",
          "H0D_Objet_Utilisations": "0",
          "H0D_Objet_Utilisations_Max": "0",
          "H0D_Objet_Recharge": "",
          "H0D_Objet_Etat": "Intact",
          "H0D_Objet_Origine": "HelioSium",
          "H0D_Objet_Compatibilite": "",
          "H0D_Objet_Effet": "",
          "H0D_Objet_Description": "Relais associé au Pacificateur instable.",
          "H0D_Objet_Traits_Table": {},
          "H0D_Objet_Munition_Active": false,
          "H0D_Objet_Munition_Famille": "Fleche",
          "H0D_Objet_Munition_Element": "Aucun",
          "H0D_Objet_Munition_Recuperable": false,
          "H0D_Objet_Munition_Bonus_Attaque": "0",
          "H0D_Objet_Munition_Bonus_Degats": "0",
          "H0D_Objet_Munition_Type_Degats": "Perforant",
          "H0D_Objet_Munition_Anti_Blindage": "0",
          "H0D_Objet_Munition_Effet_Court": ""
        }
      }
    ],
    "resources": [],
    "modifiers": []
  }
];

async function loadCaravanesProfils(){
  const path = `modules/${MODULE_ID}/data/caravanes-libres.json`;
  const url = foundry.utils.getRoute ? foundry.utils.getRoute(path) : path;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Jeu de données Caravanes Libres indisponible (${response.status})`);
  const source = await response.json();
  if (source.schema !== "h0d-faction-profiles-v1" || source.profils?.length !== 14) {
    throw new Error("Le fichier Caravanes Libres ne contient pas les 14 profils attendus.");
  }
  registerFaction(source.faction);
  const equipWeaponActions = {
    "messager-de-caravane":{"Arbalete legere pliable":"Tir arbalete legere","Couteau masque":"Couteau masque"},
    "caravanier-au-pavois":{"Baton de portage renforce":"Baton renforce","Couteau utilitaire":"Couteau utilitaire"},
    "garde-de-caravane":{"Lance courte de garde":"Lance courte","Arbalete de convoi":"Arbalete de convoi"},
    "guetteur-de-route":{"Arc court de guetteur":"Arc court","Couteau de route":"Couteau de route"},
    "recuperateur-des-routes":{"Crochet de demontage express":"Crochet de demontage","Scie-couteau de recuperation":"Scie-couteau"},
    "pisteur-de-caravane":{"Arc court de route":"Tir arc court","Couteau de survie":"Couteau de survie"},
    "conducteur-de-brise-route":{"Fouet de guidage / longe sonore":"Coup de fouet defensif","Couteau de secours":"Couteau de secours"},
    "tireur-iem":{"Fronde mecanique de convoi":"Tir fronde mecanique","Lance-harpon / lance-filet de chariot":"Lance-harpon chariot"},
    "defenseur-de-chariot":{"Masse de rupture / marteau court":"Coup masse rupture"},
    "negociateur-arme":{},
    "medecin-de-convoi":{"Scalpel-couteau pliant":"Scalpel-couteau"},
    "capitaine-de-caravane":{"Sabre court de capitaine":"Sabre court","Arbalete courte":"Arbalete courte"},
    "veteran-des-routes":{"Lame de route usee":"Lame de route","Baton ferre / hampe courte":"Baton ferre"},
    "ingenieur-de-caravane":{"Marteau de forge court":"Marteau de forge","Lance-bobine instable":"Lance-bobine instable"}
  };
  const bareHands = {
    "negociateur-arme":["Frappe ouverte"],
    "medecin-de-convoi":["Coup non letal"]
  };
  const cleanKey = v => String(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const isArmor = name => /\b(pavois|bouclier|armure|cape|manteau|vetements|tenue de marchand)\b/i.test(name);
  const armorType = name => /pavois|bouclier/i.test(name) ? "bouclier" : "armure";
  function actionEffect(a) {
    return [`Type: ${a.type}`,`ATQ/DD: ${a.attaque_dd}`,`Effet: ${a.degats_effet}`,`Portée: ${a.portee}`,`Recharge: ${a.recharge}`,a.notes].filter(Boolean).join(" · ");
  }
  function weaponFromAction(name,action,profile){
    const roll=String(action.degats_effet).match(/\d+d\d+(?:\s*[+-]\s*\d+)?/i);
    const reach=String(action.portee).match(/(\d+(?:[.,]\d+)?)\s*m/);
    const distance=/distance|arme montee/i.test(action.type);
    const choc=/\bchoc\b/i.test(action.degats_effet);
    return {
      key:`route-weapon-${cleanKey(name)}`,name,
      props:{
        H0D_Arme_Categorie:distance?"distance":"melee",
        H0D_Arme_Carac_Attaque:"aucune",H0D_Arme_Carac_Degats:"aucune",
        H0D_Arme_Bonus_Attaque:0,
        H0D_Arme_Degats:roll?roll[0].replace(/\s+/g,""):"0",
        H0D_Arme_Bonus_Degats:0,
        H0D_Arme_Type_Degats:"Autre",
        H0D_Arme_Portee:reach?Number(reach[1].replace(",",".")):0,
        H0D_Arme_Critique_Seuil:20,H0D_Arme_Critique_Multiplicateur:2,
        H0D_Arme_Equipee:true,H0D_Arme_Active:true,
        H0D_Arme_Mode_Munition:"Aucune",
        H0D_Arme_Element:choc?"Choc":"Aucun",
        H0D_Stockage:"PJ",H0D_Arme_Origine:"Caravanes Libres",
        H0D_Arme_Notes:`Action du PDF : ${action.nom}. ${actionEffect(action)}. ATQ totale du profil : +${profile.stats.attaque}; ne pas la compter deux fois.`
      }
    };
  }
  function armorEntry(name){
    return {key:`route-armor-${cleanKey(name)}`,name,props:{
      H0D_Armure_Type:armorType(name),H0D_Armure_Zone:"corps",
      H0D_Armure_Active:true,H0D_Armure_Bonus_Defense:0,
      H0D_Armure_Origine:"Caravanes Libres",H0D_Stockage:"PJ",
      H0D_Armure_Description:"Équipement du PDF. La DEF fournie par la fiche inclut déjà les protections applicables ; bonus ajouté neutre."
    }};
  }
  function objectEntry(name){
    const cons=/bombe|grenade|mini-charge|fumigene|fusee|injecteur/i.test(name);
    const kit=/kit|trousse|sacoche|pince|crochet|grappin|outil/i.test(name);
    return {key:`route-object-${cleanKey(name)}`,name,props:{
      H0D_Objet_Type:cons?"Consommable":kit?"Kit":"Outil",
      H0D_Objet_Sous_Type:name,H0D_Objet_Quantite:1,H0D_Stockage:"PJ",
      H0D_Objet_Actif:false,H0D_Objet_Identifie:true,
      H0D_Objet_Origine:"Caravanes Libres",H0D_Objet_Etat:"Intact",
      H0D_Objet_Description:"Équipement mentionné dans la fiche PDF. Quantité de stock non précisée ; cette ligne représente le type d'équipement, pas son nombre de charges."
    }};
  }
  function capacityRow(name,dd,effect){
    return {H0D_Creature_Capacite_Nom:name,H0D_Creature_Capacite_DD:dd,H0D_Creature_Capacite_Effet:effect};
  }
  for(const p of source.profils){
    const key=p.id==="messager-de-caravane"?"messager-caravane":p.id;
    const maps=equipWeaponActions[p.id]??{};
    const attacks=new Map(p.actions.map(a=>[a.nom,a]));
    const weapons=[],armor=[],objects=[];
    for(const name of p.equipement){
      if(/\boptionnel\b/i.test(name)) continue; // consigné dans la fiche mais non attribué d'office
      const action=attacks.get(maps[name]);
      if(action){weapons.push(weaponFromAction(name,action,p));continue;}
      if(isArmor(name)){armor.push(armorEntry(name));continue;}
      objects.push(objectEntry(name));
    }
    for(const unarmed of bareHands[p.id]??[]){
      const a=attacks.get(unarmed);
      if(a) weapons.push(weaponFromAction(unarmed,a,p));
    }
    const capacities={};
    function addCapacity(row){
      // CSB DynamicTable parcourt les lignes par indices 0..N-1
      // (dynamicProps[line]); les IDs aléatoires rendent la fiche illisible.
      capacities[String(Object.keys(capacities).length)] = row;
    }
    for(const a of p.actions){
      const matched=String(a.attaque_dd).match(/DD\s*(\d+)/i);
      addCapacity(capacityRow(a.nom,matched?Number(matched[1]):0,actionEffect(a)));
    }
    for(const trait of p.traits){
      const split=trait.indexOf(":");
      addCapacity(capacityRow(split>=0?trait.slice(0,split).trim():trait,0,split>=0?trait.slice(split+1).trim():trait));
    }
    const rule=source.regles_communes[0];
    if(!p.traits.some(t=>/harnachement rapide/i.test(t))){
      addCapacity(capacityRow(rule.nom,0,`${rule.activation}. ${rule.effet}`));
    }
    const notes=caravanCompactNotes(p,source);
    const st=p.stats;
    const npcLevel=ordinaryNpcLevelFromCR(p.menace);
    const scores=caravanScores(p.id,npcLevel);
    const mods=caravanMods(p.id,npcLevel);
    const combatPlan=caravanAttackPlan(st,mods,weapons);
    // Répartir l'ATQ globale entre BBA de créature, FOR/DEX et bonus d'arme :
    // la somme reste rigoureusement égale au chiffre du PDF.
    weapons.forEach((weapon,i)=>{
      weapon.props.H0D_Arme_Bonus_Attaque=combatPlan.weaponBonuses[i];
    });
    registerArchetype({
      key,label:p.nom,factionKey:"caravanes-libres",sourceAttack:Number(st.attaque),sourceDataset:"Caravanes_Libres_PNJ_Builder_PDF",
      actor:{props:{
        H0D_Creature_Type:"Faction",H0D_Creature_Profil:p.nom,
        H0D_Creature_Role:p.role,H0D_Creature_Menace:String(p.menace),
        H0D_Creature_Niveau_PNJ:String(npcLevel),H0D_Creature_Statut_PNJ:"Ordinaire",
        H0D_Creature_Faction:"CaravanesLibres",H0D_Creature_Faction_Autre:"",
        H0D_Creature_XP:"0",
        H0D_Creature_FOR_MOD:String(mods.FOR),H0D_Creature_DEX_MOD:String(mods.DEX),H0D_Creature_CON_MOD:String(mods.CON),
        H0D_Creature_INT_MOD:String(mods.INT),H0D_Creature_SAG_MOD:String(mods.SAG),H0D_Creature_CHA_MOD:String(mods.CHA),
        H0D_Creature_FOR_SCORE:String(scores.FOR),H0D_Creature_DEX_SCORE:String(scores.DEX),H0D_Creature_CON_SCORE:String(scores.CON),
        H0D_Creature_INT_SCORE:String(scores.INT),H0D_Creature_SAG_SCORE:String(scores.SAG),H0D_Creature_CHA_SCORE:String(scores.CHA),
        H0D_Creature_PV_Base:String(st.pv),H0D_Creature_PV_Actuels:String(st.pv),
        H0D_Creature_DEF_Base:String(st.def),H0D_Creature_DEF_Divers:"0",
        H0D_Creature_Attaque_Base:String(combatPlan.base),H0D_Creature_Attaque_Divers:"0",
        H0D_Creature_Degats_Divers:"0",
        H0D_Creature_Initiative_Base:String(st.initiative),H0D_Creature_Initiative_Divers:"0",
        H0D_Creature_Vitesse_Base:String(st.vitesse_m),H0D_Creature_Vitesse_Divers:"0",
        H0D_Creature_Vigueur_Base:String(st.vigueur),H0D_Creature_Vigueur_Divers:"0",
        H0D_Creature_Reflexes_Base:String(st.reflexes),H0D_Creature_Reflexes_Divers:"0",
        H0D_Creature_Volonte_Base:String(st.volonte),H0D_Creature_Volonte_Divers:"0",
        H0D_Creature_Aptitudes_Table:{},H0D_Creature_Capacites_Table:capacities,
        H0D_Creature_Notes:notes
      }},
      defaultLoadout:`${key}-standard`
    });
    registerLoadout({
      key:`${key}-standard`,label:"Équipement du PDF",
      factionKey:"caravanes-libres",archetypeKey:key,
      weapons,armor,objects,resources:[],modifiers:[]
    });
  }
  return source.profils.length;
}

function seedMenace1Data(){
  registerFactions(MENACE_1_FACTIONS);
  registerArchetypes(MENACE_1_ARCHETYPES);
  registerLoadouts(MENACE_1_LOADOUTS);
}
seedMenace1Data();

async function ensureFolder(name,parent=null){
  let f=game.folders?.find(x=>x.type==="Actor" && x.name===name && String(x.folder?.id??x.folder??"")===String(parent??""));
  if(!f) f=await Folder.create({name,type:"Actor",folder:parent});
  return f;
}
function systemFromTemplate(t){
  const s=clone(t.system??{}); s.template=t.id; s.templateSystemUniqueVersion=templateVersion(t);
  if(Object.prototype.hasOwnProperty.call(s,"uniqueId")) s.uniqueId=foundry.utils.randomID();
  return s;
}
async function forceTemplateAndProps(doc,t,props){
  const base=clone(t.system??{}); base.template=t.id; base.templateSystemUniqueVersion=templateVersion(t);
  if(Object.prototype.hasOwnProperty.call(base,"uniqueId")) base.uniqueId=doc.system?.uniqueId||foundry.utils.randomID();
  await doc.update({system:base});
  const merged=foundry.utils.mergeObject(clone(doc.system?.props??{}),clone(props??{}),{inplace:false,insertKeys:true,overwrite:true});
  await doc.update({"system.template":t.id,"system.templateSystemUniqueVersion":templateVersion(t),"system.props":merged});
}
function itemTemplateForKind(kind){ const key=TEMPLATE_KEYS[kind]; return key?template(key):null; }

function combineEntries(arch, loadout){
  const rows=[];
  for(const kind of ["weapons","armor","objects","resources","modifiers"]){
    const singular={weapons:"weapon",armor:"armor",objects:"object",resources:"resource",modifiers:"modifier"}[kind];
    for(const e of arch[kind]??[]) rows.push({kind:singular,entry:e});
    for(const e of loadout?.[kind]??[]) rows.push({kind:singular,entry:e});
  }
  return rows;
}
function itemData(entry,kind,imgOverride=null){
  const t=itemTemplateForKind(kind);
  if(!t) throw new Error(`Template ${kind} introuvable via H0D Template Manager.`);
  return {
    name:entry.name,type:"equippableItem",img:imgOverride||entry.img||t.img||"icons/svg/item-bag.svg",
    system:systemFromTemplate(t),
    flags:{[MODULE_ID]:{generated:true,kind,entryKey:entry.key,sourceTemplateId:t.id}}
  };
}

async function buildFactionActor(archetypeKey,{loadoutKey=null,mode="update"}={}){
  const state=templateState(); if(!state.ok) throw new Error(state.message);
  const arch=ARCHETYPES.get(archetypeKey); if(!arch) throw new Error(`Archétype inconnu : ${archetypeKey}`);
  const faction=FACTIONS.get(arch.factionKey); if(!faction) throw new Error(`Faction non enregistrée : ${arch.factionKey}`);
  const chosenLoadout=loadoutKey ? LOADOUTS.get(loadoutKey) : (arch.defaultLoadout ? LOADOUTS.get(arch.defaultLoadout) : null);
  if(loadoutKey && !chosenLoadout) throw new Error(`Loadout inconnu : ${loadoutKey}`);
  if(chosenLoadout?.archetypeKey && chosenLoadout.archetypeKey !== archetypeKey) throw new Error("Ce loadout n’appartient pas à cet archétype.");
  if(chosenLoadout?.factionKey && chosenLoadout.factionKey !== arch.factionKey) throw new Error("Ce loadout n’appartient pas à cette faction.");

  const actorTemplate=template(TEMPLATE_KEYS.actor);
  const root=await ensureFolder(ROOT_FOLDER);
  const factionFolder=await ensureFolder(faction.folder||faction.label,root.id);
  const threat=Number(arch.actor?.props?.H0D_Creature_Menace??0);
  const threatFolder=await ensureFolder(`Menace ${threat}`,factionFolder.id);
  const buildKey=`${archetypeKey}::${chosenLoadout?.key??"default"}`;

  let actor=Array.from(game.actors??[]).find(a=>a.getFlag(MODULE_ID,"generated")===true && a.getFlag(MODULE_ID,"buildKey")===buildKey);
  if(actor && mode==="skip") return actor;
  if(actor && mode==="replace"){ await actor.delete(); actor=null; }

  const oldImages=new Map();
  if(actor){
    for(const i of actor.items??[]){
      if(i.getFlag(MODULE_ID,"generated")!==true) continue;
      oldImages.set(`${i.getFlag(MODULE_ID,"kind")}::${i.getFlag(MODULE_ID,"entryKey")}`,i.img);
    }
    const generated=Array.from(actor.items??[]).filter(i=>i.getFlag(MODULE_ID,"generated")===true);
    if(generated.length) await actor.deleteEmbeddedDocuments("Item",generated.map(i=>i.id));
  }

  const displayName=arch.label;
  if(!actor){
    const [created]=await Actor.implementation.createDocuments([{
      name:displayName,type:"character",img:arch.img||actorTemplate.img||"systems/custom-system-builder/img/template-logo.svg",
      folder:threatFolder.id,system:systemFromTemplate(actorTemplate),
      prototypeToken:{...clone(actorTemplate.prototypeToken??{}),name:displayName,actorLink:false},
      flags:{[MODULE_ID]:{generated:true,buildKey,archetypeKey,factionKey:arch.factionKey,loadoutKey:chosenLoadout?.key??null,sourceTemplateId:actorTemplate.id,sourceDataset:arch.sourceDataset||"PNJ_Factions_Menace_1_Foundry"}}
    }]);
    actor=created;
  }

  const props={
    H0D_Creature_Type:"Faction",
    ...clone(arch.actor?.props??{})
  };
  if(!props.H0D_Creature_Faction && faction.factionValue) props.H0D_Creature_Faction=faction.factionValue;
  await forceTemplateAndProps(actor,actorTemplate,props);
  // Le mode « Mettre à jour » doit également purger les anciennes lignes
  // randomID avant d'injecter la table canonique 0..N-1.
  if (Object.prototype.hasOwnProperty.call(props,"H0D_Creature_Capacites_Table")) {
    await actor.update({"system.props.-=H0D_Creature_Capacites_Table":null});
    await actor.update({"system.props.H0D_Creature_Capacites_Table":clone(props.H0D_Creature_Capacites_Table)});
  }
  await actor.update({
    name:displayName,folder:threatFolder.id,"prototypeToken.name":displayName,
    [`flags.${MODULE_ID}.generated`]:true,[`flags.${MODULE_ID}.buildKey`]:buildKey,
    [`flags.${MODULE_ID}.archetypeKey`]:archetypeKey,[`flags.${MODULE_ID}.factionKey`]:arch.factionKey,
    [`flags.${MODULE_ID}.loadoutKey`]:chosenLoadout?.key??null,
    [`flags.${MODULE_ID}.sourceDataset`]:arch.sourceDataset||"PNJ_Factions_Menace_1_Foundry"
  });

  const rows=combineEntries(arch,chosenLoadout);
  const payload=rows.map(({kind,entry})=>itemData(entry,kind,oldImages.get(`${kind}::${entry.key}`)??null));
  const created=payload.length?await actor.createEmbeddedDocuments("Item",payload):[];
  const sourceBySignature=new Map(rows.map(({kind,entry})=>[`${kind}::${entry.key}`,{kind,entry}]));
  for(const doc of created){
    const sign=`${doc.getFlag(MODULE_ID,"kind")}::${doc.getFlag(MODULE_ID,"entryKey")}`;
    const row=sourceBySignature.get(sign);
    if(!row) throw new Error(`Item embarqué non reconnu : ${doc.name} (${sign})`);
    await forceTemplateAndProps(doc,itemTemplateForKind(row.kind),row.entry.props??{});
  }
  return actor;
}


/**
 * CSB 6.0.2 lit une table dynamique par index numérique 0..N-1.
 * Les anciennes Caravanes Libres utilisaient des clés randomID(16) : la fiche
 * refusait de s'ouvrir lorsque DynamicTable.js consultait dynamicProps[line].
 * Ce correctif ne change ni les lignes ni les autres propriétés de l'Actor.
 */
function normalizeCapabilityRows(table) {
  if (!table || typeof table !== "object" || Array.isArray(table)) return null;
  const entries = Object.entries(table);
  if (!entries.length || entries.every(([key],i) => key === String(i))) return null;
  if (!entries.every(([,row]) => row && typeof row === "object" && !Array.isArray(row))) {
    throw new Error("La table de capacités contient une ligne non valide ; réparation annulée.");
  }
  return Object.fromEntries(entries.map(([,row],i) => [String(i),clone(row)]));
}

async function repairGeneratedFactionCapabilityTables() {
  if (!game.user?.isGM) throw new Error("Réparation réservée au MJ.");
  const candidates = Array.from(game.actors ?? []).filter(actor =>
    actor.getFlag(MODULE_ID,"generated") === true &&
    actor.system?.props?.H0D_Creature_Type === "Faction" &&
    normalizeCapabilityRows(actor.system?.props?.H0D_Creature_Capacites_Table) !== null
  );
  if (!candidates.length) {
    notify("info","H0D : aucune table de capacités de faction à réparer.");
    return {repaired:0,failed:0,skipped:0};
  }

  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window:{title:"H0D — Réparer les tables de capacités"},
    content:`<p>Réindexer les capacités de <strong>${candidates.length} PNJ généré(s)</strong> pour Custom System Builder 6.0.2 ?</p>
      <p>Seules les clés de lignes de <code>H0D_Creature_Capacites_Table</code> seront corrigées.
      Les textes, DD, autres statistiques, équipements et images restent inchangés.</p>
      <p>Une sauvegarde de la table originale sera enregistrée dans les flags de chaque Actor concerné.</p>`,
    yes:{label:"Réparer les tables",icon:"fa-solid fa-screwdriver-wrench"},
    no:{label:"Annuler"}
  });
  if (!confirmed) return {repaired:0,failed:0,skipped:candidates.length};

  let repaired=0,failed=0;
  for (const actor of candidates) {
    const oldTable=clone(actor.system.props.H0D_Creature_Capacites_Table);
    const newTable=normalizeCapabilityRows(oldTable);
    if (!newTable) continue;
    try {
      await actor.setFlag(MODULE_ID,"capabilitiesTableRepairBackup",{
        savedAt:new Date().toISOString(),table:oldTable
      });
      // En Foundry, une mise à jour d'objet fusionne ses clés.
      // Supprimer l'ancien champ avant de le reposer évite de garder les randomID.
      await actor.update({"system.props.-=H0D_Creature_Capacites_Table":null});
      await actor.update({"system.props.H0D_Creature_Capacites_Table":newTable});
      const actual=actor.system?.props?.H0D_Creature_Capacites_Table ?? {};
      if (normalizeCapabilityRows(actual) !== null ||
          Object.keys(actual).length !== Object.keys(oldTable).length) {
        throw new Error("Échec de validation des lignes après mise à jour.");
      }
      repaired++;
    } catch(err) {
      failed++;
      console.error(`${MODULE_ID} | réparation capacités de ${actor.name}`,err);
      // Sauvegarde conservée ; tentative de restauration des données initiales.
      try {
        await actor.update({"system.props.-=H0D_Creature_Capacites_Table":null});
        await actor.update({"system.props.H0D_Creature_Capacites_Table":oldTable});
      } catch(restoreError) {
        console.error(`${MODULE_ID} | restauration impossible pour ${actor.name}`,restoreError);
      }
    }
  }
  notify(failed?"warn":"info",`H0D : tables de capacités réparées — ${repaired} PNJ, ${failed} échec(s).`);
  return {repaired,failed,skipped:0};
}


/**
 * Migration limitée aux Actors générés Caravanes Libres, sans régénérer les
 * Items ni les tables CSB. Toutes les stats déjà personnalisées sont protégées.
 * Le backup des anciennes valeurs reste accessible sur chaque Actor.
 */

/**
 * Migration depuis les deux anciennes générations (0.2.1 et 0.3.0) vers
 * les SCORES 15/14/13/12/10/8 du Modern SRD. Elle est conservatrice :
 * si une caractéristique, une attaque ou une arme a été éditée hors des
 * valeurs exactes d'une génération, aucune statistique n'est remplacée.
 */
async function upgradeCaravanesProfilesSafely() {
  if(!game.user?.isGM)throw new Error("Action réservée au MJ.");
  const candidates=Array.from(game.actors??[]).filter(actor=>
    actor.getFlag(MODULE_ID,"generated")===true &&
    actor.getFlag(MODULE_ID,"factionKey")==="caravanes-libres" &&
    ARCHETYPES.has(actor.getFlag(MODULE_ID,"archetypeKey"))
  );
  if(!candidates.length){
    notify("info","H0D : aucun PNJ des Caravanes Libres à migrer.");
    return {updated:0,notesOnly:0,skipped:0,failed:0};
  }
  const confirmed=await foundry.applications.api.DialogV2.confirm({
    window:{title:"H0D — Menace / CR et niveau des PNJ ordinaires"},
    content:`<p><strong>${candidates.length} PNJ</strong> des Caravanes Libres détectés.</p>
      <p>Menace = CR ; pour les PNJ ordinaires du Modern SRD :
      <strong>Niveau PNJ = Menace + 1</strong> (pour ces Menaces 1 à 4).
      Un seul point de caractéristique est acquis au niveau 4, soit
      dès la Menace 3, et conservé en Menace 4.</p>
      <p>Seules les fiches encore conformes aux profils générés en v0.2.1,
      v0.3.0 ou v0.3.1 sont recalculées. Les modifications personnelles sont
      préservées, tout comme les dégâts, PV, DEF, sauvegardes, capacités,
      images et Items.</p>
      <p>Une sauvegarde des valeurs concernées est ajoutée aux flags de chaque
      Actor. Sauvegarder le monde BAC avant de valider.</p>`,
    yes:{label:"Harmoniser les niveaux et scores",icon:"fa-solid fa-dice-d20"},
    no:{label:"Annuler"}
  });
  if(!confirmed)return {updated:0,notesOnly:0,skipped:candidates.length,failed:0};
  const summary={updated:0,notesOnly:0,skipped:0,failed:0};
  for(const actor of candidates){
    const arch=ARCHETYPES.get(actor.getFlag(MODULE_ID,"archetypeKey"));
    const loadout=LOADOUTS.get(arch.defaultLoadout);
    const props=actor.system?.props??{},expected=arch.actor.props;
    const oldAttack=Number(arch.sourceAttack),weapons=loadout?.weapons??[];
    const id=arch.key==="messager-caravane"?"messager-de-caravane":arch.key;
    const legacyMods=legacyCaravanMods(id);
    if(!legacyMods||!Number.isFinite(oldAttack)){summary.skipped++;continue;}
    const menace=Number(props.H0D_Creature_Menace??expected.H0D_Creature_Menace);
    // Une Menace éditée par le MJ n'est jamais corrigée implicitement.
    if(menace!==Number(expected.H0D_Creature_Menace)){summary.skipped++;continue;}
    const oldLevel=menace,newLevel=ordinaryNpcLevelFromCR(menace);
    const prevScores=caravanScores(id,oldLevel);
    const prevMods=caravanMods(id,oldLevel);
    const legacyPlan=caravanAttackPlan({attaque:oldAttack},legacyMods,weapons);
    const prevPlan=caravanAttackPlan({attaque:oldAttack},prevMods,weapons);
    const profiles=[
      {key:"0.2.1",scores:null,mods:Object.fromEntries(ABILITY_NAMES.map(k=>[k,0])),attack:oldAttack,bonuses:weapons.map(()=>0)},
      {key:"0.3.0",scores:null,mods:legacyMods,attack:legacyPlan.base,bonuses:legacyPlan.weaponBonuses},
      {key:"0.3.1",scores:prevScores,mods:prevMods,attack:prevPlan.base,bonuses:prevPlan.weaponBonuses}
    ];
    const docs=weapons.map(source=>Array.from(actor.items??[]).find(item=>
      item.getFlag(MODULE_ID,"generated")===true &&
      item.getFlag(MODULE_ID,"kind")==="weapon" &&
      item.getFlag(MODULE_ID,"entryKey")===source.key
    ));
    const hasAllWeapons=weapons.length>0&&!docs.includes(undefined);
    const matches=profile=>hasAllWeapons &&
      Number(props.H0D_Creature_Attaque_Base)===profile.attack &&
      Number(props.H0D_Creature_Attaque_Divers??0)===0 &&
      ABILITY_NAMES.every(stat=>{
        const mod=props["H0D_Creature_"+stat+"_MOD"];
        const score=props["H0D_Creature_"+stat+"_SCORE"];
        const expectedScore=profile.scores?.[stat];
        return Number(mod??0)===profile.mods[stat] &&
          (expectedScore===undefined
            ? (score===undefined||score===null||score===""||Number(score)===0)
            : Number(score)===expectedScore);
      }) &&
      docs.every((item,i)=>{
        const ip=item.system?.props??{};
        return Number(ip.H0D_Arme_Bonus_Attaque)===profile.bonuses[i] &&
          String(ip.H0D_Arme_Categorie??"")===String(weapons[i].props.H0D_Arme_Categorie) &&
          String(ip.H0D_Arme_Carac_Attaque??"aucune")==="aucune";
      });
    // Sécurité : ne jamais réécrire un niveau personnalisé.
    const levelRaw=props.H0D_Creature_Niveau_PNJ;
    const levelUntouched=levelRaw===undefined||levelRaw===null||levelRaw===""||
      Number(levelRaw)===oldLevel||Number(levelRaw)===newLevel;
    const alreadyCurrent=Number(levelRaw)===newLevel &&
      ABILITY_NAMES.every(stat=>
        Number(props["H0D_Creature_"+stat+"_SCORE"])===Number(expected["H0D_Creature_"+stat+"_SCORE"]) &&
        Number(props["H0D_Creature_"+stat+"_MOD"])===Number(expected["H0D_Creature_"+stat+"_MOD"])
      ) &&
      Number(props.H0D_Creature_Attaque_Base)===Number(expected.H0D_Creature_Attaque_Base) &&
      hasAllWeapons && docs.every((item,i)=>
        Number(item.system?.props?.H0D_Arme_Bonus_Attaque)===
        Number(weapons[i].props.H0D_Arme_Bonus_Attaque)
      );
    // Ré-exécuter la migration sur un PNJ déjà corrigé n'écrit rien.
    const matched=alreadyCurrent?null:(levelUntouched?profiles.find(matches):null);
    const updates={},oldValues=[],oldWeapons=[];
    const note=String(props.H0D_Creature_Notes??"");
    if(note.startsWith("Source :") && note.includes("DD général des capacités")){
      oldValues.push(["H0D_Creature_Notes",props.H0D_Creature_Notes]);
      updates["system.props.H0D_Creature_Notes"]=expected.H0D_Creature_Notes;
    }
    if(matched) {
      for(const stat of ABILITY_NAMES)for(const suffix of ["SCORE","MOD"]){
        const key="H0D_Creature_"+stat+"_"+suffix;
        oldValues.push([key,props[key]]);
        updates["system.props."+key]=expected[key];
      }
      for(const key of ["H0D_Creature_Attaque_Base","H0D_Creature_Niveau_PNJ","H0D_Creature_Statut_PNJ"]){
        oldValues.push([key,props[key]]);
        updates["system.props."+key]=expected[key];
      }
      docs.forEach((item,i)=>oldWeapons.push({
        id:item.id,before:item.system.props.H0D_Arme_Bonus_Attaque,
        after:weapons[i].props.H0D_Arme_Bonus_Attaque
      }));
    }
    if(!Object.keys(updates).length){summary.skipped++;continue;}
    try{
      await actor.setFlag(MODULE_ID,"caravanesOrdinaryCRMigrationBackup",{
        savedAt:new Date().toISOString(),oldValues,priorWeapons:oldWeapons,
        previousGeneration:matched?.key??"notes-only"
      });
      await actor.update(updates);
      if(matched){
        for(const w of oldWeapons) {
          const item=actor.items.get(w.id);
          await item.update({"system.props.H0D_Arme_Bonus_Attaque":w.after});
        }
        summary.updated++;
      } else summary.notesOnly++;
    }catch(err){
      summary.failed++;
      console.error(`${MODULE_ID} | migration Menace/CR (${actor.name})`,err);
      try{
        const rollback={};
        for(const [key,value] of oldValues){
          if(value===undefined||value===null)rollback["system.props.-="+key]=null;
          else rollback["system.props."+key]=value;
        }
        if(Object.keys(rollback).length)await actor.update(rollback);
        for(const w of oldWeapons){
          const item=actor.items.get(w.id);
          if(item)await item.update({"system.props.H0D_Arme_Bonus_Attaque":w.before});
        }
      }catch(rollbackError){
        console.error(`${MODULE_ID} | restauration Menace/CR impossible (${actor.name})`,rollbackError);
      }
    }
  }
  notify(summary.failed?"warn":"info",
    `H0D PNJ ordinaires : ${summary.updated} harmonisés, ${summary.notesOnly} notes seules, ${summary.skipped} ignorés, ${summary.failed} erreurs.`);
  return summary;
}

/** Les scores de base éditables du template Créature v1.20 gouvernent leurs
 * modificateurs, sur les Caravanes générées uniquement. Un simple UPDATE
 * ne modifie jamais automatiquement DEF, PV, sauvegardes ni dégâts.
 */
Hooks.on("preUpdateActor",(actor,changes)=>{
  if(actor.getFlag(MODULE_ID,"generated")!==true ||
     actor.getFlag(MODULE_ID,"factionKey")!=="caravanes-libres")return;
  for(const stat of ABILITY_NAMES){
    const key="H0D_Creature_"+stat+"_SCORE";
    const raw=changes["system.props."+key] ??
      changes.system?.props?.[key];
    if(raw===undefined||raw===null||raw==="")continue;
    const val=Number(raw);
    if(!Number.isInteger(val)||val<1||val>30)continue;
    const modkey="H0D_Creature_"+stat+"_MOD";
    // Compatible avec les mises à jour plates et imbriquées Foundry.
    if("system.props."+key in changes)changes["system.props."+modkey]=String(scoreToMod(val));
    else {
      changes.system??={};changes.system.props??={};
      changes.system.props[modkey]=String(scoreToMod(val));
    }
  }
});

function profileOptions(){
  if(!ARCHETYPES.size) return `<option value="">Aucun profil validé enregistré</option>`;
  const groups=new Map();
  for(const arch of ARCHETYPES.values()){
    const faction=FACTIONS.get(arch.factionKey);
    const label=faction?.label || arch.factionKey;
    if(!groups.has(label)) groups.set(label,[]);
    groups.get(label).push(arch);
  }
  let html=`<option value="">— Choisir —</option>`;
  for(const [factionLabel,values] of groups.entries()){
    html+=`<optgroup label="${esc(factionLabel)}">`;
    for(const arch of values) html+=`<option value="${esc(arch.key)}">${esc(arch.label)}</option>`;
    html+=`</optgroup>`;
  }
  return html;
}

async function openBuilder(){
  if(!game.user?.isGM)return notify("warn","H0D Faction Builder est réservé au MJ.");
  const state=templateState();
  if(!state.ok)return notify("error","H0D Faction Builder : "+state.message);

  const archetypes=Array.from(ARCHETYPES.values());
  const factions=Array.from(FACTIONS.values()).map(f=>({
    key:f.key,label:f.label,hasProfiles:archetypes.some(a=>a.factionKey===f.key)
  })).filter(f=>f.hasProfiles||(f.key==="dent-ambre"&&!!COUNCIL));
  const councilEntries=COUNCIL?Array.from(COUNCIL.entries.values()):null;

  // DialogV2.wait reste affiché pendant l'exécution ; seul « Fermer »
  // ou la croix le ferme. Les sélections persistent entre deux créations.
  await foundry.applications.api.DialogV2.wait({
    window:{title:"H0D Faction Builder v"+MODULE_VERSION},
    content:menuHTML({factions,esc}),
    buttons:[{action:"close",label:"Fermer",icon:"fa-solid fa-xmark"}],
    rejectClose:false,
    render:(_event,dialog)=>{
      attachFactionMenu(dialog,{
        factions,archetypes,councilEntries,esc,
        suggestCouncilAction:key=>COUNCIL?.suggestedAction?.(key)
      });
      const root=dialog.element?.querySelector(".h0d-faction-menu");
      const button=root?.querySelector("[data-h0d-run]");
      const status=root?.querySelector("[data-h0d-status]");
      if(!button||!status||button.dataset.ready==="1")return;
      button.dataset.ready="1";
      let busy=false;
      button.addEventListener("click",async()=>{
        if(busy)return;
        const form=dialog.element?.querySelector("form");
        if(!form)return;
        const data=Object.fromEntries(new FormData(form).entries());
        const choice=resolveMenuSelection(data,factions,archetypes,councilEntries);
        if(!choice.ok){
          status.textContent=choice.message;
          notify("warn",choice.message);
          return;
        }
        busy=true;
        button.disabled=true;
        button.textContent="Opération en cours…";
        status.textContent="Traitement en cours, ne ferme pas la fenêtre…";
        try{
          if(choice.kind==="maintenance"){
            if(choice.action==="repair-capabilities")await repairGeneratedFactionCapabilityTables();
            else if(choice.action==="upgrade-caravanes")await upgradeCaravanesProfilesSafely();
            status.textContent="Maintenance terminée. Tu peux continuer ou fermer.";
            return;
          }
          if(choice.kind==="council"){
            if(!COUNCIL)throw new Error("Références du Conseil indisponibles.");
            const actor=choice.action==="create"?await COUNCIL.create(choice.target):
              choice.action==="adopt"?await COUNCIL.adopt(choice.target):
              await COUNCIL.open(choice.target);
            if(actor&&choice.action!=="open")actor.sheet?.render(true);
            if(actor){
              if(choice.action==="create"||choice.action==="adopt"){
                root.querySelector('select[name="action"]').value="open";
              }
              status.textContent=actor.name+" : "+(
                choice.action==="create"?"créé":choice.action==="adopt"?"adopté":"ouvert"
              )+". Choisis le prochain personnage.";
              if(choice.action!=="open")notify("info","Conseiller prêt : "+actor.name);
            }
            return;
          }
          if(choice.kind!=="profile")throw new Error("Choix de PNJ non reconnu.");
          if(choice.action==="update"||choice.action==="replace"){
            const label=choice.action==="replace"?"SUPPRIMER puis recréer":"METTRE À JOUR";
            const confirmed=await foundry.applications.api.DialogV2.confirm({
              window:{title:"H0D — Confirmation requise"},
              content:"<p><strong>"+esc(label)+"</strong> le profil <strong>"+esc(choice.target)+
                "</strong> ?</p><p>Les équipements générés peuvent être supprimés puis recréés, "+
                "et les personnalisations de la fiche peuvent être perdues. "+
                "Sauvegarde le monde avant de continuer.</p>",
              yes:{label:"Confirmer la modification",icon:"fa-solid fa-triangle-exclamation"},
              no:{label:"Annuler"}
            });
            if(!confirmed){status.textContent="Modification annulée.";return;}
          }
          const arch=ARCHETYPES.get(choice.target);
          const actor=await buildFactionActor(choice.target,{
            loadoutKey:arch?.defaultLoadout??null,mode:choice.action
          });
          actor?.sheet?.render(true);
          if(actor){
            status.textContent="PNJ prêt : "+actor.name+". Choisis le suivant.";
            notify("info","PNJ prêt : "+actor.name);
          }
        }catch(err){
          console.error(MODULE_ID+" | dialogue persistant",err);
          status.textContent="Erreur : "+(err?.message??err);
          notify("error","H0D Faction Builder : "+(err?.message??err));
        }finally{
          busy=false;
          button.disabled=false;
          button.innerHTML='<i class="fa-solid fa-play"></i> Exécuter';
        }
      });
    }
  });
}

async function ensureLauncherMacro() {
  if (!game.user?.isGM) return;
  const name = "H0D — Générateur factions";
  const command = "game.h0dFactionBuilder.open();";
  let macro = game.macros?.getName(name);

  if (macro) {
    const updates = {};
    if (macro.command !== command) updates.command = command;
    if (macro.type !== "script") updates.type = "script";
    if (Object.keys(updates).length) await macro.update(updates);
    return;
  }

  await Macro.create({
    name,
    type: "script",
    scope: "global",
    img: "icons/svg/gears.svg",
    command
  });
  notify("info", `${MODULE_ID} : macro de lancement créée.`);
}

Hooks.once("ready", async () => {
  try { await loadCaravanesProfils(); }
  catch (err) { console.error(`${MODULE_ID} | chargement Caravanes Libres`,err); notify("error",`Caravanes Libres : ${err?.message||err}`); }
  try{
    COUNCIL=await installCouncilUnique({moduleId:MODULE_ID,rootFolder:ROOT_FOLDER,
      templateState,template,actorTemplateKey:TEMPLATE_KEYS.actor,
      clone,ensureFolder,systemFromTemplate,forceTemplateAndProps,itemData,notify});
  }catch(err){console.error(MODULE_ID+" | Conseil",err);notify("error","Conseil : "+(err?.message??err));}
  const api = {
    open: openBuilder,
    buildFactionActor,
    repairGeneratedFactionCapabilityTables,
    upgradeCaravanesProfilesSafely,
    council:COUNCIL,
    registerFaction,
    registerFactions,
    registerArchetype,
    registerArchetypes,
    registerLoadout,
    registerLoadouts,
    factions: FACTIONS,
    archetypes: ARCHETYPES,
    loadouts: LOADOUTS,
    templateState,
    version: MODULE_VERSION
  };
  const mod = game.modules.get(MODULE_ID);
  if (mod) mod.api = api;
  game.h0dFactionBuilder = api;

  await ensureLauncherMacro();

  if (game.user?.isGM) {
    console.log(`${MODULE_ID} | v${MODULE_VERSION} prêt — ${FACTIONS.size} factions, ${ARCHETYPES.size} profils.`);
  }
});
