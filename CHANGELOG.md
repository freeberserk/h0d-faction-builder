# Changelog

## 0.6.0 — Les Pillards Rouges, Menaces 2 à 5

- Import des 10 archétypes validés du PDF, avec 59 actions et 32 traits conservés dans les capacités CSB.
- Huit profils ordinaires standards, Chef de bande ordinaire, Roi Rouge héroïque ; scores 15/14/13/12/10/8 adaptés aux rôles, progression par niveau PNJ (Menace ≠ niveau).
- Équipements complets : armes, protections, objets, pièges et éléments de scène, sans inventer leurs charges ; source des attaques inchangée et pas de cumul de DEF.
- Deux variantes de loadout pour le Chef (Écorcheur / Casseur de rotules), menu contextuel.
- Sept compositions de rencontre, préparant leurs fiches modèles manquantes sans créer de doublons.
- L'ancienne recrue Menace 1 n'est plus sélectionnable, mais ses Actors existants ne sont pas supprimés.
- Tests de progression SRD, conservation des valeurs PDF, attaques, variantes, capacités, rencontres et équipement.

## 0.5.1 — Hotfix Foundry v14 : scope inactif de l'ancien Conseil

- Suppression de `getFlag("h0d-conseil", "packVersion")` : les anciennes données sont consultées directement dans `actor.flags`, même si le module historique est désactivé.
- Création de Maela et des autres conseillers débloquée lorsqu'un ancien PNJ Brok, Eron ou Isha est présent.
- Protection anti-doublons conservée pour les fiches héritées, sans migration destructrice.
- Test de régression reproduisant l'exception Foundry et vérifiant la création effective de Maela.

## 0.5.0 — Navigation contextuelle et création en série

- Interface Faction → Groupe → Profil/Conseiller → Action, sous-menus dynamiques. L'action Exécuter garde la fenêtre ouverte et conserve les choix pour enchaîner plusieurs PNJ. Par défaut, aucun Actor existant n'est réinitialisé ; les actions destructives demandent confirmation. Conseil héroïque et outils MJ séparés.
- Aucun changement aux templates H0D ni aux règles de combat.



## 0.4.1 — Anti-doublons des anciens conseillers du BAC
- Reconnaissance sûre des fiches existantes Brok, Eron et Isha avec leurs noms longs et le flag `h0d-conseil.packVersion`.
- « Créer absent » les détecte et demande l'adoption ; aucun acteur, équipement ou portrait supplémentaire n'est généré.
- « Adopter » n'écrit que des flags de liaison, sans toucher aux caractéristiques et aux notes MJ.
- Tests automatisés de non-duplication, conservation des équipements et protection des homonymes.



## 0.4.0 — Neuf membres du Conseil héroïques uniques
- Kael, Brok, Nerys, Maela, Odran, Sava, Eron, Tarek et Isha : 9 références héroïques niveau 4 (SRD 15/14/13/12/10/8 +1), 49 items, notes MJ complètes.
- 9 portraits et 9 tokens WebP optimisés, joints au module.
- Correction des portées, munitions, statuts d'équipement et des descriptions obsolètes. ATQ et dégâts théoriques inchangés après conversion des attributs.
- Menace/CR 4 distinguée du niveau 4 ; rien n'est converti en PNJ ordinaire.
- Actions protégées « Créer absent / Adopter / Ouvrir », sans régénération ni écrasement des Actors existants.
- Intégration avec Créature v1.22 (Template Manager v1.7.4). Notes MJ dans dépôt public avec autorisation du MJ.



## 0.3.2 — Menace/CR et niveau distincts pour les ordinaires
- Caravanes Libres : Menace = CR ; niveau PNJ = CR +1 (CR 1–4 / niveaux 2–5).
- Modern SRD : scores de base 15,14,13,12,10,8 ; premier +1 de score au niveau PNJ 4 = Menace 3, pas Menace 4.
- Stockage explicite du niveau PNJ ordinaire ; futurs chefs héroïques séparés.
- Migration manuelle protectrice des Actors issus des v0.2.1, v0.3.0 ou v0.3.1 ; aucune régénération des Items.
- Attaques/dégâts et autres chiffres du PDF préservés ; compatibilité Créature v1.21.



## 0.3.1 — Correctif Modern SRD des scores d'aptitude
- Remplacement des modificateurs erronés v0.3.0 par les scores ordinaires SRD **15, 14, 13, 12, 10, 8**, répartis par rôle.
- Progression : +1 à **une seule caractéristique** en Menace 4 (niveau 4 équivalent) ; mod = floor((score−10)/2).
- Nouveaux champs `H0D_Creature_XXX_SCORE`, édition synchronisée avec `H0D_Creature_XXX_MOD` pour les Caravanes Libres générées.
- Mise à jour prudente des fiches issues des v0.2.1/v0.3.0, sauvegarde en flag et protection des personnalisations MJ.
- Conservation des ATQ source, dégâts, capacités, PV, DEF, initiatives et sauvegardes ; notes courtes maintenues.
- Requiert le template Créature v1.20 du H0D Template Manager v1.7.2 pour afficher les scores sur la fiche.



## 0.3.0 — Caravanes Libres et SRD (équilibrage MJ)
- Six modificateurs approuvés pour chacun des 14 profils de Menace 1–4, avec jets compatibles avec le template Créature v1.19 et le Modern SRD.
- Répartition base d'attaque / caractéristique / arme testée sans changer le +ATQ des profils ni leurs dégâts.
- Notes courtes sans duplication des actions et traits.
- Migration manuelle des Actors déjà générés avec gardes anti-écrasement et sauvegarde de l'état précédent.
- Aucun changement aux neuf archétypes Menace 1 historiques ni au Creature Builder.



## 0.2.1 — Correction des tables de capacités des factions
- Correction des clés de lignes de `H0D_Creature_Capacites_Table` : indices numériques séquentiels au lieu d'identifiants aléatoires.
- Réparation manuelle et ciblée des fiches déjà générées, avec sauvegarde locale des tables originales.
- Correction du mode Mettre à jour pour supprimer les anciennes clés avant réinjection des lignes canoniques.
- Aucun changement de statistiques, de profils, d'armes ni de protections.


## 0.2.0 — Caravanes Libres
- Ajout de 13 nouveaux archétypes ; remplacement des données du Messager existant, sans doublon.
- 14 profils Menace 1–4, 89 actions, 89 équipements de référence et 51 traits, extraits du PDF fourni.
- Intégration des scores Vigueur / Réflexes / Volonté jusque-là absents de la fiche Messager.
- Conservation des capacités, des contraintes de portée/recharge et des règles de convoi sous forme lisible dans la fiche.
- Équipement généré par type (Arme, Armure/bouclier, Objet) sans bonus fictifs.
- Ajout de l'archive intégrale `data/caravanes-libres.json`.
- Mise en correspondance des Items embarqués par identité stable au lieu d'un index, pour la compatibilité CSB.
- Publication Foundry automatisée par GitHub Actions.

## 0.1.2
- Intégration des 9 profils de factions Menace 1 validés.
- Ajout des statistiques Actor : DEF, PV, ATQ, initiative et vitesse.
- Ajout automatique de l’équipement standard de chaque profil.
- Création d’armes, armures/boucliers et objets via les templates canoniques du H0D Template Manager.
- Correction de la fenêtre de génération : utilisation de `DialogV2.input`.
- Sélection simplifiée par profil, groupée par faction.
- Ajout des modes Mettre à jour / Ignorer / Recréer.
- Conservation des images personnalisées en mise à jour.
- Les données absentes de la source ne sont pas inventées.


## 0.1.1
- Suppression du bouton ajouté aux contrôles de scène.
- Création automatique d'une macro de lancement globale, sur le modèle de H0D Machine Builder.
- API globale `game.h0dFactionBuilder` exposée pour la macro et les appels futurs.
- Aucune donnée bestiaire ajoutée ou modifiée.


## 0.1.0
- Création du socle H0D Faction Builder.
- Intégration obligatoire de H0D Template Manager v0.3.0+.
- Registres extensibles Factions / Archétypes / Loadouts.
- Assemblage préparé Actor + armes + armures + objets + ressources + modificateurs.
- Classement automatique par faction et Menace.
- Conservation des images personnalisées.
- Aucune donnée de faction non validée incluse.
