/** Optional H0D Visuels private module integration; no images in this repository. */
export function installFactionVisualControls(root,esc){
  const api=game.h0dVisuels;
  if(!api?.getChoices||!api?.pickForBuilder||root?.dataset?.visualReady==='1')return;
  const run=root.querySelector('[data-h0d-run]');
  const group=root.querySelector('select[name="group"]');
  const target=root.querySelector('select[name="target"]');
  if(!run||!group||!target)return;
  root.dataset.visualReady='1';
  const panel=document.createElement('div');
  panel.dataset.role='visuals';
  panel.style.display='none';
  panel.innerHTML='<fieldset><legend>Apparence — H0D Visuels privé</legend>'+
    '<label>Attribution des portraits <select name="visualMode">'+
      '<option value="random">Aléatoire — évite les répétitions</option>'+
      '<option value="manual">Choisir une variante précise</option>'+
      '<option value="masculin">Masculine — parmi les variantes annotées</option>'+
      '<option value="feminin">Féminine — parmi les variantes annotées</option>'+
      '<option value="none">Ne pas attribuer d’image</option>'+
    '</select></label>'+
    '<div data-role="manualVisual" style="display:none;margin-top:6px">'+
      '<label>Variante <select name="visualVariant"></select></label>'+
      '<img data-role="visualPreview" alt="Aperçu" width="90" height="90" style="display:block;object-fit:contain;margin-top:4px">'+
    '</div>'+
    '<p style="margin:3px 0;opacity:.75;font-size:.85em" data-role="visualHint"></p>'+
  '</fieldset>';
  run.before(panel);
  const mode=panel.querySelector('[name="visualMode"]');
  const variant=panel.querySelector('[name="visualVariant"]');
  const manual=panel.querySelector('[data-role="manualVisual"]');
  const preview=panel.querySelector('[data-role="visualPreview"]');
  const hint=panel.querySelector('[data-role="visualHint"]');
  let current=[];
  function updatePreview(){
    manual.style.display=mode.value==='manual'?'':'none';
    const found=current.find(c=>c.id===variant.value);
    if(found?.portrait){preview.src=api.visualUrl(found.portrait);preview.style.display='block';}
    else preview.style.display='none';
  }
  function refresh(){
    if(group.value!=='profiles'||!target.value){panel.style.display='none';current=[];return;}
    current=api.getChoices('faction',target.value);
    if(!current.length){panel.style.display='none';return;}
    panel.style.display='';
    variant.innerHTML=current.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.label)+(c.approved?'':' [à confirmer]')+'</option>').join('');
    for(const presentation of ['masculin','feminin']){
      const option=mode.querySelector('option[value="'+presentation+'"]');
      option.disabled=!current.some(c=>c.approved&&c.presentation===presentation);
      if(option.disabled&&mode.value===presentation)mode.value='random';
    }
    hint.textContent=current.filter(c=>c.approved).length+' / '+current.length+
      ' variantes validées. Catégories d’apparence annotées par le MJ.';
    updatePreview();
  }
  mode.addEventListener('change',updatePreview);
  variant.addEventListener('change',updatePreview);
  group.addEventListener('change',refresh);
  target.addEventListener('change',refresh);
  root.querySelector('select[name="faction"]')?.addEventListener('change',refresh);
  refresh();
}
