/**
 * wp-project-detail-check.mjs — functional checks of the WordPress reference project page (WP phase 4B).
 *   PW_MODULE=<playwright> node scripts/wp/wp-project-detail-check.mjs [slug=wadi-alshabak-villas]
 * Reads data/projects.json (the source of the content) and checks /projects/<slug>/: URL + 200, title, one h1, heading order,
 * 7 sections, no HTML widget, breadcrumbs (links work), spec block, cover (file, alt, never upscaled), 3D notice, gallery
 * (order, alt, links, native lightbox by mouse and keyboard), previous / next, static related cards (same type, listing order),
 * shared CTA, current menu item, the listing card that points here, masonry / related columns and no overflow at 7 widths,
 * reduced motion, console errors.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const slug = process.argv[2] || 'wadi-alshabak-villas';
const base = 'https://taameer.local';
const url = `${base}/projects/${slug}/`;
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };
const MAIN = '[data-elementor-type="wp-page"]';

const data = JSON.parse(readFileSync(new URL('../../data/projects.json', import.meta.url), 'utf8'));
const key = (p) => (p.status === 'ongoing' ? '9999-99' : p.completion || '0000-00');
const list = data.projects.filter((p) => p.type !== 'showcase')
  .map((p, i) => ({ p, i })).sort((a, b) => key(b.p).localeCompare(key(a.p)) || a.i - b.i).map((x) => x.p);
const idx = list.findIndex((p) => p.id === slug);
const P = list[idx];
const title = P.title.en;
const TYPE = { construction: 'Construction', 'renovation-decoration': 'Renovation & Decoration', 'fit-out': 'Fit-out', landscaping: 'Landscaping' };
const related = list.filter((p) => p.type === P.type && p.id !== slug).slice(0, 3);
const prev = list[(idx - 1 + list.length) % list.length];
const next = list[(idx + 1) % list.length];
const lbOpen = (page) => page.evaluate(() => {
  const m = [...document.querySelectorAll('.elementor-lightbox')].find((e) => getComputedStyle(e).display !== 'none');
  if (!m) return null;
  const act = m.querySelector('.swiper-slide-active img');
  return { slides: m.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate) img').length, img: act && act.src.split('/').pop(), title: (m.querySelector('.elementor-slideshow__title') || {}).textContent };
});
const norm = (s) => s.replace(/\s+/g, ' ').trim();

const browser = await chromium.launch();
async function open(width, opts = {}, target = url) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, ignoreHTTPSErrors: true, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const res = await page.goto(target, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1500);
  return { ctx, page, errors, res };
}
async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 300) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(100); }
  await page.waitForTimeout(1500);
}

/* ---- Desktop ---- */
{
  const { ctx, page, errors, res } = await open(1280);
  check('direct URL /projects/<slug>/ loads (200, no query)', res.status() === 200 && new URL(page.url()).pathname === `/projects/${slug}/`, `${res.status()} ${page.url()}`);
  check('page title contains the project title', (await page.title()).includes(title), await page.title());
  check('exactly one h1 = project title', (await page.locator('h1').count()) === 1 && norm(await page.locator('h1').innerText()) === title);
  const headings = await page.$$eval(`${MAIN} h1, ${MAIN} h2, ${MAIN} h3`, (els) => els.map((e) => e.tagName + ':' + e.textContent.replace(/\s+/g, ' ').trim()));
  const expectH = ['H1:' + title, 'H2:Project images', 'H2:Related projects', ...related.map((r) => 'H3:' + r.title.en), 'H2:Ready to build your next project?'];
  check('heading hierarchy: h1, h2 gallery, h2 related, h3 per card, h2 CTA', JSON.stringify(headings) === JSON.stringify(expectH), headings.join(' | '));
  const nSections = P.isRender ? 7 : 6;
  const sections = await page.$$eval(`${MAIN} > .e-con`, (els) => els.length);
  check(`${nSections} top-level sections (hero, overview${P.isRender ? ', 3D notice' : ''}, gallery, nav, related, CTA)`, sections === nSections, String(sections));
  check('no HTML widget on the page', (await page.locator(`${MAIN} .elementor-widget-html`).count()) === 0);

  // Breadcrumbs
  const crumbs = await page.$$eval('.tp-breadcrumb__list li', (els) => els.map((e) => ({ t: e.textContent.trim(), h: e.querySelector('a')?.getAttribute('href') || null })));
  check('breadcrumbs: Home › Projects › title', crumbs.length === 3 && crumbs[0].t === 'Home' && crumbs[0].h === '/' && crumbs[1].t === 'Projects' && crumbs[1].h === '/projects/' && crumbs[2].t === title && crumbs[2].h === null, JSON.stringify(crumbs));
  check('eyebrow = project type', norm(await page.locator('.tp-eyebrow').first().innerText()).toLowerCase() === TYPE[P.type].toLowerCase());

  // Spec block
  const spec = await page.$$eval('.tp-spec dt', (dts) => dts.map((dt) => [dt.textContent.trim(), dt.nextElementSibling.textContent.trim()]));
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const exp = [['Type', TYPE[P.type]], ['Location', P.location.en]];
  if (P.period.en) exp.push(['Duration', P.period.en]);
  if (P.status === 'ongoing') exp.push(['Completion', 'Ongoing']);
  else if (P.completion) exp.push(['Completion', `${months[+P.completion.slice(5, 7) - 1]} ${P.completion.slice(0, 4)}`]);
  if (P.consultant && P.consultant.en) exp.push(['Consultant', P.consultant.en]);
  check('spec block (definition list) rows = project metadata, no placeholders', JSON.stringify(spec) === JSON.stringify(exp), JSON.stringify(spec));

  // Cover
  const cover = await page.$eval('.tp-frame img', (i) => ({ src: i.currentSrc, alt: i.alt, nw: i.naturalWidth, w: i.getBoundingClientRect().width }));
  const meta = data.imageMeta[P.cover];
  check('cover = project cover image, alt starts "title, location"', cover.src.includes(path.basename(P.cover, '.webp')) && cover.alt.startsWith(`${title}, ${P.location.en}`), `${cover.src.split('/').pop()} | ${cover.alt}`);
  check('cover never upscaled, in a .tp-frame', cover.w <= meta[0] + 1 && cover.nw > 0, `${cover.w.toFixed(0)} <= ${meta[0]}`);
  const noteCount = await page.locator('.tp-render-note').count();
  check('3D Visualization notice only when isRender', noteCount === (P.isRender ? 1 : 0) && (!P.isRender || (await page.locator('.tp-render-note').innerText()).startsWith('3D Visualization.')));

  // Gallery
  const gal = await page.$$eval('.tp-masonry .gallery-icon a', (as) => as.map((a) => ({ href: a.getAttribute('href'), alt: a.querySelector('img').alt, ok: a.querySelector('img').complete && a.querySelector('img').naturalWidth > 0 })));
  check(`gallery: ${P.gallery.length} images in order, linked to the full file`, gal.length === P.gallery.length && gal.every((g, i) => g.href.endsWith(path.basename(P.gallery[i]))), gal.map((g) => g.href.split('/').pop()).join(' '));
  check('gallery alt text "title, location — image i of n"', gal.every((g, i) => g.alt === `${title}, ${P.location.en} — image ${i + 1} of ${gal.length}`), gal[0]?.alt);
  await scrollThrough(page);
  check('gallery images loaded', (await page.$$eval('.tp-masonry img', (is) => is.every((i) => i.complete && i.naturalWidth > 0))));
  await page.locator('.tp-masonry .gallery-icon a').first().click();
  await page.waitForTimeout(1500);
  const lb1 = await lbOpen(page);
  check(`lightbox opens on click: ${P.gallery.length}-image slideshow, caption = alt`, lb1 && lb1.slides === P.gallery.length && lb1.img.includes(path.basename(P.gallery[0])) && (lb1.title || '').includes(`image 1 of ${P.gallery.length}`), JSON.stringify(lb1));
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900);
  check('lightbox: next image with the keyboard', ((await lbOpen(page)) || {}).img?.includes(path.basename(P.gallery[1])));
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  check('Escape closes the lightbox', (await lbOpen(page)) === null);
  await page.locator('.tp-masonry .gallery-icon a').nth(2).focus();
  await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
  const lb2 = await lbOpen(page);
  check('lightbox opens from the keyboard (Enter on a focused image link)', lb2 && lb2.img.includes(path.basename(P.gallery[2])), JSON.stringify(lb2));
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);

  // Previous / next
  const pn = await page.$$eval('.tp-project-nav__link', (as) => as.map((a) => ({ h: a.getAttribute('href'), t: a.textContent.replace(/\s+/g, ' ').trim() })));
  check('previous / next links (listing order, wrap) with titles', pn.length === 2 && pn[0].h === `/projects/${prev.id}/` && pn[0].t.includes('Previous project') && pn[0].t.includes(prev.title.en) && pn[1].h === `/projects/${next.id}/` && pn[1].t.includes('Next project') && pn[1].t.includes(next.title.en), JSON.stringify(pn.map((x) => x.h)));
  check('previous / next landmark has an accessible name', (await page.locator('nav.tp-project-nav').getAttribute('aria-label')) === 'More projects');

  // Related
  const rel = await page.$$eval('.tp-related .tp-card', (cs) => cs.map((c) => ({ h: c.getAttribute('href'), t: c.querySelector('h3').textContent.trim(), alt: c.querySelector('img').alt, ok: c.querySelector('img').naturalWidth > 0 || !c.querySelector('img').complete })));
  check(`related projects: ${related.length} static cards, same type, listing order, excluding the current`, JSON.stringify(rel.map((r) => r.h)) === JSON.stringify(related.map((r) => `/projects/${r.id}/`)) && rel.every((r, i) => r.t === related[i].title.en), JSON.stringify(rel.map((r) => r.h)));
  check('related cards have alt text', rel.every((r) => r.alt.length > 5));
  check('"All projects" link → /projects/', (await page.locator('.tp-related a.elementor-button', { hasText: 'All projects' }).getAttribute('href')) === '/projects/');

  // CTA + chrome
  check('shared CTA band (title, Get a Quote, phone, email)', (await page.locator(`${MAIN} .elementor-widget-shortcode .elementor[data-elementor-id="228"] h2`).first().innerText()).trim() === 'Ready to build your next project?' && (await page.locator(`${MAIN} .elementor-widget-shortcode a[href*="contact"]`).count()) > 0 && (await page.locator(`${MAIN} a[href="tel:+97143290500"]`).count()) > 0 && (await page.locator(`${MAIN} a[href="mailto:info@taameer.ae"]`).count()) > 0);
  check('header + footer present, Projects marked current in the header', (await page.locator('#masthead').count()) === 1 && (await page.locator('#colophon').count()) === 1 &&
    (await page.locator('#masthead .main-header-menu > .current-menu-ancestor, #masthead .main-header-menu > .current-menu-item').filter({ hasText: 'Projects' }).count()) === 1);
  check('no console errors (desktop)', errors.length === 0, errors.join(' | '));

  // Breadcrumb link works
  await page.locator('.tp-breadcrumb__list a', { hasText: 'Projects' }).click();
  await page.waitForLoadState('load');
  check('breadcrumb "Projects" → the listing', new URL(page.url()).pathname === '/projects/');
  // The listing card points here
  const cardHref = await page.locator(`.tp-filter__items > .tp-card[href="/projects/${slug}/"]`).count();
  check('Projects listing card links to this page', cardHref === 1);
  await page.locator(`.tp-filter__items > .tp-card[href="/projects/${slug}/"]`).click();
  await page.waitForLoadState('load');
  check('clicking the listing card opens the page', new URL(page.url()).pathname === `/projects/${slug}/` && norm(await page.locator('h1').innerText()) === title);
  await ctx.close();
}

/* ---- Widths: overflow, columns, console ---- */
const WIDTHS = [320, 375, 390, 768, 1024, 1280, 1440];
for (const w of WIDTHS) {
  const { ctx, page, errors } = await open(w);
  await scrollThrough(page);
  const m = await page.evaluate(() => {
    const cols = (sel) => new Set([...document.querySelectorAll(sel)].map((e) => Math.round(e.getBoundingClientRect().left))).size;
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      masonry: cols('.tp-masonry .gallery-item'),
      related: cols('.tp-related .tp-card'),
      frame: document.querySelector('.tp-frame img').getBoundingClientRect().width,
    };
  });
  const expMasonry = w >= 1280 ? 4 : w >= 1024 ? 3 : w >= 768 ? 2 : 1; // 17rem columns, 16px gap
  check(`${w}px: no horizontal overflow`, m.overflow <= 0, `${m.overflow}`);
  check(`${w}px: related cards ${w >= 768 ? 3 : 1} per row; masonry columns ${expMasonry}`, m.related === (w >= 768 ? 3 : 1) && m.masonry === expMasonry, `related ${m.related}, masonry ${m.masonry}`);
  check(`${w}px: no console errors`, errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Reduced motion: everything visible ---- */
{
  const { ctx, page, errors } = await open(1280, { reducedMotion: 'reduce' });
  await scrollThrough(page);
  const vis = await page.evaluate(() => [...document.querySelectorAll('[data-elementor-type="wp-page"] img')].every((i) => { const cs = getComputedStyle(i); return cs.visibility !== 'hidden' && cs.opacity !== '0' && i.getBoundingClientRect().width > 0; }));
  check('reduced motion: all images visible', vis);
  check('reduced motion: no console errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
