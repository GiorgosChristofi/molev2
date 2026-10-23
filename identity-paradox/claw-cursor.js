(() => {
  'use strict';
  const claw=document.getElementById('pointer'),paw=document.getElementById('cursorPaw');
  // Keep the native cursor when the overlay API is unavailable.
  if(!claw || typeof claw.showPopover!=='function')return;
  const fine=matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const viewer=document.getElementById('viewer');
  let x=0,y=0,visible=false,lastMove=0,clickedAt=-10000,frame=0,refreshFrame=0;
  const isOpen=()=>claw.matches(':popover-open');
  function hide(){
    visible=false;
    if(isOpen())claw.hidePopover();
    document.body.classList.remove('archive-claws');
    if(frame)cancelAnimationFrame(frame);
    frame=0;paw.removeAttribute('transform');
  }
  function updateHover(){
    const hit=document.elementFromPoint(x,y);
    claw.classList.toggle('hover',!!hit?.closest('a[href],button:not(:disabled),input,summary'));
  }
  function raise(){
    if(!visible)return;
    // Reopen after a dialog enters the top layer, above its backdrop and transformed panel.
    if(isOpen())claw.hidePopover();
    try{claw.showPopover();document.body.classList.add('archive-claws')}
    catch{hide()}
  }
  function animatePaw(t){
    frame=0;
    if(!visible || reduced.matches){paw.removeAttribute('transform');return}
    const resting=Math.min(1,Math.max(0,(t-lastMove-100)/500)),clickAge=t-clickedAt;
    const shift=(claw.classList.contains('hover')?0:1.5*(1-resting))+(clickAge>=0&&clickAge<330?Math.sin(Math.PI*clickAge/330)*5:0);
    paw.setAttribute('transform',`translate(0 ${shift.toFixed(2)})`);
    if(t-lastMove<650 || clickAge<330)frame=requestAnimationFrame(animatePaw);
  }
  function move(event){
    if(event.pointerType!=='mouse' || !fine.matches){hide();return}
    x=event.clientX;y=event.clientY;lastMove=performance.now();
    claw.style.transform=`translate3d(${x-23}px,${y-18}px,0)`;
    updateHover();
    visible=true;
    if(!isOpen())raise();
    if(!frame)frame=requestAnimationFrame(animatePaw);
  }
  document.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='mouse'){hide();return}
    if(event.button!==0 || !visible)return;
    clickedAt=performance.now();
    if(!frame)frame=requestAnimationFrame(animatePaw);
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',hide);
  document.addEventListener('pointercancel',hide);
  addEventListener('blur',hide);
  addEventListener('pagehide',hide);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
  function refresh(){
    if(!visible || refreshFrame)return;
    refreshFrame=requestAnimationFrame(()=>{refreshFrame=0;updateHover()});
  }
  addEventListener('scroll',refresh,{passive:true});
  addEventListener('resize',refresh,{passive:true});
  new MutationObserver(()=>{raise();refresh()}).observe(viewer,{attributes:true,attributeFilter:['open']});
  fine.addEventListener('change',()=>{if(!fine.matches)hide()});
  reduced.addEventListener('change',()=>{
    if(reduced.matches){if(frame)cancelAnimationFrame(frame);frame=0;paw.removeAttribute('transform')}
  });
})();
