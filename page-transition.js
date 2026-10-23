(() => {
  'use strict';
  const root = document.documentElement;
  let leaving = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const painted = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const reveal = () => {
    leaving = false;
    root.classList.add('page-entering');
    root.classList.remove('page-leaving');
    painted().then(() => root.classList.remove('page-entering'));
  };
  root.classList.add('page-entering');
  document.addEventListener('DOMContentLoaded', async () => {
    const heroImage = document.querySelector('.artwork > img, .masthead img');
    const heroReady = (heroImage && heroImage.complete)
      ? Promise.resolve()
      : (heroImage && typeof heroImage.decode === 'function' ? heroImage.decode().catch(() => {}) : wait(100));
    await Promise.race([heroReady, wait(250)]);
    reveal();
  }, { once: true });
  // Cached documents retain their exit classes when restored by browser Back.
  addEventListener('pageshow', event => { if (event.persisted) reveal(); });
  addEventListener('pagehide', () => {
    // Keep the browser's cached history snapshot covered until pageshow.
    root.classList.add('page-entering');
    root.classList.remove('page-leaving');
  });
  window.moleNavigate = async href => {
    if (leaving) return;
    leaving = true;
    root.classList.remove('page-entering');
    root.classList.add('page-leaving');
    if (!reduced.matches) await wait(340);
    await painted();
    location.assign(href);
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search) || !/\/(?:identity-paradox\/)?(?:index|preview)\.html$/.test(url.pathname)) return;
    event.preventDefault();
    window.moleNavigate(url.href);
  });
})();
