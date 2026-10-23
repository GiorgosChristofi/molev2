(() => {
  /*
    Token Contract & Trade details
  */
  const contractAddress = '6rk8pkB572s5ConYzCJMytTF8RoMrTwpurEpNKs4pump';
  const tradeUrl = 'https://pump.fun/coin/6rk8pkB572s5ConYzCJMytTF8RoMrTwpurEpNKs4pump';

  const caText = document.getElementById('caText');
  const tradeLink = document.getElementById('tradeLink');
  const copyButton = document.getElementById('copyCA');

  const getCA = () => {
    const text = (contractAddress || (caText ? caText.textContent.trim() : '')).trim();
    if (!text || text === '-' || text.toUpperCase() === 'NOT LIVE') {
      return '';
    }
    return text;
  };

  const currentCA = getCA();

  if (caText) {
    caText.textContent = currentCA ? currentCA : '-';
  }

  if (tradeLink) {
    if (tradeUrl) {
      tradeLink.href = tradeUrl;
      tradeLink.removeAttribute('aria-disabled');
      tradeLink.removeAttribute('tabindex');
      tradeLink.classList.remove('disabled');
      tradeLink.target = '_blank';
      tradeLink.rel = 'noreferrer';
    } else {
      tradeLink.href = '#';
      tradeLink.setAttribute('aria-disabled', 'true');
      tradeLink.setAttribute('tabindex', '-1');
      tradeLink.classList.add('disabled');
      tradeLink.addEventListener('click', e => e.preventDefault());
    }
  }

  if (copyButton) {
    const defaultMarkup = copyButton.innerHTML;
    let resetTimer;
    copyButton.addEventListener('click', async () => {
      const ca = getCA();
      if (!ca) {
        const old = copyButton.textContent;
        copyButton.textContent = '—';
        setTimeout(() => copyButton.textContent = old, 650);
        return;
      }

      if (typeof window.copyText === 'function') {
        await window.copyText(ca);
      }
      clearTimeout(resetTimer);
      copyButton.innerHTML = '<svg class="ui-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6"/></svg>';
      copyButton.setAttribute('aria-label', 'Contract address copied');
      resetTimer = setTimeout(() => {
        copyButton.innerHTML = defaultMarkup;
        copyButton.setAttribute('aria-label', 'Copy contract address');
      }, 900);
    });
  }
})();
