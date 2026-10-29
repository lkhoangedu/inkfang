/* Original synthesized game score. No recordings, downloads or third-party tracks.
   Three swarm tracks escalate with the waves; each boss brings its own theme. Tempo follows the real monster pace. */
(function(root){
// Patterns are 16 sixteenth-steps per bar. kick/snare: step lists. hat: 0 none, 1 closed, 2 open.
// bass: chord-note index per step (-1 = octave below root, null = rest). lead: melody-step flags. arp: chord index per step.
const flags=s=>[...s].map(c=>c==='x'?1:c==='o'?2:0);
const THEMES={
 dawn:{name:'Dawn Patrol',root:38,tempo:0,chords:[[0,3,7],[0,5,8],[-2,2,5],[-5,0,3]],melody:[7,10,12,10,7,5,3,5,7,12,15,12,10,7,5,3],
  kick:[0,8],snare:[4,12],hat:flags('x.x.x.x.x.x.x.o.'),bass:[0,null,0,null,1,null,2,null,0,null,0,null,2,null,1,null],lead:flags('x...x...x...x.x.'),leadWave:'triangle',leadCut:2100,bassWave:'triangle',pad:true,padLevel:.04},
 swarm:{name:'Swarm Season',root:40,tempo:6,chords:[[0,3,7],[-2,2,5],[-4,0,3],[-5,-1,2]],melody:[12,10,7,10,12,15,12,10,7,5,7,10,12,10,7,3],
  kick:[0,6,8,14],snare:[4,12],hat:flags('xxxxxxxxxxxxxxox'),bass:[0,0,null,0,1,null,0,0,2,2,null,2,1,null,0,0],lead:flags('x.x.x.x.x.x.x.xx'),leadWave:'square',leadCut:1700,bassWave:'sawtooth',pad:true,padLevel:.03,arp:[null,2,null,1,null,2,null,0,null,2,null,1,null,2,null,0]},
 frenzy:{name:'Ink Frenzy',root:41,tempo:12,chords:[[0,3,7],[0,3,7],[-2,1,5],[-4,-1,3]],melody:[15,12,10,12,15,17,15,12,10,7,10,12,15,12,10,8],
  kick:[0,3,6,8,11,14],snare:[4,12,15],hat:flags('xxxxxxxxxxxxxxxx'),bass:[0,0,0,null,0,0,2,null,1,1,1,null,0,0,-1,null],lead:flags('xxx.x.xxxxx.x.xx'),leadWave:'square',leadCut:2600,bassWave:'sawtooth',pad:false,arp:[0,null,2,null,1,null,2,null,0,null,2,null,1,null,2,2],clap:true}
};
const BOSS_THEMES={
 colossus:{name:'Stone March',root:33,tempo:-10,chords:[[0,3,7],[0,3,7],[-2,2,5],[-1,3,6]],melody:[0,3,5,3,0,-2,0,3,5,7,5,3,0,-2,-4,-2],
  kick:[0,8,10],snare:[4,12],hat:flags('x...x...x...x...'),bass:[0,null,null,null,0,null,0,null,-1,null,null,null,0,null,1,null],lead:flags('x.......x...x...'),leadWave:'sawtooth',leadCut:900,bassWave:'sawtooth',pad:true,padLevel:.06,toms:[6,7,14,15],heavy:true},
 harpy:{name:'Night Wings',root:45,tempo:18,chords:[[0,3,7],[-2,1,5],[-3,0,4],[-5,-2,2]],melody:[12,15,17,15,12,10,12,15,19,17,15,12,10,8,10,12],
  kick:[0,4,8,12],snare:[4,12,14],hat:flags('xoxxxoxxxoxxxoxx'),bass:[0,null,0,0,null,0,2,null,1,null,1,1,null,1,2,null],lead:flags('x.xxx.x.x.xxx.xx'),leadWave:'triangle',leadCut:3600,bassWave:'square',pad:false,arp:[0,1,2,1,0,1,2,1,0,1,2,1,0,1,2,1]},
 weaver:{name:'Web of Bones',root:37,tempo:4,chords:[[0,3,6],[0,3,6],[-1,2,5],[-3,0,3]],melody:[12,11,12,6,12,11,12,3,12,11,12,6,9,8,9,3],
  kick:[0,7,8],snare:[4,12],hat:flags('x.xx.x.xx.xx.x.x'),bass:[0,null,null,0,null,0,null,null,2,null,null,2,null,1,null,null],lead:flags('xx.x.xx.xx.x.xxx'),leadWave:'square',leadCut:1500,bassWave:'triangle',pad:true,padLevel:.035,pluck:true},
 kraken:{name:'Deep Current',root:31,tempo:-4,chords:[[0,3,7],[0,5,8],[-2,2,5],[-4,0,3]],melody:[7,5,3,0,3,5,7,10,7,5,3,0,-2,0,3,5],
  kick:[0,8,12],snare:[4,12],hat:flags('..x...x...x...x.'),bass:[0,1,2,1,0,1,2,1,0,1,2,1,-1,1,2,1],lead:flags('x.......x.x.....'),leadWave:'sine',leadCut:1400,bassWave:'sawtooth',pad:true,padLevel:.07,toms:[2,10],heavy:true}
};
function tempoForTravel(travel){const points=[[5.8,150],[8,136],[12,116],[22,90],[36,72]];if(travel<=points[0][0])return 150;for(let i=1;i<points.length;i++)if(travel<=points[i][0]){const[a,x]=points[i-1],[b,y]=points[i];return x+(y-x)*(travel-a)/(b-a)}return 72;}
function themeForWave(wave){return wave>=8?'frenzy':wave>=4?'swarm':'dawn'}
const FX_PATTERNS={slow:[60,55,48],freeze:[88,84,79,72],double:[60,72,60,72],chain:[84,91,96,79],heart:[72,76,84,88],nova:[36,48,60,67,72,84],boss:[36,36,43,42],swerve:[79,84],spawn:[62,69],chip:[55,62],hit:[72,79,84],combo:[76,79,83,88],escape:[45,40,33],wave:[48,55,60,67],win:[60,64,67,72,76,79],end:[55,51,48,43]};
const hz=midi=>440*Math.pow(2,(midi-69)/12);
class GameAudio{
constructor(){this.ctx=null;this.musicOn=true;this.effectsOn=true;this.volume=.6;this.duck=false;this.wave=1;this.tick=0;this.playing=false;this.nodes=new Set();this.travel=12;this.bpm=tempoForTravel(12);this.lastHit=0;this.theme='dawn';this.pendingTheme=null;this.bossTheme=null;this.pendingBoss=undefined;}
prepare(){try{const Context=root.AudioContext||root.webkitAudioContext;if(!Context)return false;if(!this.ctx){this.ctx=new Context();this.master=this.ctx.createDynamicsCompressor();this.master.threshold.value=-20;this.master.ratio.value=5;this.master.connect(this.ctx.destination);this.musicBus=this.ctx.createGain();this.fxBus=this.ctx.createGain();this.musicBus.connect(this.master);this.fxBus.connect(this.master);this.fxBus.gain.value=.4;const buffer=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;this.noiseBuffer=buffer;}this.ctx.resume().catch(()=>{});this.applyMix();return true}catch{return false}}
applyMix(){if(!this.ctx)return;const t=this.ctx.currentTime;this.musicBus.gain.setTargetAtTime(this.musicOn?this.volume*(this.duck?.015:.28):0,t,.2);this.fxBus.gain.setTargetAtTime(this.effectsOn?(this.duck?.035:.38):0,t,.08);}
configure({music=true,sound=true,voice=false,speed='steady',travel}={}){this.musicOn=music;this.effectsOn=sound;this.duck=voice;this.setPace(Number.isFinite(travel)?travel:(root.InkEngine?.paceFor(speed,voice?'voice':'type').travel||12));this.applyMix();}
get current(){return this.bossTheme?BOSS_THEMES[this.bossTheme]:THEMES[this.theme]||THEMES.dawn}
setPace(travel){if(Number.isFinite(travel)&&travel>0){this.travel=travel;this.bpm=Math.max(66,Math.min(172,tempoForTravel(travel)+this.current.tempo));}}
setMusic(on){this.musicOn=on;this.applyMix()}setEffects(on){this.effectsOn=on;this.applyMix()}setVolume(v){this.volume=Math.max(0,Math.min(1,v));this.applyMix()}
// Later waves pick a more driving track. Changes land on the next bar so the groove never stutters.
setWave(wave){if(wave>this.wave){this.wave=wave;this.effect('wave')}else this.wave=wave;const next=themeForWave(wave);if(next!==this.theme){if(this.playing)this.pendingTheme=next;else this.theme=next;this.setPace(this.travel)}}
setBoss(theme){const next=theme&&BOSS_THEMES[theme]?theme:null;if(next===this.bossTheme&&this.pendingBoss===undefined)return;if(this.playing)this.pendingBoss=next;else{this.bossTheme=next;this.pendingBoss=undefined;this.setPace(this.travel)}}
watch(node,stop){this.nodes.add(node);node.onended=()=>this.nodes.delete(node);if(stop!==undefined)node.stop(stop);}
note(midi,time,duration,gain=.14,type='triangle',bus=this.musicBus,cutoff=1500){const c=this.ctx;if(!c)return;const o=c.createOscillator(),filter=c.createBiquadFilter(),g=c.createGain();o.type=type;o.frequency.value=hz(midi);filter.type='lowpass';filter.frequency.value=cutoff;g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),time+.014);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(filter);filter.connect(g);g.connect(bus);o.start(time);this.watch(o,time+duration+.05);}
pad(notes,time,duration,level=.04){for(const midi of notes)for(const cents of[-6,6]){const c=this.ctx,o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.value=hz(midi);o.detune.value=cents;f.type='lowpass';f.frequency.setValueAtTime(450,time);f.frequency.linearRampToValueAtTime(1100,time+duration*.65);g.gain.setValueAtTime(.0001,time);g.gain.linearRampToValueAtTime(level,time+.3);g.gain.setValueAtTime(level,time+duration*.7);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(f);f.connect(g);g.connect(this.musicBus);o.start(time);this.watch(o,time+duration+.1);}}
noise(time,duration,level=.12,cutoff=1800,bus=this.musicBus,type='highpass'){const c=this.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.noiseBuffer;f.type=type;f.frequency.value=cutoff;g.gain.setValueAtTime(level,time);g.gain.exponentialRampToValueAtTime(.0001,time+duration);s.connect(f);f.connect(g);g.connect(bus);s.start(time);this.watch(s,time+duration+.02);}
drum(time,heavy=false,pitch=1){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime((heavy?105:150)*pitch,time);o.frequency.exponentialRampToValueAtTime((heavy?38:55)*pitch,time+.22);g.gain.setValueAtTime(heavy?.65:.32,time);g.gain.exponentialRampToValueAtTime(.0001,time+.34);o.connect(g);g.connect(this.musicBus);o.start(time);this.watch(o,time+.36);}
snare(time,level=.11){this.noise(time,.14,level,1800);this.drum(time,false,1.3);}
schedule(){if(!this.playing||!this.ctx)return;while(this.nextNote<this.ctx.currentTime+.25){const step=this.tick%16,bar=Math.floor(this.tick/16);
 if(step===0){if(this.pendingTheme){this.theme=this.pendingTheme;this.pendingTheme=null}if(this.pendingBoss!==undefined){this.bossTheme=this.pendingBoss;this.pendingBoss=undefined}this.setPace(this.travel)}
 const theme=this.current,beat=60/this.bpm,chord=theme.chords[bar%theme.chords.length],rootNote=theme.root,t=this.nextNote;
 if(this.musicOn){
  if(step===0&&theme.pad)this.pad(chord.map(n=>rootNote+12+n),t,beat*4.1,theme.padLevel||.04);
  if(theme.kick.includes(step))this.drum(t,true,theme.heavy?.9:1);
  if(theme.snare.includes(step))this.snare(t,theme.clap?.16:.11);
  if(theme.toms?.includes(step))this.drum(t,true,1.6);
  const hat=theme.hat[step];if(hat)this.noise(t,hat===2?.16:.045,hat===2?.07:.045,5500);
  const b=theme.bass[step];if(b!==null&&b!==undefined)this.note(rootNote+(b<0?-12:chord[b%chord.length]),t,beat*(theme.pluck?.3:.47),.17,theme.bassWave,this.musicBus,850);
  if(theme.lead[step]||(this.wave>=3&&!this.bossTheme&&step%4===2))this.note(rootNote+12+theme.melody[(step+bar*3)%16],t,beat*(theme.pluck?.35:.8),.075,theme.leadWave,this.musicBus,theme.leadCut);
  const a=theme.arp?.[step];if(a!==null&&a!==undefined)this.note(rootNote+24+chord[a%chord.length],t,beat*.28,.04,'square',this.musicBus,2400);
  if(step===12&&!theme.hat[12])this.noise(t,.14,.11,1800);
  if(step===15&&(this.pendingTheme||this.pendingBoss!==undefined))this.noise(t,beat,.09,900,this.musicBus,'bandpass');
 }
 this.tick++;this.nextNote+=beat/4;}}
start(config){if(!this.prepare())return;this.pause();this.configure(config);this.wave=1;this.theme='dawn';this.bossTheme=null;this.pendingTheme=null;this.pendingBoss=undefined;this.tick=0;this.setPace(this.travel);this.playing=true;this.nextNote=this.ctx.currentTime+.03;this.schedule();this.interval=setInterval(()=>this.schedule(),90);}
pause(){this.playing=false;clearInterval(this.interval);for(const node of this.nodes){try{node.stop()}catch{}}this.nodes.clear();}
resume(){if(!this.prepare()||this.playing)return;this.playing=true;this.nextNote=this.ctx.currentTime+.04;this.schedule();this.interval=setInterval(()=>this.schedule(),90);}
stop(){this.pause();}
effect(kind='hit',combo=0){if(!this.effectsOn||!this.prepare())return;const c=this.ctx;let pattern=FX_PATTERNS[kind]||FX_PATTERNS.hit;const transpose=kind==='hit'?(this.lastHit++%3)*2:kind==='combo'?Math.min(7,Math.floor(combo/3)):0;const now=c.currentTime;pattern.forEach((n,i)=>this.note(n+transpose,now+i*(kind==='win'?.12:kind==='boss'?.2:.055),kind==='end'?.4:kind==='boss'?.5:.17,kind==='boss'?.2:.14,['escape','boss'].includes(kind)?'sawtooth':'triangle',this.fxBus,kind==='escape'?650:kind==='boss'?500:2900));if(kind==='hit')this.noise(now,.055,.13,3500,this.fxBus);if(kind==='combo')this.noise(now,.25,.1,5000,this.fxBus);if(kind==='nova')this.noise(now,.8,.3,1800,this.fxBus);if(kind==='boss'){this.noise(now,1.2,.22,400,this.fxBus,'lowpass');for(let i=0;i<4;i++)this.drum(now+i*.2,true,.8)}if(kind==='wave')this.noise(now,.4,.2,2400,this.fxBus);}
}
root.InkAudio={GameAudio,THEMES,BOSS_THEMES,SCORE:THEMES.dawn,tempoForTravel,themeForWave,FX_PATTERNS};if(typeof module!=='undefined')module.exports=root.InkAudio;
})(typeof window!=='undefined'?window:globalThis);
