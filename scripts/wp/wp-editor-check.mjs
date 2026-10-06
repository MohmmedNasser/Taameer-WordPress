/**
 * wp-editor-check.mjs — opens a page (default: Home) in the Elementor editor, checks it loads without errors, saves it from the
 * editor (Update), then reloads the front end and checks it still renders the same elements.
 *   PW_MODULE=<playwright> node scripts/wp/wp-editor-check.mjs <access.json> [postId=208] [frontUrl=https://taameer.local/]
 *   About (WP phase 2): … <access.json> 297 https://taameer.local/about/
 * <access.json> = output of Novamira's novamira/create-admin-access-link (one-time; never printed or committed).
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const raw = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const access = raw.data || raw;
const postId = process.argv[3] || '208';
const frontUrl = process.argv[4] || 'https://taameer.local/';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
const ex = await ctx.request.fetch(access.exchange_url, {
  method: access.exchange_method || 'POST',
  headers: { [access.token_header]: access.access_token, [access.nonce_header]: access.access_nonce },
});
const exBody = await ex.json();
const loginUrl = exBody.login_url || (exBody.data && exBody.data.login_url);
if (!loginUrl) { console.log('FAIL  admin access exchange', ex.status()); process.exit(1); }

const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(loginUrl, { waitUntil: 'load' });

const front = async () => {
  const p = await ctx.newPage();
  await p.goto(frontUrl + '?nocache=' + Date.now(), { waitUntil: 'load' });
  const n = await p.$$eval('[data-elementor-id="' + postId + '"] .elementor-element', (e) => e.length);
  await p.close();
  return n;
};
const before = await front();

await page.goto(`https://taameer.local/wp-admin/post.php?post=${postId}&action=elementor`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => window.elementor && window.elementor.documents && window.elementor.documents.getCurrent && window.elementor.documents.getCurrent(), null, { timeout: 90000 });
await page.waitForTimeout(4000);
const info = await page.evaluate(() => {
  const doc = window.elementor.documents.getCurrent();
  const preview = document.getElementById('elementor-preview-iframe');
  const pdoc = preview && preview.contentDocument;
  return {
    id: doc.id,
    elements: pdoc ? pdoc.querySelectorAll('.elementor-element').length : -1,
    widgets: pdoc ? [...new Set([...pdoc.querySelectorAll('.elementor-widget')].map((w) => w.dataset.widget_type))] : [],
  };
});
console.log(`${info.elements > 100 ? 'PASS' : 'FAIL'}  editor opens and renders the page (${info.elements} elements; widgets: ${info.widgets.join(', ')})`);

// Save from the editor (same as clicking "Update"/"Publish").
const saved = await page.evaluate(async () => {
  try { await window.$e.run('document/save/update', { force: true }); return 'ok'; } catch (e) { return String(e); }
});
await page.waitForTimeout(3000);
console.log(`${saved === 'ok' ? 'PASS' : 'FAIL'}  save from the editor (${saved})`);

const after = await front();
console.log(`${after === before && after > 100 ? 'PASS' : 'FAIL'}  front end renders the same after save (${before} → ${after} elements)`);
const relevant = errors.filter((e) => !/favicon|ResizeObserver/.test(e));
console.log(`${relevant.length === 0 ? 'PASS' : 'WARN'}  editor console errors: ${relevant.length}${relevant.length ? '\n   ' + relevant.slice(0, 8).join('\n   ') : ''}`);
await browser.close();
