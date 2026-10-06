/**
 * wp-shots.mjs — screenshots + console errors + horizontal overflow for the WordPress build (WP phase 1).
 *
 *   PW_MODULE=<path to playwright> node scripts/wp/wp-shots.mjs <url> <outDir> [label] [widths] [--full] [--reduce]
 *   e.g. node scripts/wp/wp-shots.mjs https://taameer.local/ source/screenshots/wp-1 wp 320,375,390,768,1024,1280,1440 --full
 *
 * The static prototype can be shot the same way for comparison (python -m http.server 5173 → http://localhost:5173/).
 * Scrolls through the page first so entrance animations and lazy images have run, then captures.
 * Accepts LocalWP's self-signed certificate.
 */
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const pw = process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright';
const { chromium } = await import(pw);

const [url, outDir = 'shots', label = 'page', widthArg = '375,768,1280,1440'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const full = process.argv.includes('--full');
const reduce = process.argv.includes('--reduce');
const widths = widthArg.split(',').map(Number);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
let problems = 0;
for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: w < 768 ? 812 : 900 },
    ignoreHTTPSErrors: true,
    reducedMotion: reduce ? 'reduce' : 'no-preference',
  });
  const tab = await ctx.newPage();
  const errors = [];
  tab.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  tab.on('pageerror', (e) => errors.push(String(e)));
  tab.on('requestfailed', (r) => errors.push('request failed: ' + r.url()));
  tab.on('response', (r) => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  await tab.goto(url, { waitUntil: 'load', timeout: 60000 });
  await tab.waitForTimeout(1500);
  // Walk down the page so IntersectionObserver effects and lazy images run, then back to the top.
  const h = await tab.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 400) { await tab.evaluate((yy) => window.scrollTo(0, yy), y); await tab.waitForTimeout(120); }
  await tab.waitForTimeout(1500);
  await tab.evaluate(() => window.scrollTo(0, 0));
  await tab.waitForTimeout(600);
  const overflow = await tab.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const file = path.join(outDir, `${label}-${w}${reduce ? '-reduced' : ''}.png`);
  await tab.screenshot({ path: file, fullPage: full });
  const bad = errors.length || overflow > 0;
  if (bad) problems++;
  console.log(`${w}px ${bad ? 'PROBLEM' : 'ok'} overflow=${overflow}px errors=${errors.length} → ${file}`);
  errors.forEach((e) => console.log('   ' + e));
  await ctx.close();
}
await browser.close();
process.exitCode = problems ? 1 : 0;
