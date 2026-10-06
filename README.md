# Taameer Plus — static prototype

Bilingual (EN / AR) corporate site prototype for Taameer Plus Contracting LLC. Vanilla HTML/CSS/JS, no build step. Being rebuilt in WordPress with Astra Free + Elementor Free (Containers + native widgets) and a minimal Astra child theme (`wp-theme/taameer-astra-child/`, build scripts in `scripts/wp/`; PRD v1.8, D-038). Read `CLAUDE.md` first, then `docs/PRD.md`.

## Run locally
Some sections are rendered from `data/*.json` with `fetch()`, which browsers block on `file://`. Serve the folder:

```
npx serve .   # serve.json turns off clean URLs: they redirect and drop ?id= / ?type=
```
Then open http://localhost:3000. (VS Code Live Server also works.)

## Scripts
| Script | Purpose |
|---|---|
| `python scripts/extract_pdf.py` | PDF → text + images (`--raw`, `--export`) |
| `python scripts/fetch_site.py` | Mirror images/docs from taameer.ae (polite, skips existing) |
| `python scripts/site_to_text.py` | Site HTML → `source/site-content.md` |
| `python scripts/build_site_images.py` | Merge site + PDF images (keeps higher res, dedupes), writes `docs/image-map.md` |
| `python scripts/image_meta.py` | Refresh `imageMeta` (width/height/-md) in `data/projects.json` |
| `python scripts/contrast.py` | WCAG contrast of every token text/background pair |
| `python scripts/check-partials.py` | Header/footer/sprite/WhatsApp/CTA blocks identical on every page of each language (Arabic skeleton = English skeleton); active nav state; SEO head, canonical/hreflang; language switcher; one h1 |
| `node scripts/screenshot.mjs` | Playwright: 4 widths × LTR/RTL + reduced motion; console/network/overflow |
| `node scripts/interaction-test.mjs` | Playwright: skip link, mobile menu, before/after, breadcrumbs, lightbox (keys, swipe, focus trap; LTR/RTL), service chip nav, related projects |
| `python scripts/check-links.py` | Every internal link, anchor, `project.html?id=` and image reference resolves, in both languages; every language-switcher and hreflang/canonical target maps to a page |
| `node scripts/projects-test.mjs` | Playwright: projects filter, all 22 project ids, project template parts, not-found, testimonials lightbox, contact form validation, 404 (`ONLY=filter,ids,…` to run a block) |
| `python scripts/gen-wp-tables.py` | Regenerates the global variable / global class tables in `docs/wp-mapping.md` |
| `node scripts/lighthouse-run.mjs` | Lighthouse (mobile) on all 8 pages → `source/lighthouse/phase-2/` (`PREFIX=ar/ … source/lighthouse/phase-3` for the Arabic pages) |
| `python scripts/build_ar.py` | Generates `ar/*.html` from the English pages + `scripts/ar_text.py` / `ar_data.py` (edit those, not the generated pages); fills `data/*.json` Arabic with `python scripts/ar_data.py` |
| `node scripts/ar-test.mjs` | Playwright on the Arabic pages: overflow/console at 4 widths (+ reduced motion), no letter-spacing/uppercase/italics on Arabic text, switcher, menu, marquee, before/after, lightbox, filter, project, services, contact, 404 (`ONLY=…`) |
| `node scripts/ar-screenshots.mjs` | Full-page screenshots of the 8 Arabic pages at 4 widths → `source/screenshots/phase-3/` |
| `python scripts/gen-ar-review.py` | Writes `docs/ar-copy-review.md` (English \| Arabic per page, ⚠ for client confirmation) |

Image pipeline order: `extract_pdf.py --export` → `build_site_images.py` → `image_meta.py`.

Playwright is not a dependency. If it is not resolvable, point `PW_MODULE` at an installed copy, e.g.
`PW_MODULE=~/AppData/Local/npm-cache/_npx/<hash>/node_modules/playwright node scripts/screenshot.mjs`
(serve first: `python -m http.server 5173`).

Requires Python 3 with `pymupdf pillow`; Node 18+ with Playwright for screenshots.
