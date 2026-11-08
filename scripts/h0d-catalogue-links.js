/**
 * H0D Catalogue est la référence, mais une fiche PNJ peut comporter des
 * adaptations de combat propres au profil. Aucune divergence non validée
 * n'est écrasée automatiquement.
 */
const RUNTIME_KEYS=new Set([
 "H0D_Arme_Equipee","H0D_Arme_Active","H0D_Armure_Active","H0D_Objet_Actif",
 "H0D_Objet_Quantite","H0D_Ressource_Quantite","H0D_Stockage"
]);
const typeByKind={weapon:"weapon",armor:"armor",object:"object",resource:"resource"};
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
export function resolveFactionCatalogueItem(entry,kind,catalogue){
 const local=clone(entry?.props??{});
 if(!catalogue?.resolveDefinition||!entry?.name||!typeByKind[kind])
  return {status:"catalogue-absent",key:null,props:local,differences:[],definition:null};
 const result=catalogue.resolveDefinition({
  key:entry.catalogueKey??entry.catalogKey??null,name:entry.name,kind:typeByKind[kind]
 });
 if(!["key","name"].includes(result.status)||!result.definition)
  return {status:result.status,key:null,props:local,differences:[],definition:null,candidates:result.candidates??[]};
 const canonical=result.definition;
 if(canonical.catalogue?.pret_pour_builder===false)
  return {status:"plan-incomplet",key:canonical.key,props:local,differences:[],definition:canonical};
 const differences=Object.keys(local).filter(k=>!RUNTIME_KEYS.has(k) &&
  JSON.stringify(local[k])!==JSON.stringify(canonical.props?.[k]));
 if(differences.length)return {
  status:"divergence-a-valider",key:canonical.key,props:local,
  differences,definition:canonical
 };
 const props={...clone(canonical.props??{})};
 for(const k of RUNTIME_KEYS)if(Object.hasOwn(local,k))props[k]=clone(local[k]);
 return {status:"canonique",key:canonical.key,props,differences:[],definition:canonical};
}
export function summarizeFactionCatalogue(entries,catalogue){
 const records=entries.map(({kind,entry,archetypeKey})=>{
  const status=resolveFactionCatalogueItem(entry,kind,catalogue);
  return {archetypeKey,key:entry.key,name:entry.name,kind,catalogueKey:status.key,
    status:status.status,differences:status.differences,
    candidates:status.candidates??[]};
 });
 const counts=records.reduce((o,r)=>(o[r.status]=(o[r.status]??0)+1,o),{});
 return {total:records.length,counts,records};
}
