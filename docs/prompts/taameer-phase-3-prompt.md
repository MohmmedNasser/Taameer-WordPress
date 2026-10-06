# Taameer Plus Website — Phase 3: Arabic (RTL)

## Context

Phase 2 is complete and approved. The owner reviewed your Phase 2 report and approved the decisions recorded in **`docs/PRD.md` v1.6** (replace the file in `docs/` with the provided one before starting; do not edit it).

This session:
- **Part 0**: applies the v1.6 decisions to the prototype.
- **Part A**: Arabic heading font selection (stops for the owner's choice).
- **Parts B–D**: Arabic glossary, Arabic content, and the 8 Arabic pages in `ar/`.
- **Part E**: checks and a copy-review document for the client.

---

## 0. Working rules (unchanged)

1. **No sub-agents.** Never use the Task tool or spawn agents. Work sequentially in the main session.
2. **Save tokens.** Start with `CLAUDE.md` and the latest entries in `docs/progress-log.md`. Read only what you need. Do not re-read the PDF or re-download the website.
3. **Document every task** in `docs/progress-log.md` and `docs/decisions.md` as you complete it. Keep `CLAUDE.md` "Current state" current.
4. **Commit after each part.**
5. Restart the local server when needed (`npx serve .` with the existing `serve.json`).

---

## Part 0 — Apply the v1.6 decisions

1. **R6 — interactions without data attributes.** Change `interactions.js` so the lightbox reads only standard markup: the full-size image from the link's `href`, the caption from the thumbnail image's `alt`. For licenses, the link points directly to the PDF and opens normally (no lightbox). Remove every `data-image` / `data-caption` attribute from all pages and templates. Check that no other interaction depends on custom `data-` attributes; if one does, convert it or list it. Exception: theme templates (E3, PHP) may keep data attributes, since they are not built in Elementor; say so explicitly in `docs/decisions.md`.
2. **R3 — services on Home.** Replace the hover image swap with static rows, one image per service. Remove the sibling-state CSS.
3. **R2 — `tp-marquee`.** Make sure the partner marquee code lives in `animations.css` / `animations.js` as the class `tp-marquee`, with the reduced-motion fallback (static wrapped grid) and reversed direction in RTL.
4. **R1 — header menu.** Already in `interactions.js`: just confirm it and update the docs to show it under E2.
5. **R5 — semantic elements.** No code change. In `docs/wp-mapping.md`, note for each affected section which Div Block / Paragraph replaces the list, blockquote, figure or time element.
6. Update the REPORT table in `docs/wp-mapping.md`: R1, R2, R3, R5, R6 resolved; R4, R7, R8 remain for the Phase 4 spike.
7. Re-run all existing tests (partials, links, contrast, keyboard/ARIA, interactions, projects) on the English pages.

Commit: `Apply PRD v1.6 decisions (R1–R3, R5, R6)`.

---

## Part A — Arabic heading font (stop for the owner)

The body font is **IBM Plex Sans Arabic** (pairs with Inter). The heading font must pair with **Playfair Display**, a high-contrast serif.

1. Create `source/font-test/index.html` (not part of the site). It shows the same Arabic sample in three columns, one per candidate: **El Messiri**, **Noto Naskh Arabic**, **Amiri**. Each column shows:
   - H1: "نبني غداً أفضل"
   - H2: "رسالة رئيس مجلس الإدارة"
   - H3: "التصميم والتنفيذ"
   - A stat: "+100 مشروع منجز"
   - The chairman pull-quote line in Arabic (your draft translation)
   - A body paragraph in IBM Plex Sans Arabic
   - A mixed line: "مقاول معتمد G+4 في دبي منذ 2015"
2. Use the real design tokens (colors, sizes, spacing) so the comparison is honest. **No letter-spacing on Arabic text.**
3. Take a screenshot at 1280 and 375 px into `source/screenshots/phase-3/font-test-*.png`.
4. **Stop and ask the owner which font to use.** Give a two-line assessment of each. Continue only after the answer, and record the choice in `docs/decisions.md`.

---

## Part B — Arabic glossary

Create `docs/glossary-ar.md` before translating anything. Every term used in more than one place gets one fixed translation. Start from these, and add the rest as you go:

| English | Arabic |
|---|---|
| Taameer Plus Contracting LLC | تعمير بلس للمقاولات ش.ذ.م.م (as on the trade license) |
| Construction | الإنشاءات |
| Design & Build | التصميم والتنفيذ |
| Decoration & Fitout | الديكور والتشطيبات الداخلية |
| Fit-out | التشطيبات الداخلية |
| Renovation | التجديد |
| Maintenance | الصيانة |
| Turnkey Projects | مشاريع تسليم المفتاح |
| Value Engineering | الهندسة القيمية |
| Wall Cladding | تكسية الجدران |
| Landscaping | تنسيق الحدائق والمساحات الخارجية |
| Consultant | الاستشاري |
| Approved G+4 Contractor | مقاول معتمد G+4 |
| Ongoing | قيد التنفيذ |
| 3D Visualization | تصور ثلاثي الأبعاد |
| Get a Quote | اطلب عرض سعر |

Rules for the glossary and all Arabic copy:
- **Places** use the forms common in the UAE (نخلة جميرا، جزيرة السعديات، دبي مارينا، داماك هيلز، مدينة محمد بن راشد، عقارات جميرا للجولف، دبي فستيفال سيتي، القرهود…). List each in the glossary.
- **Brand and company names** stay in Latin script: Atlas Copco, KF INC, Faiz Couture, Bella Cure, Jan's Noodles, EMAAR, DAMAC, WASL.
- **People's names**: Arabic forms are not in the sources except "مهند اديب حسين المصلح" on the license. Use your best transliteration (فهيم العلي، مهند المصلح، رؤوف العتيبي، محمد عامر) and mark every one as **needs client confirmation**.
- **Building notation** (G+1, G+4P+H+22+R, 2B+G+6+HC) stays in Latin.
- **Numerals**: Western digits (0–9) everywhere, which is the norm in UAE business Arabic. Be consistent.
- **Number–noun agreement** must be grammatical: 3 أشهر، 8 أشهر، 13 شهراً، 35 يوماً، 120 يوماً، 100 يوم. Month names in the Gulf form (يناير، فبراير، … ديسمبر).

Commit: `Arabic glossary`.

---

## Part C — Arabic content

1. Fill every `ar` field in `data/projects.json`, `team.json`, `testimonials.json`, `site.json`.
2. Write the Arabic copy for all page text that lives in the HTML.
3. **Tone**: Modern Standard Arabic, confident and professional, adapted for the UAE market. Not a literal translation: restructure sentences so they read naturally in Arabic. Never add facts, claims or numbers that are not in the English source.
4. **Chairman's message**: it is written in his personal voice. Translate it with special care, keep it close in meaning, and flag it for client review.
5. **Testimonial excerpts**: these are quotations from third parties. Translate faithfully and label them as translations ("ترجمة عن الأصل الإنجليزي") near the excerpt, with the original letter still available.

Commit: `Arabic content`.

---

## Part D — Arabic pages in `ar/`

Build `ar/index.html`, `ar/about.html`, `ar/services.html`, `ar/projects.html`, `ar/project.html`, `ar/testimonials.html`, `ar/contact.html`, `ar/404.html`, mirroring the English pages section by section, with the same annotations (`ATOMIC` / `THEME` / `INTERACTION` / `REPORT`).

### Document level
- `<html lang="ar" dir="rtl">`.
- Load the Arabic fonts (chosen heading font + IBM Plex Sans Arabic) only on Arabic pages, in a separate font request.
- `hreflang` links on every page in both languages (`en`, `ar`, `x-default` → English), and canonical tags. Fill the placeholders left in Phase 2 on the English pages too.
- Language switcher links to the **equivalent page**, not the homepage. On the project page it keeps the `?id=`. The switcher label in Arabic pages reads "English", in English pages "عربي".

### Typography for Arabic
- **Letter-spacing 0 on all Arabic text.** Tracking breaks Arabic letter joining. This includes buttons: the Official uppercase + tracking button style must not apply to Arabic.
- No `text-transform`, no italics on Arabic.
- Line-height larger than English (around 1.7–1.9 for body, 1.3–1.4 for headings); body size slightly larger if Arabic reads small next to the English scale. Decide by screenshot, not by guess.
- Implement Arabic typography as token overrides scoped to `:lang(ar)` in the ELEMENTOR SOURCE styles, and **add a REPORT item** describing how this maps to Elementor. Two options to present to the owner: (a) separate `-rtl` global classes for every typographic class, or (b) a small `:lang(ar)` variable override in `theme.css`, which would extend exception E1. Do not choose; report both with the number of classes each affects.

### Bidirectional text
- Wrap Latin and numeric runs inside Arabic text (G+4, building notations, brand names, dates with digits) in `<bdi>` or `<span dir="ltr">` wherever the order could flip. Test every such string visually.
- Phone numbers, emails and the WhatsApp number: `dir="ltr"` so they never reverse.
- Arrows and directional icons mirror; the "+" motif does not.

### Interactions in RTL
Verify each in Arabic: header mobile menu, `tp-marquee` direction, before/after drag direction and keyboard arrows, lightbox arrow keys and swipe, projects FLIP filter, scrollspy, gallery order. Fix any that does not mirror correctly.

### Data rendering
Scripts that render from JSON (prototype-only and theme templates) read the language from `<html lang>` and use the matching field. Labels such as "Ongoing", filter names and counts, "Previous / Next", the not-found state and the form messages come from a small string table per language (this becomes Polylang string translation in WordPress; document it in `docs/wp-mapping.md`).

Commit after every two pages.

---

## Part E — Checks and client review document

1. `check-partials.py`: Arabic partials identical across Arabic pages (extend the script for two partial sets).
2. Link checker across both languages, including every language-switcher pair and `hreflang` target.
3. Screenshots of all 8 Arabic pages at 375, 768, 1280, 1920 into `source/screenshots/phase-3/`.
4. No console errors, no horizontal scroll, with and without reduced motion.
5. A scripted check that no Arabic text node has non-zero `letter-spacing` or `text-transform`.
6. Keyboard/ARIA and interaction tests run on the Arabic pages.
7. Lighthouse mobile on the Arabic pages: Accessibility ≥ 95; Performance for reference only.
8. **`docs/ar-copy-review.md`**: the document the client will review. Page by page, a two-column table: English | Arabic, covering every piece of copy including project data, team bios and testimonial excerpts. Mark rows that need confirmation (names, chairman message, testimonial translations) with ⚠. Put the glossary at the end.
9. Update `CLAUDE.md` "Current state" to: *Phase 3 complete, awaiting client approval of Arabic copy; next: Phase 4 (spike first).*

---

## Report back

1. The font chosen and why.
2. What was built, page by page.
3. Translation notes: places where you restructured meaning, terms you added to the glossary, every item marked ⚠.
4. RTL issues found and fixed, and any bidi strings you could not fully resolve.
5. Test results and Lighthouse scores for the Arabic pages.
6. New REPORT items (at least the Arabic typography mapping), each with options for the owner.

Do not start Phase 4.
