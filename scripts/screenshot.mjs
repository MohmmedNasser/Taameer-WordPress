/**
 * screenshot.mjs — Playwright QA pass: full-page screenshots + console errors + horizontal overflow.
 *
 *   python -m http.server 5173          (or: npx serve . -l 5173)
 *   node scripts/screenshot.mjs [page=index.html] [outDir=source/screenshots/phase-1]
 *
 * Runs 375 / 768 / 1280 / 1920 px in LTR, the 375 and 1280 with dir="rtl" injected before any script
 * runs (the file itself is never modified), and one 1280px pass with prefers-reduced-motion.
 * Playwright is not a project dependency: set PW_MODULE to a playwright package path if it is not
 * resolvable (e.g. the npx cache), otherwise `npm i -D playwright` locally.
 */
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const pwPath = process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright';
const { chromium } = await import(pwPath);

const BASE = process.env.BASE_URL || 'http://localhost:5173/';
const page = process.argv[2] || 'index.html';
const outDir = process.argv[3] || 'source/screenshots/phase-1';
const WIDTHS = [375, 768, 1280, 1920];
mkdirSync(outDir, { recursive: true });

const runs = [
  ...WIDTHS.map((w) => ({ w, dir: 'ltr', motion: 'no-preference' })),
  ...[375, 1280].map((w) => ({ w, dir: 'rtl', motion: 'no-preference' })),
  { w: 1280, dir: 'ltr', motion: 'reduce' },
];

const browser = await chromium.launch();
let problems = 0;

for (const run of runs) {
  const ctx = await browser.newContext({
    viewport: { width: run.w, height: run.w < 768 ? 812 : 900 },
    reducedMotion: run.motion,
  });
  const tab = await ctx.newPage();
  const errors = [];
  tab.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
  tab.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  tab.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()}`));
  tab.on('response', (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });
  if (run.dir === 'rtl') {
    // Init scripts run before <html> exists: set dir the moment the element is parsed.
    await tab.addInitScript(() => {
      new MutationObserver((_, obs) => {
        if (document.documentElement) {
          document.documentElement.setAttribute('dir', 'rtl');
          obs.disconnect();
        }
      }).observe(document, { childList: true });
    });
  }

  await tab.goto(BASE + page, { waitUntil: 'networkidle' });
  // Scroll through so every reveal / lazy image / counter fires, then return to top.
  await tab.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 1500));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });

  const overflow = await tab.evaluate(() => {
    const doc = document.documentElement;
    const offenders = [];
    if (doc.scrollWidth > doc.clientWidth) {
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if ((r.right > doc.clientWidth + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' && !el.closest('.tp-marquee')) {
          offenders.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
        }
      });
    }
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, offenders: offenders.slice(0, 8) };
  });

  const name = `${path.basename(page.split('?')[0], '.html')}${page.includes('?') ? '-' + page.split('=').pop() : ''}-${run.w}-${run.dir}${run.motion === 'reduce' ? '-reduced' : ''}.png`;
  await tab.screenshot({ path: path.join(outDir, name), fullPage: true });

  const hasOverflow = overflow.scrollWidth > overflow.clientWidth;
  problems += errors.length + (hasOverflow ? 1 : 0);
  console.log(`${name}: ${errors.length} console/network issue(s), overflow ${hasOverflow ? 'YES ' + JSON.stringify(overflow) : 'no'}`);
  errors.forEach((e) => console.log('   ' + e));
  await ctx.close();
}

await browser.close();
console.log(problems ? `\n${problems} problem(s)` : '\nAll clean.');
process.exitCode = problems ? 1 : 0;
