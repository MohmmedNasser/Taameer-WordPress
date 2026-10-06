# Phase 1 — WordPress + Elementor Foundation & Homepage

(Owner prompt, received 2026-10-06. Supersedes the Phase 4 Hello Elementor / Atomic plan; see docs/decisions.md D-038.)

## Approved Architecture

* WordPress: local installation at `https://taameer.local`
* Theme: Astra Free
* Page builder: Elementor Free
* Novamira: connected and authorized
* Elementor v3 approach: Containers + native Elementor widgets
* Astra Child Theme: allowed only for minimal custom CSS/JS
* Do NOT use Elementor Atomic Editor / v4 Atomic Elements
* Do NOT create a traditional custom WordPress theme
* Do NOT use Elementor Pro features because Elementor Pro is not installed
* Arabic/RTL is NOT part of this phase
* Do NOT install Polylang yet
* English website is the current scope
* The original static HTML/CSS/JS project remains the visual source of truth

The goal is to rebuild the website as a native, editable WordPress + Elementor website while preserving the original design as accurately as possible.

## Phase 1 Scope

Implement ONLY: 1 WordPress foundation · 2 Astra configuration · 3 Elementor Global Kit configuration · 4 Minimal Astra Child Theme · 5 Asset migration · 6 Header · 7 Footer · 8 Reusable CTA component · 9 Homepage · 10 Homepage verification. After the homepage is completed and verified, STOP.

Do NOT build: About, Services, Projects, individual project pages, Testimonials, Contact, 404, Arabic pages, Polylang integration.

## 1. Safety and Existing Project Protection
Verify Git status/branch/no unexpected changes. Do not modify or delete the original static HTML/CSS/JS files or design assets. No history rewrites, no pushes, no destructive WordPress database operations, no deleting WordPress content unless confirmed disposable. No additional plugins unless absolutely necessary and approved. No Elementor Pro, no Polylang. Use Novamira for WordPress operations. Verify what is affected before any potentially destructive operation.

## 2. WordPress Foundation
Inspect again before modifying. Site uses Astra Free, Elementor Free, Novamira, WPForms Lite only. Elementor: Containers on, Nested elements on, Optimized markup on, Atomic Elements off. Remove/ignore only clearly unused starter/demo content if safe.

## 3. Astra Configuration
Astra for site identity, basic typography, header, footer, navigation, responsive mobile menu, global structure. Header must match the static site: logo, navigation, language switcher (visual only, no Polylang), CTA button, mobile navigation, sticky behaviour. Use minimal child-theme CSS/JS where Astra Free cannot.

## 4. Astra Child Theme
Minimal; only for custom CSS classes, sticky header, frame effects, marquee, partner grayscale, masonry, before/after, scrollspy, other small interactions. No PHP page layouts, no custom page templates, no full HTML in PHP.

## 5. Elementor Global Kit
Colors: Primary/Ink #0D0D0D, Secondary/Slate #595959, Text #0D0D0D, Accent/Charcoal #262626, Paper #FFFFFF, Fog #F4F4F4, Line #D9D9D9 (no duplicates).
Typography: Headings Playfair Display 500; Body Inter 400; Accent/buttons/eyebrow Inter 500 uppercase ~0.03em. Preserve hierarchy H1, H2, H3, H4, Lead, Body, Small, Quote, Stat, Button/Eyebrow; responsive controls and clamp() where needed; no arbitrary sizes.

## 6. Responsive Foundation
Original: mobile-first, 640/768/1024. Use Elementor's 767/1024; minimal custom CSS where 640 is genuinely needed; preserve visual behaviour. Test 320, 375, 390, 768, 1024, 1280, 1440.

## 7. Asset Migration
~192 original images + 3 PDFs into the Media Library. Originals only, no placeholders, no `-md` variants (WordPress generates sizes). Keep filenames, quality, alt text from the HTML. No recompression. Verify availability.

## 8. Header
Astra Header Builder where possible: logo, primary navigation, language switcher visual, CTA button, mobile menu. Preserve height, spacing, typography, alignment, borders, responsive behaviour, hierarchy. Sticky via minimal child-theme CSS/JS.

## 9. Footer
Astra Free where possible: quick links, services, contact information, profile PDF download (pointing to the uploaded media file). Preserve visual treatment and spacing.

## 10. CTA Component
Reusable Elementor saved template where possible; visually match the original; reused in later phases.

## 11. Homepage
Rebuild only the homepage from `index.html` with Containers and native widgets (Heading, Text Editor, Image, Button, Icon, Icon Box/Image Box, Counter…). Preserve all ~10 sections. Map every section to its Elementor equivalent before implementation.

## 12. Important Elementor Rule
No page made of one HTML widget, no pasted full CSS or JS. Editable via Pages → Home → Edit with Elementor.

## 13. Preserve Special Design Effects
Native first (entrance animations, Counter, lightbox, responsive controls). Child-theme CSS/JS only for what cannot be native. Respect prefers-reduced-motion. No external animation libraries.

## 14. CSS Classes
Keep meaningful component classes (tp-frame, tp-spec, tp-marquee, tp-card…) only where needed. Do not copy the whole BEM stylesheet. Keep child CSS organised and documented.

## 15. Homepage Semantics and SEO
Heading hierarchy, alt text, link/button semantics, landmarks, accessible labels, keyboard access, focus states, reduced motion.

## 16. Verification
Visual (header, hero, typography, colours, spacing, images, buttons, cards, sections, CTA, footer); responsive at the seven widths; functional (navigation, buttons, links, mobile menu, sticky header, images, lightbox, animations, reduced motion); WordPress (no PHP errors, no console errors, no broken images/links from migration, Elementor reopens/edits/saves, renders after reload).

## 17. Do Not Continue to Other Pages — STOP after the homepage.

## 18. Final Report
Git state before/after; WordPress, Astra, Global Kit changes; child theme files; assets uploaded; header, footer, CTA, homepage implementation; custom CSS; custom JS; native features used; known limitations; responsive results; remaining manual-review issues. State whether the homepage is ready for visual review, the local URL, and any decisions needed.
