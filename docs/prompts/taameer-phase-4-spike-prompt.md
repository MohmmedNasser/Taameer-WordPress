# Taameer Plus Website — Phase 4 Spike: Verify Elementor v4 on LocalWP

## Context

Phases 1–3 (static prototype, English and Arabic) are complete. The Arabic copy is with the client for review; this spike does not depend on it.

Phase 4 converts the prototype into a WordPress site built with **Elementor v4 Atomic Elements (free version)** on a **Hello Elementor child theme**, following `docs/PRD.md` **v1.7** (replace the file in `docs/` with the provided one; do not edit it). Read PRD sections 8.1, 8.2, 8.2.1, 8.2.2, 8.3 and 12 (Phase 4).

Before any theme build, this **spike** checks whether the PRD's assumptions hold on the Elementor version actually installed. Its result decides the rest of Phase 4. **Do not build the theme in this session.** Build only the minimal skeleton the checks need, report, and stop.

---

## 0. Working rules

1. **No sub-agents.** Never use the Task tool or spawn agents. Work sequentially in the main session.
2. **Save tokens.** Start with `CLAUDE.md`, the latest `docs/progress-log.md` entries and `docs/wp-mapping.md`. Do not re-read prototype pages unless a check needs them.
3. **Document every task** in `docs/progress-log.md` and `docs/decisions.md`. Keep `CLAUDE.md` "Current state" current.
4. **Do not guess Elementor's data format.** Elementor v4 stores atomic elements, global classes and variables in structures that differ from v3. Never hand-write `_elementor_data` or kit settings from memory. Content needed for the checks is created by the owner in the editor (Part B), and you inspect what Elementor produced.
5. **Record evidence, not impressions.** For every check: the exact setting, file, DB value or HTML snippet that proves the result, and for anything Pro-gated, what the UI shows (lock icon, upgrade prompt, missing control).
6. You are running inside **Local's site shell**, started from the **repository root** (not from the WordPress folder). The WordPress install is at `C:\Users\HP\Local Sites\taameer\app\public`. Create `wp-cli.yml` in the repository root with `path: "C:/Users/HP/Local Sites/taameer/app/public"` so every `wp` command targets the site without `--path`. Run `wp --info` and `wp core version` first; if WP-CLI cannot reach the database, stop and tell the owner.
7. **Never create, edit or delete files inside the WordPress folder** except through WP-CLI and the theme junction. WordPress core, plugins and uploads are managed by WordPress, not by you.

---

## Part A — Environment and skeleton

1. Record versions: WordPress, PHP, MySQL, Local site URL.
2. Install and activate with WP-CLI: theme **Hello Elementor**, plugins **Elementor** (latest from wordpress.org) and **Polylang**. Do not install Elementor Pro or any other plugin.
3. Record the Elementor version. Check whether the v4 / Atomic Editor is active by default or behind a feature toggle (Elementor → Settings → Features, or the equivalent option). If a toggle is needed, enable it, and record exactly which one.
4. **Theme location (Windows):** the child theme lives in this repository at `wp-theme/taameer-child/`, so it is versioned with the prototype and docs. Link it into the Local site with a directory junction (no admin rights needed):
   `mklink /J "<Local site path>\app\public\wp-content\themes\taameer-child" "<repo path>\wp-theme\taameer-child"`
   Ask the owner for the two paths if you cannot determine them. Confirm WordPress sees the theme with `wp theme list`.
5. **Minimal child theme**, only what the checks need:
   - `style.css` with the child-theme header (Template: hello-elementor).
   - `functions.php` that enqueues the four front-end files **after** Elementor's styles, and nothing else: `assets/css/animations.css`, `assets/js/animations.js`, `assets/css/theme.css`, `assets/js/interactions.js`.
   - Copy `animations.css` and `animations.js` from the prototype as they are.
   - `theme.css` contains **only** the test block for check 6 (below), clearly commented `/* SPIKE */`. `interactions.js` contains only the lightbox section (for check 1b).
6. Polylang: English (default, no URL prefix) and Arabic (`/ar/`, RTL). Use WP-CLI where Polylang supports it; otherwise list the exact clicks for the owner.
7. Commit: `Phase 4 spike: environment and minimal child theme`.

---

## Part B — Owner builds the test content (you write the instructions)

Write `docs/spike-owner-steps.md`: precise click-by-click steps for the owner to build in the Elementor editor, with **atomic elements only**. Then stop and wait for the owner to confirm they are done.

The test content:

1. **Global variables** (Elementor's variables manager): create `tp-color-ink` = `#0D0D0D`, `tp-color-fog` = `#F4F4F4`, and a font variable `tp-font-display` = Playfair Display (or the font equivalent the UI supports). Note in the steps that the owner should report exactly how the UI displays or renames these names.
2. **Global classes**: create `tp-h1` (font from the variable, size, colour set explicitly from `tp-color-ink`), `tp-btn` (fill ink, text white, uppercase, small radius, hover state), `tp-reveal` (no styles), `tp-counter` (no styles), `tp-lightbox` (no styles), `tp-partner-logo` (try to add a grayscale filter, plus a hover state that removes it). Each class gets different values on desktop, tablet and mobile for at least one property.
3. **Page "Spike EN"** (Full Width template, title hidden): a Div Block (try to set its HTML tag to `section`) containing a Heading with `tp-h1` + `tp-reveal`, a Paragraph, a Button with `tp-btn`, a Paragraph containing "100+" with `tp-counter`, an Image wrapped in a link to the full-size image with `tp-lightbox`, and an Image with `tp-partner-logo`.
4. **Form**: if an atomic Form element exists, add one with name, email and message fields, set it to email the site admin.
5. **Loop**: if an atomic Loop element exists, try to place it on the page and list the first 3 posts.
6. **Arabic**: create the Arabic translation of "Spike EN" with Polylang ("Spike AR"), replace the heading and paragraph with Arabic text, keep the same classes.

---

## Part C — The checks

After the owner confirms, inspect the front end (fetch the page HTML from the Local URL), the generated Elementor CSS files, the database (`wp post meta get`, `wp option get`, `wp db query` read-only) and the editor behaviour reported by the owner.

| # | Check | What decides it |
|---|---|---|
| 1 | **Global class names in HTML** | Do `tp-h1`, `tp-reveal`, `tp-counter`, `tp-lightbox` appear unchanged in the `class` attribute of the rendered elements? If renamed or prefixed, record the exact pattern |
| 1b | **Theme JS on atomic markup** | Does `tp-reveal` animate, does `tp-counter` count to 100 keeping "+", does `tp-lightbox` open the full image? |
| 2 | **Atomic Forms** | Available in free? Does a submission arrive in Local's Mailpit? Which fields and validation options exist? |
| 3 | **Atomic Loop** | Available in free? Can it query the Project CPT (register a throwaway CPT with 2 posts in the spike `functions.php` block, clearly marked `/* SPIKE */`)? |
| 4 | **Div Block HTML tag** | Can its tag be set (`section`, `ul`, `li`, `blockquote`, `figure`)? Which values are offered? |
| 5 | **CSS filter control** | Does the class editor offer `filter: grayscale()` and per-state (hover) styles? |
| 6 | **Per-language variable override** | Where and under which names does Elementor output the variables (`:root`, kit class, file vs inline)? Is `theme.css` loaded after them? Add `/* SPIKE */ :lang(ar) { --<actual variable name>: <test value>; }` in `theme.css` and confirm the Arabic page picks up the override while the English page does not |
| 7 | **Responsive per device** | Do the class's tablet and mobile values render as media queries in the generated CSS? Record the breakpoints |
| 8 | **RTL** | On "Spike AR": is `dir="rtl"` set on `<html>`? Do alignment and spacing in classes mirror automatically, or stay physical (left/right)? Which properties need `-rtl` twins? |
| 9 | **Class and variable naming rules** | Are hyphens, lowercase and the `tp-` prefix accepted? Any length limit? Does renaming a class update its uses? |
| 10 | **Export / import** | Can the page be exported as a template from the free version? Does the export include the global classes and variables, or are those exported separately (site kit export)? Re-import into a fresh page to confirm |
| 11 | **Performance options in free** | List Elementor's performance-related features available without Pro (CSS output method, element caching, optimised assets, font loading) and their current state |
| 12 | **Custom attributes** | Is there any way to add custom HTML attributes to an atomic element in free? (Informational: the PRD no longer depends on it) |

---

## Part D — Spike report

Write `docs/spike-report.md`:

1. Environment table (all versions, feature toggles).
2. One row per check: **Result** (Yes / No / Partial), **Evidence**, **Impact on the PRD** (which section is confirmed, changed or blocked), **Recommended action**.
3. A **Go / Adjust / Stop** verdict for the Elementor v4 approach:
   - **Go**: all PRD assumptions hold.
   - **Adjust**: specific PRD changes needed; list each, with the options for the owner to choose from.
   - **Stop**: a blocker makes Atomic-only unworkable; explain and propose alternatives.
4. Decisions that follow from checks 2 and 3 (forms, featured projects, and whether the Team and Testimonial CPTs are still needed, as noted in PRD section 6).
5. Everything marked `/* SPIKE */` and how to remove it.

Update `CLAUDE.md` "Current state" to: *Phase 4 spike complete; awaiting owner decision on the spike report.* Commit: `Phase 4 spike report`.

---

## Report back

The verdict, the table of results, the decisions the owner must make, and the exact steps the owner took in Part B that did not match your instructions (the UI may differ from what you expected; record what it actually looked like).

Do not start the theme build.
