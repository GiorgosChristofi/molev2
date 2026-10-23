const byId=id=>document.getElementById(id);
const stage=byId('stage'),hero=byId('top'),sequence=byId('sequence'),idle=byId('idle'),lamp=byId('lamp'),target=byId('target'),lighter=byId('lighter'),pointer=byId('pointer'),announce=byId('announce'),stillLit=byId('stillLit'),touchLight=byId('touchLight'),lid=byId('cursorLid'),flame=byId('cursorFlame'),label=byId('bottleLabel'),paw=byId('cursorPaw');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const TIMING={lid:240,hold:650},HOTSPOT={x:51.33,y:13.2},CLAW_HOTSPOT={x:23,y:18};
const tracks=window.MOLE_DETAILS;
let state='ready',held=false,near=false,approaching=false,chargingSince=null,openedAt=0,run=0,lidAngle=0,lastTick=performance.now(),inside=false,mouse=false,inStage=false,pointerHover=false,lastMove=performance.now(),clickedAt=-10000;
let pointerX=0,pointerY=0,overDialog=false,refreshScheduled=false;
function say(text){if(announce.textContent!==text)announce.textContent=text}
function rememberLit(){try{sessionStorage.setItem('mole-cigar-lit','1')}catch{}}
function restoreLit(){
 let remembered=false;try{remembered=sessionStorage.getItem('mole-cigar-lit')==='1'}catch{}
 if(!remembered||state!=='ready')return;
 ++run;state=reduced?'reduced':'playing';stillLit.hidden=false;armControls();placeDetails(0);
 if(reduced){say('Cigar lit. Reduced motion is enabled.');return}
 showIdle(run);
}
function syncPointer(){
 const lit=state!=='ready';document.body.classList.toggle('cigar-lit',lit);
 const r=hero.getBoundingClientRect(),inOpening=!overDialog&&pointerY>=Math.max(0,r.top)&&pointerY<r.bottom;
 const claws=lit||!inOpening,visible=inside&&mouse;
 document.body.classList.toggle('cursor-claws',visible&&claws);document.body.classList.toggle('cursor-lighter',visible&&!claws);
 lighter.classList.toggle('active',visible&&!claws);pointer.classList.toggle('active',visible&&claws);
 if(claws)lighter.style.removeProperty('display');
}
function stopHold(){held=false;chargingSince=null;stage.classList.remove('charging');lighter.classList.remove('firing');stage.style.setProperty('--charge','0')}
function updateLid(){
 const open=approaching&&state==='ready';if(open&&!lighter.classList.contains('open'))openedAt=performance.now();
 lighter.classList.toggle('open',open);lighter.classList.toggle('firing',open&&held);
}
function position(e){
 inside=true;mouse=e.pointerType==='mouse';pointerX=e.clientX;pointerY=e.clientY;lastMove=performance.now();
 lighter.style.transform=`translate3d(${e.clientX-HOTSPOT.x}px,${e.clientY-HOTSPOT.y}px,0)`;
 pointer.style.transform=`translate3d(${e.clientX-CLAW_HOTSPOT.x}px,${e.clientY-CLAW_HOTSPOT.y}px,0)`;
 refreshPointerLocation();
}
function refreshPointerLocation(){
 const hit=inside?document.elementFromPoint(pointerX,pointerY):null;
 inStage=!!hit&&stage.contains(hit);overDialog=!!hit?.closest('dialog[open]');
 pointerHover=!!hit?.closest('a,button:not(:disabled),summary');pointer.classList.toggle('hover',pointerHover);syncPointer();
 const r=target.getBoundingClientRect(),dx=pointerX-r.left-r.width/2,dy=pointerY-r.top-r.height/2,distance=Math.hypot(dx,dy);
 near=inStage&&distance<30;approaching=inStage&&distance<(approaching?86:72)&&dy<30;if(inStage&&sequence&&sequence.preload!=='auto'){sequence.preload='auto'}updateLid();
}
function refreshAfterScroll(){
 if(refreshScheduled)return;refreshScheduled=true;
 requestAnimationFrame(()=>{refreshScheduled=false;stopHold();refreshPointerLocation()});
}
function placeDetails(t){
 const end=tracks.bottle.length-1,index=state==='playing'?Math.min(end,Math.max(0,t*tracks.fps)):end;
 const a=Math.floor(index),b=Math.min(end,a+1),p=index-a,points=tracks.bottle;
 label.style.left=`${(points[a][0]*(1-p)+points[b][0]*p)/12.8}%`;label.style.top=`${(points[a][1]*(1-p)+points[b][1]*p)/7.2}%`;
}
function armControls(){target.disabled=true;touchLight.disabled=true;stage.classList.add('running');syncPointer();updateLid()}
async function showIdle(token){
 if(token!==run||state!=='playing')return;
 state='settling';say('Cigar lit. Resting smoke continues.');placeDetails(0);idle.currentTime=0;
 try{
  await idle.play();if(token!==run)return;
  const reveal=()=>{if(token!==run||state!=='settling')return;idle.classList.add('visible');sequence.pause();state='idle';syncPointer();stage.setAttribute('aria-label','Moleius resting with his lit cigar')};
  if(typeof idle.requestVideoFrameCallback==='function')idle.requestVideoFrameCallback(reveal);else reveal();
 }catch(error){if(token===run){state='reduced';stillLit.hidden=false;sequence.classList.remove('visible');syncPointer();}}
}
async function light(){
 if(state!=='ready')return;
 stopHold();idle.pause();idle.classList.remove('visible');stillLit.hidden=true;sequence.classList.remove('visible');
 state=reduced?'reduced':'playing';armControls();rememberLit();stage.setAttribute('aria-label','Moleius lighting and smoking his cigar');
 const token=++run;say('Lighting his cigar.');if(!reduced)lamp.play().catch(()=>{});
 if(reduced){stillLit.hidden=false;say('Cigar lit. Reduced motion is enabled.');placeDetails(0);return}
 try{sequence.currentTime=0;await sequence.play();if(token!==run)return;placeDetails(0);sequence.classList.add('visible')}
 catch(error){if(token===run){reset();say('Unable to play. Try lighting the cigar again.')}}
}
function reset(){
 ++run;stopHold();sequence.pause();sequence.currentTime=0;sequence.classList.remove('visible');idle.pause();idle.currentTime=0;idle.classList.remove('visible');stillLit.hidden=true;
 state='ready';target.disabled=false;touchLight.disabled=false;stage.classList.remove('running');
 stage.setAttribute('aria-label','Moleius with his unlit cigar');updateLid();syncPointer();placeDetails(0);say('Ready to light.');
}
function phase(t){if(t<.8)return 'Lighting';if(t<3)return 'Bringing cigar to mouth';if(t<5.5)return 'Taking a puff';if(t<8.3)return 'Exhaling';if(t<10)return 'Returning cigar';return 'Cigar lit'}
sequence.addEventListener('ended',()=>showIdle(run));sequence.addEventListener('error',()=>{if(state==='playing'){reset();say('Video unavailable. Reload to retry.')}});
idle.addEventListener('error',()=>{if(state==='idle'||state==='settling'){idle.classList.remove('visible');stillLit.hidden=false;state='reduced';syncPointer();}});
document.addEventListener('pointermove',position);
window.addEventListener('scroll',refreshAfterScroll,{passive:true});window.addEventListener('resize',refreshAfterScroll,{passive:true});
// A dialog can open beneath a stationary pointer without a mousemove event.
new MutationObserver(()=>refreshPointerLocation()).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
stage.addEventListener('pointerdown',e=>{
 if(e.button!==0||state!=='ready')return;held=true;position(e);if(sequence&&sequence.preload!=='auto')sequence.preload='auto';
 if(e.pointerType!=='mouse'&&(e.target===target||near)){near=approaching=true;lighter.style.display='block';updateLid()}
});
document.addEventListener('pointerdown',e=>{if(e.button===0&&state!=='ready')clickedAt=performance.now()});
window.addEventListener('pointerup',()=>{stopHold();lighter.style.removeProperty('display');updateLid()});
window.addEventListener('pointercancel',()=>{stopHold();near=approaching=false;updateLid();lighter.style.removeProperty('display')});
window.addEventListener('blur',()=>{stopHold();near=approaching=false;inside=false;updateLid();syncPointer();lighter.style.removeProperty('display')});
document.documentElement.addEventListener('pointerleave',()=>{inside=false;inStage=false;near=approaching=false;stopHold();updateLid();syncPointer()});
stage.addEventListener('pointerleave',()=>{inStage=false;near=approaching=false;stopHold();updateLid();syncPointer()});
window.addEventListener('pagehide',reset);target.addEventListener('click',e=>{if(e.detail===0)light()});touchLight.addEventListener('click',light);
window.addEventListener('pageshow',restoreLit);
function tick(t){
 const dt=Math.min(100,Math.max(0,t-lastTick));lastTick=t;
 const goal=lighter.classList.contains('open')?-110:0;lidAngle=reduced?goal:lidAngle+(goal-lidAngle)*(1-Math.exp(-dt/55));if(Math.abs(lidAngle-goal)<.02)lidAngle=goal;
 lid.setAttribute('transform',`rotate(${lidAngle.toFixed(3)} 78 650)`);
 const sx=reduced?1:1+.018*Math.sin(t*.029),sy=reduced?1:1+.028*Math.sin(t*.041);flame.setAttribute('transform',`translate(350 460) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(-350 -460)`);
 if(state==='ready'&&held&&near&&lighter.classList.contains('open')&&(reduced||t-openedAt>=TIMING.lid)){
  if(chargingSince===null)chargingSince=t;const progress=Math.min(1,(t-chargingSince)/TIMING.hold);stage.classList.add('charging');stage.style.setProperty('--charge',String(progress));if(progress===1)light();
 }else{chargingSince=null;stage.classList.remove('charging');stage.style.setProperty('--charge','0')}
 if(state==='playing'){say(phase(sequence.currentTime));placeDetails(sequence.currentTime)}
 const theta=2*Math.PI*(lamp.currentTime||0)/9;stage.style.setProperty('--room-light',reduced?'1':String(.988+.012*Math.sin(theta+.45)+.003*Math.sin(theta*3)));
 const resting=Math.min(1,Math.max(0,(t-lastMove-100)/500)),clickAge=t-clickedAt;
 const shift=reduced?0:(pointerHover?0:1.5*(1-resting))+(clickAge<330?Math.sin(Math.PI*clickAge/330)*5:0);
 paw.setAttribute('transform',`translate(0 ${shift.toFixed(2)})`);requestAnimationFrame(tick);
}
if(reduced){lamp.pause();lamp.removeAttribute('autoplay')}else lamp.play().catch(()=>{});
placeDetails(0);requestAnimationFrame(tick);
restoreLit();
