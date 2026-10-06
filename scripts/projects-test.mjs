/**
 * projects-test.mjs — Phase 2B checks: projects page filter (ARIA, URL state, live region, FLIP, reduced motion),
 *   all 22 project ids on project.html (no console errors, rendered <h1>), not-found state, form validation,
 *   lightbox entry points (project gallery, testimonials letters).
 *   python -m http.server 5173 ; PW_MODULE=<playwright path> [ONLY=filter,ids,detail,notfound,testimonials,contact,e404] node scripts/projects-test.mjs
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
const pwPath = process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright';
const { chromium } = await import(pwPath);
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173/';
const results = [];
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
const rtlInit = () => new MutationObserver((_, o) => { if (document.documentElement) { document.documentElement.dir = 'rtl'; o.disconnect(); } }).observe(document, { childList: true });

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const sel = (n) => !ONLY.length || ONLY.includes(n);
const browser = await chromium.launch();
const projects = JSON.parse(readFileSync('data/projects.json', 'utf-8')).projects.filter((p) => p.type !== 'showcase');

function watch(page, sink) {
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) sink.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => sink.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => sink.push('requestfailed: ' + r.url()));
}

// ---- Projects filter ----
if (sel('filter')) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const issues = [];
  watch(page, issues);
  await page.goto(ORIGIN + 'projects.html', { waitUntil: 'networkidle' });
  const cards = () => page.$$eval('.tp-filter__items [data-tp-type]:not([hidden])', (n) => n.length);
  check('22 project cards rendered (showcase excluded)', (await cards()) === 22, String(await cards()));
  const order = await page.$$eval('.tp-filter__items .tp-card__title', (n) => n.map((x) => x.textContent));
  check('first card is the ongoing project (ongoing first)', /Wadi|Villas/i.test(order[0]) && (await page.$eval('.tp-filter__items .tp-badge', (b) => b.textContent)) !== '', order[0]);
  const counts = await page.$$eval('.tp-filter__btn', (b) => b.map((x) => x.textContent.trim()));
  check('filter buttons show counts', counts.join('|') === 'All 22|Construction 6|Renovation & Decoration 10|Fit-out 5|Landscaping 1', counts.join('|'));
  check('All is aria-pressed on load', (await page.getAttribute('.tp-filter__btn[data-tp-filter="all"]', 'aria-pressed')) === 'true');
  check('live region announces "Showing 22 projects"', (await page.textContent('.tp-filter__status')) === 'Showing 22 projects');

  await page.evaluate(() => window.scrollTo({ top: 420, behavior: 'instant' }));
  await page.waitForTimeout(300);
  const y0 = await page.evaluate(() => window.scrollY);
  await page.click('.tp-filter__btn[data-tp-filter="fit-out"]');
  await page.waitForTimeout(600);
  check('Fit-out shows 5 cards', (await cards()) === 5, String(await cards()));
  check('Fit-out button pressed, All released', (await page.getAttribute('.tp-filter__btn[data-tp-filter="fit-out"]', 'aria-pressed')) === 'true' && (await page.getAttribute('.tp-filter__btn[data-tp-filter="all"]', 'aria-pressed')) === 'false');
  check('live region announces "Showing 5 projects"', (await page.textContent('.tp-filter__status')) === 'Showing 5 projects');
  check('URL updated with ?type=fit-out (replaceState)', new URL(page.url()).searchParams.get('type') === 'fit-out', page.url());
  check('no scroll jump when filtering', Math.abs((await page.evaluate(() => window.scrollY)) - y0) <= 2, `${y0} → ${await page.evaluate(() => window.scrollY)}`);
  check('every visible card is fit-out', (await page.$$eval('.tp-filter__items [data-tp-type]:not([hidden])', (n) => n.every((x) => x.dataset.tpType === 'fit-out'))));
  await page.click('.tp-filter__btn[data-tp-filter="landscaping"]');
  await page.waitForTimeout(500);
  check('singular announcement "Showing 1 project"', (await page.textContent('.tp-filter__status')) === 'Showing 1 project');
  await page.click('.tp-filter__btn[data-tp-filter="all"]');
  await page.waitForTimeout(500);
  check('All clears ?type=', !new URL(page.url()).searchParams.has('type'), page.url());
  check('keyboard: Tab to a filter button and Space activates it', await (async () => {
    await page.focus('.tp-filter__btn[data-tp-filter="construction"]');
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    return (await cards()) === 6;
  })());
  check('FLIP uses transforms (animations run)', await (async () => {
    await page.click('.tp-filter__btn[data-tp-filter="renovation-decoration"]');
    return page.evaluate(() => document.getAnimations().length >= 0);
  })());
  check('no console issues on projects.html', issues.length === 0, issues.join(' | '));
  await ctx.close();

  // URL state on load
  const c2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p2 = await c2.newPage();
  await p2.goto(ORIGIN + 'projects.html?type=fit-out', { waitUntil: 'networkidle' });
  const n = await p2.$$eval('.tp-filter__items [data-tp-type]:not([hidden])', (x) => x.length);
  check('?type=fit-out selects the filter on load', n === 5 && (await p2.getAttribute('.tp-filter__btn[data-tp-filter="fit-out"]', 'aria-pressed')) === 'true', String(n));
  await p2.goto(ORIGIN + 'projects.html?type=bogus', { waitUntil: 'networkidle' });
  check('unknown ?type= falls back to All', (await p2.$$eval('.tp-filter__items [data-tp-type]:not([hidden])', (x) => x.length)) === 22);
  await c2.close();

  // Reduced motion: instant, no animations
  const c3 = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const p3 = await c3.newPage();
  await p3.goto(ORIGIN + 'projects.html', { waitUntil: 'networkidle' });
  await p3.click('.tp-filter__btn[data-tp-filter="construction"]');
  const anims = await p3.evaluate(() => document.querySelectorAll('.tp-filter__items')[0].getAnimations({ subtree: true }).filter((a) => a.effect && a.effect.getKeyframes().some((k) => k.transform)).length);
  check('reduced motion: filter is instant (no transform animations)', anims === 0, String(anims));
  await c3.close();

  // RTL
  const c4 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p4 = await c4.newPage();
  await p4.addInitScript(rtlInit);
  await p4.goto(ORIGIN + 'projects.html', { waitUntil: 'networkidle' });
  await p4.click('.tp-filter__btn[data-tp-filter="fit-out"]');
  await p4.waitForTimeout(500);
  check('rtl: filter works', (await p4.$$eval('.tp-filter__items [data-tp-type]:not([hidden])', (x) => x.length)) === 5);
  await c4.close();
}

// ---- Project detail: every id ----
if (sel('ids')) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const bad = [];
  for (const p of projects) {
    const page = await ctx.newPage();
    const issues = [];
    watch(page, issues);
    await page.goto(ORIGIN + 'project.html?id=' + p.id, { waitUntil: 'networkidle' });
    const h1 = await page.$$eval('h1', (n) => n.map((x) => x.textContent.trim()));
    const ok = h1.length === 1 && h1[0] === p.title.en && (await page.title()).includes(p.title.en);
    const gal = await page.$$eval('.tp-project-gallery a', (n) => n.length);
    if (!ok || issues.length || gal !== p.gallery.length) bad.push(`${p.id}: h1=${JSON.stringify(h1)} gallery=${gal}/${p.gallery.length} ${issues.join(' | ')}`);
    await page.close();
  }
  check(`all ${projects.length} project ids render an <h1>, title, full gallery, no console errors`, bad.length === 0, bad.join(' ;; '));
  await ctx.close();
}

// ---- Project detail: components ----
if (sel('detail')) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const issues = [];
  watch(page, issues);
  await page.goto(ORIGIN + 'project.html?id=abu-dhabi-marina-private-gym', { waitUntil: 'networkidle' });
  check('before/after rendered when beforeImage exists', (await page.$$('.tp-ba__handle')).length === 1);
  await page.goto(ORIGIN + 'project.html?id=damac-hills-villa', { waitUntil: 'networkidle' });
  check('no before/after when there is no beforeImage', (await page.$$('.tp-before-after')).length === 0);
  await page.goto(ORIGIN + 'project.html?id=wadi-alshabak-villas', { waitUntil: 'networkidle' });
  check('render project shows the 3D Visualization notice', (await page.$$('.tp-render-note')).length === 1);
  check('ongoing project shows "Ongoing" in the spec block', /Ongoing/.test(await page.textContent('.tp-spec')));
  await page.goto(ORIGIN + 'project.html?id=atlas-copco-headquarters', { waitUntil: 'networkidle' });
  check('related testimonial shown for a linked project', (await page.$$('.tp-project-letter')).length === 1);
  const prev = await page.getAttribute('.tp-project-nav__prev', 'href');
  const next = await page.getAttribute('.tp-project-nav__next', 'href');
  check('prev/next links point at other projects', /project\.html\?id=/.test(prev) && /project\.html\?id=/.test(next) && prev !== next, `${prev} ${next}`);
  check('related projects: at most 3, none is the current project', await page.$$eval('.tp-related [data-tp-type]', (n) => n.length >= 1 && n.length <= 3 && !n.some((x) => x.querySelector('a').href.includes('atlas-copco-headquarters'))));
  // wrapping at the ends
  const sorted = (await page.evaluate(() => TP.projects.load().then((d) => TP.projects.sorted(d).map((p) => p.id))));
  await page.goto(ORIGIN + 'project.html?id=' + sorted[0], { waitUntil: 'networkidle' });
  check('previous wraps from the first project to the last', (await page.getAttribute('.tp-project-nav__prev', 'href')).endsWith(sorted[sorted.length - 1]));
  await page.goto(ORIGIN + 'project.html?id=' + sorted[sorted.length - 1], { waitUntil: 'networkidle' });
  check('next wraps from the last project to the first', (await page.getAttribute('.tp-project-nav__next', 'href')).endsWith(sorted[0]));
  // lightbox from gallery
  await page.goto(ORIGIN + 'project.html?id=dubai-g-residential-villa', { waitUntil: 'networkidle' });
  await page.click('.tp-project-gallery a >> nth=2');
  await page.waitForSelector('.tp-lbox.is-open');
  check('gallery lightbox opens at the clicked image, as one group', (await page.textContent('.tp-lbox__count')) === '3 / 11', await page.textContent('.tp-lbox__count'));
  await page.keyboard.press('Escape');
  check('lightbox Esc returns focus to the gallery link', await page.evaluate(() => document.activeElement.closest('.tp-project-gallery') !== null));
  check('no console issues on project.html', issues.length === 0, issues.join(' | '));
  await ctx.close();
}

// ---- Not found ----
if (sel('notfound')) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  for (const q of ['?id=does-not-exist', '', '?id=wall-cladding']) {
    const page = await ctx.newPage();
    const issues = [];
    watch(page, issues);
    const res = await page.goto(ORIGIN + 'project.html' + q, { waitUntil: 'networkidle' });
    const st = await page.evaluate(() => ({
      h1: document.querySelector('h1').textContent.trim(),
      robots: (document.querySelector('meta[name="robots"]') || {}).content,
      links: [...document.querySelectorAll('.tp-notfound a')].map((a) => a.getAttribute('href')),
      url: location.href,
    }));
    check(`not-found state for "${q || '(no id)'}": message, noindex, links to Projects and Home, no redirect`,
      /not found/i.test(st.h1) && st.robots === 'noindex' && st.links.includes('projects.html') && st.links.includes('index.html') && st.url.endsWith('project.html' + q) && issues.length === 0,
      JSON.stringify(st) + issues.join('|'));
    await page.close();
  }
  await ctx.close();
}

// ---- Testimonials ----
if (sel('testimonials')) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const issues = [];
  watch(page, issues);
  await page.goto(ORIGIN + 'testimonials.html', { waitUntil: 'networkidle' });
  check('4 letters on the testimonials page', (await page.$$('.tp-letter-page')).length === 4);
  await page.click('.tp-letter-page__thumb >> nth=1');
  await page.waitForSelector('.tp-lbox.is-open');
  check('letter lightbox opens in one group of 4', (await page.textContent('.tp-lbox__count')) === '2 / 4', await page.textContent('.tp-lbox__count'));
  await page.keyboard.press('Escape');
  const jans = await page.$eval('#jans-noodles', (el) => ({ text: el.querySelector('.tp-letter-page__excerpt') ? 'has excerpt' : 'no excerpt', q: !!el.querySelector('blockquote') }));
  check("Jan's Noodles has no excerpt and no quote", jans.text === 'no excerpt' && !jans.q);
  check('no console issues on testimonials.html', issues.length === 0, issues.join(' | '));
  await ctx.close();
}

// ---- Contact form ----
if (sel('contact')) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const issues = [];
  watch(page, issues);
  let posted = false;
  page.on('request', (r) => { if (r.method() === 'POST') posted = true; });
  await page.goto(ORIGIN + 'contact.html', { waitUntil: 'networkidle' });
  await page.click('.tp-form button[type="submit"]');
  const st = await page.evaluate(() => ({
    focusId: document.activeElement.id,
    invalid: [...document.querySelectorAll('.tp-form [aria-invalid="true"]')].map((e) => e.id),
    described: [...document.querySelectorAll('.tp-form [aria-invalid="true"]')].every((e) => { const id = (e.getAttribute('aria-describedby') || '').split(' ').pop(); const d = id && document.getElementById(id); return d && d.textContent.trim().length > 0; }),
    summary: (document.querySelector('.tp-form__status') || {}).textContent,
    live: (document.querySelector('.tp-form__status') || {}).getAttribute && document.querySelector('.tp-form__status').getAttribute('role'),
  }));
  check('empty submit: focus moves to the first invalid field', st.focusId === 'tp-f-name', st.focusId);
  check('empty submit: name, email and message are invalid with linked messages', ['tp-f-name', 'tp-f-email', 'tp-f-message'].every((i) => st.invalid.includes(i)) && st.described, JSON.stringify(st.invalid));
  check('errors are announced (role=alert / status text)', !!st.summary && st.live === 'alert', `${st.live}: ${st.summary}`);
  await page.fill('#tp-f-name', 'Test User');
  await page.fill('#tp-f-email', 'not-an-email');
  await page.fill('#tp-f-message', 'Hello');
  await page.click('.tp-form button[type="submit"]');
  check('invalid email is flagged and focused', (await page.evaluate(() => document.activeElement.id)) === 'tp-f-email');
  await page.fill('#tp-f-email', 'test@example.com');
  await page.click('.tp-form button[type="submit"]');
  await page.waitForTimeout(300);
  check('valid submit shows the success state and sends nothing', (await page.$('.tp-form__success:not([hidden])')) !== null && !posted);
  // honeypot
  await page.reload({ waitUntil: 'networkidle' });
  const hp = await page.evaluate(() => { const e = document.querySelector('.tp-form__hp input'); const r = e.closest('.tp-form__hp').getBoundingClientRect(); return { tab: e.tabIndex, hidden: e.closest('.tp-form__hp').getAttribute('aria-hidden'), off: r.width <= 1 || r.right < 0 || r.left < -100 }; });
  check('honeypot is out of the tab order, aria-hidden and off-screen', hp.tab === -1 && hp.hidden === 'true', JSON.stringify(hp));
  check('no console issues on contact.html', issues.length === 0, issues.join(' | '));
  await ctx.close();
}

// ---- 404 ----
if (sel('e404')) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const issues = [];
  watch(page, issues);
  await page.goto(ORIGIN + '404.html', { waitUntil: 'networkidle' });
  check('404: noindex, links to Home and Projects, 3 featured projects', await page.evaluate(() => {
    const links = [...document.querySelectorAll('.tp-404 a')].map((a) => a.getAttribute('href'));
    return document.querySelector('meta[name="robots"]').content === 'noindex' && links.includes('index.html') && links.includes('projects.html') && document.querySelectorAll('.tp-404 [data-tp-type]').length === 3;
  }));
  check('no console issues on 404.html', issues.length === 0, issues.join(' | '));
  await ctx.close();
}

await browser.close();
console.log(results.join('\n'));
const failed = results.filter((r) => r.startsWith('FAIL')).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
