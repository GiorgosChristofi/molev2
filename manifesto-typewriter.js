(() => {
  'use strict';
  const copy = document.querySelector('.manifesto-copy');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const handheld = matchMedia('(max-width:760px), (pointer:coarse)');
  if (!copy || motion.matches || handheld.matches || !('IntersectionObserver' in window)) return;
  const letters = [];
  for (const block of copy.querySelectorAll(':scope > p, :scope > blockquote')) {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const character of node.textContent) {
        const span = document.createElement('span');
        span.className = 'manifesto-letter';
        span.textContent = character;
        fragment.append(span);
        letters.push(span);
      }
      node.replaceWith(fragment);
    }
    if (letters.length) letters[letters.length - 1].dataset.pause = 'true';
  }
  let index = 0, visible = false, frame = 0, last = 0, budget = 0, pauseUntil = 0;
  let caret;
  const removeCaret = () => { caret?.classList.remove('typing-caret'); caret = null; };
  function finish() {
    cancelAnimationFrame(frame);
    frame = 0;
    removeCaret();
    for (const span of letters) span.classList.add('typed');
    index = letters.length;
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || index >= letters.length) return;
    if (!last) last = now;
    budget += Math.min(now - last, 70) * .065;
    last = now;
    if (now >= pauseUntil) {
      while (budget >= 1 && index < letters.length) {
        removeCaret();
        caret = letters[index++];
        caret.classList.add('typed', 'typing-caret');
        budget--;
        if (caret.dataset.pause) { pauseUntil = now + 280; budget = 0; break; }
      }
    } else budget = 0;
    if (index < letters.length) frame = requestAnimationFrame(tick);
    else removeCaret();
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0; last = 0;
    if (motion.matches || handheld.matches) { finish(); return; }
    if (visible && !document.hidden && index < letters.length) frame = requestAnimationFrame(tick);
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }, { threshold: 0, rootMargin: '-80px 0px -60px 0px' }).observe(copy);
  motion.addEventListener('change', sync);
  handheld.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; });
  addEventListener('pageshow', sync);
})();
