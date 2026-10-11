# Changelog

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
