(() => {
 'use strict';
 const frame=document.getElementById('homeIdentityVault');
 if(!frame)return;
 let visibilityFrame=0;
 function reportVisibility(){
  visibilityFrame=0;
  const r=frame.getBoundingClientRect();
  frame.contentWindow?.postMessage({type:'mole-vault-visibility',visible:!document.hidden&&r.bottom>-150&&r.top<innerHeight+150},'*');
 }
 function scheduleVisibility(){if(!visibilityFrame)visibilityFrame=requestAnimationFrame(reportVisibility)}
 frame.addEventListener('load',scheduleVisibility);
 addEventListener('scroll',scheduleVisibility,{passive:true});
 addEventListener('resize',scheduleVisibility,{passive:true});
 addEventListener('pageshow',scheduleVisibility);
 document.addEventListener('visibilitychange',scheduleVisibility);
 scheduleVisibility();
 addEventListener('message',event=>{
  if(event.source!==frame.contentWindow || !event.data || typeof event.data!=='object')return;
  const data=event.data;
  if(data.type==='mole-vault-ready'){
   frame.dataset.ready='true';scheduleVisibility();
  }else if(data.type==='mole-vault-height'){
   const height=Number(data.height);
   if(Number.isFinite(height)&&height>=300&&height<=1800){frame.style.height=`${Math.ceil(height)}px`;scheduleVisibility()}
  }else if(data.type==='mole-vault-open-archive'){
   (window.moleNavigate || (href => location.assign(href)))('identity-paradox/index.html');
  }else if(data.type==='mole-vault-pointer'){
   const x=Number(data.x),y=Number(data.y);
   if(!Number.isFinite(x)||!Number.isFinite(y))return;
   const r=frame.getBoundingClientRect();
   if(typeof position==='function')position({clientX:r.left+x,clientY:r.top+y,pointerType:data.pointerType==='mouse'?'mouse':'touch'});
   if(typeof pointerHover!=='undefined')pointerHover=!!data.hover;
   document.getElementById('pointer')?.classList.toggle('hover',!!data.hover);
   if(data.click && typeof clickedAt!=='undefined')clickedAt=performance.now();
  }else if(data.type==='mole-vault-pointer-leave'){
   if(typeof inside!=='undefined')inside=false;
   if(typeof syncPointer==='function')syncPointer();
  }
 });
})();
