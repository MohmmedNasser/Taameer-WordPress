# Product Requirements Document
## Taameer Plus Contracting — Corporate Website

| | |
|---|---|
| **Version** | 1.8 — WordPress architecture: Astra Free + Elementor Free v3 (D-038) |
| **Date** | 6 October 2026 (v1.0: 30 September 2026) |
| **Prepared by** | Mohammed (Frontend Developer) |
| **Client** | Taameer Plus Contracting LLC, Dubai, UAE |
| **Domain** | www.taameer.ae |

---

## 1. Overview

Taameer Plus Contracting LLC is a Dubai-based general contractor established in 2015, offering construction, decoration, fit-out, maintenance and renovation services, delivered as Turnkey or Design & Build contracts. Its current marketing material is a 37-page PDF company profile and a single-page website at taameer.ae.

This project turns both into a multi-page, bilingual (English / Arabic) corporate website built on WordPress, where the client's team can update page content, projects, team members and testimonials with Elementor (free version) in the WordPress dashboard without developer help.

**Content sources:** the website is newer and wins where the two disagree (dates, status, stats, wording); the PDF supplies projects, galleries and material the website lacks. All content from both is approved for use.

The build happens in two stages: a static HTML/CSS/JavaScript prototype for design approval, followed by a rebuild in WordPress as a genuinely editable Elementor site:

```text
Static HTML/CSS/JS  →  visual / structural reference (source of truth, left unchanged)
        ↓
WordPress  →  Astra Free (theme, header, footer)  →  Elementor Free (Containers + native widgets)
        ↓
Minimal Astra child theme CSS/JS only where Elementor Free cannot reproduce the prototype
```

---

## 2. Goals

1. **Build credibility** with private villa owners, developers, consultants and commercial tenants by showcasing completed work, the leadership team and client appreciation letters.
2. **Generate enquiries** through clear calls to action, a contact form, and one-tap phone and email links on mobile.
3. **Serve both audiences** in the UAE market with a full English site and a native-quality Arabic (RTL) site.
4. **Give the client independence**: routine content changes (text, images, new projects, new testimonials) must not require a developer.

### Success criteria

| Criterion | Target |
|---|---|
| All PDF and website content and images represented | 100% |
| Lighthouse Performance, mobile (static prototype) | Measured for reference only, not a gate |
| Lighthouse Performance, mobile (WordPress, Phase 5 gate) | ≥ 80 |
| Lighthouse Accessibility | ≥ 95 |
| WCAG conformance | 2.1 AA |
| Client can add a new project without help | Yes, verified in handover session |
| Client can edit homepage text and images in Elementor | Yes, verified in handover session |

---

## 3. Target audience

| Audience | What they look for |
|---|---|
| Private villa owners | Villa construction and renovation quality, photos, reassurance |
| Commercial tenants (retail, F&B, beauty, offices) | Fit-out experience in similar spaces, delivery speed |
| Developers and engineering consultants | Company capability, team experience, references |
| Corporate clients | Professionalism, references from known companies (e.g. Atlas Copco) |

---

## 4. Scope

### 4.1 In scope

- Static prototype: 8 English pages + 8 Arabic pages (project detail is one template)
- WordPress on Astra Free with a **minimal Astra child theme** (custom CSS/JS only; not a page-rendering theme), see 8.2
- Pages built with **Elementor Free v3: Containers, nested Containers and native widgets**, the Elementor Global Kit (colours, fonts) and responsive controls (see 8.2)
- Projects: a Projects page with static project cards and one Elementor page per project (Elementor Free has no Loop Grid or Theme Builder; see 6 and 8.2.1). Custom Post Types and PHP templates are not part of the approved architecture unless approved later as a separate decision
- Bilingual setup with Polylang (free), English default, Arabic RTL, **in a dedicated Arabic phase after the English site is complete and verified**
- Contact form with WPForms Lite (installed; built in the Contact page phase)
- Basic on-page SEO: titles, meta descriptions, Open Graph, `hreflang`, XML sitemap, LocalBusiness / GeneralContractor schema
- Image extraction from the PDF and collection from the current website, optimization and WebP conversion
- Free-license stock images (Unsplash, Pexels, Pixabay) only where the PDF has no suitable image, with every source logged
- Full project documentation for developers and AI-assisted development
- Arabic translation of all content (for client review)
- Content import into WordPress and Elementor page builds
- One handover session and a short editing guide

### 4.2 Out of scope (quoted separately if required)

- Hosting, domain, email setup, production deployment and SMTP configuration
- Blog / news section
- Online quotation calculator or multi-step quote forms
- Careers / job applications
- Original photography, paid stock images, logo redesign or new brand identity
- Copywriting beyond editing and translating the existing profile
- Advanced SEO, ongoing content updates, maintenance retainer
- CRM integration or any form integration beyond email delivery
- Elementor Pro features (Theme Builder, Pro Form widget, Loop Grid, Portfolio widget, per-widget Custom CSS, Custom Attributes, Popups, Pro sticky/scrolling Motion Effects) and Astra Pro, unless the owner explicitly approves them
- Third languages

---

## 5. Sitemap and page requirements

| # | Page | URL (EN / AR) |
|---|---|---|
| 1 | Home | `/` · `/ar/` |
| 2 | About | `/about/` · `/ar/about/` |
| 3 | Services | `/services/` · `/ar/services/` |
| 4 | Projects | `/projects/` · `/ar/projects/` |
| 5 | Project detail | `/projects/{slug}/` · `/ar/projects/{slug}/` |
| 6 | Testimonials | `/testimonials/` · `/ar/testimonials/` |
| 7 | Contact | `/contact/` · `/ar/contact/` |
| 8 | 404 | — |

### 5.1 Global: header and footer

- **Header:** logo, main navigation, language switcher, "Get a Quote" button. Sticky and solid on all pages: **not transparent**, no overlay over the hero, and no top-padding compensation in the hero. Built with the **Astra Free Header Builder** (logo, menu, HTML element for the language switcher, button, responsive mobile menu); stickiness comes from the child theme CSS because Astra Free has no sticky header option. Accessible mobile menu.
- **Footer:** logo, tagline, quick links, services list, contact details (office, mobile, email, WhatsApp, Instagram), company profile PDF download, language switcher, copyright. Built with the **Astra Free Footer Builder** (widget columns, menus, copyright, HTML elements); the PDF link points to the file in the Media Library.
- **Floating WhatsApp button** on all pages (Astra footer HTML element, styled by the child theme).
- Contact details (address, phone, email, social links) in the header and footer are edited in the Astra Customizer (Header/Footer Builder elements) and the footer widgets; where page content repeats them (CTA band, Contact page) they are edited in Elementor. Astra Free and Elementor Free offer no single shared source for both.
- The language switcher is visual only (not functional) until the Arabic phase.

### 5.2 Home

Sections in order: Hero with tagline "Construct A Better Tomorrow" · Partners logo marquee · About intro with statistics · Chairman statement · Services · Why Choose Us · 6 featured projects · Before/After comparison (Abu Dhabi private gym) · Testimonials · Call to action · Footer.

Statistics: Established 2015 · Approved G+4 Contractor · 100+ delivered projects. All editable.

### 5.3 About

Chairman's message (full, with photo) · About Us · Our Aim (4 aims) · Why Choose Us · Leadership team (3 members with photo, title, bio) · Team philosophy text · Partners (14 logos) · Trade licenses (Taameer Plus Contracting LLC and Taameer Plus Carpentry LLC) viewable in a lightbox · Team experience: 4 large-scale buildings delivered by team members before or outside the company, clearly labelled as such.

### 5.4 Services

Intro · 6 services: Construction, Design & Build, Decoration & Fitout (including wall cladding and joinery through the carpentry division), Renovation, Maintenance, Turnkey Projects, each with description, service image and related projects · Wall Cladding showcase · Call to action.

### 5.5 Projects

Grid of all projects with filtering by type (All, Construction, Renovation & Decoration, Fit-out, Landscaping) and animated transitions. Each card: cover image, title, type, location, completion year or "Ongoing" badge. Rendered images marked "3D Visualization". In WordPress the cards are static Elementor cards (no Loop Grid in Elementor Free); how filtering is implemented without it is decided in the Projects phase.

### 5.6 Project detail

Title, type, location, duration, completion date or status, consultant (when available), full image gallery with lightbox, before/after slider when a before image exists, previous/next project navigation, related projects of the same type, call to action. In WordPress each project is its own Elementor page (Elementor Free has no Theme Builder single template).

### 5.7 Testimonials

Appreciation letters from Atlas Copco Services Middle East, Bella Cure Beauty Lounge, TODAY Engineering Consultants and Jan's Noodles Restaurant: excerpt (where the letter has text), author, title, company, related project link, and the original letter image viewable in a lightbox.

### 5.8 Contact

Address, office phone, mobile, WhatsApp, email, Instagram, a location block with an "Open in Google Maps" link to the Festival City office (no embedded map; decided in v1.5), contact form (name, email, phone, project type, message), office hours if provided by client.

### 5.9 404

On-brand message, links to Home and Projects, language-aware.

---

## 6. Content model

The fields below are the content every item must carry. **Storage in the approved architecture (D-038, D-040):** projects are individual Elementor pages listed by static cards; team members and testimonials are Elementor content on the About and Testimonials pages. Custom Post Types, taxonomies, meta boxes and PHP templates (`archive-project.php`, `single-project.php`) are **no longer the approved architecture**; a dynamic projects architecture would be a separate decision.

### 6.1 Project

| Field | Type | Notes |
|---|---|---|
| Title | Text | Translatable |
| Project Type | Label | construction · renovation-decoration · fit-out · landscaping · showcase |
| Location | Text | Translatable |
| Duration | Text | e.g. "120 Days", "8 Months" |
| Completion date | Month/Year | Empty if ongoing |
| Status | Select | Completed · Ongoing |
| Consultant | Text | Optional |
| Is 3D render | Checkbox | Shows "3D Visualization" label |
| Featured | Checkbox | Shown on homepage |
| Cover image | Image | |
| Gallery | Multiple images | Elementor images with the native lightbox |
| Before image | Image | Optional, enables before/after slider |
| Description | Rich text | Optional, for future projects |

Initial content: 22 projects (21 from the PDF, 1 from the website) + Wall Cladding showcase. Where a project appears in both sources, the website's facts are used. `data/projects.json` holds 27 entries in all: these 23 plus the 4 team-experience buildings of 6.4.

### 6.2 Team Member

Name · Title · Photo · Bio · Years of experience · Display order. Initial content: 3 members, using the website bios.

### 6.3 Testimonial

Excerpt · Author name · Author title · Company · Date · Related project (link) · Original letter image. Initial content: 4 testimonials.

### 6.4 Team Experience

The 4 buildings on PDF pages 32–33 (hotel in Al Barsha, residential tower in Nadd Al Hamar, Dubai Investments HQ, mixed-use building in Souq Al Kabeer) are stored separately from company projects and labelled as prior experience of team members.

---

## 7. Bilingual requirements

- **Timing:** Arabic/RTL and Polylang come in a dedicated phase after the English WordPress site is complete and verified. Polylang is not installed or configured before then.
- English is the default language with no URL prefix; Arabic uses `/ar/`.
- Arabic pages render right-to-left with mirrored layouts, animations, sliders and marquee direction.
- Arabic typography: **El Messiri 500** for H1–H4, pull-quotes and stat numbers; **IBM Plex Sans Arabic** for everything else. No letter-spacing, uppercase or italics on Arabic text. Arabic text sizes and line-heights are adjusted through a `:lang(ar)` variable override (in WordPress: child theme CSS and/or Elementor typography, decided in the Arabic phase).
- Every page, project, team member and testimonial has an Arabic version linked through Polylang.
- Theme strings (buttons, labels, form fields, 404 text) are translatable through Polylang string translation.
- The language switcher links to the equivalent page in the other language, not to the homepage.
- `hreflang` tags are output for every translated page.
- Arabic copy is a marketing adaptation for the UAE market, not a literal translation. **The client must review and approve it**, especially the Chairman's message.

---

## 8. Editability

### 8.1 Where each part is edited

| Content | Edited in | By |
|---|---|---|
| Page sections (all pages) | Elementor Free (Pages → Edit with Elementor) | Client |
| Projects (cards and project pages), Team, Testimonials | Elementor Free | Client |
| CTA band (reused on many pages) | Elementor saved template (Templates → Saved Templates) | Client |
| Header and footer content and layout | Astra Customizer (Header/Footer Builder), footer widgets | Client, with care |
| Contact details, social links | Astra Customizer elements and footer widgets; Elementor where pages repeat them | Client |
| Menus | Appearance → Menus | Client |
| Colors and fonts | Elementor Site Settings (Global Kit); Astra global palette for header/footer | Client, with care |
| Custom effects (frame marks, wipes, parallax, marquee, before/after, sticky header) | Child theme CSS/JS, applied through CSS classes in Elementor | Developer |

### 8.2 WordPress build rules (Elementor Free v3 + Astra Free; D-038, supersedes the v4 Atomic rules of v1.4–1.7)

- **Native Elementor first.** Pages are built with Elementor **Containers, nested Containers and native widgets** (Heading, Text Editor, Image, Button, Counter, Icon, Icon Box / Image Box, Shortcode…), Global Colors, Global Fonts, responsive controls and native entrance animations where they give an equivalent result.
- **Not allowed as the default:** a page made of one HTML widget holding the static HTML, pasted prototype CSS or JS, or Elementor pages converted into PHP templates. The client must be able to open **Pages → Edit with Elementor** and edit text, images, buttons, sections, Containers, layout, responsive settings and content without touching the static HTML.
- **Elementor Atomic Elements / the v4 Atomic Editor are not part of this project's architecture.** Elementor Pro and Astra Pro are not installed and must not be assumed.
- **Theme: Astra Free** provides the site foundation, header, footer, navigation, mobile menu and basic theme settings. No traditional custom WordPress theme.
- **Minimal Astra child theme** (`wp-theme/taameer-astra-child/`) exists only for what Elementor Free cannot do: custom CSS classes, custom JS effects (split headline, image wipe, parallax, marquee, before/after slider), sticky header, frame marks and other small front-end enhancements, plus the `[tp_template]` shortcode for reusing a saved template. It contains no page layouts or content.
- Effects are attached by **CSS classes** (Advanced → CSS Classes), never by Elementor-generated element IDs.
- Page settings: Elementor Full Width template (Astra header and footer kept), title hidden, no sidebar.
- Build order: English pages first, page by page with owner review; Arabic after the English site is verified.
- WordPress operations during the build use the **Novamira CLI** against the LocalWP site `https://taameer.local`; the build scripts live in `scripts/wp/`.

### 8.2.1 Elementor Free limitations (design future phases around them)

| Not available in Elementor Free | Consequence in this project |
|---|---|
| Theme Builder | Site-wide header and footer come from Astra; each project is its own Elementor page |
| Pro Form widget | Contact form with WPForms Lite |
| Loop Grid, Portfolio widget | Projects page and featured projects use static cards |
| Template widget, Global widgets | The CTA band is a saved template inserted with the free Shortcode widget through the child theme's `[tp_template id]` |
| Per-widget Custom CSS, Custom Attributes | Child theme CSS classes |
| Pro sticky / scrolling Motion Effects | Child theme CSS/JS (sticky header, parallax, image wipe) |

Elementor Pro functionality may only be used if the owner explicitly approves it.

### 8.2.2 RTL

Child theme CSS uses logical properties. How direction-specific values and Arabic typography are handled in Elementor is decided in the Arabic phase; RTL is tested manually on every Arabic page.

### 8.3 Animations

- Native Elementor entrance animations (Fade In Up, with delays for stagger) and the native Counter, where they match the prototype. `taameer.css` retimes Fade In Up to the prototype's motion (1 s, 2.5 rem, ease-out).
- Child theme JS/CSS for effects Elementor Free cannot reproduce: split headline (`tp-split`), image wipe (`tp-img-reveal`, `tp-delay-1…5`), parallax (`tp-parallax`), marquee (`tp-marquee`), before/after slider (`tp-before-after`) and other small interactions where necessary.
- Image wipes are verified against the prototype (D-039): same scroll trigger (IntersectionObserver), 1.3 s clip-path wipe, 200 ms delay on the hero image, play once.
- Full reduced-motion support: content and images are never left hidden. Animations are front-end only and do not run inside the Elementor editor.
- The working implementation is not replaced without a specific reason.

---

## 9. Design requirements

- **Approved identity: "Official"**, derived from the company's current website: a monochrome palette of ink `#0D0D0D`, charcoal `#262626`, slate `#595959`, line `#D9D9D9`, fog `#F4F4F4` and white. No chromatic accent color. The neutral frame lets the project photography carry the color.
- Typography: Playfair Display (headings) and Inter (body, UI). Uppercase buttons with small radius.
- **Elementor Global Kit (WordPress):** colours Ink `#0D0D0D`, Slate `#595959`, Charcoal `#262626`, Paper `#FFFFFF`, Fog `#F4F4F4`, Line `#D9D9D9` (plus a Text role, `#0D0D0D`). Fonts: Heading Playfair Display 500; Body Inter 400; Accent/Button Inter 500, uppercase, ≈ 0.03em letter-spacing. **Eyebrow labels keep their own style: Inter 600, ≈ 0.22em letter-spacing, uppercase; they are not merged into the button style** (approved, D-040). The prototype's fluid `clamp()` sizes are used for H1–H4, Lead, Body, Small, Quote, Stat, Eyebrow, Caption and Text link.
- **No dark mode and no dark sections.** Ink is used for text, the "+" motif, hairlines, solid buttons and small elements only; section backgrounds are white and fog.
- The alternative "bronze" design is archived in git (tag `v1-bronze`) and is not part of the build.
- The "+" from the logo is used as a recurring design motif.
- Motion is subtle and purposeful; all motion is disabled when the user's system requests reduced motion.
- Full design tokens (colors, type scale, spacing) are defined in the static prototype; in WordPress they become the Elementor Global Kit (colours, fonts), per-device spacing values in Elementor, and a small set of `--tp-` variables in the child theme CSS.

---

## 10. Non-functional requirements

| Area | Requirement |
|---|---|
| Browsers | Latest 2 versions of Chrome, Safari (macOS/iOS), Firefox, Edge; Samsung Internet |
| Responsive | 360px to 2560px, tested at 375, 768, 1280, 1920 (WordPress phases: 320, 375, 390, 768, 1024, 1280, 1440). The prototype uses 640/768/1024 px breakpoints; WordPress aligns Elementor and Astra at mobile ≤ 767 px and tablet ≤ 1023 px (desktop from 1024 px). **The visual behaviour is the source of truth**, not exact breakpoint numbers |
| Performance | WebP images with responsive sizes, lazy loading, no layout shift, no render-blocking third-party scripts |
| Images | Photographs: WebP, longest edge at most 1600 px, under 400 KB, converted on the server before upload. Logos and images with transparency: PNG (SVG if a vector logo is supplied) |
| Dependencies | No front-end frameworks or JS libraries (no GSAP, no animation libraries). Theme: Astra Free + child theme. Plugins limited to: Elementor (free), WPForms Lite, Novamira (development tooling), Polylang (Arabic phase), one SEO plugin (deferred, D-040) |
| Accessibility | WCAG 2.1 AA: semantic HTML, keyboard navigation, focus states, alt text, contrast, ARIA on custom components |
| Content source | All images and data from the client's company profile are approved for publication. Stock images fill gaps only and are logged with source and license |
| Maintainability | Child theme code documented; no page content in theme code |

---

## 11. Technical stack

| Layer | Choice |
|---|---|
| Prototype | HTML5, CSS3 (custom properties, logical properties), vanilla JavaScript |
| CMS | WordPress (latest) |
| Theme | Astra Free + minimal Astra child theme (`wp-theme/taameer-astra-child/`: CSS/JS only) |
| Page builder | Elementor Free, v3 architecture: Containers + native widgets (no Atomic Elements) |
| Multilingual | Polylang (free), in the Arabic phase only |
| Forms | WPForms Lite |
| SEO | Yoast SEO (free) or Rank Math (free): deferred until the main migration is substantially complete |
| Local development | LocalWP, site `https://taameer.local` (Mailpit for form email testing) |
| WordPress tooling | Novamira CLI (`scripts/wp/`); the Novamira MCP server is not relied on |
| AI tooling | Claude Code, guided by `CLAUDE.md` and this PRD. Single-agent only (no sub-agents). Every task logged in `docs/` |

---

## 12. Phases and acceptance criteria

### Phase 1 — Design system + English homepage
- Images extracted, optimized, mapped in `docs/image-map.md`; stock images logged in `docs/image-credits.md`
- Documentation system in place (`CLAUDE.md` + `docs/`) with every task logged
- Data files created with all projects, team and testimonials (English)
- Tokens, animation system, header, footer and homepage complete
- No console errors, no horizontal scroll at any tested width
- Layout mirrors correctly when `dir="rtl"` is applied
- **Gate: client approves the homepage design before Phase 2** — ✅ Approved: Official identity

### Phase 2 — Remaining English pages
- About, Services, Projects (with filtering), Project detail, Testimonials, Contact, 404
- All 21 projects reachable with working galleries and lightbox
- Lighthouse Accessibility ≥ 95 on mobile; Performance measured for reference only (the real gate is in Phase 5)

### Phase 3 — Arabic version
- All 8 pages in Arabic with RTL layout and Arabic fonts
- Arabic content added to data files
- **Gate: client approves Arabic copy**

### Phases 1–3 above = the static prototype (complete)

### WordPress migration (Astra Free + Elementor Free, D-038)

The WordPress work has its own phase numbers. The former "Phase 4 — WordPress theme" (Hello Elementor child theme, Atomic spike, CPTs, `archive-project.php` / `single-project.php`) and "Phase 5" plans are **superseded**; they remain in git history and `docs/prompts/`.

**WP Phase 1 — Foundation + English homepage: ✅ complete** (D-038, D-039)
- Astra Free configured; Header/Footer Builder header and footer; minimal Astra child theme; Elementor Global Kit
- 191 original images + company profile PDF in the Media Library with alt text
- CTA band as an Elementor saved template; homepage (10 sections) in Containers + native widgets
- Verified: 20/20 functional checks; 7 widths (320–1440) and reduced motion without console errors or horizontal overflow; image wipes match the prototype; Elementor editor opens, saves and re-renders the page

**WP Phase 2 onward — planned, not started**
- Remaining English pages (About, Services, Projects with static cards and filtering, project pages, Testimonials, Contact, 404), page by page with owner review; all 22 projects reachable with galleries and lightbox
- English site verified as a whole
- Arabic/RTL with Polylang (gate: client approves Arabic copy)
- SEO plugin, final cleanup (WordPress starter content), content review
- Handover: contact form delivers email (verified in Mailpit locally); Lighthouse mobile Performance ≥ 80 and Accessibility ≥ 95 on every page; pages exported as Elementor JSON templates; editing guide and handover session

---

## 13. Content corrections

The source PDF contains spelling and grammar errors that are corrected on the website (e.g. "Construct ABetter Tomorrow" → "Construct A Better Tomorrow", "late of the art" → "state-of-the-art", "Drees shop" → "Dress Shop"). The full list is maintained in `CLAUDE.md`. The client will review all edited copy before launch.

---

## 14. Open questions for the client

| # | Question | Blocks |
|---|---|---|
| 1 | Can you provide the logo in vector format (SVG, AI or PDF)? The website logo is a JPG. | Launch |
| 2 | Are original high-resolution photos available? 108 of 191 images are under 1200px, including the Palm Jumeirah villa and all PDF-only projects, plus unwatermarked Jumeirah Golf Estates photos. | Phase 2 |
| 3 | Do originals exist for the services banner and hero background that return errors on the current website? | Phase 2 |
| 4 | Please confirm letter-to-project links: Atlas Copco → Atlas Copco HQ; Bella Cure → Mirdif beauty lounge. Which project was Jan's Noodles, and does that letter have a text version? | Phase 2 |
| 5 | What is the company behind the "R" monogram partner logo? Should partner logos link to their websites? | Phase 2 |
| 6 | Office working hours? | Phase 2 |
| 7 | Please review edited copy, including the spellings "Al-Ali" and "Al-Otaibi". | Phase 2 |
| 8 | Where should contact form submissions be sent? | Phase 5 |
| 9 | Who will review and approve the Arabic copy? | Phase 3 |
| 10 | The new site replaces the current taameer.ae. Are there existing URLs or Google rankings to preserve with redirects? | Phase 5 |
| 11 | Please approve the contact form success message (current wording is a placeholder). | Phase 5 |
| 12 | Can you provide the two trade licences as real PDF files? `license-taameer-plus-contracting.pdf` and `license-taameer-plus-carpentry.pdf` are JPEG images with a `.pdf` extension, which WordPress rejects. | About page (WordPress) |

---

## 15. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Low-resolution images from the PDF | Weak visual quality on large screens | Request originals; design layouts that avoid oversized crops for weak images |
| Stock images look generic next to real project photos | Reduced authenticity | Use stock only for gaps, never for project content; replace with client photos when available |
| Arabic copy delayed in review | Phase 3 slips | Deliver Arabic early; review page by page |
| Client expects Elementor Pro features | Scope dispute | Sections 4.2, 8.1 and 8.2.1 define what is editable and what Elementor Free cannot do; confirmed at sign-off |
| Scope creep during review rounds | Timeline and budget | Two revision rounds per phase; further changes quoted |
| Static project cards (no Loop Grid in Elementor Free) | Adding a project means editing the Projects page and creating a project page | Editing steps in the editing guide; a dynamic architecture only as a separate, approved decision |
| Elementor or Astra updates change markup or default CSS | Child theme effects or overrides break | Child theme targets stable CSS classes only; `scripts/wp/wp-check.mjs`, `wp-reveal-check.mjs` and `wp-shots.mjs` re-run after updates; tested versions recorded (Elementor 4.3.4, Astra 4.14.0) |

---

## 16. Change log

| Version | Date | Change |
|---|---|---|
| 1.0 | 30 Sep 2026 | Initial draft |
| 1.8 | 6 Oct 2026 | WordPress architecture aligned with the approved WP Phase 1 build (D-038, D-039, D-040): Astra Free + minimal Astra child theme + Elementor Free v3 (Containers + native widgets) replace Hello Elementor + Atomic Elements; E1–E3 exceptions, CPTs and `archive-project.php` / `single-project.php` are no longer the approved architecture; Elementor Free limitations documented; projects as static cards + one Elementor page each; Global Kit and eyebrow style recorded; Polylang, SEO plugin, starter-content cleanup and licence files deferred; WP phases replace former Phases 4–5 |
| 1.7 | Phase 3 review | Arabic fonts fixed (El Messiri 500 headings, IBM Plex Sans Arabic body); R10 option (b) approved: E1 extended with a `:lang(ar)` typography variable override; spike extended with a per-language variable override check |
| 1.6 | Phase 2 review | Prototype performance is reference only; Lighthouse gate (≥ 80) moved to Phase 5; header mobile menu added to E2; `tp-marquee` added to animations; services hover image swap replaced by static rows; Div Blocks accepted for missing semantic elements; interactions use only href/alt (no data attributes); spike extended with tag and filter checks; CRM integration out of scope; form success message added to open questions |
| 1.5 | — | Option B approved: closed list of three theme exceptions (theme.css, interactions.js, PHP project templates); RTL rule for global classes; Contact Form 7 replaced by Atomic Forms pending spike; embedded map replaced by a Google Maps link; Phase 4 starts with a verification spike |
| 1.4 | — | Page building moves to Elementor v4 Atomic Editor: Atomic Elements only, global variables and classes, no custom widgets/HTML widget/shortcodes (supersedes former 8.2); theme CSS limited to animations; per-device responsive controls; image rules; solid (non-transparent) header; Full Width page settings; English Home first then owner review |
| 1.3 | Phase 1 review | Homepage approved with the Official identity (monochrome, Playfair Display + Inter); bronze archived; renewed contracting license (expires 06/09/2027) confirmed from website; open questions updated from Phase 1 findings |
| 1.2 | 30 Sep 2026 | Current website taameer.ae added as a second, higher-priority source: updated stats, 6 services, Why Choose Us, partners, contact channels, 1 new project, project fact corrections; open questions reduced |
| 1.1 | 30 Sep 2026 | All PDF images and data approved for use, including licenses and all letters; stock images allowed for gaps; documentation and single-agent rules added |
