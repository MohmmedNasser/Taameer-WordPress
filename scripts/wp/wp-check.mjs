/**
 * wp-check.mjs — functional checks of the WordPress homepage (WP phase 1).
 *   PW_MODULE=<playwright> node scripts/wp/wp-check.mjs [url=https://taameer.local/]
 * Checks: one h1, images have alt and load, sticky header, mobile menu (open / Esc-or-close / focus), before/after
 * slider (keyboard), counters reach their value, entrance animations finish, reduced motion shows everything,
 * every link and image URL on the page (status), no console errors.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const url = process.argv[2] || 'https://taameer.local/';
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };

const browser = await chromium.launch();
async function open(width, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, ignoreHTTPSErrors: true, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1500);
  return { ctx, page, errors };
}
async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 300) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(100); }
  await page.waitForTimeout(2500);
}

/* ---- Desktop ---- */
{
  const { ctx, page, errors } = await open(1280);
  check('exactly one h1', (await page.locator('h1').count()) === 1);
  const headings = await page.$$eval('h1,h2,h3', (els) => els.map((e) => e.tagName));
  check('heading order starts with h1, no h3 before first h2', headings[0] === 'H1' && headings.indexOf('H3') > headings.indexOf('H2'), headings.join(' '));
  const noAlt = await page.$$eval('main img, #content img, footer img, header img', (els) => els.filter((i) => !i.hasAttribute('alt')).map((i) => i.src));
  check('every image has an alt attribute', noAlt.length === 0, noAlt.join(', '));

  await scrollThrough(page);
  const broken = await page.$$eval('img', (els) => els.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
  check('no broken images after scrolling', broken.length === 0, broken.join(', '));
  const hidden = await page.$$eval('.elementor-invisible', (els) => els.length);
  check('all entrance animations have run', hidden === 0, `${hidden} still hidden`);
  const counters = await page.$$eval('.elementor-counter-number', (els) => els.map((e) => e.textContent.trim()));
  check('counters reach 2015 and 100', counters.join(',') === '2015,100', counters.join(','));

  // Sticky header
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(300);
  const headerTop = await page.$eval('#masthead', (h) => h.getBoundingClientRect().top);
  check('header is sticky (top = 0 after scrolling)', Math.abs(headerTop) < 1, `top=${headerTop}`);

  // Before / after slider
  const ba = page.locator('.tp-ba__handle');
  check('before/after slider built', (await ba.count()) === 1);
  if (await ba.count()) {
    await ba.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    const v = await ba.getAttribute('aria-valuenow');
    await page.keyboard.press('Home');
    const v0 = await ba.getAttribute('aria-valuenow');
    check('before/after keyboard operable', v === '54' && v0 === '0', `after 2×→ ${v}, Home ${v0}`);
  }
  // Marquee
  const tracks = await page.$$eval('.tp-marquee .tp-marquee__track', (t) => t.map((x) => [getComputedStyle(x).animationName, x.getAttribute('aria-hidden')]));
  check('marquee cloned and animating', tracks.length === 2 && tracks[0][0] === 'tp-marquee' && tracks[1][1] === 'true', JSON.stringify(tracks));
  // Split headline keeps an accessible name
  const h1 = await page.$eval('h1', (h) => h.getAttribute('aria-label') || h.textContent.trim());
  check('split headline accessible name', h1 === 'Construct A Better Tomorrow', h1);

  // Links and image URLs
  const urls = await page.$$eval('a[href], img[src], link[rel=stylesheet]', (els) => [...new Set(els.map((e) => e.href || e.src).filter((u) => u && u.startsWith('http')))]);
  const bad = [];
  for (const u of urls) {
    if (!u.includes('taameer.local')) continue;
    const r = await ctx.request.get(u.split('#')[0], { ignoreHTTPSErrors: true, maxRedirects: 3 }).catch(() => null);
    if (!r || r.status() >= 400) bad.push(`${r ? r.status() : 'ERR'} ${u}`);
  }
  const external = urls.filter((u) => !u.includes('taameer.local'));
  console.log(`      internal URLs checked: ${urls.length - external.length}; external (not fetched): ${external.join(' ')}`);
  console.log(bad.map((b) => '      ' + b).join('\n'));
  check('internal links/assets: only the not-yet-built pages 404', bad.every((b) => /\/(about|services|projects|testimonials|contact)\//.test(b)), `${bad.length} 404s (later-phase pages)`);
  check('no console errors (desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Mobile menu ---- */
{
  const { ctx, page, errors } = await open(375);
  const toggle = page.locator('#ast-mobile-header .menu-toggle');
  check('mobile toggle visible', await toggle.isVisible());
  await toggle.click();
  await page.waitForTimeout(600);
  const opened = await page.$eval('.ast-mobile-popup-drawer', (d) => d.classList.contains('active'));
  const linkVisible = await page.locator('.ast-mobile-popup-content .menu-link', { hasText: 'Services' }).isVisible();
  check('mobile menu opens with links', opened && linkVisible);
  const focusInside = await page.evaluate(() => !!document.activeElement.closest('.ast-mobile-popup-drawer, #ast-mobile-header'));
  check('focus stays in the menu after opening', focusInside, await page.evaluate(() => document.activeElement.className));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  let closed = await page.$eval('.ast-mobile-popup-drawer', (d) => !d.classList.contains('active'));
  if (!closed) {
    await page.locator('.ast-mobile-popup-drawer .menu-toggle-close').click();
    await page.waitForTimeout(600);
    closed = await page.$eval('.ast-mobile-popup-drawer', (d) => !d.classList.contains('active'));
    check('mobile menu closes (close button; Esc did not close)', closed);
  } else check('mobile menu closes with Esc', closed);
  check('no console errors (mobile)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Reduced motion ---- */
{
  const { ctx, page, errors } = await open(1280, { reducedMotion: 'reduce' });
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => ({
    invisible: [...document.querySelectorAll('.elementor-invisible')].filter((e) => getComputedStyle(e).visibility === 'hidden').length,
    clipped: [...document.querySelectorAll('.tp-img-reveal')].filter((e) => getComputedStyle(e).clipPath !== 'none').length,
    tracks: document.querySelectorAll('.tp-marquee__track').length,
    counters: [...document.querySelectorAll('.elementor-counter-number')].map((e) => e.textContent.trim()).join(','),
  }));
  check('reduced motion: nothing hidden, no wipes, static logo row, final numbers',
    state.invisible === 0 && state.clipped === 0 && state.tracks === 1 && state.counters === '2015,100', JSON.stringify(state));
  check('no console errors (reduced motion)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;
