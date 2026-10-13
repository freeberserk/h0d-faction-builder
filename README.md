# H0D Faction Builder — v0.3.1

## v0.3.1 — Correction Modern SRD : SCORES, pas modificateurs libres
Le standard Modern SRD pour un PNJ ordinaire est la répartition des **six scores 15, 14, 13, 12, 10, 8** au niveau 1, en fonction du rôle. Un seul score gagne **+1 tous les quatre niveaux**. Les profils de Menace 1–4 utilisent ici la Menace comme **niveau équivalent** : **premier +1 seulement en Menace 4**.

Les valeurs effectives deviennent des modificateurs calculés comme sur la fiche PJ H0D : **floor((score−10)/2)**. Ainsi 15 donne +2, 14 donne +2, 13 donne +1, 12 donne +1, 10 donne +0, 8 donne −1. Au rang 4, une spécialité à 15 devient 16 (+3). Il ne s'agit PAS d'ajouter directement +3/+4/+5 comme dans la version 0.3.0.

Le template Créature **v1.20** du Template Manager **v1.7.2** affiche les scores SRD éditables seulement pour les **Caravanes Libres**, en plus des modificateurs et dés. Lorsque le MJ modifie un score, le Faction Builder synchronise son modificateur sur l'Actor (sans toucher aux sauvegardes, PV ou DEF).

**Migration depuis v0.2.1 OU v0.3.0** : une action manuelle « Corriger vers les scores SRD » examine chaque Actor généré, ne remplace ses statistiques que si toutes les anciennes valeurs de caractéristiques, attaque et armes correspondent exactement à celles du générateur antérieur ; sinon elle préserve les changements MJ. Avant modification, chaque Actor reçoit un flag de sauvegarde `caravanesSRDMigrationBackup`. Les profils déjà personnalisés peuvent être laissés intacts. Ne pas utiliser « Mettre à jour » pour réparer une fiche jouée : cela remplace les Items générés.

Les **ATQ finales de la source** sont conservées sur toutes les armes générées, au prix d'une répartition adaptée base/caractéristique/bonus de l'arme. Les jets de dégâts, les PV, la DEF, l'initiative et les sauvegardes de la source sont maintenus.

## 0.3.0 — Caravanes Libres : caractéristiques, notes courtes, migration sûre

Les **14 Caravanes Libres (Menace 1–4)** disposent maintenant de six modificateurs FOR/DEX/CON/INT/SAG/CHA, définis selon leur rôle et le niveau de Menace. Ces valeurs sont **une adaptation d'équilibrage MJ** et non des chiffres du PDF source. Comme pour les PJ H0D suivant le Modern SRD, les jets sont **1d20 + modificateur**. Les caractéristiques peuvent être lancées depuis le template Créature v1.19 du H0D Template Manager v1.7.1.

**ATQ préservée :** pour chaque arme fournie par les 14 profils, le builder répartit le total du PDF entre attaque de base, FOR/DEX et bonus propre à l'arme. Les dés de dégâts, la DEF, les PV, les sauvegardes, l'initiative, les capacités et les items de défense ne changent pas.

**Notes courtes :** seule la synthèse tactique, la source, les paramètres particuliers et les équipements optionnels sont conservés ; les actions/traits déjà décrits dans la table de capacités ne sont plus dupliqués.

**PNJ déjà générés :** choisir `H0D — Générateur factions` → Action `Migrer prudemment les 14 Caravanes Libres (stats et notes)`. Migration **manuelle** et ciblée, avec confirmation : les modificateurs et armes ne sont réécrits que s'ils sont encore au format d'origine (caracs à 0, attaque globale brute, bonus d'arme nul). Les valeurs personnalisées ne sont pas écrasées. Les notes ne sont raccourcies que si leur texte long correspond à l'ancienne génération. Chaque fiche modifiée conserve ses anciennes valeurs sous `flags.h0d-faction-builder.caravanesStatsMigrationBackup` (snapshot de sécurité du monde recommandé). **Ne pas utiliser « Mettre à jour » pour une fiche déjà personnalisée**, cette commande remplace toujours la plupart de ses champs et les Items générés.

L'ancien bouton de réparation des tables CSB est conservé. Les neuf profils historiques restent inchangés.

## Correctif 0.2.1 — Fiches de factions qui refusent de s'ouvrir

Les capacités sont désormais indexées numériquement (0, 1, 2, etc.) conformément au parcours des lignes de Custom System Builder 6.0.2. L'ancien générateur utilisait des IDs aléatoires, provoquant une erreur `dynamicProps[line] is undefined` dans `DynamicTable.js` lors de l'ouverture des fiches des Caravanes Libres. Le Chasseur novice, sans capacités, restait ouvrable.

Pour réparer **les PNJ déjà créés** : lancer `H0D — Générateur factions`, sélectionner l'action **Réparer les capacités des PNJ déjà générés**, exécuter puis confirmer. L'opération ne touche que la table `H0D_Creature_Capacites_Table` des fiches générées H0D de type Faction qui ont des clés non séquentielles ; elle conserve les textes, DD, autres champs et Items. Une copie de la table d'origine est conservée en flag d'Actor `h0d-faction-builder.capabilitiesTableRepairBackup`. Les Actors ne sont pas recréés. Le mode **Mettre à jour** purge également les anciens index.

L'ouverture réelle des fiches reste à tester dans Foundry. Utiliser d'abord le monde BAC et exporter un snapshot pour prudence.

## Caravanes Libres — 14 profils (Menace 1 à 4)

Cette version conserve les neuf profils de factions de la v0.1.2 et **actualise** le Messager de caravane, sans créer de doublon, puis ajoute 13 profils Caravanes Libres.

Source fidèle : `data/caravanes-libres.json`, transcrite du PDF `Caravanes_Libres_PNJ_Builder(1).pdf` (23 pages), également fournie comme archive indépendante.

- Menace 1 : Messager de caravane, Caravanier au pavois.
- Menace 2 : Garde, Guetteur, Récupérateur, Pisteur, Conducteur de brise-route.
- Menace 3 : Tireur IEM, Défenseur de chariot, Négociateur armé, Médecin de convoi.
- Menace 4 : Capitaine, Vétéran, Ingénieur de caravane.

**Chaque Actor** contient les PV, DEF, ATQ, initiative, vitesse, sauvegardes et DD de la source. Les 89 actions sont conservées avec leur type, ATQ/DD, dégâts ou effet, portée, recharge et notes ; les 51 traits, le harnachement rapide et la table d'incidents Ingénieur figurent également dans les fiches.

Les armes avec attaques chiffrées deviennent des Items H0D Arme, les protections des Items Armure, le reste des Items Objet. La DEF chiffrée dans la fiche inclut déjà les protections : les Items Armure ajoutent 0 DEF pour éviter les doubles bonus. Les attributs et XP non renseignés ne sont pas inventés. L'équipement indiqué **optionnel** est documenté mais non attribué d'office ; les quantités de consommables non précisées restent non spécifiées dans les notes.

Les capacités non automatisables (réactions, pilotage, recharges par scène, dispositifs IEM) restent disponibles en **lecture / résolution manuelle MJ** ; aucune charge ou déclencheur n'est prétendu automatique.

## Prérequis et lancement

Foundry VTT 14, Custom System Builder 6.0.2+, H0D Template Manager actif.

Macro : `H0D — Générateur factions`, ou API : `game.h0dFactionBuilder.open()`.

Modes : Ignorer, Mettre à jour, Recréer. En **Mettre à jour**, les images personnalisées sont préservées, mais les stats sont remises aux valeurs de référence et les Items générés sont réassemblés. À tester dans le BAC avant réutilisation sur une fiche modifiée en partie.

## Publication

Une GitHub Action prépare automatiquement le ZIP et publie la release depuis la branche `main` lorsque la version de `module.json` change. Le manifest de Foundry pointe sur `releases/latest/download/module.json`.
