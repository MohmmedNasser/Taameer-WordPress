# WordPress mapping

**Approved architecture (PRD v1.8 §8.2, D-038):** WordPress on LocalWP (`https://taameer.local`) · **Astra Free** (foundation, Header/Footer Builder, navigation, mobile menu) · **Elementor Free, v3 architecture** (Containers, nested Containers, native widgets, Global Kit, responsive controls, native animations where equivalent) · **minimal Astra child theme** `wp-theme/taameer-astra-child/` for custom CSS/JS only · **Novamira CLI** for WordPress operations (`scripts/wp/`). No Atomic Elements, no Elementor Pro, no Astra Pro, no CPT/PHP templates; Polylang (free) for the Arabic site since WP Phase 8. The static prototype is the visual source of truth.

Status labels: **Implemented** = built and verified in WordPress. **Planned** = not started; the approach shown is the current intention, decided in that page's phase.

## Implemented — WP Phase 1 (foundation + English homepage)

### Foundation

| Item | State |
|---|---|
| WordPress | 7.1.2, PHP 8.2; site URL `https://taameer.local`; title "Taameer Plus Contracting LLC", tagline "Construction, Fit-out & Renovation in Dubai"; Home = static front page (page id 208) |
| Plugins | Elementor 4.3.4 (free), WPForms Lite, Novamira; Polylang 3.8.10 (free) since WP Phase 8. Nothing else installed |
| Elementor features | Containers, Nested Elements, Optimized Markup active; Atomic Elements / v4 opt-in inactive (pinned) |
| Theme | Astra 4.14.0 (parent) + child theme "Taameer Plus (Astra child)" active |
| Breakpoints | Elementor and Astra: mobile ≤ 767 px, tablet ≤ 1023 px (desktop from 1024 px, the prototype's switch). The prototype's 640 px survives only in the footer grid. Visual behaviour is the source of truth |
| Page settings | Elementor Full Width template (`elementor_header_footer`: Astra header and footer kept), title hidden |

### Header, footer, CTA and homepage

Built by `scripts/wp/01…05-*.php` (run through Novamira). The homepage has 10 sections; header and footer come from Astra.

| Part | Where it lives | Native building blocks | Child-theme class / script |
|---|---|---|---|
| Header | Astra Header Builder | Logo, Primary Menu ("Main navigation"), HTML 1 (EN \| عربي, visual only), Button 1 (Get a Quote → /contact/), Mobile trigger "Menu" → off-canvas full-screen popup (menu, button, HTML 2: phone, email, language) | `#masthead` sticky + nav hairline + "+" toggle + popup fade (`taameer.css` §3) |
| Footer | Astra Footer Builder, 4-column row (4-lheavy) + bottom row | Widget 1 (Custom HTML: logo, blurb, profile PDF from the Media Library), Widget 2/3 (Navigation Menu widgets "Footer: Quick links", "Footer: Services"), Widget 4 (Custom HTML: address, phones, email, WhatsApp, Instagram), Copyright, HTML 1 (language), HTML 2 (floating WhatsApp button) | `taameer.css` §4 (grid columns, eyebrow headings, icons by CSS mask, `.tp-fab`) |
| CTA band | Elementor saved template "CTA band (site-wide)" (type Container) | Container (ink hairline box) > Heading H2 + Text Editor + Container(row) > Button + 2 Buttons (phone, email) | Reused via Shortcode widget `[tp_template id="…"]` (registered in `functions.php`; Elementor Free has no Template widget) |
| 1 Hero | Home | Section Container (row) > fog Container [Heading p.eyebrow, Heading H1, Text Editor, Container > 2 Buttons] + Container [Container.tp-frame > Image, Heading p caption] | `tp-eyebrow`, `tp-split`, `tp-frame`, `tp-img-reveal`, `tp-parallax`, `tp-caption`, `.tp-hero-plus` span in the H1 text |
| 2 Partners | Home | Full-width Container (borders) > boxed Container > Heading H2 (eyebrow style) ; Container.tp-marquee (Overflow: Hidden) > Container.tp-marquee__track > 14 Image | `tp-marquee*`, `tp-blend` (JS clones the track; grayscale/hover/reduced-motion static row in CSS) |
| 3 About + stats | Home | Row Container > Container [eyebrow, H2, 2 Text Editor, Button.tp-link] + Container [3 × Container (hairlines) > Counter 1990→2015 / Heading "G+4" + label / Counter 0→100 "+"] | `tp-link`, `tp-stat`, `tp-measure*` |
| 4 Chairman | Home | Fog section > Row > Container.tp-frame > Image ; Container [Heading H2 (eyebrow), Text Editor (blockquote, Quote style), Container (ink start border) > 2 Heading p] | `tp-frame`, `tp-img-reveal`, `tp-quote`, `tp-measure-quote` |
| 5 Services | Home | Section head Row ; Container (top hairline) > 6 × Container row [Container as `<a>` (link to /services/#id) > Heading H3 + Text Editor ; Image] | `tp-service` ("+" that turns), `tp-service__img` (3:2) |
| 6 Why us | Home | Fog section > Row > Container.tp-frame--portrait > Image ; Container [eyebrow, H2, Container > 3 × Container.tp-plus-item > Heading H3 + Text Editor] | `tp-frame--portrait`, `tp-plus-item` |
| 7 Featured projects | Home | Section head ; 3 × Row Container (7/5, 5/7, 6/6) > 2 × Container as `<a>` (link /projects/<slug>/) > Image (height clamp) + Container [type, year] + Heading H3 + location + "View project" | `tp-card`, `tp-card__more` — static cards (no Loop Grid in Elementor Free) |
| 8 Before/after | Home | Fog section > Row > Container [eyebrow, H2, Text Editor, Container.tp-spec > 4 cells, Button.tp-link] + Container.tp-before-after > Image (after) + Image (before) | `tp-before-after*` (slider built by `taameer.js`; without JS the two images stack) |
| 9 Letters | Home | Section head ; Row (wrap) > 3 × Container.tp-lift (card) > Text Editor quote + Container (hairline) > Image (thumb) + 2 Heading p | `tp-lift`, `tp-letter__thumb` |
| 10 CTA | Home | Shortcode widget `[tp_template id="228"]` | — |

### Elementor Global Kit (Site Settings)

| Group | Values |
|---|---|
| Colours | Ink (primary) #0D0D0D · Slate (secondary) #595959 · Text #0D0D0D · Charcoal (accent) #262626 · Paper #FFFFFF · Fog #F4F4F4 · Line #D9D9D9 |
| System fonts | Headings: Playfair Display 500 · Lead: Inter 400 · Body: Inter 400 · Button (accent): Inter 500, uppercase, 0.03em |
| Custom fonts | H1, H2, H3 (Playfair 400), H4, Small, Quote (italic), Stat number, **Eyebrow / label (Inter 600, uppercase, 0.22em — kept separate from Button, D-040)**, Caption, Text link; sizes are the prototype's `clamp()` values |
| Theme style | Body = Text/Body; links Charcoal → Ink; H1–H4 = H1–H4 styles in Ink; buttons Ink fill, Charcoal hover, 2 px radius, 15/28 px padding |
| Layout | Content width 1320 px; container default padding 0 (sections carry 48/32/20 px gutters); widget gap 24 px |

Astra's global palette carries the same colours for the header and footer.

### Child theme responsibilities (`wp-theme/taameer-astra-child/`)

| File | Does |
|---|---|
| `functions.php` | Enqueues `taameer.css` / `taameer.js` (after Astra/Elementor); sets `html.tp-js` before first paint; Astra breakpoints 1023/767; registers `[tp_template id]` (renders a published Elementor saved template); menu links with a `#` are never marked current; Astra's scroll-to-ID off on Services (D-042); WP Phase 8: Arabic fonts + `taameer-ar.css` + `window.tpI18n` on Arabic pages, `[tp_lang]` switcher, same slugs in both languages (`wp_unique_post_slug` + `request`), Arabic 404 template, Polylang strings for the mobile-menu label and WPForms messages (D-045); WP Phase 9: Yoast's HTML comment and the X reading-time label removed (D-046) |
| `assets/css/taameer.css` | Sticky header and Astra header/footer polish (nav hairline, "+" menu toggle, full-screen menu fade, footer grid, icons, WhatsApp button); component classes (`tp-eyebrow`, `tp-caption`, `tp-link`, `tp-frame`, `tp-frame--portrait`, `tp-service`, `tp-plus-item`, `tp-card`, `tp-lift`, `tp-letter__thumb`, `tp-stat`, `tp-measure*`); marquee and partner grayscale; About (§5b) and Services (§5c: chip bar, anchor offset, `tp-ratio-4x3`, gallery) components; before/after slider; motion (Fade In Up retimed, `tp-split`, `tp-img-reveal` + `tp-delay-1…5`, `tp-parallax`); reduced motion; five documented overrides of Astra/Elementor defaults (root font size, Astra button font size, Full Width wrapper padding, `.e-con::before`, widget `max-width`) |
| `assets/css/taameer-ar.css` | WP Phase 8, Arabic pages only: Arabic typography (Kit variables + child-theme tokens) and the prototype's RTL exceptions (see WP Phase 8) |
| `assets/js/taameer.js` | Split headline, image wipe and parallax (IntersectionObserver), marquee clone, before/after slider (keyboard operable), counters at final value under reduced motion, Services scrollspy (`tp-scrollspy`; header height → `--tp-masthead-h`). Strings from `window.tpI18n` on Arabic pages; before/after follows the writing direction (WP Phase 8). Nothing runs inside the Elementor editor |

**Image wipes (D-039):** `tp-img-reveal` on the Image widget (hero also `tp-delay-2`); the selector carries `.elementor-element` so Elementor's widget transition rule cannot override the 1.3 s clip-path transition. Same scroll trigger as the prototype; plays once.

**Motion:** entrance = Elementor Fade In Up with delays for stagger (retimed to 1 s / 2.5 rem / ease-out in CSS); counters = Elementor Counter; split headline, image wipe, parallax, marquee, before/after = `taameer.js`. Reduced motion: everything visible at once, counters at their final values, marquee becomes a wrapped static row.

### Asset migration

- 191 original WebP images (no `-md` variants; WordPress generates its own sizes; source files not recompressed) + `taameer-plus-company-profile.pdf`, each uploaded once; option `tp_media_map` maps filename → attachment id.
- Alt text from the prototype HTML (`scripts/wp/alt-map.json`, built by `00-alt-map.py`; homepage alts first, gallery images "Title, Location — image n of m"). 4 images used nowhere in the prototype have empty alt (`contact-location-map`, `cover-tower-render`, `divider-projects`, `divider-recommendations`).
- Not uploaded: `license-taameer-plus-contracting.pdf`, `license-taameer-plus-carpentry.pdf` — JPEG images with a `.pdf` extension, rejected by WordPress (deferred, D-040; the same licences exist as `license-contracting.webp` / `license-carpentry.webp` in the library).

### Verification (WP Phase 1)

`scripts/wp/wp-check.mjs` 20/20 · `wp-reveal-check.mjs` and `wp-shots.mjs` at 320/375/390/768/1024/1280/1440 + reduced motion: no console errors, no horizontal overflow, wipes match the prototype · `wp-editor-check.mjs`: editor opens, saves, front end re-renders identically.

## Implemented — WP Phase 2 (About)

Page "About" (id 297, `https://taameer.local/about/`, option `tp_about_page_id`), built by `scripts/wp/07-about.php` (helpers copied from `05-home.php`; re-running replaces the content, same ID). Elementor Full Width template, title hidden; Astra header and footer unchanged ("About" is the current menu item). 10 sections, 116 Containers, native widgets only (Heading, Text Editor, Image, Button, Counter, Shortcode). Line lengths: Elementor Custom Width, not `tp-measure*` (D-041).

| # | Section | Native building blocks | Child-theme class / script |
|---|---|---|---|
| 1 | Page hero + breadcrumbs (fog, bottom hairline) | Section > Text Editor (breadcrumbs `nav > ol`) + Container [Heading p eyebrow, Heading H1, Text Editor lead] (Fade In Up 100/200/300 ms) | `tp-breadcrumb` markup, `tp-eyebrow` |
| 2 | Chairman's message | Row Container > Container.tp-sticky > Container.tp-frame > Image ; Container [Heading H2 (eyebrow style), Text Editor blockquote, Text Editor, Container (ink top hairline) > 2 Heading p] | `tp-sticky` (≥ 1024 px), `tp-frame`, `tp-img-reveal`, `tp-chair-lead` (opening mark), `tp-chair-body` |
| 3 | About + 2015 fact (fog) | Row 7/12 + 5/12 > [eyebrow, H2, 2 Text Editor] + Container.tp-frame (Zoom In) > Container (hairline box) > Heading label + Counter 1990→2015 + Text Editor | `tp-frame`; Zoom In retimed in `taameer.css` |
| 4 | Our aim | Section head row ; wrapping row > 4 × Container.tp-aim (top hairline) > Heading H3 + Text Editor — 4 / 2 / 1 per row | `tp-aim` ("+" on the hairline) |
| 5 | Why choose us (fog) | Same structure as Home §6, photo `project-dubai-g-residential-villa-03` | `tp-frame--portrait`, `tp-img-reveal`, `tp-parallax`, `tp-plus-item` |
| 6 | Leadership + philosophy | Section head ; wrapping row > 3 × Container [Image, Container > Heading H3 + Heading p role, Text Editor] — 3 / 2 / 1 ; Container (top hairline) > eyebrow + Text Editor | — (team members are Elementor content) |
| 7 | Team experience (fog) | Section head (note: small, slate) ; wrapping row > 4 × Container [Container > Image + Heading "Team experience" (Position: Absolute badge), Heading H3, spec Container > 2 rows] — 4 / 2 / 1; cards are not links | `tp-exp__img` (1:1) |
| 8 | Partners grid | Section head ; wrapping row (centred) > 14 × Container.tp-partner (hairline cell) > Image — 7 / 4 / 2 | `tp-partner`, `tp-partner__logo`, `tp-blend` |
| 9 | Licences (fog, CSS ID `licenses`) | Section head ; row > 2 × card Container [Image (link: media file, lightbox) ; Container > row (H3 + "Active" badge) + spec Container (6 rows 2 / 3 / 1 per line + activities) + Button "View license" → licence image] | `tp-license__preview` (3:4 crop, lift) |
| 10 | CTA band | Container (top padding: follows a fog section) > Shortcode `[tp_template id="228"]` — the same saved template as Home | — |

- **Assets:** 25 images already in the Media Library (chairman, villa-03, 3 team portraits, 4 team-experience buildings, 14 partner logos, 2 licence images); alt text from the library (= prototype). Nothing uploaded.
- **Licences (D-041):** preview + "View license" open `license-contracting.webp` / `license-carpentry.webp` (full size) in Elementor's lightbox. No PDF linked; the two licence "PDFs" stay pending (PRD 14 #12).
- **Motion:** Fade In Up with 110 ms stagger delays (aims, team, experience, partners, licences), two image wipes, one parallax, the 2015 Counter, Zoom In on the fact box. Reduced motion: everything visible, counter at 2015.
- **Verification:** `scripts/wp/wp-about-check.mjs` 26/26 (one h1, heading order, alts, images, breadcrumbs, current menu item, entrance animations, counter, wipes, sticky portrait, licence lightbox ×2, shared CTA, links, 7 widths without overflow, reduced motion, console); `wp-editor-check.mjs … 297 https://taameer.local/about/`: editor opens, saves, front end re-renders identically; homepage regression `wp-check.mjs` 20/20; see the progress log for the wipe and screenshot runs.

## Implemented — WP Phase 3 (Services)

Page "Services" (id 306, `https://taameer.local/services/`, option `tp_services_page_id`), built by `scripts/wp/08-services.php` (helpers copied from `07-about.php`; re-running replaces the content, same ID). Elementor Full Width template, title hidden; Astra header and footer unchanged ("Services" is the current menu item). 10 top-level parts, 73 Containers, native widgets only (Heading 66, Text Editor 12, Image 15, Button 8, Basic Gallery 1, Shortcode 1), no HTML widget. Decisions: D-042.

| # | Section | Native building blocks | Child-theme class / script |
|---|---|---|---|
| 1 | Page hero + breadcrumbs (fog, bottom hairline) | as About: Text Editor (breadcrumbs) + Container [Heading p eyebrow "Our expertise", Heading H1, Text Editor lead] (Fade In Up 100/200/300 ms) | `tp-breadcrumb` markup, `tp-eyebrow` |
| 2 | Service navigation (sticky chip bar) | Full-width Container > Container as `<nav>` > 6 Button widgets (`#construction` … `#turnkey`) | `tp-service-nav`, `tp-scrollspy`, `tp-chips`, `tp-chip` (sticky below the header, horizontal scroll, ink current state; scrollspy in `taameer.js`) |
| 3–8 | 6 service blocks (CSS IDs `construction`, `design-build`, `decoration-fitout`, `renovation`, `maintenance`, `turnkey`; 02/04/06 fog + `--flip`) | Section > wrapping row (row / row-reverse, gap 96 / 48) > Container 24 rem grow [Heading p "Service 0n", H2, Text Editor lead, Text Editor body, Button.tp-link] + Container 24 rem grow > Container.tp-frame > Image | `tp-service-block(--flip)` (anchor offset), `tp-frame`, `tp-img-reveal`, `tp-ratio-4x3`, `tp-link` |
| 3, 5, 6 | Related projects (Construction, Decoration & Fit-out, Renovation) | Container (top hairline) > Heading H3 (eyebrow style) + wrapping row > 3 × Container as `<a>` (/projects/<slug>/) [Container > Image (+ absolute badge row on the ongoing render), meta row, H3, location, "View project"] — 3 / 3 / 1 | `tp-card`, `tp-card__more`, `tp-ratio-4x3` |
| 9 | Wall cladding (CSS ID `wall-cladding`) | Section head row ; Basic Gallery (6 images, link: media file, one lightbox slideshow, captions = alt) | `tp-gallery` (3 / 3 / 2 per row, 4:3, hover zoom, "+" cue, staggered entrance) |
| 10 | CTA band | Container > Shortcode `[tp_template id="228"]` (follows a white section, as on Home) | — |

- **Assets:** 21 images already in the Media Library (6 service photos, 9 related-project covers, 6 wall-cladding images); alt text from the library (= prototype). Nothing uploaded. The 6 wall-cladding attachment titles were set to their alt text (lightbox captions, D-042).
- **Links:** related cards → `/projects/<slug>/`; Turnkey → `/projects/?type=construction`; Decoration & Fit-out → `#wall-cladding`. 13 later-phase URLs on the page return 404 until Projects / Testimonials / Contact exist.
- **Motion:** Fade In Up (110 ms stagger on related cards, gallery items staggered in CSS), 6 image wipes (`tp-img-reveal`, 1.3 s, prototype trigger point). Reduced motion: everything visible at once, no wipes.
- **Verification:** `scripts/wp/wp-services-check.mjs` 35/35; `wp-editor-check.mjs … 306 https://taameer.local/services/` open / save / re-render identical, stored structure unchanged after the save; see the progress log for wipes, widths, regression and screenshots (`source/screenshots/wp-phase-3/`).

## Implemented — WP Phase 4A (Projects listing)

Page "Projects" (id 312, `https://taameer.local/projects/`, option `tp_projects_page_id`), built by `scripts/wp/09-projects.php` (helpers copied from `08-services.php`; the 22 projects are embedded from `data/projects.json` in the listing order of `projects.js`; re-running replaces the content, same ID). Elementor Full Width template, title hidden; Astra header and footer unchanged ("Projects" is the current menu item). Static architecture (D-040): no CPT, no Loop Grid, no HTML widget.

| # | Section | Native building blocks | Child-theme class / script |
|---|---|---|---|
| 1 | Page hero + breadcrumbs (fog, bottom hairline) | as Services: Text Editor (breadcrumbs) + Container [Heading p eyebrow "Track record", Heading H1 "Our Projects", Text Editor lead] (Fade In Up 100/200/300 ms) | `tp-breadcrumb` markup, `tp-eyebrow` |
| 2 | Filter bar + project grid (`tp-archive`) | Heading H2 "All projects" (visually hidden) · Container (row, wrap, gap 8) > 5 Button widgets "All 22 / Construction 6 / Renovation & Decoration 10 / Fit-out 5 / Landscaping 1" (link `#`) · Container (row, wrap; 3 / 2 / 1 cards per row, gap 44 / 32 / 24) > 22 × Container as `<a>` (/projects/<slug>/) [Container > Image (4:3, + absolute badge row on the ongoing render), meta row (type, year / Ongoing), H3 title, location, "View project"] (Fade In Up, 110 ms stagger per row) | `tp-filter__bar`, `tp-filter__btn tp-filter-<type>`, `tp-filter__items`, `tp-card tp-type-<type>`, `tp-ratio-4x3`, `tp-card__more` (filter in `taameer.js`) |
| 3 | CTA band | Container > Shortcode `[tp_template id="228"]` | — |

- **Filter (class-driven, no data attributes):** a Button's class `tp-filter-<type>` selects the cards with class `tp-type-<type>`; `all` shows everything. `taameer.js` adds `role="button"` / `aria-pressed`, a polite live status ("Showing 6 projects"), Space activation, the FLIP move animation of the prototype (instant under reduced motion), `?type=<type>` in the URL (deep link, `popstate`), and removes a pending `elementor-invisible` from cards it reveals. Filtered-out cards get `tp-is-filtered` (`display: none`). Counts are the Button text (editable).
- **Content:** 22 cards = 6 Construction, 10 Renovation & Decoration, 5 Fit-out, 1 Landscaping. Order: ongoing first, then newest completion (Service Blocks & Extensions has no date: last, no year label). Wall Cladding (a showcase on Services) is not a card. The four team-experience buildings (a section on the prototype's `projects.html`) are not on this page: they stay on About (owner instruction); see Known limitations.
- **Assets:** the 22 covers were already in the Media Library (`tp_media_map`); alt text from the library. Nothing uploaded.
- **Links:** every card → `/projects/<slug>/` (all 22 built: Wadi in WP Phase 4B, the other 21 in WP Phase 4C); Services "View construction projects" → `/projects/?type=construction` now works.
- **Verification:** `scripts/wp/wp-projects-check.mjs` 40/40; `wp-editor-check.mjs … 312 https://taameer.local/projects/` open / save / re-render identical, stored structure unchanged; no wipes on this page; regression Home 20/20, About 26/26, Services 35/35, FAB 4 pages, wipes Home / About / Services.

## Implemented — WP Phase 4B (first Project Detail, reference page only)

**Only ONE project is migrated: `wadi-alshabak-villas` ("Proposed G+1 Residential Villas", first card of the listing), page id 326, `https://taameer.local/projects/wadi-alshabak-villas/`. The other 21 were built in WP Phase 4C (below).** Built by `scripts/wp/10-project-detail.php` (related cards, previous / next and spec are computed from the listing data with the prototype's rules).

- **Page:** a normal WordPress Page, child of the Projects page (312), slug = project id, so the URL is `/projects/<slug>/` with no query string; Elementor Full Width template, title hidden. Option `tp_project_page_ids` (slug → id).
- **Sections (all native; no HTML widget):**

| # | Section | Build | Classes |
|---|---|---|---|
| 1 | Hero (fog, hairline) | Text Editor breadcrumbs (Home › Projects › title, both links work) + Container [Heading p eyebrow = type, Heading H1 = title] | `tp-breadcrumb`, `tp-eyebrow` |
| 2 | Overview | Row: Container [Text Editor with a `<dl>` spec block: Type, Location, Duration, Completion ("Ongoing")] + Container `tp-frame` (max 487 px = native width, never upscaled) > Image cover | `tp-spec tp-spec--stack`, `tp-frame` |
| 3 | 3D Visualization notice (only when `isRender`) | Text Editor | `tp-render-note` |
| 4 | Gallery (fog) | Heading eyebrow + H2 "Project images" + Basic Gallery (5 images in JSON order, native lightbox slideshow, caption = alt) | `tp-masonry` |
| 5 | Previous / next | Container `<nav>` (top hairline) > 2 Container links [Heading label + Heading title]; listing order, wraps (previous of the first = Service Blocks & Extensions) | `tp-project-nav`, `tp-project-nav__link/__prev/__next/__label/__title` |
| 6 | Related projects | Eyebrow "Keep exploring" + H2 + "All projects" link Button; 3 static cards (same type, listing order, excluding this one: Al Awir villas, Dubai G villa, Abu Dhabi Marina gym), 3 / 3 / 1 per row | `tp-related`, `tp-card tp-type-<type>` |
| 7 | CTA band | Shortcode `[tp_template id="228"]` (shared) | — |

- **Not on this project (the prototype renders them only when data exists):** before/after (no `beforeImage`), related testimonial (none linked), consultant, description.
- **Child theme additions:** `taameer.css` §5e (spec `dl`, 3D notice, `tp-masonry` CSS columns over the Basic Gallery, previous/next links with arrows); `taameer.js` `projectNav()` names the previous/next landmark ("More projects"); `functions.php` marks "Projects" current in the header / mobile menu / footer on any child page of Projects (menu links are custom URLs).
- **Animations:** none added. The prototype's project page has no entrance animations (no `tp-reveal`, wipe or parallax outside the CTA); hover zoom on gallery images and related cards and the native lightbox are the interactions. Reduced motion shows everything.
- **Assets:** cover, 5 gallery images and 3 related covers were already in the Media Library; nothing uploaded. Gallery attachment titles set to the alt text (lightbox caption), as for the cladding gallery.
- **Verification:** `scripts/wp/wp-project-detail-check.mjs [slug]` 53/53; `wp-editor-check.mjs … 326 https://taameer.local/projects/wadi-alshabak-villas/ 50` open / save / re-render identical (72 → 72), stored structure hash unchanged, 0 HTML widgets.

## Implemented — WP Phase 4C (remaining project pages)

**22 / 22 project pages completed**: Wadi (4B, page 326, unchanged) + 21 built in three batches of 7, in listing order. Same build as the reference page: `scripts/wp/10-project-detail.php`, which now takes `$SLUGS` (a run prepends `$SLUGS = [...];`; default = the reference page) and carries `$DETAIL` for all 22 (generated from `data/projects.json` + `data/testimonials.json`). Normal Pages, children of Projects (312), Elementor Full Width, title hidden, ids in `tp_project_page_ids`. No CPT, no PHP template, no Loop Grid / Theme Builder, no HTML widget, no Elementor Pro.

- **Sections follow the prototype's single template (`project-page.js`) and appear only when the project has the content:**

| Section | Rule (prototype) | Projects |
|---|---|---|
| Hero description | `description` not empty | service-blocks-extensions |
| Cover, plain | landscape and ≥ 1200 px: Image (width 100 %, 2 px radius, shadow) in a Container `tp-project-cover`, width `min(100%, 80vh × ratio)` | dubai-g, kf-inc, al-warqa-4th, dubai-marina-triplex, perfume-shop, mbr-city, al-warqa-1st, atlas-copco, souk-al-bahar, beauty-lounge |
| Cover, framed | narrower than 1200 px or portrait: Container `tp-frame`, width `min(100%, native px, 80vh × ratio)` (portrait covers stay on screen) | the other 11 (portrait: jvc, al-awir, jumeirah-golf) |
| 3D Visualization notice | `isRender` | none of the 21 (Wadi only) |
| Before / after | `beforeImage`: section "Transformation / Before and after", Container `tp-before-after` > Image `tp-before-after__after` (first gallery image) + Image `tp-before-after__before` (Home's slider, `taameer.js`, keyboard operable) | abu-dhabi-marina-private-gym |
| Client feedback | testimonial with `relatedProject` = this project: fog section, eyebrow "Client feedback", Text Editor blockquote (Playfair 400, h3 size), company, author, Button link "Read the letter" → `/testimonials/#<id>` | atlas-copco-headquarters (Atlas Copco), beauty-lounge-spa-mirdif (Bella Cure) |
| Related projects | up to 3 of the same type; none → section omitted (the prototype hides it) | omitted on jumeirah-golf-estates-landscaping (only landscaping project) |
| Gallery, prev / next, CTA | every project; gallery in JSON order (4–11 images), prev / next in listing order wrapping at both ends | all |

| Batch | Pages (id) |
|---|---|
| 1 | jvc-residential-retail-building 339, palm-jumeirah-villa 342, al-awir-villas 345, dubai-g-residential-villa 348, abu-dhabi-marina-private-gym 351, kf-inc-headquarters 354, al-warqa-4th-villa 357 |
| 2 | dubai-marina-triplex-villa 369, perfume-shop-al-barsha 372, mbr-city-villa 375, al-warqa-1st-g2-villa 378, faiz-couture-dress-shop 381, atlas-copco-headquarters 384, al-twar-villa 387 |
| 3 | souk-al-bahar-apartment 399, um-nahad-villa 402, beauty-lounge-spa-mirdif 405, thai-restaurant-deira 408, jumeirah-golf-estates-landscaping 411, damac-hills-villa 414, service-blocks-extensions 417 |

- **Widgets on the 22 pages:** Container 617, Heading 551, Image 87, Text Editor 48, Button 23, Basic Gallery 22, Shortcode 22 (the shared CTA only); HTML 0.
- **Child theme:** one rule added, `taameer.css` `.tp-project-letter blockquote { font-size: inherit; }` (Astra sizes `blockquote` at 1.1em; same fix as Home's chairman quote). No JS change.
- **Animations:** none added (the prototype's project page has none); before/after slider, gallery hover zoom and the native lightbox are the interactions; reduced motion shows everything.
- **Assets:** all 152 project images were already in the Media Library; nothing uploaded, no duplicates. Gallery attachment titles set to their alt text (lightbox captions), as in 4B.
- **Verification:** `wp-project-detail-check.mjs <slug,slug,…>` (sections derived from the data; slugs run one after another): batch 1 393/393, batch 2 393/393, batch 3 391/391, reference 56/56. Editor open / save / re-render identical on 9 pages (gym, jvc, al-warqa-4th; atlas, faiz, mbr; beauty, jumeirah-golf, service-blocks), stored structure of all 22 unchanged by the saves. All 22 project URLs return 200 and are linked from the listing and the detail pages.

## Implemented — WP Phase 5 (Testimonials)

Page **Testimonials**, id **435**, `https://taameer.local/testimonials/` (option `tp_testimonials_page_id`), built by `scripts/wp/11-testimonials.php` from `testimonials.html` + `data/testimonials.json`. Normal Page, Elementor Full Width, title hidden. Elementor Containers + native widgets: Container 20, Heading 23, Text Editor 5, Image 4, Button 2, Shortcode 1 (the shared CTA); **HTML 0**; no Elementor Pro, CPT, Loop Grid or Theme Builder.

| Section | Elementor | Notes |
|---|---|---|
| 1 Page hero | Fog section (as About): Text Editor breadcrumbs (Home › Testimonials), Heading eyebrow `tp-eyebrow` "Client endorsements", H1 "Letters of appreciation", Text Editor lead; Fade In Up 100 / 200 / 300 ms | Prototype `tp-reveal tp-delay-1…3` |
| 2 Letters (`tp-letters-page`) | Container (gap 128 px) > 4 × Container `<article>` `tp-letter-entry`, **CSS ID = testimonial id**, row (2nd and 4th `row-reverse`), wrap, gap 64 px, Fade In Up | Order = `order` 1–4 |
| — sheet | Container `<a>` `tp-letter-sheet` → full letter image (Elementor global lightbox), width `min(100%, 26rem)`, paper, 1 px line border, 2 px radius, large shadow, overflow hidden > Image (size large, srcset) + Heading `tp-letter-sheet__zoom` "View original letter" (absolute, 16 px from the foot, paper label, ink on hover / focus) | `taameer.js` `letterSheets()` sets one slideshow group (`data-elementor-lightbox-slideshow="tp-letters"`) and `aria-label` "Open the original letter from …" |
| — text | Container width `min(100%, 22rem)`, grow (= prototype `flex: 1 1 22rem`): eyebrow "Letter of appreciation", H2 company, date (eyebrow style, slate), Text Editor `<blockquote>` excerpt in “ ” (Playfair 400, h3 size, max 38rem), by-line Container (hairline top, author Inter 600 + role small slate), Button `tp-link` "View the project: …" → `/projects/<relatedProject>/` | Fields omitted where the data has none (TODAY: no project; Jan’s Noodles: company + letter only) |
| 3 CTA | Shortcode `[tp_template id="228"]` | Shared band, unchanged |

- **Anchors:** `#atlas-copco`, `#bella-cure`, `#today-engineering`, `#jans-noodles` (stable CSS IDs on the article Containers, not generated IDs). The two project pages' "Read the letter" links (`/projects/atlas-copco-headquarters/` → `#atlas-copco`, `/projects/beauty-lounge-spa-mirdif/` → `#bella-cure`) now resolve; no project page changed. Landing: `html` scroll-padding (header + 1rem) + `.tp-letter-entry { scroll-margin-block-start: 4rem }` as the prototype; Astra's scroll-to-ID (which ignores the sticky header and also handles the hash on load) is off on Testimonials as on Services (`functions.php`).
- **Layout:** the row wraps exactly like the prototype (side by side when the content is ≥ 832 px, i.e. viewport ≳ 900 px; below, sheet above text, flipped letters' sheets end-aligned at tablet, full width on phones). Measured at 375 / 768 / 1280: sheet, text column, excerpt width and letter rows within 1–8 px of the static page.
- **Child theme:** `taameer.css` §5f (scroll margin, blockquote size, label "+" icon and hover fill, start-aligned wrapping project link); `taameer.js` `letterSheets()`; `functions.php` scroll-to-ID exception extended to this page.
- **Assets:** the four letter images were already in the Media Library (ids 21–24); nothing uploaded. Alt texts are the library ones (see Known limitations).
- **Verification:** `scripts/wp/wp-testimonials-check.mjs` 49/49; `wp-editor-check.mjs … 435 https://taameer.local/testimonials/ 40` open / save / re-render identical (63 → 63), 0 editor errors.

## Implemented — WP Phase 6 (Contact)

Page **Contact**, id **449**, `https://taameer.local/contact/` (option `tp_contact_page_id`), built by `scripts/wp/12-contact.php` from `contact.html`. Normal Page, Elementor Full Width, title hidden. Elementor Containers + native widgets: Container 11, Heading 8, Text Editor 4, WPForms 1, Button 1, Shortcode 1 (the shared CTA); **HTML 0**; no Elementor Pro, CPT, Loop Grid or Theme Builder.

| Section | Elementor | Notes |
|---|---|---|
| 1 Page hero | Fog section (as Testimonials): Text Editor breadcrumbs (Home › Contact), eyebrow "Contact us", H1 "Get in touch with our team", Text Editor lead; Fade In Up 100 / 200 / 300 ms | Prototype `tp-reveal tp-delay-1…3` |
| 2 Details + form (`tp-contact`) | Row Container, wrap, gap 41 / 32 / 24 > `tp-contact-info` (width `min(100%, 20rem)`, grow 5) + `tp-contact-formcol` (width `min(100%, 24rem)`, grow 7) = the prototype's `tp-col--5` / `tp-col--7` flex-basis: side by side from ~810 px, stacked below | Fade In Up on eyebrows, H2s, spec and form |
| — details | eyebrow "Contact details", H2 "Head office", Text Editor `<dl>` `tp-spec tp-spec--stack` (project-page spec style): Address (`<address>`), Office `tel:+97143290500`, Mobile `tel:+971503029281`, Email `mailto:info@taameer.ae`, WhatsApp `https://wa.me/971503029281`, Instagram `https://instagram.com/taameer_contracting` (both new tab, `rel=noopener`, hidden "(opens in a new tab)") | Values exactly as the prototype |
| — form | eyebrow "Send a message", H2 "Tell us about your project", **WPForms widget** (form 446, description shown, title hidden) with its own Style controls: field radius 2, border Line, text Ink, label Ink, error Ink, button Ink / white, radius 2 | `tp-contact-form` class for the scoped CSS |
| 3 Location (`tp-location-section`) | Fog section > `tp-location` Container (paper, hairline, radius 2, padding 64, row wrap, gap 32): empty Container `tp-location__mark` (56 px "+", CSS mask), text Container (eyebrow "Find us", H2 "Visit our office", Lead-style address in Text colour), Button "Open in Google Maps" → `https://www.google.com/maps/search/?api=1&query=Sky+Business+Building+Festival+City+Dubai+UAE` (new tab) | No embedded map (as the prototype) |
| 4 CTA | Shortcode `[tp_template id="228"]` | Shared band, unchanged |

**WPForms form "Contact" (id 446, option `tp_contact_form_id`, WPForms Lite 2.0.2.1):**

| # | Field (WPForms type) | Required | Notes |
|---|---|---|---|
| 1 | Full name (Name, simple format) | yes | |
| 2 | Email address (Email) | yes | `type=email` |
| 3 | Phone number (Single Line Text) | no | Lite has no Phone field |
| 4 | Project type (Dropdown) | no | placeholder "Select a service" + Construction, Design & Build, Decoration & Fit-out, Renovation, Maintenance, Turnkey Projects, Other |
| 5 | Message (Paragraph Text) | yes | 6 lines tall (prototype `rows="6"`) |

- Form description "Fields marked * are required." (shown above the button by CSS order), submit "Send message" / "Sending…", AJAX submit, honeypot on + WPForms modern anti-spam (`antispam_v3`; WPForms also adds its own hidden decoy field), no entries stored (Lite).
- **Validation** (WPForms jQuery Validate, client side + server side): errors under each field, `role="alert"`, linked with `aria-errormessage` / `aria-describedby`, `aria-invalid` on the field, focus to the first invalid field, values kept. Global WPForms messages (Settings → Validation): required "Please fill in this field.", email "Please enter a valid email address, for example name@example.com." (prototype wording).
- **Success:** WPForms replaces the form with the confirmation message (`<h3>Thank you for your message</h3>` + the prototype's text), styled as the prototype's success panel; `taameer.js` `contactConfirmation()` gives it `role="status"` + `tabindex="-1"` and focuses it (WPForms leaves focus on the removed button).
- **Notification:** "Website enquiry": To `{admin_email}`, From name = site name, From `{admin_email}`, Reply-To = the visitor's email, subject `New enquiry from {field_id="1"} — taameer.ae`, body `{all_fields}`. Locally `{admin_email}` is `dev-email@wpengine.local` and PHP mails go to Local's Mailpit (SMTP `localhost:10007`, web/API `http://localhost:10006`); nothing leaves the machine. **At go-live** the recipient must be set to the client's inbox (e.g. `info@taameer.ae`) and real SMTP configured.
- **Child theme:** `taameer.css` §5g (details links, address margin, form layout order, labels, fields, hover / focus / invalid states, error "+" prefix, full-width Kit-style button, confirmation panel, location "+" mark) — every rule scoped to `.tp-contact-info`, `.tp-contact-form` or `.tp-location__mark`, which exist only on this page; `taameer.js` `contactConfirmation()` (no-op on pages without `.tp-contact-form`). `functions.php` unchanged.
- **Verification:** `scripts/wp/wp-contact-check.mjs` 57/57 (content, links, fields, labels, required, options, honeypot, note, button; empty submit, invalid email, error cleared, values kept; keyboard-only submission with focused confirmation; Mailpit delivery, subject, From / To / Reply-To and body; filled honeypot → no email; layout and 0 overflow at 7 widths; reduced motion; 0 console errors). `wp-editor-check.mjs … 449 https://taameer.local/contact/ 20`: editor opens with the WPForms widget, Update saves, 34 → 34 elements, 0 editor errors; stored element tree, widget settings and the 10 responsive settings identical before / after the save.

## Implemented — WP Phase 7 (404)

**Elementor saved template "404 page"**, id **460** (Templates → Saved Templates, type Container, option `tp_404_template_id`), built by `scripts/wp/13-404.php` from `404.html`. Elementor Free has no Theme Builder, so `functions.php` prints the template on not-found requests in place of Astra's 404 content (D-044). Containers + native widgets: Container 17, Heading 19, Text Editor 2, Button 2, Image 3 (44 elements); **HTML 0**; no Elementor Pro, CPT, Loop Grid or PHP layout.

| Section | Elementor | Notes |
|---|---|---|
| Message (`tp-404` section, 128 / 96 / 72 px padding) | Row Container (wrap, centred, gap 64, 96 px below) > `tp-404-code` Container (fit-content): Text Editor `<p aria-hidden="true">404</p>` (Playfair 500, `clamp(6rem, 3rem + 14vw, 14rem)`, line height 1.05, −0.01em, end padding 0.3em) + empty 40 × 40 Container `tp-location__mark` (the existing "+" mask rule) absolutely placed at the top end (`calc(0.1 × font size)`); text Container (width `min(100%, 22rem)`, grow, gap 24): eyebrow "Page not found", H1 "We could not find that page" (16ch cap), Lead "The page may have moved…" (Text colour), buttons "Back to home" → `/` (Kit) and "View projects" → `/projects/` (outline) | "404" beside the text from ~1000 px, stacked below, as the prototype's flex-wrap |
| Featured projects | Container with top hairline, 64 px above: eyebrow "Featured projects" + H2 "Or explore our work" (no gap, 64 px below), row of 3 static cards (project-page related-card build, 3 / 3 / 1 per row, gap 44 / 32 / 24) | Prototype rule (projects.js: featured, listing order, first 3): palm-jumeirah-villa, dubai-g-residential-villa, kf-inc-headquarters. Updated by hand, like Home's featured cards |

- **No CTA band** and no breadcrumbs (the prototype ends on the projects); **no entrance animations** (the prototype's 404 has none).
- **Theme hook (`functions.php`):** on `is_404()` with the template published: Astra content layout `page-builder` (full width, no sidebar, like the Elementor pages), the template's CSS enqueued in the head, `astra_404_content_template` replaced by `[tp_template id="460"]`; `wp_robots` adds `noindex` on 404s (prototype `<meta name="robots" content="noindex">`). The response status stays 404. If the template is deleted or unpublished, Astra's default 404 returns. `taameer.css` / `taameer.js` unchanged.
- **Editing:** Templates → Saved Templates → "404 page" → Edit with Elementor.
- **Verification:** `scripts/wp/wp-404-check.mjs` 41/41 (404 status on 4 not-found URLs incl. `/projects/<unknown>/` and `?p=<unknown>`, noindex, title, template once + Astra default gone, full width, no HTML widget, one h1, heading order, copy, aria-hidden "404" + "+" mark position, buttons + targets 200, 3 cards (link, title, location, type, year, cover, alt) + targets 200, no CTA, sticky header with no current item, footer + WhatsApp, keyboard focus on both buttons, layout + 0 overflow at 320 / 375 / 390 / 768 / 1024 / 1280 / 1440, reduced motion, no entrance animations, 0 console errors apart from the document's own 404). Static vs WP at 375 / 1280: same layout; vertical positions within 6–8 px (fixed vs fluid section padding, as on every page). `wp-editor-check.mjs … 460 https://taameer.local/<missing>/ 30`: opens, saves, 44 → 44, 0 editor errors; afterwards only 6 default-valued settings were dropped by Elementor and the 404 check is still 41/41 with identical positions. Home regression `wp-check.mjs` 20/20 (functions.php changed). Screenshots `source/screenshots/wp-phase-7/`.

## Implemented — WP Phase 8 (Arabic + Polylang)

Decision record: **D-045**. Build: `scripts/wp/14-arabic.py` (driver) + `ar_elementor.py` (conversion) + `14-arabic-export.php` (read only) + `14-arabic-import.php` (writes); re-running updates every Arabic post in place (same ids). Check: `scripts/wp/wp-ar-check.mjs`.

### Polylang configuration

| Setting | Value |
|---|---|
| Plugin | Polylang (free) 3.8.10 — nothing else added |
| Languages | English `en` (en_US, default, flag gb) · Arabic `ar` (locale `ar`, RTL, flag ae); WordPress Arabic core language pack installed |
| URLs | Language set from the directory: English without prefix (`hide_default`), Arabic `/ar/…` (`force_lang` 1, `rewrite` on: no `/language/`); `redirect_lang` on: the Arabic home is `/ar/` (`/ar/home/` 301 → `/ar/`); browser language detection off |
| Content | Pages and posts; **media translatable** (192 Arabic attachment copies: same files, Arabic alt / title / caption); no custom post types or taxonomies; Elementor saved templates are not translated (the Kit is one) |
| Menus | Polylang menu locations: Primary and Mobile → "Main navigation" (en) / "Main navigation — العربية" (ar, id 237) |
| Widgets | Footer: English widgets set to English (`pll_lang`), Arabic copies `block-102`, `nav_menu-102` ("Footer: Quick links — العربية", 235), `nav_menu-103` ("Footer: Services — العربية", 236), `block-103` |
| Strings (Languages → Translations, Arabic) | Astra (from its `wpml-config.xml`): header Button text "Get a Quote" → «اطلب عرض سعر», its link `/contact/` → `/ar/contact/`, HTML 2 (mobile menu phone / email), footer HTML 2 (WhatsApp button label), copyright; site title / tagline; group "Taameer theme": "Menu", slider labels, "Services on this page", filter status (4 Arabic number forms), "More projects", "Open the original letter from {company}", WPForms required / email messages |

### Language mapping (English id → Arabic id, same slug)

| Page | EN | AR | Arabic URL |
|---|---|---|---|
| Home (front page) | 208 | 661 | `/ar/` |
| About | 297 | 665 | `/ar/about/` |
| Services | 306 | 669 | `/ar/services/` |
| Projects | 312 | 673 | `/ar/projects/` |
| 22 project pages | 326–417 | 677–761 | `/ar/projects/<slug>/`, children of 673 |
| Testimonials | 435 | 765 | `/ar/testimonials/` |
| Contact | 449 | 769 | `/ar/contact/` |
| CTA band (saved template) | 228 | 659 "CTA band (site-wide) — العربية" | `[tp_template id="659"]` on Arabic pages |
| 404 page (saved template) | 460 | 660 "404 page — العربية" (option `tp_404_template_id_ar`) | any `/ar/…` not-found URL |
| WPForms Contact | 446 | 656 "Contact (العربية)" (option `tp_contact_form_id_ar`) | on `/ar/contact/` |

Project pages (EN → AR): wadi-alshabak-villas 326 → 761, jvc-residential-retail-building 339 → 725, palm-jumeirah-villa 342 → 737, al-awir-villas 345 → 681, dubai-g-residential-villa 348 → 709, abu-dhabi-marina-private-gym 351 → 677, kf-inc-headquarters 354 → 729, al-warqa-4th-villa 357 → 693, dubai-marina-triplex-villa 369 → 713, perfume-shop-al-barsha 372 → 741, mbr-city-villa 375 → 733, al-warqa-1st-g2-villa 378 → 689, faiz-couture-dress-shop 381 → 717, atlas-copco-headquarters 384 → 697, al-twar-villa 387 → 685, souk-al-bahar-apartment 399 → 749, um-nahad-villa 402 → 757, beauty-lounge-spa-mirdif 405 → 701, thai-restaurant-deira 408 → 753, jumeirah-golf-estates-landscaping 411 → 721, damac-hills-villa 414 → 705, service-blocks-extensions 417 → 745.

### Arabic page architecture

- **Generated from the English Elementor data** (`14-arabic.py`): same Containers, widgets (Heading, Text Editor, Image, Button, Basic Gallery, Counter, Shortcode, WPForms), classes, CSS IDs (anchors such as `#construction`, `#atlas-copco` are unchanged), responsive settings and entrance animations. No HTML widget, no Elementor Pro, no CPT. Normal Pages, Elementor Full Width, title hidden, editable with Elementor.
- **Wording** = the static `ar/` pages: every text node is looked up in the prototype's translation memory (`scripts/ar_text.py`, `scripts/ar_data.py`, as `build_ar.py`), plus strings derived from the data the same way the prototype's JS does (months «سبتمبر 2024», filter counts «الإنشاءات 6», letter by-lines, gallery alt «… — الصورة i من n»). The dry run (`14-arabic.py --dry`) lists any English string without Arabic: none.
- **Prototype details reproduced:** Latin runs and phone numbers in `<bdi>`; `dir="ltr"` on tel / mailto / WhatsApp / Instagram links; «…» around letter excerpts and the chairman's words; the label «ترجمة عن الأصل الإنجليزي» under each translated letter excerpt (Home, Testimonials, project letters; class `tp-translated`).
- **Links:** internal URLs get `/ar/` (`/projects/?type=construction` → `/ar/projects/?type=construction`, `/testimonials/#bella-cure` → `/ar/testimonials/#bella-cure`); media, tel, mailto and external links unchanged.
- **Header / footer:** Astra's (one builder for both languages); the language switcher is `[tp_lang]` in Header HTML 1, Header HTML 2 (mobile menu) and Footer HTML 1 (English shows «EN | عربي», Arabic «عربي | English», as the prototype); menus, footer widgets and texts per language as above. The English header / footer look unchanged; the «عربي» item is now a link.

### RTL and Arabic typography (`wp-theme/taameer-astra-child/assets/css/taameer-ar.css`, Arabic pages only)

| Topic | Implementation |
|---|---|
| Direction | `<html lang="ar" dir="rtl">` and `body.rtl` from Polylang's Arabic locale; Astra and Elementor load their RTL styles; the child theme's logical properties mirror rows, "+" marks, frames, chips, cards and spec blocks |
| Physical values | The 15 asymmetric paddings / margins / borders in the English data are swapped in the Arabic data (e.g. the 404 "404" end padding, Home chairman hairline) |
| Prototype `[dir="rtl"]` exceptions | Image wipe opens from the right (`inset(0 0 0 100%)`); before/after clip from the inline start and handle `translateX(50%)`; marquee keyframes `tp-marquee-rtl`; arrows of `tp-link`, `tp-card__more`, previous / next mirrored; menu underline grows from the right; chairman's opening mark «; tel / mailto Button text isolated LTR |
| Fonts | El Messiri 500 + IBM Plex Sans Arabic 400/500/600 (Google Fonts, Arabic pages only, as the prototype, D-034) |
| Global Kit | Arabic values through the Kit's CSS variables (`--e-global-typography-<id>-…`): display styles (Headings, H1–H4, Quote, Stat) El Messiri 500; Lead, Body, Small, Button, Eyebrow, Caption, Text link IBM Plex Sans Arabic; letter-spacing 0, no uppercase, quote not italic; line heights H1 1.35, headings / eyebrow 1.4, text 1.85; xs / sm / base / lg sizes +8 % (prototype tokens) |
| Per-widget fonts | Rewritten in the Arabic page data (Playfair → El Messiri 500, Inter → IBM Plex Sans Arabic, same rules), so the Elementor editor shows the Arabic settings |
| Child-theme components | `--tp-font-*`, tracking tokens and the fixed English line heights (menu, switcher, breadcrumbs, spec, footer, form) given their Arabic values; one rule removes tracking / uppercase from every element on Arabic pages (Arabic letters must join) |
| Scripts (`taameer.js`, shared) | Strings from `window.tpI18n` (Polylang, Arabic pages only); before/after pointer and arrow keys follow the visual direction in RTL (prototype `interactions.js`); filter status uses the Arabic number forms (1 / 2 / 3–10 / 11+) |

### Contact (Arabic)

WPForms form 656 = form 446 with Arabic labels, options, placeholder «اختر خدمة», note «الحقول المميزة بعلامة * مطلوبة.», button «إرسال الرسالة» / «جارٍ الإرسال…», confirmation «شكراً لرسالتك …» (prototype text); same fields, AJAX, honeypot + modern anti-spam; notification to `{admin_email}` with subject "New enquiry (Arabic site) from {name} — taameer.ae" (no production SMTP in this phase). Validation messages are WPForms global settings, translated for Arabic pages by `functions.php` (`wpforms_frontend_strings` + Polylang strings): «يرجى تعبئة هذا الحقل.», «يرجى إدخال عنوان بريد إلكتروني صحيح، مثل name@example.com.». The English form is unchanged.

### 404 (Arabic)

`/ar/<anything missing>/` → real 404 status, `noindex`, Arabic template 660 (RTL, «لم نعثر على هذه الصفحة», buttons to `/ar/` and `/ar/projects/`, the 3 featured cards to `/ar/projects/<slug>/`). The switcher on a 404 links to the same path in the other language (another 404). English 404 unchanged.

### SEO — titles and descriptions (WP Phase 9, Batch C1)

Yoast SEO free 28.6 (D-046). Per page (Edit page → Yoast SEO): the SEO title and meta description from `scripts/wp/seo-meta.json` (the prototype's `<head>`, generated by `15-seo-meta.mjs`), written by `15-seo.php`. Titles use Yoast variables: `<page> %%sep%% %%sitename%%`, Home `%%sitename%% %%sep%% %%sitedesc%%`. An empty title field means Yoast's page template `%%title%% %%page%% %%sep%% %%sitename%%` (42 pages); 14 pages have an explicit title (Home, and pages whose prototype title differs from the WordPress page title, including the shared project names with ", <location>"). Separator "—" (Yoast SEO → Settings → Site basics). Arabic 404 title: Languages → Translations (Polylang, group `wordpress-seo`). Canonical = Yoast (self), hreflang = Polylang, sitemap `/sitemap_index.xml` (in robots.txt). Check: `scripts/wp/wp-seo-check.mjs` (plain HTTP).

### SEO — social metadata (WP Phase 9, Batch C2)

Yoast SEO free prints Open Graph + X card on the 56 pages. og:title / og:description fall back to the C1 SEO title / description (Yoast's social title / description fields stay empty); og:url = canonical; og:locale `en_US` / `ar_AR`; `twitter:card` `summary_large_image` (X uses the og:image). The social image is set per page in Yoast's field (Edit page → Yoast → Social) by `scripts/wp/15-seo-social.php` from `seo-meta.json` → `og_image` (= the prototype page's og:image, read by `15-seo-meta.mjs`); Arabic pages use the Arabic media translation of the same file. The X "Est. reading time" label is removed by one filter in `functions.php` (`wpseo_enhanced_slack_data`).

| Page (EN and AR) | Social image |
|---|---|
| Home, Projects, Contact | `project-dubai-g-residential-villa-02.webp` (1200 × 800) |
| About | `chairman-fahim-al-ali.webp` (706 × 831) |
| Services | `project-kf-inc-headquarters-05.webp` (1200 × 802) |
| Testimonials | `letter-atlas-copco.webp` (1813 × 2309; the prototype names its 900 px `-md` copy, which is not in the Media Library) |
| Each project page | its cover from `projects.json` (`project-<slug>-01.webp`, palm-jumeirah-villa `-02`) |

## Planned

| Page / item | Planned approach | Notes |
|---|---|---|
| SEO, further batches | Yoast SEO free (D-046); one batch at a time with the owner's approval | Open items: Known limitations → SEO |
| Final cleanup | Remove WordPress starter content (Hello world, Sample Page, Privacy Policy draft, empty "Elementor #" drafts) | Deferred, D-040. Done 2026-10-11: Hello world (post 1) and Sample Page (page 2) moved to Trash (not deleted); their URLs answer 404, the sitemap index lists only `page-sitemap.xml`, `/author/taameer/` is noindex (Yoast default for authors without posts). Left: Privacy Policy draft, "Elementor #" drafts, emptying the Trash |

## Known limitations

- **Arabic (WP Phase 8):**
  - **Re-running `14-arabic.py` regenerates the Arabic pages from the English ones** and overwrites manual Elementor edits made to Arabic pages (and the Arabic menus, footer widgets, form and string translations it writes). Once the client edits Arabic content in WordPress, edit both languages by hand (or extend the script) instead of re-running it.
  - Arabic copy is the prototype's (`ar/`) and still needs the client's approval (PRD; `docs/ar-copy-review.md`). Three Arabic strings exist only in WordPress (the prototype had no equivalent): the form's sending state «جارٍ الإرسال…», WPForms' no-JavaScript notice «يرجى تفعيل JavaScript في متصفحك لإكمال هذا النموذج.», and the notification subject (English, "New enquiry (Arabic site) from …", for the office).
  - Same differences as the English pages (fixed vs fluid section padding, shared CTA band, Projects listing without the team-experience section, static featured / related cards, Contact form limitations, title separator "–" and no meta description until the SEO phase).
  - One Global Kit: the Arabic fonts in Site Settings → Global Fonts are not visible (they are overridden for Arabic in `taameer-ar.css`); per-widget fonts on Arabic pages show El Messiri / IBM Plex Sans Arabic in the editor.
  - Media are translatable: each image has an English and an Arabic attachment (same file). Alt text / captions are edited per language (Media Library language filter). Ten images keep the descriptive alt text they have on Home / Services (as in English), translated.
  - The Arabic pages load the English Google fonts as well (Astra / Kit) besides El Messiri and IBM Plex Sans Arabic; Latin runs inside Arabic text use IBM Plex Sans Arabic's Latin glyphs, as the prototype.
  - Astra Free has one header and footer for both languages: per-language content comes from Polylang (menus, widgets, string translations of the Astra elements); the WhatsApp button sits at the right edge in both languages, as the prototype (`dir="ltr"` on the link).
  - On a 404 the switcher links to the same path in the other language (which is also a 404), not to the home page.

- Project detail (all 22 pages): section padding is the fixed 128 / 96 / 72 px of the other pages (prototype fluid 121.6 px at 1280), so pages are about 1–2 % taller; related cards and previous/next are 8–26 px taller than the prototype (Kit line heights, same as the listing cards); the cover's alt is the library alt ("title, location — image 1 of n" or a descriptive alt) instead of "title, location"; tablet 768–1023 px stacks the spec above the cover (prototype side by side from about 800 px).
- Project galleries: 10 images keep the descriptive alt text they carry on Home / Services (one attachment has one alt in WordPress) instead of the prototype's "title, location — image i of n": palm-jumeirah-villa-02, dubai-g-residential-villa-02 / 03 / 05, kf-inc-headquarters-05, dubai-marina-triplex-villa-04, atlas-copco-headquarters-03, al-warqa-1st-g2-villa-06, al-awir-villas-02, abu-dhabi-marina-private-gym-01; the gym's before/after images likewise use the library alts ("After: the completed gym…", "Before: the same structure during construction").
- Testimonials: the letter images keep their library alt ("Letter of appreciation from Atlas Copco (thumbnail)" etc., written for Home's thumbnails; one attachment has one alt) instead of the prototype's "Original letter of appreciation from …"; the sheet links are named by `taameer.js` ("Open the original letter from …") as in the prototype. The date is a Heading `<p>`, not `<time datetime>`, and the letters section has no `aria-label` (Elementor Free has no custom attributes). The lightbox is Elementor's (no caption), not the prototype's.
- Contact (WP Phase 6): required-field errors use one WPForms message ("Please fill in this field.") instead of the prototype's per-field wording ("Please enter your full name."), and there is no "Please correct N fields below." summary (WPForms Lite has neither); Phone is a single-line text field (`type=text`, no Phone field in Lite) and the fields carry no `autocomplete` hints; "Select a service" is a disabled placeholder (cannot be chosen back once a type is picked); the required note is plain text (screen readers read "star"; the prototype said "with an asterisk"); the form has no accessible name (prototype: `aria-labelledby` the H2); the dropdown arrow is WPForms' chevron; spam protection is WPForms' honeypot + decoy field + modern anti-spam token instead of the single prototype honeypot (a filled honeypot sends no email; the visitor sees WPForms' response, not the success panel); a real submission is sent (the prototype sent nothing) and takes a few seconds locally with "Sending…" on the button; the submit button uses the Kit button weight 500 (prototype 600) and is 2 px shorter; the validation messages are global WPForms settings (any later WPForms form shares them); notification recipient is the WordPress admin email until go-live.
- 404 (WP Phase 7): the browser title is Yoast's "Page not found — Taameer…" since WP Phase 9 C1 (Arabic «الصفحة غير موجودة — …»); there is no meta description, canonical or social image (noindex page; Yoast prints only `og:locale`, `og:title`, `og:site_name`); the "404" figure's end padding is physical (right) in the English template (the Arabic copy has it on the left, WP Phase 8); section padding is the fixed 128 / 96 / 72 px of every page (6–8 px lower than the prototype at 375 / 1280); the "+" reuses Contact's `tp-location__mark` class (same drawing, no new CSS); the featured cards are static (update by hand if the featured projects change); in the editor the template is shown without header / footer.
- SEO titles / descriptions (WP Phase 9, C1): 47 of the 56 descriptions are longer than 160 characters (max 236) and 34 titles longer than 60, kept verbatim from the prototype (search engines truncate). Since the starter-content cleanup (2026-10-11) the author archive `/author/taameer/` is noindex and out of the sitemap; the empty Uncategorized archives (`/category/uncategorized/`, `/ar/category/uncategorized-ar/`; WordPress cannot delete the default category) still answer 200 ("Nothing found", not in the sitemap or linked), but since D-047 are `noindex, follow` through a child-theme `wpseo_robots_array` filter (empty category archives only; a category with posts stays indexable; no Yoast setting changed). Category feeds still answer 200. Re-running `14-arabic.py` neither copies nor clears Yoast fields (its export copies only the page template, Elementor settings and non-underscore meta; by code reading, not tested); new Arabic page ids would need `15-seo.php` and `15-seo-social.php` re-run (they resolve pages by path).
- Social metadata (WP Phase 9, C2): `og:type` is Yoast's `article` on every page except Home (`website`) and `og:locale` for Arabic is `ar_AR` (prototype `website` / `ar_AE`; `ar_AR` is the Arabic locale Facebook recognises); 11 social images are smaller than the 1200 × 630 card recommendation (chairman portrait and 10 project covers: wadi-alshabak, palm-jumeirah, al-awir, gym, al-twar, faiz-couture, um-nahad, thai-restaurant, damac-hills, service-blocks), so some platforms may show a small card or crop; portrait images (About, Testimonials, al-awir, jvc, jumeirah-golf) are cropped by the platforms. The JSON-LD `primaryImageOfPage` still names the page's first content image (unchanged by C2), not the social image. The 404 pages carry only Yoast's minimal `og:locale` / `og:title` / `og:site_name` (no image, description or URL; noindex).
- Links to `/contact/` resolve since WP Phase 6 (`/testimonials/` since WP Phase 5). Earlier counts (13 URLs on Services; Home and About had 17 and 10 including `/services/…`, which exists since WP Phase 3; `/about/` since WP Phase 2).
- Services: related project cards are static (updated by hand); the chip bar's `aria-label` ("Services on this page", Arabic «الخدمات في هذه الصفحة» since WP Phase 8) is set by `taameer.js` (Elementor Free has no custom attributes); anchor scrolling on Services is native (Astra's scroll-to-ID is off on that page only, D-042).
- The shared CTA band renders the same on every page but differs from the prototype's (heading on one line, shorter box at ≥ 768 px); identical to the approved homepage, so not changed in the Services phase.
- The `tp-measure*` classes on the homepage have no effect (Elementor's `max-width: 100%` on Container widgets outranks them); About uses native Custom Width instead (D-041). Homepage left unchanged pending an owner decision.
- Floating controls: Astra's scroll-to-top sits 12 px above the WhatsApp button (`taameer.css` §4; fixed after WP Phase 2, they used to overlap). At ≥ 1024 px, scrolled to the very bottom, the WhatsApp button covers the footer's "عربي" link, as in the prototype.
- About: the licence buttons open the licence image, not a PDF (pending client PDFs, D-041). Compact spec rows are a few px shorter than the prototype (Kit eyebrow line-height 1.15 vs the prototype's 1.7 on `dt`; same as the homepage spec). Aims show 4 per row from 1024 px (the prototype wraps 3 + 1 between 1024 and ~1100 px); team experience is 1 per row below 768 px (prototype: 2 from 640 px).
- Featured projects on the homepage are static cards; they are updated by hand (no Loop Grid).
- Contact details are repeated in the Astra header/footer elements, footer widgets and Elementor content (no single shared source in Astra Free + Elementor Free).
- Animations are front-end only (not in the Elementor editor); image wipes play once, like the prototype.
- Saving from the Elementor editor drops default-valued settings from the stored data (no visual change).

## Historical — Elementor v4 Atomic build sheet (superseded by D-038)

Kept as the per-section content reference for the remaining pages. Its Atomic trees, global variables/classes, E1–E3 exceptions, `archive-project.php` / `single-project.php` and REPORT items describe the superseded plan and are **not** the approved architecture.

Replaces `docs/elementor-mapping.md` (v3-era custom widgets). Source of truth: PRD v1.5 sections 8.2–8.3 and CLAUDE.md. Every section of every page has exactly one destination:

| Destination | Meaning | Annotation in the HTML |
|---|---|---|
| **Atomic** | Built in Elementor v4 with atomic elements only (Flexbox, Div Block, Heading, Paragraph, Image, Button, Link, SVG, Divider, Form). Styles = global variables + global classes. | `<!-- ATOMIC: Flexbox > Heading(.tp-h2) + … -->` |
| **Theme** | `theme.css` (E1) + PHP templates (E3): header, footer, language switcher, WhatsApp, 404, project archive and single | `<!-- THEME: header.php / footer.php / archive-project.php / single-project.php / 404.php -->` |
| **Interaction** | Class-driven behaviour in `interactions.js` (E2) on atomic markup | `<!-- INTERACTION: tp-lightbox (interactions.js) -->` |
| **Animation** | `animations.css` + `animations.js` classes | applied through class names |
| **Report** | Cannot be expressed atomically and is not covered by E1–E3: reported to the owner, never improvised | `<!-- REPORT: … -->` (all collected in the last section) |
| **Prototype only** | JS that renders JSON into pages; never shipped | `/* PROTOTYPE ONLY */` in the file header |

### Front-end files

| File | Ships? | Role |
|---|---|---|
| `tokens.css`, `base.css`, `layout.css`, `components.css`, `inner-pages.css` | No — `/* ELEMENTOR SOURCE */` | Recreated as global variables / global classes (tables at the end) |
| `animations.css` + `animations.js` | Yes | `tp-reveal`, `tp-stagger`, `tp-parallax`, `tp-img-reveal`, `tp-split`, `tp-counter`, reduced motion. (`tp-counter` code was merged in from counters.js.) |
| `theme.css` | Yes (E1) | header, mobile menu, footer, WhatsApp, lightbox dialog, before/after slider, services scroll-nav chips, filter bar, project archive + single templates, 404 |
| `interactions.js` | Yes (E2) | header mobile menu (focus trap, Esc, scroll lock; hooks `data-tp-header` / `data-tp-menu-toggle` / `data-tp-menu` live in the theme's `header.php`) · lightbox (`tp-lightbox`) · before/after (`tp-before-after`) · scrollspy (`tp-scrollspy`) · project filter (`tp-filter`) |
| `projects.js`, `project-page.js`, `contact-form.js` | No — `/* PROTOTYPE ONLY */` | JSON rendering and form validation stand-ins for PHP / Atomic Form |

Page settings for every Elementor page: Full Width template, title hidden, no sidebar. The page starts below the solid sticky header (no overlay, no padding compensation).

### Interaction contracts (class-driven, atomic-friendly markup)

| Class | Markup | Behaviour |
|---|---|---|
| `tp-lightbox` | A Flexbox/Div container; every link inside that points to an image (`.webp/.jpg/.png`) or a PDF with `data-image` opens in the dialog; the container is one gallery | Dialog UI classes `tp-lbox*` are generated, styled in theme.css. Caption: `data-caption` → image alt → aria-label |
| `tp-before-after` | Container with `Image(.tp-before-after__after)` + `Image(.tp-before-after__before)` | Adds clip layer, labels and `role="slider"` handle (`tp-ba*` classes, theme.css). Without JS the images stack |
| `tp-scrollspy` | Container of links to `#id` anchors | Marks the link of the section in view with `aria-current="true"` |
| `tp-filter` | Archive template only (E3): `.tp-filter__btn[data-tp-filter]`, `.tp-filter__items > [data-tp-type]`, `.tp-filter__status` | FLIP animation, `?type=` URL state, live region |

### Direction-neutral classes and `-rtl` classes (PRD 8.2.2)

Audit result: every global class uses logical properties. The only physical values are in the classes below; each keeps its neutral rule and gets a sibling `-rtl` class that is added by hand to the same element on Arabic pages only.

| Neutral class | Physical value | Arabic-only class |
|---|---|---|
| `tp-link` | arrow icon `translateX` on hover | `tp-link-rtl` (flips the arrow, reverses the nudge) |
| `tp-card__more` | arrow icon direction | `tp-card__more-rtl` |
| `tp-marquee` | edge-fade gradient `to right`, scroll distance | `tp-marquee-rtl` |
| `tp-service__link` | title nudge on hover `translateX` | `tp-service__link-rtl` |
| `tp-img-reveal` and the `tp-reveal--start/--end` variants | clip-path / translate direction | handled inside `animations.css` through `--tp-dir-x` (not a class the client sets) |

Theme parts (header underline, before/after, lightbox arrows) follow `<html dir>` in `theme.css`.

---

### Page sections

Responsive rule used everywhere: desktop rows (`Flexbox direction: row`) become `column` on tablet; gaps/padding step down one token (`--tp-space-8` → `-7` → `-6`); card rows use `wrap` with a basis of 3 / 2 / 1 columns (desktop / tablet / mobile).

#### Home (`index.html`)

| Section | Dest | Atomic tree and global classes | Tablet / mobile |
|---|---|---|---|
| Header, mobile menu, footer, WhatsApp, sprite | Theme | `header.php`, `footer.php` | menu button < 64em |
| Hero | Atomic + Animation | `Flexbox.tp-hero > Flexbox.tp-hero__panel > Paragraph.tp-eyebrow + Heading H1.tp-h1.tp-hero__title(.tp-split) + Paragraph.tp-hero__lead + Flexbox.tp-hero__actions > Button.tp-btn--primary + Button.tp-btn--ghost`; `Flexbox.tp-hero__media > Flexbox.tp-frame > Image.tp-frame__img(.tp-parallax) + Paragraph.tp-caption`. Image `fetchpriority=high` | stack media under panel; remove media overlap |
| Partners marquee | Atomic + **Report** | `Flexbox.tp-marquee > Flexbox.tp-marquee__track > Image.tp-marquee__logo ×14` | same; reduced motion = wrapped static row |
| About + stats | Atomic | `Flexbox row > [Flexbox.tp-about__text > Paragraph.tp-eyebrow + Heading.tp-h2 + Paragraph.tp-lead + Paragraph + Link.tp-link] + [Flexbox.tp-stats > 3 × Flexbox.tp-stats__item > Paragraph.tp-stats__label + Heading.tp-stats__value(.tp-counter)]` | stats stack |
| Chairman quote | Atomic | `Flexbox.tp-section--sand > Flexbox row > Flexbox.tp-frame > Image + Flexbox.tp-quote > Paragraph.tp-eyebrow + Paragraph.tp-quote__text + Heading.tp-quote__name + Paragraph.tp-quote__role` | portrait above quote |
| Services list | Atomic + **Report** | rows `Flexbox.tp-service > Link > Heading.tp-service__title + Paragraph.tp-service__text + SVG.tp-service__plus`; one `Image.tp-service__img` each | no hover swap (see Report) |
| Why choose us | Atomic | `Flexbox.tp-section--sand > Image(.tp-parallax) + Flexbox.tp-why__text > … 3 × Flexbox.tp-why__item` | stack |
| Featured projects (6) | Atomic + **Report** | `Flexbox wrap.tp-projects-grid > 6 × Flexbox.tp-project > Link.tp-card > Image.tp-card__img + Paragraph.tp-card__meta + Heading.tp-card__title + Paragraph.tp-card__location` (Atomic Loop if the Phase 4 spike confirms it) | 3 → 2 → 1 columns |
| Before / after | Atomic + Interaction | `Flexbox.tp-compare > [text + Flexbox.tp-spec] + Flexbox.tp-before-after > Image.tp-before-after__after + Image.tp-before-after__before` | stack, slider full width |
| Letters of appreciation | Atomic | `Flexbox wrap > 3 × Flexbox.tp-letter > Paragraph.tp-letter__text + author + company` | 3 → 1 |
| CTA band | Atomic | `Flexbox.tp-cta > Flexbox.tp-cta__box > Paragraph.tp-eyebrow + Heading.tp-h2 + Paragraph + Button + links` | stack buttons |

#### About (`about.html`)

| Section | Dest | Atomic tree and global classes | Tablet / mobile |
|---|---|---|---|
| Page hero + breadcrumbs | Atomic | `Flexbox.tp-page-hero > Flexbox(.tp-breadcrumb__list: Link + Paragraph) + Paragraph.tp-eyebrow + Heading H1.tp-h1.tp-page-hero__title + Paragraph.tp-page-hero__lead` | — |
| Chairman's message | Atomic | `Flexbox row > Flexbox.tp-chair-page__media(sticky) > Flexbox.tp-frame > Image + Flexbox.tp-chair-page__msg > …` | portrait not sticky, above text |
| About + 2015 fact | Atomic + Animation | `Flexbox.tp-section--sand > text + Flexbox.tp-fact.tp-frame > Heading.tp-fact__value(.tp-counter)` | stack |
| Aims | Atomic | `Flexbox wrap > 4 × Flexbox.tp-aim` | 4 → 2 → 1 |
| Why choose us | Atomic | same as Home | |
| Leadership + philosophy | Atomic + **Report** | `Flexbox wrap.tp-team > 3 × Flexbox.tp-team__card`; `Flexbox.tp-philosophy` | 3 → 1 |
| Team experience | Atomic | `Flexbox wrap.tp-exp > 4 × Flexbox.tp-exp__card` (no links) | 4 → 2 → 1 |
| Partners (14) | Atomic | `Flexbox wrap.tp-partners-grid > Image.tp-partner__logo ×14` | 7 → 4 → 3 |
| Licenses | Atomic + Interaction + **Report** | `Flexbox.tp-licenses.tp-lightbox > 2 × Flexbox.tp-license > Link > Image.tp-license__preview + Flexbox.tp-spec + Button` | stack |
| CTA band | Atomic | as Home | |

#### Services (`services.html`)

| Section | Dest | Atomic tree and global classes | Tablet / mobile |
|---|---|---|---|
| Page hero + breadcrumbs | Atomic | as About | |
| Chip navigation | Atomic + Interaction | `Flexbox.tp-service-nav.tp-scrollspy(sticky) > Flexbox.tp-chips > Link.tp-chip ×6` | horizontal scroll |
| 6 service blocks | Atomic | `Flexbox.tp-service-block(--flip) > [Paragraph.tp-eyebrow + Heading.tp-h2 + Paragraph.tp-lead + Paragraph + Button.tp-link] + Flexbox.tp-frame > Image`; anchor id = service id | stack, image first |
| Related projects (3 of 6 blocks) | Atomic + **Report** | `Flexbox wrap.tp-projects-grid--related > 3 × project card` (static) | 3 → 1 |
| Wall cladding showcase | Atomic + Interaction | `Flexbox wrap.tp-gallery.tp-lightbox > Link > Image.tp-gallery__item ×6` | 3 → 2 |
| CTA band | Atomic | as Home | |

<!-- PAGES-2B:START -->

#### Projects (`projects.html`) â€” theme template `archive-project.php` (E3)

| Section | Dest | Tree / classes | Tablet / mobile |
|---|---|---|---|
| Page hero + breadcrumbs | Theme (printed by the archive template; same markup as the atomic page hero) | `.tp-page-hero`, breadcrumbs, `.tp-h1`, `.tp-page-hero__lead` | â€” |
| Filter bar | Theme + Interaction | `.tp-filter > .tp-filter__bar > button.tp-filter__btn[data-tp-filter][aria-pressed] > .tp-filter__count`; `.tp-filter__status` (aria-live) | buttons wrap |
| Grid (22 projects) | Theme + Interaction | `.tp-filter__items.tp-projects-grid.tp-projects-grid--even > article.tp-project[data-tp-type] > a.tp-card`. Order: ongoing first, then completion date newest first (the PHP query must reproduce this: `meta_key` status then date). Wall Cladding (showcase) excluded. FLIP animation + `?type=` state in `interactions.js` | 3 â†’ 2 â†’ 1 columns |
| Team experience (4) | Atomic-equivalent markup inside the template (same classes as About) | `.tp-exp` cards, "by the Taameer Plus team" framing | 4 â†’ 2 â†’ 1 |
| CTA band | Atomic-equivalent | as Home | |

Card markup lives in `<template id="tp-project-card">` (copy into PHP). Taxonomy archive URLs `/projects/?type=fit-out` â†” `project-type` term links.


#### Project detail (`project.html?id=<slug>`) â€” theme template `single-project.php` (E3)

| Section | Dest | Tree / classes | Tablet / mobile |
|---|---|---|---|
| Page hero + breadcrumbs (Home â€؛ Projects â€؛ name), H1 = title | Theme | `.tp-page-hero`, `.tp-h1`; also hosts the "Project not found" state (+ `noindex`) = WordPress 404 for an unknown slug | â€” |
| Spec block | Theme | `dl.tp-spec.tp-spec--stack` rows: Type, Location, Duration, Completion (date or "Ongoing"), Consultant when present | column above cover |
| Cover | Theme | `.tp-project-cover` (plain â‰¥ 1200px landscape, `.tp-frame` otherwise; never upscaled, max 80vh) | full width |
| 3D Visualization notice | Theme | `.tp-render-note` when `isRender` | â€” |
| Gallery | Theme + Interaction | `.tp-masonry.tp-lightbox > a.tp-masonry__item > img` (CSS columns, one lightbox group) | 3 â†’ 2 â†’ 1 columns |
| Before / after | Theme + Interaction | `.tp-before-after` only when a before image exists | full width |
| Related testimonial | Theme | `.tp-project-letter` (excerpt, author, link to `testimonials.html#<id>`) | â€” |
| Previous / next | Theme | `.tp-project-nav` â€” Projects-grid order, wraps at the ends | stacks |
| Related projects | Theme | `.tp-projects-grid--related`: up to 3 of the same type, excluding current | 3 â†’ 1 |
| CTA band | Atomic-equivalent | as Home | |

Meta: `<title>` = "name â€” Taameer Plus Contracting LLC"; description = project description or a generated sentence; OG image = cover. `project-page.js` is PROTOTYPE ONLY.


#### Testimonials (`testimonials.html`) â€” Atomic

| Section | Dest | Tree / classes | Tablet / mobile |
|---|---|---|---|
| Page hero + breadcrumbs | Atomic | as About | |
| 4 letters | Atomic + Interaction + **Report** | `Flexbox.tp-lightbox > 4 أ— Flexbox.tp-letter-page(--flip) > [Flexbox.tp-letter-page__sheet > Link.tp-letter-page__thumb > Image + Paragraph(zoom label)] + [Flexbox.tp-letter-page__text > Paragraph.tp-eyebrow + Heading H2 + Paragraph(date) + Paragraph.tp-letter-page__excerpt + Paragraph(author) + Paragraph(role) + Link.tp-link(project)]`. Jan's Noodles: company name + letter only | rows stack, sheet above text; `--flip` only reverses the desktop row |
| CTA band | Atomic | as Home | |


#### Contact (`contact.html`) â€” Atomic (+ prototype-only validation)

| Section | Dest | Tree / classes | Tablet / mobile |
|---|---|---|---|
| Page hero + breadcrumbs | Atomic | as About | |
| Contact details | Atomic | `Flexbox.tp-contact__info > Heading H2 + Flexbox.tp-spec.tp-spec--stack > 6 أ— Flexbox.tp-spec__row > Paragraph(label) + Link(value)`: address, office (`tel:`), mobile (`tel:`), email (`mailto:`), WhatsApp (`https://wa.me/971503029281`), Instagram. Values from the Customizer. Office hours deliberately omitted (unknown) | stacks above the form |
| Form | Atomic + **Report** | `Form.tp-form > Field name* + Field email* + Field phone + Select project type (6 services + Other) + Textarea message* + hidden honeypot Field + Button.tp-btn--primary`. Classes: `tp-form`, `tp-form__field`, `tp-form__error`, `tp-form__status`, `tp-form__success`, `tp-form__hp`. `contact-form.js` is PROTOTYPE ONLY | full width |
| Location block (no iframe) | Atomic | `Flexbox.tp-location > SVG.tp-location__mark + Flexbox.tp-location__text > Paragraph.tp-eyebrow + Heading H2 + Paragraph + Button.tp-btn--primary "Open in Google Maps"` (new tab) | button wraps below |
| CTA band | Atomic | as Home | |

JSON-LD `GeneralContractor` (also on Home) is printed by the theme or the SEO plugin, not Elementor: name, url, logo, image, description, telephone, email, foundingDate, PostalAddress, sameAs Instagram.


#### 404 (`404.html`) â€” theme template `404.php` (E1)

| Section | Dest | Tree / classes | Tablet / mobile |
|---|---|---|---|
| Message + "+" motif + links | Theme | `.tp-404__hero > .tp-404__code (404 + SVG +) + .tp-404__text > eyebrow + H1 + lead + 2 buttons (Home, Projects)`; `<meta name="robots" content="noindex">` | stacks |
| 3 featured projects | Theme | `.tp-404__projects > .tp-projects-grid--related` (PHP loop; cards from `<template id="tp-project-card">`) | 3 â†’ 1 |

Asset URLs are relative in the prototype; `404.php` uses `get_stylesheet_directory_uri()` so the page works from any path. No CTA band (the page ends on the projects).

<!-- PAGES-2B:END -->

### Arabic pages (Phase 3, `ar/`)

The 8 Arabic pages mirror the English ones section by section (same `ATOMIC` / `THEME` / `INTERACTION` annotations, same partials), so every English row above applies to its Arabic twin. They are generated by `scripts/build_ar.py` from the English page plus `scripts/ar_text.py` / `scripts/ar_data.py` (prototype tooling, never shipped); in WordPress each Arabic page is a Polylang translation of the English page, built in Elementor with the same elements and global classes.

| Topic | Prototype | WordPress |
|---|---|---|
| Document | `<html lang="ar" dir="rtl">`; hreflang (`en`, `ar`, `x-default` → English) and canonical on every page except the project template (comment, URL depends on `?id=`) and the noindex 404 | Polylang + SEO plugin print them |
| Language switcher | Reads "English" on Arabic pages and "عربي" on English pages; links to the equivalent page; the project page keeps `?id=` (`project-page.js`) | Theme (`pll_the_languages()`), links to the translated post |
| Fonts | Arabic pages request only El Messiri 500 + IBM Plex Sans Arabic 400/500/600 (separate Google Fonts request; D-034) | Enqueued on Arabic pages only (theme), self-hosted if the owner prefers |
| Typography | `:lang(ar)` token overrides at the end of `tokens.css` (D-035): Arabic font tokens, tracking 0, `--tp-transform-label: none`, `--tp-style-quote: normal`, taller line-heights, small sizes +8%, guillemets for quotation marks | **Open: REPORT R10** |
| Bidi | Latin runs, building notations and phone numbers wrapped in `<bdi>`; `tel:`, `mailto:`, WhatsApp and Instagram links carry `dir="ltr"` | Elementor Div Block / Paragraph content can hold `<bdi>`; `dir` on links needs the Link element's attributes or the theme (REPORT R10) |
| Testimonial translations | A `Paragraph(.tp-caption)` "ترجمة عن الأصل الإنجليزي" follows each translated excerpt (Home, Testimonials, project template) | Same Paragraph |
| JSON rendering | `projects.js` / `project-page.js` read `<html lang>` and use the `ar` field; asset and data paths gain `../` on Arabic pages (`TP.projects.asset`) | PHP templates (E3) print the Polylang language fields; no JSON |

#### String table per language (Polylang string translation)

The scripts keep one small table per language; in WordPress these become Polylang string translations (or `.po` strings of the child theme). Keys:

| File | Keys |
|---|---|
| `interactions.js` (`STRINGS`) | menu, closeMenu, close, prev, next, of, before, after, divider, shown, showing / showingOne / showingTwo / showingMany (Arabic number–noun agreement) |
| `projects.js` (`STRINGS`) | ongoing, ongoingProject, completed, months (Gulf month names), brand, notFound, notFoundText, specType / specLocation / specDuration / specCompletion / specConsultant, imageOf, after, before, description (SEO sentence template) |
| `contact-form.js` (`MESSAGES`) | required(label), email, summary(n) (Arabic plural forms 1, 2, 3–10, 11+) |


### REPORT items for the owner (not atomic, not covered by E1–E3)

Resolved in PRD v1.6 (Phase 2 review) and D-033: R1, R2, R3, R5, R6. They stay listed for traceability; only open items need action.

| # | Where | Problem | Status / suggested solution |
|---|---|---|---|
| R1 | Header (all pages) | Mobile menu toggle needs JS (focus trap, Esc, scroll lock) | **Resolved:** "header mobile menu" is part of **E2** (`interactions.js`; hooks live in the theme's `header.php`, theme-template data attributes are allowed, D-033) |
| R2 | Home partners marquee | Continuous logo scroll outside the PRD 8.3 class list | **Resolved:** `tp-marquee` is in the animation list (`animations.css/js`) |
| R3 | Home services list | Desktop hover/focus image swap needs sibling-state CSS and a sticky Grid image | **Resolved:** static rows, one image each; the swap is dropped |
| R4 | Home featured projects, Services related projects, About team | Atomic elements cannot read the Project / Team CPTs; cards are static and need manual updates | Open — Phase 4 spike: Atomic Loop in the free version; else static cards |
| R5 | All lists, stats, quotes, dates | Atomic elements have no `ul/li`, `dl`, `blockquote`, `time`, `figure` | **Resolved:** Div Blocks + Paragraphs accepted (small semantic loss). Replacements per section below |
| R6 | About licenses, wall cladding, project gallery | Lightbox needed `data-image` / `data-caption` on links; the free atomic editor may not offer custom attributes | **Resolved:** interactions use only `href` / `alt` (caption = image alt → aria-label); animation options are classes (`tp-delay-N`, `tp-counter--year`, `tp-parallax--slow/--fast`), D-033 |
| R7 | Contact form | Atomic Forms availability in the free version is unverified; honeypot, inline errors (`aria-describedby`) and success state may differ | Open — Phase 4 spike; otherwise a form plugin (owner decision: shortcodes are excluded) |
| R8 | CSS filters on images | Grayscale-to-colour hover on partner logos needs a filter control | Open — drop the hover effect if not offered |
| R9 | Prototype grids | Projects, related, 404 and gallery grids use CSS Grid/columns in `theme.css` (allowed: E1/E3); atomic pages use Flexbox wrap | None needed |
| R10 | Arabic typography (all Arabic pages) | Arabic needs a different type system: El Messiri 500 for headings / quote / stats, IBM Plex Sans Arabic for the rest, tracking 0, no uppercase, no italics, taller line-heights, slightly larger small text, guillemet quotation marks. Elementor global classes and variables have no per-language values. The prototype does it with 18 token overrides under `:lang(ar)` (end of `tokens.css`) that every component already reads. **Two ways to map it, to be chosen by the owner:** (a) separate `-rtl` global classes: about **55** typographic global classes exist; **30** of them change under Arabic (font family, line-height, tracking, case, italics) and would each need an Arabic twin, applied to every element of the 8 Arabic pages (also `<bdi>` / `dir="ltr"` on contact links); (b) a small `:lang(ar)` variable override in `theme.css` (about 18 lines, the same block as in the prototype), which **extends exception E1** and keeps one set of classes for both languages | Owner decides between (a) and (b); the Phase 4 spike should test whether Elementor global variables accept per-language overrides and whether the Link element exposes `dir` |
| R11 | Arabic stat numbers | The counter text `100+` is rendered by the bidi algorithm as `+100` inside Arabic pages (plus sign on the reading-start side). This is the usual Arabic reading and is accepted; keeping the sign on the right would need the sign in a separate element **Resolved:** accepted as is by the owner |

#### R5 per-section replacements (atomic build)

| Prototype element | Where | Atomic replacement |
|---|---|---|
| `ul/li` lists (`tp-why__list`, `tp-aims`, `tp-exp`, `tp-team`, `tp-partner-grid`, `tp-licenses`, `tp-letters`, `tp-chips`, `tp-service-list`) | Home, About, Services | Flexbox container (the list class) > Div Block per item (the item class); no list semantics |
| `dl/dt/dd` stats and spec tables (`tp-stats`, `tp-spec`) | Home stats, About license and experience facts, Contact details, project spec | Flexbox (`tp-stats` / `tp-spec`) > Div Block row (`tp-spec__row`) > Paragraph (term) + Paragraph (value) |
| `figure` / `figcaption` | Home hero and quote, letters, framed images | Div Block (`tp-frame` / `tp-letter__fig`) > Image + Paragraph (`tp-caption`) |
| `blockquote` | Home quote and letter excerpts, About chairman, Testimonials | Paragraph with the quote class (`tp-quote__text`, `tp-letter__quote`, `tp-letter-page__excerpt`, `tp-chair-page__lead`) |
| `time datetime` | Testimonials dates, About license dates | Paragraph with the date text (no machine-readable value) |
| `article` (letters) | Testimonials | Div Block with the card class; project cards in the archive and 404 stay real `article` (PHP, E3) |
| `ol` breadcrumb | Inner pages | Flexbox (`tp-breadcrumb__list`) > Link + Paragraph (current page) |
| Header / footer lists | All pages | Theme PHP (`header.php`, `footer.php`): real `ul/li` stay |


<!-- GENERATED:START -->
<!-- GENERATED:END -->
