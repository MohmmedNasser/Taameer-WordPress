/**
 * ar-test.mjs — Phase 3 checks on the Arabic pages (ar/*.html), re-runnable QA.
 *   python -m http.server 5173 ; PW_MODULE=<playwright path> node scripts/ar-test.mjs
 *   ONLY=overflow,typography,menu,...  to run blocks.
 * Blocks: overflow (4 widths, motion + reduced motion, console/network errors) · typography (no letter-spacing /
 * text-transform / italics on any Arabic text) · switcher · menu (mobile menu keys) · marquee (RTL direction) ·
 * beforeafter (drag + keyboard) · lightbox (arrows, swipe, labels) · filter (FLIP filter, Arabic announcement, ?type=) ·
 * project (JSON labels, ids, not-found) · services (scrollspy, related, gallery order) · contact (validation messages) · notfound
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const pwPath = process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright';
const { chromium } = await import(pwPath);
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173/';
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const run = (n) => !ONLY.length || ONLY.includes(n);
const PAGES = ['index', 'about', 'services', 'projects', 'project', 'testimonials', 'contact', '404'];
const URLS = { project: 'project.html?id=atlas-copco-headquarters' };
const url = (p) => ORIGIN + 'ar/' + (URLS[p] || p + '.html');
const results = [];
const check = (name, ok, detail = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); };
const browser = await chromium.launch();

async function open(p, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: opts.w || 1280, height: opts.h || 900 }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', hasTouch: !!opts.touch });
  const page = await ctx.newPage();
  const issues = [];
  page.on('pageerror', (e) => issues.push('pageerror ' + e.message));
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) issues.push(m.type() + ' ' + m.text()); });
  page.on('requestfailed', (r) => issues.push('requestfailed ' + r.url()));
  page.on('response', (r) => { if (r.status() >= 400) issues.push(r.status() + ' ' + r.url()); });
  await page.goto(opts.raw ? opts.raw : url(p), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  page.issues = issues;
  page.ctx = ctx;
  return page;
}

// ---------------------------------------------------------------- overflow + console
if (run('overflow')) {
  for (const reduced of [false, true]) {
    for (const w of [375, 768, 1280, 1920]) {
      const bad = [];
      for (const p of PAGES) {
        const pg = await open(p, { w, reduced });
        const over = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (over > 0) bad.push(`${p} overflow ${over}px`);
        const real = pg.issues.filter((i) => !(p === '404' && /404/.test(i) && /noindex/.test(i)));
        if (real.length) bad.push(`${p}: ${real.slice(0, 2).join(' | ')}`);
        await pg.ctx.close();
      }
      check(`${w}px${reduced ? ' reduced-motion' : ''}: no horizontal scroll, no console/network errors on 8 pages`, !bad.length, bad.join('; '));
    }
  }
}

// ---------------------------------------------------------------- typography audit
if (run('typography')) {
  const bad = [];
  let nodes = 0;
  for (const p of PAGES) {
    const pg = await open(p);
    const r = await pg.evaluate(() => {
      const out = { n: 0, bad: [], fonts: new Set(), lang: document.documentElement.lang, dir: document.documentElement.dir };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!/[؀-ۿ]/.test(node.textContent) || !node.parentElement) continue;
        const el = node.parentElement;
        if (el.closest('script,style,template')) continue;
        const cs = getComputedStyle(el);
        out.n++;
        const ls = cs.letterSpacing;
        if (ls !== 'normal' && parseFloat(ls) !== 0) out.bad.push(`${el.tagName}.${el.className} letter-spacing ${ls}`);
        if (cs.textTransform !== 'none') out.bad.push(`${el.tagName}.${el.className} text-transform ${cs.textTransform}`);
        if (cs.fontStyle !== 'normal') out.bad.push(`${el.tagName}.${el.className} font-style ${cs.fontStyle}`);
        out.fonts.add(cs.fontFamily.split(',')[0].replace(/"/g, ''));
      }
      out.fonts = [...out.fonts];
      return out;
    });
    nodes += r.n;
    if (r.lang !== 'ar' || r.dir !== 'rtl') bad.push(`${p}: lang/dir ${r.lang}/${r.dir}`);
    if (r.bad.length) bad.push(`${p}: ${[...new Set(r.bad)].slice(0, 3).join('; ')}`);
    if (!r.fonts.every((f) => ['El Messiri', 'IBM Plex Sans Arabic'].includes(f))) bad.push(`${p}: unexpected fonts ${r.fonts}`);
    await pg.ctx.close();
  }
  check(`typography: ${nodes} Arabic text nodes on 8 pages have letter-spacing 0, no text-transform, no italics, only El Messiri / IBM Plex Sans Arabic`, !bad.length, bad.join(' || '));
}

// ---------------------------------------------------------------- language switcher
if (run('switcher')) {
  const bad = [];
  for (const p of PAGES) {
    const pg = await open(p);
    const r = await pg.evaluate(() => [...document.querySelectorAll('.tp-lang__link')].map((a) => [a.textContent.trim(), a.getAttribute('href'), a.lang]));
    const want = p === 'project' ? '../project.html?id=atlas-copco-headquarters' : `../${p}.html`;
    if (!r.length || r.some((x) => x[0] !== 'English' || x[1] !== want || x[2] !== 'en')) bad.push(`${p}: ${JSON.stringify(r[0])}`);
    await pg.ctx.close();
  }
  check('switcher: reads "English" and links to the equivalent English page (project keeps ?id=)', !bad.length, bad.join('; '));
  const en = await open('x', { raw: ORIGIN + 'about.html' });
  check('switcher (EN): reads "عربي" and links to ar/about.html', await en.$eval('.tp-lang__link', (a) => a.textContent.trim() === 'عربي' && a.getAttribute('href') === 'ar/about.html'));
  await en.ctx.close();
}

// ---------------------------------------------------------------- mobile menu
if (run('menu')) {
  const pg = await open('index', { w: 375, h: 812 });
  await pg.click('[data-tp-menu-toggle]');
  // interactions.js moves focus into the panel one animation frame after opening: wait for it instead of racing it
  await pg.waitForFunction(() => !!document.activeElement.closest('[data-tp-menu]'));
  const st = await pg.evaluate(() => ({ exp: document.querySelector('[data-tp-menu-toggle]').getAttribute('aria-expanded'), hidden: document.querySelector('[data-tp-menu]').hidden,
    label: document.querySelector('.tp-menu-toggle__label').textContent.trim(), focus: !!document.activeElement.closest('[data-tp-menu]'), locked: document.body.classList.contains('tp-is-locked') }));
  check('menu: opens, focus inside, scroll locked, label becomes "إغلاق"', st.exp === 'true' && !st.hidden && st.focus && st.locked && st.label === 'إغلاق', JSON.stringify(st));
  for (let i = 0; i < 14; i++) await pg.keyboard.press('Tab');
  check('menu: Tab stays trapped', await pg.evaluate(() => !!document.activeElement.closest('[data-tp-menu]') || document.activeElement.matches('[data-tp-menu-toggle]')));
  await pg.keyboard.press('Escape');
  const after = await pg.evaluate(() => ({ hidden: document.querySelector('[data-tp-menu]').hidden, onToggle: document.activeElement.matches('[data-tp-menu-toggle]'), label: document.querySelector('.tp-menu-toggle__label').textContent.trim() }));
  check('menu: Esc closes, focus returns to the toggle, label back to "القائمة"', after.hidden && after.onToggle && after.label === 'القائمة', JSON.stringify(after));
  await pg.goto(url('index'));
  const skip = await pg.evaluate(() => { document.querySelector('.tp-skip-link').focus(); const r = document.querySelector('.tp-skip-link').getBoundingClientRect(); return [r.top >= 0, document.querySelector('.tp-skip-link').textContent.trim()]; });
  check('skip link: visible on focus, Arabic text', skip[0] && skip[1] === 'انتقل إلى المحتوى', skip.join(' '));
  await pg.ctx.close();
}

// ---------------------------------------------------------------- marquee
if (run('marquee')) {
  const pg = await open('index');
  await pg.locator('.tp-marquee').scrollIntoViewIfNeeded();
  const x = async () => pg.$eval('.tp-marquee__track', (t) => { const m = new DOMMatrix(getComputedStyle(t).transform); return m.m41; });
  const a = await x(); await pg.waitForTimeout(700); const b = await x();
  check('marquee: moves toward the inline-end (positive translate in RTL)', b > a, `${a.toFixed(1)} → ${b.toFixed(1)}`);
  await pg.ctx.close();
  const rm = await open('index', { reduced: true });
  const st = await rm.$eval('.tp-marquee__track', (t) => [getComputedStyle(t).animationName, getComputedStyle(t).flexWrap]);
  check('marquee: reduced motion = static wrapped row', st[0] === 'none' && st[1] === 'wrap', st.join(' '));
  await rm.ctx.close();
}

// ---------------------------------------------------------------- before/after
if (run('beforeafter')) {
  const pg = await open('index');
  const handle = pg.locator('.tp-ba__handle');
  await handle.scrollIntoViewIfNeeded();
  check('before/after: labels and slider name are Arabic', await pg.evaluate(() => document.querySelector('.tp-ba__label--before').textContent === 'قبل' && /قبل وبعد/.test(document.querySelector('.tp-ba__handle').getAttribute('aria-label'))));
  await handle.focus();
  await pg.keyboard.press('ArrowRight');
  const v = Number(await handle.getAttribute('aria-valuenow'));
  check('before/after: ArrowRight moves the divider visually right (value 48 in RTL)', v === 48, `value ${v}`);
  await pg.keyboard.press('Home'); await pg.keyboard.press('End');
  const box = await pg.locator('.tp-ba').boundingBox();
  await pg.mouse.click(box.x + box.width * 0.25, box.y + box.height / 2);
  const p = Number(await handle.getAttribute('aria-valuenow'));
  const hb = await handle.boundingBox();
  check('before/after: click at 25% from the left → value 75, handle under the pointer', Math.abs(p - 75) <= 1 && Math.abs(hb.x + hb.width / 2 - (box.x + box.width * 0.25)) < 3, `value ${p}`);
  await pg.mouse.move(box.x + box.width * 0.7, box.y + 20); await pg.mouse.down(); await pg.mouse.move(box.x + box.width * 0.4, box.y + 20); await pg.mouse.up();
  const d = Number(await handle.getAttribute('aria-valuenow'));
  check('before/after: dragging left increases the "before" share in RTL', Math.abs(d - 60) <= 2, `value ${d}`);
  await pg.ctx.close();
}

// ---------------------------------------------------------------- lightbox
if (run('lightbox')) {
  for (const [file, sel, total, name] of [['services.html', '.tp-gallery a', 6, 'wall cladding'], ['testimonials.html', '.tp-lightbox a', 4, 'letters']]) {
    const pg = await open('x', { raw: ORIGIN + 'ar/' + file, touch: true });
    const first = pg.locator(sel).first();
    await first.scrollIntoViewIfNeeded(); await pg.waitForTimeout(600);
    await first.focus(); await pg.keyboard.press('Enter');
    await pg.waitForSelector('.tp-lbox.is-open');
    const st = await pg.evaluate(() => ({ count: document.querySelector('.tp-lbox__count').textContent, close: document.querySelector('.tp-lbox__close').getAttribute('aria-label'),
      next: document.querySelector('.tp-lbox__next').getAttribute('aria-label'), cap: document.getElementById('tp-lbox-caption').textContent.trim() }));
    check(`lightbox (${name}): opens at 1 / ${total}, Arabic button labels and caption`, st.count === `1 / ${total}` && st.close === 'إغلاق' && st.next === 'الصورة التالية' && /[؀-ۿ]/.test(st.cap), JSON.stringify(st));
    await pg.keyboard.press('ArrowRight');
    check(`lightbox (${name}): ArrowRight goes to previous (wraps to ${total} / ${total})`, (await pg.textContent('.tp-lbox__count')) === `${total} / ${total}`);
    await pg.keyboard.press('ArrowLeft');
    check(`lightbox (${name}): ArrowLeft goes to next (1 / ${total})`, (await pg.textContent('.tp-lbox__count')) === `1 / ${total}`);
    await pg.evaluate(() => {
      const el = document.querySelector('.tp-lbox');
      const t = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: 300 });
      el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [t(600)], changedTouches: [t(600)] }));
      el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [t(300)] }));
    });
    check(`lightbox (${name}): swipe left shows the previous image in RTL`, (await pg.textContent('.tp-lbox__count')) === `${total} / ${total}`);
    await pg.keyboard.press('Escape');
    check(`lightbox (${name}): Esc closes and returns focus to the trigger`, await pg.evaluate(() => document.querySelector('.tp-lbox').hidden && document.activeElement.tagName === 'A'));
    await pg.ctx.close();
  }
  const pg = await open('services');
  const xs = await pg.$$eval('.tp-gallery a', (a) => a.map((x) => Math.round(x.getBoundingClientRect().x)));
  check('gallery order: first image is in the right-most column (masonry flows right to left)', xs[0] === Math.max(...xs), xs.join(','));
  await pg.ctx.close();
}

// ---------------------------------------------------------------- projects filter
if (run('filter')) {
  const pg = await open('projects');
  const visible = () => pg.$$eval('.tp-filter__items [data-tp-type]:not([hidden])', (n) => n.length);
  check('filter: 22 projects rendered, "الكل" pressed', (await visible()) === 22 && (await pg.getAttribute('.tp-filter__btn[data-tp-filter="all"]', 'aria-pressed')) === 'true');
  await pg.click('.tp-filter__btn[data-tp-filter="fit-out"]');
  await pg.waitForTimeout(900);
  const st = await pg.evaluate(() => ({ n: document.querySelectorAll('.tp-filter__items [data-tp-type]:not([hidden])').length, say: document.querySelector('.tp-filter__status').textContent, url: location.search }));
  check('filter: fit-out → 5 projects, announced "عرض 5 مشاريع", ?type= written', st.n === 5 && st.say === 'عرض 5 مشاريع' && st.url === '?type=fit-out', JSON.stringify(st));
  await pg.click('.tp-filter__btn[data-tp-filter="landscaping"]');
  await pg.waitForTimeout(900);
  check('filter: landscaping → announced "عرض مشروع واحد"', (await pg.textContent('.tp-filter__status')) === 'عرض مشروع واحد');
  await pg.click('.tp-filter__btn[data-tp-filter="all"]');
  await pg.waitForTimeout(900);
  check('filter: all → "عرض 22 مشروعاً"', (await pg.textContent('.tp-filter__status')) === 'عرض 22 مشروعاً');
  const cards = await pg.$eval('.tp-filter__items .tp-card', (c) => [c.querySelector('[data-tp-field="title"]').textContent, c.querySelector('[data-tp-field="when"]').textContent]);
  check('filter: cards render Arabic titles and "قيد التنفيذ" for the ongoing project', /[؀-ۿ]/.test(cards[0]) && (await pg.$$eval('[data-tp-field="when"]', (n) => n.some((x) => x.textContent === 'قيد التنفيذ'))), cards.join(' | '));
  await pg.ctx.close();
  const p2 = await open('x', { raw: ORIGIN + 'ar/projects.html?type=fit-out' });
  check('filter: ?type=fit-out preselects the filter on load', (await p2.$$eval('.tp-filter__items [data-tp-type]:not([hidden])', (n) => n.length)) === 5);
  await p2.ctx.close();
}

// ---------------------------------------------------------------- project template
if (run('project')) {
  const pg = await open('project');
  const r = await pg.evaluate(() => ({ title: document.title, h1: document.querySelector('h1').textContent, specs: [...document.querySelectorAll('.tp-spec dt')].map((d) => d.textContent),
    gal: document.querySelectorAll('[data-tp-gallery] a').length, cover: document.querySelector('[data-tp-cover] img').getAttribute('src'),
    prev: document.querySelector('[data-tp-field="prev-title"]').textContent, rel: document.querySelectorAll('.tp-related [data-tp-type]').length,
    letter: !document.querySelector('[data-tp-letter]').hidden, note: document.querySelector('[data-tp-letter]').textContent.includes('ترجمة عن الأصل الإنجليزي'),
    sw: document.querySelector('.tp-lang__link').getAttribute('href'), imgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length }));
  check('project: Arabic title/spec labels, gallery, related, images load', /[؀-ۿ]/.test(r.h1) && r.specs.join() === 'النوع,الموقع,المدة,تاريخ الإنجاز' && r.gal >= 3 && r.rel >= 1 && r.imgs === 0 && r.cover.startsWith('../'), JSON.stringify(r));
  check('project: related testimonial carries the translation label; switcher keeps ?id=', r.letter && r.note && /id=atlas-copco-headquarters/.test(r.sw));
  await pg.ctx.close();
  const ba = await open('x', { raw: ORIGIN + 'ar/project.html?id=abu-dhabi-marina-private-gym' });
  check('project: before/after built for a project with a before image', (await ba.$$('.tp-before-after .tp-ba__handle')).length === 1);
  await ba.ctx.close();
  let ids = 0, badIds = [];
  const idsPage = await open('project');
  const all = await idsPage.evaluate(async () => (await (await fetch('../data/projects.json')).json()).projects.filter((p) => p.type !== 'showcase').map((p) => p.id));
  for (const id of all) {
    await idsPage.goto(ORIGIN + 'ar/project.html?id=' + id, { waitUntil: 'networkidle' });
    const ok = await idsPage.evaluate(() => /[؀-ۿ]/.test(document.querySelector('h1').textContent) && document.querySelectorAll('[data-tp-gallery] a').length >= 1);
    ids += ok ? 1 : 0; if (!ok) badIds.push(id);
  }
  check(`project: all ${all.length} ids render an Arabic H1 and a gallery`, ids === all.length, badIds.join(','));
  await idsPage.goto(ORIGIN + 'ar/project.html?id=nope', { waitUntil: 'networkidle' });
  const nf = await idsPage.evaluate(() => [document.querySelector('h1').textContent, document.querySelector('meta[name=robots]') && document.querySelector('meta[name=robots]').content]);
  check('project: not-found state in Arabic + noindex', nf[0] === 'المشروع غير موجود' && nf[1] === 'noindex', nf.join(' '));
  await idsPage.ctx.close();
}

// ---------------------------------------------------------------- services
if (run('services')) {
  const pg = await open('services');
  check('services: 6 chips', (await pg.$$eval('.tp-scrollspy a', (a) => a.length)) === 6);
  await pg.locator('.tp-chip', { hasText: 'التجديد' }).focus();
  await pg.keyboard.press('Enter');
  await pg.waitForTimeout(1800);
  const nav = await pg.evaluate(() => ({ cur: [...document.querySelectorAll('.tp-chip[aria-current]')].map((a) => a.textContent.trim()), hash: location.hash,
    top: document.getElementById('renovation').getBoundingClientRect().top, bar: document.querySelector('.tp-scrollspy').getBoundingClientRect().bottom }));
  check('services: chip activates, scrolls below the sticky bars, becomes current', nav.hash === '#renovation' && nav.cur.join() === 'التجديد' && nav.top >= nav.bar - 2, JSON.stringify(nav));
  await pg.evaluate(() => window.scrollTo({ top: document.getElementById('turnkey').offsetTop, behavior: 'instant' }));
  await pg.waitForTimeout(700);
  check('services: scrolling highlights the Turnkey chip', (await pg.$$eval('.tp-chip[aria-current]', (a) => a.map((x) => x.textContent.trim()))).join() === 'مشاريع تسليم المفتاح');
  const rel = await pg.evaluate(() => ({ c: document.querySelectorAll('#construction .tp-project').length, f: document.querySelectorAll('#decoration-fitout .tp-project').length, r: document.querySelectorAll('#renovation .tp-project').length }));
  check('services: related projects 3 / 3 / 3 from the Arabic data', rel.c === 3 && rel.f === 3 && rel.r === 3, JSON.stringify(rel));
  await pg.ctx.close();
}

// ---------------------------------------------------------------- contact + 404
if (run('contact')) {
  const pg = await open('contact');
  await pg.click('form.tp-form button[type=submit]');
  const r = await pg.evaluate(() => ({ summary: document.querySelector('.tp-form__status').textContent, first: document.activeElement.id,
    errs: [...document.querySelectorAll('.tp-form__error:not([hidden])')].map((e) => e.textContent) }));
  check('contact: empty submit → Arabic summary "يرجى تصحيح 3 حقول أدناه." and linked errors', r.summary === 'يرجى تصحيح 3 حقول أدناه.' && r.errs.length === 3 && r.first === 'tp-f-name', JSON.stringify(r));
  await pg.fill('#tp-f-name', 'أحمد'); await pg.fill('#tp-f-email', 'bad'); await pg.fill('#tp-f-message', 'مرحبا');
  await pg.click('form.tp-form button[type=submit]');
  check('contact: invalid email → Arabic message', (await pg.textContent('#tp-f-email-err')).startsWith('يرجى إدخال عنوان بريد إلكتروني صحيح'));
  await pg.fill('#tp-f-email', 'a@b.ae'); await pg.click('form.tp-form button[type=submit]');
  check('contact: valid submit shows the Arabic success state', await pg.evaluate(() => !document.querySelector('.tp-form__success').hidden && /شكراً لرسالتك/.test(document.querySelector('.tp-form__success').textContent)));
  const ltr = await pg.evaluate(() => [...document.querySelectorAll('a[href^="tel:"],a[href^="mailto:"]')].every((a) => getComputedStyle(a).unicodeBidi.includes('isolate') || a.closest('bdi') || a.querySelector('bdi') || a.dir === 'ltr'));
  check('contact: phone/email/WhatsApp are bidi-isolated (never reversed)', ltr);
  await pg.ctx.close();
}
if (run('notfound')) {
  const pg = await open('404');
  check('404: Arabic heading, noindex, links to home and projects, 3 featured cards', await pg.evaluate(() => /لم نعثر على هذه الصفحة/.test(document.querySelector("h1").textContent) && document.querySelector('meta[name=robots]').content.includes('noindex')
    && !!document.querySelector('main a[href="index.html"]') && !!document.querySelector('main a[href="projects.html"]') && document.querySelectorAll('[data-tp-projects] [data-tp-type]').length === 3));
  await pg.ctx.close();
}

await browser.close();
console.log(results.join('\n'));
const failed = results.filter((r) => r.startsWith('FAIL')).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
