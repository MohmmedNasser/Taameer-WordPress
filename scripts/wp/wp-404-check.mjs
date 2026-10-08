/**
 * wp-404-check.mjs — functional checks of the WordPress 404 page (WP phase 7).
 *   PW_MODULE=<playwright> node scripts/wp/wp-404-check.mjs
 * Requests several not-found URLs and checks: HTTP 404 status, noindex, title, the "404 page" Elementor saved template
 * rendered once instead of Astra's default 404 content (full-width page-builder layout, no sidebar), no HTML widget, one h1,
 * heading order, copy as 404.html, "404" aria-hidden with its "+" mark at the top end, the two buttons (Home, Projects)
 * and their targets, the 3 featured project cards (prototype rule: featured, listing order, first 3) and their links,
 * no CTA band, header / footer / WhatsApp present, no current menu item, layout (code beside text from 1024 px, stacked
 * on phones; 3 cards per row from 768 px, 1 below) and no overflow at 7 widths, keyboard focus, reduced motion,
 * console errors (the document's own 404 status is the only expected network "error").
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const base = 'https://taameer.local';
const url = base + '/this-page-does-not-exist/';
const MAIN = '.tp-404';
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };

// Featured projects as projects.js picks them: featured, listing order (ongoing first, then newest completion), first 3.
const data = JSON.parse(readFileSync(new URL('../../data/projects.json', import.meta.url), 'utf8'));
const key = (p) => (p.status === 'ongoing' ? '9999-99' : p.completion || '0000-00');
const featured = data.projects.filter((p) => p.type !== 'showcase').map((p, i) => ({ p, i }))
  .sort((a, b) => key(b.p).localeCompare(key(a.p)) || a.i - b.i).map((x) => x.p).filter((p) => p.featured).slice(0, 3);
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

const browser = await chromium.launch();
// The document's own 404 response is logged by Chrome as "Failed to load resource … 404"; that one is expected.
const expected404 = (t) => /Failed to load resource: the server responded with a status of 404/.test(t);
async function open(width, opts = {}, target = url) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, ignoreHTTPSErrors: true, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  let notFound = 0;
  page.on('response', (r) => { if (r.status() === 404 && r.url() !== target) errors.push('404 ' + r.url()); });
  page.on('console', (m) => { if (m.type() === 'error') { if (expected404(m.text()) && !notFound++) return; errors.push(m.text()); } });
  page.on('pageerror', (e) => errors.push(String(e)));
  const res = await page.goto(target, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1200);
  return { ctx, page, errors, res };
}

/* ---- Status on several not-found URLs ---- */
for (const u of ['/this-page-does-not-exist/', '/projects/no-such-project/', '/about/team/missing', '/?p=999999']) {
  const r = await fetch(base + u, { redirect: 'manual' }).catch(() => null);
  if (r === null) { // Node fetch rejects LocalWP's self-signed certificate: use the browser instead
    const { ctx, res, page } = await open(1280, {}, base + u);
    const tpl = await page.$$eval('.tp-404', (e) => e.length);
    check(`${u} → HTTP 404 with the 404 template`, res.status() === 404 && tpl === 1, `status ${res.status()}, template ${tpl}`);
    await ctx.close();
  }
}

/* ---- Desktop: structure and content ---- */
{
  const { ctx, page, errors, res } = await open(1280);
  check('HTTP status 404', res.status() === 404, String(res.status()));
  const robots = await page.$eval('meta[name="robots"]', (m) => m.content).catch(() => '');
  check('robots meta has noindex', /noindex/.test(robots), robots);
  check('title "Page not found – Taameer Plus Contracting LLC"', /^Page not found . Taameer Plus Contracting LLC$/.test(await page.title()), await page.title());
  const s = await page.evaluate(() => ({
    body: document.body.className,
    templates: document.querySelectorAll('[data-elementor-type="container"] .tp-404').length,
    astraDefault: document.querySelectorAll('.error-404, .page-sub-title, .ast-404-search').length,
    sidebar: document.querySelectorAll('#secondary').length,
    html: document.querySelectorAll('.tp-404 .elementor-widget-html').length,
    h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
    heads: [...document.querySelectorAll('.tp-404 h1, .tp-404 h2, .tp-404 h3')].map((h) => h.tagName),
    section: document.querySelector('.tp-404') && document.querySelector('.tp-404').tagName,
    width: document.querySelector('.tp-404') && Math.round(document.querySelector('.tp-404').getBoundingClientRect().width),
    cta: document.querySelectorAll('.tp-404 ~ *, [data-elementor-id] .elementor-widget-shortcode').length,
  }));
  check('404 template rendered once, Astra default 404 content gone', s.templates === 1 && s.astraDefault === 0, JSON.stringify([s.templates, s.astraDefault]));
  check('full-width page-builder layout, no sidebar', /ast-page-builder-template/.test(s.body) && /ast-no-sidebar/.test(s.body) && s.sidebar === 0 && s.width === 1280, `${s.width}px`);
  check('section is a <section>', s.section === 'SECTION');
  check('no HTML widget', s.html === 0);
  check('one h1 "We could not find that page"', s.h1.length === 1 && s.h1[0] === 'We could not find that page', s.h1.join(' | '));
  check('heading order h1 → h2 → 3 × h3', s.heads.join(',') === 'H1,H2,H3,H3,H3', s.heads.join(','));
  check('no CTA band (prototype ends on the projects)', s.cta === 0, String(s.cta));

  const text = norm(await page.$eval(MAIN, (e) => e.innerText));
  for (const t of ['PAGE NOT FOUND', 'We could not find that page', 'The page may have moved, or the link may be incorrect. Return to the homepage or browse our projects.', 'FEATURED PROJECTS', 'Or explore our work'])
    check(`copy: "${t}"`, text.toUpperCase().includes(t.toUpperCase()));

  const code = await page.evaluate(() => {
    const p = [...document.querySelectorAll('.tp-404-code p')].find((e) => e.textContent.trim() === '404');
    const mark = document.querySelector('.tp-404-code .tp-location__mark');
    if (!p || !mark) return null;
    const pr = p.getBoundingClientRect(), mr = mark.getBoundingClientRect(), cs = getComputedStyle(p);
    return { hidden: p.getAttribute('aria-hidden'), font: cs.fontFamily, size: cs.fontSize, mark: [Math.round(mr.width), Math.round(mr.height)], markEnd: Math.round(mr.right), codeEnd: Math.round(p.closest('.tp-404-code').getBoundingClientRect().right), above: mr.top < pr.top + pr.height / 2, mask: getComputedStyle(mark).maskImage || getComputedStyle(mark).webkitMaskImage };
  });
  check('"404" is aria-hidden, Playfair 224px at 1280', code && code.hidden === 'true' && /Playfair/.test(code.font) && code.size === '224px', JSON.stringify(code && [code.hidden, code.size]));
  check('"+" mark 40 × 40 at the top end of "404", drawn by the "+" mask', code && code.mark.join() === '40,40' && code.markEnd === code.codeEnd && code.above && /svg/.test(code.mask), JSON.stringify(code && [code.mark, code.markEnd, code.codeEnd]));

  const btns = await page.$$eval(`${MAIN} .elementor-widget-button a`, (as) => as.map((a) => [a.textContent.trim(), a.getAttribute('href'), getComputedStyle(a).backgroundColor]));
  check('buttons: "Back to home" → / (ink), "View projects" → /projects/ (outline)', btns.length === 2 && btns[0][0] === 'Back to home' && btns[0][1] === '/' && btns[0][2] === 'rgb(13, 13, 13)' && btns[1][0] === 'View projects' && btns[1][1] === '/projects/' && btns[1][2] === 'rgba(0, 0, 0, 0)', JSON.stringify(btns));
  for (const [name, href, title] of [['Back to home', '/', 'Taameer'], ['View projects', '/projects/', 'Projects']]) {
    const r = await page.request.get(base + href);
    check(`"${name}" target responds 200`, r.status() === 200, `${href} ${r.status()}`);
  }

  const cards = await page.$$eval(`${MAIN} a.tp-card`, (as) => as.map((a) => ({ href: a.getAttribute('href'), title: a.querySelector('h3') && a.querySelector('h3').textContent.trim(), img: a.querySelector('img') && a.querySelector('img').currentSrc.split('/').pop(), alt: a.querySelector('img') && a.querySelector('img').alt, text: a.innerText })));
  check('3 featured project cards', cards.length === 3, String(cards.length));
  featured.forEach((p, i) => {
    const c = cards[i] || {};
    const type = data.types[p.type].en || data.types[p.type];
    check(`card ${i + 1}: ${p.id} (link, title, location, type, year, cover, alt)`,
      c.href === `/projects/${p.id}/` && c.title === p.title.en && c.text.includes(p.location.en) && c.text.toUpperCase().includes(String(type).toUpperCase()) && c.text.includes(p.completion.slice(0, 4)) && c.img && c.img.startsWith(p.cover.split('/').pop().replace('.webp', '')) && !!c.alt,
      `${c.href} ${c.img}`);
  });
  for (const c of cards) {
    const r = await page.request.get(base + c.href);
    check(`card link ${c.href} responds 200`, r.status() === 200, String(r.status()));
  }

  const chrome = await page.evaluate(() => ({
    header: !!document.querySelector('#masthead'), sticky: getComputedStyle(document.querySelector('#masthead')).position,
    nav: [...document.querySelectorAll('#masthead .main-header-menu > li > a')].map((a) => a.textContent.trim()),
    current: document.querySelectorAll('#masthead .current-menu-item, #masthead [aria-current="page"]').length,
    footer: !!document.querySelector('footer.site-footer'), wa: !!document.querySelector('a[href*="wa.me"]'),
  }));
  check('header (sticky) with 6 menu items, none current', chrome.header && chrome.sticky === 'sticky' && chrome.nav.length >= 6 && chrome.current === 0, `${chrome.sticky}, ${chrome.nav.length}, current ${chrome.current}`);
  check('footer and WhatsApp button present', chrome.footer && chrome.wa);

  // Keyboard: Tab reaches both buttons with a visible focus outline.
  await page.focus('body');
  const focus = [];
  for (let i = 0; i < 40 && focus.length < 2; i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return a.closest('.tp-404') && a.closest('.elementor-widget-button') ? [a.textContent.trim(), cs.outlineStyle !== 'none' || cs.boxShadow !== 'none'] : null; });
    if (f) focus.push(f);
  }
  check('keyboard: Tab reaches both buttons with a visible focus style', focus.length === 2 && focus.every((f) => f[1]), JSON.stringify(focus));

  check('no console errors (desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Widths: layout and overflow ---- */
{
  const overflow = []; const wrong = []; const errs = [];
  for (const w of [320, 375, 390, 768, 1024, 1280, 1440]) {
    const { ctx, page, errors } = await open(w);
    if ((await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) > 0) overflow.push(w);
    const l = await page.evaluate(() => {
      const r = (e) => e.getBoundingClientRect();
      const code = r(document.querySelector('.tp-404-code')), h1 = r(document.querySelector('.tp-404 h1'));
      const tops = [...document.querySelectorAll('.tp-404 a.tp-card')].map((a) => Math.round(r(a).top));
      return { beside: h1.left >= code.right, perRow: tops.filter((t) => t === tops[0]).length };
    });
    const wantBeside = w >= 1024, wantRow = w >= 768 ? 3 : 1;
    if (l.beside !== wantBeside || l.perRow !== wantRow) wrong.push(`${w}: beside ${l.beside}, ${l.perRow}/row`);
    errs.push(...errors.map((e) => `${w}: ${e}`));
    await ctx.close();
  }
  check('layout: "404" beside the text from 1024 px, stacked below; 3 cards per row from 768 px, 1 below', wrong.length === 0, wrong.join('; '));
  check('no horizontal overflow at 320 / 375 / 390 / 768 / 1024 / 1280 / 1440', overflow.length === 0, overflow.join(','));
  check('no console errors (all widths)', errs.length === 0, errs.join(' | '));
}

/* ---- Reduced motion ---- */
{
  const { ctx, page, errors } = await open(1280, { reducedMotion: 'reduce' });
  // The cards' "View project" label only appears on hover (pointer devices), as in the prototype: not an entrance state.
  const hidden = await page.$$eval(`${MAIN} .elementor-element:not(.tp-card__more)`, (els) => els.filter((e) => getComputedStyle(e).visibility === 'hidden' || getComputedStyle(e).opacity === '0').length);
  check('reduced motion: every element visible without scrolling (hover-only card label excepted)', hidden === 0, String(hidden));
  const anim = await page.$$eval(`${MAIN} .animated, ${MAIN} .elementor-invisible`, (e) => e.length);
  check('no entrance animations (the prototype 404 has none)', anim === 0, String(anim));
  check('no console errors (reduced motion)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exitCode = failed ? 1 : 0;
