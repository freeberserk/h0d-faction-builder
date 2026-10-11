const MODULE_ID = "h0d-faction-builder";
const MODULE_VERSION = "0.1.2";
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
      flags:{[MODULE_ID]:{generated:true,buildKey,archetypeKey,factionKey:arch.factionKey,loadoutKey:chosenLoadout?.key??null,sourceTemplateId:actorTemplate.id,sourceDataset:"PNJ_Factions_Menace_1_Foundry"}}
    }]);
    actor=created;
  }

  const props={
    H0D_Creature_Type:"Faction",
    ...clone(arch.actor?.props??{})
  };
  if(!props.H0D_Creature_Faction && faction.factionValue) props.H0D_Creature_Faction=faction.factionValue;
  await forceTemplateAndProps(actor,actorTemplate,props);
  await actor.update({
    name:displayName,folder:threatFolder.id,"prototypeToken.name":displayName,
    [`flags.${MODULE_ID}.generated`]:true,[`flags.${MODULE_ID}.buildKey`]:buildKey,
    [`flags.${MODULE_ID}.archetypeKey`]:archetypeKey,[`flags.${MODULE_ID}.factionKey`]:arch.factionKey,
    [`flags.${MODULE_ID}.loadoutKey`]:chosenLoadout?.key??null,
    [`flags.${MODULE_ID}.sourceDataset`]:"PNJ_Factions_Menace_1_Foundry"
  });

  const rows=combineEntries(arch,chosenLoadout);
  const payload=rows.map(({kind,entry})=>itemData(entry,kind,oldImages.get(`${kind}::${entry.key}`)??null));
  const created=payload.length?await actor.createEmbeddedDocuments("Item",payload):[];
  for(let idx=0;idx<created.length;idx++){
    const row=rows[idx], doc=created[idx], t=itemTemplateForKind(row.kind);
    await forceTemplateAndProps(doc,t,row.entry.props??{});
  }
  return actor;
}

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
  if(!game.user?.isGM) return notify("warn","H0D Faction Builder est réservé au MJ.");

  const state=templateState();
  const result=await foundry.applications.api.DialogV2.input({
    window:{title:`H0D Faction Builder v${MODULE_VERSION}`},
    content:`
      <div class="h0d-faction-builder" style="display:flex;flex-direction:column;gap:10px;">
        <p><strong>Templates :</strong> ${state.ok?"✅":"❌"} ${esc(state.message)}</p>
        <p><strong>Menace 1 intégrée :</strong> ${FACTIONS.size} faction(s) · ${ARCHETYPES.size} profil(s) · ${LOADOUTS.size} équipement(s) standard.</p>
        <hr>

        <div class="form-group">
          <label>Profil PNJ</label>
          <select name="archetype">${profileOptions()}</select>
        </div>

        <div class="form-group">
          <label>Si l’Actor existe déjà</label>
          <select name="mode">
            <option value="update">Mettre à jour (conserve les images)</option>
            <option value="skip">Ignorer</option>
            <option value="replace">Recréer</option>
          </select>
        </div>

        <p style="opacity:.75">
          L’équipement standard validé est ajouté automatiquement.
          Les caractéristiques, sauvegardes et XP absents de la fiche source restent à 0.
          Les armures/boucliers sans bonus chiffré distinct sont créés avec un bonus DEF neutre (0) afin de conserver la DEF finale du profil.
        </p>
      </div>`,
    ok:{label:"Générer / mettre à jour",icon:"fa-solid fa-users"}
  });

  if(!result) return;
  if(!result.archetype){
    notify("warn","Choisis d’abord un profil PNJ.");
    return;
  }

  try{
    const arch=ARCHETYPES.get(String(result.archetype));
    const actor=await buildFactionActor(
      String(result.archetype),
      {loadoutKey:arch?.defaultLoadout??null,mode:String(result.mode||"update")}
    );
    actor.sheet?.render(true);
    notify("info",`PNJ généré : ${actor.name}`);
  }catch(err){
    console.error(`${MODULE_ID} | génération`,err);
    notify("error",`H0D Faction Builder : ${err?.message??err}`);
  }
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
  const api = {
    open: openBuilder,
    buildFactionActor,
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
    console.log(`${MODULE_ID} | v${MODULE_VERSION} prêt — Menace 1 : ${FACTIONS.size} factions, ${ARCHETYPES.size} profils.`);
  }
});
