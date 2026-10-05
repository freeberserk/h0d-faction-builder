# H0D Faction Builder

## v0.1.0 — socle

Cette première version prépare le générateur de membres de factions sans figer de profils non validés.

### Architecture
- Actor canonique : `actor-creature` via H0D Template Manager.
- Faction → archétype → loadout.
- Équipement embarqué via les templates canoniques : arme, armure, objet, ressource et modificateur.
- Mise à jour en deux phases pour protéger les `system.props`.
- Conservation des images personnalisées lors d'une régénération.
- Classement automatique par faction puis Menace.

### API
`game.modules.get("h0d-faction-builder").api`

Méthodes principales :
- `registerFaction(definition)`
- `registerArchetype(definition)`
- `registerLoadout(definition)`
- `buildFactionActor(archetypeKey, { loadoutKey, mode })`
- `open()`

Aucun profil de faction n'est inclus dans la v0.1.0 : Caravanes Libres, Pillards Rouges et autres seront intégrés après validation dans le chantier Bestiaire.
