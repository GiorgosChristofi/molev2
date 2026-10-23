(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const items = window.MOLE_IDENTITIES;
  const PAGE_SIZE = 10;
  const sourceSize = {width:1672,height:941};
  const gallery = $('#identityGallery'), universe = $('.universe'), search = $('#search');
  const scene = $('main'), nameplate = $('.archive-nameplate');
  const dialog = $('#viewer'), viewerImage = $('#viewerImage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const slots = [[50,1],[73,14],[89,33],[89,58],[73,80],[50,91],[27,80],[11,58],[11,33],[27,14]];
  let filtered = [...items], page = 0, selected = null, opener = null, generation = 0;
  let searchTimer, restoreAfterClose = true;
  const imageCache = new Map();
  const noMotion = () => reduced.matches;
  const pad = n => String(n).padStart(2,'0');

  function picture(item, fullQuality = false) {
    const box = document.createElement('div');
    box.className = 'crop-picture';
    const img = new Image(); img.src = item.src; img.alt = `${item.name} — Monero Mole identity`;
    img.draggable = false; img.decoding = 'async';
    if (item.crop) {
      const [x,y,w,h] = item.crop;
      img.style.cssText = `width:${sourceSize.width/w*100}%;height:${sourceSize.height/h*100}%;left:${-x/w*100}%;top:${-y/h*100}%`;
    } else { box.classList.add('original-picture'); }
    box.append(img);
    if (fullQuality && item.original) {
      img.dataset.quality = 'thumbnail';
      const original = new Image();
      original.src = item.original;
      original.decode().then(() => {
        img.src = item.original;
        img.dataset.quality = 'original';
      }).catch(() => { img.dataset.quality = 'preview-fallback'; });
    }
    return box;
  }

  function connect(card) {
    if (dialog.open && opener?.isConnected && card !== opener) return;
    const sceneRect=universe.getBoundingClientRect(), cardRect=card.getBoundingClientRect();
    const lightX=Math.max(16,Math.min(84,(cardRect.x+cardRect.width/2-sceneRect.x)/sceneRect.width*100));
    scene.style.setProperty('--title-light-x',`${lightX}%`);
    scene.classList.add('identity-active');
    if (matchMedia('(max-width:760px)').matches) return;
    universe.classList.add('has-active');
    const root = universe.getBoundingClientRect(), target = card.getBoundingClientRect();
    const centre = $('.coin').getBoundingClientRect();
    const x1 = (centre.x+centre.width/2-root.x)/root.width*1440;
    const y1 = (centre.y+centre.height/2-root.y)/root.height*800;
    const x2 = (target.x+target.width/2-root.x)/root.width*1440;
    const y2 = (target.y+target.height/2-root.y)/root.height*800;
    universe.style.setProperty('--vault-light-angle', `${Math.atan2(y2-y1,x2-x1)*180/Math.PI+90}deg`);
    const path = $('#connectionPath');
    const route = `M ${x1} ${y1} Q ${(x1+x2)/2} ${Math.min(y1,y2)-45} ${x2} ${y2}`;
    if (path.getAttribute('d') === route && $('#connection').classList.contains('active')) return;
    path.setAttribute('d',route);
    path.setAttribute('pathLength','1');
    $('#connection').classList.remove('active');
    void path.getBoundingClientRect();
    $('#connection').classList.add('active');
  }
  function disconnect(force = false) {
    if (!force && dialog.open && opener?.isConnected) { connect(opener); return; }
    universe.classList.remove('has-active'); $('#connection').classList.remove('active');
    scene.classList.remove('identity-active');
    if(!nameplate.classList.contains('is-hovered'))scene.style.removeProperty('--title-light-x');
  }

  // A soft reflected highlight follows the pointer over the illustration itself.
  nameplate.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch')return;
    const r=nameplate.getBoundingClientRect();
    scene.style.setProperty('--title-light-x',`${Math.max(16,Math.min(84,(e.clientX-r.left)/r.width*100))}%`);
    nameplate.classList.add('is-hovered');
  });
  nameplate.addEventListener('pointerleave',()=>{
    nameplate.classList.remove('is-hovered');
    if(dialog.open && opener?.isConnected)connect(opener);
    else scene.style.removeProperty('--title-light-x');
  });

  function makeCard(item, index, count) {
    const button = document.createElement('button'); button.className = 'identity-card';
    button.dataset.id = item.id; button.setAttribute('aria-label',`View ${item.name} identity`);
    button.setAttribute('aria-haspopup','dialog');
    button.setAttribute('aria-controls','viewer');
    button.setAttribute('aria-expanded','false');
    let [x,y] = slots[index] || [50,50];
    if (count < 10) {
      const angle = -Math.PI/2 + index*Math.PI*2/count;
      x = 50+40*Math.cos(angle); y = 47+39*Math.sin(angle);
      if (count === 1) {x=50; y=1;}
    }
    button.style.setProperty('--x',x);button.style.setProperty('--y',y);
    button.style.setProperty('--delay',`${-index*.73}s`);
    const body = document.createElement('span'); body.className = 'float-body';
    const frame = document.createElement('span'); frame.className = 'portrait-frame'; frame.append(picture(item));
    const ring = document.createElement('span');ring.className = 'light-ring';ring.setAttribute('aria-hidden','true');
    const reflection = document.createElement('span');reflection.className='ring-reflection';reflection.setAttribute('aria-hidden','true');
    const name = document.createElement('span');name.className='identity-name';name.textContent=item.name;
    const pill = document.createElement('span');pill.className='view-pill';pill.innerHTML='View identity <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';pill.setAttribute('aria-hidden','true');
    body.append(ring,reflection,frame,name,pill);button.append(body);
    button.addEventListener('pointerenter',()=>connect(button));
    button.addEventListener('pointerleave',()=>disconnect());
    button.addEventListener('focus',()=>connect(button));
    button.addEventListener('blur',()=>disconnect());
    button.addEventListener('click',()=>openViewer(item,button));
    return button;
  }
  async function render(animate = true) {
    const ticket = ++generation;
    const focusId = document.activeElement?.dataset?.id;
    disconnect();
    if (animate && !noMotion() && gallery.children.length) {
      gallery.classList.add('leaving');
      await new Promise(r=>setTimeout(r,180));
      if (ticket !== generation) return;
    }
    const maxPage = Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
    page = Math.max(0,Math.min(page,maxPage-1));
    const visible = filtered.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
    gallery.replaceChildren(...visible.map((item,i)=>makeCard(item,i,visible.length)));
    $('#pageCurrent').textContent=pad(page+1);$('#pageTotal').textContent=pad(maxPage);
    $('#prevPage').disabled=page===0;$('#nextPage').disabled=page>=maxPage-1;
    $('#emptyState').hidden=filtered.length>0;universe.classList.toggle('is-empty',!filtered.length);
    $('#clearSearch').hidden=!search.value;
    $('#searchStatus').textContent=search.value ? `${filtered.length} ${filtered.length===1?'identity':'identities'} found` : '';
    requestAnimationFrame(()=>gallery.classList.remove('leaving'));
    if (focusId) gallery.querySelector(`[data-id="${CSS.escape(focusId)}"]`)?.focus({preventScroll:true});
  }
  function applySearch() {
    if (dialog.open) closeViewer(false);
    const q=search.value.trim().toLocaleLowerCase();
    filtered=items.filter(item=>`${item.name} ${(item.tags||[]).join(' ')}`.toLocaleLowerCase().includes(q));
    page=0;render();
  }
  search.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(applySearch,90)});
  $('.search-shell').addEventListener('submit',e=>{e.preventDefault();clearTimeout(searchTimer);applySearch()});
  function clearSearch() {clearTimeout(searchTimer);search.value='';applySearch();search.focus()}
  $('#clearSearch').addEventListener('click',clearSearch);$('#resetSearch').addEventListener('click',clearSearch);
  $('#prevPage').addEventListener('click',()=>{if(page>0){closeViewer(false);page--;render()}});
  $('#nextPage').addEventListener('click',()=>{if((page+1)*PAGE_SIZE<filtered.length){closeViewer(false);page++;render()}});

  const collections = {'trump':'The President','goku':'Dragon Ball','all-might':'My Hero Academia','gandalf':'The Lord of the Rings','frodo':'The Lord of the Rings','jason':'Friday the 13th','kaneki':'Tokyo Ghoul','spawn':'Spawn','guts':'Berserk','lelouch':'Code Geass'};
  function markSelection() {
    gallery.querySelectorAll('.identity-card').forEach(card => {
      const active = dialog.open && card.dataset.id === selected?.id;
      card.classList.toggle('is-selected', active);
      card.setAttribute('aria-expanded', String(active));
    });
  }
  function setViewer(item) {
    selected = item;
    opener = gallery.querySelector(`[data-id="${CSS.escape(item.id)}"]`) || opener;
    viewerImage.replaceChildren(picture(item, true));
    $('#viewerTitle').textContent = item.name;

    $('#viewerSerial').textContent = pad(items.findIndex(i=>i.id===item.id)+1);
    const sequence = filtered.length ? filtered : items;
    $('#viewerPosition').textContent = `${pad(sequence.findIndex(i=>i.id===item.id)+1)} / ${pad(sequence.length)}`;
    $('#prevIdentity').disabled = sequence.length < 2;
    $('#nextIdentity').disabled = sequence.length < 2;
    $('#downloadStatus').textContent = '';
    $('#downloadIdentity span').textContent = 'Download PNG';
    markSelection();
  }
  function openViewer(item,button) {
    opener=button;setViewer(item);
    if(!dialog.open){
      document.body.classList.add('viewer-open');
      dialog.showModal();
    }
    markSelection();connect(opener);
    $('#closeViewer').focus({preventScroll:true});
  }
  function stepIdentity(delta) {
    const sequence=filtered.length?filtered:items;
    const index=sequence.findIndex(i=>i.id===selected.id);
    const next=sequence[(index+delta+sequence.length)%sequence.length];
    const targetPage=Math.floor(filtered.findIndex(i=>i.id===next.id)/PAGE_SIZE);
    if(targetPage!==page && targetPage>=0){page=targetPage;render(false);}
    setViewer(next);connect(opener);
    if(!noMotion())viewerImage.animate([{opacity:.3,transform:'translateY(3px)'},{opacity:1,transform:'none'}],{duration:200,easing:'ease-out'});
  }
  function closeViewer(restoreFocus = true) {
    if(!dialog.open)return;
    restoreAfterClose=restoreFocus;dialog.close();
  }
  $('#prevIdentity').addEventListener('click',()=>stepIdentity(-1));
  $('#nextIdentity').addEventListener('click',()=>stepIdentity(1));
  $('#closeViewer').addEventListener('click',()=>closeViewer());
  dialog.addEventListener('close',()=>{
    const previous=opener;
    selected=null;markSelection();disconnect(true);
    document.body.classList.remove('viewer-open');
    if(restoreAfterClose && previous?.isConnected)previous.focus({preventScroll:true});
    restoreAfterClose=true;
  });
  // Close on a backdrop press and release, never a drag out of the portrait.
  let backdropPress = false;
  function outsidePanel(event) {
    const r=dialog.getBoundingClientRect();
    return event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom;
  }
  dialog.addEventListener('pointerdown',e=>{backdropPress=e.target===dialog && outsidePanel(e)});
  dialog.addEventListener('pointerup',e=>{
    if(backdropPress && e.target===dialog && outsidePanel(e))closeViewer();
    backdropPress=false;
  });
  dialog.addEventListener('pointercancel',()=>{backdropPress=false});
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeViewer()});
  document.addEventListener('keydown',e=>{
    if(!dialog.open)return;
    if(e.key==='Escape'){e.preventDefault();closeViewer();}
    else if(dialog.contains(document.activeElement) && e.key==='ArrowRight'){e.preventDefault();stepIdentity(1);}
    else if(dialog.contains(document.activeElement) && e.key==='ArrowLeft'){e.preventDefault();stepIdentity(-1);}
  });
  addEventListener('resize',()=>{if(dialog.open && opener?.isConnected)connect(opener)});

  function loadImage(src) {
    if(!imageCache.has(src))imageCache.set(src,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Unable to load the artwork'));i.src=src}));
    return imageCache.get(src);
  }
  $('#downloadIdentity').addEventListener('click',async()=>{
    const item=selected,button=$('#downloadIdentity');button.disabled=true;
    try {
      if (item.original) {
        const link = document.createElement('a');
        link.href = item.original;
        link.download = item.filename || `${item.name}.png`;
        document.body.append(link);link.click();link.remove();
        $('#downloadStatus').textContent = `${item.name} original download started`;
        return;
      }
      const image=await loadImage(item.src),canvas=document.createElement('canvas');
      const [x,y,w,h]=item.crop||[0,0,image.naturalWidth,image.naturalHeight];
      canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(image,x,y,w,h,0,0,w,h);
      /* toDataURL keeps local file:// previews downloadable without a server. */
      const link=document.createElement('a');link.href=canvas.toDataURL('image/png');link.download=`mole-${item.id}.png`;
      document.body.append(link);link.click();link.remove();$('#downloadStatus').textContent=`${item.name} download started`;
    } catch(error) {
      $('#downloadStatus').textContent='The image could not be downloaded. Try opening this preview through its local server.';
      button.querySelector('span').textContent='Try download again';
    } finally {button.disabled=false}
  });
  // Ambient motion is automatic; CSS follows the visitor's reduced-motion preference.
  function syncVisibility() {
    document.body.classList.toggle('motion-paused',document.hidden);
  }
  document.addEventListener('visibilitychange',syncVisibility);
  syncVisibility();render(false);
  window.IDENTITY_PARADOX={get items(){return items},get filtered(){return filtered},get selected(){return selected},get page(){return page},render,applySearch};
})();
