// Regression tests for the home page Identity Vault carousel (home-identity-vault/ in an iframe).
// They reach into the vault's globals (capsules, metrics, lastFrame, ...) to pin down the exact
// failure modes that previously left the carousel empty.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Keep the tests local and deterministic: no fonts, analytics or other outside requests.
  await page.route(url => !/^http:\/\/localhost[:/]/.test(url.href), route => route.abort());
});

async function openVault(page, { scroll = true } = {}) {
  await page.goto('/index.html');
  await expect(page.locator('#homeIdentityVault')).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });
  const frame = page.frame({ url: /home-identity-vault\/index\.html/ });
  if (scroll) await scrollToVault(page);
  return frame;
}

async function scrollToVault(page) {
  await page.evaluate(() => document.getElementById('aliases').scrollIntoView({ behavior: 'instant', block: 'start' }));
  // Let the parent report visibility and the carousel run for a few frames.
  await page.waitForTimeout(800);
}

// Capsules the carousel currently shows inside the chamber.
function shownCapsules(frame) {
  return frame.evaluate(() => {
    const { size, width } = measure();
    return capsules.filter(o => o.el.style.visibility === 'visible' && o.x + size > 0 && o.x < width).length;
  });
}

// Every capsule must sit on the loop: wrapped capsules re-enter from the right, never beyond it.
function capsulesOnLoop(frame) {
  return frame.evaluate(() => {
    const { size, gap } = measure(), step = size + gap, total = capsules.length * step;
    return capsules.every(o => Number.isFinite(o.x) && o.x >= -step - 1 && o.x < total);
  });
}

test('capsules are on screen after scrolling down to the vault', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#homeIdentityVault')).toHaveAttribute('data-ready', 'true', { timeout: 20_000 });
  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel(0, 150);
    await page.waitForTimeout(30);
  }
  await scrollToVault(page);
  const frame = page.frame({ url: /home-identity-vault\/index\.html/ });
  await expect.poll(() => shownCapsules(frame)).toBeGreaterThanOrEqual(2);
  expect(await capsulesOnLoop(frame)).toBe(true);
});

test('a frame timestamp older than lastFrame never runs the carousel backwards', async ({ page }) => {
  const frame = await openVault(page);
  // Scroll messages stamp lastFrame with performance.now(), which can be ahead of the next
  // requestAnimationFrame timestamp. Exaggerate that so a negative dt would be unmistakable.
  await frame.evaluate(() => new Promise(resolve => {
    let n = 0;
    (function skew() {
      lastFrame = performance.now() + 60_000;
      if (++n < 5) requestAnimationFrame(skew); else requestAnimationFrame(() => requestAnimationFrame(resolve));
    })();
  }));
  await page.waitForTimeout(300);
  expect(await capsulesOnLoop(frame)).toBe(true);
  expect(await frame.evaluate(() => Number.isFinite(idleSpeed) && idleSpeed >= 0)).toBe(true);
  await expect.poll(() => shownCapsules(frame)).toBeGreaterThanOrEqual(1);
});

test('the carousel re-measures when the chamber is sized after the script runs', async ({ page }) => {
  // iOS WebKit can run the vault script on a first, uncached load before the frame is laid out,
  // and no window resize follows. Simulate that by hiding the chamber while the script starts.
  await page.route(/home-identity-vault\/index\.html/, async route => {
    const response = await route.fetch();
    const html = (await response.text()).replace('</head>',
      '<style id="late-size">#chamber{display:none!important}</style>' +
      '<script>setTimeout(()=>document.getElementById("late-size").remove(),1500)</script></head>');
    await route.fulfill({ response, body: html });
  });
  const frame = await openVault(page);
  await expect.poll(() => frame.evaluate(() => measure().width), { timeout: 5_000 }).toBeGreaterThan(0);
  expect(await frame.evaluate(() => measure().width === chamber.clientWidth)).toBe(true);
  await expect.poll(() => shownCapsules(frame)).toBeGreaterThanOrEqual(1);
});

test('time spent scrolled away from the vault does not trigger an idle reveal', async ({ page }) => {
  const frame = await openVault(page, { scroll: false });
  await expect.poll(() => frame.evaluate(() => stageVisible)).toBe(false);
  // As if the visitor spent a minute on the hero (e.g. watching the cigar video).
  await frame.evaluate(() => { lastActivity = performance.now() - 60_000; });
  await scrollToVault(page);
  await page.waitForTimeout(500);
  expect(await frame.evaluate(() => busy)).toBe(false);
  await expect(frame.locator('#chamber')).not.toHaveClass(/identities-sealed/);
  await expect.poll(() => shownCapsules(frame)).toBeGreaterThanOrEqual(1);
});

test('an automatic reveal keeps identities visible until its artwork has loaded', async ({ page }) => {
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route(/identity-paradox\/collection\/originals\//, async route => { await held; await route.continue(); });
  const frame = await openVault(page);
  await frame.evaluate(() => { reveal(true); });
  await page.waitForTimeout(600);
  expect(await frame.evaluate(() => busy)).toBe(true);
  await expect(frame.locator('#chamber')).not.toHaveClass(/identities-sealed/);
  expect(await shownCapsules(frame)).toBeGreaterThanOrEqual(1);
  release();
  await expect(frame.locator('#chamber')).toHaveClass(/identities-sealed/, { timeout: 10_000 });
});

test('a manual reveal seals the identities straight away', async ({ page }) => {
  await page.route(/identity-paradox\/collection\/originals\//, () => {});
  const frame = await openVault(page);
  await frame.locator('#pull').click();
  await expect(frame.locator('#chamber')).toHaveClass(/identities-sealed/);
});
