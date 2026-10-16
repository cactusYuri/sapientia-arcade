export const TOWER_ART={gun:0,mortar:1,sniper:2,tesla:3,flame:4,frost:5,acid:6,laser:7,radar:8,amp:9,core:10,wall:11};
export const ENEMY_ART={basic:0,fast:1,swarm:2,armor:3,shield:4,healer:5,split:6,stealth:7,tunnel:8,jammer:9,carrier:10,air:11,boss:3,brood:10,twins:4,nexus:9};
export function spriteHTML(type,enemy=false){const i=(enemy?ENEMY_ART:TOWER_ART)[type]??0;return `<i aria-hidden="true" class="sprite${enemy?' enemy-sprite':''}" style="--sx:${i%4/3*100}%;--sy:${Math.floor(i/4)/2*100}%"></i>`;}
