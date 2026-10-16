// Online saves use the private site's durable store. Static/portable builds are local.
export const OFFLINE=globalThis.HEXFRONT_OFFLINE===true;
const key='hexfront-offline-save-v1',backupKey=key+'-backup';
let lastGoodSave=null;
function parseSave(raw){
 const data=JSON.parse(raw);
 if(!data||typeof data!=='object'||Array.isArray(data)||data.version!==1)throw Error('Invalid save');
 return data;
}
export async function loadProgress(){
 if(!OFFLINE){const r=await fetch('/api/save');if(!r.ok)throw Error('Save unavailable');return r.json();}
 const raw=localStorage.getItem(key);
 if(raw!==null){try{const data=parseSave(raw);lastGoodSave=raw;return data;}catch(error){
  const backup=localStorage.getItem(backupKey);
  if(backup!==null){const data=parseSave(backup);lastGoodSave=backup;return data;}
  throw error;
 }}
 const backup=localStorage.getItem(backupKey);
 if(backup!==null){const data=parseSave(backup);lastGoodSave=backup;return data;}
 return null;
}
export async function writeProgress(data,keepalive=false){
 const raw=JSON.stringify(data);
 if(OFFLINE){
  parseSave(raw);
  // Keep the preceding valid snapshot. A backup quota failure never blocks the main save.
  let previous=lastGoodSave;
  if(previous===null){try{const stored=localStorage.getItem(key);if(stored!==null){parseSave(stored);previous=stored;}}catch{}}
  if(previous!==null&&previous!==raw){try{localStorage.setItem(backupKey,previous);}catch{}}
  localStorage.setItem(key,raw);lastGoodSave=raw;return;
 }
 const r=await fetch('/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:raw,keepalive});if(!r.ok)throw Error('Save unavailable');
}
