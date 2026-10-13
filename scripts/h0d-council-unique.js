/**
 * Conseil de la Dent d'Ambre — personnages uniques, créés sans compendium.
 *
 * Important : un conseiller vivant n'est JAMAIS resynchronisé / régénéré.
 * L'import d'origine et les portraits sont uniquement utilisés à la création.
 * Les options "adopter" et "ouvrir" n'écrasent aucune fiche existante.
 */
export async function installCouncilUnique({
  moduleId,rootFolder,templateState,template,actorTemplateKey,
  clone,ensureFolder,systemFromTemplate,forceTemplateAndProps,itemData,notify
}) {
  const path="modules/"+moduleId+"/data/conseil-dent-ambre.json";
  const route=foundry.utils.getRoute ? foundry.utils.getRoute(path) : path;
  const response=await fetch(route);
  if(!response.ok)throw new Error("Référence Conseil non chargée : HTTP "+response.status);
  const data=await response.json();
  if(data.schema!=="h0d-council-unique-v1" || !Array.isArray(data.characters) ||
     data.characters.length!==9)throw new Error("Manifest Conseil invalide : neuf membres requis.");
  const entries=new Map(data.characters.map(e=>[e.key,e]));
  if(entries.size!==9)throw new Error("Clés Conseil dupliquées.");
  if(data.characters.some(c=>c.npcKind!=="unique-heroic" ||
      c.items?.some(i=>!["weapon","armor","object"].includes(i.kind))))
    throw new Error("Type Conseil ou équipement non reconnu.");

  const isCouncil=actor=>actor.getFlag(moduleId,"councilUnique")===true;
  function candidates(entry){
    return Array.from(game.actors??[]).filter(a=>
      a.name===entry.name || a.id===entry.sourceActorId ||
      (isCouncil(a) && a.getFlag(moduleId,"councilKey")===entry.key)
    );
  }
  function existing(key){
    const c=entries.get(key);if(!c)throw new Error("Conseiller inconnu : "+key);
    const indexed=Array.from(game.actors??[]).find(a=>isCouncil(a) &&
      a.getFlag(moduleId,"councilKey")===key);
    return indexed??null;
  }
  function getEntry(key){const e=entries.get(key);if(!e)throw new Error("Conseiller introuvable : "+key);return e;}
  async function councilFolder(){
    const root=await ensureFolder(rootFolder);
    const faction=await ensureFolder("Clan de la Dent d'Ambre",root.id);
    return ensureFolder("Conseil",faction.id);
  }

  async function create(key){
    if(!game.user?.isGM)throw new Error("Action réservée au MJ.");
    const e=getEntry(key);
    if(existing(key))throw new Error(e.name+" existe déjà. Utilise « Ouvrir ».");
    if(candidates(e).length)throw new Error("Une fiche de "+e.name+" existe déjà dans le monde : utilise « Adopter », sans recréer les équipements.");
    const state=templateState();
    if(!state.ok)throw new Error(state.message);
    const t=template(actorTemplateKey);
    if(!t)throw new Error("Template Créature H0D absent.");
    const folder=await councilFolder();
    const token=clone(t.prototypeToken??{});
    token.name=e.name;token.actorLink=false;
    token.texture={...(token.texture??{}),src:e.image.token};
    let actor=null;
    try{
      const [created]=await Actor.implementation.createDocuments([{
        name:e.name,type:"character",img:e.image.portrait,folder:folder.id,
        system:systemFromTemplate(t),prototypeToken:token,
        flags:{[moduleId]:{councilUnique:true,councilKey:key,
          sourceActorId:e.sourceActorId,sourceDataset:data.schema,
          generated:false,referenceVersion:"1"}}
      }]);
      actor=created;
      await forceTemplateAndProps(actor,t,e.actor.props);
      // Construction des 49 équipements à partir des templates courants.
      // Aucun cache CSB issu de l'ancien export n'est réutilisé.
      const payload=e.items.map(item=>itemData(item,item.kind));
      const createdItems=await actor.createEmbeddedDocuments("Item",payload);
      if(createdItems.length!==e.items.length)throw new Error("Tous les objets du Conseil n'ont pas été créés.");
      for(let i=0;i<createdItems.length;i++){
        const doc=createdItems[i],source=e.items[i];
        const tpl=template({weapon:"item-arme",armor:"item-armure",object:"item-objet"}[source.kind]);
        if(!tpl)throw new Error("Template manquant : "+source.kind);
        await forceTemplateAndProps(doc,tpl,source.props);
      }
      return actor;
    }catch(err){
      // Un nouvel Actor incomplet ne doit pas tromper le MJ.
      if(actor){try{await actor.delete();}catch(cleanupErr){console.error("H0D Conseil | Nettoyage import incomplet",cleanupErr);}}
      throw err;
    }
  }

  async function adopt(key){
    if(!game.user?.isGM)throw new Error("Action réservée au MJ.");
    const e=getEntry(key);
    const registered=existing(key);
    if(registered)return registered;
    const found=candidates(e);
    if(found.length===0)throw new Error("Aucune fiche existante pour "+e.name+". Utilise « Créer absent ».");
    if(found.length>1)throw new Error("Plusieurs fiches de "+e.name+" trouvées : adoption annulée pour éviter une erreur d'identité.");
    const actor=found[0];
    const current=actor.getFlag(moduleId,"councilKey");
    if(isCouncil(actor) && current && current!==key)throw new Error("Cette fiche appartient déjà à un autre conseiller.");
    const confirmed=await foundry.applications.api.DialogV2.confirm({
      window:{title:"H0D — Adopter "+e.name},
      content:"<p>Associer la fiche <strong>"+foundry.utils.escapeHTML(actor.name)+
        "</strong> au Conseil de la Dent d'Ambre ?</p>"+
        "<p>Seuls les flags d'identification seront écrits. Les statistiques, objets, notes MJ, illustrations, token, PV et emplacement actuel resteront inchangés.</p>",
      yes:{label:"Adopter la fiche"},no:{label:"Annuler"}
    });
    if(!confirmed)return null;
    await actor.update({["flags."+moduleId+".councilUnique"]:true,
      ["flags."+moduleId+".councilKey"]:key,
      ["flags."+moduleId+".sourceActorId"]:e.sourceActorId,
      ["flags."+moduleId+".generated"]:false});
    return actor;
  }

  async function open(key){
    const e=getEntry(key);
    const a=existing(key)??(candidates(e).length===1?candidates(e)[0]:null);
    if(!a)throw new Error(e.name+" n'existe pas dans le monde. Choisis « Créer absent ».");
    a.sheet?.render(true);
    return a;
  }
  function options(){
    return Array.from(entries.values()).map(e=>
      '<option value="'+foundry.utils.escapeHTML(e.key)+'">'+
      foundry.utils.escapeHTML(e.name)+" — "+foundry.utils.escapeHTML(e.role)+
      (existing(e.key)?" ✓":"")+"</option>"
    ).join("");
  }

  notify("info","H0D Conseil : 9 références héroïques prêtes, aucune fiche existante modifiée.");
  return {entries,create,adopt,open,existing,options,version:"1",count:entries.size};
}
