/**
 * wp-about-check.mjs — functional checks of the WordPress About page (WP phase 2).
 *   PW_MODULE=<playwright> node scripts/wp/wp-about-check.mjs [url=https://taameer.local/about/]
 * Checks: one h1 and heading order, alt text on every content image, no broken images, breadcrumbs, "About" marked as the
 * current menu item, entrance animations finish, 2015 counter, image wipes open, sticky chairman portrait (desktop only),
 * licence previews and buttons open the full licence image in Elementor's lightbox (no PDF links), shared CTA template,
 * internal link status, no horizontal overflow at 320–1440, reduced motion shows everything, no console errors.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const url = process.argv[2] || 'https://taameer.local/about/';
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };
const MAIN = '[data-elementor-type="wp-page"]';

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
  check('exactly one h1 ("About Taameer Plus")', (await page.locator('h1').count()) === 1 && (await page.locator('h1').innerText()).trim() === 'About Taameer Plus');
  const headings = await page.$$eval(`${MAIN} h1, ${MAIN} h2, ${MAIN} h3`, (els) => els.map((e) => e.tagName));
  check('heading order: h1 first, no h3 before the first h2', headings[0] === 'H1' && headings.indexOf('H3') > headings.indexOf('H2'), headings.join(' '));
  const sections = await page.$$eval(`${MAIN} > .e-con`, (els) => els.length);
  check('10 sections (9 + shared CTA band)', sections === 10, String(sections));
  const noAlt = await page.$$eval(`${MAIN} img`, (els) => els.filter((i) => !(i.getAttribute('alt') || '').trim()).map((i) => i.src));
  check('every content image has non-empty alt text', noAlt.length === 0, noAlt.join(', '));
  const crumb = await page.evaluate(() => {
    const nav = document.querySelector('nav.tp-breadcrumb[aria-label="Breadcrumb"]');
    return nav ? [nav.querySelector('a') && nav.querySelector('a').getAttribute('href'), (nav.querySelector('[aria-current="page"]') || {}).textContent] : null;
  });
  check('breadcrumbs: Home link + current page', crumb && crumb[0] === '/' && crumb[1] === 'About', JSON.stringify(crumb));
  const current = await page.$$eval('#masthead .current-menu-item > .menu-link', (els) => els.map((e) => e.textContent.trim()));
  check('"About" is the current header menu item', current.includes('About'), current.join(','));

  await scrollThrough(page);
  const broken = await page.$$eval('img', (els) => els.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
  check('no broken images after scrolling', broken.length === 0, broken.join(', '));
  const hidden = await page.$$eval('.elementor-invisible', (els) => els.length);
  check('all entrance animations have run', hidden === 0, `${hidden} still hidden`);
  const counters = await page.$$eval(`${MAIN} .elementor-counter-number`, (els) => els.map((e) => e.textContent.trim()));
  check('2015 counter reaches its value', counters.join(',') === '2015', counters.join(','));
  const wipes = await page.$$eval(`${MAIN} .tp-img-reveal`, (els) => els.map((e) => e.classList.contains('is-visible') && getComputedStyle(e).clipPath));
  check('image wipes (chairman, why-us) end fully open', wipes.length === 2 && wipes.every((c) => c === 'inset(0px)'), JSON.stringify(wipes));
  const pdf = await page.$$eval('a[href$=".pdf"]', (els) => els.map((e) => e.href).filter((h) => /license/i.test(h)));
  check('no licence "PDF" links', pdf.length === 0, pdf.join(', '));

  // Sticky chairman portrait: with the row's top 100px above the viewport, the portrait still sits just below the header.
  const sticky = await page.evaluate(async () => {
    const el = document.querySelector('.tp-sticky');
    const rowTop = el.parentElement.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: rowTop + 100, behavior: 'instant' }); // the theme scrolls smoothly
    await new Promise((r) => setTimeout(r, 300));
    return { position: getComputedStyle(el).position, top: Math.round(el.getBoundingClientRect().top), header: Math.round(document.querySelector('#masthead').getBoundingClientRect().bottom) };
  });
  check('chairman portrait is sticky below the header (desktop)', sticky.position === 'sticky' && sticky.top >= sticky.header && sticky.top <= sticky.header + 40, JSON.stringify(sticky));

  // Licence preview and button open the full licence image in Elementor's lightbox.
  for (const [label, sel] of [['preview', `${MAIN} .tp-license__preview a`], ['button', `${MAIN} #licenses .elementor-widget-button a`]]) {
    const link = page.locator(sel).first();
    const href = await link.getAttribute('href');
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await page.waitForTimeout(1200);
    const lb = await page.evaluate(() => {
      const m = document.querySelector('.elementor-lightbox:not([style*="display: none"])');
      const img = m && m.querySelector('img.elementor-lightbox-image');
      return m ? (img ? img.src : 'no image') : null;
    });
    check(`licence ${label} opens the licence image in the lightbox`, !!lb && /license-contracting(-scaled)?\.webp$/.test(href) && /license-contracting(-scaled)?\.webp$/.test(lb), `${href} → ${lb}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
  }

  const cta = await page.$$eval(`${MAIN} .elementor-widget-shortcode .elementor[data-elementor-type="container"]`, (els) => els.map((e) => e.dataset.elementorId));
  check('CTA band is the shared saved template (id 228)', cta.join(',') === '228', cta.join(','));

  const urls = await page.$$eval('a[href], img[src], link[rel=stylesheet]', (els) => [...new Set(els.map((e) => e.href || e.src).filter((u) => u && u.startsWith('http')))]);
  const bad = [];
  for (const u of urls) {
    if (!u.includes('taameer.local')) continue;
    const r = await ctx.request.get(u.split('#')[0], { ignoreHTTPSErrors: true, maxRedirects: 3 }).catch(() => null);
    if (!r || r.status() >= 400) bad.push(`${r ? r.status() : 'ERR'} ${u}`);
  }
  console.log(bad.map((b) => '      ' + b).join('\n'));
  check('internal links/assets: only the not-yet-built pages 404', bad.every((b) => /\/(services|projects|testimonials|contact)\//.test(b)), `${bad.length} 404s (later-phase pages)`);
  check('no console errors (desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Widths: overflow, sticky only on desktop ---- */
for (const w of [320, 375, 390, 768, 1024, 1280, 1440]) {
  const { ctx, page, errors } = await open(w);
  await scrollThrough(page);
  const r = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - window.innerWidth, pos: getComputedStyle(document.querySelector('.tp-sticky')).position }));
  check(`${w}px: no horizontal overflow, portrait ${w >= 1024 ? 'sticky' : 'static'}, no console errors`,
    r.overflow <= 0 && r.pos === (w >= 1024 ? 'sticky' : 'relative') && errors.length === 0, `overflow=${r.overflow} position=${r.pos} errors=${errors.length}`);
  await ctx.close();
}

/* ---- Reduced motion ---- */
{
  const { ctx, page, errors } = await open(1280, { reducedMotion: 'reduce' });
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => ({
    invisible: [...document.querySelectorAll('.elementor-invisible')].filter((e) => getComputedStyle(e).visibility === 'hidden').length,
    clipped: [...document.querySelectorAll('.tp-img-reveal')].filter((e) => getComputedStyle(e).clipPath !== 'none').length,
    counters: [...document.querySelectorAll('.elementor-counter-number')].map((e) => e.textContent.trim()).join(','),
  }));
  check('reduced motion: nothing hidden, no wipes, final number', state.invisible === 0 && state.clipped === 0 && state.counters === '2015', JSON.stringify(state));
  check('no console errors (reduced motion)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;
