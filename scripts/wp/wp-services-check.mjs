/**
 * wp-services-check.mjs — functional checks of the WordPress Services page (WP phase 3).
 *   PW_MODULE=<playwright> node scripts/wp/wp-services-check.mjs [url=https://taameer.local/services/]
 * Checks: one h1 and heading order, 10 sections, alt text, breadcrumbs, current menu items (only the page link, never the
 * in-page #links), entrance animations, 6 image wipes, alternating blocks (photo first on --flip when side by side; text
 * above photo when stacked), sticky chip bar + scrollspy + chip click landing below the bars, direct #link, related project cards, gallery lightbox (slideshow, caption = alt), shared CTA, links, 7 widths without overflow,
 * reduced motion, console errors.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const url = process.argv[2] || 'https://taameer.local/services/';
const origin = new URL(url).origin;
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };
const MAIN = '[data-elementor-type="wp-page"]';
const IDS = ['construction', 'design-build', 'decoration-fitout', 'renovation', 'maintenance', 'turnkey'];

const browser = await chromium.launch();
async function open(width, opts = {}, target = url) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, ignoreHTTPSErrors: true, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(target, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1500);
  return { ctx, page, errors };
}
async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 300) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(100); }
  await page.waitForTimeout(2500);
}
// Order of text and photo in each service block: 'row-text-first' | 'row-photo-first' | 'stacked-text-first' | …
const blockLayout = (page) => page.evaluate((ids) => ids.map((id) => {
  const sec = document.getElementById(id);
  const h2 = sec.querySelector('h2').getBoundingClientRect();
  const img = sec.querySelector('.tp-frame img').getBoundingClientRect();
  const row = Math.min(h2.right, img.right) - Math.max(h2.left, img.left) <= 0; // no horizontal overlap = side by side
  if (row) return h2.left < img.left ? 'row-text-first' : 'row-photo-first';
  return h2.top < img.top ? 'stacked-text-first' : 'stacked-photo-first';
}), IDS);
// Top of the section and bottom of the chip bar after scrolling to a section. Like the prototype (html scroll-padding +
// section scroll-margin), the section lands below the bar with part of its top padding showing (prototype at 1280: 95 px
// after a chip click, 124 px for a direct link).
const landedOk = (l) => l.section >= l.bars - 2 && l.section <= l.bars + 130;
const landing = (page, id) => page.evaluate((i) => ({
  section: Math.round(document.getElementById(i).getBoundingClientRect().top),
  bars: Math.round(document.querySelector('.tp-service-nav').getBoundingClientRect().bottom),
}), id);

/* ---- Desktop ---- */
{
  const { ctx, page, errors } = await open(1280);
  check('exactly one h1 ("Our services")', (await page.locator('h1').count()) === 1 && (await page.locator('h1').innerText()).trim() === 'Our services');
  const headings = await page.$$eval(`${MAIN} h1, ${MAIN} h2, ${MAIN} h3`, (els) => els.map((e) => e.tagName));
  check('heading order: h1 first, no h3 before the first h2', headings[0] === 'H1' && headings.indexOf('H3') > headings.indexOf('H2'), headings.join(' '));
  const sections = await page.$$eval(`${MAIN} > .e-con`, (els) => els.map((e) => e.id || (e.classList.contains('tp-service-nav') ? 'nav' : '-')));
  check('10 parts in prototype order (hero, chip bar, 6 services, wall cladding, CTA)',
    sections.join(',') === ['-', 'nav', ...IDS, 'wall-cladding', '-'].join(','), sections.join(','));
  const noAlt = await page.$$eval(`${MAIN} img`, (els) => els.filter((i) => !(i.getAttribute('alt') || '').trim()).map((i) => i.src));
  check('every content image has non-empty alt text', noAlt.length === 0, noAlt.join(', '));
  const crumb = await page.evaluate(() => {
    const nav = document.querySelector('nav.tp-breadcrumb[aria-label="Breadcrumb"]');
    return nav ? [nav.querySelector('a') && nav.querySelector('a').getAttribute('href'), (nav.querySelector('[aria-current="page"]') || {}).textContent] : null;
  });
  check('breadcrumbs: Home link + current page', crumb && crumb[0] === '/' && crumb[1] === 'Services', JSON.stringify(crumb));
  const current = await page.$$eval('[aria-current="page"]', (els) => els.filter((e) => e.closest('#masthead, #colophon')).map((e) => e.getAttribute('href')));
  check('current menu items: only /services/ links (header, mobile menu, footer quick links), no #links',
    current.length >= 2 && current.every((h) => h === '/services/'), current.join(','));
  const navLabel = await page.$eval('.tp-service-nav nav', (n) => n.getAttribute('aria-label'));
  check('chip bar is a labelled nav with 6 in-page links', navLabel === 'Services on this page' &&
    (await page.$$eval('.tp-service-nav a', (as) => as.map((a) => a.getAttribute('href')).join(','))) === IDS.map((i) => '#' + i).join(','), navLabel);

  const layout = await blockLayout(page);
  check('alternating blocks at 1280: text first, then photo first on --flip', layout.join(',') ===
    ['row-text-first', 'row-photo-first', 'row-text-first', 'row-photo-first', 'row-text-first', 'row-photo-first'].join(','), layout.join(','));

  await scrollThrough(page);
  const broken = await page.$$eval('img', (els) => els.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
  check('no broken images after scrolling', broken.length === 0, broken.join(', '));
  const hidden = await page.$$eval('.elementor-invisible', (els) => els.length);
  check('all entrance animations have run', hidden === 0, `${hidden} still hidden`);
  const wipes = await page.$$eval(`${MAIN} .tp-img-reveal`, (els) => els.map((e) => e.classList.contains('is-visible') && getComputedStyle(e).clipPath));
  check('6 service photo wipes end fully open', wipes.length === 6 && wipes.every((c) => c === 'inset(0px)'), JSON.stringify(wipes));
  const gal = await page.$$eval('.tp-gallery .gallery-item', (els) => els.map((e) => getComputedStyle(e).opacity));
  check('gallery: 6 images, staggered entrance finished', gal.length === 6 && gal.every((o) => o === '1'), gal.join(','));

  // Related project cards: 3 + 3 + 3, links to the final project URLs, badges on the ongoing render.
  const cards = await page.$$eval(`${MAIN} a.tp-card`, (els) => els.map((a) => [a.closest('section').id, a.getAttribute('href')]));
  const per = cards.reduce((o, [s]) => ({ ...o, [s]: (o[s] || 0) + 1 }), {});
  check('related projects: 3 cards each in construction, decoration-fitout, renovation; /projects/<slug>/ links',
    JSON.stringify(per) === JSON.stringify({ construction: 3, 'decoration-fitout': 3, renovation: 3 }) && cards.every(([, h]) => /^\/projects\/[a-z0-9-]+\/$/.test(h)), JSON.stringify(per));
  const badges = await page.$eval('a.tp-card[href="/projects/wadi-alshabak-villas/"]', (a) => [...a.querySelectorAll('.elementor-heading-title')].map((h) => h.textContent.trim()).slice(0, 2).join('|'));
  check('ongoing render card shows "Ongoing" + "3D Visualization" badges', badges === 'Ongoing|3D Visualization', badges);

  // Sticky chip bar + scrollspy + chip click.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(400);
  await page.locator('.tp-service-nav a[href="#renovation"]').click();
  await page.waitForTimeout(2500);
  const land = await landing(page, 'renovation');
  const hdr = await page.evaluate(() => Math.round(document.querySelector('#masthead').getBoundingClientRect().bottom));
  const navTop = await page.evaluate(() => Math.round(document.querySelector('.tp-service-nav').getBoundingClientRect().top));
  check('chip bar sticks right below the header', Math.abs(navTop - hdr) <= 1, `nav top ${navTop}, header bottom ${hdr}`);
  check('chip click: section lands below the chip bar (prototype: 95 px below)', landedOk(land), JSON.stringify(land));
  const cur = await page.$$eval('.tp-service-nav a[aria-current="true"]', (as) => as.map((a) => [a.getAttribute('href'), getComputedStyle(a).backgroundColor, getComputedStyle(a.querySelector('.elementor-button-text') || a).color].join(' ')));
  check('scrollspy marks the chip of the section in view, shown filled (ink, white text)', cur.join(',') === '#renovation rgb(13, 13, 13) rgb(255, 255, 255)', cur.join(','));
  // While scrolling, each section's chip in turn is current and filled.
  const spy = [];
  for (const id of IDS) {
    await page.evaluate((i) => window.scrollTo({ top: document.getElementById(i).offsetTop + 150, behavior: 'instant' }), id);
    await page.waitForTimeout(500);
    spy.push(await page.evaluate(() => { const a = document.querySelector('.tp-service-nav a[aria-current="true"]'); return a ? a.getAttribute('href').slice(1) + (getComputedStyle(a).backgroundColor === 'rgb(13, 13, 13)' ? '' : '(not filled)') : 'none'; }));
  }
  check('scrolling: each section fills its own chip in turn', spy.join(',') === IDS.join(','), spy.join(','));
  await page.locator('#decoration-fitout .tp-link a').click();
  await page.waitForTimeout(2500);
  const clad = await page.evaluate(() => Math.round(document.getElementById('wall-cladding').getBoundingClientRect().top));
  check('"See the wall cladding showcase" reaches the gallery section', clad >= 0 && clad <= 200, `section top ${clad}px`);

  // Gallery lightbox: one slideshow, caption = alt text.
  await page.locator('.tp-gallery .gallery-item a').first().click();
  await page.waitForTimeout(1500);
  const lb = await page.evaluate(() => {
    const m = [...document.querySelectorAll('.elementor-lightbox')].find((e) => getComputedStyle(e).display !== 'none');
    if (!m) return null;
    const act = m.querySelector('.swiper-slide-active img');
    return { slides: m.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate) img').length, img: act && act.src.split('/').pop(), title: (m.querySelector('.elementor-slideshow__title') || {}).textContent };
  });
  check('gallery opens Elementor lightbox: 6-image slideshow, caption = alt', lb && lb.slides === 6 && /wall-cladding-01/.test(lb.img) && /vertical slat cladding/.test(lb.title || ''), JSON.stringify(lb));
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900);
  const next = await page.evaluate(() => { const i = document.querySelector('.elementor-lightbox .swiper-slide-active img'); return i && i.src.split('/').pop(); });
  check('lightbox: next image with the keyboard', /wall-cladding-02/.test(next || ''), next);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

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
  check('internal links/assets: only the not-yet-built pages 404', bad.every((b) => /\/(projects|testimonials|contact)\//.test(b)), `${bad.length} 404s (later-phase pages)`);
  check('no console errors (desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Footer "Services" link from another page lands below the chip bar ---- */
{
  const { ctx, page, errors } = await open(1280, {}, origin + '/services/#maintenance');
  await page.waitForTimeout(2500);
  const land = await landing(page, 'maintenance');
  check('direct link /services/#maintenance lands below the chip bar', landedOk(land), JSON.stringify(land));
  check('no console errors (deep link)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Widths: overflow, layout, sticky bar ---- */
for (const w of [320, 375, 390, 768, 1024, 1280, 1440]) {
  const { ctx, page, errors } = await open(w);
  const layout = await blockLayout(page);
  const want = w >= 1024 ? ['row-text-first', 'row-photo-first'] : ['stacked-text-first', 'stacked-text-first'];
  await scrollThrough(page);
  // Sticky is measured mid-page: at the very bottom the bar leaves with the end of the page content, like the prototype.
  await page.evaluate(() => window.scrollTo({ top: document.getElementById('renovation').offsetTop, behavior: 'instant' }));
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    stuck: Math.abs(document.querySelector('.tp-service-nav').getBoundingClientRect().top - document.querySelector('#masthead').getBoundingClientRect().bottom) <= 1,
    chipsScroll: getComputedStyle(document.querySelector('.tp-chips')).overflowX,
  }));
  check(`${w}px: no overflow, ${w >= 1024 ? 'side by side, alternating' : 'stacked, text above photo'}, chip bar sticky, no console errors`,
    r.overflow <= 0 && layout.every((l, i) => l === want[i % 2]) && r.stuck && r.chipsScroll === 'auto' && errors.length === 0,
    `overflow=${r.overflow} layout=${layout.join('/')} stuck=${r.stuck} errors=${errors.length}`);
  await ctx.close();
}

/* ---- Reduced motion ---- */
{
  const { ctx, page, errors } = await open(1280, { reducedMotion: 'reduce' });
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => ({
    invisible: [...document.querySelectorAll('.elementor-invisible')].filter((e) => getComputedStyle(e).visibility === 'hidden').length,
    clipped: [...document.querySelectorAll('.tp-img-reveal')].filter((e) => getComputedStyle(e).clipPath !== 'none').length,
    gallery: [...document.querySelectorAll('.tp-gallery .gallery-item')].filter((e) => getComputedStyle(e).opacity !== '1').length,
  }));
  check('reduced motion: nothing hidden, no wipes, gallery shown', state.invisible === 0 && state.clipped === 0 && state.gallery === 0, JSON.stringify(state));
  check('no console errors (reduced motion)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;
