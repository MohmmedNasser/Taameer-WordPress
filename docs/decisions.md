# Decisions

Non-obvious decisions. Format: **Context / Decision / Reason / Alternatives rejected.** Newest on top.

### D-040 — Phase 1.5: architecture made official; eyebrow kept; deferred items (documentation only)
- **Context:** owner prompt "Phase 1.5 — Documentation Alignment Only" (2026-10-06) approved the WP Phase 1 architecture as the official project architecture and asked to record open items. No WordPress, Elementor, theme, CSS or JS changes.
- **Decisions:**
  1. **Architecture (official):** Astra Free + Elementor Free v3 (Containers, nested Containers, native widgets) + minimal Astra child theme for custom CSS/JS + Novamira CLI, as built in D-038. PRD updated to v1.8 (§1, 4, 5.1, 5.5–5.6, 6, 7, 8, 9, 10, 11, 12, 14, 15); D-030 (Atomic) superseded. Atomic Elements, Elementor Pro and Astra Pro are not assumed; a custom theme or PHP templates are not the architecture.
  2. **Projects:** Projects page with static cards; one Elementor page per project; no Loop Grid / Theme Builder; no CPT or PHP templates (`archive-project.php`, `single-project.php`) unless approved later as a separate decision. The owner's figure of 27 projects matches the 27 entries of `data/projects.json`: 22 company projects + the Wall Cladding showcase + 4 team-experience buildings (shown on About, labelled as prior experience); 22 project pages are planned (to be confirmed with the owner).
  3. **Eyebrow style kept separate** from the Button style: Inter 600, ≈ 0.22em, uppercase (approved; resolves the open point in D-038 item 5).
  4. **Arabic / Polylang deferred** until the English WordPress site is complete and verified; the language switcher stays visual only.
  5. **SEO plugin deferred** (Yoast or Rank Math) until the main migration is substantially complete.
  6. **Starter content cleanup deferred** to the final cleanup (Hello world, Sample Page, Privacy Policy draft, empty "Elementor #" drafts).
  7. **Licence "PDFs" deferred:** `license-taameer-plus-contracting.pdf` and `license-taameer-plus-carpentry.pdf` are JPEG images with a `.pdf` extension (WordPress rejects them); not renamed or modified; waiting for real PDFs (PRD §14 #12) or a later decision in the About phase.
- **Reason:** future sessions and documents must describe what is actually built and approved; open items stay visible instead of being decided silently.
- **Alternatives rejected:** rewriting the historical Atomic records (kept, marked superseded); merging the eyebrow into the Button style (visible change on every section label).

### D-039 — Image wipe fix: Elementor's widget transition overrode tp-img-reveal (WP phase 1 fix)
- **Context:** owner report: scroll-triggered image animations did not work on the WordPress homepage. Measured (`scripts/wp/wp-reveal-check.mjs`, timeline probe): the IntersectionObserver in `taameer.js` fired at the same point as the prototype (`is-visible` added, same rootMargin −8 % / threshold 0.12, parent observed), but the clip-path went from `inset(0 100% 0 0)` to `inset(0)` in one frame. Computed `transition` on the Image widget was Elementor's `background .3s, border .3s, border-radius .3s, box-shadow .3s, transform .4s`, from `custom-frontend.min.css` rule `.elementor-element:where(:not(.e-con)):where(:not(.e-div-block-base)):not(:has(.elementor-widget-container))`: same specificity as `.tp-js .tp-img-reveal`, loaded later, so it won. The hero wipe also lacked the prototype's 200 ms delay (`tp-delay-2` was never ported).
- **Decision:** `.tp-js .elementor-element.tp-img-reveal` (one extra stable class, no generated IDs) restores `transition: clip-path 1.3s cubic-bezier(0.65,0,0.35,1)`; `tp-delay-1…5` classes (100 ms steps, `--tp-delay`) added to `taameer.css`; `tp-delay-2` added to the hero Image widget's CSS classes (one setting, `scripts/wp/06-fix-hero-reveal-delay.php`; also in `05-home.php`).
- **Not changed (measured identical to the prototype):** parallax, split headline, marquee, counters, Elementor entrance fades and stagger delays.
- **Alternatives rejected:** `!important` (would also beat the reduced-motion and editor overrides); a JS-set inline transition (behaviour belongs in CSS); targeting `.elementor-element-xxxx` IDs.

### D-038 — WordPress build: Astra Free + Elementor v3 (supersedes D-030 for the build) — WP phase 1
- **Context:** owner prompt `docs/prompts/taameer-wp-phase-1-prompt.md` (2026-10-06) approved a new architecture: Astra Free + Elementor Free, Containers + native widgets, a minimal Astra child theme, no Atomic Editor, no Elementor Pro, no Polylang yet, English only. The repo had already been returned to the static prototype ("Return code To Static"); the LocalWP site had Astra active, Elementor 4.3.4 with Atomic off, no content.
- **Decision:**
  1. Header/footer = Astra Header/Footer Builder (logo, menu, HTML, button, widgets, copyright); page content = Elementor Containers + Heading, Text Editor, Image, Button, Counter, Shortcode. No HTML widget.
  2. Child theme `wp-theme/taameer-astra-child/` (junction into the site): `taameer.css`, `taameer.js`, `functions.php` (enqueue, `html.tp-js`, breakpoint filters, `[tp_template]`). It contains no layout and no page markup.
  3. Breakpoints aligned on the prototype's 1024 px desktop switch: Elementor tablet 1023 / mobile 767, Astra the same through `astra_tablet_breakpoint` / `astra_mobile_breakpoint`. The 640 px breakpoint survives only in the footer grid (2 columns from 640 px). Two-column content rows stack on tablet (the prototype's flex-basis wraps them below ~900 px); project cards stay two-up on tablet.
  4. Fluid type kept: Global Kit font sizes use Elementor's custom unit with the prototype's `clamp()` values. Spacing uses per-device values (desktop/tablet/mobile) taken from the prototype's clamp tokens at 1280–1440 / 768–1023 / 375 px; card image height keeps its `clamp()`.
  5. Typography globals: the prompt's "Accent / buttons / eyebrow" (Inter 500, uppercase, 0.03em) is the **Button** style. The eyebrow keeps the prototype's 600 weight and 0.22em tracking as a separate **Eyebrow / label** style; one shared style would visibly change every section label. **Approved by the owner: keep separate (D-040).**
  6. CTA band = Elementor saved template (type Container) rendered with the free Shortcode widget through `[tp_template id]`; Elementor Free has no Template widget or global widgets. Editing the template updates every page.
  7. Entrance reveals = Elementor's native Fade In Up with delays for stagger; `taameer.css` retimes it to the prototype (1 s, 2.5 rem, ease-out) by overriding the animation name on `.elementor-element.animated.fadeInUp`. Split headline, image wipe, parallax, marquee and before/after are small class-driven JS; counters are the native Counter (reduced motion shows the final value).
  8. Featured projects are static cards (no Loop Grid in Elementor Free); links use the final permalinks `/projects/<slug>/`, and inner-page links use `/about/`, `/services/#id`, `/testimonials/`, `/contact/`. They 404 until those phases.
  9. Language switcher = Astra HTML element with no link (visual only, no broken URL) until the Arabic site exists.
  10. Site URL switched to https (LocalWP serves SSL; http asset URLs would be blocked as mixed content). Title "Taameer Plus Contracting LLC", tagline "Construction, Fit-out & Renovation in Dubai" (front-page title = the prototype's title).
- **Overrides needed against Astra/Elementor defaults (documented in taameer.css):** Astra `html { font-size: 93.75% }` → 100% (the rem scale assumes 16 px); Astra's `body .elementor-button { font-size: 1rem }` → Kit Button style; Astra's padded `.ast-container` inside the Elementor Full Width template → no padding; Elementor's `.e-con::before` (background overlay) → `.e-con.tp-frame::before` / `.e-con.tp-plus-item::before`; Elementor's `max-width: 100%` on widgets → measure classes with higher specificity; Astra off-canvas slide → fade.
- **Media:** 191 original WebP images + the company-profile PDF uploaded (no `-md` variants, no recompression), alt text from the HTML (`scripts/wp/alt-map.json`). `assets/docs/license-taameer-plus-*.pdf` are JPEG images with a `.pdf` extension; WordPress rejects them, and they are not uploaded (About-page decision for the owner).
- **Alternatives rejected:** HTML widget or pasted CSS/JS (not editable, forbidden by the prompt); hooking the CTA site-wide before the footer (pages could not omit or reorder it); Astra's slide-in menu (prototype fades); Font Awesome icons for the "+" and arrows (heavier than the 1.25 px line icons; drawn with CSS masks instead).

### D-037 — Spike environment: DB port, shells and Polylang setup (Phase 4 spike, Part A)
- **Context:** Local's site shell could not reach MySQL (`localhost:3306` refused); Local assigns each site its own MySQL port (10011 for "taameer"). `wp.bat` also breaks under Git Bash (path with spaces) and inline `wp eval '...'` is mangled by cmd quoting.
- **Decision:** `DB_HOST` set to `localhost:10011` with `wp config set` (owner-approved; WP-CLI is the permitted way to touch the WordPress folder). All WP-CLI work runs from PowerShell; multi-line PHP goes in scratch files run with `wp eval-file`. Polylang has no WP-CLI commands in the free version, so English (default, no prefix, `hide_default=1`, `force_lang=1`) and Arabic (`ar`, RTL, `/ar/`) were added through `PLL()->model->add_language()`; permalinks set to `/%postname%/`.
- **Reason:** keeps the setup scriptable and reproducible; no hand-written Elementor data.
- **Alternatives rejected:** clicking through Polylang's UI (not reproducible); editing wp-config.php by hand.
- **Spike deviations from Part A wording:** `interactions.js` is the prototype's lightbox section verbatim plus a trimmed helper block, so the lightbox dialog CSS is not in `theme.css` (the dialog will be unstyled in check 1b; behaviour is still testable). The throwaway CPT `tp_spike_project` (check 3) and its 2 posts were created now, marked `SPIKE START/END` in `functions.php`.

### D-036 — Finding: LCP on ar/services.html (diagnosis only, for Phase 4; nothing was changed)
- **Measured** (Lighthouse mobile, simulated slow 4G, `python -m http.server`): the first Arabic run reported LCP 7.2 s (performance 57); a re-run reported 4.3 s (75); the English page 3.8 s (82). The simulation is noisy (about ±2 s between runs), so read the *causes* below, not the single number.
- **LCP element:** not an image. It is the first service paragraph, `p.tp-lead.tp-reveal` ("أعمال إنشائية متكاملة…") in the Construction block, 368 × 105 px at 375 px wide. No image is the LCP, so image weight and lazy-loading are not the cause (the three largest images are 36–68 KB `-md.webp`, none lazy-loaded above the fold issue; total page 599 KB, of which images 216 KB).
- **Why it is late:** the LCP breakdown is TTFB 0.46 s, load delay 0, load time 0, **render delay 3.8 s (about 89%)**. The paragraph is in the DOM and its text is ready, but it is not painted visibly until (1) the render-blocking resources finish — 7 local stylesheets plus the Google Fonts stylesheet (Lighthouse estimate 1.9 s saving; the fonts stylesheet alone ends at 434 ms in Arabic vs 264 ms in English) — and (2) the `tp-reveal` entrance runs: under `html.tp-js` it starts at `opacity: 0` and fades in over `--tp-dur-reveal` (1000 ms) after the IntersectionObserver fires, so the browser counts the paint at the end of the transition, not at first render. FCP (3.4 s) is already late for the same render-blocking reason.
- **Arabic is worse than English by about 0.5–1 s** because of fonts: the Arabic request pulls 6 woff2 files (El Messiri ×2, IBM Plex Sans Arabic ×4 unicode-range subsets, about 127 KB) against 2 in English (about 87 KB), and the text cannot paint in the display/body font until they arrive (`font-display: swap` is set, but the swap itself triggers a relayout of Arabic text).
- **Options for Phase 4 (not applied):** (a) do not put `tp-reveal` on the above-the-fold lead (or exclude the first section from the reveal; the entrance is the biggest single factor and is a pure-CSS decision); (b) self-host the fonts in the child theme (WOFF2, only the used subsets, `preload` for El Messiri 500 and Plex 400) instead of Google Fonts, removing a cross-origin stylesheet from the critical path; (c) concatenate / minify the five Elementor-source stylesheets in the WordPress build (Elementor and the theme output them differently anyway) and keep `animations.css` + `theme.css` as the only theme files; (d) `font-display: optional` for El Messiri if flash of fallback is acceptable. Re-measure on the WordPress build, since the prototype CSS structure disappears there.

### D-035 — Arabic pages, typography and bidi (Phase 3)
- **Generator:** `ar/*.html` are produced by `scripts/build_ar.py` from the English pages (text and text attributes mapped through `scripts/ar_text.py` + `ar_data.py`; markup, classes and annotations copied unchanged). Reason: the partials and section structure must stay identical in both languages; edit the dictionaries and re-run, never the generated pages by hand. The pages themselves stay plain static HTML (no build step for the site). Fuzzy matching (case and punctuation ignored) lets one entry serve small wording differences between JSON and HTML.
- **Typography as tokens:** everything lives in one `:lang(ar)` block at the end of `tokens.css` (fonts, `--tp-fw-light` 500, tracking 0, `--tp-transform-label: none`, `--tp-style-quote: normal`, line-heights 1.35 / 1.4 / 1.85, small sizes about +8%, guillemets). To make that possible the hard-coded `text-transform: uppercase`, `font-style: italic` and quotation marks in the component CSS became tokens (`--tp-transform-label`, `--tp-style-quote`, `--tp-quote-open/close`). Sizes were decided by screenshot: Plex Sans Arabic at the English small sizes read too small (eyebrows, captions). The Elementor mapping is not decided here: REPORT R10 presents both options with the number of classes each affects.
- **Fonts:** only El Messiri 500 and Plex Sans Arabic 400/500/600 are requested, only on Arabic pages. Latin digits and letters inside headings (stats, "G+4", brand names) render in El Messiri's Latin glyphs, which the owner's choice implies.
- **Bidi:** Latin runs (brand names, building notation, e-mail) and phone numbers inside Arabic text are wrapped in `<bdi>` by the generator; `tel:`, `mailto:`, WhatsApp and Instagram links get `dir="ltr"` so groups of digits never reorder. Dynamic strings from JSON are not wrapped (the base direction handles trailing Latin runs and was checked visually, e.g. "(G+4P+H+22+R)" and "Atlas Copco"). `100+` renders as `+100` in RTL (R11, accepted).
- **Numerals and agreement:** Western digits everywhere; durations follow the glossary agreement rules (3-10 plural, 11-99 singular accusative, 100 singular); the filter announcement also agrees ("عرض مشروعين", "عرض 5 مشاريع", "عرض 22 مشروعاً").
- **Testimonials:** third-party excerpts are translated faithfully and labelled "ترجمة عن الأصل الإنجليزي" with the existing `tp-caption` class (no new CSS); the original letters stay linked. Job titles use the masculine default because the sources give no gender (flagged for confirmation).
- **SEO links:** canonical and hreflang (`en`, `ar`, `x-default` → English) are now live on all indexable pages in both languages (the Phase 2 comment placeholders are replaced); the project template keeps a template comment because its URL depends on `?id=`, and the noindex 404 carries none. JSON-LD in `index.html` / `contact.html` is copied unchanged (English) to the Arabic pages: WordPress SEO output replaces it.
- **Paths:** Arabic pages sit one folder down, so `assets/` and `data/` references gain `../` (generator) and the JSON-rendering scripts add the same prefix when `<html lang="ar">` (`TP.projects.asset`). This is prototype-only; WordPress prints absolute theme URLs.
- Alternatives rejected: hand-copying 8 pages (drift between languages); a client-side translation layer (bad for SEO, breaks the Elementor build); `<html lang>` switching of fonts in components (would add per-language CSS to the component layer).

### D-034 — Arabic fonts (Phase 3 Part A)
- Context: Arabic heading font had to pair with Playfair Display; candidates tested side by side with real tokens (El Messiri, Noto Naskh Arabic, Amiri; `source/font-test/`).
- Decision: **El Messiri 500** for Arabic H1–H4, the pull-quote and stat numbers (`--tp-font-display-ar`, `--tp-fw-display-ar: 500`); **IBM Plex Sans Arabic** for everything else (body 400, plus 500/600 only where the English UI uses them). Heading line-height stays `--tp-lh-snug` (1.35). Letter-spacing 0 and no `text-transform` on Arabic. Only El Messiri 500 and the Plex weights in use are requested from Google Fonts, on Arabic pages only.
- Reason: chosen by the owner for a modern, sturdy look that stays legible at small sizes (verified at 375 px: H3 24 px and H4 20 px read cleanly).
- Rejected: Amiri (closest to Playfair but thin strokes at small sizes), Noto Naskh Arabic (neutral, plain), Noto Kufi Arabic (earlier token placeholder).

### D-033 — Part 0 (PRD v1.6): data attributes, marquee, header menu
- Context: PRD v1.6 (Phase 2 review) resolved report items R1, R2, R3, R5, R6 and states that interactions use only `href`/`alt` (no data attributes), because the free atomic editor may not expose custom attributes on elements built atomically.
- Decision (data-attribute rule):
  - **Allowed:** the header menu hooks (`data-tp-header`, `data-tp-menu-toggle`, `data-tp-menu`): theme markup in `header.php` (E1/E2). `data-tp-filter` / `data-tp-type`: archive template (E3). Prototype-only JSON render hooks (`data-tp-projects`, `-src`, `-featured`, `-count`, `-type`, `-exclude`, `-service`, `-site`, `-related`, `-field`, `-badge`, project-page hooks, `data-tp-form`), which are never shipped. Attributes written by JS at runtime (`data-tp-source`, `data-tp-counted`, `data-tp-lb-close`, `data-tp-active`) are not authored markup.
  - **Forbidden on anything built atomically:** every animation option is a class.
    - `data-tp-delay` → `tp-delay-1` … `tp-delay-5` (fixed steps; `--tp-delay-step` = 100 ms in tokens.css).
    - `data-tp-target` / `-suffix` / `-prefix` removed: `tp-counter` reads number, prefix and suffix from its own text ("100+" counts to 100 and keeps "+"; "G+4" is not a counter).
    - `data-tp-from` → `tp-counter--year` (starts 25 below the target).
    - `data-tp-speed` → `tp-parallax--slow` / `--fast` (default 0.1; factors are tokens `--tp-parallax-speed-*`, read by JS from the computed style).
    - `data-tp-stagger="false"` (an opt-out read by projects.js) inverted: `tp-stagger` is a class on the grid in the page markup, and projects.js no longer adds it.
    - `data-tp-start` on `tp-before-after` removed (always opens at 50%).
  - All converted attributes were removed from every page; the CLAUDE.md animation table is updated.
- Decision (rest of Part 0): the header mobile menu is part of E2; `tp-marquee` is an approved animation; the services image swap is replaced by static rows; Div Blocks are accepted for missing semantic elements (per-section list in docs/wp-mapping.md).
- Reason: classes survive in Elementor's Advanced → CSS Classes and global classes; attributes may not. Theme templates are PHP, so attributes there cost nothing.
- Side effects: delays are coarser (hero 100/250/350/800 ms → steps 1/3/4/5; page heroes 100/200/350 → 1/2/3; services 0–400 ms in 80 ms steps → none, 1–5); default parallax is 0.1 (was 0.15; no page used the default; the 0.08 hero image now uses 0.1).
- Alternatives rejected: ms values in class names (unbounded set, cannot be global classes); inline `style="--tp-delay"` (not available atomically).

### D-032 — Phase 2B page decisions
- Projects archive uses an even 3-column grid (`tp-projects-grid--even`): the 7/5 rhythm of the Home grid depends on `nth-child` and would leave gaps when items are hidden by the filter.
- Filter state is `?type=<slug>` (valid slugs only; anything else = All) written with `replaceState`; counts are static in the markup and recomputed from the rendered cards.
- Project template: unknown ids, a missing id and the Wall Cladding showcase all show the not-found state in the hero (noindex added by script; WordPress returns a real 404). Gallery order = `gallery` array; before/after uses the first gallery image as "after". Spec rows: Type, Location, Duration, Completion (month and year, or "Ongoing"; omitted for the one completed project without a date), Consultant when present.
- Covers below 1200px wide or portrait are framed, never upscaled, and capped at 80vh (`--tp-project-cover-h`).
- Testimonials: Jan's Noodles shows only the company and its letter; no placeholder sentence is added. Related-project links on testimonials are the inferred ones in `data/testimonials.json` (client to confirm).
- Contact: no office hours (unknown); the Maps button uses a search URL for the Sky Business Building, Festival City, no embed. Success copy ("Thank you for your message… Our team will get back to you.") is placeholder wording for the client to approve.
- 404 keeps relative asset paths in the prototype; the PHP template uses theme URIs.

### D-031 — Prototype files mirror the four theme files (Phase 2B Part 0)
- Context: PRD v1.5 limits the WordPress front end to `animations.css/js`, `theme.css`, `interactions.js` (+ E3 PHP templates); everything else is Elementor global variables/classes.
- Decision: `theme.css` takes the header, mobile menu, footer, WhatsApp, lightbox dialog, before/after handle, services chip bar and (new) filter bar, project single template and 404; `interactions.js` merges lightbox, before/after, scrollspy, filter and the header menu (one IIFE, separate sections); `counters.js` merged into `animations.js`; tokens/base/layout/components/inner-pages stay as `ELEMENTOR SOURCE`; `projects.js` is `PROTOTYPE ONLY` and clones `<template id="tp-project-card">`. The header is `position: sticky`, solid and in flow: transparent state, scrolled class, `backdrop-filter` and all hero padding compensation removed.
- Behaviours are class-driven on plain markup: `tp-lightbox` is a *container* (one gallery) instead of `data-tp-lightbox` links; `tp-before-after` is two images and JS builds clip layer, labels and handle; `tp-scrollspy` replaces `data-tp-service-nav`; the dialog classes were renamed `tp-lbox*` (and tokens `--tp-lbox-*`) so they never clash with the container class `tp-lightbox`. `tp-counter` reads its number from the text when `data-tp-target` is absent.
- Direction-neutral: neutral classes plus `-rtl` siblings (`tp-link-rtl`, `tp-card__more-rtl`, `tp-marquee-rtl`, `tp-service__link-rtl`) for the only physical values; heading classes `tp-h1`–`tp-h4` set colour explicitly.
- Open (REPORT): the header menu toggle needs JS but is not named in E2; list/dl semantics, marquee and the services hover image swap are not atomic (see docs/wp-mapping.md).
- Alternatives rejected: keeping header.js as a fifth theme file (breaks "exactly four files"); a CSS-only `<details>` menu (focus trap and Esc cannot be done).

### D-030 — Elementor v4 (Atomic Editor) replaces custom widgets
- **Status: superseded by D-038 / D-040 (2026-10-06).** Kept as a historical record; Atomic Elements are not part of the approved architecture.
- Context: Elementor v4 atomic elements, global variables and global classes are available in the free version.
- Decision: pages use atomic elements only (no v3 widgets, custom PHP widgets, HTML widget or shortcodes; supersedes PRD 8.2). Every `--tp-` custom property becomes a global variable (same name); every repeated class a global class, with colour set explicitly on heading classes. The theme has one stylesheet, `animations.css` (tp-reveal, tp-stagger, tp-parallax, tp-img-reveal, tp-counter, reduced motion), plus `animations.js`; no Additional CSS. Responsive uses Elementor tablet/mobile controls; RTL tested manually per Arabic page. Photographs: WebP, longest edge <= 1600 px, < 400 KB, converted on the server; logos/transparency stay PNG (SVG if vector supplied). Theme stays Hello Elementor child (not Astra) and holds header, footer, language switcher, WhatsApp button. Pages are content only: header not transparent, no overlay, no hero top-padding compensation. Page settings: Full Width template, hide title, no sidebar. Build order: English Home, stop for owner review, then Arabic.
- Reason: editors work natively in Elementor with no PHP widget maintenance. Anything atomic elements cannot express is reported to the owner, not improvised.
- Alternatives rejected: custom PHP widgets (PRD 8.2), a large theme stylesheet, Astra.

### D-029 — License data read from the license images; PDFs copied locally
- Context: taameer.ae renders the license fields blank in its text; the values live only in the two license scans (PDFs without a text layer).
- Decision: fields read from the renewed licenses by eye and stored in `data/site.json → licenses` (Contracting 741846, expires 06/09/2027; Carpentry 1314264, expires 18/02/2027); PDFs copied to `assets/docs/`. The lightbox shows the 1920px image rendition with a "View PDF" link; without JS the button opens the PDF. A thumbnail and a button pointing to the same license count once in the gallery.
- Reason: PRD 5.3 wants the licenses viewable and their key fields as text. The scans include the license-members table (names, ID numbers) and a personal mobile number/email: flagged to the client.

### D-028 — Team experience is labelled and not clickable
- Context: the four buildings are not company projects (PRD 6.4).
- Decision: the website's wording "Large-scale projects by the Taameer Plus team", an explicit note beside the heading, a "Team experience" badge on every card, and cards are not links (no detail pages exist for them).

### D-027 — Service → project-type mapping lives in data/site.json
- Context: each service block shows up to 3 related projects "whose type matches".
- Decision: `services[].relatedTypes`: construction → `construction`; decoration-fitout → `fit-out` + `landscaping` (the only landscaping project is "Fit-out & Landscaping"); renovation → `renovation-decoration`; design-build, maintenance, turnkey → `[]`. Empty means no related block (projects.js hides it; nothing renders empty). Turnkey links to `projects.html?type=construction` (`projectsLink`; PDF p13 ties turnkey work to villa structure and fit-out); decoration links to the wall cladding showcase. `projects.js` reads the mapping through `data-tp-service`.
- Reason: Design & Build and Turnkey are contract models and Maintenance has no project, so tying them to a project type would invent claims. WordPress: a term relation on the service, queried by the Projects Grid widget.
- Open: the client can name projects delivered as Design & Build or Maintenance; then add a `projectIds` override. Phase 2B's projects page must honour `?type=`.

### D-026 — Shared blocks are literal, marked partials; two allowed differences
- Context: header, footer, icon sprite, WhatsApp button and CTA band must be identical on every page (they become `header.php` / `footer.php`), but the static prototype has no include mechanism.
- Decision: each is pasted literally between `<!-- PARTIAL:name START/END -->` markers; `scripts/check-partials.py` compares them with index.html and fails on any drift. Only two differences are normalised: `aria-current="page"` (active nav state, in header nav, mobile menu and footer quick links) and the language-switcher `href` (`ar/<this page>.html`, the equivalent page per PRD §7; Polylang later). The checker also enforces the per-page SEO head, one `<h1>`, `<main id="main">` and the shared stylesheet/script set.
- Reason: no build step is allowed (CLAUDE.md), and copy-paste drift is the main risk of a multi-page static prototype.
- Alternatives: JS `fetch()` includes (breaks without a server, invisible to SEO and to the WP port).

### D-025 — SEO head pattern: canonical and hreflang stay comments until Phase 3
- Context: hreflang pointed at `ar/index.html`, which does not exist yet; canonical needs the production domain.
- Decision: every page has a unique `<title>`, meta description, Open Graph (`og:type/site_name/locale/title/description/image`) and `twitter:card`; canonical and hreflang are a commented block showing the final URLs. index.html's live hreflang links were converted to comments; check-partials.py fails if a live canonical/alternate link appears.
- Reason: a link to a non-existent page is worse than none. WordPress will output these through Polylang and the SEO plugin.

### D-024 — Official brand locked in; switcher removed (Phase 2A)
- Context: the client approved the Official brand after comparing both.
- Decision: brand values merged into `tokens.css` (same token names, so components did not change); deleted brand-bronze/official/overrides CSS, the switcher (JS, CSS, first-paint script), `data-brand`, Cormorant/Manrope, and the two comparison scripts (`brand-compare.mjs` was tied to `?brand=` and the switcher; `brand-style-diff.mjs` was a one-off; `screenshot.mjs` covers general visual QA). `contrast.py` now reads `tokens.css`. The `v1-bronze` tag did not exist in the repo (it was only mentioned in docs), so it was created at the last bronze commit before deleting.
- Reason: one design, one stylesheet set; bronze stays recoverable from git.
- Alternatives: keep the brand layer for future rebrands (rejected: dead code in the WP port).

### D-023 — Brands as token sets; shared HTML/JS/component CSS
- Context: the client must choose between the bronze design and the taameer.ae identity.
- Decision: `tokens.css` keeps shared values (spacing, layout, motion, z-index, scale base). `brands/brand-<name>.css` holds colours, font families, display sizes (h1–h4, display, quote), display weight, button tracking, radii, shadows and button hover under `:root[data-brand="…"]`, with identical token names. `data-brand="bronze"` is the default on `<html>`. `brand-official-overrides.css` exists but is empty: no component needed a structural override.
- Two component fixes made the split clean (bronze values unchanged): `.tp-fab` used `--tp-color-text` on the accent fill (invisible icon when accent = ink) → `--tp-color-on-accent`; its hover now uses `--tp-btn-bg-hover/fg-hover`.
- Verified: bronze vs tag `v1-bronze` = 0 computed-style differences over 506 elements.
- Alternatives rejected: duplicating pages; CSS filters; a JS theme engine.

### D-022 — Fonts for both brands load from one Google Fonts request
- Decision: one link carries Cormorant Garamond + Manrope + Playfair Display + Inter. Trade-off: extra font data and requests for whichever brand is unused. After the client decides, delete the other families from the link and its brand file.
- Alternative: inject the font link per brand with JS — rejected (flash of fallback font, more moving parts for a temporary review tool).

### D-021 — Contrast: no official colour failed; one role remapped
- All official text colours pass AA on white and fog (ink 19.4/17.7, slate 7.0/6.4, charcoal 15.1/13.8). `--mist #8C8C8C` (3.3:1) fails as text, so it is **not used**; secondary and muted both map to `--slate`.
- `accent-text` = charcoal `#262626` rather than ink so eyebrows and links stay a shade apart from headings. No darkened variants were needed (`python scripts/contrast.py official`, 0 failing pairs).

### D-020 — Display type scaled down and eased in weight for Playfair
- Playfair Display sets ~20% larger than Cormorant Garamond at the same size and has no 300 weight. `--tp-fs-h1…h4/display/quote` are reduced in the official file (h1 max 4.75rem vs 6rem) and `--tp-fw-light` (the display-weight token) is 500; the site uses 600, which read heavy at hero size against the light, premium brief.
- Button tracking 0.03em and radii 2/6/10px are copied from the site.

### D-019 — Dark areas of the official site become ink text, buttons and lines on light layouts
- Official uses ink `#0D0D0D` for hero, testimonials and footer backgrounds. The client wants no dark sections, so in the official brand ink is used only for text, "+" marks, hairlines, solid buttons and the FAB. Section backgrounds are white and fog `#F4F4F4`; the footer is fog (as bronze uses sand).
- The official light-on-dark button variants are not used. Button hover goes ink → charcoal (the official outline-invert would drop the fill on white).
- Logo: the black wordmark is identical in both brands, so no `<picture>` swap.

### D-018 — Mobile menu is a disclosure, not a modal dialog
- Context: the toggle button lives outside the menu panel; `aria-modal` would hide it from screen readers.
- Decision: `aria-expanded` + `aria-controls` disclosure; header.js traps Tab between toggle and panel, Esc closes and restores focus. While open, the header drops `backdrop-filter` (it creates a containing block that trapped the fixed panel inside the 68px bar — found in QA).

### D-017 — Services list preview without JS
- Context: the hover-image list needs each image in its own row (Elementor repeater) but one shared preview cell on desktop.
- Decision: rows are `display: contents` ≥1024px, so links and images become grid items; images share a sticky cell and cross-fade via `:hover` / `:focus-within`; first image shows by default (`:has()`). `role="listitem"` restores list semantics. Mobile: plain rows with inline images.
- Alternatives: JS hover swapping (more code, not needed); duplicated image column (breaks the repeater model).

### D-016 — Copy stays client-sourced
- Context: design drafts introduced marketing lines (e.g. "Licensed, integrated, exacting").
- Decision: headings/body use PDF or website wording only; structural labels ("Our expertise", "Track record", "Before & after", "Drag the divider…") are UI copy, not claims. The About/services/why-us/CTA text is the website's.

### D-015 — Two extra custom widgets: `tp-services-list`, `tp-spec`
- Context: PRD 8.2 lists 7 widgets. The services hover list and the drawing-style facts block have no native Elementor equivalent in Free.
- Decision: add both; `tp-spec` is reused on the Project detail page (Phase 2).

### D-014 — Visual signature: setting-out marks
- Context: the brief fixes palette and fonts (warm light + serif), a look that easily turns generic.
- Decision: one memorable device — bronze "+" registration crosses at two opposite corners of framed images (hero, chairman, why-us), like setting-out marks on architectural drawings and the "+" in the logo. Supporting details: superscript bronze "+" after the hero headline (aria-hidden), project facts as a drawing title block (`tp-spec`), "+" as eyebrow marker, list bullet, service hover icon and menu icon (rotates to ×). No numbered markers (services are not a sequence). Hero: text on a sand panel with the framed image overlapping its end edge.
- Tools consulted: frontend-design, ui-ux-pro-max (Swiss-modernist asymmetric 12-col grid, trust signals up front, 150–300ms hovers), design-system (primitive → semantic → component token layers; `validate-tokens.cjs` passes with 0 violations).

### D-013 — Contrast adjustments
- Context: `python scripts/contrast.py` on the brief palette: accent-text on sand 4.14, secondary on bg 4.32 and on sand 3.80 (all < 4.5).
- Decision: `--tp-color-accent-text` #8A6A3B → **#826437** (sand 4.55, bg 5.18); `--tp-color-secondary` #5E7A82 → **#546D74** (sand 4.56, bg 5.19). Bronze `--tp-color-accent` (#B08D57, 2.56–3.09) is used only for non-text decoration and as a fill with **charcoal** labels (4.60). All 13 text pairs pass AA.
- Alternatives: white text on bronze buttons (3.1, fails).

### D-012 — Image dimensions live in `imageMeta`
- Context: JS-rendered cards need width/height (no CLS) and must only reference `-md` files that exist.
- Decision: `projects.json.imageMeta` = { path: [w, h, hasMd] }, regenerated by `scripts/image_meta.py`. Project fields stay plain paths as specified.
- Reason: keeps the CPT-shaped fields flat; mirrors WP attachment metadata.

### D-011 — Hero image: Palm Jumeirah #2 (pool + facade)
- Context: brief asks for a Palm Jumeirah hero; all 5 photos are PDF-only at ~576px.
- Decision: photo 02 (bright pool/facade), framed at ≤ ~46% of the viewport beside a sand text panel, never full-bleed. Also the project cover.
- Reason: lightest, most "calm luxury" shot; framing limits the upscale. Flagged for client (originals wanted).

### D-010 — Profile PDF download uses the site's copy
- Context: both profile PDFs have identical text; ours is 12.2 MB, the site's 5.0 MB.
- Decision: "Download Company Profile" links `assets/docs/taameer-plus-company-profile.pdf` copied from the site version.
- Reason: 60% smaller for mobile users, same content.

### D-009 — License images from the site's vector PDFs
- Context: PDF p8 licenses are 300-DPI crops of a page; the Contracting license there expired 06/09/2026. The site serves renewed vector PDFs.
- Decision: render the site PDFs at 200 DPI → `license-contracting/carpentry.webp` (1920px + md).
- Reason: current, sharper. Alternatives: PDF crops (expired, softer).

### D-008 — Duplicate project photos across sources
- Context: 12 projects exist in both sources; the PDF re-crops the same photos, so filenames/hashes differ.
- Decision: site photos first (site order), then PDF photos that do not match any site photo. Matching = dHash over aspect-matched crops at 5 scales × 9 anchors, plus `MANUAL_DUPES` for heavy re-crops (verified visually).
- Reason: "keep the higher resolution" without losing PDF-only angles. Note: the site's Jumeirah Golf photos carry a faint watermark; the clean PDF copies are half the size, so the site copies were kept.

### D-007 — Partner logos on a light section
- Context: 7 of 14 partner logos are white-on-black JPGs; `mix-blend-mode: multiply` cannot hide a black box.
- Decision: knock out black-box logos to transparent WebP at build time (neutral pixels → charcoal `#2E2A26`, saturated brand colours kept); white-box logos stay JPG-derived and use `multiply` in CSS.
- Reason: consistent strip, no dark tiles. Alternatives: framing logos in tiles (dark tiles break "no dark sections"); inverting (distorts brand colours).

### D-006 — Service imagery = project photography
- Context: the site's 6 "service images" are black line icons (145–612px) and the services banner 404s. The brief asks to avoid centred-icon service cards.
- Decision: each service shows a client project photo that illustrates it (Construction → Dubai G villa; Design & Build → Al Awir villas; Decoration & Fitout → KF INC HQ; Renovation → Dubai Marina triplex; Maintenance → Atlas Copco HQ; Turnkey → Al Warqa 1st G+2 villa). "Why Choose Us" uses a site project photo instead of the missing banner. No stock needed.
- Reason: real work beats icons and stock; all client-approved.

### D-005 — Logo = PDF raster with transparency
- Context: site logos are white-on-black JPGs (863×277); the PDF logo is black on transparent (809×263).
- Decision: use `logo-taameer-plus.webp` from the PDF (displayed ≤ 200 CSS px wide, so 4× density). No CSS text logo needed. Vector logo still requested from client.

### D-004 — Corrections list lives in docs/content-corrections.md
- Context: PRD §13 says the corrections list is maintained in CLAUDE.md.
- Decision: keep the full list in `docs/content-corrections.md`; CLAUDE.md links to it.
- Reason: CLAUDE.md must stay short (<200 lines); the list grows with each source conflict.
- Alternatives: inline in CLAUDE.md (bloats the entry point).

### D-003 — Chairman name "Fahim Al-Ali"
- Context: PDF "Al_Ali", Phase-1 brief correction table "Al Ali", website "Al-Ali".
- Decision: display **Mr. Fahim Al-Ali**. File name `chairman-fahim-al-ali.webp`.
- Reason: source precedence — the website wins on text; the brief's homepage spec also uses "Al-Ali".

### D-002 — Slug `al-awir-villas` (was `al-amir-villas`)
- Context: PDF says "Al Amir 1"; website says "Al Awir 1" (newer, wins).
- Decision: project slug and image names use `al-awir-villas`.
- Reason: the slug becomes the public URL and must name the real location.

### D-001 — Resume the interrupted extraction rather than rewrite it
- Context: an earlier session wrote a complete `extract_pdf.py` but stopped during WebP export.
- Decision: reuse it; add an `--export` flag that skips the raw dump when natives already exist.
- Reason: raw natives are deterministic; re-dumping wastes time.
