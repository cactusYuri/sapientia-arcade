export const VERSION=1;
export const TOWERS={
 wall:{name:'路障',en:'BARRICADE',cost:12,color:'#7893a5',glyph:'▰',role:'改变路线',desc:'不攻击。阻挡地面敌人，可抵扣费用改建为任意炮塔。',range:0,damage:0,interval:1},
 gun:{name:'速射塔',en:'VULCAN',cost:45,color:'#54dbc0',glyph:'Ⅰ',role:'稳定 · 对空',desc:'高速物理弹幕。便宜而可靠，兼顾造路与补刀。',range:2.4,damage:6,interval:.25,air:true,branches:[['转轮机炮','更密集的火力：射速提高，单发降低。'],['穿甲机枪','忽略 60% 护甲；单发更强。']]},
 mortar:{name:'榴弹塔',en:'HOWITZER',cost:90,color:'#ffb968',glyph:'●',role:'爆炸 · 群伤',desc:'对半径 0.9 格内最多 6 个目标造成物理伤害，存在近身盲区。',range:3,damage:40,interval:1.6,minRange:.8,branches:[['集束炮','爆炸半径 1.4，最多命中 10 个敌人。'],['重型迫击炮','伤害提高 60%，射程增加，射速降低。']]},
 sniper:{name:'狙击塔',en:'RAILGUN',cost:110,color:'#b9a0ff',glyph:'╱',role:'破甲 · 远程',desc:'射程 5 格，忽略 50% 护甲。适合高台和长直线。',range:5,damage:120,interval:3,air:true,pierce:.5,branches:[['轨道贯穿炮','贯穿一条射线，最多命中 4 个目标。'],['处决者','重击残血目标，专门处理精英与首领。']]},
 tesla:{name:'电弧塔',en:'TESLA',cost:100,color:'#69caff',glyph:'ϟ',role:'连锁 · 对空',desc:'能量电弧最多跳跃 4 个敌人，伤害逐次衰减。',range:2.5,damage:24,interval:.8,air:true,energy:true,branches:[['风暴线圈','最多连锁 7 个目标，每跳保留 80% 伤害。'],['电磁抑制器','对护盾造成 2.2 倍伤害，抑制恢复。']]},
 flame:{name:'喷火塔',en:'INCINERATOR',cost:80,color:'#ff8667',glyph:'♨',role:'近程 · 灼烧',desc:'近距离扇形喷射，附加 3 秒灼烧。',range:1.7,damage:32,interval:.15,continuous:true,energy:true,branches:[['焚烧炉','直伤增加 25%，射程增加 0.3 格。'],['凝固燃料','更强、更久的灼烧，直伤略降。']]},
 frost:{name:'冷冻塔',en:'CRYOGEN',cost:70,color:'#8ce2ef',glyph:'❄',role:'减速 · 控制',desc:'命中后减速 30%。给其他炮塔创造更多开火时间。',range:2.6,damage:4,interval:1,energy:true,branches:[['寒霜场','半径 1.1 内最多 6 个敌人减速。'],['深度冻结','减速 45%，连续四次命中短暂冻结。']]},
 acid:{name:'腐蚀塔',en:'CORROSION',cost:95,color:'#b7e76e',glyph:'◒',role:'削甲 · 持续',desc:'每层腐蚀每秒 8 伤害、削甲 8，持续 5 秒，最多 3 层。',range:2.8,damage:12,interval:1,energy:true,branches:[['酸雨发射器','范围腐蚀，同时处理密集装甲。'],['溶甲器','最多 5 层腐蚀，每层削甲 10。']]},
 laser:{name:'激光塔',en:'FOCUS',cost:140,color:'#fb87d5',glyph:'◇',role:'蓄能 · 对空',desc:'持续照射同一目标逐渐增强，换目标后重置。',range:3,damage:42,interval:.12,air:true,continuous:true,energy:true,branches:[['聚变光束','8 秒蓄能至 4 倍伤害。'],['分束阵列','同时照射 3 个目标，每束 55% 伤害。']]},
 radar:{name:'雷达站',en:'RECON',cost:80,color:'#e5d595',glyph:'◎',role:'侦测 · 易伤',desc:'揭露范围内幽影机，使敌人受到伤害增加 8%。',range:3,damage:0,interval:1,support:true,branches:[['广域扫描','范围扩大至 4.5 格，易伤 12%。'],['弱点分析','范围 3.5 格，易伤提高至 18%。']]},
 amp:{name:'增幅站',en:'AMPLIFIER',cost:120,color:'#f3ca6d',glyph:'✧',role:'相邻 · 增幅',desc:'相邻武器塔攻击间隔 ×0.85。同类增幅不叠加。',range:1.05,damage:0,interval:1,support:true,branches:[['区域调度','两圈内武器塔攻击间隔 ×0.88。'],['超频阵列','相邻武器塔攻击间隔 ×0.72。']]}
};
export const ENEMIES={
 basic:{name:'步行机',hp:55,speed:1,reward:5,leak:1,color:'#ed897b',sides:4},
 fast:{name:'疾行者',hp:32,speed:1.8,reward:5,leak:1,color:'#ffe09e',sides:3},
 swarm:{name:'微型蜂群',hp:18,speed:1.3,reward:2,leak:1,color:'#f19aaf',sides:3,small:true},
 armor:{name:'装甲甲虫',hp:200,armor:60,speed:.65,reward:16,leak:2,color:'#c8b0df',sides:6},
 shield:{name:'护盾守卫',hp:100,shield:120,speed:.9,reward:16,leak:2,color:'#68caf2',sides:5},
 healer:{name:'维修机',hp:100,speed:.85,reward:12,leak:1,color:'#b6e68c',sides:4},
 split:{name:'分裂体',hp:140,speed:.9,reward:12,leak:1,color:'#ffad75',sides:6},
 stealth:{name:'幽影机',hp:85,speed:1.2,reward:10,leak:1,color:'#b1b9db',sides:3},
 tunnel:{name:'管道潜行者',hp:170,armor:20,speed:.8,reward:14,leak:2,color:'#dbb084',sides:5},
 jammer:{name:'干扰机',hp:130,speed:.8,reward:15,leak:1,color:'#dc8af4',sides:5},
 carrier:{name:'盾阵运输车',hp:280,armor:30,speed:.6,reward:24,leak:3,color:'#ab99de',sides:6},
 air:{name:'滑翔无人机',hp:60,speed:1.1,reward:9,leak:1,color:'#7ddbda',sides:3,air:true},
 boss:{name:'重装攻城核',hp:900,armor:90,speed:.45,reward:180,leak:10,color:'#ff6e5e',sides:6,boss:true},
 brood:{name:'管网母巢',hp:1300,armor:40,speed:.5,reward:220,leak:10,color:'#efab70',sides:6,boss:true},
 twins:{name:'裂隙双生体',hp:800,armor:30,speed:.65,reward:140,leak:5,color:'#c891ff',sides:4,boss:true},
 nexus:{name:'零号中枢',hp:2200,armor:40,speed:.4,reward:350,leak:10,color:'#ff87bd',sides:6,boss:true}
};
export const TERRAIN={floor:['地板','可造塔或路障'],wall:['设施墙','不可通行、不可建造'],road:['开放走廊','敌人通行，禁止建造'],coolant:['冷却池','通行速度 ×0.75，禁止建造'],high:['高台','建造后射程 +0.6；敌人不可通行'],fast:['加速轨道','通行速度 ×1.6'],power:['配电节点','炮塔攻击间隔 ×0.88；敌人不可通行'],debris:['废墟','支付 35 清理后可以建造'],pipe:['管道入口','自动通过管道，内部不可攻击'],pipeout:['管道出口','显示敌人出管位置'],portal:['空间门 A','同组门每名敌人只触发一次'],portalout:['空间门 B','空间门的接收端'],entry:['敌人入口','出兵位置，不可封堵'],exit:['反应堆','保护核心，阻止敌人抵达'],gate:['分流闸门','准备阶段切换出口方向']};
export const CHAPTERS=['旧设施','管网区','空间站','中枢区'];
export const TITLES=['初次接触','折返走廊','双口汇流','冷却池','中央高台','重装来袭','第一根管道','盲区之后','地下捷径','管口争夺','双层运输','母巢出管','第一次跃迁','门的另一侧','跨区火力','空中警报','双环迷宫','裂隙双生','三面围攻','配电争夺','废墟开路','闸门轮换','最后走廊','零号中枢'];
export const HINTS=['用速射塔和路障延长路线，让敌人在射程里多走几格。','让敌人折返，同一座炮台就能攻击两次。','两个入口可以共用一个火力区，先想好汇流的位置。','冷却池会自然减速，把群伤炮塔放在附近。','高台上的狙击塔可以照顾整片阵地。','装甲需要破甲；为首领卸甲后的冲刺留下后手。','敌人在管道里无法被攻击，请把握出管后的窗口。','管前挂上腐蚀，让持续伤害陪敌人穿过管道。','管道是一条无法封住的捷径，出口阵地很重要。','钱够投资一边时，选好最有价值的管口。','两次出管，两次集火：让火力覆盖重叠。','母巢出管会释放蜂群，给单体主力配上范围塔。','空间门会把两片地图连在一起，点击可看连接。','先后两段路线都能被中央炮台覆盖。','给敌人设计一个跨越空间的回字形。','空军不走地面迷宫，别忘了能对空的炮塔。','绕过墙体，走进门，再回到你的主力射程。','双生体从两个入口出现，共享生命，集中火力也能击破。','三路来敌，集中阵地与分线防守都可以尝试。','配电节点适合昂贵主力，相邻增幅能继续提升输出。','先清理一处废墟，还是先升级？空间也需要投资。','波间点击闸门，选择下一波进入哪个火力区。','可建造区域有限，需要把每一座塔的位置用好。','拆盾、清杂、持续集火，把所有系统连成一道防线。'];
export function healthFactor(w){return 1+.16*(w-1)+.008*(w-1)**2;}
export function unlockedTowers(index,mode){if(mode==='endless'||mode==='challenge'||mode==='editor'||mode==='expedition')return Object.keys(TOWERS);const basic=['wall','gun','mortar','sniper'];if(index>=2)basic.push('frost');if(index>=3)basic.push('tesla');if(index>=4)basic.push('acid');if(index>=6)basic.push('flame');if(index>=8)basic.push('laser');if(index>=10)basic.push('radar');if(index>=12)basic.push('amp');return basic;}
export function waveSpec(index,w,total,mode='campaign'){
 const chapter=Math.floor(index/6), out=[];
 const add=(type,count,entry=0,delay=0,spacing=.7)=>out.push({type,count,entry,delay,spacing});
 if(w===total&&mode!=='endless'){
  const kind=['boss','brood','twins','nexus'][Math.min(3,chapter)];
  if(index%6===5||mode==='expedition'){add(kind,1,0,3);if(kind==='twins')add(kind,1,1,3);add('basic',8+chapter*3,0,0,.65);if(chapter>0)add('swarm',12,1,8,.35);return out;}
 }
 const n=Math.round(7+w*1.0+Math.min(index,20)*.22);
 const entries=index<2?1:index>=18?3:2;
 const ent=(w-1)%entries;
 if(w===1){add('basic',8+chapter*2,0,0,.85);return out;}
 if(w%5===0&&w>=5){add('armor',Math.max(2,Math.floor(n/3)),ent,0,1.25);add(index>=5?'healer':'basic',index>=5?2:4,(ent+1)%entries,3,1.1);}
 else if(w%4===0){add('swarm',n*2,ent,0,.28);if(index>=4)add('split',3+chapter,(ent+1)%entries,4,1.1);}
 else if(w%3===0){add('fast',n,ent,0,.55);if(index>=3)add('shield',3+chapter,(ent+1)%entries,4,1.4);}
 else {add('basic',n,ent,0,.7);if(w>5)add(index>=6?'armor':'fast',4+chapter,(ent+1)%entries,4,.85);}
 if(index>=10&&w%6===0)add('stealth',3+chapter,ent,6,.9);
 if(index>=7&&w%7===0)add('tunnel',4+chapter,ent,3,.8);
 if(index>=15&&w%5===2)add('air',4+chapter,ent,4,1.1);
 if(index>=18&&w%4===1)add('jammer',2,ent,4,2.1);
 if(index>=19&&w%6===2)add('carrier',2,ent,5,2);
 if(mode==='endless'&&w%10===0)add(['boss','brood','nexus'][Math.min(2,Math.floor(w/20))],1,ent,4);
 return out;
}
export function towerStats(t,tile,all=[]){
 const b=TOWERS[t.type];let s={...b,range:b.range,damage:b.damage,interval:b.interval,pierce:b.pierce||0,level:t.level,branch:t.branch};
 if(t.type==='wall')return s;
 if(b.support){if(t.type==='radar'){s.range=t.level===1?3:t.level===2?3.5:t.branch===0?4.5:3.5;s.vuln=t.level===1?.08:t.level===2?.12:t.branch===1?.18:.12;}
 else{s.range=t.level===3&&t.branch===0?2.05:1.05;s.factor=t.level===1?.85:t.level===2?.8:t.branch===0?.88:.72;}return s;}
 const mult=t.level===1?1:t.level===2?1.8:3;s.mult=mult;s.damage*=mult;s.range+=t.level===1?0:t.level===2?.2:.3;if(!b.continuous)s.interval*=t.level===1?1:t.level===2?.9:.8;
 s.maxTargets=6;s.radius=.9;s.slow=.3;s.chain=4;s.decay=.7;s.shieldMult=1;s.acidMax=3;s.acidArmor=8;s.burn=6*mult;s.burnTime=3;
 if(t.level===3){let a=t.branch===0;switch(t.type){case'gun':s.damage*=a?.8:1.25;s.interval*=a?.65:1.15;if(!a)s.pierce=.6;break;case'mortar':if(a){s.radius=1.4;s.maxTargets=10;s.damage*=.8;}else{s.damage*=1.6;s.interval*=1.35;s.range+=1;}break;case'sniper':if(!a){s.damage*=1.4;s.interval*=1.25;s.execute=true;}else s.rail=true;break;case'tesla':s.chain=a?7:3;s.decay=a?.8:.7;if(a)s.damage*=.85;else s.shieldMult=2.2;break;case'flame':if(a){s.damage*=1.25;s.range+=.3;}else{s.damage*=.7;s.burn*=2;s.burnTime=5;}break;case'frost':if(a){s.radius=1.1;s.damage*=.5;s.aoe=true;}else{s.slow=.45;s.freeze=true;}break;case'acid':if(a){s.radius=1.1;s.damage*=.75;s.aoe=true;}else{s.acidMax=5;s.acidArmor=10;}break;case'laser':s.splitBeam=!a;s.maxCharge=a?4:2.333;s.chargeTime=a?8:4;break;}}
 if(tile?.type==='high')s.range+=.6;
 if(tile?.type==='power'){if(b.continuous)s.damage/=.88;else s.interval*=.88;}
 return s;
}
export function upgradeCost(t){if(t.type==='wall')return 0;if(t.type==='radar')return t.level===1?70:130;if(t.type==='amp')return t.level===1?110:200;return Math.round(TOWERS[t.type].cost*(t.level===1?.9:1.6));}
