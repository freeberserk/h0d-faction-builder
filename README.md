# H0D Faction Builder — v0.2.1

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
