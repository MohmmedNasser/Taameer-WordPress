/**
 * wp-seo-check.mjs — SEO checks of the English / Arabic WordPress site (WP Phase 9, Yoast SEO free + Polylang, D-046).
 *   node scripts/wp/wp-seo-check.mjs
 * Expected titles / descriptions come from scripts/wp/seo-meta.json (generated from the static prototype by 15-seo-meta.mjs).
 * Plain HTTP (no browser):
 *   A. every page of seo-meta.json (56): 200, lang / dir, <title> and meta description = expected, "—" separator,
 *      exactly one canonical (= its own URL), exactly one hreflang en + ar pointing at the translation pair, no Yoast
 *      HTML comment, titles and descriptions unique per site
 *   B. 404 (English and Arabic): 404 status, noindex, prototype title in the page's language
 *   C. robots.txt and the Yoast sitemap: reachable, nothing public disallowed, every page of A listed
 *   D. social metadata (C2) of the 56 pages: og:title / og:description = the SEO title / description, og:url = canonical,
 *      og:locale per language, og:image = the prototype's og:image file (seo-meta.json og_image; a "-md" copy → its
 *      original, the Media Library holds only that), exactly one og:image with width / height / type equal to the real
 *      file, the image URL answers 200 as image/webp, twitter:card summary_large_image, no "Est. reading time" label
 */
import { readFileSync } from 'node:fs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const WP = 'https://taameer.local';
const META = JSON.parse(readFileSync(new URL('./seo-meta.json', import.meta.url), 'utf8'));
const BRAND = { en: 'Taameer Plus Contracting LLC', ar: 'تعمير بلس للمقاولات ش.ذ.م.م' };

let pass = 0, fail = 0;
function check(ok, label, detail = '') {
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
}
const decode = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const attr = (tag, name) => decode((new RegExp(`\\b${name}=["']([^"']*)["']`).exec(tag) || [])[1] || '');
async function get(path) {
  const r = await fetch(WP + path, { redirect: 'manual' });
  return { status: r.status, body: await r.text() };
}
function head(html) {
  const h = html.split('</head>')[0];
  const links = [...h.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);
  return {
    html: (/<html\b[^>]*>/.exec(html) || [''])[0],
    titles: [...h.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => decode(m[1])),
    descriptions: [...h.matchAll(/<meta\b[^>]*name=["']description["'][^>]*>/g)].map((m) => attr(m[0], 'content')),
    robots: [...h.matchAll(/<meta\b[^>]*name=["']robots["'][^>]*>/g)].map((m) => attr(m[0], 'content')),
    canonicals: links.filter((l) => /rel=["']canonical["']/.test(l)).map((l) => attr(l, 'href')),
    hreflang: links.filter((l) => /hreflang=/.test(l)).map((l) => [attr(l, 'hreflang'), attr(l, 'href')]),
    yoastComment: /optimized with the Yoast SEO plugin/.test(html),
    og: [...h.matchAll(/<meta\b[^>]*property=["'](og:[^"']+)["'][^>]*>/g)].map((m) => [m[1], attr(m[0], 'content')]),
    twitter: [...h.matchAll(/<meta\b[^>]*name=["'](twitter:[^"']+)["'][^>]*>/g)].map((m) => [m[1], attr(m[0], 'content')]),
  };
}

// A. pages
const twin = (p) => (p.startsWith('/ar/') ? p.slice(3) : '/ar' + p);
for (const m of META) {
  const { status, body } = await get(m.path);
  const h = head(body);
  const url = WP + m.path;
  const langOk = m.lang === 'ar' ? /lang="ar"/.test(h.html) && /dir="rtl"/.test(h.html) : /lang="en-US"/.test(h.html) && !/dir="rtl"/.test(h.html);
  const pair = { [m.lang]: url, [m.lang === 'en' ? 'ar' : 'en']: WP + twin(m.path) };
  const hrefOk = h.hreflang.length === 2 && h.hreflang.every(([l, href]) => pair[l] === href) && new Set(h.hreflang.map((x) => x[0])).size === 2;
  const problems = [
    status !== 200 && `status ${status}`,
    !langOk && `html ${h.html}`,
    (h.titles.length !== 1 || h.titles[0] !== m.title) && `title ${JSON.stringify(h.titles)}`,
    !h.titles[0]?.includes(' — ') && 'separator',
    (h.descriptions.length !== 1 || h.descriptions[0] !== m.description) && `description ${JSON.stringify(h.descriptions).slice(0, 120)}`,
    (h.canonicals.length !== 1 || h.canonicals[0] !== url) && `canonical ${JSON.stringify(h.canonicals)}`,
    !hrefOk && `hreflang ${JSON.stringify(h.hreflang)}`,
    h.robots.some((r) => /noindex/.test(r)) && 'noindex',
    h.yoastComment && 'Yoast comment',
  ].filter(Boolean);
  check(!problems.length, `${m.path} title, description, canonical, hreflang, ${m.lang}`, problems.join('; '));
}
for (const lang of ['en', 'ar']) {
  const own = META.filter((m) => m.lang === lang);
  check(own.length === 28, `${lang}: 28 pages`, String(own.length));
  check(new Set(own.map((m) => m.title)).size === own.length, `${lang}: titles unique`);
  check(new Set(own.map((m) => m.description)).size === own.length, `${lang}: descriptions unique`);
}

// B. 404
for (const [path, lang, title] of [['/no-such-page-seo/', 'en', 'Page not found'], ['/ar/no-such-page-seo/', 'ar', 'الصفحة غير موجودة']]) {
  const { status, body } = await get(path);
  const h = head(body);
  check(status === 404, `${path} status 404`, String(status));
  check(h.robots.length === 1 && /noindex/.test(h.robots[0]), `${path} noindex`, JSON.stringify(h.robots));
  check(h.titles.length === 1 && h.titles[0] === `${title} — ${BRAND[lang]}`, `${path} title (${lang})`, JSON.stringify(h.titles));
  check(h.canonicals.length === 0, `${path} no canonical`);
}

// C. robots.txt + sitemap
const robots = await get('/robots.txt');
check(robots.status === 200, 'robots.txt 200');
check(/Sitemap: https:\/\/taameer\.local\/sitemap_index\.xml/.test(robots.body), 'robots.txt lists the Yoast sitemap');
check(!/^Disallow:\s*\/\S*/m.test(robots.body), 'robots.txt disallows nothing', robots.body.match(/^Disallow:.*$/gm)?.join(' | '));
const index = await get('/sitemap_index.xml');
check(index.status === 200, 'sitemap_index.xml 200');
const children = [...index.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]);
const listed = new Set();
for (const c of children) {
  const s = await get(c.replace(WP, ''));
  check(s.status === 200, `${c.replace(WP, '')} 200`);
  [...s.body.matchAll(/<loc>([^<]+)<\/loc>/g)].forEach((x) => listed.add(x[1]));
}
const missing = META.filter((m) => !listed.has(WP + m.path)).map((m) => m.path);
check(!missing.length, 'every page (56) is in the sitemap', missing.join(', '));

// D. social metadata
function webpSize(buf) {
  const tag = buf.toString('ascii', 12, 16);
  if (tag === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  if (tag === 'VP8L') { const b = buf.readUInt32LE(21); return [1 + (b & 0x3fff), 1 + ((b >> 14) & 0x3fff)]; }
  if (tag === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  return [0, 0];
}
const LOCALE = { en: 'en_US', ar: 'ar_AR' };
const images = {};
for (const m of META) {
  const { body } = await get(m.path);
  const h = head(body);
  const og = Object.fromEntries(h.og.filter(([k]) => k !== 'og:locale:alternate'));
  const ogImages = h.og.filter(([k]) => k === 'og:image').map(([, v]) => v);
  const tw = Object.fromEntries(h.twitter);
  const file = m.og_image.replace(/-md\.webp$/, '.webp');
  const problems = [
    og['og:title'] !== m.title && `og:title ${og['og:title']}`,
    og['og:description'] !== m.description && 'og:description',
    og['og:url'] !== WP + m.path && `og:url ${og['og:url']}`,
    og['og:locale'] !== LOCALE[m.lang] && `og:locale ${og['og:locale']}`,
    og['og:site_name'] !== BRAND[m.lang] && `og:site_name ${og['og:site_name']}`,
    (ogImages.length !== 1 || ogImages[0] !== `${WP}/wp-content/uploads/2026/10/${file}`) && `og:image ${JSON.stringify(ogImages)}`,
    og['og:image:type'] !== 'image/webp' && `og:image:type ${og['og:image:type']}`,
    tw['twitter:card'] !== 'summary_large_image' && `twitter:card ${tw['twitter:card']}`,
    Object.keys(tw).some((k) => /^twitter:(label|data)/.test(k)) && `twitter label ${JSON.stringify(tw)}`,
  ].filter(Boolean);
  if (ogImages[0]) {
    if (!images[ogImages[0]]) {
      const r = await fetch(ogImages[0]);
      const buf = Buffer.from(await r.arrayBuffer());
      images[ogImages[0]] = { status: r.status, type: r.headers.get('content-type'), size: webpSize(buf) };
    }
    const img = images[ogImages[0]];
    if (img.status !== 200 || img.type !== 'image/webp') problems.push(`image ${img.status} ${img.type}`);
    if (+og['og:image:width'] !== img.size[0] || +og['og:image:height'] !== img.size[1]) problems.push(`image size ${og['og:image:width']}x${og['og:image:height']} vs file ${img.size.join('x')}`);
  }
  check(!problems.length, `${m.path} social: ${file} ${og['og:image:width']}x${og['og:image:height']}`, problems.join('; '));
}
for (const [url, img] of Object.entries(images)) {
  if (img.size[0] < 1200 || img.size[1] < 630) console.log(`NOTE  ${url.split('/').pop()} ${img.size.join('x')}: below the 1200 x 630 social-card recommendation`);
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
