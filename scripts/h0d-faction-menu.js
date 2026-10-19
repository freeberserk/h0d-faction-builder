/** H0D Faction Builder — menu contextuel, compatible Foundry v14. */
export const MAINTENANCE_KEY = "__maintenance__";
export function groupsForFaction(key,factions,councilReady=false) {
  if(key===MAINTENANCE_KEY)return [
    {key:"repair-capabilities",label:"Réparer les tables de capacités"},
    {key:"upgrade-caravanes",label:"Harmoniser les Caravanes Libres (SRD)"},
    {key:"sync-perception",label:"Synchroniser PER / DET des PNJ"}
  ];
  const faction=factions.find(x=>x.key===key);
  if(!faction)return [];
  return [
    ...(key==="dent-ambre"&&councilReady?[{key:"council",label:"Conseil — PNJ héroïques uniques"}]:[]),
    ...(faction.hasProfiles?[{key:"profiles",label:"PNJ et profils de faction"}]:[]),
    ...(faction.hasEncounters?[{key:"encounters",label:"Groupes de rencontre (fiches modèles)"}]:[])
  ];
}
export function targetsForGroup(faction,group,archetypes,councilEntries=[],encounters=[]) {
  if(group==="encounters"&&faction==="pillards-rouges")return encounters.map(e=>({key:e.id,label:e.nom}));
  if(group==="council" && faction==="dent-ambre")
    return councilEntries.map(x=>({key:x.key,label:x.name+" — "+(x.role||"Conseil"),menace:null}));
  if(group!=="profiles")return [];
  return archetypes.filter(x=>x.factionKey===faction).map(x=>({
    key:x.key,label:x.label,menace:Number(x.actor?.props?.H0D_Creature_Menace??0)
  })).sort((a,b)=>a.menace-b.menace||a.label.localeCompare(b.label,"fr"));
}
export function actionsForGroup(group) {
  if(group==="council")return [
    {key:"open",label:"Ouvrir la fiche (sans modification)"},
    {key:"create",label:"Créer uniquement si absent"},
    {key:"adopt",label:"Adopter une fiche existante (sans modification)"}
  ];
  if(group==="encounters")return [{key:"prepare",label:"Préparer les profils (sans créer de doublons)"}];
  if(group==="profiles")return [
    {key:"skip",label:"Créer si absent / ouvrir si présent"},
    {key:"update",label:"Mettre à jour les données générées ⚠"},
    {key:"replace",label:"Supprimer puis recréer le PNJ ⚠"}
  ];
  return [];
}
export function resolveMenuSelection(raw,factions,archetypes,councilEntries,encounters=[],loadouts=[]) {
  const faction=String(raw?.faction??""),group=String(raw?.group??""),
    target=String(raw?.target??""),action=String(raw?.action??"");
  const groups=groupsForFaction(faction,factions,!!councilEntries);
  if(!groups.some(x=>x.key===group))
    return {ok:false,message:"Choisis une faction, puis une catégorie."};
  if(faction===MAINTENANCE_KEY)return {ok:true,kind:"maintenance",action:group};
  const targets=targetsForGroup(faction,group,archetypes,councilEntries??[],encounters);
  if(!targets.some(x=>x.key===target))
    return {ok:false,message:"Choisis un membre du Conseil ou un profil PNJ."};
  if(!actionsForGroup(group).some(x=>x.key===action))
    return {ok:false,message:"Choisis une action adaptée à ce groupe."};
  if(group==="profiles"){
    const allowed=loadouts.filter(x=>x.archetypeKey===target);
    const selected=String(raw?.loadout??"");
    if(selected && !allowed.some(x=>x.key===selected))
      return {ok:false,message:"Variante d'équipement invalide."};
    return {ok:true,kind:"profile",faction,group,target,action,loadout:selected||null};
  }
  return {ok:true,kind:group==="council"?"council":"encounter",faction,group,target,action};
}
export function menuHTML({factions,esc}) {
  const options=factions.map(x=>'<option value="'+esc(x.key)+'">'+esc(x.label)+'</option>').join("");
  return '<div class="h0d-faction-menu" style="display:flex;flex-direction:column;gap:10px;">'+
    '<div class="form-group"><label>1 · Faction</label><select name="faction">'+
      '<option value="">— Choisir une faction —</option>'+options+
      '<option value="'+MAINTENANCE_KEY+'">⚙ Outils MJ / maintenance</option></select></div>'+
    '<div class="form-group"><label>2 · Groupe</label><select name="group"><option value="">— Choisir un groupe —</option></select></div>'+
    '<div class="form-group" data-role="target" style="display:none"><label>3 · Personnage / profil</label>'+
      '<select name="target"><option value="">— Choisir un personnage —</option></select></div>'+
    '<div class="form-group" data-role="loadout" style="display:none"><label>Variante / équipement</label>'+
      '<select name="loadout"><option value="">— Par défaut —</option></select></div>'+
    '<div class="form-group" data-role="action" style="display:none"><label>4 · Action</label>'+
      '<select name="action"><option value="">— Choisir une action —</option></select></div>'+
    '<p data-role="hint" style="opacity:.75;margin:0">Choisis une faction pour afficher ses groupes.</p>'+
    '<button type="button" data-h0d-run><i class="fa-solid fa-play"></i> Exécuter</button>'+
    '<p data-h0d-status role="status" aria-live="polite" style="margin:0;min-height:1.2em;opacity:.8"></p></div>';
}
export function attachFactionMenu(dialog,{factions,archetypes,councilEntries,encounters=[],loadouts=[],esc,suggestCouncilAction}) {
  const root=dialog.element?.querySelector(".h0d-faction-menu");
  if(!root||root.dataset.ready==="1")return;
  root.dataset.ready="1";
  const field=name=>root.querySelector('select[name="'+name+'"]');
  const faction=field("faction"),group=field("group"),target=field("target"),action=field("action"),loadout=field("loadout"),
    targetRow=root.querySelector('[data-role="target"]'),
    actionRow=root.querySelector('[data-role="action"]'),
    loadoutRow=root.querySelector('[data-role="loadout"]'),
    hint=root.querySelector('[data-role="hint"]');
  if(!faction||!group||!target||!action||!targetRow||!actionRow||!hint)return;
  function fill(select,values,placeholder){
    select.innerHTML='<option value="">'+esc(placeholder)+'</option>'+
      values.map(x=>'<option value="'+esc(x.key)+'">'+esc(x.label)+'</option>').join("");
  }
  function refreshHint(){
    if(group.value==="encounters"){
      const recipe=encounters.find(e=>e.id===target.value);
      hint.textContent=recipe?recipe.effet+" Prépare une seule fiche modèle par type, pas des copies sur scène.":"Sélectionne un groupe de rencontre.";
      return;
    }
    if(faction.value===MAINTENANCE_KEY){
      hint.textContent="Outils MJ : chaque opération comporte sa propre confirmation.";return;
    }
    if(group.value==="council"){
      hint.textContent="Les PNJ uniques du Conseil ne sont jamais réinitialisés par ce menu.";return;
    }
    if(group.value==="profiles"){
      hint.textContent=action.value==="update"||action.value==="replace"?
        "Attention : cette action peut écraser les modifications manuelles des profils génériques.":
        "Un PNJ générique déjà présent est ouvert sans être modifié.";return;
    }
    hint.textContent="Choisis un groupe pour afficher les personnages disponibles.";
  }
  function refreshLoadout(){
    const options=group.value==="profiles"?loadouts.filter(l=>l.archetypeKey===target.value):[];
    fill(loadout,options,"— Équipement par défaut —");
    loadoutRow.style.display=options.length>1?"":"none";
  }
  function refreshAction(){
    refreshLoadout();
    const options=actionsForGroup(group.value);
    fill(action,options,"— Choisir une action —");
    const suggested=group.value==="council" && target.value && suggestCouncilAction?
      suggestCouncilAction(target.value):null;
    action.value=options.some(x=>x.key===suggested)?suggested:
      group.value==="profiles"?"skip":group.value==="council"?"open":group.value==="encounters"?"prepare":"";
    actionRow.style.display=faction.value===MAINTENANCE_KEY||!target.value?"none":"";
    refreshHint();
  }
  function refreshTarget(){
    const targets=targetsForGroup(faction.value,group.value,archetypes,councilEntries??[],encounters);
    fill(target,targets,"— Choisir un personnage —");
    targetRow.style.display=faction.value===MAINTENANCE_KEY||!targets.length?"none":"";
    refreshAction();
  }
  function refreshGroup(){
    const groups=groupsForFaction(faction.value,factions,!!councilEntries);
    fill(group,groups,"— Choisir un groupe —");
    if(groups.length===1)group.value=groups[0].key;
    refreshTarget();
  }
  faction.addEventListener("change",refreshGroup);
  group.addEventListener("change",refreshTarget);
  target.addEventListener("change",refreshAction);
  action.addEventListener("change",refreshHint);
  refreshGroup();
}
