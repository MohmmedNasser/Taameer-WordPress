/**
 * interaction-test.mjs — keyboard/ARIA checks for header menu, skip link, before/after slider, breadcrumbs,
 *   lightbox (wall cladding, licenses; LTR + RTL) and the services chip navigation + related projects.
 *   python -m http.server 5173 ; PW_MODULE=<playwright path> node scripts/interaction-test.mjs
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const pwPath = process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright';
const { chromium } = await import(pwPath);
const BASE = process.env.BASE_URL || 'http://localhost:5173/index.html';
const ORIGIN = new URL(BASE).origin + '/';
const rtlInit = () => new MutationObserver((_, o) => { if (document.documentElement) { document.documentElement.dir = 'rtl'; o.disconnect(); } }).observe(document, { childList: true });
const results = [];
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);

const browser = await chromium.launch();

// Mobile: skip link + menu
{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const skipHidden = await page.$eval('.tp-skip-link', (el) => el.getBoundingClientRect().bottom <= 0);
  check('skip link hidden until focused', skipHidden);
  await page.keyboard.press('Tab');
  const skipShown = await page.$eval('.tp-skip-link', (el) => document.activeElement === el && el.getBoundingClientRect().top >= 0);
  check('skip link is first Tab stop and visible', skipShown);
  await page.screenshot({ path: 'source/screenshots/phase-1/interaction-375-skip.png' });

  await page.click('[data-tp-menu-toggle]');
  await page.waitForTimeout(500);
  const open = await page.evaluate(() => ({
    expanded: document.querySelector('[data-tp-menu-toggle]').getAttribute('aria-expanded'),
    hidden: document.querySelector('[data-tp-menu]').hidden,
    focusInMenu: !!document.activeElement.closest('[data-tp-menu]'),
    locked: document.body.classList.contains('tp-is-locked'),
    // visual check: the panel must cover the viewport, not be trapped inside the header bar
    covers: document.querySelector('[data-tp-menu]').getBoundingClientRect().height > window.innerHeight * 0.8,
  }));
  check('menu opens (aria-expanded, visible, scroll locked)', open.expanded === 'true' && !open.hidden && open.locked);
  check('menu panel covers the viewport', open.covers);
  check('focus moves into menu', open.focusInMenu);
  await page.screenshot({ path: 'source/screenshots/phase-1/interaction-375-menu.png' });
  for (let i = 0; i < 15; i++) await page.keyboard.press('Tab');
  const trapped = await page.evaluate(() => !!document.activeElement.closest('[data-tp-menu]') || document.activeElement.matches('[data-tp-menu-toggle]'));
  check('focus trapped after 15 Tabs', trapped);
  await page.keyboard.press('Escape');
  const closed = await page.evaluate(() => ({
    hidden: document.querySelector('[data-tp-menu]').hidden,
    focusOnToggle: document.activeElement.matches('[data-tp-menu-toggle]'),
  }));
  check('Esc closes menu and returns focus to toggle', closed.hidden && closed.focusOnToggle);
  await page.close();
}

// Before/after in LTR and RTL
for (const dir of ['ltr', 'rtl']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  if (dir === 'rtl') {
    await page.addInitScript(() => new MutationObserver((_, o) => { if (document.documentElement) { document.documentElement.dir = 'rtl'; o.disconnect(); } }).observe(document, { childList: true }));
  }
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const handle = page.locator('.tp-ba__handle');
  await handle.scrollIntoViewIfNeeded();
  await handle.focus();
  await page.keyboard.press('ArrowRight');
  const afterRight = Number(await handle.getAttribute('aria-valuenow'));
  check(`${dir}: ArrowRight moves divider visually right`, dir === 'ltr' ? afterRight === 52 : afterRight === 48, `value ${afterRight}`);
  await page.keyboard.press('Home');
  check(`${dir}: Home → 0`, (await handle.getAttribute('aria-valuenow')) === '0');
  await page.keyboard.press('End');
  check(`${dir}: End → 100`, (await handle.getAttribute('aria-valuenow')) === '100');
  // Pointer: click at 25% from the left edge.
  const box = await page.locator('.tp-ba').boundingBox();
  await page.mouse.click(box.x + box.width * 0.25, box.y + box.height / 2);
  const v = Number(await handle.getAttribute('aria-valuenow'));
  check(`${dir}: pointer click at 25% from left`, dir === 'ltr' ? Math.abs(v - 25) <= 1 : Math.abs(v - 75) <= 1, `value ${v}`);
  // Visual: handle centre sits at the click point.
  const hb = await handle.boundingBox();
  check(`${dir}: handle follows pointer`, Math.abs(hb.x + hb.width / 2 - (box.x + box.width * 0.25)) < 3);
  await page.close();
}

// ---- Inner pages: breadcrumbs, lightbox, service navigation ----
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const [file, label] of [['about.html', 'About'], ['services.html', 'Services']]) {
    await page.goto(ORIGIN + file, { waitUntil: 'networkidle' });
    const bc = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Breadcrumb"]');
      const cur = nav && nav.querySelectorAll('[aria-current="page"]');
      return { has: !!nav, count: cur ? cur.length : 0, last: nav && nav.querySelector('li:last-child [aria-current="page"]') !== null };
    });
    check(`${file}: breadcrumb nav labelled, aria-current on last item only`, bc.has && bc.count === 1 && bc.last);
    const active = await page.$$eval('.tp-nav__link[aria-current="page"]', (a) => a.map((x) => x.textContent.trim()));
    check(`${file}: header nav marks ${label} as current`, active.length === 1 && active[0] === label, active.join(','));
  }

  // Lightbox: wall cladding gallery on services.html
  for (const dir of ['ltr', 'rtl']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pg = await ctx.newPage();
    if (dir === 'rtl') await pg.addInitScript(rtlInit);
    await pg.goto(ORIGIN + 'services.html', { waitUntil: 'networkidle' });
    const first = pg.locator('.tp-gallery a').first();
    await first.scrollIntoViewIfNeeded();
    await pg.waitForTimeout(800);
    const y0 = await pg.evaluate(() => window.scrollY);
    await first.focus();
    await pg.keyboard.press('Enter');
    await pg.waitForSelector('.tp-lbox.is-open');
    const st = await pg.evaluate(() => {
      const d = document.querySelector('.tp-lbox');
      return { role: d.getAttribute('role'), modal: d.getAttribute('aria-modal'), labelled: !!document.getElementById(d.getAttribute('aria-labelledby')).textContent.trim(),
        count: d.querySelector('.tp-lbox__count').textContent, locked: document.body.classList.contains('tp-is-locked'),
        focusIn: d.contains(document.activeElement) };
    });
    check(`${dir}: lightbox opens as labelled modal dialog, body locked, focus inside`, st.role === 'dialog' && st.modal === 'true' && st.labelled && st.locked && st.focusIn);
    check(`${dir}: lightbox counter "1 / 6"`, st.count === '1 / 6', st.count);
    // ArrowRight = next in LTR, previous (wraps to 6) in RTL
    await pg.keyboard.press('ArrowRight');
    const c1 = await pg.textContent('.tp-lbox__count');
    check(`${dir}: ArrowRight ${dir === 'ltr' ? 'goes to next (2 / 6)' : 'goes to previous (6 / 6)'}`, c1 === (dir === 'ltr' ? '2 / 6' : '6 / 6'), c1);
    for (let i = 0; i < 8; i++) await pg.keyboard.press('Tab');
    const trapped = await pg.evaluate(() => document.querySelector('.tp-lbox').contains(document.activeElement));
    check(`${dir}: Tab stays trapped inside the dialog`, trapped);
    // Swipe toward the left edge (touch events dispatched synthetically)
    await pg.evaluate(() => {
      const el = document.querySelector('.tp-lbox');
      const t = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: 300 });
      el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [t(600)], changedTouches: [t(600)] }));
      el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [t(300)] }));
    });
    const c2 = await pg.textContent('.tp-lbox__count');
    check(`${dir}: swipe left ${dir === 'ltr' ? 'shows next' : 'shows previous'}`, dir === 'ltr' ? c2 === '3 / 6' : c2 === '5 / 6', `${c1} → ${c2}`);
    await pg.keyboard.press('Escape');
    const closed = await pg.evaluate(() => ({ hidden: document.querySelector('.tp-lbox').hidden, unlocked: !document.body.classList.contains('tp-is-locked'),
      focus: document.activeElement.classList.contains('tp-gallery__item'), y: window.scrollY }));
    check(`${dir}: Esc closes, unlocks scroll, returns focus to trigger`, closed.hidden && closed.unlocked && closed.focus);
    check(`${dir}: no scroll jump on close`, Math.abs(closed.y - y0) <= 2, `${y0} → ${closed.y}`);
    await ctx.close();
  }

  // Licenses on about.html (R6): previews and buttons link straight to the PDF in a new tab; no lightbox, no custom attributes
  {
    await page.goto(ORIGIN + 'about.html', { waitUntil: 'networkidle' });
    const lic = await page.evaluate(() => ({
      links: [...document.querySelectorAll('.tp-licenses a')].map((a) => ({ href: a.getAttribute('href'), blank: a.target === '_blank', rel: a.rel })),
      lightbox: !!document.querySelector('.tp-licenses.tp-lightbox, .tp-licenses [data-image], .tp-licenses [data-caption]') }));
    check('license links open the PDF directly in a new tab (noopener)', lic.links.length >= 4 && lic.links.every((l) => /\.pdf$/.test(l.href) && l.blank && /noopener/.test(l.rel)), JSON.stringify(lic.links));
    check('licenses carry no lightbox class or data attributes', !lic.lightbox);
  }

  // Service navigation
  await page.goto(ORIGIN + 'services.html', { waitUntil: 'networkidle' });
  const chipCount = await page.$$eval('.tp-scrollspy a', (a) => a.length);
  check('service nav has 6 chips', chipCount === 6);
  await page.locator('.tp-chip', { hasText: 'Renovation' }).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);
  const nav = await page.evaluate(() => ({ cur: [...document.querySelectorAll('.tp-chip[aria-current]')].map((a) => a.textContent.trim()),
    top: document.getElementById('renovation').getBoundingClientRect().top, bar: document.querySelector('.tp-scrollspy').getBoundingClientRect().bottom,
    hash: location.hash }));
  check('keyboard activation scrolls to the section, hash set, chip becomes current', nav.hash === '#renovation' && nav.cur.length === 1 && nav.cur[0] === 'Renovation', JSON.stringify(nav));
  check('target section sits below the sticky bars', nav.top >= nav.bar - 2, `${Math.round(nav.top)} vs ${Math.round(nav.bar)}`);
  await page.evaluate(() => window.scrollTo({ top: document.getElementById('turnkey').offsetTop, behavior: 'instant' }));
  await page.waitForTimeout(700);
  const cur2 = await page.$$eval('.tp-chip[aria-current]', (a) => a.map((x) => x.textContent.trim()));
  check('scrolling to Turnkey highlights the Turnkey chip', cur2.length === 1 && cur2[0] === 'Turnkey Projects', cur2.join(','));
  const stuck = await page.evaluate(() => document.querySelector('.tp-scrollspy').getBoundingClientRect().top);
  check('chip bar is sticky under the header', stuck > 0 && stuck < 120, String(Math.round(stuck)));
  const rel = await page.evaluate(() => ({ construction: document.querySelectorAll('#construction .tp-project').length, fit: document.querySelectorAll('#decoration-fitout .tp-project').length,
    reno: document.querySelectorAll('#renovation .tp-project').length, none: document.querySelectorAll('#maintenance [data-tp-related], #design-build [data-tp-related], #turnkey [data-tp-related]').length }));
  check('related projects: 3 / 3 / 3, none for Design & Build / Maintenance / Turnkey', rel.construction === 3 && rel.fit === 3 && rel.reno === 3 && rel.none === 0, JSON.stringify(rel));
  await page.close();
}

await browser.close();
console.log(results.join('\n'));
process.exitCode = results.some((r) => r.startsWith('FAIL')) ? 1 : 0;
