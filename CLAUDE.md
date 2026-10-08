# CLAUDE.md — Taameer Plus: static prototype + WordPress build

> **What to build lives in [docs/PRD.md](docs/PRD.md) (source of truth). This file covers *how*.** Do not copy PRD content here; if this file and the PRD disagree, stop and ask.

## Project summary
A static HTML/CSS/JS prototype of the bilingual (EN default / AR RTL) corporate site for **Taameer Plus Contracting LLC** (Dubai contractor). Content comes from two client-approved sources: the PDF company profile (`source/pdf-text.md`) and the current site taameer.ae (`source/site-content.md`), which is newer and **wins on facts and wording**; the PDF supplies everything the site lacks. The prototype is the **visual and structural source of truth** and is now being rebuilt in WordPress as an editable Elementor site: **Astra Free + Elementor Free (v3 Containers + native widgets) + a minimal Astra child theme** on LocalWP (`https://taameer.local`), driven through the **Novamira CLI** (see *WordPress build* below, D-038). The static project stays untouched during the migration unless a task explicitly requires changing it.

## Working rules (every session)
1. **No sub-agents.** Never spawn Task/Agent tools or parallel agents. Work sequentially in the main session.
2. **Save tokens.** Never re-read the PDF or re-download the site. Content comes from `source/pdf-text.md` + `source/site-content.md`; image facts from `docs/image-map.md`. Read only the line ranges you need of large files.
3. **Document as you go.** After *each* task: append to `docs/progress-log.md` (newest on top), add non-obvious choices to `docs/decisions.md`, add new sections to `docs/wp-mapping.md`, and update **Current state** below.
4. **Use all content from both sources.** Every image and datum in the PDF and on taameer.ae is client-approved. Same image in both → keep the higher resolution. Never invent services, projects, clients, numbers or claims.
5. **Stock only for gaps** (Unsplash → Pexels → Pixabay), downloaded locally, logged in `docs/image-credits.md`. Never hotlink. Never replace a usable client image.
6. **Text corrections** fix spelling/grammar/formatting only, never facts. The full list lives in [docs/content-corrections.md](docs/content-corrections.md); apply it everywhere and log new ones there.

## Technical rules (non-negotiable; static prototype)
These govern the prototype files. The prototype is frozen during the WordPress migration; the WordPress rules are in *WordPress build* below.
1. **No frameworks, libraries or build step.** Vanilla HTML/CSS/JS. No Tailwind, jQuery, GSAP, Swiper, or npm runtime deps.
2. **Plain `defer` scripts, not ES modules.** Each JS file is a standalone IIFE, enqueueable with `wp_enqueue_script`. The only global is `window.TP`.
3. **CSS logical properties only** (`margin-inline-start`, `inset-inline-end`, `text-align: start`…). Never `left`/`right` for layout. Unavoidable direction rules go in a marked `[dir="rtl"]` block.
4. **BEM with `tp-` prefix**: `tp-hero`, `tp-hero__title`, `tp-card--featured`.
5. **Elementor structure**: `<section class="tp-section …"> → <div class="tp-container"> → blocks`. Layouts must be buildable with Flexbox Containers. CSS Grid is prototype-only: the WordPress build uses Elementor Containers and native widgets (see WordPress build).
6. **Annotate every section** (historical: these annotations were written for the superseded Atomic plan; keep them as they are, the live WordPress mapping is `docs/wp-mapping.md` → Implemented/Planned): `<!-- ATOMIC: Flexbox > Heading(.tp-h2) + Paragraph(.tp-lead) + Button(.tp-btn) -->` (element tree + global classes), `<!-- THEME: header.php | footer.php | archive-project.php | single-project.php | 404.php -->`, `<!-- INTERACTION: tp-lightbox (interactions.js) -->` next to either, and `<!-- REPORT: … -->` for anything atomic elements cannot express that E1–E3 do not cover (collected for the owner). Every section maps to exactly one destination (Atomic / Theme / Interaction / Report) in `docs/wp-mapping.md`.
7. **All design values are tokens**, all in `assets/css/tokens.css` (primitive/semantic brand values, then shared scales, then the component layer). No hard-coded colors/fonts/spacing/radii/shadows/durations in component CSS. One brand only: the taameer.ae identity on a light layout (`docs/brand.md`). The earlier warm-bronze design is recoverable via git tag `v1-bronze`; there is no brand switcher and no `data-brand` attribute.
8. **Animation is class-driven** (below). No JS that targets elements by ID for animation.
9. **Accessibility**: landmarks, one `<h1>` per page, visible focus, alt on every image, keyboard-operable widgets, WCAG AA contrast, full `prefers-reduced-motion`.
10. **Performance**: `width`/`height` on every `<img>`, `loading="lazy"` below the fold, `srcset` with `-md` variant, `fetchpriority="high"` on the hero image.
11. **Relative paths only.**
12. JSON-rendered data needs a local server: `npx serve .` (see README).
13. Every CSS/JS file starts with a header comment: purpose, components using it, WP notes. Source styles (`tokens`, `base`, `layout`, `components`, `inner-pages`) begin with `/* ELEMENTOR SOURCE — recreated as global variables/classes, not shipped */`; JS that renders JSON on atomic pages or validates a form begins with `/* PROTOTYPE ONLY */`. JS-rendered components clone a `<template>` that holds the markup (so PHP can copy it).
13a. **Header** is solid and sticky on every page (not transparent, no overlay, no hero top-padding compensation). **Direction-neutral classes**: physical values live only in `[dir="rtl"]` rules paired with `-rtl` suffixed classes (list in `docs/wp-mapping.md`). Behaviours activate by class only (`tp-lightbox`, `tp-before-after`, `tp-scrollspy`, `tp-filter`).
14. **Partials.** Every page carries the sprite, header (with skip link), footer, WhatsApp button and CTA band literally, wrapped in `<!-- PARTIAL:name START/END -->` (they become `header.php`/`footer.php`). Run `python scripts/check-partials.py` after every page; only the active nav state (`aria-current="page"`, header nav + mobile menu + footer quick links) and the language-switcher target may differ. Copy the blocks from index.html.
15. **Per-page SEO head** (copy from about.html): unique `<title>` (page — brand) and meta description (>= 60 chars), Open Graph (`og:type`, `og:site_name`, `og:locale`, `og:title`, `og:description`, `og:image`) + `twitter:card`, and a *commented* canonical/hreflang block with the final URLs (filled in Phase 3 / WordPress; never a live link before then). Inner pages load `inner-pages.css`; pages with galleries/licenses/letters also `lightbox.css` + `lightbox.js` (triggers: `<a data-tp-lightbox="group" href="full.webp" data-caption="…">`).

## Design tokens (summary — see `assets/css/tokens.css`)
- Light, architectural, restrained. **No dark mode, no dark sections** (footer too). Ink = text, lines and button fills.
- Colors (monochrome ink/grey/white): `--tp-color-bg #FFF`, `-surface #FFF`, `-sand #F4F4F4`, `-stone #D9D9D9`, `-accent #0D0D0D` (ink: marks, hairlines, button fills), `-accent-text #262626`, `-secondary #595959`, `-text #0D0D0D`, `-text-muted #595959`. Contrast: `python scripts/contrast.py` (0 failing), `docs/decisions.md`.
- Fonts: EN display **Playfair Display** (400–600, weight token 500), EN body **Inter** (400–600); AR display **Noto Kufi Arabic**, AR body **IBM Plex Sans Arabic** (tokens only until Phase 3).
- Fluid type via `clamp()`; radii 2–10px; neutral soft shadows; "+" logo motif for markers, bullets, separators and hover cues.
- Signature: ink "+" setting-out marks on framed images (`.tp-frame`), drawing title-block facts (`.tp-spec`). Tokens have 3 layers (primitive → semantic → component); `validate-tokens.cjs` from the design-system skill must report 0 violations.

## WordPress build (approved architecture; PRD 8.2, D-038 — supersedes D-030 and the Atomic plan)
- **Theme: Astra Free** (site foundation, Header/Footer Builder, navigation, mobile menu, basic settings). Astra Pro is not installed: never assume it.
- **Builder: Elementor Free, v3 architecture**: Containers, nested Containers, native widgets, Global Colors/Fonts (Site Settings), responsive controls, native entrance animations where equivalent. **Do not use Atomic Elements / the v4 Atomic Editor. Do not assume Elementor Pro** (no Theme Builder, Pro Form, Loop Grid, Portfolio, per-widget Custom CSS, Custom Attributes, Pro motion effects; see PRD 8.2.1).
- **Native first.** Never a page made of one HTML widget holding the static HTML, never pasted prototype CSS/JS, never Elementor pages converted into PHP templates. Pages → Edit with Elementor must let the client edit text, images, buttons, sections, Containers, layout and responsive settings.
- **Minimal Astra child theme** `wp-theme/taameer-astra-child/` (junction into the site's themes folder): `assets/css/taameer.css`, `assets/js/taameer.js`, `functions.php` (enqueue, `html.tp-js`, Astra breakpoints 1023/767, `[tp_template id]`). Only for what Elementor Free cannot do (sticky header, frame marks, split headline, image wipe, parallax, marquee, before/after, small enhancements). **Not a custom theme, no page layouts or content in PHP.** Effects attach through CSS classes in Elementor (Advanced → CSS Classes), never through `.elementor-element-xxxx` IDs.
- **Static HTML/CSS/JS is the visual source of truth**: compare against it (`scripts/wp/wp-shots.mjs`, static site via `python -m http.server 5173`). Breakpoints: Elementor + Astra mobile ≤ 767, tablet ≤ 1023; the visual behaviour matters, not breakpoint numbers.
- **Tooling: Novamira CLI** (`NODE_OPTIONS=--use-system-ca novamira --site taameer.local …`; the MCP server is not relied on). Build scripts `scripts/wp/01…08-*.php`; checks `scripts/wp/wp-check.mjs` (Home), `wp-about-check.mjs` (About), `wp-services-check.mjs` (Services), `wp-projects-check.mjs` (Projects), `wp-project-detail-check.mjs` (project page), `wp-testimonials-check.mjs` (Testimonials), `wp-contact-check.mjs` (Contact, incl. WPForms validation + Mailpit), `wp-fab-check.mjs` (floating buttons), `wp-reveal-check.mjs`, `wp-shots.mjs`, `wp-editor-check.mjs`. Inspect read-only before any write; never retry an ambiguous write without checking state.
- **Global Kit:** Ink #0D0D0D (primary), Slate #595959 (secondary), Text #0D0D0D, Charcoal #262626 (accent), Paper #FFFFFF, Fog #F4F4F4, Line #D9D9D9; Heading Playfair Display 500, Body Inter 400, Button Inter 500 uppercase 0.03em; **Eyebrow Inter 600 0.22em stays separate (approved, D-040)**; prototype `clamp()` sizes.
- **Projects:** static cards + one Elementor page per project (no Loop Grid/Theme Builder). No CPTs or PHP templates unless approved later as a separate decision. The CTA band is an Elementor saved template reused through the Shortcode widget `[tp_template id="…"]`.
- **Deferred (D-040):** Arabic/RTL and Polylang (after the English site is verified; do not install Polylang before), SEO plugin, WordPress starter-content cleanup, the two licence "PDFs" (JPEGs named .pdf; do not rename).
- Images: photographs WebP, longest edge <= 1600 px, < 400 KB; logos and transparency PNG (SVG if a vector logo is supplied). Page settings: Elementor Full Width template, title hidden, no sidebar. Build order: English page by page with owner review; Arabic afterwards.

## Animation classes (prototype `animations.css` + `animations.js`; in WordPress: native Elementor Fade In Up + Counter, and `tp-split`, `tp-img-reveal`, `tp-delay-1…5`, `tp-parallax`, `tp-marquee`, `tp-before-after` in the child theme, see PRD 8.3)
| Class | Behavior |
|---|---|
| `tp-reveal` | Fade + translate on enter (default up) |
| `tp-reveal--up/--down/--start/--end/--scale` | Direction variants (start/end flip in RTL) |
| `tp-stagger` | Parent: children reveal in sequence |
| `tp-parallax` | Scroll parallax (default speed 0.1); `tp-parallax--slow` / `tp-parallax--fast` change the speed |
| `tp-split` | Headline reveals line by line; `aria-label` keeps it accessible |
| `tp-img-reveal` | Clip-path wipe on enter |
| `tp-counter` | Counts up to the number in its own text and keeps the prefix/suffix ("100+" counts to 100, keeps "+"; "G+4" is not a counter). `tp-counter--year` starts 25 below the target instead of 0 |

`tp-delay-1` … `tp-delay-5` (fixed 100 ms steps, `--tp-delay-step`) work on any of them. **Animation options are classes, never data attributes** (in WordPress they sit on Elementor elements as CSS classes); in the prototype, data attributes remain only for the header menu, the projects filter (`data-tp-filter`/`data-tp-type`) and prototype-only JSON render hooks (D-033). Initial hidden states only apply under `html.tp-js`, so content is visible if JS fails. Reduced motion shows everything instantly.

## File structure and naming
```
CLAUDE.md  README.md  index.html  ar/ (Arabic pages, generated: scripts/build_ar.py)
docs/     PRD, logs, maps (index below)
scripts/  extract_pdf.py → fetch_site.py → site_to_text.py → build_site_images.py → image_meta.py (re-runnable pipeline)
          contrast.py, check-partials.py, screenshot.mjs, interaction-test.mjs (QA; see README)
source/   PDF, pdf-text.md, extracted/, site/ (website mirror), site-content.md, screenshots/
assets/css  ELEMENTOR SOURCE: tokens · base · layout · components · inner-pages | SHIPPED: theme · animations
assets/js   SHIPPED: animations · interactions | PROTOTYPE ONLY: projects · project-page · contact-form
assets/docs company profile PDF (download link)
assets/img  <meaning>.webp + <meaning>-md.webp (900px) ; stock/ for stock images
data/     projects.json · team.json · testimonials.json · site.json
wp-theme/taameer-astra-child/   WordPress child theme (CSS/JS only)
scripts/wp/                     WordPress build scripts (Novamira) + browser checks
```
- Images: `project-<slug>-NN.webp`, `team-<name>.webp`, `chairman-<name>.webp`, `license-<name>.webp`, `letter-<company>.webp`, `stock-<subject>.webp`.
- Data strings are always `{ "en": "…", "ar": "" }`. Project `id` = slug = `project.html?id=<slug>`.
- A `-md` file exists only when the source is wider than 900px; otherwise use the single file.

## Docs index
| File | Contents |
|---|---|
| `docs/PRD.md` | Scope, pages, content model, phases, acceptance criteria; v1.8 = approved WordPress architecture (do not edit without asking) |
| `docs/progress-log.md` | One entry per completed task, newest first |
| `docs/decisions.md` | Non-obvious decisions: context, decision, reason, alternatives |
| `docs/image-map.md` | Every extracted image → PDF page → usage → pixel size, low-res flags |
| `docs/image-credits.md` | Every stock image → source, author, URL, license, usage |
| `docs/content-corrections.md` | Every text correction: original → corrected → where used |
| `docs/wp-mapping.md` | **WordPress build: Implemented vs Planned** (Astra header/footer, Global Kit, homepage sections, CTA template, child theme, assets, limitations); below it the historical Atomic build sheet (per-section content reference). `docs/wp-mapping-tables.generated.md` and `docs/spike-owner-steps.md` are historical (Atomic plan) |
| `docs/prompts/` | The owner's phase prompts; read the current phase's prompt at the start of every session |
| `docs/glossary-ar.md` | Fixed Arabic translation of every recurring term, places, names (⚠ = needs client confirmation); use it for any Arabic copy |
| `docs/ar-copy-review.md` | Generated English \| Arabic review document for the client (`python scripts/gen-ar-review.py`) |

## Roadmap
Prototype (complete):
1. Design system + English homepage
2. Remaining English pages: about, services, projects (filtering), project (single template from JSON), testimonials, contact, 404
3. Arabic RTL versions in `ar/`, Arabic content in the JSON files

WordPress migration (Astra Free + Elementor Free, D-038; PRD 12):
- WP Phase 1 — foundation + English homepage: **complete**
- WP Phase 2 — About: **complete**
- WP Phase 3 — Services: **complete**
- WP Phase 4A — Projects listing: **complete**
- WP Phase 4B — First Project Detail (reference page `wadi-alshabak-villas` only): **complete**
- WP Phase 4C — remaining 21 project pages: **complete (22 / 22 project pages)**
- WP Phase 5 — Testimonials: **complete**
- WP Phase 6 — Contact: **complete**
- WP Phase 7 onward — 404, English verification, then Arabic/Polylang, SEO plugin, final cleanup, handover: **not started**

## Current state
- **Phase:** WP Phase 1 (foundation + English homepage), **WP Phase 2 — About** (page id 297, `/about/`, D-041) and **WP Phase 3 — Services** (page id 306, `/services/`, D-042) **complete and verified**. **WP Phase 4A — Projects listing** (page id 312, `/projects/`, 22 static cards + class-driven filter) **complete and verified**. **WP Phase 4B — First Project Detail** (page id 326) and **WP Phase 4C — Remaining Project Pages** (21 pages, ids 339–417, `docs/wp-mapping.md` → WP Phase 4C) **complete and verified: 22 / 22 project pages completed**, each a child page of Projects at `/projects/<slug>/`. **WP Phase 5 — Testimonials** (page id 435, `/testimonials/`, `11-testimonials.php`) and **WP Phase 6 — Contact** (page id 449, `/contact/`, WPForms Lite form 446, `12-contact.php`) **complete and verified**. Home, About, Services, the Projects listing, all 22 project pages, Testimonials and Contact are built in WordPress.
- **Last completed task:** WP Phase 6 — Contact: hero, contact details (`dl` spec) beside the WPForms Lite form (5 prototype fields, honeypot + modern anti-spam, AJAX, prototype success copy, global validation messages in the prototype wording, notification to `{admin_email}` → Local's Mailpit), "Visit our office" + Google Maps button, shared CTA; `wp-contact-check.mjs` 57/57 (validation, keyboard submit, focused confirmation, Mailpit delivery, honeypot, 7 widths, reduced motion), editor open/save/re-render 34 → 34 with stored structure identical; targeted regression Home 20/20 only (`taameer.js` init changed; CSS §5g scoped to Contact-only classes). Child theme: `taameer.css` §5g, `taameer.js` `contactConfirmation()`. Before that, WP Phase 5 — Testimonials: hero, 4 letters (Container `<article>` with the testimonial id as CSS ID = the project pages' `/testimonials/#id` anchors), shared CTA; `wp-testimonials-check.mjs` 49/49, editor open/save/re-render 63 → 63; regression Home 20/20 + wipes, About 26/26 + wipes, Services 35/35 (owner asked for a reduced regression). Child theme: `taameer.css` §5f, `taameer.js` `letterSheets()`, Astra scroll-to-ID off on Testimonials too. Before that, WP Phase 4C — Remaining Project Pages: `10-project-detail.php` now builds any list of slugs (`$SLUGS`) with sections only where the project has the content (plain/framed cover, before/after, client letter, description, related omitted when empty); three batches of 7; `wp-project-detail-check.mjs` takes several slugs: 393 + 393 + 391 checks pass, reference 56/56, editor open/save/re-render on 9 pages with stored structure unchanged, regressions Home 20/20, About 26/26, Services 35/35 (+ wipes), Projects 40/40, FAB on every built page. One child-theme CSS rule added (`.tp-project-letter blockquote`). Before that, WP Phase 4B — First Project Detail: `10-project-detail.php` builds one Elementor page (child of Projects) from the prototype's project template; `wp-project-detail-check.mjs` 53/53, editor open/save/re-render OK (stored structure unchanged), regressions see `docs/progress-log.md`. Before that, WP Phase 4A — Projects listing: `wp-projects-check.mjs` 40/40, editor open/save/re-render OK (stored structure unchanged), regression Home 20/20, About 26/26, Services 35/35, FAB pass, wipes pass. Filter = Buttons `tp-filter-<type>` + cards `tp-type-<type>` (`taameer.js`); the team-experience section stays on About only. Before that, WP Phase 3 — Services: `wp-services-check.mjs` 35/35, wipes pass at 7 widths + reduced motion, editor open/save/re-render OK (stored structure unchanged), regression Home 20/20, About 26/26, FAB 21/21, Home/About/CTA/Kit/Astra data unchanged. Sticky chip nav + scrollspy, native anchor scrolling on Services (Astra scroll-to-ID off there), `#` menu links never current, Basic Gallery lightbox (D-042). Before that, WP Phase 2 — About: `wp-about-check.mjs` 26/26, editor open/save/re-render OK, Home regression `wp-check.mjs` 20/20 + wipes pass, Home data unchanged. Line lengths on About use Elementor Custom Width because `tp-measure*` classes do not apply inside Containers (D-041; Home left as is, owner decision pending). Before that: Phase 1.5 documentation alignment; D-039 image-wipe fix and WP Phase 1 (D-038); checks `scripts/wp/wp-check.mjs` 20/20, `wp-reveal-check.mjs` and `wp-shots.mjs` clean at 7 widths + reduced motion, `wp-editor-check.mjs` open/save/re-render OK.
- **How to rebuild:** run `scripts/wp/01…05-*.php`, then `07-about.php`, `08-services.php`, `09-projects.php`, `10-project-detail.php` (a run prepends `$SLUGS = ['slug', …];`; default = the reference page) `11-testimonials.php` and `12-contact.php` (WPForms form + page), through Novamira (05 already contains the D-039 hero class; `06-fix-hero-reveal-delay.php` was the one-off patch for the existing page) (`NODE_OPTIONS=--use-system-ca novamira --site taameer.local run novamira/execute-php --input @file.json --yes`, the JSON being `{"code": <the .php file>}`); the child theme is a junction from the site's themes folder to `wp-theme/taameer-astra-child/`.
- **Next task:** owner review of Contact, then the owner's next WP phase prompt (404 not started). Open items: Contact differences from the prototype (generic WPForms required message, no error summary, Phone as text field, see `docs/wp-mapping.md` → Known limitations) and the form's notification recipient (`{admin_email}` locally; set the client's inbox + real SMTP at go-live); 10 gallery images keep their descriptive Home/Services alt instead of "title, location — image i of n", and the 4 letter images keep their Home thumbnail alt on Testimonials (one alt per attachment); Phase 5 regression was reduced (Projects, project pages, FAB not re-run); shared CTA band differs from the prototype (same on every page; owner decision), chip-nav `aria-label` set in `taameer.js` (Arabic string later), Home `tp-measure` no-ops and Home chairman quote size (D-041 / progress log findings; the scroll-to-top / WhatsApp overlap is fixed), licence PDFs (PRD 14 #12), "27 projects" breakdown confirmation (22 projects + showcase + 4 team-experience entries), SEO plugin choice, starter-content cleanup (final phase).
