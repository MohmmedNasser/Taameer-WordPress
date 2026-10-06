/** ar-screenshots.mjs — full-page screenshots of the 8 Arabic pages at 375/768/1280/1920 into source/screenshots/phase-3/ar-<page>-<w>.png */
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const pwPath = process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright';
const { chromium } = await import(pwPath);
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173/';
const out = 'source/screenshots/phase-3';
mkdirSync(out, { recursive: true });
const PAGES = { index: 'index.html', about: 'about.html', services: 'services.html', projects: 'projects.html', project: 'project.html?id=atlas-copco-headquarters', testimonials: 'testimonials.html', contact: 'contact.html', '404': '404.html' };
const b = await chromium.launch();
for (const [name, file] of Object.entries(PAGES)) {
  for (const w of [375, 768, 1280, 1920]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(ORIGIN + 'ar/' + file, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { document.querySelectorAll('.tp-reveal,.tp-stagger,.tp-img-reveal,.tp-split,.tp-counter').forEach((e) => e.classList.add('is-visible')); window.scrollTo(0, document.body.scrollHeight); await new Promise((r) => setTimeout(r, 400)); window.scrollTo(0, 0); await document.fonts.ready; });
    await p.waitForTimeout(1300);
    await p.screenshot({ path: `${out}/ar-${name}-${w}.png`, fullPage: true });
    await p.close();
  }
}
await b.close();
console.log('done');
