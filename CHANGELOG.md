# Changelog

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
