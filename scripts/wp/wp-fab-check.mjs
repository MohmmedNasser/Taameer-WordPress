/**
 * wp-fab-check.mjs — the two floating controls (WhatsApp .tp-fab, Astra #ast-scroll-top) at every width.
 *   PW_MODULE=<playwright> node scripts/wp/wp-fab-check.mjs [urls=https://taameer.local/,https://taameer.local/about/]
 * Per width (320…1440), mid-page and at the very bottom: both fully inside the viewport, no overlap, each one is the
 * topmost element at its own centre (clickable), scroll-to-top covers no footer text (the WhatsApp button covering
 * "عربي" at the very bottom on desktop is reported only: the prototype does the same); a real click on WhatsApp hits its wa.me link
 * (navigation blocked), a real click on scroll-to-top returns to the top; no horizontal overflow, no console errors.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const urls = (process.argv[2] || 'https://taameer.local/,https://taameer.local/about/').split(',');
const widths = [320, 375, 390, 768, 1024, 1280, 1440];
let failed = 0;

const state = () => {
  const box = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
  const fab = box('.tp-fab'), top = box('#ast-scroll-top');
  const inView = (x) => x.l >= 0 && x.t >= 0 && x.r <= innerWidth && x.b <= innerHeight;
  const hit = (x, s) => { const e = document.elementFromPoint((x.l + x.r) / 2, (x.t + x.b) / 2); return !!(e && e.closest(s)); };
  const overlap = !(fab.r <= top.l || top.r <= fab.l || fab.b <= top.t || top.b <= fab.t);
  // Footer text under either button (text nodes whose box intersects a button).
  const covered = [];
  const walker = document.createTreeWalker(document.querySelector('#colophon'), NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) {
    if (!n.textContent.trim() || n.parentElement.closest('.tp-fab')) continue;
    const range = document.createRange(); range.selectNodeContents(n);
    for (const r of range.getClientRects()) for (const [name, x] of [['whatsapp', fab], ['scroll-top', top]]) if (r.right > x.l && r.left < x.r && r.bottom > x.t && r.top < x.b) covered.push(`${name}: ${n.textContent.trim().slice(0, 30)}`);
  }
  return { fabIn: inView(fab), topIn: inView(top), overlap, fabHit: hit(fab, '.tp-fab'), topHit: hit(top, '#ast-scroll-top'),
    gap: Math.round(fab.t - top.b), covered: [...new Set(covered)], overflow: document.documentElement.scrollWidth - innerWidth };
};

const browser = await chromium.launch();
for (const url of urls) {
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 812 : 900 }, ignoreHTTPSErrors: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    let waHit = null;
    await ctx.route(/wa\.me/, (r) => { waHit = r.request().url(); r.abort(); }); // the link opens a new tab: intercept on the context
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.evaluate(() => scrollTo({ top: 2500, behavior: 'instant' }));
    await page.waitForTimeout(1200);
    const mid = await page.evaluate(state);
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(1200);
    const end = await page.evaluate(state);
    // Real clicks: WhatsApp first (navigation is intercepted), then scroll-to-top.
    const fabBox = await page.locator('.tp-fab').boundingBox();
    await page.mouse.click(fabBox.x + fabBox.width / 2, fabBox.y + fabBox.height / 2);
    await page.waitForTimeout(800);
    const topBox = await page.locator('#ast-scroll-top').boundingBox();
    await page.mouse.click(topBox.x + topBox.width / 2, topBox.y + topBox.height / 2);
    await page.waitForTimeout(2500);
    const y = await page.evaluate(() => scrollY);
    const ok = [mid, end].every((s) => s.fabIn && s.topIn && !s.overlap && s.fabHit && s.topHit && !s.covered.some((c) => c.startsWith('scroll-top')) && s.overflow <= 0)
      && !!waHit && y < 5 && errors.length === 0;
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${url.replace('https://taameer.local', '') || '/'} ${w}px  gap=${mid.gap}px  whatsapp-click=${waHit ? 'wa.me' : 'none'}  scroll-to-top→${y}  ` +
      `mid=${JSON.stringify(mid)} end=${JSON.stringify(end)} errors=${errors.length}`);
    await ctx.close();
  }
}
await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exitCode = failed ? 1 : 0;
