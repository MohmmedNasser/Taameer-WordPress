# Brand identity (extracted from taameer.ae) — the only brand

This is the one and only brand of the site (the client approved it over the warm-bronze variant, tag `v1-bronze`). It is implemented in `assets/css/tokens.css`.

Source: the live site's inline `<style>` in `source/site/index.html` (the site has **no external stylesheet**; only Google Fonts + Font Awesome links) and the two logo JPGs. Nothing here is guessed; counts are occurrences in that stylesheet.

## Palette (CSS custom properties defined by the site)
| Var | Hex | Uses | Role on taameer.ae |
|---|---|---|---|
| `--ink` | `#0D0D0D` | 43 `var()` uses (+ `rgba(13,13,13,…)` overlays) | Body/heading text, solid buttons, hero/testimonial/footer backgrounds, "+" mark, text selection |
| `--paper` | `#FFFFFF` | 14 (+ 41 literal `#fff`) | Page background, text on dark, light buttons |
| `--line` | `#D9D9D9` | 20 | Borders, dividers, outlines |
| `--slate` | `#595959` | 16 | Secondary text |
| `--fog` | `#F4F4F4` | 8 | Alternating section background, tag chips |
| `--charcoal` | `#262626` | 5 | Dark surfaces, secondary dark |
| `--line-soft` | `#E8E8E8` | 2 | Faint dividers |
| `--mist` | `#8C8C8C` | 1 | Placeholder/faint text |

Literals seen outside variables: `#333333`, `#1A1A1A`, `#111`, `#D4D4D4`, `#B5B5B5`, `#A8A8A8` (dark-section text/greys), `rgba(255,255,255,.04–.5)` (borders/text on dark), `rgba(0,0,0,.2–.25)` (shadows).

**There is no chromatic colour at all.** The identity is pure neutral: ink, greys, white.

## Typography
- Headings `h1–h6`: **Playfair Display** 600, `letter-spacing: -0.01em`; hero h1 4.2rem/700; section h2 2.5rem; quotes Playfair italic 500 1.4rem.
- Body, nav, buttons: **Inter** (400 body, 500 nav, 600 buttons), line-height 1.7. Weight 300 for the hero lead.
- Also loaded: Atkinson Hyperlegible (accessibility panel only). Font Awesome 6.4 for icons (we keep our SVG sprite).
- Arabic: none defined, so Noto Kufi Arabic / IBM Plex Sans Arabic stay.

## UI patterns
- Buttons `.btn`: Inter 600, 0.85rem, **uppercase, letter-spacing .03em, radius 2px**, padding 13×28. Variants: solid-dark (ink fill, white text; hover → transparent + ink text), outline-dark, and light versions for dark sections.
- Radii: 2px buttons, 6px logo tiles/small controls, 10px panels, 50% circles (icon buttons).
- Shadows: almost none on the page; only floating UI (`0 4px 16px rgba(0,0,0,.25)`, panel `0 12px 40px rgba(0,0,0,.2)`).
- Layout: 1200px container, 24px gutters, sections `110px 0`, hairline `--line` borders, the "+" mark (`.plus-mark`, ink, 1.5px strokes) as separator/bullet.
- Section backgrounds: white ↔ fog alternating; **ink** for header, hero (photo under a ~55–92% ink gradient), testimonials and footer; charcoal in one block.

## Logo
`images/header/logo.jpg` and `images/footer/logo.jpg` (863×277, identical): a single colour, pure black `#000` (≈208,600 px; nothing else) on white. Our `assets/img/logo-taameer-plus.webp` is the same black wordmark on transparent, so it works unchanged on both brands (no logo swap needed).

## How the official site uses it
Dark, cinematic, high-contrast: full-bleed dark hero and footer with white type, white solid buttons on dark. The palette is strictly monochrome, so colour comes only from photography.
