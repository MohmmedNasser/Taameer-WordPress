/**
 * lighthouse-run.mjs — Lighthouse (mobile, default throttling) on every page; saves JSON + HTML reports and prints scores.
 *   python -m http.server 5173
 *   PW_MODULE=<playwright path> node scripts/lighthouse-run.mjs [outDir=source/lighthouse/phase-2]
 *   PREFIX=ar/ node scripts/lighthouse-run.mjs source/lighthouse/phase-3   (the Arabic pages)
 * Lighthouse is fetched on demand with `npx -y lighthouse` (not a project dependency); Chrome is the Playwright Chromium.
 */
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
const pwPath = process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright';
const { chromium } = await import(pwPath);
const chrome = chromium.executablePath();
const out = process.argv[2] || 'source/lighthouse/phase-2';
mkdirSync(out, { recursive: true });
const BASE = process.env.BASE_URL || 'http://localhost:5173/';
const pages = ['index.html', 'about.html', 'services.html', 'projects.html', 'project.html?id=dubai-g-residential-villa', 'testimonials.html', 'contact.html', '404.html'];
const PREFIX = process.env.PREFIX || '';
const rows = [];
for (const p of pages) {
  const name = p.startsWith('project.html') ? 'project' : p.replace('.html', '');
  const base = path.join(out, name);
  const r = spawnSync('npx', ['-y', 'lighthouse', BASE + PREFIX + p, '--quiet', '--output=json', '--output=html', `--output-path=${base}`,
    `--chrome-path=${chrome}`, '--chrome-flags=--headless=new --no-sandbox', '--only-categories=performance,accessibility,best-practices,seo'],
    { encoding: 'utf-8', shell: true });
  try {
    const j = JSON.parse(readFileSync(base + '.report.json', 'utf-8'));
    const s = (k) => Math.round(j.categories[k].score * 100);
    const m = (k) => j.audits[k].displayValue;
    rows.push({ page: name, perf: s('performance'), a11y: s('accessibility'), bp: s('best-practices'), seo: s('seo'), lcp: m('largest-contentful-paint'), cls: m('cumulative-layout-shift'), tbt: m('total-blocking-time') });
    console.log(rows[rows.length - 1]);
  } catch (e) {
    console.log(name, 'FAILED', (r.stderr || '').slice(0, 300));
  }
}
console.table(rows);
