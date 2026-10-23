(() => {
  'use strict';
  const field = document.querySelector('.cipher-art .binary');
  if (!field) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const bytes = [];
  for (const group of [...field.children]) {
    const words = group.textContent.trim().split(/\s+/);
    group.replaceChildren();
    words.forEach((word, index) => {
      if (index) group.append(' ');
      const byte = document.createElement('span');
      byte.className = 'cipher-byte';
      byte.textContent = word;
      group.append(byte);
      bytes.push(byte);
    });
  }
  let visible = false, timer;
  const active = new Map();
  function stop() {
    clearTimeout(timer);
    for (const animation of active.values()) animation.cancel();
    active.clear();
  }
  function pulse() {
    if (!visible || document.hidden || motion.matches) return;
    const available = bytes.filter(byte => !active.has(byte));
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count && available.length; i++) {
      const byte = available.splice(Math.floor(Math.random() * available.length), 1)[0];
      const animation = byte.animate([
        { color: '#b0a18b', textShadow: '0 0 0 transparent', offset: 0 },
        { color: '#f5c489', textShadow: '0 0 7px #ed922753', offset: .45 },
        { color: '#dfb17b', textShadow: '0 0 4px #ed922729', offset: .65 },
        { color: '#b0a18b', textShadow: '0 0 0 transparent', offset: 1 }
      ], { duration: 3800 + Math.random() * 1600, easing: 'ease-in-out' });
      active.set(byte, animation);
      animation.onfinish = () => { active.delete(byte); animation.cancel(); };
    }
    timer = setTimeout(pulse, 1000 + Math.random() * 1000);
  }
  function sync() { stop(); pulse(); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: .05 }).observe(field);
  } else { visible = true; sync(); }
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  addEventListener('pagehide', stop);
  addEventListener('pageshow', sync);
})();
