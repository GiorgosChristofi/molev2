(() => {
  /* QR built from the address text on the page, so the two can never disagree */
  const general = document.getElementById('xmrGeneral');

  if (general && typeof qrcode === 'function') {
    const addr = general.textContent.trim();
    const q = qrcode(0, 'M'); q.addData('monero:' + addr); q.make();
    const qrContainer = document.getElementById('qrGeneral');
    if (qrContainer) {
      qrContainer.innerHTML = q.createSvgTag({ scalable: true, margin: 0 });
    }

    const btn = document.getElementById('copyGeneral');
    if (btn) {
      let resetTimer = null;

      btn.addEventListener('click', async () => {
        if (typeof window.copyText === 'function') {
          await window.copyText(addr);
        }
        btn.textContent = 'Copied';
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => { btn.textContent = 'Copy address'; }, 1600);
      });
    }
  }
})();
