(() => {
 'use strict';
 if(parent===window)return;
 let lastHeight=0,heightFrame=0;
 function reportHeight(){
  heightFrame=0;
  const main=document.querySelector('main');
  const height=Math.ceil(main.getBoundingClientRect().bottom+12);
  if(height!==lastHeight){lastHeight=height;parent.postMessage({type:'mole-vault-height',height},'*')}
 }
 function scheduleHeight(){if(!heightFrame)heightFrame=requestAnimationFrame(reportHeight)}
 if(typeof ResizeObserver==='function')new ResizeObserver(scheduleHeight).observe(document.querySelector('main'));
 addEventListener('load',scheduleHeight);addEventListener('resize',scheduleHeight);scheduleHeight();
 let readySent=false;
 function reportReady(){
  if(!document.querySelector('#track .capsule'))return;
  if(!readySent){readySent=true;parent.postMessage({type:'mole-vault-ready'},'*')}
  scheduleHeight();
 }
 document.addEventListener('mole-vault-initialized',reportReady);
 addEventListener('pageshow',()=>{readySent=false;reportReady()});
 reportReady();
 addEventListener('message',event=>{
  if(event.source!==parent||event.data?.type!=='mole-vault-visibility')return;
  // Time spent scrolled away from the vault is not idle time spent watching it.
  if(typeof stageVisible!=='undefined'){const visible=!!event.data.visible;if(visible&&!stageVisible&&typeof touch==='function')touch();stageVisible=visible}
  if(typeof lastFrame!=='undefined')lastFrame=performance.now();
 });
 function sendPointer(e,click=false){
  const mouse=e.pointerType==='mouse';
  document.body.classList.toggle('vault-claw',mouse);
  parent.postMessage({type:'mole-vault-pointer',x:e.clientX,y:e.clientY,pointerType:e.pointerType,hover:!!e.target.closest('button:not(:disabled),a[href],input'),click},'*');
 }
 document.addEventListener('pointermove',sendPointer,{passive:true});
 document.addEventListener('pointerdown',e=>sendPointer(e,e.button===0),{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{
  document.body.classList.remove('vault-claw');parent.postMessage({type:'mole-vault-pointer-leave'},'*');
 });
})();
