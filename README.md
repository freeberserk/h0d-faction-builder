# H0D Faction Builder — v0.4.1

## v0.4.1 — Reconnaissance des conseillers déjà présents dans le BAC

L'audit du BAC du 14 octobre 2026 confirme que **Brok - Maitres de la Forge**, **Eron - Maitre des Soins** et **Isha - Maitresse des Récits** existent déjà dans le monde avec le flag hérité `h0d-conseil.packVersion = "1.0"`. Leurs noms et identifiants ne correspondent pas aux neuf fiches de référence du nouveau pack : en v0.4.0, « Créer absent » risquait donc de générer des doublons.

Le Faction Builder v0.4.1 reconnaît **explicitement** ces trois variantes anciennes (accents acceptés), mais **uniquement** si l'Actor porte le flag du pack Conseil historique. Il bloque alors « Créer absent » et permet d'utiliser **« Conseil — Adopter une fiche existante (sans modification) »**. L'adoption n'écrit que des flags de liaison ; portraits Forge, nom, notes MJ, capacités, PV, objets, fiches et dossiers ne sont pas modifiés. En cas de plusieurs candidats, le Builder refuse l'adoption pour éviter une erreur d'identité.

**Recommandation BAC :** après sauvegarde et installation du template Créature v1.22, adopter d'abord Brok, Eron et Isha ; créer uniquement les six absents Kael, Maela, Nerys, Odran, Sava et Tarek. Les trois fiches adoptées gardent volontairement leurs anciennes caractéristiques et leur équipement : l'adoption n'est **pas** une réharmonisation mécanique SRD. Ne pas effacer les anciennes fiches.

## v0.4.0 — Conseil de la Dent d'Ambre : neuf PNJ héroïques uniques

**Neuf conseillers inclus :** Kael (Voie), Brok (Forge), Nerys (Yeux Bleus), Maela (Chasses), Odran (Machines Douces), Sava (Récupération), Eron des Racines (Remèdes), Tarek (Défenses), Isha (Récits).

- **49 équipements et objets** repris de l'export de référence, transférés dans les templates H0D actuels. Les portées des 17 armes sont numériques ; les 11 armures/boucliers et quatre lots de munitions sont normalisés.
- **9 portraits (576×864 WebP) et 9 tokens carrés transparents (512×512 WebP)** inclus dans `assets/conseil/`. Ces images proviennent du pack fourni par le MJ et restent intégrées au module. Les portraits/tokens existants ne sont pas écrasés.
- **PNJ héroïques de niveau 4** avec scores Modern SRD répartis **15/14/13/12/10/8**, avec un seul +1 à une caractéristique au niveau 4. `Menace 4` est une valeur d'adversité cible issue du pack source, distincte du niveau. Les caractéristiques remplacent d'anciens modificateurs très élevés ; base d'attaque et bonus d'armes ont été compensés afin de préserver **ATQ finale et dégâts des exports**. PV, DEF, sauvegardes et initiatives de référence restent inchangés.
- **Canon narratif :** toutes les notes MJ, descriptions, capacités et aptitudes du ZIP sont conservées, avec des précisions sur les Focus de Nerys, la machine de suture fixe d'Eron, le mystère d'Isha, le signal du Scrapper d'Odran et l'arc magnétique de Maela. L'arc magnétique et une éventuelle grenade IEM ne sont **pas créés arbitrairement** : l'équipement déjà joué dans Foundry doit prévaloir.
- Les neuf personnages ne dépendent d'aucun compendium ; fiches de référence publiques stockées dans `data/conseil-dent-ambre.json` conformément à l'accord du MJ. Chaque fiche créée est un Actor persistant du monde.

**Procédure avec H0D — Générateur factions :** choisir un membre dans le champ « Membre du Conseil » puis l'une des **trois nouvelles actions distinctes** :
1. **Conseil — Créer un PNJ unique absent :** crée une seule fois sa fiche et son inventaire sous `H0D — Factions générées / Clan de la Dent d'Ambre / Conseil`. Si une fiche homonyme existe déjà dans le monde, l'action refuse de créer un doublon.
2. **Conseil — Adopter une fiche existante :** associe un Actor déjà importé. Seuls les flags d'identification sont ajoutés avec confirmation ; **aucun changement de stats, objets, note, PV, image, token ou dossier**.
3. **Conseil — Ouvrir une fiche :** retrouve le conseiller déjà créé ou existant et ouvre sa fiche.

**Jamais de « Mettre à jour » pour les membres du Conseil.** Le mode générique du Faction Builder reste réservé aux PNJ générables. Les neuf fiches uniques ne sont ni synchronisées, ni régénérées automatiquement après publication d'une nouvelle version. Si des fiches du Conseil existent déjà, utiliser **Adopter** et préserver leur équipement réellement joué.

**Template recommandé :** H0D Template Manager **v1.7.4**, Créature **v1.22**, qui rend les scores SRD visibles sur les PNJ héroïques en plus des Caravanes Libres. Installer le template, faire un snapshot puis synchroniser les Actors **avant** de créer les conseillers. Tests GitHub ne remplacent pas la validation finale dans Foundry BAC.

## v0.3.2 — Menace (CR) distincte du niveau du PNJ ordinaire

**Décision de campagne :** les 14 Caravanes Libres sont des **PNJ ordinaires** du Modern SRD. Les profils **héroïques** sont réservés à certains chefs de faction et seront traités séparément (aucun profil Caravanes Libres transformé en héroïque).

La **Menace** désigne le CR d'un adversaire, **pas** son niveau de personnage. Pour un ordinaire de niveau 2+, le SRD indique **CR = niveau − 1** ; les 14 profils Menace 1, 2, 3 et 4 sont donc respectivement de **niveau PNJ 2, 3, 4 et 5**. Le CR décrit une difficulté individuelle indicative, pas un niveau de classe ni une garantie d'équilibrage pour les trois PJ.

Tous gardent les scores de départ SRD **15, 14, 13, 12, 10, 8** selon leur métier ; **un unique +1 au niveau 4** est donc acquis **à partir de Menace 3**, et reste acquis en Menace 4 (pas de deuxième bonus). Le champ `H0D_Creature_Niveau_PNJ` stocke leur niveau distinct de `H0D_Creature_Menace`. Le Template Manager **1.7.3** / Créature **v1.21** affiche cette distinction sur les fiches Caravanes Libres.

Les PV, DEF, jets de sauvegarde, initiative, dégâts, actions et équipements restent ceux du PDF, et chaque arme générée conserve **exactement son bonus d'attaque total**. La commande de migration des Caravanes reconnaît les générations **0.2.1**, **0.3.0** et **0.3.1** tant qu'elles ne sont pas personnalisées. Sauvegarder le monde avant toute migration ; ne pas utiliser « Mettre à jour » sur une fiche jouée.

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
