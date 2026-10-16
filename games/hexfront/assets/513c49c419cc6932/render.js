import {TOWERS,ENEMIES,towerStats} from './content.js';
import {TOWER_ART,ENEMY_ART} from './art.js';
import {t,getLocale} from './i18n.js';
const TAU=Math.PI*2;
export class BoardRenderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.width=0;this.height=0;this.scale=40;this.zoom=1;this.pan={x:0,y:0};this.transform={x:0,y:0};this.dpr=1;this.tilt=.78;this.lastTime=0;this.images={};this.feedback=[];this.shake=0;if(typeof Image!=='undefined'){for(const key of ['towers','enemies']){const img=new Image();const url='/art/'+key+'.webp';img.onload=()=>this.images[key]=img;img.src=globalThis.HEXFRONT_ASSETS?.[url]||new URL('.'+url,import.meta.url).href;}}new ResizeObserver(()=>this.resize()).observe(canvas);this.resize();}
 resize(){let b=this.canvas.getBoundingClientRect();this.width=b.width;this.height=b.height;this.dpr=Math.min(devicePixelRatio||1,2);const width=Math.round(b.width*this.dpr),height=Math.round(b.height*this.dpr);if(this.canvas.width!==width)this.canvas.width=width;if(this.canvas.height!==height)this.canvas.height=height;}
 fit(map){const compact=this.height<520&&this.width>this.height,small=this.width<=1050;const top=compact?82:small?176:118,bottom=compact?117:small?218:214;const area=Math.max(125,this.height-top-bottom);this.scale=Math.min((this.width-85)/(map.width+.5),area/((map.height-1)*.866*this.tilt+1.65))*this.zoom;this.transform.x=(this.width-(map.width-.5)*this.scale)/2+this.pan.x;this.transform.y=top+(area-(map.height-1)*.866*this.tilt*this.scale)/2+this.pan.y;}
 reject(cell,map){if(cell===null||cell===undefined||!map.cells[cell])return;const t=map.cells[cell];this.feedback.push({kind:'reject',x:t.x,y:t.y,color:'#ff7968',life:.45,maxLife:.45,r:.65});}
 sprite(atlas,index,x,y,size){const img=this.images[atlas];if(!img)return false;const w=img.width/4,h=img.height/3;this.ctx.drawImage(img,index%4*w,Math.floor(index/4)*h,w,h,x-size/2,y-size/2,size,size);return true;}
 screen(x,y){return{x:this.transform.x+x*this.scale,y:this.transform.y+y*this.scale*this.tilt};}
 point(x,y){return{x:(x-this.transform.x)/this.scale,y:(y-this.transform.y)/(this.scale*this.tilt)};}
 cellAt(x,y,map){let p=this.point(x,y),best=null,d=.59;for(let t of map.cells){let n=Math.hypot(t.x-p.x,t.y-p.y);if(n<d){d=n;best=t;}}return best?best.r*map.width+best.c:null;}
 reset(){this.zoom=1;this.pan={x:0,y:0};}
 hex(x,y,r){const c=this.ctx;c.beginPath();for(let i=0;i<6;i++){let a=Math.PI/6+i*Math.PI/3,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*this.tilt;if(i===0)c.moveTo(px,py);else c.lineTo(px,py);}c.closePath();}
 polygon(x,y,r,n,angle=0){let c=this.ctx;c.beginPath();for(let i=0;i<n;i++){let a=angle+i*TAU/n;if(!i)c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);else c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();}
 render(game,ui,now){if(!game||!this.width)return;this.fit(game.map);let c=this.ctx,S=this.scale;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.width,this.height);c.lineCap='round';c.lineJoin='round';const dt=Math.min(.1,Math.max(0,now-this.lastTime));this.lastTime=now;if(this.shake>0){this.shake=Math.max(0,this.shake-dt);c.translate(Math.sin(now*91)*this.shake*7,Math.cos(now*77)*this.shake*5);}
 c.fillStyle='#7aacbd';for(let i=0;i<48;i++){let x=(i*139.37+73)%this.width,y=(i*i*79.63+45)%this.height;c.globalAlpha=.055+.025*Math.sin(now+i);c.fillRect(x,y,1,1);}c.globalAlpha=1;
 // Deep platform shadows make the hex field read as a physical structure.
 for(let t of game.map.cells){let p=this.screen(t.x,t.y);this.hex(p.x+2,p.y+S*.18,S*.575);c.fillStyle='#02080fc7';c.fill();}
 for(let t of game.map.cells){let p=this.screen(t.x,t.y);this.tile(t,p,S,now,game);}
 const routes=ui.previewRoutes||game.routes;if(ui.showRoutes&&routes){for(let r=0;r<routes.length;r++){let path=routes[r];if(!path)continue;this.path(path,game.map,r,now,ui.previewRoutes?'#e6c88d':null);}}
 if(ui.showLinks)for(let tile of game.map.cells)if(tile.link){let p=this.screen(tile.x,tile.y),end=game.map.cells[tile.link.to[1]*game.map.width+tile.link.to[0]],q=this.screen(end.x,end.y);c.save();c.strokeStyle=tile.link.type==='portal'?'#b195f477':'#dcb47966';c.lineWidth=1.5;c.setLineDash([3,5]);c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo((p.x+q.x)/2,(p.y+q.y)/2-S*1.5,q.x,q.y);c.stroke();c.restore();}
 let selected=game.towers.find(t=>t.id===ui.selectedTower);let rangeTower=selected||(ui.buildType&&ui.hoverCell!==null?{type:ui.buildType,level:1,cell:ui.hoverCell}:null);
 if(rangeTower&&TOWERS[rangeTower.type].range){let tile=game.map.cells[rangeTower.cell],p=this.screen(tile.x,tile.y),s=towerStats(rangeTower,tile);c.save();c.beginPath();c.ellipse(p.x,p.y,s.range*S,s.range*S*this.tilt,0,0,TAU);c.fillStyle=TOWERS[rangeTower.type].color+'09';c.fill();c.setLineDash([4,5]);c.strokeStyle=TOWERS[rangeTower.type].color+'65';c.lineWidth=1;c.stroke();c.restore();}
 const coreTile=game.map.cells[game.map.exit[1]*game.map.width+game.map.exit[0]];
 const pieces=[...game.towers.map(t=>({kind:'tower',item:t,y:game.map.cells[t.cell].y})),...game.enemies.filter(e=>!e.dead).map(e=>({kind:'enemy',item:e,y:e.y})),{kind:'core',y:coreTile.y}].sort((a,b)=>a.y-b.y);
 for(const piece of pieces){if(piece.kind==='tower'){let t=piece.item,tile=game.map.cells[t.cell];this.tower(t,this.screen(tile.x,tile.y),S,t.id===ui.selectedTower,now);}else if(piece.kind==='enemy')this.enemy(piece.item,S,now,game);else{const p=this.screen(coreTile.x,coreTile.y);c.save();c.shadowColor='#71ffd0';c.shadowBlur=S*.3;this.sprite('towers',TOWER_ART.core,p.x,p.y-S*.13,S*1.55);c.restore();}}
 if(ui.hoverCell!==null&&ui.hoverCell!==undefined){let tile=game.map.cells[ui.hoverCell];if(tile){let p=this.screen(tile.x,tile.y);c.save();this.hex(p.x,p.y,S*.56);c.strokeStyle=ui.previewInvalid?'#f49382':'#a0ddca';c.fillStyle=ui.previewInvalid?'#f4938222':'#a0ddca18';c.lineWidth=1.5;c.fill();c.stroke();if(ui.buildType&&!game.towers.some(t=>t.cell===ui.hoverCell)&&['floor','high','power'].includes(tile.type)){c.globalAlpha=.55;this.tower({type:ui.buildType,level:1,angle:-Math.PI/2},p,S,false,now);}c.restore();}}
 
 for(let fx of game.effects)this.effect(fx,S,now);this.feedback=this.feedback.filter(f=>(f.life-=dt)>0);for(let fx of this.feedback)this.effect(fx,S,now);
 let core=game.map.cells[game.map.exit[1]*game.map.width+game.map.exit[0]],cp=this.screen(core.x,core.y);c.save();c.globalAlpha=.15+.07*Math.sin(now*2);c.strokeStyle='#88eaca';c.lineWidth=1;c.beginPath();c.arc(cp.x,cp.y,S*(.64+.04*Math.sin(now)),0,TAU);c.stroke();c.restore();
 if(ui.pulseMode&&ui.pointer){let p=ui.pointer;c.save();c.strokeStyle='#a5e9f4';c.fillStyle='#a5e9f414';c.lineWidth=1.5;c.beginPath();c.ellipse(p.x,p.y,2*S,2*S*this.tilt,0,0,TAU);c.fill();c.stroke();c.restore();}
 if(game.paused&&game.status==='wave'){c.fillStyle='#0d182566';c.fillRect(0,0,this.width,this.height);c.textAlign='center';c.fillStyle='#d6eae7';c.font='600 24px Oxanium, HexCJK, sans-serif';c.fillText(t('战斗暂停'),this.width/2,this.height/2);c.font='500 14px Rajdhani, HexCJK, sans-serif';c.fillStyle='#99b5bb';c.fillText(t('可继续升级炮塔 · 空格继续'),this.width/2,this.height/2+28);}
 }
 tile(t,p,S,time,game){let c=this.ctx,x=p.x,y=p.y,fill='#192a34',stroke='#304550';if(t.type==='wall'){fill='#263842';stroke='#3b515b';}if(t.type==='high'){fill='#33424e';stroke='#6a7f8b';}if(t.type==='coolant'){fill='#1b3934';stroke='#3d6557';}if(t.type==='fast'){fill='#3b3026';stroke='#65503a';}if(t.type==='road'){fill='#1f3039';stroke='#354b57';}if(t.type==='power'){fill='#3e3826';stroke='#796a42';}if(t.type==='debris'){fill='#2a2b29';stroke='#4c4b40';}if(t.type==='entry'){fill='#413128';stroke='#c88e66';}if(t.type==='exit'){fill='#214238';stroke='#78d7b5';}if(t.type.startsWith('pipe')){fill='#382e26';stroke='#a7825f';}if(t.type.startsWith('portal')){fill='#312b46';stroke='#8973b6';}if(t.type==='gate'){fill='#293a42';stroke='#91afbd';}
 const height=t.type==='wall'?S*.095:t.type==='high'?S*.055:S*.025;
 this.hex(x,y+S*.065,S*.551);c.fillStyle='#0a1822';c.fill();c.strokeStyle='#0a151d';c.lineWidth=1.2;c.stroke();
 let gradient=c.createLinearGradient(x-S*.45,y-S*.5,x+S*.4,y+S*.5);gradient.addColorStop(0,fill);gradient.addColorStop(1,'#101c26');this.hex(x,y-height,S*.544);c.fillStyle=gradient;c.fill();c.strokeStyle=stroke;c.lineWidth=1;c.stroke();
 // Lit upper rim and two recessed fasteners per tile.
 c.beginPath();c.moveTo(x-S*.47,y-height-S*.27*this.tilt);c.lineTo(x,y-height-S*.542*this.tilt);c.lineTo(x+S*.47,y-height-S*.27*this.tilt);c.strokeStyle=t.type==='wall'?'#91a9b442':'#92b4bd22';c.lineWidth=1;c.stroke();
 if(['floor','road','high'].includes(t.type)){c.fillStyle='#82a8ac32';for(const side of [-1,1]){c.beginPath();c.arc(x+side*S*.32,y-height+S*.18,Math.max(.7,S*.018),0,TAU);c.fill();}c.strokeStyle='#71949b11';c.beginPath();c.moveTo(x-S*.25,y-height-S*.23);c.lineTo(x+S*.23,y-height-S*.23);c.stroke();}

 if(t.type==='wall'){
 const h=S*.16;this.hex(x,y-h,S*.43);const g=c.createLinearGradient(x,y-S*.6,x,y+S*.2);g.addColorStop(0,'#536471');g.addColorStop(1,'#263643');c.fillStyle=g;c.fill();c.strokeStyle='#768f9966';c.lineWidth=1;c.stroke();
 c.fillStyle='#182a37';c.beginPath();c.moveTo(x-S*.372,y-h+S*.215*this.tilt);c.lineTo(x,y-h+S*.43*this.tilt);c.lineTo(x+S*.372,y-h+S*.215*this.tilt);c.lineTo(x+S*.372,y+S*.26);c.lineTo(x,y+S*.48);c.lineTo(x-S*.372,y+S*.26);c.closePath();c.fill();
 this.hex(x,y-h,S*.29);c.strokeStyle='#20313d';c.lineWidth=2;c.stroke();c.fillStyle='#7b908f44';c.fillRect(x-S*.11,y-h-S*.06,S*.22,S*.12);
 c.fillStyle='#88a5a766';for(let d of [-1,1])c.fillRect(x+d*S*.25-S*.025,y-h-S*.14,S*.05,S*.04);
 }
 if(t.type==='coolant'){this.hex(x,y,S*.45);c.fillStyle='#5dda8c12';c.fill();c.strokeStyle='#558d7155';c.lineWidth=1;for(let k=0;k<3;k++){c.beginPath();let yy=y+(k-1)*S*.17;for(let j=0;j<7;j++){let xx=x-S*.27+j*S*.09,dy=Math.sin(j*.8+time*.7+k)*S*.025;if(j)c.lineTo(xx,yy+dy);else c.moveTo(xx,yy+dy);}c.stroke();}}
 if(t.type==='high'){this.hex(x,y-2,S*.39);c.strokeStyle='#9bb1bc55';c.stroke();c.fillStyle='#92a7b2';c.font=`${Math.max(10,S*.24)}px sans-serif`;c.textAlign='center';c.fillText('Ⅱ',x,y+S*.08);}
 if(t.type==='fast'){c.strokeStyle='#d6a36780';c.lineWidth=1.5;for(let k=-1;k<2;k++){let xx=x+k*S*.19;c.beginPath();c.moveTo(xx-S*.06,y-S*.12);c.lineTo(xx+S*.05,y);c.lineTo(xx-S*.06,y+S*.12);c.stroke();}}
 if(t.type==='power'){c.fillStyle='#dbbf73';c.font=`${S*.5}px sans-serif`;c.textAlign='center';c.fillText('ϟ',x,y+S*.18);}
 if(t.type==='debris'){c.strokeStyle='#99947d';c.lineWidth=2;c.beginPath();c.moveTo(x-S*.18,y-S*.12);c.lineTo(x+S*.13,y+S*.17);c.moveTo(x+S*.18,y-S*.13);c.lineTo(x-S*.14,y+S*.18);c.stroke();}
 if(t.type==='entry'){c.save();c.translate(x,y);c.strokeStyle='#f2b289';c.lineWidth=1.7;this.polygon(0,0,S*.22,3,0);c.stroke();c.restore();c.font=`600 ${Math.max(8,S*.17)}px sans-serif`;c.fillStyle='#dba07b';c.textAlign='center';c.fillText('IN',x,y+S*.38);}
 if(t.type==='exit'){this.hex(x,y,S*.31);c.strokeStyle='#87e5bd';c.fillStyle='#315e4b';c.lineWidth=1.5;c.fill();c.stroke();this.hex(x,y,S*.15);c.fillStyle='#b9f8d5';c.fill();}
 if(t.type.startsWith('pipe')){c.save();c.strokeStyle='#17232c';c.lineWidth=S*.14;c.beginPath();c.arc(x,y,S*.29,0,TAU);c.stroke();c.strokeStyle='#c9a67e';c.lineWidth=Math.max(2,S*.07);c.beginPath();c.arc(x,y,S*.24,0,TAU);c.stroke();c.lineWidth=1;c.strokeStyle='#80664e';c.beginPath();c.arc(x,y,S*.34,0,TAU);c.stroke();c.fillStyle='#1c2225';c.beginPath();c.arc(x,y,S*.15,0,TAU);c.fill();c.font=`600 ${Math.max(9,S*.19)}px sans-serif`;c.fillStyle='#d5b492';c.textAlign='center';c.fillText(t.type==='pipe'?'IN':'OUT',x,y+S*.42);c.restore();}
 if(t.type.startsWith('portal')){c.save();let halo=c.createRadialGradient(x,y,0,x,y,S*.52);halo.addColorStop(0,'#d59bff50');halo.addColorStop(1,'#b072ff00');c.fillStyle=halo;c.fillRect(x-S*.55,y-S*.55,S*1.1,S*1.1);c.shadowBlur=S*.12;c.shadowColor='#bb8aff';c.translate(x,y);c.rotate(time*.35*(t.type==='portal'?1:-1));for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,S*.29,i*TAU/3,i*TAU/3+1.35);c.strokeStyle='#b498e4';c.lineWidth=2;c.stroke();}c.rotate(-time*.35*(t.type==='portal'?1:-1));c.font=`500 ${S*.25}px sans-serif`;c.textAlign='center';c.fillStyle='#d0b5fb';c.fillText(String.fromCharCode(65+(t.link?.group??t.group??0)),0,S*.09);c.restore();}
 if(t.type==='gate'){c.save();c.translate(x,y);c.rotate(t.gateChoice?-Math.PI/3:0);c.strokeStyle='#b6d5df';c.lineWidth=2;c.beginPath();c.moveTo(-S*.22,0);c.lineTo(S*.22,0);c.moveTo(S*.08,-S*.11);c.lineTo(S*.22,0);c.lineTo(S*.08,S*.11);c.stroke();c.restore();}
 }
 path(path,map,index,time,override){let c=this.ctx,S=this.scale;c.save();c.strokeStyle=override||['#9fe2c35c','#e9bd8459','#b3b6e659'][index%3];c.lineWidth=2;c.setLineDash([3,7]);c.lineDashOffset=-time*8;c.beginPath();for(let j=0;j<path.length;j++){let t=map.cells[path[j].i],p=this.screen(t.x,t.y);if(j===0||['pipe','portal'].includes(path[j].kind))c.moveTo(p.x,p.y);else c.lineTo(p.x,p.y);}c.stroke();c.setLineDash([]);if(path.length>3){for(let j=3;j<path.length;j+=5){if(path[j].kind!=='walk')continue;let a=map.cells[path[j-1].i],b=map.cells[path[j].i],p=this.screen((a.x+b.x)/2,(a.y+b.y)/2);c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(b.y-a.y,b.x-a.x));c.beginPath();c.moveTo(-3,-3);c.lineTo(1,0);c.lineTo(-3,3);c.stroke();c.restore();}}c.restore();}
 tower(t,p,S,selected,time){let c=this.ctx,b=TOWERS[t.type];c.save();
 if(this.images.towers){
 c.fillStyle='#020b14aa';c.beginPath();c.ellipse(p.x+S*.08,p.y+S*.14,S*.39,S*.2,0,0,TAU);c.fill();
 if(selected){this.hex(p.x,p.y,S*.53);c.strokeStyle=b.color;c.lineWidth=2;c.shadowBlur=10;c.shadowColor=b.color;c.stroke();c.shadowBlur=0;}
 const firing=t.cooldown>0&&t.target,angle=t.angle||0,recoil=firing?Math.sin(Math.min(.15,t.cooldown)*20)*S*.013:0;
 this.sprite('towers',TOWER_ART[t.type],p.x-Math.cos(angle)*recoil,p.y-S*.16-Math.sin(angle)*recoil,S*(t.type==='wall'?1.05:1.29));
 if(t.type!=='wall'){
  if(t.level>1){for(let k=0;k<t.level;k++){c.fillStyle='#09212b';c.fillRect(p.x+(k-(t.level-1)/2)*S*.105-S*.04,p.y+S*.34,S*.08,S*.065);c.fillStyle=b.color;c.fillRect(p.x+(k-(t.level-1)/2)*S*.105-S*.025,p.y+S*.355,S*.05,S*.025);}}
  if(t.level===3){c.font=`bold ${Math.max(8,S*.18)}px sans-serif`;c.textAlign='center';c.fillStyle='#e2d6a9';c.strokeStyle='#101e27';c.lineWidth=3;c.strokeText(t.branch===0?'A':'B',p.x+S*.3,p.y-S*.32);c.fillText(t.branch===0?'A':'B',p.x+S*.3,p.y-S*.32);}
  if(selected||firing){c.globalAlpha=selected?.8:.35;c.beginPath();c.arc(p.x,p.y,S*.42,angle-.2,angle+.2);c.strokeStyle=b.color;c.lineWidth=2;c.stroke();}
 }
 c.restore();return;
 }
if(t.type==='wall'){this.hex(p.x,p.y,S*.41);c.fillStyle='#455761';c.fill();c.lineWidth=1;c.strokeStyle='#6c7e88';c.stroke();c.fillStyle='#8798a1';c.fillRect(p.x-S*.19,p.y-S*.06,S*.38,S*.12);c.restore();return;}
 this.hex(p.x,p.y+S*.045,S*.405);c.fillStyle='#0d1a21';c.fill();c.lineWidth=1.2;c.strokeStyle=selected?b.color:'#415b66';c.stroke();this.hex(p.x,p.y,S*.32);c.fillStyle=b.color+'26';c.fill();c.strokeStyle=b.color+'99';c.lineWidth=1;c.stroke();c.translate(p.x,p.y);c.rotate(t.angle||0);c.strokeStyle=b.color;c.fillStyle=b.color;c.lineWidth=S*.09;
 if(t.type==='gun'){c.fillRect(-S*.07,-S*.11,S*.28,S*.07);c.fillRect(-S*.07,S*.04,S*.28,S*.07);c.fillStyle='#d2f3df';c.fillRect(-S*.12,-S*.11,S*.1,S*.22);}
 if(t.type==='mortar'){c.fillRect(-S*.07,-S*.085,S*.31,S*.17);c.beginPath();c.arc(0,0,S*.16,0,TAU);c.fill();c.fillStyle='#273c3d';c.fillRect(S*.11,-S*.05,S*.16,S*.1);}
 if(t.type==='sniper'){c.lineWidth=S*.07;c.beginPath();c.moveTo(-S*.12,0);c.lineTo(S*.38,0);c.stroke();c.lineWidth=S*.13;c.beginPath();c.moveTo(-S*.12,0);c.lineTo(S*.06,0);c.stroke();}
 if(t.type==='tesla'){c.rotate(-(t.angle||0));c.lineWidth=S*.045;c.beginPath();c.arc(0,0,S*.18,0,TAU);c.stroke();c.beginPath();c.moveTo(S*.08,-S*.24);c.lineTo(-S*.1,0);c.lineTo(S*.08,0);c.lineTo(-S*.06,S*.23);c.stroke();}
 if(t.type==='flame'){c.beginPath();c.moveTo(-S*.15,-S*.13);c.lineTo(S*.21,-S*.07);c.lineTo(S*.26,0);c.lineTo(S*.21,S*.07);c.lineTo(-S*.15,S*.13);c.closePath();c.fill();}
 if(t.type==='frost'){c.rotate(-(t.angle||0));c.lineWidth=S*.04;for(let i=0;i<6;i++){c.rotate(TAU/6);c.beginPath();c.moveTo(0,0);c.lineTo(S*.22,0);c.moveTo(S*.13,0);c.lineTo(S*.18,-S*.065);c.moveTo(S*.13,0);c.lineTo(S*.18,S*.065);c.stroke();}}
 if(t.type==='acid'){c.beginPath();c.arc(-S*.04,0,S*.17,0,TAU);c.fill();c.fillRect(0,-S*.055,S*.26,S*.11);c.fillStyle='#283d27';c.beginPath();c.arc(-S*.04,0,S*.08,0,TAU);c.fill();}
 if(t.type==='laser'){this.polygon(0,0,S*.22,4,0);c.stroke();c.lineWidth=S*.035;c.beginPath();c.moveTo(0,0);c.lineTo(S*.36,0);c.stroke();c.beginPath();c.arc(0,0,S*.07,0,TAU);c.fill();}
 if(t.type==='radar'){c.rotate(time*.5);c.lineWidth=S*.035;for(let r of [.11,.22]){c.beginPath();c.arc(0,0,S*r,0,TAU);c.stroke();}c.beginPath();c.moveTo(0,0);c.lineTo(S*.24,0);c.stroke();}
 if(t.type==='amp'){this.polygon(0,0,S*.23,4,Math.PI/4);c.stroke();c.beginPath();c.arc(0,0,S*.075,0,TAU);c.fill();}
 c.restore();if(t.level>1){c.save();for(let j=0;j<t.level;j++){c.fillStyle=b.color;c.fillRect(p.x+(j-(t.level-1)/2)*S*.11-S*.025,p.y+S*.30,S*.055,S*.045);}if(t.level===3){c.font=`bold ${Math.max(8,S*.15)}px sans-serif`;c.fillStyle=b.color;c.textAlign='center';c.fillText(t.branch===0?'A':'B',p.x+S*.25,p.y-S*.24);}c.restore();}
 }
 enemy(e,S,time,game){let c=this.ctx,b=ENEMIES[e.type],p=this.screen(e.x,e.y);if(e.hidden){c.save();c.globalAlpha=.7;c.fillStyle=b.color;c.beginPath();c.arc(p.x,p.y,2,0,TAU);c.fill();c.restore();return;}let size=S*(b.boss?.5:b.small?.15:.26);c.save();if(e.type==='stealth'&&e.revealUntil<=game.time)c.globalAlpha=.32;
 c.fillStyle='#01091199';c.beginPath();c.ellipse(p.x+S*.035,p.y+size*.6,size*.84,size*.38,0,0,TAU);c.fill();
 if(e.shield>0){let g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,size*1.5);g.addColorStop(0,'#75cbff08');g.addColorStop(.8,'#85caff18');g.addColorStop(1,'#a5eaff60');c.fillStyle=g;c.strokeStyle='#93dfff80';c.lineWidth=1.2;c.beginPath();c.ellipse(p.x,p.y-size*.25,size*1.15,size*1.3,0,0,TAU);c.fill();c.stroke();}
 if(e.boss){c.save();c.globalAlpha=.3+.12*Math.sin(time*4);c.strokeStyle='#ff9c73';c.lineWidth=2;this.hex(p.x,p.y,size*1.3);c.stroke();c.restore();}
 const bob=Math.sin(time*(e.air?4:10)+e.id*1.7)*S*(e.air?.045:.012);
 if(!this.sprite('enemies',ENEMY_ART[e.type],p.x,p.y-size*.28+bob,size*3.05)){this.polygon(p.x,p.y,size,b.sides||4,time*.25);c.fillStyle=b.color;c.fill();}
 if(e.frozenUntil>game.time){this.hex(p.x,p.y,size*1.8);c.strokeStyle='#b8f3ff';c.stroke();}if(e.acid?.length){c.fillStyle='#bde276';c.beginPath();c.arc(p.x+size,p.y+size,2,0,TAU);c.fill();}if(e.burnUntil>game.time){c.strokeStyle='#ff9e64';c.beginPath();c.arc(p.x,p.y,size+3,-1,1.3);c.stroke();}if(e.hp<e.maxHp||e.boss){let w=e.boss?S*.8:S*.45,h=3;c.fillStyle='#07151bc9';c.fillRect(p.x-w/2,p.y-size-8,w,h);c.fillStyle=e.hp/e.maxHp<.3?'#ff8577':'#cfe2d7';c.fillRect(p.x-w/2,p.y-size-8,w*Math.max(0,e.hp/e.maxHp),h);}c.restore();}
 effect(f,S,time){let c=this.ctx,p=this.screen(f.x,f.y),a=Math.max(0,f.life/f.maxLife),r=(f.r||.4)*S;c.save();c.globalAlpha=a;c.strokeStyle=f.color;c.fillStyle=f.color;c.lineWidth=1.5;
 if(['shot','beam','arc'].includes(f.kind)){let q=this.screen(f.tx,f.ty);p.y-=S*.14;q.y-=S*.1;c.lineWidth=Math.max(1.2,(f.width||.035)*S);c.shadowColor=f.color;c.shadowBlur=f.kind==='shot'?5:10;
 c.beginPath();c.moveTo(p.x,p.y);if(f.kind==='arc'){for(let i=1;i<7;i++){let k=i/7;c.lineTo(p.x+(q.x-p.x)*k+Math.sin(i*4.2+f.x+f.life*25)*S*.11,p.y+(q.y-p.y)*k+Math.cos(i*3.7+f.y+f.life*25)*S*.11);}}c.lineTo(q.x,q.y);c.stroke();
 c.strokeStyle='#fff4d9';c.lineWidth=Math.max(.7,c.lineWidth*.25);c.stroke();c.shadowBlur=0;
 if(f.kind==='shot'){const u=1-a,tx=p.x+(q.x-p.x)*u,ty=p.y+(q.y-p.y)*u;c.beginPath();c.arc(tx,ty,S*.055,0,TAU);c.fillStyle='#ffeab5';c.fill();}
 c.globalAlpha=a*.7;c.beginPath();c.arc(p.x,p.y,S*.11*a,0,TAU);c.fillStyle='#fff0bb';c.fill();
 c.globalAlpha=a*.8;c.beginPath();c.arc(q.x,q.y,S*.12*(1.2-a),0,TAU);c.strokeStyle=f.color;c.lineWidth=1.8;c.stroke();
 }
 else if(f.kind==='flame'){c.translate(p.x,p.y-S*.1);c.rotate(f.angle);let g=c.createRadialGradient(0,0,0,r*.65,0,r*.6);g.addColorStop(0,'#ffebadbb');g.addColorStop(.45,'#ff974588');g.addColorStop(1,'#ff582000');c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.arc(0,0,r,-.55,.55);c.closePath();c.fill();for(let i=0;i<9;i++){let d=((i*.137+1-a)%1)*r,dy=Math.sin(i*13.1)*d*.3;c.globalAlpha=a*(1-d/r);c.fillStyle=i%2?'#ffe3a0':'#ffaf5d';c.beginPath();c.arc(d,dy,S*.025+S*.03*(1-a),0,TAU);c.fill();}}
 else if(f.kind==='burst'||f.kind==='explosion'){
 const explosion=f.kind==='explosion';const spread=r*(1-a*.7);let glow=c.createRadialGradient(p.x,p.y,0,p.x,p.y,spread);glow.addColorStop(0,explosion?'#ffe3a0a0':'#fff2cc88');glow.addColorStop(.3,f.color+'60');glow.addColorStop(1,f.color+'00');c.fillStyle=glow;c.fillRect(p.x-spread,p.y-spread,spread*2,spread*2);
 for(let i=0;i<(explosion?13:8);i++){let ang=i*2.399,rr=spread*(.5+(i%3)*.25),x=p.x+Math.cos(ang)*rr,y=p.y+Math.sin(ang)*rr+(1-a)*(1-a)*S*.14;c.strokeStyle=i%3?'#f3c289':f.color;c.lineWidth=i%3?1.5:2.3;c.beginPath();c.moveTo(x-Math.cos(ang)*S*.045*a,y-Math.sin(ang)*S*.045*a);c.lineTo(x,y);c.stroke();}
 if(explosion){c.globalAlpha=a*.65;c.strokeStyle='#fff2c9';c.lineWidth=S*.04*a;c.beginPath();c.ellipse(p.x,p.y,spread,spread*.75,0,0,TAU);c.stroke();}
 }
 else if(f.kind==='credits'){c.globalAlpha=a;c.font=`600 ${Math.max(10,S*.22)}px sans-serif`;c.textAlign='center';c.fillStyle='#f6d793';c.strokeStyle='#112430';c.lineWidth=3;const y=p.y-S*(.15+(1-a)*.65);c.strokeText('+'+f.amount,p.x,y);c.fillText('+'+f.amount,p.x,y);}
 else if(f.kind==='build'||f.kind==='reject'){this.hex(p.x,p.y,r*(1.15-a*.3));c.lineWidth=2;c.stroke();c.globalAlpha=a*.1;c.fill();if(f.kind==='build'){for(let i=0;i<6;i++){let angle=i*TAU/6;c.globalAlpha=a*.6;c.fillStyle='#dfffc9';c.fillRect(p.x+Math.cos(angle)*r*.7,p.y+Math.sin(angle)*r*.7-S*(1-a)*.6,2,S*.08);}}}
 else{c.beginPath();c.ellipse(p.x,p.y,r*(1-a*.65),r*(1-a*.65)*this.tilt,0,0,TAU);c.shadowColor=f.color;c.shadowBlur=12;c.lineWidth=f.kind==='pulse'?S*.04:2;c.stroke();c.globalAlpha=a*.06;c.fill();if(f.kind==='pulse'){c.globalAlpha=a*.35;c.beginPath();c.ellipse(p.x,p.y,r*(1-a*.85),r*(1-a*.85)*this.tilt,0,0,TAU);c.stroke();}}
 c.restore();}
}
