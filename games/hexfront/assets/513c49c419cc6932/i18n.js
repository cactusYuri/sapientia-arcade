import {EN} from './english.js';
const preference='hexfront-language';
let locale='zh';try{const saved=localStorage.getItem(preference);if(saved==='en'||saved==='zh')locale=saved;}catch{}
const escapeRE=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const terms=Object.keys(EN).filter(Boolean).sort((a,b)=>b.length-a.length);
const phrasePattern=new RegExp(terms.map(escapeRE).join('|'),'g');
const textSources=new WeakMap(),attributeSources=new WeakMap();
const patterns=[
 [/^开始第 (\d+) 波$/,(_,n)=>'Launch Wave '+n],
 [/^第 (\d+) 波清场 · 可以调整防线$/,(_,n)=>'Wave '+n+' cleared · Rebuild your defense'],
 [/^第 (\d+) 波已保存$/,(_,n)=>'Wave '+n+' saved'],
 [/^第 (\d+) 波$/,(_,n)=>'Wave '+n],
 [/^(\d+) 波(?:\s*(.*))?$/,(_,n,tail)=>n+' waves'+(tail?' '+translate(tail):'')],
 [/^选择炮塔，再点击地板部署$/,()=> 'Select a tower, then tap a floor tile'],
 [/^点击部署 (.+) · 右键取消$/,(_,name)=>'Deploy '+translate(name)+' · Right-click to cancel'],
 [/^点击地图部署 · (\d+)$/,(_,n)=>'Tap the map to deploy · '+n],
 [/^升级至二级 · (\d+)$/,(_,n)=>'Upgrade to level 2 · '+n],
 [/^拆除 · 返还 (\d+)$/,(_,n)=>'Sell · Refund '+n],
 [/^清理废墟 · (\d+)$/,(_,n)=>'Clear debris · '+n],
 [/^清场奖励 \+(\d+) 资金 · \+(\d+) 能量$/,(_,c,e)=>'Wave bonus +'+c+' credits · +'+e+' energy'],
 [/^将导入 (\d+) 关战役记录与 (\d+) 张自制地图。此操作会替换当前进度。$/,(_,n,m)=>'Import '+n+' campaign records and '+m+' custom maps. This will replace your current progress.'],
 [/^你的防线坚持到了第 (\d+) 波$/,(_,n)=>'Your defense held until wave '+n],
 [/^(.+) · 你的防线坚持到了第 (\d+) 波$/,(_,name,n)=>translate(name)+' · Your defense held until wave '+n],
 [/^远征 (\d+)\/(\d+)$/,(_,a,b)=>'Expedition '+a+'/'+b],
 [/^剩余 (\d+)$/,(_,n)=>n+' remaining'],
 [/^护盾 (.+)$/,(_,n)=>'Shield '+n],
 [/^坐标 (\d+), (\d+)$/,(_,x,y)=>'Hex '+x+', '+y],
 [/^入口 (\d+)$/,(_,n)=>'Entry '+n],
 [/^连接至 (.+)$/,(_,xy)=>'Linked to '+xy],
 [/^穿越时间 (.+) 秒$/,(_,n)=>'Transit time '+n+' s'],
 [/^(.+)，(\d+)资金$/,(_,name,n)=>translate(name)+', '+n+' credits'],
];
export function getLocale(){return locale;}
export function translate(input){const source=String(input??'');if(locale!=='en'||!/[\u3400-\u9fff]/.test(source))return source;const clean=source.trim();let out=EN[clean];if(out===undefined){for(const[re,fn]of patterns){if(re.test(clean)){out=clean.replace(re,fn);break;}}}if(out===undefined)out=clean.replace(phrasePattern,key=>EN[key]);return source.slice(0,source.length-source.trimStart().length)+out.replace(/，/g,', ').replace(/：/g,': ').replace(/。/g,'. ').replace(/；/g,'; ').replace(/（/g,' (').replace(/）/g,')').replace(/、/g,', ')+source.slice(source.trimEnd().length);}
export const t=translate;
function translateNode(node){const current=node.nodeValue,old=textSources.get(node);const source=old&&current===old.output?old.source:current;const output=translate(source);textSources.set(node,{source,output});if(current!==output)node.nodeValue=output;}
function translateAttrs(node){if(!node.getAttribute)return;let records=attributeSources.get(node);if(!records){records={};attributeSources.set(node,records);}for(const key of ['title','aria-label','placeholder']){const current=node.getAttribute(key);if(current===null)continue;const old=records[key],source=old&&current===old.output?old.source:current,output=translate(source);records[key]={source,output};if(current!==output)node.setAttribute(key,output);}}
export function localizeDOM(root=globalThis.document?.body){if(!root)return;const visit=node=>{if(node.nodeType===3){translateNode(node);return;}if(['SCRIPT','STYLE','INPUT','TEXTAREA','CODE'].includes(node.tagName)){translateAttrs(node);return;}if(node.getAttribute?.('data-no-i18n')!==null&&node.hasAttribute?.('data-no-i18n'))return;translateAttrs(node);for(const child of node.childNodes||node.children||[])visit(child);};visit(root);}
function languageChrome(){const doc=globalThis.document;if(!doc)return;doc.documentElement?.setAttribute('lang',locale==='en'?'en':'zh-CN');doc.title=locale==='en'?'HEXFRONT · Hexagonal Tower Defense':'六域防线 · HEXFRONT';for(const id of ['homeLanguage','languageBtn']){const button=doc.getElementById(id);if(button){button.textContent=locale==='en'?'中文':'EN';button.setAttribute?.('aria-label',locale==='en'?'切换到中文':'Switch to English');}}}
export function setLocale(next){locale=next==='en'?'en':'zh';try{localStorage.setItem(preference,locale);}catch{}localizeDOM();languageChrome();return locale;}
export function initI18n(){languageChrome();localizeDOM();if(typeof MutationObserver!=='undefined'){const observer=new MutationObserver(records=>{const roots=new Set();for(const record of records){if(record.type==='characterData')roots.add(record.target);else if(record.type==='attributes')roots.add(record.target);else for(const n of record.addedNodes)roots.add(n);}for(const root of roots)localizeDOM(root);});observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder']});}}
