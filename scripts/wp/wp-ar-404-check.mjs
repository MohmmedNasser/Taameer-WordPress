/**
 * wp-ar-404-check.mjs — read-only browser checks of the Arabic 404 (WP Phase 8 template 660, WP Phase 9 C1 title) and an
 * English 404 regression. Unlike wp-ar-check.mjs it never opens the Contact page or submits a form, so it sends no email.
 *   PW_MODULE=<playwright> node scripts/wp/wp-ar-404-check.mjs
 * No static server needed (the expected title is read from ar/404.html, the featured cards from data/projects.json).
 * Safety: every request to taameer.local other than GET / HEAD is aborted and counted (expected 0), and the Mailpit message
 * count (http://localhost:10006) must be the same before and after the run.
 * Checks: several /ar/ not-found URLs → 404 with the Arabic template; status, noindex, title = prototype, lang ar / dir rtl,
 * one Arabic h1, copy, "404" aria-hidden with its end padding on the left, buttons → /ar/ and /ar/projects/ (targets 200),
 * 3 featured cards → /ar/projects/<slug>/ with Arabic titles (targets 200), Arabic header menu with no current item,
 * language switcher → the same path in English, footer + WhatsApp, keyboard focus; layout mirrored (text start = right,
 * "404" beside it from 1024 px, stacked below; 3 cards per row from 768 px) and no overflow at 7 widths; reduced motion;
 * head (only Yoast's minimal og:locale / og:title / og:site_name, no canonical or description); console errors;
 * English 404 unchanged (status, noindex, title, lang / dir, h1, buttons, switcher → /ar/).
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const WP = 'https://taameer.local';
const MISSING = '/this-page-does-not-exist/';
const AR = WP + '/ar' + MISSING;
const MAILPIT = 'http://localhost:10006/api/v1';
const WIDTHS = [320, 375, 390, 768, 1024, 1280, 1440];
const NAV = ['الرئيسية', 'من نحن', 'خدماتنا', 'مشاريعنا', 'آراء العملاء', 'اتصل بنا'];
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

// Expected title: the prototype's ar/404.html.
const arTitle = norm(readFileSync(new URL('../../ar/404.html', import.meta.url), 'utf8').match(/<title>([^<]*)<\/title>/)[1]);
// Featured projects as projects.js picks them (same rule as wp-404-check.mjs): featured, listing order, first 3.
const data = JSON.parse(readFileSync(new URL('../../data/projects.json', import.meta.url), 'utf8'));
const key = (p) => (p.status === 'ongoing' ? '9999-99' : p.completion || '0000-00');
const featured = data.projects.filter((p) => p.type !== 'showcase').map((p, i) => ({ p, i }))
  .sort((a, b) => key(b.p).localeCompare(key(a.p)) || a.i - b.i).map((x) => x.p).filter((p) => p.featured).slice(0, 3);

const mailCount = async () => { try { const r = await fetch(MAILPIT + '/messages?limit=1'); return r.ok ? (await r.json()).total : null; } catch { return null; } };
const mailBefore = await mailCount();

const browser = await chromium.launch();
let blocked = 0;
const expected404 = (t) => /Failed to load resource: the server responded with a status of 404/.test(t);
async function open(target, width = 1280, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 812 : 900 }, ignoreHTTPSErrors: true, ...opts });
  // Read-only guard: nothing but GET / HEAD may reach the site (no form posts, no admin-ajax writes).
  await ctx.route(/^https:\/\/taameer\.local\//, (route) => {
    if (['GET', 'HEAD'].includes(route.request().method())) return route.continue();
    blocked++;
    return route.abort();
  });
  const page = await ctx.newPage();
  const errors = [];
  let notFound = 0;
  page.on('response', (r) => { if (r.status() === 404 && r.url() !== target) errors.push('404 ' + r.url()); });
  page.on('console', (m) => { if (m.type() === 'error') { if (expected404(m.text()) && !notFound++) return; errors.push(m.text()); } });
  page.on('pageerror', (e) => errors.push(String(e)));
  const res = await page.goto(target, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1200);
  return { ctx, page, errors, status: res ? res.status() : 0 };
}

/* ---- Several Arabic not-found URLs ---- */
for (const u of ['/ar/this-page-does-not-exist/', '/ar/projects/no-such-project/', '/ar/about/team/missing']) {
  const { ctx, page, status } = await open(WP + u);
  const s = await page.evaluate(() => ({ tpl: document.querySelectorAll('.tp-404').length, lang: document.documentElement.lang, dir: document.documentElement.dir }));
  check(`${u} → HTTP 404 with the Arabic 404 template (lang ar, rtl)`, status === 404 && s.tpl === 1 && s.lang === 'ar' && s.dir === 'rtl', JSON.stringify({ status, ...s }));
  await ctx.close();
}

/* ---- Desktop: head, content, navigation ---- */
{
  const { ctx, page, errors, status } = await open(AR);
  check('HTTP status 404', status === 404, String(status));
  const robots = await page.$eval('meta[name="robots"]', (m) => m.content).catch(() => '');
  check('robots meta has noindex', /noindex/.test(robots), robots);
  check(`title = prototype ar/404.html "${arTitle}"`, norm(await page.title()) === arTitle, await page.title());
  const s = await page.evaluate(() => ({
    lang: document.documentElement.lang, dir: document.documentElement.dir, bodyDir: getComputedStyle(document.body).direction,
    h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
    og: [...document.querySelectorAll('meta[property^="og:"]')].map((m) => m.getAttribute('property')).sort().join(),
    canonical: document.querySelectorAll('link[rel=canonical]').length, desc: document.querySelectorAll('meta[name=description]').length,
    astraDefault: document.querySelectorAll('.error-404, .page-sub-title, .ast-404-search').length,
    text: document.querySelector('.tp-404') ? document.querySelector('.tp-404').innerText : '',
  }));
  check('lang="ar", dir="rtl", body direction rtl', s.lang === 'ar' && s.dir === 'rtl' && s.bodyDir === 'rtl', JSON.stringify([s.lang, s.dir, s.bodyDir]));
  check('one h1 "لم نعثر على هذه الصفحة"', s.h1.length === 1 && s.h1[0] === 'لم نعثر على هذه الصفحة', s.h1.join(' | '));
  check('Astra default 404 content absent', s.astraDefault === 0, String(s.astraDefault));
  check('noindex head: only Yoast og:locale / og:site_name / og:title, no social image, canonical or meta description', s.og === 'og:locale,og:site_name,og:title' && s.canonical === 0 && s.desc === 0, JSON.stringify([s.og, s.canonical, s.desc]));
  for (const t of ['الصفحة غير موجودة', 'ربما نُقلت الصفحة أو أن الرابط غير صحيح. عد إلى الصفحة الرئيسية أو تصفّح مشاريعنا.', 'مشاريع مميزة', 'أو استكشف أعمالنا'])
    check(`copy: "${t}"`, norm(s.text).includes(t));

  const code = await page.evaluate(() => {
    const p = [...document.querySelectorAll('.tp-404-code p')].find((e) => e.textContent.trim() === '404');
    const c = document.querySelector('.tp-404-code .elementor-widget-text-editor');
    return p && c ? { hidden: p.getAttribute('aria-hidden'), pl: getComputedStyle(c).paddingLeft, pr: getComputedStyle(c).paddingRight } : null;
  });
  check('"404" aria-hidden, end padding on the left (RTL)', code && code.hidden === 'true' && code.pl !== '0px' && code.pr === '0px', JSON.stringify(code));

  const btns = await page.$$eval('.tp-404 .elementor-widget-button a', (as) => as.map((a) => [a.textContent.trim(), new URL(a.href).pathname]));
  check('buttons: "العودة إلى الرئيسية" → /ar/, "عرض المشاريع" → /ar/projects/', btns.length === 2 && btns[0].join() === 'العودة إلى الرئيسية,/ar/' && btns[1].join() === 'عرض المشاريع,/ar/projects/', JSON.stringify(btns));
  for (const [, href] of btns) {
    const r = await page.request.get(WP + href);
    check(`button target ${href} responds 200`, r.status() === 200, String(r.status()));
  }

  const cards = await page.$$eval('.tp-404 a.tp-card', (as) => as.map((a) => ({ href: new URL(a.href).pathname, title: a.querySelector('h3') && a.querySelector('h3').textContent.trim(), alt: a.querySelector('img') && a.querySelector('img').alt })));
  check('3 featured project cards', cards.length === 3, String(cards.length));
  featured.forEach((p, i) => {
    const c = cards[i] || {};
    check(`card ${i + 1}: /ar/projects/${p.id}/ with the Arabic title and alt text`, c.href === `/ar/projects/${p.id}/` && c.title === p.title.ar && !!c.alt, JSON.stringify(c));
  });
  for (const c of cards) {
    const r = await page.request.get(WP + c.href);
    check(`card link ${c.href} responds 200`, r.status() === 200, String(r.status()));
  }

  const chrome = await page.evaluate(() => ({
    sticky: getComputedStyle(document.querySelector('#masthead')).position,
    nav: [...document.querySelectorAll('#masthead .main-header-menu > li > a')].map((a) => a.textContent.trim()),
    current: document.querySelectorAll('#masthead .current-menu-item, #masthead [aria-current="page"]').length,
    sw: [...document.querySelectorAll('.tp-lang a')].map((a) => a.href),
    footer: !!document.querySelector('footer.site-footer'), wa: !!document.querySelector('a[href*="wa.me"]'),
  }));
  check('sticky header with the 6 Arabic menu items, none current', chrome.sticky === 'sticky' && NAV.every((n) => chrome.nav.includes(n)) && chrome.current === 0, JSON.stringify([chrome.sticky, chrome.nav, chrome.current]));
  check('language switcher → the same path in English', chrome.sw.length > 0 && chrome.sw.every((h) => h === WP + MISSING), chrome.sw.join(' '));
  check('footer and WhatsApp button present', chrome.footer && chrome.wa);

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

/* ---- Widths: mirrored layout and overflow ---- */
{
  const overflow = []; const wrong = []; const errs = [];
  for (const w of WIDTHS) {
    const { ctx, page, errors } = await open(AR, w);
    if ((await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) > 0) overflow.push(w);
    const l = await page.evaluate(() => {
      const r = (e) => e.getBoundingClientRect();
      const code = r(document.querySelector('.tp-404-code')), h1 = r(document.querySelector('.tp-404 h1'));
      const tops = [...document.querySelectorAll('.tp-404 a.tp-card')].map((a) => Math.round(r(a).top));
      // RTL: the "404" sits on the right (start) and the text to its left.
      return { beside: h1.right <= code.left + 1, perRow: tops.filter((t) => t === tops[0]).length };
    });
    const wantBeside = w >= 1024, wantRow = w >= 768 ? 3 : 1;
    if (l.beside !== wantBeside || l.perRow !== wantRow) wrong.push(`${w}: beside ${l.beside}, ${l.perRow}/row`);
    errs.push(...errors.map((e) => `${w}: ${e}`));
    await ctx.close();
  }
  check('RTL layout: "404" on the right with the text beside it from 1024 px, stacked below; 3 cards per row from 768 px, 1 below', wrong.length === 0, wrong.join('; '));
  check(`no horizontal overflow at ${WIDTHS.join(' / ')}`, overflow.length === 0, overflow.join(','));
  check('no console errors (all widths)', errs.length === 0, errs.join(' | '));
}

/* ---- Reduced motion ---- */
{
  const { ctx, page, errors } = await open(AR, 1280, { reducedMotion: 'reduce' });
  const hidden = await page.$$eval('.tp-404 .elementor-element:not(.tp-card__more)', (els) => els.filter((e) => getComputedStyle(e).visibility === 'hidden' || getComputedStyle(e).opacity === '0').length);
  check('reduced motion: every element visible without scrolling (hover-only card label excepted)', hidden === 0, String(hidden));
  const anim = await page.$$eval('.tp-404 .animated, .tp-404 .elementor-invisible', (e) => e.length);
  check('no entrance animations', anim === 0, String(anim));
  check('no console errors (reduced motion)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- English 404 regression ---- */
{
  const { ctx, page, errors, status } = await open(WP + MISSING);
  const s = await page.evaluate(() => ({
    lang: document.documentElement.lang, dir: document.documentElement.dir || 'ltr', robots: (document.querySelector('meta[name=robots]') || {}).content,
    h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()), tpl: document.querySelectorAll('.tp-404').length,
    btns: [...document.querySelectorAll('.tp-404 .elementor-widget-button a')].map((a) => new URL(a.href).pathname),
    sw: [...document.querySelectorAll('.tp-lang a')].map((a) => a.href),
  }));
  check('English 404: status 404, noindex, lang en-US / ltr, template once, h1 "We could not find that page"', status === 404 && /noindex/.test(s.robots) && s.lang === 'en-US' && s.dir === 'ltr' && s.tpl === 1 && s.h1.length === 1 && s.h1[0] === 'We could not find that page', JSON.stringify({ status, ...s }));
  check('English 404: title "Page not found — Taameer Plus Contracting LLC"', (await page.title()) === 'Page not found — Taameer Plus Contracting LLC', await page.title());
  check('English 404: buttons → / and /projects/, switcher → /ar/ same path', s.btns.join() === '/,/projects/' && s.sw.length > 0 && s.sw.every((h) => h === AR), JSON.stringify([s.btns, s.sw]));
  check('no console errors (English 404)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();

/* ---- Side effects ---- */
check('read-only: no non-GET request to the site was attempted', blocked === 0, `${blocked} blocked`);
const mailAfter = await mailCount();
check('Mailpit reachable and message count unchanged', mailBefore !== null && mailAfter === mailBefore, `before ${mailBefore}, after ${mailAfter}`);

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exitCode = failed ? 1 : 0;
