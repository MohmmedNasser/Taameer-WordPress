> **Historical (superseded by D-038 / D-040, 2026-10-06):** this spike tested the abandoned Hello Elementor + Elementor v4 Atomic plan. The approved architecture is Astra Free + Elementor Free v3 (PRD v1.8 §8.2).

# Spike — owner build steps (Elementor 4.3.3, atomic elements only)

Site: http://taameer.local · Admin: use Local's **WP Admin** button on the "taameer" site (one-click login).
Active theme: *Taameer Plus Child*. Languages: English (default) and Arabic (`/ar/`) already exist in Polylang.

**Rules:** use atomic elements only (Div Block, Heading, Paragraph, Button, Image, …). Do not use legacy widgets (Container, "Text Editor", "HTML", shortcodes). Do not install anything. **The Elementor UI may differ from these instructions.** Wherever it does, write down what you actually saw (menu names, missing controls, lock icons, "Upgrade" prompts). Screenshots are welcome. That is the most valuable output of this step.

Keep a running notes list. At the end, send me the notes together with "done".

---

## 1. Global variables

Open any page in the Elementor editor (create "Spike EN" first, step 3, if easier), then open the **Variables manager** (usually the "Variables" button/icon in the editor's top bar or inside a colour/font picker, "Variables" or "Global variables").

Create:

| Name | Type | Value |
|---|---|---|
| `tp-color-ink` | Colour | `#0D0D0D` |
| `tp-color-fog` | Colour | `#F4F4F4` |
| `tp-font-display` | Font | Playfair Display |

Note for each: did the UI accept the name exactly (hyphens, lowercase)? Did it rename it, add a prefix or show it differently (e.g. `--tp-color-ink`, "Tp color ink")? Any length limit message? Is there a font-variable type at all? If not, say what the UI offers instead.

## 2. Global classes

In the editor, select any element, find the **Classes** field in the Style tab (it may be called "Classes" or "Global classes"). Create these classes (typing the name and choosing "create"). Edit each class's styles in the class editor, not on the element:

1. **`tp-h1`**: font family = the `tp-font-display` variable (if variables can be picked), font size 48px, **text colour = the `tp-color-ink` variable, set explicitly**. Then switch to the **tablet** view and set size 36px; **mobile** view, size 28px.
2. **`tp-btn`**: background = `tp-color-ink`, text colour white, text transform uppercase, border radius 4px, padding of your choice. Add a **hover** state (e.g. background `#262626`). Tablet and mobile: different padding from desktop.
3. **`tp-reveal`**: create it, add no styles.
4. **`tp-counter`**: create it, add no styles.
5. **`tp-lightbox`**: create it, add no styles.
6. **`tp-partner-logo`**: try to add a **filter: grayscale(100%)** (look for "Filter", "CSS filters" or "Effects"). Then add a **hover** state that removes the grayscale. Different max-width on desktop, tablet and mobile.

Report: which controls exist or are missing; is there a filter control at all; can a class have a hover state; are tablet/mobile values editable per class; any lock/upgrade icon; whether a name with hyphens was accepted, whether the editor shows the name unchanged.

Also try, and report the result: **rename** `tp-lightbox` to `tp-lightbox-x` and back. Did the elements using it update?

## 3. Page "Spike EN"

Pages → Add New → title **Spike EN**. In the page settings choose the template **Elementor Full Width** and hide the page title (or note that the option is missing). Edit with Elementor. Build:

1. A **Div Block**. Look for its **HTML tag** setting (Settings tab, "HTML Tag"). Try to set it to `section`. Record **every value offered** in the list (and whether `ul`, `li`, `blockquote`, `figure` are among them).
2. Inside it:
   - **Heading** with text "Spike heading", classes `tp-h1` and `tp-reveal` (both on the same element).
   - **Paragraph** with any text.
   - **Button** with text "Spike button", class `tp-btn`.
   - **Paragraph** with the text `100+`, class `tp-counter`.
   - **Image** (use any image from the media library; upload `assets/img/hero-*.webp` from the repo if none) with a **link to the media file (full-size image)**, class `tp-lightbox`. Put the class on the **Image element** itself; if the UI lets you wrap images in a Div Block and put the class on that Div Block, also build that variant as a second image and tell me which variant you used.
   - **Image** with class `tp-partner-logo`.
3. Look for **custom attributes** (Settings → "Attributes", or Advanced → "Custom attributes") on the Div Block, Heading and Image. Report whether such a field exists and whether it is locked.
4. Publish. Tell me the page URL.

## 4. Form (only if it exists)

In the elements panel search for "Form". If an **atomic Form** element exists (not the legacy "Form" widget, which needs Pro): add it to the page with fields **Name, Email, Message**, set it to send email to the site admin. Report which field types, required/validation options, spam protection and "actions after submit" are offered, and whether anything is locked. Submit it once from the front end and tell me. Local's Mailpit is at the *Tools* tab of the Local site ("Mailpit"). If no atomic Form exists, write "no atomic form".

## 5. Loop (only if it exists)

Search the elements panel for "Loop". If an **atomic Loop** element (Loop Grid or similar) exists: add it to the page, source = **Spike Projects** (post type `tp_spike_project`, 2 posts already created); note whether that post type is selectable, and which posts appear. Also try to list the first 3 regular *Posts*. If no Loop exists, or it is locked/Pro, write "no atomic loop" and what the UI shows (lock, "Upgrade").

## 6. Arabic version

Pages → "Spike EN" row → click the **+** in the Arabic (ar) column of the language column (Polylang) to create **Spike AR**. Open it in Elementor: replace the heading text with `مرحبا بكم في تعمير بلس` and the paragraph with `نص تجريبي بالعربية`. Keep the classes on all elements. Publish. Tell me the URL (expected: http://taameer.local/ar/spike-ar/).

Report any problem with the Polylang + Elementor flow (e.g. the editor not opening, content not copied, classes missing).

## 7. Export (check 10), do this last

1. In the editor, on "Spike EN", use **Save as Template** (or Elementor → My Templates) if available. Then Elementor → My Templates → export the template as JSON. Report whether this works without Pro.
2. Report whether the exported file mentions the global classes and variables. Open the JSON in a text editor and search for `tp-h1` and `tp-color-ink`.
3. Elementor → Tools → *Import/Export Kit* (Site Kit export) if present: tell me if it is available and whether it offers global classes/variables as a separate item. **Do not run an import that overwrites the site.**
4. Re-import the single-page template into a fresh draft page ("Spike Import") and tell me whether the classes still show up.

Drop the exported JSON file(s) in `C:\Users\HP\Desktop\TAAMEER-Company-profile\source\spike\` and tell me the file names.

---

## What to send back

- "Done" + page URLs (Spike EN, Spike AR).
- Notes for every step above, especially where the UI differed from these instructions, and every lock/upgrade prompt.
- Anything you could not do.
