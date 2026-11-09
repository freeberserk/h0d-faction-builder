/**
 * Protection des macros de lancement H0D.
 *
 * Une macro n'est gérée que si elle porte notre flag explicite ou si elle est
 * l'ancienne macro officielle, reconnue par nom + type + scope + commande exacts.
 * Aucun texte de macro utilisateur n'est remplacé sur la seule base de son nom.
 */
export async function ensureManagedLauncherMacro({moduleId,name,command,img,notify}){
  if(!game.user?.isGM)return null;
  const macros=Array.from(game.macros?.contents??[]);
  const meta=macro=>macro?.getFlag?.(moduleId,"launcher")??macro?.flags?.[moduleId]?.launcher??null;
  const managed=macros.filter(macro=>meta(macro)?.managed===true);

  if(managed.length>1){
    notify?.("warn",moduleId+" : plusieurs macros de lancement officielles identifiées. Aucune ne sera modifiée.");
    return null;
  }
  if(managed.length===1){
    const macro=managed[0];
    const recorded=meta(macro)?.generatedCommand;
    // Une édition manuelle du contenu, du type ou du scope prévaut sur la mise à jour du module.
    if(typeof recorded!=="string"||macro.command!==recorded||macro.type!=="script"||macro.scope!=="global"){
      notify?.("warn",moduleId+" : macro de lancement personnalisée détectée ; aucune modification.");
      return macro;
    }
    if(macro.command!==command){
      await macro.update({command,[`flags.${moduleId}.launcher.generatedCommand`]:command});
    }
    return macro;
  }

  const usedByOtherModule=macro=>Object.entries(macro?.flags??{}).some(
    ([namespace,value])=>namespace!==moduleId&&value?.launcher?.managed===true
  );
  const legacy=macros.filter(macro=>
    macro.name===name&&macro.type==="script"&&macro.scope==="global"&&
    macro.command===command&&!usedByOtherModule(macro)
  );
  if(legacy.length===1){
    const macro=legacy[0];
    // Adoption non destructive : seul le flag de propriété est ajouté.
    await macro.update({[`flags.${moduleId}.launcher`]:{managed:true,generatedCommand:command}});
    return macro;
  }

  // Conflit de nom : garder la macro utilisateur intacte et créer un lanceur séparé.
  const names=new Set(macros.map(macro=>macro.name));
  let launcherName=name;
  if(names.has(launcherName)){
    launcherName=name+" (module officiel)";
    let index=2;
    while(names.has(launcherName))launcherName=name+" (module officiel "+index+++ ")";
    notify?.("warn",moduleId+" : macro existante conservée ; lanceur officiel créé séparément.");
  }
  const created=await Macro.create({
    name:launcherName,type:"script",scope:"global",img,command,
    flags:{[moduleId]:{launcher:{managed:true,generatedCommand:command}}}
  });
  notify?.("info",moduleId+" : macro de lancement officielle créée.");
  return created;
}
