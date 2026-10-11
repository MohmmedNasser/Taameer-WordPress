/**
 * 15-seo-meta.mjs — generates scripts/wp/seo-meta.json (WP Phase 9, C1): the SEO title and meta description of every
 * published English / Arabic page, taken from the static prototype's <head> (the visual and content source of truth).
 *   PW_MODULE=<playwright> node scripts/wp/15-seo-meta.mjs
 * Needs the static prototype on http://localhost:5173 (python -m http.server 5173). The WordPress page list comes from the
 * Yoast page sitemap (Sample Page is skipped: starter content, no prototype twin). Project pages are read after the
 * prototype's project-page.js has written document.title and the description from projects.json, so the project rule
 * (own description, otherwise "{title} … {type} in {location} … {when}") is the prototype's own, in both languages.
 * Titles are stored as Yoast variables where they follow the prototype pattern, so the brand / separator stay editable:
 *   "<page> — <brand>"   → "<page> %%sep%% %%sitename%%"
 *   "<brand> — <tagline>" → "%%sitename%% %%sep%% %%sitedesc%%"   (Home)
 * Projects whose prototype title is shared with another project get ", <location>" (projects.json) to stay unique.
 * Descriptions are kept as written in the prototype, also when longer than ~160 characters (search engines truncate).
 * og_image (C2): file name of the prototype page's og:image (project pages: the cover project-page.js sets from projects.json).
 * 15-seo.php writes the titles / descriptions into Yoast's per-page fields, 15-seo-social.php the social image.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const WP = 'https://taameer.local';
const STATIC = 'http://localhost:5173';
const BRAND = { en: 'Taameer Plus Contracting LLC', ar: 'تعمير بلس للمقاولات ش.ذ.م.م' };
const TAGLINE = { en: 'Construction, Fit-out & Renovation in Dubai', ar: 'إنشاءات وتشطيبات داخلية وتجديد في دبي' };
const SEP = ' — ';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const sitemap = await (await fetch(`${WP}/page-sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(WP, '')).filter((u) => u !== '/sample-page/');

function prototypeUrl(wpPath) {
  const ar = wpPath.startsWith('/ar/');
  const rest = ar ? wpPath.slice(3) : wpPath;
  const project = /^\/projects\/([^/]+)\/$/.exec(rest);
  const file = rest === '/' ? 'index.html' : project ? `project.html?id=${project[1]}` : `${rest.replace(/\//g, '')}.html`;
  return `${STATIC}/${ar ? 'ar/' : ''}${file}`;
}

function toTemplate(title, lang) {
  if (title === BRAND[lang] + SEP + TAGLINE[lang]) return '%%sitename%% %%sep%% %%sitedesc%%';
  if (title.endsWith(SEP + BRAND[lang])) return title.slice(0, -(SEP + BRAND[lang]).length) + ' %%sep%% %%sitename%%';
  throw new Error(`unexpected title pattern: ${title}`);
}

const browser = await chromium.launch();
const page = await browser.newPage();
const out = [];
for (const wpPath of urls) {
  const lang = wpPath.startsWith('/ar/') ? 'ar' : 'en';
  const src = prototypeUrl(wpPath);
  await page.goto(src, { waitUntil: 'networkidle' });
  const head = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || '',
    notFound: !!document.querySelector('meta[name="robots"][content*="noindex"]'),
    ogImage: (document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '').split('/').pop(),
  }));
  if (!head.ogImage) throw new Error(`prototype has no og:image: ${src}`);
  if (head.notFound) throw new Error(`prototype shows not-found for ${src}`);
  out.push({ path: wpPath, lang, source: src.replace(STATIC + '/', ''), title: head.title, yoast_title: toTemplate(head.title, lang), description: head.description, og_image: head.ogImage });
}
await browser.close();

// Titles must be unique, but some projects share their name (prototype titles are identical, e.g. the two "Proposed G+1
// Residential Villas"). Only those get the project's location from projects.json, as the page's spec block shows it.
const projects = JSON.parse(readFileSync(new URL('../../data/projects.json', import.meta.url), 'utf8'));
const byId = Object.fromEntries((projects.projects || projects).map((p) => [p.id, p]));
const count = {};
out.forEach((m) => { count[m.title] = (count[m.title] || 0) + 1; });
for (const m of out.filter((x) => count[x.title] > 1)) {
  const slug = /\/projects\/([^/]+)\/$/.exec(m.path)?.[1];
  if (!slug) throw new Error(`duplicate title outside project pages: ${m.title}`);
  const name = m.title.slice(0, -(SEP + BRAND[m.lang]).length);
  const named = name + (m.lang === 'ar' ? '، ' : ', ') + byId[slug].location[m.lang];
  m.title = named + SEP + BRAND[m.lang];
  m.yoast_title = named + ' %%sep%% %%sitename%%';
}

const file = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), 'seo-meta.json');
writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
const short = out.filter((m) => m.description.length < 60).map((m) => m.path);
console.log(`${out.length} pages (${out.filter((m) => m.lang === 'en').length} en, ${out.filter((m) => m.lang === 'ar').length} ar) → ${file}`);
console.log(`descriptions < 60 chars: ${short.length ? short.join(', ') : 'none'}`);
console.log(`duplicate titles: ${out.length - new Set(out.map((m) => m.title)).size}, duplicate descriptions: ${out.length - new Set(out.map((m) => m.description)).size}`);
