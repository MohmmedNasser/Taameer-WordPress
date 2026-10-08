# WordPress mapping

**Approved architecture (PRD v1.8 §8.2, D-038):** WordPress on LocalWP (`https://taameer.local`) · **Astra Free** (foundation, Header/Footer Builder, navigation, mobile menu) · **Elementor Free, v3 architecture** (Containers, nested Containers, native widgets, Global Kit, responsive controls, native animations where equivalent) · **minimal Astra child theme** `wp-theme/taameer-astra-child/` for custom CSS/JS only · **Novamira CLI** for WordPress operations (`scripts/wp/`). No Atomic Elements, no Elementor Pro, no Astra Pro, no CPT/PHP templates, no Polylang yet. The static prototype is the visual source of truth.

Status labels: **Implemented** = built and verified in WordPress. **Planned** = not started; the approach shown is the current intention, decided in that page's phase.

## Implemented — WP Phase 1 (foundation + English homepage)

### Foundation

| Item | State |
|---|---|
| WordPress | 7.1.2, PHP 8.2; site URL `https://taameer.local`; title "Taameer Plus Contracting LLC", tagline "Construction, Fit-out & Renovation in Dubai"; Home = static front page (page id 208) |
| Plugins | Elementor 4.3.4 (free), WPForms Lite, Novamira. Nothing else installed |
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
| `functions.php` | Enqueues `taameer.css` / `taameer.js` (after Astra/Elementor); sets `html.tp-js` before first paint; Astra breakpoints 1023/767; registers `[tp_template id]` (renders a published Elementor saved template); menu links with a `#` are never marked current; Astra's scroll-to-ID off on Services (D-042) |
| `assets/css/taameer.css` | Sticky header and Astra header/footer polish (nav hairline, "+" menu toggle, full-screen menu fade, footer grid, icons, WhatsApp button); component classes (`tp-eyebrow`, `tp-caption`, `tp-link`, `tp-frame`, `tp-frame--portrait`, `tp-service`, `tp-plus-item`, `tp-card`, `tp-lift`, `tp-letter__thumb`, `tp-stat`, `tp-measure*`); marquee and partner grayscale; About (§5b) and Services (§5c: chip bar, anchor offset, `tp-ratio-4x3`, gallery) components; before/after slider; motion (Fade In Up retimed, `tp-split`, `tp-img-reveal` + `tp-delay-1…5`, `tp-parallax`); reduced motion; five documented overrides of Astra/Elementor defaults (root font size, Astra button font size, Full Width wrapper padding, `.e-con::before`, widget `max-width`) |
| `assets/js/taameer.js` | Split headline, image wipe and parallax (IntersectionObserver), marquee clone, before/after slider (keyboard operable), counters at final value under reduced motion, Services scrollspy (`tp-scrollspy`; header height → `--tp-masthead-h`). Nothing runs inside the Elementor editor |

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

## Planned

| Page / item | Planned approach | Notes |
|---|---|---|
| Contact | Elementor page; form with WPForms Lite; "Open in Google Maps" link | |
| 404 | Astra 404 or an Elementor-built approach, decided in that phase | |
| Arabic | Polylang in the dedicated Arabic phase after the English site is verified | Language switcher is visual only until then |
| SEO plugin | Yoast or Rank Math, deferred | No meta descriptions until then |
| Final cleanup | Remove WordPress starter content (Hello world, Sample Page, Privacy Policy draft, empty "Elementor #" drafts) | Deferred, D-040 |

## Known limitations

- Project detail (all 22 pages): section padding is the fixed 128 / 96 / 72 px of the other pages (prototype fluid 121.6 px at 1280), so pages are about 1–2 % taller; related cards and previous/next are 8–26 px taller than the prototype (Kit line heights, same as the listing cards); the cover's alt is the library alt ("title, location — image 1 of n" or a descriptive alt) instead of "title, location"; tablet 768–1023 px stacks the spec above the cover (prototype side by side from about 800 px).
- Project galleries: 10 images keep the descriptive alt text they carry on Home / Services (one attachment has one alt in WordPress) instead of the prototype's "title, location — image i of n": palm-jumeirah-villa-02, dubai-g-residential-villa-02 / 03 / 05, kf-inc-headquarters-05, dubai-marina-triplex-villa-04, atlas-copco-headquarters-03, al-warqa-1st-g2-villa-06, al-awir-villas-02, abu-dhabi-marina-private-gym-01; the gym's before/after images likewise use the library alts ("After: the completed gym…", "Before: the same structure during construction").
- Testimonials: the letter images keep their library alt ("Letter of appreciation from Atlas Copco (thumbnail)" etc., written for Home's thumbnails; one attachment has one alt) instead of the prototype's "Original letter of appreciation from …"; the sheet links are named by `taameer.js` ("Open the original letter from …") as in the prototype. The date is a Heading `<p>`, not `<time datetime>`, and the letters section has no `aria-label` (Elementor Free has no custom attributes). The lightbox is Elementor's (no caption), not the prototype's.
- Links to the not-yet-built page `/contact/` return 404 until it exists (`/testimonials/` exists since WP Phase 5). Earlier counts (13 URLs on Services; Home and About had 17 and 10 including `/services/…`, which exists since WP Phase 3; `/about/` since WP Phase 2).
- Services: related project cards are static (updated by hand); the chip bar's `aria-label` ("Services on this page") is set by `taameer.js` (Elementor Free has no custom attributes) and will need its Arabic string in the Arabic phase; anchor scrolling on Services is native (Astra's scroll-to-ID is off on that page only, D-042).
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
