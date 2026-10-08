/**
 * wp-project-detail-check.mjs — functional checks of the WordPress project detail pages (WP phases 4B + 4C).
 *   PW_MODULE=<playwright> node scripts/wp/wp-project-detail-check.mjs [slug[,slug…]=wadi-alshabak-villas]
 * Slugs run one after another in one browser (never in parallel). Reads data/projects.json + data/testimonials.json (the
 * source of the content) and scripts/wp/alt-map.json (attachment alt text), and checks /projects/<slug>/: URL + 200, title,
 * one h1, heading order, the sections the prototype shows for that project (hero description, 3D notice, before/after,
 * client letter, related only when it has content), no HTML widget, breadcrumbs (links work), spec block, cover (file, alt,
 * framed below 1200px or portrait, never upscaled, at most 80vh tall), gallery (order, alt, links, native lightbox by mouse
 * and keyboard), before/after slider (keyboard), letter (excerpt, company, author, link), previous / next, static related
 * cards (same type, listing order), shared CTA, current menu item, the listing card that points here, masonry / related
 * columns and no overflow at 7 widths, reduced motion, console errors.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const slugs = (process.argv[2] || 'wadi-alshabak-villas').split(',').filter(Boolean);
const base = 'https://taameer.local';
const results = [];
let prefix = '';
const check = (name, ok, info = '') => { results.push({ name: prefix + name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${prefix}${name}${info ? '  — ' + info : ''}`); };
const MAIN = '[data-elementor-type="wp-page"]';

const read = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf8'));
const data = read('../../data/projects.json');
const letters = read('../../data/testimonials.json').testimonials;
const ALT = read('./alt-map.json');
const key = (p) => (p.status === 'ongoing' ? '9999-99' : p.completion || '0000-00');
const list = data.projects.filter((p) => p.type !== 'showcase')
  .map((p, i) => ({ p, i })).sort((a, b) => key(b.p).localeCompare(key(a.p)) || a.i - b.i).map((x) => x.p);
const TYPE = { construction: 'Construction', 'renovation-decoration': 'Renovation & Decoration', 'fit-out': 'Fit-out', landscaping: 'Landscaping' };
const lbOpen = (page) => page.evaluate(() => {
  const m = [...document.querySelectorAll('.elementor-lightbox')].find((e) => getComputedStyle(e).display !== 'none');
  if (!m) return null;
  const act = m.querySelector('.swiper-slide-active img');
  return { slides: m.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate) img').length, img: act && act.src.split('/').pop(), title: (m.querySelector('.elementor-slideshow__title') || {}).textContent };
});
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const file = (p) => path.basename(p);

const browser = await chromium.launch();
async function open(target, width, opts = {}) {
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

for (const slug of slugs) {
  const idx = list.findIndex((p) => p.id === slug);
  if (idx < 0) { prefix = `[${slug}] `; check('slug exists in data/projects.json', false); continue; }
  prefix = slugs.length > 1 ? `[${slug}] ` : '';
  console.log(`\n=== ${slug} ===`);
  const url = `${base}/projects/${slug}/`;
  const P = list[idx];
  const title = P.title.en;
  const related = list.filter((p) => p.type === P.type && p.id !== slug).slice(0, 3);
  const prev = list[(idx - 1 + list.length) % list.length];
  const next = list[(idx + 1) % list.length];
  const letter = letters.find((t) => t.relatedProject === slug && t.excerpt);
  const desc = P.description && P.description.en;
  const meta = data.imageMeta[P.cover];
  const framed = meta[0] < 1200 || meta[1] > meta[0];
  // Gallery alt = the prototype's "title, location — image i of n", except images whose attachment carries a descriptive alt
  // from alt-map.json (also used on Home / Services); one attachment has one alt in WordPress.
  const galAlt = (src, i, n) => [`${title}, ${P.location.en} — image ${i + 1} of ${n}`, ALT[file(src)]];

  /* ---- Desktop ---- */
  {
    const { ctx, page, errors, res } = await open(url, 1280);
    check('direct URL /projects/<slug>/ loads (200, no query)', res.status() === 200 && new URL(page.url()).pathname === `/projects/${slug}/`, `${res.status()} ${page.url()}`);
    check('page title contains the project title', (await page.title()).includes(title), await page.title());
    check('exactly one h1 = project title', (await page.locator('h1').count()) === 1 && norm(await page.locator('h1').innerText()) === title);
    const headings = await page.$$eval(`${MAIN} h1, ${MAIN} h2, ${MAIN} h3`, (els) => els.map((e) => e.tagName + ':' + e.textContent.replace(/\s+/g, ' ').trim()));
    const expectH = ['H1:' + title, 'H2:Project images', ...(P.beforeImage ? ['H2:Before and after'] : []),
      ...(related.length ? ['H2:Related projects', ...related.map((r) => 'H3:' + r.title.en)] : []), 'H2:Ready to build your next project?'];
    check('heading hierarchy (h1, h2 per section, h3 per related card, h2 CTA)', JSON.stringify(headings) === JSON.stringify(expectH), headings.join(' | '));
    const names = ['hero', 'overview', ...(P.isRender ? ['3D notice'] : []), 'gallery', ...(P.beforeImage ? ['before/after'] : []), ...(letter ? ['letter'] : []), 'nav', ...(related.length ? ['related'] : []), 'CTA'];
    const sections = await page.$$eval(`${MAIN} > .e-con`, (els) => els.length);
    check(`${names.length} top-level sections (${names.join(', ')})`, sections === names.length, String(sections));
    check('no HTML widget on the page', (await page.locator(`${MAIN} .elementor-widget-html`).count()) === 0);

    // Hero
    const crumbs = await page.$$eval('.tp-breadcrumb__list li', (els) => els.map((e) => ({ t: e.textContent.trim(), h: e.querySelector('a')?.getAttribute('href') || null })));
    check('breadcrumbs: Home › Projects › title', crumbs.length === 3 && crumbs[0].t === 'Home' && crumbs[0].h === '/' && crumbs[1].t === 'Projects' && crumbs[1].h === '/projects/' && crumbs[2].t === title && crumbs[2].h === null, JSON.stringify(crumbs));
    check('eyebrow = project type', norm(await page.locator('.tp-eyebrow').first().innerText()).toLowerCase() === TYPE[P.type].toLowerCase());
    const heroText = norm(await page.locator(`${MAIN} > .e-con`).first().innerText());
    check(desc ? 'hero description = project description' : 'no hero description (the project has none)', desc ? heroText.includes(norm(desc)) : (await page.locator(`${MAIN} > .e-con`).first().locator('.elementor-widget-text-editor').count()) === 1);

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
    const cover = await page.$eval('.tp-project-overview .elementor-widget-image img', (i) => ({ src: i.currentSrc, alt: i.alt, nw: i.naturalWidth, w: i.getBoundingClientRect().width, h: i.getBoundingClientRect().height, framed: !!i.closest('.tp-frame') }));
    check('cover = project cover image, alt "title, location…" or its attachment alt', cover.src.includes(file(P.cover).replace('.webp', '')) && (cover.alt.startsWith(`${title}, ${P.location.en}`) || cover.alt === ALT[file(P.cover)]), `${cover.src.split('/').pop()} | ${cover.alt}`);
    check(`cover ${framed ? 'framed (.tp-frame)' : 'plain (no frame)'}, never upscaled, at most 80vh tall`, cover.framed === framed && cover.w <= meta[0] + 1 && cover.h <= 720 + 1 && cover.nw > 0, `${cover.w.toFixed(0)}x${cover.h.toFixed(0)} <= ${meta[0]}`);
    const noteCount = await page.locator('.tp-render-note').count();
    check('3D Visualization notice only when isRender', noteCount === (P.isRender ? 1 : 0) && (!P.isRender || (await page.locator('.tp-render-note').innerText()).startsWith('3D Visualization.')));

    // Gallery
    const gal = await page.$$eval('.tp-masonry .gallery-icon a', (as) => as.map((a) => ({ href: a.getAttribute('href'), alt: a.querySelector('img').alt })));
    check(`gallery: ${P.gallery.length} images in order, linked to the full file`, gal.length === P.gallery.length && gal.every((g, i) => g.href.endsWith(file(P.gallery[i]))), gal.map((g) => g.href.split('/').pop()).join(' '));
    check('gallery alt text ("title, location — image i of n" or the attachment\'s descriptive alt)', gal.every((g, i) => galAlt(P.gallery[i], i, gal.length).includes(g.alt)), gal.find((g, i) => !galAlt(P.gallery[i], i, gal.length).includes(g.alt))?.alt || gal[0]?.alt);
    await scrollThrough(page);
    check('gallery images loaded', (await page.$$eval('.tp-masonry img', (is) => is.every((i) => i.complete && i.naturalWidth > 0))));
    await page.locator('.tp-masonry .gallery-icon a').first().click();
    await page.waitForTimeout(1500);
    const lb1 = await lbOpen(page);
    check(`lightbox opens on click: ${P.gallery.length}-image slideshow, caption = alt`, lb1 && lb1.slides === P.gallery.length && lb1.img.includes(file(P.gallery[0])) && norm(lb1.title || '') === gal[0].alt, JSON.stringify(lb1));
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900);
    check('lightbox: next image with the keyboard', ((await lbOpen(page)) || {}).img?.includes(file(P.gallery[1])));
    await page.keyboard.press('Escape'); await page.waitForTimeout(800);
    check('Escape closes the lightbox', (await lbOpen(page)) === null);
    await page.locator('.tp-masonry .gallery-icon a').nth(2).focus();
    await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
    const lb2 = await lbOpen(page);
    check('lightbox opens from the keyboard (Enter on a focused image link)', lb2 && lb2.img.includes(file(P.gallery[2])), JSON.stringify(lb2));
    await page.keyboard.press('Escape'); await page.waitForTimeout(800);

    // Before / after
    if (P.beforeImage) {
      const ba = await page.evaluate(() => {
        const r = document.querySelector('.tp-project-compare .tp-before-after');
        const imgs = r ? [...r.querySelectorAll('.tp-ba__img')].map((i) => i.src.split('/').pop()) : [];
        return { slider: !!(r && r.classList.contains('tp-ba')), imgs };
      });
      check('before/after: slider built from the first gallery image + the before image', ba.slider && ba.imgs.some((s) => s.includes(file(P.gallery[0]).replace('.webp', ''))) && ba.imgs.some((s) => s.includes(file(P.beforeImage).replace('.webp', ''))), JSON.stringify(ba));
      const handle = page.locator('.tp-project-compare .tp-ba__handle');
      await handle.focus();
      const v0 = await handle.getAttribute('aria-valuenow');
      await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
      const v1 = await handle.getAttribute('aria-valuenow');
      check('before/after: keyboard operable slider with an accessible name', (await handle.getAttribute('role')) === 'slider' && !!(await handle.getAttribute('aria-label')) && +v1 > +v0, `${v0} → ${v1}`);
    } else check('no before/after section (no before image)', (await page.locator('.tp-project-compare, .tp-before-after').count()) === 0);

    // Client letter
    if (letter) {
      // textContent: innerText would return the eyebrow uppercased by CSS.
      const L = norm(await page.locator('.tp-project-letter').evaluate((e) => e.textContent));
      const by = [letter.authorName?.en, letter.authorTitle?.en].filter(Boolean).join(', ');
      check('client feedback: eyebrow, excerpt, company, author', L.includes('Client feedback') && L.includes(norm(letter.excerpt.en)) && L.includes(letter.company.en) && L.includes(by), L.slice(0, 120));
      check('client feedback: "Read the letter" → /testimonials/#id', (await page.locator('.tp-project-letter a.elementor-button', { hasText: 'Read the letter' }).getAttribute('href')) === `/testimonials/#${letter.id}`);
    } else check('no client feedback section (no linked testimonial)', (await page.locator('.tp-project-letter').count()) === 0);

    // Previous / next
    const pn = await page.$$eval('.tp-project-nav__link', (as) => as.map((a) => ({ h: a.getAttribute('href'), t: a.textContent.replace(/\s+/g, ' ').trim() })));
    check('previous / next links (listing order, wrap) with titles', pn.length === 2 && pn[0].h === `/projects/${prev.id}/` && pn[0].t.includes('Previous project') && pn[0].t.includes(prev.title.en) && pn[1].h === `/projects/${next.id}/` && pn[1].t.includes('Next project') && pn[1].t.includes(next.title.en), JSON.stringify(pn.map((x) => x.h)));
    check('previous / next landmark has an accessible name', (await page.locator('nav.tp-project-nav').getAttribute('aria-label')) === 'More projects');

    // Related
    if (related.length) {
      const rel = await page.$$eval('.tp-related .tp-card', (cs) => cs.map((c) => ({ h: c.getAttribute('href'), t: c.querySelector('h3').textContent.trim(), alt: c.querySelector('img').alt })));
      check(`related projects: ${related.length} static cards, same type, listing order, excluding the current`, JSON.stringify(rel.map((r) => r.h)) === JSON.stringify(related.map((r) => `/projects/${r.id}/`)) && rel.every((r, i) => r.t === related[i].title.en), JSON.stringify(rel.map((r) => r.h)));
      check('related cards have alt text', rel.every((r) => r.alt.length > 5));
      check('"All projects" link → /projects/', (await page.locator('.tp-related a.elementor-button', { hasText: 'All projects' }).getAttribute('href')) === '/projects/');
    } else check('no related section (no other project of this type; the prototype hides it)', (await page.locator('.tp-related').count()) === 0);

    // CTA + chrome
    check('shared CTA band (title, Get a Quote, phone, email)', (await page.locator(`${MAIN} .elementor-widget-shortcode .elementor[data-elementor-id="228"] h2`).first().innerText()).trim() === 'Ready to build your next project?' && (await page.locator(`${MAIN} .elementor-widget-shortcode a[href*="contact"]`).count()) > 0 && (await page.locator(`${MAIN} a[href="tel:+97143290500"]`).count()) > 0 && (await page.locator(`${MAIN} a[href="mailto:info@taameer.ae"]`).count()) > 0);
    check('header + footer present, Projects marked current in the header', (await page.locator('#masthead').count()) === 1 && (await page.locator('#colophon').count()) === 1 &&
      (await page.locator('#masthead .main-header-menu > .current-menu-ancestor, #masthead .main-header-menu > .current-menu-item').filter({ hasText: 'Projects' }).count()) === 1);
    check('no console errors (desktop)', errors.length === 0, errors.join(' | '));

    await page.locator('.tp-breadcrumb__list a', { hasText: 'Projects' }).click();
    await page.waitForLoadState('load');
    check('breadcrumb "Projects" → the listing', new URL(page.url()).pathname === '/projects/');
    check('Projects listing card links to this page', (await page.locator(`.tp-filter__items > .tp-card[href="/projects/${slug}/"]`).count()) === 1);
    await page.locator(`.tp-filter__items > .tp-card[href="/projects/${slug}/"]`).click();
    await page.waitForLoadState('load');
    check('clicking the listing card opens the page', new URL(page.url()).pathname === `/projects/${slug}/` && norm(await page.locator('h1').innerText()) === title);
    await ctx.close();
  }

  /* ---- Widths: overflow, columns, console ---- */
  for (const w of [320, 375, 390, 768, 1024, 1280, 1440]) {
    const { ctx, page, errors } = await open(url, w);
    await scrollThrough(page);
    const m = await page.evaluate(() => {
      const cols = (sel) => new Set([...document.querySelectorAll(sel)].map((e) => Math.round(e.getBoundingClientRect().left))).size;
      const c = document.querySelector('.tp-project-overview .elementor-widget-image img').getBoundingClientRect();
      return { overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, masonry: cols('.tp-masonry .gallery-item'), related: cols('.tp-related .tp-card'), coverW: c.width, coverH: c.height };
    });
    // 17rem columns, 16px gap. CSS columns balance the items, so a short gallery may fill one column fewer (as in the
    // prototype: perfume-shop's 5 images use 3 columns at 1280).
    const expMasonry = Math.min(w >= 1280 ? 4 : w >= 1024 ? 3 : w >= 768 ? 2 : 1, P.gallery.length);
    const masonryOk = m.masonry === expMasonry || (expMasonry > 2 && m.masonry === expMasonry - 1);
    const expRelated = related.length ? Math.min(w >= 768 ? 3 : 1, related.length) : 0;
    check(`${w}px: no horizontal overflow`, m.overflow <= 0, `${m.overflow}`);
    check(`${w}px: related cards ${expRelated} per row; masonry columns ${expMasonry}${expMasonry > 2 ? ` (or ${expMasonry - 1} balanced)` : ''}; cover within source width and 80vh`, m.related === expRelated && masonryOk && m.coverW <= meta[0] + 1 && m.coverH <= 720 + 1, `related ${m.related}, masonry ${m.masonry}, cover ${m.coverW.toFixed(0)}x${m.coverH.toFixed(0)}`);
    check(`${w}px: no console errors`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  /* ---- Reduced motion: everything visible ---- */
  {
    const { ctx, page, errors } = await open(url, 1280, { reducedMotion: 'reduce' });
    await scrollThrough(page);
    const vis = await page.evaluate(() => [...document.querySelectorAll('[data-elementor-type="wp-page"] img')].every((i) => { const cs = getComputedStyle(i); return cs.visibility !== 'hidden' && cs.opacity !== '0' && (i.getBoundingClientRect().width > 0 || i.closest('.tp-ba > .elementor-element')); }));
    check('reduced motion: all images visible', vis);
    check('reduced motion: no console errors', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
}

await browser.close();
const failed = results.filter((r) => !r.ok);
if (slugs.length > 1) console.log(`\nFailed:\n${failed.map((r) => '  ' + r.name).join('\n') || '  none'}`);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
