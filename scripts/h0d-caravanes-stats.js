/**
 * Caravanes Libres — caractéristiques de campagne.
 * Le PDF fournit PV, DEF, ATQ, Initiative et sauvegardes mais pas les 6
 * caractéristiques : ces modificateurs sont un équilibrage MJ approuvé,
 * conforme au modèle 1d20 + modificateur du template PJ H0D / Modern SRD.
 * La Menace n'est pas ajoutée directement au bonus de caractéristique.
 */

/* Valeurs SRD des PNJ ordinaires : 15, 14, 13, 12, 10, 8, dans un ordre
 * choisi pour chaque rôle. +1 à UNE caractéristique par tranche de 4 niveaux.
 * La Menace est le CR (difficulté) ; pour un PNJ ordinaire SRD, CR = niveau-1.
 * Ainsi Menace 1..4 correspond à niveaux de PNJ 2..5, et non 1..4.
 */
export const STANDARD_ARRAY = Object.freeze([15,14,13,12,10,8]);
export const ABILITY_NAMES = Object.freeze(["FOR","DEX","CON","INT","SAG","CHA"]);

// Scores initiaux dans l'ordre FOR / DEX / CON / INT / SAG / CHA.
export const CARAVAN_BASE_SCORES = Object.freeze({
  "messager-de-caravane":      [10,15,12,13,14,8],
  "caravanier-au-pavois":      [15,10,14,8,13,12],
  "garde-de-caravane":         [14,12,15,8,13,10],
  "guetteur-de-route":         [8,15,12,13,14,10],
  "recuperateur-des-routes":   [12,15,13,14,10,8],
  "pisteur-de-caravane":       [12,14,13,10,15,8],
  "conducteur-de-brise-route": [12,15,13,10,14,8],
  "tireur-iem":                [10,14,12,15,13,8],
  "defenseur-de-chariot":      [15,8,14,10,13,12],
  "negociateur-arme":          [10,14,12,13,8,15],
  "medecin-de-convoi":         [8,13,12,15,14,10],
  "capitaine-de-caravane":     [8,13,10,14,12,15],
  "veteran-des-routes":       [15,14,13,10,12,8],
  "ingenieur-de-caravane":     [12,13,14,15,10,8]
});

// Au niveau réel 4 (Menace/CR 3), le premier bonus +1 est investi dans la
// spécialité. Un PNJ Menace/CR 4 est niveau 5 et conserve ce bonus unique.
export const LEVEL4_BOOSTS = Object.freeze({
  "capitaine-de-caravane":"CHA",
  "veteran-des-routes":"FOR",
  "ingenieur-de-caravane":"INT"
});

export function scoreToMod(score) {
  if (!Number.isFinite(Number(score))) throw new Error("Score de caractéristique invalide.");
  return Math.floor((Number(score)-10)/2);
}

export function ordinaryNpcLevelFromCR(cr) {
  const rating=Number(cr);
  // Cette collection référence seulement des CR entiers 1 à 4.
  if(!Number.isInteger(rating)||rating<1)throw new Error("CR ordinaire invalide : "+cr);
  return rating+1;
}

export function caravanScores(profileId,npcLevel) {
  const values=CARAVAN_BASE_SCORES[profileId];
  if(!values)throw new Error("Profil sans scores SRD validés : "+profileId);
  const level=Number(npcLevel);
  if(!Number.isInteger(level)||level<1)throw new Error("Niveau de PNJ invalide : "+npcLevel);
  const scores=Object.fromEntries(ABILITY_NAMES.map((stat,i)=>[stat,values[i]]));
  const boosts=Math.floor(level/4);
  if(boosts){
    const key=LEVEL4_BOOSTS[profileId] ?? ABILITY_NAMES[values.indexOf(15)];
    scores[key]+=boosts;
  }
  return scores;
}

export function caravanMods(profileId,npcLevel) {
  const scores=caravanScores(profileId,npcLevel);
  return Object.fromEntries(ABILITY_NAMES.map(stat=>[stat,scoreToMod(scores[stat])]));
}

/** Représentation héritée de la 0.3.0, uniquement pour une migration contrôlée.
 * Ces modificateurs ne sont PLUS utilisés à la génération.
 */
export const LEGACY_CARAVAN_MODS = Object.freeze({
  "messager-de-caravane":      [0,2,0,1,2,1],
  "caravanier-au-pavois":      [2,0,2,0,1,0],
  "garde-de-caravane":         [2,1,2,0,1,1],
  "guetteur-de-route":         [0,3,1,1,3,0],
  "recuperateur-des-routes":   [1,3,1,2,2,0],
  "pisteur-de-caravane":       [1,2,1,1,3,0],
  "conducteur-de-brise-route": [1,3,1,1,3,1],
  "tireur-iem":                [1,3,1,3,2,0],
  "defenseur-de-chariot":      [4,0,3,0,2,0],
  "negociateur-arme":          [1,3,1,2,3,4],
  "medecin-de-convoi":         [0,3,1,4,3,2],
  "capitaine-de-caravane":     [2,3,2,4,3,4],
  "veteran-des-routes":       [3,3,3,2,3,2],
  "ingenieur-de-caravane":     [2,2,2,5,3,1]
});
export function legacyCaravanMods(profileId) {
  const vals=LEGACY_CARAVAN_MODS[profileId];
  return vals ? Object.fromEntries(ABILITY_NAMES.map((name,i)=>[name,vals[i]])) : null;
}

/** Copie la logique du template Créature : melee -> FOR, distance -> DEX.
 * Les dégâts fixes du PDF restent ceux de H0D_Arme_Degats.
 */
export function caravanWeaponAbility(weapon,mods) {
  const category=String(weapon?.props?.H0D_Arme_Categorie || "");
  if (category === "melee") return mods.FOR;
  if (category === "distance") return mods.DEX;
  const explicit=String(weapon?.props?.H0D_Arme_Carac_Attaque || "");
  return explicit === "FOR" || explicit === "DEX" ? mods[explicit] : 0;
}

/** La source fixe une ATQ totale, y compris pour les armes de catégories
 * différentes. On répartit cette ATQ en base + carac + bonus propre à l'arme.
 */
export function caravanAttackPlan(stats,mods,weapons) {
  const total=Number(stats.attaque);
  if (!Number.isFinite(total)) throw new Error("Attaque PDF absente.");
  const abilities=weapons.map(w=>caravanWeaponAbility(w,mods));
  const base=total-Math.max(0,...abilities);
  if (base < 0) throw new Error("Une caractéristique dépasse l'attaque totale du PDF.");
  return {
    base,
    weaponBonuses:weapons.map((weapon,i)=>total-base-abilities[i])
  };
}

export function caravanCompactNotes(profile,source) {
  const special=Object.entries(profile.parametres_speciaux||{})
    .map(([key,value])=>key+": "+value+".");
  const optional=profile.equipement.filter(name=>/\boptionnel\b/i.test(name))
    .map(name=>"Équipement optionnel (non attribué) : "+name+".");
  const incidents=(profile.table_incidents||[]).length
    ? ["Incidents Ingénieur (1d6) : "+profile.table_incidents.map(x=>x.d6+" → "+x.effet).join(" ; ")+"."] : [];
  return [
    profile.phrase,
    "Rôle : "+profile.role+".",
    ...special,
    ...optional,
    ...incidents,
    "Source : "+source.source.fichier+", p. "+profile.pages_pdf.join(", ")+".",
    "Caractéristiques : adaptation MJ (valeurs absentes du PDF)."
  ].filter(Boolean).join("\n");
}
