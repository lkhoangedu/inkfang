/* Pure survival rules. No DOM, timers, microphone or storage. */
(function(root){
const SPEEDS={drift:{name:'Drift',travel:22,spawn:4.8,cap:5},steady:{name:'Steady',travel:12,spawn:2.25,cap:7},rush:{name:'Rush',travel:8,spawn:1.45,cap:8},blitz:{name:'Blitz',travel:5.8,spawn:.95,cap:10}};
const VOICE_SPEEDS={drift:{name:'Drift',travel:36,spawn:7,cap:2},steady:{name:'Steady',travel:24,spawn:5,cap:3},rush:{name:'Rush',travel:18,spawn:3.8,cap:3},blitz:{name:'Blitz',travel:14,spawn:3,cap:4}};
const paceFor=(speed='steady',control='type')=>({...((control==='voice'?VOICE_SPEEDS:SPEEDS)[speed]||(control==='voice'?VOICE_SPEEDS:SPEEDS).steady)});
const norm=s=>String(s).toUpperCase().replace(/[^A-Z0-9]/g,'');
// Movement is relative to the chosen pace. Ordinary monsters have distinct speed tiers:
// ghosts set the baseline, bats are the fast tier, golems the slow armoured tier, vampires
// speed up once wounded, ember sprites start slow and accelerate as they fall. Bosses move
// slowly but never hold up the swarm, which keeps its own rhythm around them.
const MONSTERS={
 wisp:{name:'Ghost',hp:1,speed:1,points:10,symbol:'ink-wisp',color:'#a2d6cc',blurb:'Floats at the swarm pace. One answer.'},
 scout:{name:'Bat',hp:1,speed:1.5,points:14,symbol:'ink-scout',color:'#e8c47a',blurb:'Fast flier. Swerves past slower monsters.'},
 brute:{name:'Stone Golem',hp:3,speed:.62,points:28,symbol:'ink-brute',color:'#b7b0cf',blurb:'Slow and armoured. Three answers.'},
 shade:{name:'Vampire',hp:2,speed:1.05,points:22,symbol:'ink-shade',color:'#c4b6e9',enrage:1.45,blurb:'Two answers. Flees faster once wounded.'},
 healer:{name:'Life Spirit',hp:1,speed:.8,points:12,symbol:'ink-healer',color:'#ff9678',blurb:'Gentle drifter. Defeat it for a heart.'},
 spark:{name:'Ember Sprite',hp:1,speed:.5,accel:1.3,points:18,symbol:'ink-spark',color:'#ff8c5a',blurb:'Starts slow, then races for the line.'},
 boss:{name:'The Ink Colossus',hp:12,speed:.22,points:180,symbol:'ink-boss',color:'#f1a56d',boss:true,theme:'colossus',blurb:'A slow stone titan. Twelve answers.'},
 harpy:{name:'The Night Harpy',hp:7,speed:.5,points:160,symbol:'ink-harpy',color:'#9fb7e8',boss:true,theme:'harpy',blurb:'A quick winged boss. Seven answers.'},
 weaver:{name:'The Bone Weaver',hp:10,speed:.28,points:200,symbol:'ink-weaver',color:'#e0dcc6',boss:true,theme:'weaver',enrage:1.6,enrageAt:3,blurb:'Ten answers. Scuttles faster when nearly beaten.'},
 kraken:{name:'The Deep Kraken',hp:15,speed:.2,points:240,symbol:'ink-kraken',color:'#7fc8c0',boss:true,theme:'kraken',pressure:.75,blurb:'Fifteen answers. The swarm arrives faster while it lives.'}
};
const BOSS_ORDER=['boss','harpy','weaver','kraken'];
const bossFor=stage=>BOSS_ORDER[(Math.max(1,stage)-1)%BOSS_ORDER.length];
const SKILLS={slow:{name:'Slowfield',cost:3,duration:7},freeze:{name:'Frostlock',cost:4,duration:4},double:{name:'Twin Strike',cost:5,charges:4},chain:{name:'Chain Lightning',cost:6,charges:4},nova:{name:'Inkstorm',cost:10}};
const answersFor=q=>[...new Set([q.answer,...(q.acceptedAnswers||[])].map(norm).filter(Boolean))];
// Effective movement rate of one monster right now.
function paceOf(e){const a=MONSTERS[e.type]||MONSTERS.wisp;let speed=a.speed;if(a.accel)speed+=a.accel*Math.max(0,Math.min(1,e.y));if(a.enrage&&e.hp<(a.enrageAt?a.enrageAt+1:e.maxHp))speed*=a.enrage;return speed;}
class SurvivalEngine{
constructor({pool,speed='steady',duration=300,control='type',initial=null,progressive=true,rng=Math.random,onEvent=()=>{}}){
 if(!pool?.length)throw Error('A question pool is required.');
 Object.assign(this,{pool,control,duration,rng,onEvent,progressive});this.speed=paceFor(speed,control);this.travelScale=1;this.maxLevel=Math.min(3,Math.max(...pool.map(q=>Number(q.level)||1)));this.voiceReady=true;
 this.enemies=[];this.elapsed=0;this.spawnClock=0;this.score=0;this.combo=0;this.bestCombo=0;this.kills=0;this.hits=0;this.bossKills=0;this.lives=2;this.maxLives=5;this.mana=0;this.maxMana=10;this.serial=0;this.lastBossStage=0;this.freezeUntil=0;this.slowUntil=0;this.doubleCharges=0;this.chainCharges=0;
 this.baseSpacing=pool.some(q=>(q.display||q.prompt||'').length>40)?.42:.3;this.spacing=this.baseSpacing;this.over=false;this.review=[];this.recent=[];
 this.spawn(.22,{type:'wisp'});for(let i=1;i<(initial??(control==='voice'?1:2));i++)this.spawn(.12-(i-1)*.1,{type:'wisp'});
}
get wave(){return 1+Math.floor(this.elapsed/20)}
get level(){return this.progressive?Math.min(this.maxLevel,1+Math.floor((this.wave-1)/2)):this.maxLevel}
get multiplier(){return Math.min(this.control==='voice'?1.4:2,1+(this.wave-1)*(this.control==='voice'?.06:.1))}
get boss(){return this.enemies.find(e=>e.boss)||null}
// Effective travel time. Short arenas (phones with browser bars) grant up to 35% more time so reaction room matches a tall screen.
get travel(){return this.speed.travel*this.travelScale}
setArenaHeight(px){this.travelScale=Number.isFinite(px)&&px>0?Math.max(1,Math.min(1.35,520/px)):1;return this.travelScale}
questionFor(exclude=[],allowUsed=false){
 const active=new Set([...this.enemies.map(e=>norm(e.q.answer)),...exclude.map(norm)]),eligible=this.pool.filter(q=>!this.progressive||(q.level||1)<=this.level);
 const base=eligible.length?eligible:this.pool;
 let options=base.filter(q=>!active.has(norm(q.answer))&&!this.recent.includes(q.id));if(!options.length)options=base.filter(q=>!active.has(norm(q.answer)));if(!options.length&&allowUsed)options=base.filter(q=>!exclude.map(norm).includes(norm(q.answer)));if(!options.length&&allowUsed)options=this.pool.filter(q=>!exclude.map(norm).includes(norm(q.answer)));if(!options.length)return null;
 const highest=Math.max(...options.map(q=>q.level||1));if(highest>1&&this.rng()<.65)options=options.filter(q=>(q.level||1)===highest);
 const kinds=[...new Set(options.map(q=>q.kind))],kind=kinds[Math.floor(this.rng()*kinds.length)];const same=options.filter(q=>q.kind===kind);return same[Math.floor(this.rng()*same.length)];
}
remember(q){this.recent.push(q.id);if(this.recent.length>Math.min(16,Math.floor(this.pool.length/2)))this.recent.shift()}
nextType(){if(this.wave>=2&&(this.serial+1)%9===0&&!this.enemies.some(e=>e.type==='healer'))return'healer';const roll=this.rng();if(this.wave>=5&&roll<.15)return'spark';if(this.wave>=4&&roll<.32)return'shade';if(this.wave>=3&&roll<.55)return'brute';if(this.wave>=2&&roll<.5)return'scout';return'wisp'}
// Ordinary monsters keep a readable gap within their lane; bosses live on their own centre layer.
laneBlocked(lane,y,ignore=null){return this.enemies.some(e=>e!==ignore&&!e.boss&&e.lane===lane&&Math.abs(e.y-y)<this.spacing)}
spawn(y=-.12,{type=null}={}){
 if(this.enemies.length>=this.speed.cap)return false;type=type||this.nextType();const archetype=MONSTERS[type]||MONSTERS.wisp;
 const q=this.questionFor();if(!q)return false;
 let lane;if(archetype.boss){if(this.boss)return false;lane=2}else{const counts=[0,1].map(l=>this.enemies.filter(e=>!e.boss&&e.lane===l&&e.y<.22).length);const front=l=>this.enemies.filter(e=>!e.boss&&e.lane===l&&e.y>=y).sort((a,b)=>a.y-b.y)[0];
  // Prefer the lane whose nearest monster will not hold this one up, then the emptier lane.
  const order=[0,1].sort((a,b)=>{const fa=front(a),fb=front(b);const sa=fa?Math.min(1,paceOf(fa)/archetype.speed):2,sb=fb?Math.min(1,paceOf(fb)/archetype.speed):2;return sb-sa||counts[a]-counts[b]||((this.serial%2===a)?-1:1)});
  lane=order.find(l=>!this.laneBlocked(l,y));if(lane===undefined)return false;}
 const stageBonus=archetype.boss?2*Math.floor((Math.max(1,Math.floor(this.wave/4))-1)/BOSS_ORDER.length):0,hp=archetype.hp+stageBonus;
 const enemy={id:++this.serial,q,type,name:archetype.name,boss:!!archetype.boss,lane,y,hp,maxHp:hp,speed:archetype.speed,revision:0,locked:new Set(),damage:0,switched:-9};this.remember(q);this.enemies.push(enemy);this.onEvent({type:'spawn',enemy});return enemy;
}
update(dt){
 if(this.over||!Number.isFinite(dt)||dt<=0||(this.control==='voice'&&!this.voiceReady))return;const before=this.elapsed;this.elapsed+=dt;const motionDt=Math.max(0,this.elapsed-Math.max(before,this.freezeUntil)),slow=this.elapsed<this.slowUntil?.45:1;
 const ordered=[...this.enemies].sort((a,b)=>b.y-a.y),moved=[];
 for(const e of ordered){const pace=paceOf(e);e.speed=pace;e.y+=motionDt/this.travel*this.multiplier*pace*slow;
  if(!e.boss){let blocker=null;for(const front of moved)if(motionDt&&!front.boss&&front.lane===e.lane&&e.y>front.y-this.spacing){blocker=front;e.y=Math.min(e.y,front.y-this.spacing)}
   // A clearly faster monster swerves into the free lane instead of queueing behind a slow one.
   if(blocker&&pace>paceOf(blocker)*1.15&&this.elapsed-e.switched>2&&!this.laneBlocked(1-e.lane,e.y,e)){e.lane=1-e.lane;e.switched=this.elapsed;this.onEvent({type:'swerve',enemy:e})}}
  moved.push(e);
  if(e.y>=.91){if(!motionDt)continue;if(this.control==='voice'){e.y=.91;e.lineWait=(e.lineWait||0)+motionDt;if(e.lineWait<1.4)continue}this.enemies=this.enemies.filter(m=>m!==e);this.lives--;this.combo=0;this.review.push({...e.q,outcome:'escaped'});this.onEvent({type:'escape',enemy:e});if(this.lives<=0){this.finish('hearts');return}}
 }
 const stage=Math.floor(this.wave/4);if(motionDt&&stage>this.lastBossStage&&!this.boss){if(this.spawn(-.2,{type:bossFor(stage)}))this.lastBossStage=stage}
 const pressure=this.boss?(MONSTERS[this.boss.type].pressure||1):1;
 this.spawnClock+=motionDt*slow;const interval=this.speed.spawn/this.multiplier*pressure;if(motionDt&&stage<=this.lastBossStage&&this.spawnClock>=interval)this.spawnClock=this.spawn()?0:Math.max(0,interval-.2);
 if(this.duration&&this.elapsed>=this.duration)this.finish('time');
}
kill(enemy,{spell=false}={}){
 this.enemies=this.enemies.filter(e=>e!==enemy);this.kills++;this.combo++;this.bestCombo=Math.max(this.bestCombo,this.combo);if(enemy.boss)this.bossKills++;
 const points=MONSTERS[enemy.type].points+Math.min(this.combo-1,10)*2;this.score+=points;
 // Only answer-earned kills charge mana, preventing a spell from recharging itself.
 if(!spell){const before=this.mana;this.mana=Math.min(this.maxMana,this.mana+1);if(this.mana===3&&!this.skillIntro){this.skillIntro=true;this.onEvent({type:'mana-ready',skill:'slow'})}if(before<10&&this.mana===10)this.onEvent({type:'mana-ready',skill:'nova'})}
 if(enemy.damage)this.review.push({...enemy.q,outcome:'recovered'});
 if(enemy.type==='healer'){const before=this.lives;this.lives=Math.min(this.maxLives,this.lives+1);this.onEvent({type:'heart',enemy,gained:this.lives-before})}
 this.onEvent({type:'kill',enemy,points,spell});
 return{type:'kill',enemy,points};
}
refill(){if(!this.enemies.length){if(this.control==='voice')this.spawnClock=Math.max(0,this.speed.spawn/this.multiplier-1.2);else this.spawn(.12)}else if(this.control!=='voice')this.spawnClock=Math.max(this.spawnClock,this.speed.spawn/this.multiplier*.65)}
dealDamage(enemy,damage){
 this.hits+=Math.min(damage,enemy.hp);enemy.hp=Math.max(0,enemy.hp-damage);if(!enemy.hp)return this.kill(enemy);
 const previous=enemy.q;enemy.revision++;enemy.locked=new Set();enemy.damage=0;enemy.lineWait=0;
 const next=this.questionFor([previous.answer],true);if(next){enemy.q=next;this.remember(next)}
 this.onEvent({type:'hit',enemy,previous,damage});return{type:'hit',enemy,previous,damage};
}
hit(enemy){
 const damage=this.doubleCharges>0?2:1;if(this.doubleCharges>0)this.doubleCharges--;
 const charged=this.chainCharges>0;if(charged)this.chainCharges--;
 const distance=e=>Math.abs(e.y-enemy.y)+(e.lane===enemy.lane?0:.13);
 const nearby=charged?[...this.enemies].filter(e=>e!==enemy&&distance(e)<=.4).sort((a,b)=>distance(a)-distance(b))[0]:null;
 const result=this.dealDamage(enemy,damage);
 if(nearby&&this.enemies.includes(nearby)){this.onEvent({type:'chain',from:enemy,to:nearby});this.dealDamage(nearby,1);result.chainHits=1}
 this.refill();return result;
}
skillReady(name){const skill=SKILLS[name];if(!skill||this.over||this.mana<skill.cost)return false;if(name==='freeze')return this.elapsed>=this.freezeUntil;if(name==='slow')return this.elapsed>=this.slowUntil;if(name==='double')return!this.doubleCharges;if(name==='chain')return!this.chainCharges;return this.enemies.length>0;}
castSkill(name){if(!this.skillReady(name))return{type:'unavailable'};if(name==='nova')return this.castNova();const skill=SKILLS[name];this.mana-=skill.cost;if(name==='freeze')this.freezeUntil=this.elapsed+skill.duration;if(name==='slow')this.slowUntil=this.elapsed+skill.duration;if(name==='double')this.doubleCharges=skill.charges;if(name==='chain')this.chainCharges=skill.charges;this.onEvent({type:'skill',skill:name});return{type:'skill',skill:name};}
submit(value,{partial=true,targetId=null,targetRevision=null}={}){
 if(this.over)return{type:'ignored'};const raw=String(value).trim(),numeric=/^\d+$/.test(raw),answer=norm(raw);if(!answer)return{type:'empty'};
 const threats=[...this.enemies].sort((a,b)=>b.y-a.y);
 const matching=threats.filter(e=>answersFor(e.q).includes(answer)&&(e.q.kind!=='numbers'||numeric)&&(targetId===null||e.id===targetId)&&(targetRevision===null||e.revision===targetRevision));
 matching.sort((a,b)=>Number(norm(b.q.answer)===answer)-Number(norm(a.q.answer)===answer)||b.y-a.y);
 if(matching.length)return this.hit(matching[0]);
 if(partial){const candidates=threats.filter(e=>norm(e.q.answer).length===answer.length&&answer.length>1&&(e.q.kind!=='numbers'||numeric)).map(e=>{const positions=[];const target=norm(e.q.answer);for(let i=0;i<target.length;i++)if(answer[i]===target[i]&&!e.locked.has(i))positions.push(i);return{e,positions}}).filter(c=>c.positions.length).sort((a,b)=>b.positions.length-a.positions.length||b.e.y-a.e.y);
 if(candidates.length){const{e,positions}=candidates[0];positions.forEach(i=>e.locked.add(i));e.damage=e.locked.size/norm(e.q.answer).length;if(e.locked.size===norm(e.q.answer).length)return this.hit(e);this.combo=0;this.onEvent({type:'partial',enemy:e,positions});return{type:'partial',enemy:e,positions}}}
 this.combo=0;this.onEvent({type:'miss',answer});return{type:'miss'};
}
castNova(){
 if(this.over||this.mana<this.maxMana||!this.enemies.length)return{type:'unavailable'};this.mana=0;let kills=0,bossDamage=0;
 this.onEvent({type:'nova'});
 for(const e of [...this.enemies]){if(e.boss){const damage=Math.ceil(e.maxHp/2);e.hp=Math.max(0,e.hp-damage);bossDamage+=damage;if(!e.hp){this.kill(e,{spell:true});kills++}else this.onEvent({type:'boss-damage',enemy:e,damage})}else{this.kill(e,{spell:true});kills++}}
 this.spawnClock=this.speed.spawn/this.multiplier-1.5;return{type:'nova',kills,bossDamage};
}
finish(reason='quit'){if(this.over)return;this.over=true;this.onEvent({type:'end',reason})}
}
const LETTER_SPEECH={a:'A',ay:'A',aye:'A',b:'B',bee:'B',be:'B',c:'C',see:'C',sea:'C',d:'D',dee:'D',e:'E',ee:'E',f:'F',ef:'F',eff:'F',g:'G',gee:'G',h:'H',aitch:'H',haitch:'H',i:'I',eye:'I',j:'J',jay:'J',k:'K',kay:'K',l:'L',el:'L',ell:'L',m:'M',em:'M',n:'N',en:'N',o:'O',oh:'O',p:'P',pee:'P',q:'Q',cue:'Q',queue:'Q',r:'R',are:'R',ar:'R',s:'S',ess:'S',es:'S',t:'T',tea:'T',tee:'T',u:'U',you:'U',v:'V',vee:'V',w:'W',doubleu:'W',doubleyou:'W',x:'X',ex:'X',y:'Y',why:'Y',z:'Z',zee:'Z',zed:'Z'};
const SMALL={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19};
// Dictation often chooses these spellings for acoustically identical number names.
const NUMBER_HOMOPHONES={won:'one',to:'two',too:'two',for:'four',fore:'four',ate:'eight'};
const TENS={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
function under100(tokens,i){if(Object.hasOwn(TENS,tokens[i])){let value=TENS[tokens[i]],end=i+1;if(SMALL[tokens[end]]>0&&SMALL[tokens[end]]<10)value+=SMALL[tokens[end++]];return{value,end}}if(Object.hasOwn(SMALL,tokens[i]))return{value:SMALL[tokens[i]],end:i+1};return null;}
function under1000(tokens,i){const leading=tokens[i]==='a'?1:SMALL[tokens[i]];if(leading>0&&leading<10&&tokens[i+1]==='hundred'){let value=leading*100,end=i+2;const after=under100(tokens,tokens[end]==='and'?end+1:end);if(after){value+=after.value;end=after.end}return{value,end}}return under100(tokens,i);}
function wholeNumberAt(tokens,i){if(/^\d+(?:\.\d+)?$/.test(tokens[i]))return{value:Number(tokens[i]),end:i+1};const leading=tokens[i]==='a'?1:SMALL[tokens[i]];if(leading>0&&leading<10&&tokens[i+1]==='thousand'){let value=leading*1000,end=i+2;const rest=under1000(tokens,tokens[end]==='and'?end+1:end);if(rest){value+=rest.value;end=rest.end}return{value,end}}return under1000(tokens,i);}
// Spoken decimal spans are not valid whole-number answers; consume the entire span.
function numberAt(tokens,i){const n=wholeNumberAt(tokens,i);if(!n||tokens[n.end]!=='point')return n;let end=n.end+1;while(end<tokens.length&&(/^\d+$/.test(tokens[end])||(Object.hasOwn(SMALL,tokens[end])&&SMALL[tokens[end]]<10)))end++;return{value:NaN,end};}
function speechUnits(text,{lettersOnly=false}={}){
// Only an explicit uppercase acronym in a letters-only round is split into letter names.
const source=lettersOnly?String(text).replace(/\b[A-Z]{2,8}\b/g,s=>[...s].join(' ')):String(text);
const tokens=(source.toLowerCase().replace(/\b\d{1,3}(?:,\d{3})+\b/g,n=>n.replace(/,/g,'')).replace(/(^|[\s,(])[-−](?=\d)/g,'$1minus ').replace(/[’']/g,'').replace(/-/g,' ').match(/\d+(?:\.\d+)?|[a-z]+|[,;.!?]/g)||[]);
const numeric=tokens.map(t=>NUMBER_HOMOPHONES[t]||t),units=[];
for(let i=0;i<tokens.length;){
const token=tokens[i];
if(['minus','negative'].includes(token)){const n=numberAt(numeric,i+1);i=n?n.end:i+1;continue}
const number=numberAt(numeric,i);
if(number){units.push({kind:'number',value:number.value,text:tokens.slice(i,number.end).join(' '),key:'N'+number.value});i=number.end;continue}
if(token==='double'&&['u','you'].includes(tokens[i+1])){units.push({kind:'word',text:'double you',letter:'W',key:'LW'});i+=2;continue}
if(/^[,;.!?]$/.test(token)){i++;continue}
const letter=LETTER_SPEECH[token];units.push({kind:'word',text:token,letter,key:letter?'L'+letter:'W'+norm(token)});i++;
}
const counts=new Map();for(const unit of units){unit.occurrence=counts.get(unit.key)||0;counts.set(unit.key,unit.occurrence+1)}return units;
}
function speechMatches(transcript,enemies,words,{consumed=new Set(),lettersOnly=false}={}){const units=speechUnits(transcript,{lettersOnly}),threats=[...enemies].sort((a,b)=>(b.y||0)-(a.y||0)),assigned=new Set(),outputs=[];for(let i=0;i<units.length;){const unit=units[i],candidates=[];for(const e of threats){if(assigned.has(e.id))continue;const q=e.q,answer=norm(q.answer);if(q.kind==='numbers'){const hit=unit.kind==='number'?Number.isInteger(unit.value)&&unit.value>=0&&unit.value<=1000&&String(unit.value)===q.answer:['oh','o'].includes(unit.text)&&q.answer==='0';if(hit)candidates.push({e,end:i+1,key:'N'+q.answer});}else if(q.kind==='letters'){if(unit.letter===q.answer)candidates.push({e,end:i+1,key:'L'+q.answer});}else{for(let j=i+1;j<=Math.min(i+4,units.length);j++){const spoken=norm(units.slice(i,j).map(u=>u.text).join(' '));if([norm(q.spoken||answer),...answersFor(q)].includes(spoken))candidates.push({e,end:j,key:'W'+answer,literal:true,canonical:spoken===norm(q.spoken||answer)});}}}candidates.sort((a,b)=>(b.end-i)-(a.end-i)||Number(!!b.literal)-Number(!!a.literal)||Number(!!b.canonical)-Number(!!a.canonical)||(b.e.y||0)-(a.e.y||0));const match=candidates.find(c=>!consumed.has(`answer:${c.key}#${unit.occurrence}`)&&!consumed.has(`source:${unit.key}#${unit.occurrence}`));if(!match){i++;continue}const q=match.e.q,answer=q.answer;let prefixAmbiguous=false;if(q.kind==='numbers'){const current=words(Number(answer)).replace(/\band\b/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();prefixAmbiguous=threats.some(e=>e.id!==match.e.id&&e.q.kind==='numbers'&&words(Number(e.q.answer)).replace(/\band\b/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase().startsWith(current));}else if(q.kind!=='letters'){const current=norm(units.slice(i,match.end).map(u=>u.text).join(' '));prefixAmbiguous=threats.some(e=>e.id!==match.e.id&&e.q.kind!=='numbers'&&answersFor(e.q).some(a=>a.length>current.length&&a.startsWith(current)));}outputs.push({id:match.e.id,revision:match.e.revision||0,answer,occurrence:`${match.key}#${unit.occurrence}`,source:`${unit.key}#${unit.occurrence}`,closed:match.end<units.length,prefixAmbiguous});assigned.add(match.e.id);i=match.end;}return outputs;}
class SpeechLedger{
constructor(){this.consumed=new Set()}
peek(text,enemies,words,{final=false,stable=false,lettersOnly=false}={}){return speechMatches(text,enemies,words,{consumed:this.consumed,lettersOnly}).filter(m=>(final||m.closed||(stable&&!m.prefixAmbiguous)))}
commit(matches){for(const m of matches){this.consumed.add(`answer:${m.occurrence}`);this.consumed.add(`source:${m.source}`)}}
take(text,enemies,words,options){const matches=this.peek(text,enemies,words,options);this.commit(matches);return matches;}
}
// Complete answers fire at once; these are the only waits (ms): a complete answer that could still grow, and a partial check.
const TYPING_WAITS={prefix:160,partial:120};
function typingPlan(value,enemies){const raw=String(value).trim(),answer=norm(raw);if(!answer)return{delay:null,reason:'empty'};const eligible=enemies.filter(e=>e.q.kind!=='numbers'||/^\d+$/.test(raw));const variants=eligible.flatMap(e=>answersFor(e.q));const exact=variants.includes(answer),longer=variants.some(v=>v.startsWith(answer)&&v.length>answer.length);if(exact)return{delay:longer?TYPING_WAITS.prefix:0,reason:longer?'ambiguous-prefix':'complete'};if(longer)return{delay:null,reason:'incomplete'};return{delay:TYPING_WAITS.partial,reason:'check-partial'};}
root.InkEngine={SurvivalEngine,MONSTERS,BOSS_ORDER,bossFor,paceOf,SKILLS,answersFor,SPEEDS,VOICE_SPEEDS,paceFor,norm,speechMatches,speechUnits,SpeechLedger,typingPlan,TYPING_WAITS};if(typeof module!=='undefined')module.exports=root.InkEngine;
})(typeof window!=='undefined'?window:globalThis);
