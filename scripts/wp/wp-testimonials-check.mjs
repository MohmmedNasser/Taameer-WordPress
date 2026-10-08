/**
 * wp-testimonials-check.mjs — functional checks of the WordPress Testimonials page (WP phase 5).
 *   PW_MODULE=<playwright> node scripts/wp/wp-testimonials-check.mjs
 * Reads data/testimonials.json (content source) and data/projects.json (the 22 project pages), and checks /testimonials/:
 * URL + 200, title, one h1, heading order, sections, no HTML widget, breadcrumbs, hero copy, the four letters in order
 * (anchor id, company, date, excerpt, author, role, project link, letter image + alt + full-size link), one lightbox
 * slideshow (mouse, keyboard, arrows, Escape), sheet link names, hover label, every "Read the letter" link on the 22
 * project pages (target exists, lands below the sticky header, by click and by direct URL), shared CTA, header / footer,
 * current menu item, layout (row from 1024 px, stacked on phones) and no overflow at 7 widths, reduced motion, console errors.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const base = 'https://taameer.local';
const url = base + '/testimonials/';
const MAIN = '[data-elementor-type="wp-page"]';
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };

const read = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf8'));
const letters = read('../../data/testimonials.json').testimonials.slice().sort((a, b) => a.order - b.order);
const projects = read('../../data/projects.json').projects.filter((p) => p.type !== 'showcase');
const norm = (s) => (s || '').replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = (d) => { const [y, m, day] = d.split('-'); return `${day ? +day + ' ' : ''}${MONTHS[+m - 1]} ${y}`; };
const projectTitle = (id) => norm(projects.find((p) => p.id === id).title.en.replace(/&amp;/g, '&'));
const lbOpen = (page) => page.evaluate(() => {
  const m = [...document.querySelectorAll('.elementor-lightbox')].find((e) => getComputedStyle(e).display !== 'none');
  if (!m) return null;
  const act = m.querySelector('.swiper-slide-active img');
  return { slides: m.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate) img').length, img: act && act.src.split('/').pop() };
});
// Distance from the bottom of the sticky header to the top of the target (must be >= 0: not hidden beneath it).
const landing = (page, id) => page.evaluate((id) => {
  const t = document.getElementById(id);
  const h = document.querySelector('#masthead');
  return t && h ? Math.round(t.getBoundingClientRect().top - h.getBoundingClientRect().bottom) : null;
}, id);

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
  for (let y = 0; y < h; y += 300) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(80); }
  await page.waitForTimeout(1500);
}

/* ---- Desktop: structure and content ---- */
{
  const { ctx, page, errors, res } = await open(1280);
  check('/testimonials/ returns 200 at its own URL', res.status() === 200 && new URL(page.url()).pathname === '/testimonials/', `${res.status()} ${page.url()}`);
  check('page title starts with "Testimonials"', /^Testimonials\b/.test(await page.title()), await page.title());
  check('exactly one h1 ("Letters of appreciation")', (await page.locator('h1').count()) === 1 && (await page.locator('h1').innerText()).trim() === 'Letters of appreciation');
  const headings = await page.$$eval(`${MAIN} h1, ${MAIN} h2, ${MAIN} h3`, (els) => els.map((e) => e.tagName));
  check('heading order: h1, 4 x h2 (letters), h2 (CTA), no h3', headings.join() === 'H1,H2,H2,H2,H2,H2', headings.join(' '));
  check('3 top-level sections (hero, letters, CTA)', (await page.$$eval(`${MAIN} > .e-con`, (els) => els.length)) === 3);
  check('no HTML widget on the page', (await page.locator(`${MAIN} .elementor-widget-html`).count()) === 0);
  const crumbs = await page.$$eval('.tp-breadcrumb__list li', (els) => els.map((e) => ({ t: e.textContent.trim(), href: (e.querySelector('a') || {}).getAttribute?.('href') })));
  check('breadcrumbs: Home (/) > Testimonials (current)', crumbs.length === 2 && crumbs[0].t === 'Home' && crumbs[0].href === '/' &&
    (await page.locator('.tp-breadcrumb [aria-current="page"]').textContent()).trim() === 'Testimonials');
  check('hero eyebrow + lead as in the prototype', (await page.locator(`${MAIN} .tp-eyebrow`).first().textContent()).trim() === 'Client endorsements' &&
    (await page.locator(MAIN).innerText()).includes('Words from the clients and consultants we have worked with, together with the original signed letters.'));

  await scrollThrough(page);
  const got = await page.$$eval('.tp-letter-entry', (els) => els.map((e) => {
    const sheet = e.querySelector('a.tp-letter-sheet');
    const img = sheet && sheet.querySelector('img');
    const ps = [...e.querySelectorAll(':scope > .e-con:last-child .elementor-heading-title')].map((x) => x.textContent.trim());
    return {
      tag: e.tagName, id: e.id, company: (e.querySelector('h2') || {}).textContent, texts: ps,
      quote: (e.querySelector('blockquote') || {}).textContent || null,
      links: [...e.querySelectorAll('.tp-link a')].map((a) => ({ href: a.getAttribute('href'), t: a.textContent.replace(/\s+/g, ' ').trim() })),
      sheetHref: sheet && sheet.getAttribute('href'), label: sheet && sheet.getAttribute('aria-label'), group: sheet && sheet.getAttribute('data-elementor-lightbox-slideshow'),
      zoom: sheet && sheet.textContent.includes('View original letter'),
      img: img && { src: img.currentSrc, alt: img.alt, ok: img.complete && img.naturalWidth > 0, w: img.width, h: img.height },
    };
  }));
  check('4 letters, in data order, as <article> with the testimonial id', got.length === letters.length && got.every((g, i) => g.tag === 'ARTICLE' && g.id === letters[i].id), got.map((g) => g.id).join(','));
  check('companies match', got.every((g, i) => norm(g.company) === norm(letters[i].company.en)), got.map((g) => g.company).join(' | '));
  check('dates match (Jan’s Noodles has none)', got.every((g, i) => letters[i].date ? g.texts.includes(fmtDate(letters[i].date)) : !g.texts.some((t) => /\d{4}$/.test(t))));
  check('excerpts match, in quotation marks (none for Jan’s Noodles)', got.every((g, i) => letters[i].excerpt ? norm(g.quote) === norm(`“${letters[i].excerpt.en}”`) : g.quote === null));
  check('author names and titles match', got.every((g, i) => letters[i].authorName ? g.texts.includes(letters[i].authorName.en) && g.texts.includes(letters[i].authorTitle.en) : g.texts.length === 2));
  check('project links: "View the project: <title>" → /projects/<relatedProject>/ only where related', got.every((g, i) => {
    const p = letters[i].relatedProject;
    return p ? g.links.length === 1 && g.links[0].href === `/projects/${p}/` && norm(g.links[0].t) === norm('View the project: ' + projectTitle(p)) : g.links.length === 0;
  }));
  for (const g of got) for (const l of g.links) {
    const r = await ctx.request.get(base + l.href);
    check(`project link resolves: ${l.href}`, r.status() === 200, String(r.status()));
  }
  check('letter images: the data file, loaded, with width/height', got.every((g, i) => g.img && g.img.ok && g.img.w > 0 && g.img.h > 0 && decodeURIComponent(g.img.src).replace(/-\d+x\d+(?=\.)/, '').endsWith(path.basename(letters[i].letterImage))));
  check('letter images have alt text naming the letter', got.every((g, i) => g.img.alt.includes('etter of appreciation from') && norm(g.img.alt).includes(norm(letters[i].company.en).split(' ')[0])), got.map((g) => g.img.alt).join(' | '));
  check('sheet links point to the full-size letter image', got.every((g, i) => g.sheetHref.endsWith('/' + path.basename(letters[i].letterImage))));
  check('sheet links: one slideshow group + "Open the original letter from …" + "View original letter" label', got.every((g) => g.group === 'tp-letters' && g.zoom && norm(g.label) === norm('Open the original letter from ' + g.company)));
  check('layout at 1280: sheet and text side by side, even letters reversed', await page.$$eval('.tp-letter-entry', (els) => els.every((e, i) => {
    const s = e.querySelector('.tp-letter-sheet').getBoundingClientRect();
    const t = e.querySelector(':scope > .e-con:last-child').getBoundingClientRect();
    return Math.abs(s.width - 416) < 2 && (i % 2 ? s.left > t.left : s.left < t.left);
  })));

  // Hover: the label takes the ink fill.
  const zoomBg = (i) => page.$eval(`.tp-letter-entry:nth-child(${i}) .tp-letter-sheet__zoom`, (e) => getComputedStyle(e).backgroundColor);
  await page.mouse.move(0, 0);
  const before = await zoomBg(1);
  await page.hover('.tp-letter-entry:nth-child(1) .tp-letter-sheet');
  await page.waitForTimeout(300);
  check('hover: "View original letter" label turns ink', before === 'rgb(255, 255, 255)' && (await zoomBg(1)) === 'rgb(13, 13, 13)', `${before} → ${await zoomBg(1)}`);

  // Lightbox: one slideshow of the four letters.
  await page.click('.tp-letter-entry:nth-child(2) .tp-letter-sheet');
  await page.waitForTimeout(1200);
  let lb = await lbOpen(page);
  check('click opens the lightbox on that letter, slideshow of 4', lb && lb.slides === 4 && lb.img.startsWith('letter-bella-cure'), JSON.stringify(lb));
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900);
  lb = await lbOpen(page);
  check('ArrowRight shows the next letter', lb && lb.img.startsWith('letter-today-engineering'), JSON.stringify(lb));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  check('Escape closes the lightbox', (await lbOpen(page)) === null);
  await page.locator('.tp-letter-entry:nth-child(4) .tp-letter-sheet').focus();
  check('sheet links show a visible focus ring', await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return document.activeElement.classList.contains('tp-letter-sheet') && s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0; }));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  lb = await lbOpen(page);
  check('Enter on a focused sheet opens the lightbox', lb && lb.img.startsWith('letter-jans-noodles'), JSON.stringify(lb));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // CTA, header, footer, menu
  check('shared CTA band (template 228) present', (await page.locator(`${MAIN} .elementor-widget-shortcode .elementor[data-elementor-id="228"] h2`).first().innerText()).trim() === 'Ready to build your next project?');
  check('Astra header + footer present', (await page.locator('#masthead').count()) === 1 && (await page.locator('#colophon').count()) === 1);
  const current = await page.$$eval('#masthead .current-menu-item > a', (els) => [...new Set(els.map((e) => e.textContent.trim()))]);
  check('Testimonials is the only current header menu item', current.join() === 'Testimonials', current.join());
  check('footer quick link "Testimonials" is current', (await page.locator('#colophon a[href="/testimonials/"][aria-current="page"]').count()) === 1);
  check('floating WhatsApp button present', (await page.locator('.tp-fab').count()) === 1);
  check('no console errors (desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Project → Testimonials links (all 22 project pages) ---- */
{
  const { ctx, page } = await open(1280);
  const ids = await page.$$eval('.tp-letter-entry', (els) => els.map((e) => e.id));
  const found = [];
  const pageErr = [];
  for (const p of projects) {
    const r = await ctx.request.get(`${base}/projects/${p.id}/`);
    if (r.status() !== 200) { pageErr.push(`${p.id} ${r.status()}`); continue; }
    for (const m of (await r.text()).matchAll(/href="([^"]*\/testimonials\/[^"]*)"/g)) {
      const u = new URL(m[1].replace(/&#0?38;|&amp;/g, '&'), base);
      if (!u.pathname.startsWith('/projects/')) found.push({ from: p.id, path: u.pathname, hash: u.hash.slice(1) });
    }
  }
  const fromProjects = found.filter((f) => f.hash || f.path !== '/testimonials/');
  check('22 project pages fetched', pageErr.length === 0 && projects.length === 22, pageErr.join(', '));
  const want = letters.filter((l) => l.relatedProject).map((l) => `${l.relatedProject}#${l.id}`).sort();
  check('"Read the letter" links found exactly where data/testimonials.json relates a project', JSON.stringify(fromProjects.map((f) => `${f.from}#${f.hash}`).sort()) === JSON.stringify(want), fromProjects.map((f) => `${f.from}→#${f.hash}`).join(', '));
  const broken = fromProjects.filter((f) => f.path !== '/testimonials/' || !ids.includes(f.hash));
  check('0 broken Project → Testimonials links (target anchor exists)', broken.length === 0, broken.map((b) => `${b.from}→${b.path}#${b.hash}`).join(', '));
  await ctx.close();

  // Real click from each project page: lands on the right letter, below the sticky header.
  for (const f of fromProjects) for (const w of [1280, 375]) {
    const o = await open(w, {}, `${base}/projects/${f.from}/`);
    await o.page.click('.tp-project-letter a.elementor-button');
    await o.page.waitForURL(/\/testimonials\//);
    await o.page.waitForTimeout(2000);
    const gapPx = await landing(o.page, f.hash);
    check(`click "Read the letter" on ${f.from} (${w}px) → #${f.hash} visible below the header`, new URL(o.page.url()).hash === '#' + f.hash && gapPx !== null && gapPx >= 0 && gapPx <= 160, `gap ${gapPx}px`);
    await o.ctx.close();
  }
}

/* ---- Direct anchor URLs (all four letters) ---- */
for (const w of [1280, 768, 375]) {
  const bad = [];
  for (const l of letters) {
    const o = await open(w, {}, `${url}#${l.id}`);
    await o.page.waitForTimeout(800);
    const gapPx = await landing(o.page, l.id);
    if (gapPx === null || gapPx < 0 || gapPx > 160) bad.push(`${l.id}: ${gapPx}`);
    await o.ctx.close();
  }
  check(`direct /testimonials/#id lands each letter just below the header (${w}px)`, bad.length === 0, bad.join('; '));
}

/* ---- Widths: layout and overflow ---- */
{
  const overflow = []; const wrong = []; const errs = [];
  for (const w of [320, 375, 390, 768, 1024, 1280, 1440]) {
    const { ctx, page, errors } = await open(w);
    await scrollThrough(page);
    if ((await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) > 0) overflow.push(w);
    const rows = await page.$$eval('.tp-letter-entry', (els) => els.map((e) => {
      const s = e.querySelector('.tp-letter-sheet').getBoundingClientRect();
      const t = e.querySelector(':scope > .e-con:last-child').getBoundingClientRect();
      return t.top >= s.bottom - 1 ? 'stack' : 'row';
    }));
    const expect = w >= 1024 ? 'row' : 'stack';
    if (!rows.every((r) => r === expect)) wrong.push(`${w}px: ${rows.join(',')}`);
    errs.push(...errors);
    await ctx.close();
  }
  check('letters side by side from 1024 px, stacked below 900 px (prototype flex-wrap)', wrong.length === 0, wrong.join('; '));
  check('no horizontal overflow at 320 / 375 / 390 / 768 / 1024 / 1280 / 1440', overflow.length === 0, overflow.join(','));
  check('no console errors (all widths)', errs.length === 0, errs.join(' | '));
}

/* ---- Reduced motion ---- */
{
  const { ctx, page, errors } = await open(1280, { reducedMotion: 'reduce' }, url + '#today-engineering');
  const hidden = await page.$$eval(`${MAIN} .elementor-element`, (els) => els.filter((e) => getComputedStyle(e).visibility === 'hidden' || getComputedStyle(e).opacity === '0').length);
  check('reduced motion: every element visible without scrolling', hidden === 0, String(hidden));
  const gapPx = await landing(page, 'today-engineering');
  check('reduced motion: direct anchor lands below the header', gapPx !== null && gapPx >= 0 && gapPx <= 160, `gap ${gapPx}px`);
  check('no console errors (reduced motion)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exitCode = failed ? 1 : 0;
