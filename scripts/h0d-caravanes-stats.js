/**
 * Caravanes Libres — caractéristiques de campagne.
 * Le PDF fournit PV, DEF, ATQ, Initiative et sauvegardes mais pas les 6
 * caractéristiques : ces modificateurs sont un équilibrage MJ approuvé,
 * conforme au modèle 1d20 + modificateur du template PJ H0D / Modern SRD.
 * La Menace n'est pas ajoutée directement au bonus de caractéristique.
 */
export const CARAVAN_MODS = Object.freeze({
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

export const ABILITY_NAMES = Object.freeze(["FOR","DEX","CON","INT","SAG","CHA"]);

export function caravanMods(profileId) {
  const values = CARAVAN_MODS[profileId];
  if (!values) throw new Error("Profil sans caractéristiques validées : "+profileId);
  return Object.fromEntries(ABILITY_NAMES.map((key,index)=>[key,values[index]]));
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
