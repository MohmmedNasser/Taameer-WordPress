/**
 * wp-ar-check.mjs — checks of the Arabic WordPress site (WP Phase 8, Polylang Free, D-045).
 *   PW_MODULE=<playwright> node scripts/wp/wp-ar-check.mjs
 * Needs the static prototype on http://localhost:5173 (python -m http.server 5173): every Arabic page is compared with
 * its ar/*.html twin (project pages: ar/project.html?id=<slug>, rendered by the prototype's JS).
 *   A. every Arabic page (28): /ar/ URL 200, lang="ar" dir="rtl", hreflang pair, language switcher both ways, Arabic
 *      menu with the current item, one h1 = the prototype's h1, h2/h3 = the prototype's, no untranslated English text,
 *      images load with Arabic alt text, internal links stay in /ar/, no console errors, no horizontal overflow
 *   B. every internal URL linked from the Arabic pages returns 200
 *   C. 8 representative pages × 320 / 375 / 390 / 768 / 1024 / 1280 / 1440: overflow, errors, header, FAB
 *   D. reduced motion (Home, About, Services, gym project): everything visible at once, counters final, no wipes
 *   E. RTL behaviour: wipes, counters, before/after (labels, keys, pointer), marquee, mobile menu, Services chips,
 *      Projects filter (Arabic live status), project prev/next + letter link, Testimonials anchors, Contact form
 *      (Arabic labels, validation, confirmation, Mailpit), 404 (status, noindex, Arabic, links, switcher)
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const WP = 'https://taameer.local';
const ST = 'http://localhost:5173';
const MAILPIT = 'http://localhost:10006/api/v1';
const WIDTHS = [320, 375, 390, 768, 1024, 1280, 1440];
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info && !ok ? '  — ' + info : info && ok ? '  (' + info + ')' : ''}`); };
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

const NAV = { home: 'الرئيسية', about: 'من نحن', services: 'خدماتنا', projects: 'مشاريعنا', testimonials: 'آراء العملاء', contact: 'اتصل بنا' };
const SLUGS = ['wadi-alshabak-villas', 'jvc-residential-retail-building', 'palm-jumeirah-villa', 'al-awir-villas', 'dubai-g-residential-villa',
  'abu-dhabi-marina-private-gym', 'kf-inc-headquarters', 'al-warqa-4th-villa', 'dubai-marina-triplex-villa', 'perfume-shop-al-barsha', 'mbr-city-villa',
  'al-warqa-1st-g2-villa', 'faiz-couture-dress-shop', 'atlas-copco-headquarters', 'al-twar-villa', 'souk-al-bahar-apartment', 'um-nahad-villa',
  'beauty-lounge-spa-mirdif', 'thai-restaurant-deira', 'jumeirah-golf-estates-landscaping', 'damac-hills-villa', 'service-blocks-extensions'];
const PAGES = [
  { key: 'home', ar: '/ar/', en: '/', st: '/ar/index.html', nav: 'home' },
  { key: 'about', ar: '/ar/about/', en: '/about/', st: '/ar/about.html', nav: 'about' },
  { key: 'services', ar: '/ar/services/', en: '/services/', st: '/ar/services.html', nav: 'services' },
  { key: 'projects', ar: '/ar/projects/', en: '/projects/', st: '/ar/projects.html', nav: 'projects' },
  ...SLUGS.map((s) => ({ key: s, ar: `/ar/projects/${s}/`, en: `/projects/${s}/`, st: `/ar/project.html?id=${s}`, nav: 'projects', project: true })),
  { key: 'testimonials', ar: '/ar/testimonials/', en: '/testimonials/', st: '/ar/testimonials.html', nav: 'testimonials' },
  { key: 'contact', ar: '/ar/contact/', en: '/contact/', st: '/ar/contact.html', nav: 'contact' },
];
// Headings that exist on one side only, by design (docs/wp-mapping.md → Arabic, Known limitations).
const HEADING_EXCEPTIONS = {
  // The prototype's listing also shows the team-experience section (kept on About only, owner instruction, WP 4A).
  projects: ['مشاريع ضخمة نفّذها فريق تعمير بلس', 'فندق 4 نجوم 2B+G+6+HC', 'G+P+10 طوابق متكررة + صالة رياضية + سطحان',
    'المقر الرئيسي لشركة دبي للاستثمار', 'مركز تسوق / سكني G+M+5 طوابق + سطح', 'خبرة الفريق'],
};

const browser = await chromium.launch();
async function open(url, width = 1280, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 812 : 900 }, ignoreHTTPSErrors: true, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 404/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const res = await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1200);
  return { ctx, page, errors, status: res ? res.status() : 0 };
}
async function scrollThrough(page, step = 400) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += step) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(90); }
  await page.waitForTimeout(1800);
}
// Text of the main content (no header / footer / scripts), as one string and as headings.
const CONTENT = () => {
  const root = document.querySelector('main') || document.querySelector('#content') || document.body;
  const skip = (n) => n.closest('script,style,noscript,template,#masthead,#colophon,header.tp-header,footer.tp-footer,.tp-visually-hidden,.screen-reader-text');
  const hs = [...root.querySelectorAll('h1,h2,h3')].filter((h) => !skip(h) && h.offsetParent !== null).map((h) => ({ tag: h.tagName, t: (h.getAttribute('aria-label') || h.textContent).replace(/\s+/g, ' ').trim() }));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (!skip(n.parentElement) && n.textContent.trim()) texts.push(n.textContent.replace(/\s+/g, ' ').trim());
  const alts = [...document.querySelectorAll('img')].map((i) => i.getAttribute('alt') || '');
  return { hs, text: texts.join(' | '), alts };
};

const internal = new Set();
const staticCache = {};
async function staticContent(st) {
  if (staticCache[st]) return staticCache[st];
  const { ctx, page } = await open(ST + st);
  await scrollThrough(page, 800);
  staticCache[st] = await page.evaluate(CONTENT);
  await ctx.close();
  return staticCache[st];
}

/* ---- A. Every Arabic page ---- */
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;   // e.g. ONLY=home,contact: part A for these pages only
const DEBUG = !!process.env.DEBUG;
const step = (s) => { if (DEBUG) console.log('  …', new Date().toISOString().slice(11, 19), s); };
for (const p of PAGES.filter((x) => !ONLY || ONLY.includes(x.key))) {
  const { ctx, page, errors, status } = await open(WP + p.ar);
  const tag = `[${p.key}]`;
  const doc = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir, url: location.pathname,
    en: (document.querySelector('link[rel=alternate][hreflang=en]') || {}).href, ar: (document.querySelector('link[rel=alternate][hreflang=ar]') || {}).href }));
  check(`${tag} ${p.ar} 200, lang="ar" dir="rtl", hreflang en/ar pair`, status === 200 && doc.url === p.ar && doc.lang === 'ar' && doc.dir === 'rtl' && doc.en === WP + p.en && doc.ar === WP + p.ar, JSON.stringify({ status, ...doc }));

  // Language switcher (header, mobile menu, footer) → English twin, whose switcher comes back here
  const sw = await page.$$eval('.tp-lang', (ps) => ps.map((x) => ({ cur: (x.querySelector('.tp-lang__current') || {}).textContent, href: (x.querySelector('a.tp-lang__link') || {}).href, lang: (x.querySelector('a.tp-lang__link') || {}).lang, t: (x.querySelector('a.tp-lang__link') || {}).textContent })));
  const back = await (await ctx.request.get(WP + p.en)).text();
  const enSw = [...back.matchAll(/class="tp-lang__link" href="([^"]+)" lang="ar"/g)].map((m) => m[1]);
  check(`${tag} switcher: عربي | English → ${p.en}, and back from English`, sw.length === 3 && sw.every((s) => s.cur === 'عربي' && s.href === WP + p.en && s.lang === 'en' && s.t === 'English') && enSw.length === 3 && enSw.every((h) => h === WP + p.ar), JSON.stringify({ sw, enSw }));

  // Menu: Arabic labels, /ar/ links, current item
  const menu = await page.$$eval('#ast-desktop-header .main-header-menu > li > a', (as) => as.map((a) => ({ t: a.textContent.trim(), h: new URL(a.href).pathname, cur: a.getAttribute('aria-current') === 'page' || a.parentElement.classList.contains('current-menu-item') })));
  const expect = Object.keys(NAV).map((k) => NAV[k]).join(',');
  check(`${tag} menu: 6 Arabic items to /ar/…, "${NAV[p.nav]}" current`, menu.map((m) => m.t).join(',') === expect && menu.every((m) => m.h.startsWith('/ar/')) && menu.filter((m) => m.cur).map((m) => m.t).join() === NAV[p.nav], JSON.stringify(menu));

  // Content vs the static Arabic page
  step('scroll'); await scrollThrough(page);
  step('content'); const wp = await page.evaluate(CONTENT);
  step('static'); const st = await staticContent(p.st);
  step('compare');
  const h1 = wp.hs.filter((h) => h.tag === 'H1');
  const sh1 = st.hs.filter((h) => h.tag === 'H1');
  check(`${tag} one h1 = the prototype's`, h1.length === 1 && sh1.length >= 1 && norm(h1[0].t) === norm(sh1[0].t), `${h1.map((h) => h.t)} vs ${sh1.map((h) => h.t)}`);
  const ex = HEADING_EXCEPTIONS[p.key] || [];
  const wpH = new Set(wp.hs.filter((h) => h.tag !== 'H1').map((h) => norm(h.t)));
  const stH = new Set(st.hs.filter((h) => h.tag !== 'H1').map((h) => norm(h.t)));
  const missingH = [...stH].filter((h) => !wpH.has(h) && !ex.includes(h));
  const extraH = [...wpH].filter((h) => !stH.has(h) && !ex.includes(h));
  check(`${tag} h2/h3 texts = the prototype's (${wpH.size})`, !missingH.length && !extraH.length, `missing ${JSON.stringify(missingH)} extra ${JSON.stringify(extraH)}`);
  const english = [...new Set(wp.text.match(/[A-Za-z][A-Za-z'’]+(?: [A-Za-z][A-Za-z'’&.-]*){2,}/g) || [])].filter((e) => !st.text.includes(e));
  check(`${tag} no untranslated English text`, english.length === 0, JSON.stringify(english.slice(0, 6)));

  const imgs = await page.$$eval('#content img, main img', (els) => els.map((i) => ({ src: i.currentSrc || i.src, alt: i.getAttribute('alt'), ok: !(i.complete && i.naturalWidth === 0), hidden: !!i.closest('[aria-hidden="true"]') })));
  const badAlt = imgs.filter((i) => !i.hidden && (i.alt === null || (i.alt && !/[؀-ۿ]/.test(i.alt) && !/^[A-Z0-9 &.+-]+$/i.test(i.alt) && !st.alts.includes(i.alt))));  // brand alts kept in English by the prototype
  check(`${tag} ${imgs.length} images load, Arabic alt text`, imgs.every((i) => i.ok) && badAlt.length === 0, JSON.stringify({ broken: imgs.filter((i) => !i.ok).map((i) => i.src), badAlt: badAlt.slice(0, 3) }));

  const links = await page.$$eval('a[href]', (as) => as.map((a) => ({ h: a.href, sw: a.classList.contains('tp-lang__link') })));
  const own = links.filter((l) => l.h.startsWith('https://taameer.local/'));
  own.forEach((l) => internal.add(l.h.split('#')[0]));
  const leak = own.filter((l) => !l.sw && !/^https:\/\/taameer\.local\/(ar\/|wp-content\/|wp-json\/|xmlrpc|feed|comments)/.test(l.h) && !/\/ar\/?$/.test(l.h));
  check(`${tag} internal links stay in /ar/ (${own.length})`, leak.length === 0, JSON.stringify(leak.slice(0, 5)));
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`${tag} no console errors, no overflow at 1280`, errors.length === 0 && ov <= 0, `${errors.join(' | ')} overflow=${ov}`);
  await ctx.close();
}

/* ---- B. Internal URLs ---- */
{
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
  const bad = [];
  for (const u of internal) {
    if (/\/(feed|comments)\//.test(u)) continue;
    const r = await ctx.request.get(u, { maxRedirects: 0 });
    if (r.status() !== 200) bad.push(`${r.status()} ${u}`);
  }
  check(`every internal URL linked from the Arabic pages returns 200 (${internal.size})`, bad.length === 0, bad.join(', '));
  await ctx.close();
}

/* ---- C. Widths ---- */
const REP = ['/ar/', '/ar/about/', '/ar/services/', '/ar/projects/', '/ar/projects/abu-dhabi-marina-private-gym/', '/ar/testimonials/', '/ar/contact/', '/ar/missing-page-check/'];
for (const u of REP) {
  const bad = [];
  for (const w of WIDTHS) {
    const { ctx, page, errors } = await open(WP + u, w);
    await scrollThrough(page, 600);
    const m = await page.evaluate(() => {
      const fab = document.querySelector('.tp-fab');
      const r = fab && fab.getBoundingClientRect();
      const top = document.querySelector('#ast-scroll-top');
      const t = top && getComputedStyle(top).display !== 'none' ? top.getBoundingClientRect() : null;
      return { ov: document.documentElement.scrollWidth - window.innerWidth, header: document.querySelector('#masthead').getBoundingClientRect().height,
        fab: r ? r.width > 0 && r.right <= window.innerWidth && r.left >= 0 : false, overlap: r && t ? !(t.bottom <= r.top || t.top >= r.bottom || t.right <= r.left || t.left >= r.right) : false };
    });
    if (m.ov > 0 || errors.length || !m.header || !m.fab || m.overlap) bad.push(`${w}: ${JSON.stringify(m)} ${errors.join(' | ')}`);
    await ctx.close();
  }
  check(`${u} at ${WIDTHS.join('/')}: no overflow, no errors, header + WhatsApp button visible, no overlap`, bad.length === 0, bad.join(' ; '));
}

/* ---- D. Reduced motion ---- */
for (const u of ['/ar/', '/ar/about/', '/ar/services/', '/ar/projects/abu-dhabi-marina-private-gym/']) {
  const { ctx, page } = await open(WP + u, 1280, { reducedMotion: 'reduce' });
  const r = await page.evaluate(() => ({
    hidden: [...document.querySelectorAll('.elementor-invisible')].filter((e) => getComputedStyle(e).visibility === 'hidden' || +getComputedStyle(e).opacity < 1).length,
    clipped: [...document.querySelectorAll('.tp-img-reveal')].filter((e) => !['none', 'inset(0px)'].includes(getComputedStyle(e).clipPath)).length,
    counters: [...document.querySelectorAll('.elementor-counter-number')].map((c) => c.textContent.trim()),
    marquee: [...document.querySelectorAll('.tp-marquee__track')].map((t) => getComputedStyle(t).animationName),
  }));
  const counterOk = u === '/ar/' ? r.counters.join() === '2015,100' : u === '/ar/about/' ? r.counters.join() === '2015' : true;
  check(`reduced motion ${u}: all visible at once, no wipe, counters final, marquee static`, r.hidden === 0 && r.clipped === 0 && counterOk && r.marquee.every((a) => a === 'none'), JSON.stringify(r));
  await ctx.close();
}

/* ---- E. RTL behaviour ---- */
// Home: wipe direction, counters, before / after, marquee, mobile menu
{
  const { ctx, page, errors } = await open(WP + '/ar/');
  const wipe = await page.evaluate(() => { const el = [...document.querySelectorAll('.tp-img-reveal')].find((e) => !e.classList.contains('is-visible')); return el ? getComputedStyle(el).clipPath : 'none pending'; });
  check('wipe starts clipped from the left edge (opens from the right, RTL)', wipe === 'inset(0px 0px 0px 100%)', wipe);
  await scrollThrough(page);
  const after = await page.evaluate(() => [...document.querySelectorAll('.tp-img-reveal')].every((e) => e.classList.contains('is-visible')));
  check('every wipe has played after scrolling', after);
  const counters = await page.$$eval('.elementor-counter-number', (els) => els.map((e) => e.textContent.trim()));
  check('counters reach 2015 and 100', counters.join() === '2015,100', counters.join());
  const mq = await page.$eval('.tp-marquee__track', (t) => getComputedStyle(t).animationName);
  check('partner marquee runs right-to-left variant', mq === 'tp-marquee-rtl', mq);
  const ba = await page.evaluate(() => ({ labels: [...document.querySelectorAll('.tp-ba__label')].map((l) => l.textContent), aria: document.querySelector('.tp-ba__handle').getAttribute('aria-label'), text: document.querySelector('.tp-ba__handle').getAttribute('aria-valuetext') }));
  check('before/after: Arabic labels and accessible name', ba.labels.join() === 'قبل,بعد' && ba.aria === 'فاصل المقارنة بين قبل وبعد' && ba.text === '50% من صورة «قبل» ظاهرة', JSON.stringify(ba));
  const h = page.locator('.tp-ba__handle');
  await h.focus(); await page.keyboard.press('ArrowRight');
  const v1 = await h.getAttribute('aria-valuenow');
  await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft');
  const v2 = await h.getAttribute('aria-valuenow');
  check('before/after keys follow the visual direction (→ 48, ← ← 52)', v1 === '48' && v2 === '52', `${v1} ${v2}`);
  await page.$eval('.tp-ba', (b) => b.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(300);
  const box = await page.$eval('.tp-ba', (b) => { const r = b.getBoundingClientRect(); return { x: r.right - r.width * 0.25, y: r.top + r.height / 2 }; });
  await page.mouse.click(box.x, box.y);
  const v3 = await h.getAttribute('aria-valuenow');
  const handleX = await page.$eval('.tp-ba__handle', (e) => { const r = e.getBoundingClientRect(); return r.left + r.width / 2; });
  check('before/after pointer: click 25 % from the right → 25, handle under the pointer', v3 === '25' && Math.abs(handleX - box.x) < 3, `${v3} ${handleX} ${box.x}`);
  check('no console errors (Home RTL)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}
{
  const { ctx, page } = await open(WP + '/ar/', 375);
  const label = await page.$eval('#ast-mobile-header .menu-toggle', (b) => b.textContent.trim());
  await page.click('#ast-mobile-header .menu-toggle');
  await page.waitForTimeout(600);
  const items = await page.$$eval('#ast-mobile-popup .main-header-menu > li > a', (as) => as.filter((a) => a.offsetParent).map((a) => a.textContent.trim()));
  const lang = await page.$eval('#ast-mobile-popup .tp-lang a', (a) => a.href).catch(() => '');
  check('mobile menu: "القائمة", Arabic items, English link', label.includes('القائمة') && items.join(',') === Object.values(NAV).join(',') && lang === WP + '/', `${label} ${items} ${lang}`);
  await ctx.close();
}
// Services: chips start at the right, Arabic landmark name, scrollspy
{
  const { ctx, page } = await open(WP + '/ar/services/');
  const chips = await page.$$eval('.tp-scrollspy a[href^="#"]', (as) => as.map((a) => ({ t: a.textContent.trim(), x: a.getBoundingClientRect().left })));
  const nav = await page.$eval('.tp-scrollspy nav', (n) => n.getAttribute('aria-label'));
  check('Services chips: right to left in RTL, landmark "الخدمات في هذه الصفحة"', chips.length === 6 && chips.every((c, i) => !i || c.x < chips[i - 1].x) && nav === 'الخدمات في هذه الصفحة', JSON.stringify({ chips, nav }));
  await page.click('.tp-scrollspy a[href="#renovation"]');
  await page.waitForTimeout(1500);
  const cur = await page.$eval('.tp-scrollspy a[aria-current="true"]', (a) => a.getAttribute('href')).catch(() => '');
  const top = await page.$eval('#renovation', (s) => s.getBoundingClientRect().top);
  const bar = await page.$eval('.tp-scrollspy', (s) => s.getBoundingClientRect().bottom);
  check('Services chip "#renovation": current chip, section lands below the sticky bars', cur === '#renovation' && top >= bar - 2 && top < bar + 120, `${cur} top=${top} bar=${bar}`);
  await ctx.close();
}
// Projects filter: Arabic counts and live status (number–noun agreement)
{
  const { ctx, page } = await open(WP + '/ar/projects/');
  const labels = await page.$$eval('.tp-filter__btn .elementor-button-text', (els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
  check('filter labels: الكل 22 … with count spans', labels.join('|') === 'الكل 22|الإنشاءات 6|التجديد والديكور 10|التشطيبات الداخلية 5|تنسيق الحدائق والمساحات الخارجية 1', labels.join('|'));
  const want = { construction: ['6', 'عرض 6 مشاريع'], 'renovation-decoration': ['10', 'عرض 10 مشاريع'], landscaping: ['1', 'عرض مشروع واحد'], all: ['22', 'عرض 22 مشروعاً'] };
  for (const [type, [n, msg]] of Object.entries(want)) {
    await page.click(`.tp-filter-${type} a`);
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => ({ shown: [...document.querySelectorAll('.tp-filter__items > .tp-card')].filter((c) => !c.classList.contains('tp-is-filtered')).length, status: (document.querySelector('.tp-filter__bar + [aria-live]') || {}).textContent, q: location.search }));
    check(`filter ${type}: ${n} cards, status "${msg}", URL`, String(r.shown) === n && r.status === msg && (type === 'all' ? r.q === '' : r.q === `?type=${type}`), JSON.stringify(r));
  }
  await ctx.close();
}
// Project page: prev / next landmark + links, related, letter link
{
  const { ctx, page } = await open(WP + '/ar/projects/abu-dhabi-marina-private-gym/');
  const nav = await page.evaluate(() => { const n = document.querySelector('nav.tp-project-nav'); return { label: n.getAttribute('aria-label'), links: [...n.querySelectorAll('a')].map((a) => new URL(a.href).pathname), prevX: n.querySelector('.tp-project-nav__prev').getBoundingClientRect().left, nextX: n.querySelector('.tp-project-nav__next').getBoundingClientRect().left }; });
  check('project prev / next: "مزيد من المشاريع", Arabic project links, previous on the right', nav.label === 'مزيد من المشاريع' && nav.links.every((l) => l.startsWith('/ar/projects/')) && nav.prevX > nav.nextX, JSON.stringify(nav));
  const ba = await page.$$eval('.tp-ba__label', (ls) => ls.map((l) => l.textContent));
  check('gym before/after slider built with Arabic labels', ba.join() === 'قبل,بعد', ba.join());
  await ctx.close();
  const l = await open(WP + '/ar/projects/atlas-copco-headquarters/');
  const letter = await l.page.$eval('.tp-project-letter a.elementor-button', (a) => new URL(a.href).pathname + new URL(a.href).hash).catch(() => '');
  const label = await l.page.$eval('.tp-project-letter .tp-translated', (p) => p.textContent).catch(() => '');
  check('project letter: "اقرأ الخطاب" → /ar/testimonials/#atlas-copco, translation label', letter === '/ar/testimonials/#atlas-copco' && label === 'ترجمة عن الأصل الإنجليزي', `${letter} ${label}`);
  await l.ctx.close();
}
// Testimonials: anchors land below the header, letter links named in Arabic
for (const w of [1280, 375]) {
  const { ctx, page } = await open(WP + '/ar/testimonials/#atlas-copco', w);
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => ({ top: document.getElementById('atlas-copco').getBoundingClientRect().top, header: document.querySelector('#masthead').getBoundingClientRect().bottom,
    names: [...document.querySelectorAll('a.tp-letter-sheet')].map((a) => a.getAttribute('aria-label')) }));
  check(`Testimonials #atlas-copco at ${w}: below the header; links "افتح الخطاب الأصلي من …"`, r.top >= r.header - 1 && r.top < r.header + 120 && r.names.length === 4 && r.names.every((n) => n.startsWith('افتح الخطاب الأصلي من ')), JSON.stringify(r));
  await ctx.close();
}
// Contact: Arabic form, validation, confirmation, Mailpit
{
  const { ctx, page, errors } = await open(WP + '/ar/contact/');
  const form = await page.evaluate(() => {
    const w = document.querySelector('.tp-contact-form');
    return { id: w.querySelector('form').getAttribute('data-formid'), labels: [1, 2, 3, 4, 5].map((n) => w.querySelector(`[id$="-field_${n}-container"] .wpforms-field-label`)).map((l) => l.textContent.replace(/\s*\*\s*$/, '').trim()),
      button: w.querySelector('button.wpforms-submit').textContent.trim(), note: (w.querySelector('.wpforms-description') || {}).textContent, options: [...w.querySelectorAll('select option')].map((o) => o.textContent.trim()) };
  });
  check('Arabic form: labels, options, note, button', form.labels.join('|') === 'الاسم الكامل|عنوان البريد الإلكتروني|رقم الهاتف|نوع المشروع|الرسالة' && form.button === 'إرسال الرسالة' && norm(form.note) === 'الحقول المميزة بعلامة * مطلوبة.' && form.options.join('|') === 'اختر خدمة|الإنشاءات|التصميم والتنفيذ|الديكور والتشطيبات الداخلية|التجديد|الصيانة|مشاريع تسليم المفتاح|أخرى', JSON.stringify(form));
  const F = (n) => `#wpforms-${form.id}-field_${n}`;
  await page.click('.tp-contact-form button.wpforms-submit');
  await page.waitForTimeout(800);
  const errs = await page.$$eval('.tp-contact-form :is(em, label).wpforms-error', (ls) => ls.filter((l) => l.offsetParent).map((l) => l.textContent.trim()));
  check('empty submit: 3 Arabic "required" messages', errs.length === 3 && errs.every((e) => e === 'يرجى تعبئة هذا الحقل.'), JSON.stringify(errs));
  await page.fill(F(1), 'مستخدم تجريبي'); await page.fill(F(2), 'not-an-email'); await page.fill(F(5), 'رسالة تجريبية');
  await page.click('.tp-contact-form button.wpforms-submit');
  await page.waitForTimeout(800);
  const e2 = await page.$$eval('.tp-contact-form :is(em, label).wpforms-error', (ls) => ls.filter((l) => l.offsetParent).map((l) => l.textContent.trim()));
  check('invalid email: Arabic email message', e2.length === 1 && e2[0] === 'يرجى إدخال عنوان بريد إلكتروني صحيح، مثل name@example.com.', JSON.stringify(e2));
  const before = await ctx.request.get(MAILPIT + '/messages', { timeout: 5000 }).then((r) => r.ok()).catch(() => false);
  const stamp = String(Date.now());
  await page.fill(F(2), 'test@example.com'); await page.fill(F(5), 'رسالة تجريبية ' + stamp);
  await page.selectOption(F(4), { index: 1 });
  await page.waitForTimeout(3000);
  await page.click('.tp-contact-form button.wpforms-submit');
  let conf = null;
  for (let i = 0; i < 30 && !conf; i++) { await page.waitForTimeout(500); conf = await page.$eval('.tp-contact-form .wpforms-confirmation-container-full', (c) => ({ h: c.querySelector('h3').textContent, focused: document.activeElement === c })).catch(() => null); }
  check('valid submit: Arabic confirmation "شكراً لرسالتك", focused', !!conf && conf.h === 'شكراً لرسالتك' && conf.focused, JSON.stringify(conf));
  if (before) {
    let msg = null;
    for (let i = 0; i < 20 && !msg; i++) {
      const now = await (await ctx.request.get(MAILPIT + '/messages')).json();
      for (const m of now.messages.slice(0, 5)) {
        const full = await (await ctx.request.get(`${MAILPIT}/message/${m.ID}`)).json();
        if (full.Text && full.Text.includes(stamp)) { msg = m; break; }
      }
      if (!msg) await page.waitForTimeout(1000);
    }
    check('Mailpit: Arabic-site notification received (subject, Reply-To)', !!msg && msg.Subject === 'New enquiry (Arabic site) from مستخدم تجريبي — taameer.ae' && msg.ReplyTo.some((r) => r.Address === 'test@example.com'), msg ? msg.Subject : 'not found');
  } else console.log('SKIP  Mailpit not reachable — email delivery not verified');
  check('no console errors (Arabic contact)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}
// 404
{
  const { ctx, page, status } = await open(WP + '/ar/this-page-does-not-exist/');
  const r = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir, robots: (document.querySelector('meta[name=robots]') || {}).content,
    h1: document.querySelector('h1').textContent.trim(), buttons: [...document.querySelectorAll('.tp-404 a.elementor-button')].map((a) => new URL(a.href).pathname),
    cards: [...document.querySelectorAll('.tp-404 a.tp-card')].map((a) => new URL(a.href).pathname), sw: document.querySelector('.tp-lang a').href,
    code: (() => { const c = document.querySelector('.tp-404-code .elementor-widget-text-editor'); return { pl: getComputedStyle(c).paddingLeft, pr: getComputedStyle(c).paddingRight }; })() }));
  check('Arabic 404: status 404, noindex, lang ar / rtl, Arabic h1', status === 404 && /noindex/.test(r.robots) && r.lang === 'ar' && r.dir === 'rtl' && r.h1 === 'لم نعثر على هذه الصفحة', JSON.stringify({ status, ...r }));
  check('Arabic 404: buttons → /ar/ and /ar/projects/, 3 cards → /ar/projects/…, "404" padding on the left', r.buttons.join() === '/ar/,/ar/projects/' && r.cards.length === 3 && r.cards.every((c) => c.startsWith('/ar/projects/')) && r.code.pl !== '0px' && r.code.pr === '0px', JSON.stringify(r));
  check('Arabic 404: switcher → the same path in English (an English 404)', r.sw === WP + '/this-page-does-not-exist/');
  const en = await ctx.request.get(WP + '/this-page-does-not-exist/');
  const enHtml = await en.text();
  check('English 404 unchanged: 404, English template, switcher → /ar/ same path', en.status() === 404 && /<html lang="en-US"/.test(enHtml) && enHtml.includes('We could not find that page') && enHtml.includes('href="https://taameer.local/ar/this-page-does-not-exist/" lang="ar"'));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exitCode = failed.length ? 1 : 0;
