/**
 * wp-reveal-check.mjs — scroll-triggered image wipe (tp-img-reveal) check, WordPress vs the static prototype.
 *   PW_MODULE=<playwright> node scripts/wp/wp-reveal-check.mjs <url> [widths=320,375,390,768,1024,1280,1440] [--reduce]
 * Per width: load at the top, record which wipes are already triggered (only those in the first screen may be),
 * scroll down slowly (120 px / 80 ms), record for each wipe the viewport position of its frame when it triggered and
 * that its transition is a 1.3 s clip-path, then check every wipe ends fully open, no horizontal overflow, no console
 * errors; reload half-way down and check the wipes in view open again. --reduce: everything must be open at once.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const url = args[0];
const widths = (args[1] || '320,375,390,768,1024,1280,1440').split(',').map(Number);
const reduce = process.argv.includes('--reduce');
let failures = 0;
const fail = (m) => { failures++; console.log('   FAIL ' + m); };

const browser = await chromium.launch();
for (const w of widths) {
  const vh = w < 768 ? 812 : 900;
  const ctx = await browser.newContext({ viewport: { width: w, height: vh }, ignoreHTTPSErrors: true, reducedMotion: reduce ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  // Record the frame position the moment each wipe gets is-visible.
  await page.addInitScript(() => {
    window.__tpTrig = [];
    new MutationObserver((ms) => ms.forEach((m) => {
      const el = m.target;
      if (el.classList && el.classList.contains('tp-img-reveal') && el.classList.contains('is-visible') && !el.__seen) {
        el.__seen = true;
        const r = el.parentElement.getBoundingClientRect();
        window.__tpTrig.push({ i: [...document.querySelectorAll('.tp-img-reveal')].indexOf(el), top: Math.round(r.top), vh: innerHeight, at: Math.round(performance.now()) });
      }
    })).observe(document, { attributes: true, attributeFilter: ['class'], subtree: true });
  });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(600);

  const state = () => page.evaluate(() => [...document.querySelectorAll('.tp-img-reveal')].map((e) => {
    const r = e.parentElement.getBoundingClientRect();
    const s = getComputedStyle(e);
    return { vis: e.classList.contains('is-visible'), clip: s.clipPath, dur: s.transitionDuration, prop: s.transitionProperty, delay: s.transitionDelay, docTop: Math.round(r.top + scrollY) };
  }));
  const atLoad = await state();
  // Not premature: a wipe may be triggered at load only if its frame starts inside the first screen.
  // (Reduced motion opens everything at once by design, as in the prototype.)
  if (reduce) atLoad.forEach((e, i) => { if (e.clip !== 'none' && e.clip !== 'inset(0px)') fail(`${w}px wipe ${i} masked under reduced motion (${e.clip})`); });
  else atLoad.forEach((e, i) => { if (e.vis && e.docTop > vh) fail(`${w}px wipe ${i} triggered at load although it starts ${e.docTop}px down`); });
  if (!reduce) atLoad.forEach((e, i) => { if (!/clip-path/.test(e.prop) || e.dur !== '1.3s') fail(`${w}px wipe ${i} transition is "${e.prop} ${e.dur}"`); });

  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= h; y += 120) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(80); }
  await page.waitForTimeout(2200);
  const end = await state();
  end.forEach((e, i) => { if (!e.vis || e.clip !== 'inset(0px)' && e.clip !== 'none') fail(`${w}px wipe ${i} did not finish open (${e.clip})`); });
  const trig = await page.evaluate(() => window.__tpTrig);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (overflow > 0) fail(`${w}px horizontal overflow ${overflow}px`);
  const hidden = await page.$$eval('.elementor-invisible', (e) => e.length).catch(() => 0);
  if (hidden) fail(`${w}px ${hidden} Elementor elements still hidden`);

  // Reload half-way down: the wipes in view must open again. "In view" = frame top above 75 % of the viewport: wipes
  // trigger when the frame reaches ~76–86 % (as in the prototype), so a frame only peeking in at the bottom stays closed.
  const mid = end[1] ? end[1].docTop - 200 : 2000;
  await page.evaluate((y) => window.scrollTo(0, y), mid);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const afterReload = await page.evaluate(() => [...document.querySelectorAll('.tp-img-reveal')].map((e) => {
    const r = e.parentElement.getBoundingClientRect();
    return { inView: r.top < innerHeight * 0.75 && r.bottom > 0, clip: getComputedStyle(e).clipPath };
  }));
  afterReload.forEach((e, i) => { if (e.inView && e.clip !== 'inset(0px)' && e.clip !== 'none') fail(`${w}px wipe ${i} in view after reload is not open (${e.clip})`); });
  if (errors.length) fail(`${w}px console errors: ${errors.join(' | ')}`);

  const t = trig.map((x) => `#${x.i} frame top ${x.top}/${x.vh}`).join(', ');
  console.log(`${w}px  wipes ${end.length}  delay(hero) ${atLoad[0] && atLoad[0].delay}  triggered: ${t || (reduce ? 'all at once (reduced motion)' : '-')}`);
  await ctx.close();
}
await browser.close();
console.log(failures ? `\n${failures} failure(s)` : '\nall wipe checks passed');
process.exitCode = failures ? 1 : 0;
