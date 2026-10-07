/**
 * wp-projects-check.mjs — functional checks of the WordPress Projects listing (WP phase 4A).
 *   PW_MODULE=<playwright> node scripts/wp/wp-projects-check.mjs [url=https://taameer.local/projects/]
 * Checks: one h1 + heading order, 3 sections (hero, archive, shared CTA), no HTML widget, 22 cards in listing order with
 * the titles / locations / types / years / badges / links / images (alt, loaded) of data/projects.json, the four team-experience
 * buildings and the wall-cladding showcase absent, filter (counts, pressed state, visibility per type, keyboard, ?type=,
 * live status), current menu item, header / footer / CTA, columns per width (3 / 3 / 2 / 1) and no overflow at 7 widths,
 * reduced motion, console errors. Individual project pages (/projects/<slug>/) are not requested: they come in phase 4B.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const url = process.argv[2] || 'https://taameer.local/projects/';
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };
const MAIN = '[data-elementor-type="wp-page"]';

// Expected cards: listing order of projects.js (ongoing first, then newest completion, stable; showcase excluded).
const data = JSON.parse(readFileSync(new URL('../../data/projects.json', import.meta.url), 'utf8'));
const key = (p) => (p.status === 'ongoing' ? '9999-99' : p.completion || '0000-00');
const expected = data.projects.filter((p) => p.type !== 'showcase')
  .map((p, i) => ({ p, i })).sort((a, b) => key(b.p).localeCompare(key(a.p)) || a.i - b.i).map((x) => x.p);
const TYPE = { construction: 'Construction', 'renovation-decoration': 'Renovation & Decoration', 'fit-out': 'Fit-out', landscaping: 'Landscaping' };
const counts = {};
expected.forEach((p) => { counts[p.type] = (counts[p.type] || 0) + 1; });

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
const visibleTitles = (page) => page.$$eval('.tp-filter__items > .tp-card', (els) =>
  els.filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.querySelector('h3').textContent.trim()));
const pressed = (page) => page.$$eval('.tp-filter__btn a', (els) => els.filter((e) => e.getAttribute('aria-pressed') === 'true').map((e) => e.textContent.replace(/\s+/g, ' ').trim()));

/* ---- Desktop ---- */
{
  const { ctx, page, errors } = await open(1280);
  check('page title contains "Projects"', /Projects/.test(await page.title()), await page.title());
  check('exactly one h1 ("Our Projects")', (await page.locator('h1').count()) === 1 && (await page.locator('h1').innerText()).trim() === 'Our Projects');
  const headings = await page.$$eval(`${MAIN} h1, ${MAIN} h2, ${MAIN} h3`, (els) => els.map((e) => e.tagName));
  check('heading order: h1, h2 (all projects), 22 x h3, h2 (CTA)', headings[0] === 'H1' && headings[1] === 'H2' && headings.filter((h) => h === 'H3').length === 22 && headings.at(-1) === 'H2', headings.join(' '));
  const sections = await page.$$eval(`${MAIN} > .e-con`, (els) => els.length);
  check('3 top-level sections (hero, archive, CTA)', sections === 3, String(sections));
  check('no HTML widget on the page', (await page.locator(`${MAIN} .elementor-widget-html`).count()) === 0);
  check('breadcrumbs: Home link + current page', (await page.locator('.tp-breadcrumb__list li').count()) === 2 && (await page.locator('.tp-breadcrumb [aria-current="page"]').textContent()).trim() === 'Projects');
  check('eyebrow + lead as in the prototype', (await page.locator('.tp-eyebrow').first().innerText()).trim().toLowerCase() === 'track record' &&
    (await page.locator(MAIN).innerText()).includes('A selection of construction, renovation and fit-out works completed across Dubai and Abu Dhabi.'));

  await scrollThrough(page);
  const cards = await page.$$eval('.tp-filter__items > .tp-card', (els) => els.map((e) => ({
    tag: e.tagName, href: e.getAttribute('href'), cls: e.className, title: e.querySelector('h3').textContent.trim(),
    meta: [...e.querySelectorAll('p.tp-eyebrow, .elementor-widget-heading p')].map((p) => p.textContent.trim()),
    img: (() => { const i = e.querySelector('img'); return { src: i.currentSrc, alt: i.alt, ok: i.complete && i.naturalWidth > 0, w: i.naturalWidth, h: i.naturalHeight }; })(),
    badges: [...e.querySelectorAll('.elementor-widget-heading')].map((w) => w.textContent.trim()).filter((t) => t === 'Ongoing' || t === '3D Visualization'),
    more: e.textContent.includes('View project'),
  })));
  check('22 project cards', cards.length === 22, String(cards.length));
  check('cards are links (<a>) to /projects/<slug>/', cards.every((c, i) => c.tag === 'A' && new URL(c.href, url).pathname === `/projects/${expected[i].id}/`));
  const dec = (s) => s.replace(/&amp;/g, '&');
  check('titles and order match data/projects.json', cards.every((c, i) => c.title === dec(expected[i].title.en)), cards.filter((c, i) => c.title !== dec(expected[i].title.en)).map((c) => c.title).join(' | '));
  check('locations match', cards.every((c, i) => c.meta.includes(dec(expected[i].location.en))));
  check('type label and year / Ongoing match', cards.every((c, i) => {
    const p = expected[i];
    return c.meta.includes(TYPE[p.type]) && (p.status === 'ongoing' ? c.meta.includes('Ongoing') : !p.completion || c.meta.includes(p.completion.slice(0, 4)));
  }));
  check('category classes (tp-type-<type>) match', cards.every((c, i) => c.cls.split(/\s+/).includes('tp-type-' + expected[i].type)));
  check('covers match (file name) and load', cards.every((c, i) => decodeURIComponent(c.img.src).replace(/-\d+x\d+(?=\.)/, '').includes(path.basename(expected[i].cover, '.webp')) && c.img.ok),
    cards.filter((c, i) => !c.img.src.includes(path.basename(expected[i].cover, '.webp').replace(/-\d+$/, ''))).map((c) => c.title).join(' | '));
  check('every cover has alt text', cards.every((c) => c.img.alt.trim().length > 8), cards.filter((c) => c.img.alt.trim().length <= 8).map((c) => c.title).join(' | '));
  const badgeOk = cards.every((c, i) => {
    const p = expected[i];
    const want = [...(p.status === 'ongoing' ? ['Ongoing'] : []), ...(p.isRender ? ['3D Visualization'] : [])];
    // the "Ongoing" year label also matches: only compare the 3D Visualization badge plus ongoing count
    return c.badges.includes('3D Visualization') === want.includes('3D Visualization');
  });
  check('3D Visualization badge only on rendered projects; Ongoing badge on the ongoing one', badgeOk && cards[0].badges.filter((b) => b === 'Ongoing').length >= 1);
  check('each card has "View project"', cards.every((c) => c.more));
  const body = await page.locator(MAIN).innerText();
  check('team-experience buildings and wall cladding are not on the listing', !/Team experience|Al Barsha 1st, Dubai|Souq Al Kabeer|Wall cladding/i.test(body.replace(/Al Barsha 1st, Dubai/g, (m, o) => (cards.some((c) => c.meta.includes('Al Barsha 1st, Dubai')) ? '' : m))));
  const imgSizes = await page.$$eval('.tp-filter__items img', (els) => els.map((i) => { const r = i.getBoundingClientRect(); return r.width / r.height; }));
  check('card images are cropped 4:3', imgSizes.every((r) => Math.abs(r - 4 / 3) < 0.02), imgSizes.map((r) => r.toFixed(2)).slice(0, 3).join(','));

  // Filter
  const btnText = await page.$$eval('.tp-filter__btn a', (els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
  check('filter bar: All 22 / Construction 6 / Renovation & Decoration 10 / Fit-out 5 / Landscaping 1',
    JSON.stringify(btnText) === JSON.stringify(['All 22', 'Construction 6', 'Renovation & Decoration 10', 'Fit-out 5', 'Landscaping 1']), btnText.join(' | '));
  check('filter buttons are role=button with aria-pressed; All is pressed at load', (await page.$$eval('.tp-filter__btn a', (els) => els.every((e) => e.getAttribute('role') === 'button' && e.hasAttribute('aria-pressed')))) && (await pressed(page)).join() === 'All 22');
  check('active filter has the ink fill', await page.$eval('.tp-filter-all a', (e) => getComputedStyle(e).backgroundColor === 'rgb(13, 13, 13)'));
  check('inactive filter has no fill and a hairline border', await page.$eval('.tp-filter-construction a', (e) => { const s = getComputedStyle(e); return s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.borderTopWidth === '1px'; }));
  const filterNames = { construction: 'Construction', 'renovation-decoration': 'Renovation & Decoration', 'fit-out': 'Fit-out', landscaping: 'Landscaping' };
  let allOk = true; const bad = [];
  for (const [k, label] of Object.entries(filterNames)) {
    await page.click(`.tp-filter-${k} a`);
    await page.waitForTimeout(700);
    const t = await visibleTitles(page);
    const want = expected.filter((p) => p.type === k).map((p) => dec(p.title.en));
    const pr = await pressed(page);
    const status = (await page.locator('.tp-filter__bar + p[aria-live]').innerText()).trim();
    const ok = JSON.stringify(t) === JSON.stringify(want) && pr.length === 1 && pr[0].startsWith(label) &&
      status === (want.length === 1 ? 'Showing 1 project' : `Showing ${want.length} projects`) && page.url().includes('type=' + k);
    if (!ok) { allOk = false; bad.push(`${k}: ${t.length}/${want.length} ${pr} "${status}"`); }
  }
  check('each filter shows exactly its projects, one pressed button, live status, ?type= in the URL', allOk, bad.join('; '));
  await page.click('.tp-filter-all a');
  await page.waitForTimeout(700);
  check('"All" restores 22 cards and clears ?type=', (await visibleTitles(page)).length === 22 && !page.url().includes('type='));
  // keyboard
  await page.focus('.tp-filter-fit-out a');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  const afterEnter = (await visibleTitles(page)).length;
  await page.focus('.tp-filter-landscaping a');
  await page.keyboard.press('Space');
  await page.waitForTimeout(700);
  const afterSpace = (await visibleTitles(page)).length;
  check('filter works from the keyboard (Enter, Space)', afterEnter === counts['fit-out'] && afterSpace === 1, `${afterEnter}, ${afterSpace}`);
  check('filter buttons show a visible focus ring', await page.$eval('.tp-filter-construction a', (e) => { e.focus(); const s = getComputedStyle(e); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0; }));
  await page.click('.tp-filter-all a');
  await page.waitForTimeout(700);
  await page.locator('.tp-filter__items > .tp-card').first().focus();
  check('project cards are keyboard focusable links', await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('tp-card')));

  // CTA, header, footer, menu
  check('shared CTA band present (heading + Get a Quote + phone + email)', (await page.locator(`${MAIN} .elementor-widget-shortcode .elementor[data-elementor-id="228"] h2`).first().innerText()).trim() === 'Ready to build your next project?' &&
    (await page.locator(`${MAIN} a[href^="tel:"]`).count()) >= 1 && (await page.locator(`${MAIN} a[href^="mailto:"]`).count()) >= 1);
  check('Astra header + footer present, Projects is the current menu item', (await page.locator('#masthead').count()) === 1 && (await page.locator('#colophon').count()) === 1 &&
    (await page.locator('#masthead .current-menu-item > a, #masthead [aria-current="page"]').first().innerText()).trim() === 'Projects');
  check('floating buttons present (WhatsApp)', (await page.locator('.tp-fab, a[href^="https://wa.me/"]').count()) >= 1);
  check('no console errors (desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Deep link ---- */
{
  const { ctx, page, errors } = await open(1280, {}, url + '?type=fit-out');
  const t = await visibleTitles(page);
  check('?type=fit-out opens filtered (5 cards, Fit-out pressed)', t.length === counts['fit-out'] && (await pressed(page))[0].startsWith('Fit-out'), `${t.length}`);
  check('no console errors (deep link)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Widths: columns and overflow ---- */
{
  const cols = { 320: 1, 375: 1, 390: 1, 768: 2, 1024: 3, 1280: 3, 1440: 3 };
  const overflow = []; const wrong = []; const errs = [];
  for (const [w, n] of Object.entries(cols)) {
    const { ctx, page, errors } = await open(Number(w));
    await scrollThrough(page);
    overflow.push(...(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) > 0 ? [w] : []);
    const lefts = await page.$$eval('.tp-filter__items > .tp-card', (els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().left)))].length);
    if (lefts !== n) wrong.push(`${w}px: ${lefts} cols (want ${n})`);
    errs.push(...errors);
    await ctx.close();
  }
  check('columns per width: 1 (320/375/390), 2 (768), 3 (1024/1280/1440)', wrong.length === 0, wrong.join('; '));
  check('no horizontal overflow at 320 / 375 / 390 / 768 / 1024 / 1280 / 1440', overflow.length === 0, overflow.join(','));
  check('no console errors (all widths)', errs.length === 0, errs.join(' | '));
}

/* ---- Reduced motion ---- */
{
  const { ctx, page, errors } = await open(1280, { reducedMotion: 'reduce' });
  const hidden = await page.$$eval('.tp-filter__items > .tp-card', (els) => els.filter((e) => getComputedStyle(e).visibility === 'hidden' || getComputedStyle(e).opacity === '0').length);
  check('reduced motion: all 22 cards visible without scrolling', hidden === 0, String(hidden));
  await page.click('.tp-filter-landscaping a');
  await page.waitForTimeout(150);
  check('reduced motion: filter applies instantly', (await visibleTitles(page)).length === 1);
  check('no console errors (reduced motion)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exitCode = failed ? 1 : 0;
