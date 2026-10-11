# H0D Faction Builder

## v0.1.2 — PNJ de factions Menace 1

Cette version intègre les neuf profils Menace 1 validés :

- Clan de la Dent d'Ambre — Chasseur novice de la Dent
- Caravanes Libres — Messager de caravane
- Pillards Rouges — Pillard recrue
- Culte du Renouveau — Adepte du Renouveau
- Héritiers du Soleil — Aspirant solaire
- HELIOS — Drone de maintenance mineur
- ELYSIUM-9 — Héritier Elys-9 novice
- ELYSIUM-10 — Agent blanc mineur
- HelioSium — Pacificateur instable

### Génération
Chaque profil crée :
- un Actor basé sur `H0D_Actor-template-creature`;
- ses armes validées avec `H0D_Arme`;
- ses armures / boucliers avec `H0D_Armure`;
- ses objets associés avec `H0D_Objet`.

Les Items sont embarqués directement dans l’Actor.

### Fidélité à la fiche source
Les DEF, PV, ATQ, initiative, vitesse et dégâts viennent de la fiche Menace 1.

Les caractéristiques, sauvegardes et XP ne sont pas fournis : ils restent volontairement à 0.

Quand une armure ou un bouclier est cité sans bonus de DEF distinct, l’Item est bien créé mais son bonus reste à 0 : la DEF finale du profil n’est donc pas artificiellement augmentée.

### Mise à jour
Modes disponibles :
- Mettre à jour — conserve les images personnalisées;
- Ignorer;
- Recréer.

### Lancement
Macro automatique :
**H0D — Générateur factions**

Commande :
`game.h0dFactionBuilder.open();`

### Dépendances
- Foundry VTT 14
- Custom System Builder 6.0.2+
- H0D Template Manager 0.3.0+
