// Small synthesized sound bank. No downloads, music loops or autoplay required.
export class SoundBank{
 constructor(){this.context=null;this.last={};this.enabled=true;}
 unlock(){if(!this.enabled)return;try{this.context??=new(window.AudioContext||window.webkitAudioContext)();if(this.context.state==='suspended')this.context.resume().catch(()=>{});}catch{}}
 play(type,weapon){if(!this.enabled)return;this.unlock();const c=this.context;if(!c)return;const now=c.currentTime,key=type==='shot'?weapon:type,limit=type==='shot'?.085:type==='kill'?.1:.06;if(now-(this.last[key]??-10)<limit)return;this.last[key]=now;
  const tone=(f,to,dur,vol=.035,wave='sine',delay=0)=>{const o=c.createOscillator(),g=c.createGain(),at=now+delay;o.type=wave;o.frequency.setValueAtTime(f,at);o.frequency.exponentialRampToValueAtTime(Math.max(20,to),at+dur);g.gain.setValueAtTime(vol,at);g.gain.exponentialRampToValueAtTime(.0001,at+dur);o.connect(g);g.connect(c.destination);o.start(at);o.stop(at+dur+.02);};
  const noise=(dur,vol,frequency)=>{const b=c.createBuffer(1,Math.ceil(c.sampleRate*dur),c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/a.length,2);const n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();n.buffer=b;f.type='lowpass';f.frequency.value=frequency;g.gain.value=vol;n.connect(f);f.connect(g);g.connect(c.destination);n.start(now);};
  if(type==='shot'){
   if(weapon==='mortar'){tone(115,28,.22,.09,'triangle');noise(.16,.11,550);}
   else if(weapon==='sniper'){noise(.055,.08,3500);tone(900,65,.15,.035,'sawtooth');}
   else if(weapon==='tesla'){tone(720,210,.13,.025,'sawtooth');tone(1100,300,.1,.014,'square');}
   else if(weapon==='laser'){tone(380,560,.1,.012,'sawtooth');}
   else if(weapon==='flame'){noise(.1,.035,1100);}
   else if(weapon==='frost'){tone(1200,580,.12,.025,'sine');}
   else if(weapon==='acid'){tone(390,65,.14,.035,'triangle');}
   else{noise(.045,.05,1900);tone(170,65,.07,.03,'square');}return;
  }
  if(type==='kill'){noise(.08,.035,900);return;}
  if(type==='error'){tone(150,90,.18,.055,'triangle');return;}
  if(type==='leak'||type==='lose'){tone(190,70,.35,.08,'sawtooth');tone(150,60,.35,.055,'triangle',.16);return;}
  if(type==='pulse'){tone(1400,65,.6,.06,'sine');noise(.35,.055,2200);return;}
  if(type==='select'){tone(540,700,.06,.025);return;}
  if(type==='bossKill'){tone(80,24,.65,.09,'triangle');noise(.45,.12,800);return;}
  const notes={build:[460,720],wave:[180,270,360],clear:[523,659,784],win:[392,494,587,784]}[type];
  if(notes)notes.forEach((f,i)=>tone(f,f*1.01,type==='win'?.5:.22,.04,'sine',i*.1));
 }
}
