(() => {
  /* terminal prompt cycles through the same idea, different words */
  const promptEl = document.querySelector('.prompt');
  if (!promptEl) return;

  const lines = ['DIG DEEPER.', 'NO TRACE.', 'STAY UNDERGROUND.', 'PRIVATE BY DEFAULT.'];
  const cursor = promptEl.querySelector('.cursor');
  let li = 0, ci = lines[0].length, typing = false;

  const tick = () => {
    const target = lines[li];

    if (typing) {
      ci++;
      if (ci >= target.length) { typing = false; setTimeout(tick, 2600); }
      else setTimeout(tick, 55);
    } else {
      ci--;
      if (ci <= 0) { typing = true; li = (li + 1) % lines.length; setTimeout(tick, 260); }
      else setTimeout(tick, 28);
    }

    promptEl.firstChild.textContent = target.slice(0, Math.max(0, ci));
  };

  promptEl.firstChild.textContent = lines[0];
  setTimeout(tick, 3200);
})();
