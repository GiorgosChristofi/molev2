(()=>{
'use strict';
const header=document.getElementById('siteHeader'),progress=document.getElementById('readingProgress'),menu=document.getElementById('siteMenu'),open=document.getElementById('openMenu'),close=document.getElementById('closeMenu'),claw=document.getElementById('pointer');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const chapters=[...document.querySelectorAll('main>[id],main>.community[id]')];
const nav=[...header.querySelectorAll('.section-link')];
let scheduled=false,returnFocus=null;
function update(){scheduled=false;const y=scrollY,max=document.documentElement.scrollHeight-innerHeight;header.classList.toggle('scrolled',y>65);progress.style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,y/max)):0})`;const current=chapters.filter(s=>s.getBoundingClientRect().top<innerHeight*.35).at(-1);for(const a of nav){const active=current&&a.hash==='#'+current.id;a.classList.toggle('is-active',!!active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')}}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});addEventListener('load',schedule);update();
open?.addEventListener('click',()=>{if(menu.open)return;returnFocus=open;menu.showModal();menu.append(claw);open.setAttribute('aria-expanded','true');document.body.classList.add('menu-open');close.focus()});
function closeMenu(){if(menu?.open)menu.close()}
close?.addEventListener('click',closeMenu);
menu?.addEventListener('close',()=>{open.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');document.body.append(claw);returnFocus?.focus({preventScroll:true})});
menu?.addEventListener('click',e=>{if(e.target.closest('[data-menu-link]')){returnFocus=null;closeMenu()}});
const pause=document.getElementById('pausePortraits'),portraits=document.getElementById('portraitProcession');
pause?.addEventListener('click',()=>{const paused=pause.getAttribute('aria-pressed')!=='true';pause.setAttribute('aria-pressed',String(paused));portraits.classList.toggle('portraits-paused',paused);pause.innerHTML=paused?'<span aria-hidden="true">▷</span> Resume movement':'<span aria-hidden="true">Ⅱ</span> Pause movement'});
// Reveal only the added chapter content. All original content stays visible without JavaScript.
if(!reduced&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.remove('pending-reveal');observer.unobserve(e.target)}},{threshold:.08,rootMargin:'0px 0px -30px 0px'});for(const el of document.querySelectorAll('.circle-intro,.circle-art,.social-directory,.notes-intro,.notes-list,.closing-section>.eyebrow,.closing-section>h2,.closing-actions')){el.classList.add('reveal-on-scroll','pending-reveal');observer.observe(el)}}
document.querySelectorAll('.notes-list details').forEach(details=>details.addEventListener('toggle',schedule));
window.MOLE_SITE={openMenu:()=>open?.click(),closeMenu,updateReadingProgress:update};
})();
