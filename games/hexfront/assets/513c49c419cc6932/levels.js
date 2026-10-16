import {BLUEPRINTS} from './map-assets.js';
import {TITLES,HINTS,CHAPTERS} from './content.js';
const layouts=[0,0,1,1,1,1,2,2,3,2,3,3,4,5,5,6,5,6,6,7,7,1,7,7];
function clone(v){return JSON.parse(JSON.stringify(v));}
export const LEVELS=TITLES.map((name,i)=>{
 let m=clone(BLUEPRINTS[layouts[i]]);m.name=name;m.id='mission-'+(i+1);m.hint=HINTS[i];m.chapter=CHAPTERS[Math.floor(i/6)];m.waveCount=i===0?6:i===1?8:i<4?10:i%6===5?14+Math.floor(i/6)*2:12+Math.floor(i/6)*2;m.initialGold=i===0?220:i<6?260:i<12?300:i<18?340:380;
 if(i%2){let flip=([c,r])=>[c,m.height-1-r];for(let k of ['walls','coolant','high','fast','road','debris','power','entries'])m[k]=(m[k]||[]).map(flip);m.exit=flip(m.exit);for(let l of m.links||[]){l.from=flip(l.from);l.to=flip(l.to);}}
 const used=new Set([...['walls','coolant','high','fast','road','debris','power','entries'].flatMap(k=>m[k]||[]),m.exit,...(m.links||[]).flatMap(l=>[l.from,l.to])].map(p=>p.join(',')));
 if(i>=4){const extra=[3,Math.floor(m.height/2)];if(!used.has(extra.join(','))){m.high.push(extra);used.add(extra.join(','));}}
 if(i>=18){let third=[0,Math.floor(m.height/2)];if(!used.has(third.join(','))){m.entries.push(third);used.add(third.join(','));}}
 if(i===21){m.gates=[{at:[8,4],options:[[9,4],[8,3]]}];for(let k of ['walls','coolant','high','fast','road','debris','power'])m[k]=(m[k]||[]).filter(p=>p.join(',')!=='8,4');}
 return m;
});
export function blankMap(){return{name:'我的试验场',id:'custom',chapter:'地图工坊',hint:'放置地形、入口和核心，然后测试你的防线。',width:13,height:9,entries:[[0,4]],exit:[12,4],walls:[],coolant:[],high:[],fast:[],road:[],debris:[],power:[],links:[],initialGold:350,waveCount:12};}
