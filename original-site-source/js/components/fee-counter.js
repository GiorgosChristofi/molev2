(() => {
  /* ---------- live fee counter ----------
     Token: 6rk8pkB572s5ConYzCJMytTF8RoMrTwpurEpNKs4pump
     Fees generated from the pump.fun token launch are retrieved via pump.fun's advanced indexer
     (as shown when clicking the "Audit" tab on pump.fun) and displayed in terms of wXMR.
  */
  const TOKEN_ADDRESS = '6rk8pkB572s5ConYzCJMytTF8RoMrTwpurEpNKs4pump';
  const PUMP_INDEXER_URL = `https://advanced-indexer.pump.fun/in-memory-coin/${TOKEN_ADDRESS}`;
  const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(PUMP_INDEXER_URL)}`;
  const PUMP_VERIFY_URL = `https://pump.fun/coin/${TOKEN_ADDRESS}`;
  const REFRESH_MS = 3 * 60 * 1000;

  // Baseline fallback snapshot in case network is unreachable
  const FALLBACK_FEES_WXMR = 0.25;
  const FALLBACK_FEES_USD = 28.62;

  const feeAmount = document.getElementById('feeAmount');
  const feeStatus = document.getElementById('feeStatus');
  const feeDetails = document.getElementById('feeDetails');
  const feeVerify = document.getElementById('feeVerify');

  if (!feeAmount) return;

  if (feeVerify) {
    feeVerify.href = PUMP_VERIFY_URL;
    feeVerify.textContent = 'verify on pump.fun ↗';
    feeVerify.hidden = false;
  }

  // Format helpers
  const fmtToken = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtUsd = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Fetch pump.fun fees generated
  const fetchPumpFees = async () => {
    // 1. Direct fetch attempt
    try {
      const res = await fetch(PUMP_INDEXER_URL);
      if (res.ok) {
        const j = await res.json();
        const feeToken = typeof j.totalFees === 'number' ? j.totalFees : parseFloat(j.totalFees) || 0;
        const feeUsd = typeof j.totalFeesUSD === 'number' ? j.totalFeesUSD : parseFloat(j.totalFeesUSD) || 0;
        return { feeToken, feeUsd, isLive: true };
      }
    } catch (e) { /* fallback to proxy */ }

    // 2. CORS Proxy fallback attempt
    try {
      const res = await fetch(PROXY_URL);
      if (res.ok) {
        const p = await res.json();
        if (p && p.contents) {
          const j = JSON.parse(p.contents);
          const feeToken = typeof j.totalFees === 'number' ? j.totalFees : parseFloat(j.totalFees) || 0;
          const feeUsd = typeof j.totalFeesUSD === 'number' ? j.totalFeesUSD : parseFloat(j.totalFeesUSD) || 0;
          return { feeToken, feeUsd, isLive: true };
        }
      }
    } catch (e) { /* fallback to cached snapshot */ }

    return { feeToken: FALLBACK_FEES_WXMR, feeUsd: FALLBACK_FEES_USD, isLive: false };
  };

  let isUpdating = false;

  const refreshFees = async () => {
    if (isUpdating) return;
    isUpdating = true;

    try {
      const data = await fetchPumpFees();

      feeAmount.textContent = fmtToken(data.feeToken);

      const statusPrefix = data.isLive ? 'live · last check ' : 'cached · ';
      if (feeStatus) {
        feeStatus.textContent = statusPrefix + clock();
      }

      if (feeDetails && data.feeUsd > 0) {
        feeDetails.textContent = `≈ $${fmtUsd(data.feeUsd)} USD`;
      }

      const feecountBox = document.getElementById('feecount');
      if (feecountBox) {
        feecountBox.title = `Generated: ${fmtToken(data.feeToken)} wXMR (≈ $${fmtUsd(data.feeUsd)} USD) on pump.fun`;
      }
    } catch (err) {
      if (feeStatus) {
        feeStatus.textContent = (feeAmount.textContent.trim() === '—' ? '' : 'showing last reading · ') + 'retrying...';
      }
    } finally {
      isUpdating = false;
    }
  };

  // Run initial refresh and start interval
  refreshFees();
  setInterval(refreshFees, REFRESH_MS);
})();
