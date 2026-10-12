# Taameer Plus — Corporate Website

Bilingual (English / Arabic RTL) corporate website for **Taameer Plus Contracting LLC**, a Dubai contractor.

**Live site:** https://taameer.ifree.page

## Overview
The project has two parts:

1. **Static prototype** (complete): vanilla HTML/CSS/JS, no frameworks or build step. It is the visual and structural source of truth.
2. **WordPress build**: Astra Free + Elementor Free (v3 Containers and native widgets) + a minimal Astra child theme. Every page stays editable in Elementor.

Content comes from the client's company profile PDF and the current site taameer.ae. Read `CLAUDE.md` first, then `docs/PRD.md`.

## WordPress status
| Phase | Status |
|---|---|
| Home, About, Services | Done |
| Projects listing + 22 project pages | Done |
| Testimonials, Contact (WPForms Lite), 404 | Done |
| Arabic site (Polylang Free, `/ar/`, 28 pages) | Done |
| SEO (Yoast SEO Free: titles, descriptions, social, `GeneralContractor` schema) | In progress |
| Final cleanup and handover | Started |

## Tech stack
- **Theme:** Astra Free + child theme `wp-theme/taameer-astra-child/` (CSS/JS for effects Elementor Free cannot do: sticky header, frame marks, split headline, image wipe, parallax, marquee, before/after)
- **Builder:** Elementor Free (no Pro features)
- **Plugins:** Polylang Free, WPForms Lite, Yoast SEO Free
- **Fonts:** Playfair Display + Inter (EN), El Messiri + IBM Plex Sans Arabic (AR)
- **Tooling:** LocalWP (`https://taameer.local`), Novamira CLI, Playwright checks

## Project structure
```
index.html, *.html, ar/   Static prototype (EN + generated AR)
assets/                   CSS, JS, images, company profile PDF
data/                     projects, team, testimonials, site JSON
wp-theme/                 Astra child theme
scripts/                  Content/image pipeline and prototype QA
scripts/wp/               WordPress build scripts (01–16) and browser checks (wp-*-check.mjs)
docs/                     PRD, decisions, progress log, WordPress mapping, image map
source/                   Extracted source content and screenshots
```

## Run the prototype locally
Some sections load `data/*.json` with `fetch()`, so serve the folder:
```
npx serve .                  # http://localhost:3000
python -m http.server 5173   # used by the WordPress comparison checks
```

## Rebuild WordPress
Run the build scripts in order through Novamira:
```
NODE_OPTIONS=--use-system-ca novamira --site taameer.local run novamira/execute-php --input @file.json --yes
```
`01`–`13` build the English site, `python scripts/wp/14-arabic.py` the Arabic site, and `node scripts/wp/15-seo-run.mjs <script>` applies SEO (dry run by default, `--write` to apply). Details are in `CLAUDE.md` → *Current state*.

## Checks
- Prototype: `python scripts/check-partials.py`, `python scripts/check-links.py`, `python scripts/contrast.py`, `node scripts/interaction-test.mjs`
- WordPress: `node scripts/wp/wp-<page>-check.mjs` (one per page), `wp-ar-check.mjs`, `wp-seo-check.mjs`, `wp-editor-check.mjs`

Requires Python 3 (`pymupdf`, `pillow`) and Node 18+ with Playwright.
