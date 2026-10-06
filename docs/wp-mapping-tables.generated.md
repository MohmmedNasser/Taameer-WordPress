## Global variables (every `--tp-` token)

165 variables, generated from `assets/css/tokens.css`. Create each as an Elementor v4 global variable with the same name and value.

| Variable | Value | Note | Layer |
|---|---|---|---|
| `--tp-color-bg` | `#FFFFFF` | official --paper: page background | Color: brand palette (official --paper/--fog/--line/--ink/--charcoal/--slate) |
| `--tp-color-surface` | `#FFFFFF` | cards | Color: brand palette (official --paper/--fog/--line/--ink/--charcoal/--slate) |
| `--tp-color-sand` | `#F4F4F4` | official --fog: alternating sections, footer | Color: brand palette (official --paper/--fog/--line/--ink/--charcoal/--slate) |
| `--tp-color-stone` | `#D9D9D9` | official --line: borders, dividers | Color: brand palette (official --paper/--fog/--line/--ink/--charcoal/--slate) |
| `--tp-color-accent` | `#0D0D0D` | official --ink: "+" marks, hairlines, icons, button fills | Color: brand palette (official --paper/--fog/--line/--ink/--charcoal/--slate) |
| `--tp-color-accent-text` | `#262626` | official --charcoal: small accent text/links (ink stays reserved for headings) | Color: brand palette (official --paper/--fog/--line/--ink/--charcoal/--slate) |
| `--tp-color-secondary` | `#595959` | official --slate: tags, meta (7.0:1 on white) | Color: brand palette (official --paper/--fog/--line/--ink/--charcoal/--slate) |
| `--tp-color-text` | `#0D0D0D` | official --ink: body text and headings | Color: brand palette (official --paper/--fog/--line/--ink/--charcoal/--slate) |
| `--tp-color-text-muted` | `#595959` | official --slate: secondary text | Color: brand palette (official --paper/--fog/--line/--ink/--charcoal/--slate) |
| `--tp-color-on-accent` | `#FFFFFF` | label on ink fill | Color: derived roles |
| `--tp-color-focus` | `var(--tp-color-accent-text)` |  | Color: derived roles |
| `--tp-color-header-scrolled` | `rgb(255 255 255 / 0.94)` | bg at 94% for the sticky header | Color: derived roles |
| `--tp-color-overlay-warm` | `rgb(255 255 255 / 0.55)` | light veil (never dark overlays) | Color: derived roles |
| `--tp-color-shadow` | `13 13 13` | official ink as RGB triplet for shadows | Color: derived roles |
| `--tp-color-lightbox` | `rgb(255 255 255 / 0.97)` | lightbox veil: light, never a dark overlay | Color: derived roles |
| `--tp-font-display` | `"Playfair Display", Georgia, "Times New Roman", serif` |  | Typography (official: Playfair Display headings 600, Inter body) |
| `--tp-font-body` | `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |  | Typography (official: Playfair Display headings 600, Inter body) |
| `--tp-fw-light` | `500` | display weight: official uses 600, eased to 500 for a lighter premium feel | Typography (official: Playfair Display headings 600, Inter body) |
| `--tp-fs-h4` | `clamp(1.25rem, 1.18rem + 0.35vw, 1.5rem)` |  | Typography (official: Playfair Display headings 600, Inter body) |
| `--tp-fs-h3` | `clamp(1.5rem, 1.35rem + 0.7vw, 2.125rem)` |  | Typography (official: Playfair Display headings 600, Inter body) |
| `--tp-fs-h2` | `clamp(1.875rem, 1.5rem + 1.6vw, 3.125rem)` |  | Typography (official: Playfair Display headings 600, Inter body) |
| `--tp-fs-h1` | `clamp(2.375rem, 1.85rem + 2.9vw, 4.75rem)` |  | Typography (official: Playfair Display headings 600, Inter body) |
| `--tp-fs-display` | `clamp(2.75rem, 2.1rem + 3.2vw, 5.5rem)` | stats, pull-quote marks | Typography (official: Playfair Display headings 600, Inter body) |
| `--tp-fs-quote` | `clamp(1.5rem, 1.25rem + 1.1vw, 2.5rem)` |  | Typography (official: Playfair Display headings 600, Inter body) |
| `--tp-tracking-button` | `0.03em` | official .btn letter-spacing | Typography (official: Playfair Display headings 600, Inter body) |
| `--tp-radius-sm` | `2px` |  | Radii (2px buttons, 6px cards, 10px panels) |
| `--tp-radius-md` | `6px` |  | Radii (2px buttons, 6px cards, 10px panels) |
| `--tp-radius-lg` | `10px` |  | Radii (2px buttons, 6px cards, 10px panels) |
| `--tp-shadow-sm` | `0 1px 2px rgb(var(--tp-color-shadow) / 0.06), 0 4px 12px rgb(var(--tp-color-shadow) / 0.05)` |  | Shadows (neutral, soft) |
| `--tp-shadow-md` | `0 2px 6px rgb(var(--tp-color-shadow) / 0.06), 0 12px 32px rgb(var(--tp-color-shadow) / 0.09)` |  | Shadows (neutral, soft) |
| `--tp-shadow-lg` | `0 6px 16px rgb(var(--tp-color-shadow) / 0.07), 0 28px 64px rgb(var(--tp-color-shadow) / 0.13)` |  | Shadows (neutral, soft) |
| `--tp-btn-bg-hover` | `#262626` | official --charcoal | Component: button hover (ink -> charcoal; the official outline-invert hover loses the fill on light pages) |
| `--tp-btn-fg-hover` | `#FFFFFF` |  | Component: button hover (ink -> charcoal; the official outline-invert hover loses the fill on light pages) |
| `--tp-font-display-ar` | `"El Messiri", "IBM Plex Sans Arabic", "Segoe UI", Tahoma, sans-serif` | Phase 3, D-034: H1-H4, pull-quote, stat numbers | Typography: families |
| `--tp-font-body-ar` | `"IBM Plex Sans Arabic", "Segoe UI", Tahoma, sans-serif` | Phase 3 | Typography: families |
| `--tp-fw-regular` | `400` |  | Typography: weights |
| `--tp-fw-medium` | `500` |  | Typography: weights |
| `--tp-fw-semibold` | `600` |  | Typography: weights |
| `--tp-fw-display-ar` | `500` | El Messiri; the only weight loaded | Typography: weights |
| `--tp-fs-xs` | `clamp(0.75rem, 0.73rem + 0.08vw, 0.8125rem)` |  | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-fs-sm` | `clamp(0.875rem, 0.86rem + 0.06vw, 0.9375rem)` |  | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-fs-base` | `clamp(1rem, 0.97rem + 0.12vw, 1.0625rem)` |  | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-fs-lg` | `clamp(1.125rem, 1.07rem + 0.24vw, 1.3125rem)` |  | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-lh-tight` | `1.05` |  | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-lh-heading` | `1.15` |  | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-lh-body` | `1.7` |  | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-lh-snug` | `1.35` |  | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-lh-none` | `1` |  | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-tracking-eyebrow` | `0.22em` |  | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-tracking-display` | `-0.01em` |  | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-transform-label` | `uppercase` | eyebrows, buttons, labels (Latin only; Arabic = none) | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-quote-open` | `"“"` | quotation marks around letter excerpts (Arabic: guillemets) | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-quote-close` | `"”"` |  | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-style-quote` | `italic` | pull-quotes (Latin only; Arabic = normal) | Typography: fluid scale (360px → 1920px viewport) |
| `--tp-space-1` | `0.25rem` |  | Spacing |
| `--tp-space-2` | `0.5rem` |  | Spacing |
| `--tp-space-3` | `0.75rem` |  | Spacing |
| `--tp-space-4` | `1rem` |  | Spacing |
| `--tp-space-5` | `1.5rem` |  | Spacing |
| `--tp-space-6` | `2rem` |  | Spacing |
| `--tp-space-7` | `3rem` |  | Spacing |
| `--tp-space-8` | `4rem` |  | Spacing |
| `--tp-space-9` | `6rem` |  | Spacing |
| `--tp-space-10` | `8rem` |  | Spacing |
| `--tp-section-pad` | `clamp(4.5rem, 3.2rem + 5.5vw, 9.5rem)` |  | Spacing |
| `--tp-section-pad-tight` | `clamp(2.5rem, 2rem + 2vw, 4rem)` |  | Spacing |
| `--tp-gutter` | `clamp(1.25rem, 0.6rem + 3vw, 3rem)` |  | Spacing |
| `--tp-gap` | `clamp(1.5rem, 1rem + 2vw, 3.5rem)` |  | Spacing |
| `--tp-container` | `82.5rem` | 1320px | Layout |
| `--tp-container-narrow` | `52rem` |  | Layout |
| `--tp-header-h` | `5rem` |  | Layout |
| `--tp-header-h-mobile` | `4.25rem` |  | Layout |
| `--tp-measure` | `38rem` | max line length for body copy | Layout |
| `--tp-hero-lead-w` | `34rem` |  | Layout |
| `--tp-hero-media-w` | `36rem` | hero photo is 576px native: keep it near 1x on desktop | Layout |
| `--tp-portrait-w` | `26rem` |  | Layout |
| `--tp-ba-max-w` | `36rem` | before/after sources are ~460px | Layout |
| `--tp-partner-max-w` | `10rem` |  | Layout |
| `--tp-footer-blurb-w` | `30rem` |  | Layout |
| `--tp-footer-label-w` | `3.75rem` |  | Layout |
| `--tp-bp-nav` | `64rem` | documentation only: nav collapses below 1024px (media queries can't use vars) | Layout |
| `--tp-border-w` | `1px` |  | Borders & radii |
| `--tp-hairline` | `var(--tp-border-w) solid var(--tp-color-stone)` |  | Borders & radii |
| `--tp-hairline-accent` | `var(--tp-border-w) solid var(--tp-color-accent)` |  | Borders & radii |
| `--tp-radius-round` | `50%` | the WhatsApp button only | Borders & radii |
| `--tp-focus-ring` | `2px solid var(--tp-color-focus)` |  | Borders & radii |
| `--tp-focus-offset` | `3px` |  | Borders & radii |
| `--tp-dur-fast` | `200ms` |  | Motion |
| `--tp-dur-base` | `400ms` |  | Motion |
| `--tp-dur-slow` | `800ms` |  | Motion |
| `--tp-dur-reveal` | `1000ms` |  | Motion |
| `--tp-dur-marquee` | `45s` |  | Motion |
| `--tp-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |  | Motion |
| `--tp-ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |  | Motion |
| `--tp-reveal-distance` | `2.5rem` |  | Motion |
| `--tp-stagger-step` | `110ms` |  | Motion |
| `--tp-delay-step` | `100ms` | tp-delay-1…5 | Motion |
| `--tp-parallax-speed-base` | `0.1` | unitless factors, read by animations.js | Motion |
| `--tp-parallax-speed-slow` | `0.05` |  | Motion |
| `--tp-parallax-speed-fast` | `0.2` |  | Motion |
| `--tp-hover-zoom` | `1.05` |  | Motion |
| `--tp-z-base` | `1` |  | Layers |
| `--tp-z-fab` | `80` |  | Layers |
| `--tp-z-subnav` | `90` | sticky service navigation, below the header | Layers |
| `--tp-z-header` | `100` |  | Layers |
| `--tp-z-menu` | `200` |  | Layers |
| `--tp-z-skip` | `300` |  | Layers |
| `--tp-btn-bg` | `var(--tp-color-accent)` |  | Layers |
| `--tp-btn-fg` | `var(--tp-color-on-accent)` |  | Layers |
| `--tp-btn-pad-block` | `0.95rem` |  | Layers |
| `--tp-btn-pad-inline` | `1.75rem` |  | Layers |
| `--tp-card-bg` | `var(--tp-color-surface)` |  | Layers |
| `--tp-card-radius` | `var(--tp-radius-md)` |  | Layers |
| `--tp-card-shadow` | `var(--tp-shadow-sm)` |  | Layers |
| `--tp-card-shadow-hover` | `var(--tp-shadow-md)` |  | Layers |
| `--tp-mark-color` | `var(--tp-color-accent)` | setting-out "+" marks on framed images | Layers |
| `--tp-mark-size` | `1.125rem` |  | Layers |
| `--tp-mark-offset` | `-0.5625rem` | half the mark: centres the cross on the frame corner | Layers |
| `--tp-frame-inset` | `clamp(0.75rem, 0.5rem + 1vw, 1.5rem)` |  | Layers |
| `--tp-eyebrow-color` | `var(--tp-color-accent-text)` |  | Layers |
| `--tp-meta-color` | `var(--tp-color-secondary)` |  | Layers |
| `--tp-touch` | `2.75rem` | 44px minimum touch target | Component sizes |
| `--tp-nav-gap` | `clamp(1rem, 0.2rem + 1.5vw, 2.25rem)` |  | Component sizes |
| `--tp-marquee-gap` | `clamp(2.5rem, 1.5rem + 4vw, 5.5rem)` |  | Component sizes |
| `--tp-cta-pad` | `clamp(2rem, 1rem + 5vw, 6rem)` |  | Component sizes |
| `--tp-letter-thumb` | `3.25rem` |  | Component sizes |
| `--tp-blur-header` | `10px` |  | Component sizes |
| `--tp-mask-solid` | `#000` | mask-image opacity stop (not a visible colour) | Component sizes |
| `--tp-logo-h` | `2.75rem` |  | Component sizes |
| `--tp-logo-h-footer` | `3.25rem` |  | Component sizes |
| `--tp-partner-h` | `3rem` |  | Component sizes |
| `--tp-fab-size` | `3.5rem` |  | Component sizes |
| `--tp-icon` | `1.25rem` |  | Component sizes |
| `--tp-plus` | `0.75rem` | the "+" motif | Component sizes |
| `--tp-ba-handle` | `2.75rem` |  | Component sizes |
| `--tp-chipbar-h` | `3.5rem` | sticky service navigation bar | Inner pages |
| `--tp-sticky-offset` | `calc(var(--tp-header-h-mobile) + var(--tp-chipbar-h))` | header + chip bar (desktop: see inner-pages.css) | Inner pages |
| `--tp-letter-sheet-w` | `26rem` | original letter on the testimonials page (sources are 675–1800px wide) | Inner pages |
| `--tp-project-cover-h` | `80vh` | tallest a project cover may grow (portrait covers stay on screen) | Inner pages |
| `--tp-masonry-col` | `17rem` | gallery masonry column width | Inner pages |
| `--tp-lbox-btn` | `3rem` |  | Inner pages |
| `--tp-lbox-chrome` | `7rem` | caption bar + gaps reserved below the lightbox image | Inner pages |
| `--tp-lbox-chrome-mobile` | `11rem` |  | Inner pages |
| `--tp-lbox-pad` | `clamp(1rem, 0.5rem + 2vw, 2.5rem)` |  | Inner pages |
| `--tp-team-photo-ratio` | `700 / 736` | native aspect of the leadership portraits | Inner pages |
| `--tp-license-preview-w` | `8rem` |  | Inner pages |
| `--tp-spec-col-min` | `9rem` | compact spec (licenses, team experience): min column width | Inner pages |
| `--tp-font-display` | `var(--tp-font-display-ar)` |  | Inner pages |
| `--tp-font-body` | `var(--tp-font-body-ar)` |  | Inner pages |
| `--tp-fw-light` | `var(--tp-fw-display-ar)` |  | Inner pages |
| `--tp-tracking-eyebrow` | `0` |  | Inner pages |
| `--tp-tracking-button` | `0` |  | Inner pages |
| `--tp-tracking-display` | `0` |  | Inner pages |
| `--tp-transform-label` | `none` |  | Inner pages |
| `--tp-style-quote` | `normal` |  | Inner pages |
| `--tp-quote-open` | `"«"` |  | Inner pages |
| `--tp-quote-close` | `"»"` |  | Inner pages |
| `--tp-lh-tight` | `1.35` |  | Inner pages |
| `--tp-lh-heading` | `1.4` |  | Inner pages |
| `--tp-lh-snug` | `1.4` |  | Inner pages |
| `--tp-lh-body` | `1.85` |  | Inner pages |
| `--tp-fs-xs` | `clamp(0.8125rem, 0.79rem + 0.1vw, 0.9rem)` |  | Inner pages |
| `--tp-fs-sm` | `clamp(0.9375rem, 0.91rem + 0.1vw, 1.0125rem)` |  | Inner pages |
| `--tp-fs-base` | `clamp(1.0625rem, 1.03rem + 0.14vw, 1.1875rem)` |  | Inner pages |
| `--tp-fs-lg` | `clamp(1.1875rem, 1.12rem + 0.26vw, 1.4rem)` |  | Inner pages |

## Global classes (every reusable class and the properties it sets)

Generated from the ELEMENTOR SOURCE stylesheets. Create one Elementor v4 global class per class name; rules with a media query map to the tablet/mobile controls (the breakpoint is 64em = desktop, below it the base rule). Heading classes `tp-h1`–`tp-h4` set colour explicitly.

### base.css (30 rules)

| Media | Selector | Properties |
|---|---|---|
|  | `*, *::before, *::after` | box-sizing: border-box |
|  | `html` | -webkit-text-size-adjust: 100%; text-size-adjust: 100%; scroll-padding-block-start: calc(var(--tp-header-h) + var(--tp-space-4)) |
| (prefers-reduced-motion: no-preference) | `html` | scroll-behavior: smooth |
|  | `body` | margin: 0; background: var(--tp-color-bg); color: var(--tp-color-text); font-family: var(--tp-font-body); font-size: var(--tp-fs-base); font-weight: var(--tp-fw-regular); line-height: var(--tp-lh-body); text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; overflow-x: clip |
|  | `body.tp-is-locked` | overflow: hidden |
|  | `[hidden]` | display: none !important |
|  | `img, svg, video` | display: block; max-inline-size: 100%; block-size: auto |
|  | `em, i` | font-style: var(--tp-style-quote) |
|  | `h1, h2, h3, h4` | margin: 0; font-family: var(--tp-font-display); font-weight: var(--tp-fw-light); line-height: var(--tp-lh-heading); letter-spacing: var(--tp-tracking-display); text-wrap: balance |
|  | `h1` | font-size: var(--tp-fs-h1); line-height: var(--tp-lh-tight) |
|  | `h2` | font-size: var(--tp-fs-h2) |
|  | `h3` | font-size: var(--tp-fs-h3); font-weight: var(--tp-fw-regular) |
|  | `h4` | font-size: var(--tp-fs-h4); font-weight: var(--tp-fw-medium) |
|  | `.tp-h1, .tp-h2, .tp-h3, .tp-h4` | margin: 0; color: var(--tp-color-text); font-family: var(--tp-font-display); font-weight: var(--tp-fw-light); line-height: var(--tp-lh-heading); letter-spacing: var(--tp-tracking-display); text-wrap: balance |
|  | `.tp-h1` | font-size: var(--tp-fs-h1); line-height: var(--tp-lh-tight) |
|  | `.tp-h2` | font-size: var(--tp-fs-h2) |
|  | `.tp-h3` | font-size: var(--tp-fs-h3); font-weight: var(--tp-fw-regular) |
|  | `.tp-h4` | font-size: var(--tp-fs-h4); font-weight: var(--tp-fw-medium) |
|  | `p, ul, ol, dl, dd, figure, blockquote` | margin: 0 |
|  | `p` | text-wrap: pretty |
|  | `ul[class], ol[class]` | padding: 0; list-style: none |
|  | `a` | color: var(--tp-color-accent-text); text-decoration-thickness: var(--tp-border-w); text-underline-offset: 0.2em; transition: color var(--tp-dur-fast) var(--tp-ease-out) |
|  | `a:hover` | color: var(--tp-color-text) |
|  | `button` | font: inherit; color: inherit; cursor: pointer |
|  | `address` | font-style: normal |
|  | `:focus-visible` | outline: var(--tp-focus-ring); outline-offset: var(--tp-focus-offset) |
|  | `::selection` | background: var(--tp-color-stone); color: var(--tp-color-text) |
|  | `.tp-visually-hidden` | position: absolute !important; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap |
|  | `.tp-skip-link` | position: fixed; inset-block-start: var(--tp-space-3); inset-inline-start: var(--tp-space-3); z-index: var(--tp-z-skip); padding: var(--tp-space-3) var(--tp-space-5); background: var(--tp-color-surface); color: var(--tp-color-text); border-radius: var(--tp-radius-sm); box-shadow: var(--tp-shadow-md); transform: translateY(-200%) |
|  | `.tp-skip-link:focus-visible` | transform: none |

### layout.css (20 rules)

| Media | Selector | Properties |
|---|---|---|
|  | `.tp-section` | position: relative; padding-block: var(--tp-section-pad); background: var(--tp-color-bg) |
|  | `.tp-section--sand` | background: var(--tp-color-sand) |
|  | `.tp-section--surface` | background: var(--tp-color-surface) |
|  | `.tp-section--tight` | padding-block: var(--tp-section-pad-tight) |
|  | `.tp-section--ruled` | border-block: var(--tp-hairline) |
|  | `.tp-container` | inline-size: 100%; max-inline-size: calc(var(--tp-container) + 2 * var(--tp-gutter)); margin-inline: auto; padding-inline: var(--tp-gutter) |
|  | `.tp-container--narrow` | max-inline-size: calc(var(--tp-container-narrow) + 2 * var(--tp-gutter)) |
|  | `.tp-row` | display: flex; flex-wrap: wrap; gap: var(--tp-gap) |
|  | `.tp-row--center` | align-items: center |
|  | `.tp-row--start` | align-items: flex-start |
|  | `.tp-row--end` | align-items: flex-end |
|  | `.tp-row--between` | justify-content: space-between |
|  | `.tp-col` | display: flex; flex-direction: column; gap: var(--tp-space-5); min-inline-size: 0 |
|  | `.tp-col--4` | flex: 1 1 18rem |
|  | `.tp-col--5` | flex: 5 1 20rem |
|  | `.tp-col--6` | flex: 1 1 24rem |
|  | `.tp-col--7` | flex: 7 1 24rem |
|  | `.tp-col--8` | flex: 8 1 26rem |
|  | `.tp-stack > * + *` | margin-block-start: var(--tp-space-5) |
|  | `.tp-stack--lg > * + *` | margin-block-start: var(--tp-space-7) |

### components.css (112 rules)

| Media | Selector | Properties |
|---|---|---|
|  | `.tp-eyebrow` | display: flex; align-items: center; gap: var(--tp-space-3); font-family: var(--tp-font-body); font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-eyebrow); line-height: var(--tp-lh-heading); text-transform: var(--tp-transform-label); color: var(--tp-eyebrow-color) |
|  | `.tp-eyebrow::before` | content: ""; flex: none; inline-size: var(--tp-plus); block-size: var(--tp-plus); background: linear-gradient(var(--tp-color-accent), var(--tp-color-accent)) center / 100% var(--tp-border-w) no-repeat, linear-gradient(var(--tp-color-accent), var(--tp-color-accent)) center / var(--tp-border-w) 100% no-repeat |
|  | `.tp-lead` | font-size: var(--tp-fs-lg); max-inline-size: var(--tp-measure) |
|  | `.tp-caption` | display: flex; align-items: center; gap: var(--tp-space-2); font-size: var(--tp-fs-xs); letter-spacing: var(--tp-tracking-button); text-transform: var(--tp-transform-label); color: var(--tp-meta-color) |
|  | `.tp-caption svg` | color: var(--tp-color-accent) |
|  | `.tp-btn` | display: inline-flex; align-items: center; justify-content: center; gap: var(--tp-space-2); min-block-size: var(--tp-touch); padding: var(--tp-btn-pad-block) var(--tp-btn-pad-inline); border: var(--tp-border-w) solid transparent; border-radius: var(--tp-radius-sm); font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-button); text-transform: var(--tp-transform-label); text-decoration: none; white-space: nowrap; cursor: pointer; transition: background-color var(--tp-dur-fast) var(--tp-ease-out), color var(--tp-dur-fast) var(--tp-ease-out), border-color var(--tp-dur-fast) var(--tp-ease-out) |
|  | `.tp-btn--primary` | background: var(--tp-btn-bg); color: var(--tp-btn-fg) |
|  | `.tp-btn--primary:hover` | background: var(--tp-btn-bg-hover); color: var(--tp-btn-fg-hover) |
|  | `.tp-btn--ghost` | border-color: var(--tp-color-text); color: var(--tp-color-text) |
|  | `.tp-btn--ghost:hover` | background: var(--tp-color-text); color: var(--tp-color-bg) |
|  | `.tp-link` | display: inline-flex; align-items: center; gap: var(--tp-space-2); font-size: var(--tp-fs-sm); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-button); text-transform: var(--tp-transform-label); text-decoration: none; color: var(--tp-color-accent-text); padding-block: var(--tp-space-2); border-block-end: var(--tp-hairline-accent) |
|  | `.tp-link svg` | transition: transform var(--tp-dur-fast) var(--tp-ease-out) |
|  | `.tp-link:hover svg` | transform: translateX(var(--tp-space-1)) |
|  | `.tp-frame` | position: relative; color: var(--tp-mark-color) |
|  | `.tp-frame::before, .tp-frame::after` | content: ""; position: absolute; z-index: var(--tp-z-base); inline-size: var(--tp-mark-size); block-size: var(--tp-mark-size); background: linear-gradient(currentColor, currentColor) center / 100% var(--tp-border-w) no-repeat, linear-gradient(currentColor, currentColor) center / var(--tp-border-w) 100% no-repeat |
|  | `.tp-frame::before` | inset-block-start: calc(var(--tp-mark-offset) - var(--tp-frame-inset)); inset-inline-start: calc(var(--tp-mark-offset) - var(--tp-frame-inset)) |
|  | `.tp-frame::after` | inset-block-end: calc(var(--tp-mark-offset) - var(--tp-frame-inset)); inset-inline-end: calc(var(--tp-mark-offset) - var(--tp-frame-inset)) |
|  | `.tp-frame__clip` | position: relative; overflow: hidden; border-radius: var(--tp-radius-sm); box-shadow: var(--tp-shadow-md) |
|  | `.tp-frame__img` | position: absolute; inset: 0; inline-size: 100%; block-size: 100%; object-fit: cover |
|  | `.tp-hero` | padding-block-start: var(--tp-space-5); padding-block-end: var(--tp-section-pad-tight) |
|  | `.tp-hero__inner` | display: flex; flex-wrap: wrap; align-items: flex-start |
|  | `.tp-hero__panel` | flex: 7 1 32rem; display: flex; flex-direction: column; gap: var(--tp-space-6); padding: var(--tp-space-8) var(--tp-gutter) var(--tp-space-8); margin-inline: calc(-1 * var(--tp-gutter)); background: var(--tp-color-sand) |
|  | `.tp-hero__title` | font-weight: var(--tp-fw-light); text-wrap: balance |
|  | `.tp-hero__plus` | display: inline-block; margin-inline-start: 0.04em; font-size: 0.5em; font-weight: var(--tp-fw-light); vertical-align: 0.95em; line-height: 0; color: var(--tp-color-accent) |
|  | `.tp-hero__lead` | font-size: var(--tp-fs-lg); max-inline-size: var(--tp-hero-lead-w); color: var(--tp-color-text-muted) |
|  | `.tp-hero__actions` | display: flex; flex-wrap: wrap; gap: var(--tp-space-3) |
|  | `.tp-hero__media` | flex: 5 1 20rem; max-inline-size: var(--tp-hero-media-w); display: flex; flex-direction: column; gap: var(--tp-space-4); padding-block-start: var(--tp-space-7) |
|  | `.tp-hero__media .tp-frame__clip` | aspect-ratio: 576 / 541 |
| (min-width: 64em) | `.tp-hero` | padding-block-start: var(--tp-space-6) |
| (min-width: 64em) | `.tp-hero__panel` | margin-inline: 0; padding-block: var(--tp-space-8); padding-inline: var(--tp-space-8) var(--tp-space-10); border-radius: var(--tp-radius-sm); justify-content: center |
| (min-width: 64em) | `.tp-hero__media` | margin-inline-start: calc(-1 * var(--tp-space-9)); padding-block-start: var(--tp-space-9) |
|  | `.tp-compare__media` | align-items: center |
|  | `.tp-partners__title` | margin-block-end: var(--tp-space-6) |
|  | `.tp-about__text h2` | max-inline-size: 20ch |
|  | `.tp-stats` | gap: 0 |
|  | `.tp-stats__item` | display: flex; flex-direction: column-reverse; gap: var(--tp-space-1); padding-block: var(--tp-space-5); border-block-start: var(--tp-hairline) |
|  | `.tp-stats__item:last-child` | border-block-end: var(--tp-hairline) |
|  | `.tp-stats__value` | font-family: var(--tp-font-display); font-size: var(--tp-fs-display); font-weight: var(--tp-fw-light); line-height: var(--tp-lh-none); color: var(--tp-color-text); font-variant-numeric: lining-nums tabular-nums |
|  | `.tp-stats__label` | font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-eyebrow); text-transform: var(--tp-transform-label); color: var(--tp-meta-color) |
|  | `.tp-chairman__media` | max-inline-size: var(--tp-portrait-w) |
|  | `.tp-chairman__media .tp-frame__clip` | aspect-ratio: 706 / 831 |
|  | `.tp-quote` | gap: var(--tp-space-6) |
|  | `.tp-quote__text` | font-family: var(--tp-font-display); font-size: var(--tp-fs-quote); font-style: var(--tp-style-quote); font-weight: var(--tp-fw-light); line-height: var(--tp-lh-heading); max-inline-size: 30ch; text-wrap: pretty |
|  | `.tp-quote__text em` | font-style: normal; color: var(--tp-color-accent-text) |
|  | `.tp-quote__by` | display: flex; flex-direction: column; gap: var(--tp-space-1); padding-inline-start: var(--tp-space-5); border-inline-start: var(--tp-hairline-accent) |
|  | `.tp-quote__name` | font-weight: var(--tp-fw-semibold) |
|  | `.tp-quote__role` | font-size: var(--tp-fs-sm); color: var(--tp-color-text-muted) |
|  | `.tp-section-head` | margin-block-end: var(--tp-space-8) |
|  | `.tp-section-head .tp-col--4` | max-inline-size: var(--tp-measure) |
|  | `.tp-service-list` | border-block-start: var(--tp-hairline) |
|  | `.tp-service` | border-block-end: var(--tp-hairline) |
|  | `.tp-service__link` | position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--tp-space-2) var(--tp-space-5); padding-block: var(--tp-space-6); color: inherit; text-decoration: none |
|  | `.tp-service__title` | grid-column: 1; font-size: var(--tp-fs-h3); font-weight: var(--tp-fw-light); transition: color var(--tp-dur-fast) var(--tp-ease-out) |
|  | `.tp-service__text` | grid-column: 1; max-inline-size: var(--tp-measure); color: var(--tp-color-text-muted) |
|  | `.tp-service__plus` | grid-column: 2; grid-row: 1; align-self: center; color: var(--tp-color-accent); transition: transform var(--tp-dur-base) var(--tp-ease-out) |
|  | `.tp-service__link:hover .tp-service__title, .tp-service__link:focus-visible .tp-service__title` | color: var(--tp-color-accent-text) |
|  | `.tp-service__link:hover .tp-service__plus, .tp-service__link:focus-visible .tp-service__plus` | transform: rotate(90deg) |
|  | `.tp-service__img` | inline-size: 100%; aspect-ratio: 3 / 2; object-fit: cover; margin-block-end: var(--tp-space-6); border-radius: var(--tp-radius-sm) |
| (min-width: 64em) | `.tp-service` | display: flex; align-items: center; gap: var(--tp-space-9); padding-block: var(--tp-space-6) |
| (min-width: 64em) | `.tp-service__link` | flex: 7 1 0; min-inline-size: 0; padding-block: 0 |
| (min-width: 64em) | `.tp-service__img` | flex: 5 1 0; min-inline-size: 0; margin: 0; box-shadow: var(--tp-shadow-md) |
|  | `.tp-why__list` | display: flex; flex-direction: column; margin-block-start: var(--tp-space-4) |
|  | `.tp-why__item` | position: relative; padding-block: var(--tp-space-5); padding-inline-start: var(--tp-space-6); border-block-start: var(--tp-hairline) |
|  | `.tp-why__item::before` | content: ""; position: absolute; inset-inline-start: 0; inset-block-start: calc(var(--tp-space-5) + 0.5em); inline-size: var(--tp-plus); block-size: var(--tp-plus); background: linear-gradient(var(--tp-color-accent), var(--tp-color-accent)) center / 100% var(--tp-border-w) no-repeat, linear-gradient(var(--tp-color-accent), var(--tp-color-accent)) center / var(--tp-border-w) 100% no-repeat |
|  | `.tp-why__title` | font-size: var(--tp-fs-h4); font-weight: var(--tp-fw-medium); margin-block-end: var(--tp-space-2) |
|  | `.tp-why__item p` | color: var(--tp-color-text-muted); max-inline-size: var(--tp-measure) |
|  | `.tp-why__media .tp-frame__clip` | aspect-ratio: 4 / 5 |
|  | `.tp-projects-grid` | display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--tp-gap) |
| (min-width: 40em) | `.tp-projects-grid` | grid-template-columns: repeat(2, minmax(0, 1fr)) |
| (min-width: 64em) | `.tp-projects-grid` | grid-template-columns: repeat(12, minmax(0, 1fr)) |
| (min-width: 64em) | `.tp-projects-grid > *` | grid-column: span 6 |
| (min-width: 64em) | `.tp-projects-grid > :nth-child(6n + 1), .tp-projects-grid > :nth-child(6n + 4)` | grid-column: span 7 |
| (min-width: 64em) | `.tp-projects-grid > :nth-child(6n + 2), .tp-projects-grid > :nth-child(6n + 3)` | grid-column: span 5 |
|  | `.tp-projects-grid__fallback` | grid-column: 1 / -1 |
|  | `.tp-card` | position: relative; display: flex; flex-direction: column; gap: var(--tp-space-4); color: inherit; text-decoration: none |
|  | `.tp-card__media` | position: relative; overflow: hidden; block-size: clamp(15rem, 10rem + 16vw, 30rem); border-radius: var(--tp-card-radius); background: var(--tp-color-sand) |
|  | `.tp-card__img` | inline-size: 100%; block-size: 100%; object-fit: cover; transition: transform var(--tp-dur-slow) var(--tp-ease-out) |
|  | `.tp-card:hover .tp-card__img, .tp-card:focus-visible .tp-card__img` | transform: scale(var(--tp-hover-zoom)) |
|  | `.tp-card__badges` | position: absolute; inset-block-start: var(--tp-space-4); inset-inline-start: var(--tp-space-4); display: flex; flex-wrap: wrap; gap: var(--tp-space-2) |
|  | `.tp-badge` | padding: var(--tp-space-1) var(--tp-space-3); background: var(--tp-color-surface); border-radius: var(--tp-radius-sm); font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-button); text-transform: var(--tp-transform-label); color: var(--tp-color-text); box-shadow: var(--tp-shadow-sm) |
|  | `.tp-card__meta` | display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--tp-space-2); font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-eyebrow); text-transform: var(--tp-transform-label); color: var(--tp-meta-color) |
|  | `.tp-card__title` | font-size: var(--tp-fs-h4); font-weight: var(--tp-fw-regular); transition: color var(--tp-dur-fast) var(--tp-ease-out) |
|  | `.tp-card:hover .tp-card__title` | color: var(--tp-color-accent-text) |
|  | `.tp-card__location` | font-size: var(--tp-fs-sm); color: var(--tp-color-text-muted) |
|  | `.tp-card__more` | display: inline-flex; align-items: center; gap: var(--tp-space-2); font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-button); text-transform: var(--tp-transform-label); color: var(--tp-color-accent-text) |
|  | `.tp-card__more svg` | color: var(--tp-color-accent) |
| (hover: hover) | `.tp-card__more` | opacity: 0; transform: translateY(var(--tp-space-2)); transition: opacity var(--tp-dur-base) var(--tp-ease-out), transform var(--tp-dur-base) var(--tp-ease-out) |
| (hover: hover) | `.tp-card:hover .tp-card__more, .tp-card:focus-visible .tp-card__more` | opacity: 1; transform: none |
|  | `.tp-spec` | display: flex; flex-wrap: wrap; border-block-start: var(--tp-hairline) |
|  | `.tp-spec__row` | flex: 1 1 50%; display: flex; flex-direction: column; gap: var(--tp-space-1); padding: var(--tp-space-4) 0; border-block-end: var(--tp-hairline) |
|  | `.tp-spec__row dt` | font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-eyebrow); text-transform: var(--tp-transform-label); color: var(--tp-meta-color) |
|  | `.tp-spec__row dd` | font-family: var(--tp-font-display); font-size: var(--tp-fs-h4); line-height: var(--tp-lh-heading) |
|  | `.tp-letters` | align-items: stretch |
|  | `.tp-letter__fig` | display: flex; flex-direction: column; justify-content: space-between; gap: var(--tp-space-6); block-size: 100%; padding: var(--tp-space-6); background: var(--tp-card-bg); border-radius: var(--tp-card-radius); box-shadow: var(--tp-card-shadow); transition: box-shadow var(--tp-dur-base) var(--tp-ease-out), transform var(--tp-dur-base) var(--tp-ease-out) |
|  | `.tp-letter__fig:hover` | box-shadow: var(--tp-card-shadow-hover); transform: translateY(calc(-1 * var(--tp-space-1))) |
|  | `.tp-letter__quote` | font-family: var(--tp-font-display); font-size: var(--tp-fs-h4); font-weight: var(--tp-fw-regular); line-height: var(--tp-lh-snug) |
|  | `.tp-letter__quote p::before` | content: var(--tp-quote-open); color: var(--tp-color-accent) |
|  | `.tp-letter__quote p::after` | content: var(--tp-quote-close); color: var(--tp-color-accent) |
|  | `.tp-letter__by` | display: flex; align-items: center; gap: var(--tp-space-4); padding-block-start: var(--tp-space-5); border-block-start: var(--tp-hairline) |
|  | `.tp-letter__thumb` | flex: none; inline-size: var(--tp-letter-thumb); aspect-ratio: 3 / 4; object-fit: cover; object-position: top; border: var(--tp-hairline); border-radius: var(--tp-radius-sm) |
|  | `.tp-letter__company` | display: block; font-weight: var(--tp-fw-semibold); font-size: var(--tp-fs-sm) |
|  | `.tp-letter__author` | display: block; font-size: var(--tp-fs-xs); color: var(--tp-color-text-muted) |
|  | `.tp-cta` | padding-block-start: 0 |
|  | `.tp-cta__box` | position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: var(--tp-space-5); padding: var(--tp-cta-pad); border: var(--tp-hairline-accent); border-radius: var(--tp-radius-sm) |
|  | `.tp-cta__title` | max-inline-size: 18ch |
|  | `.tp-cta__text` | max-inline-size: var(--tp-measure); color: var(--tp-color-text-muted); font-size: var(--tp-fs-lg) |
|  | `.tp-cta__actions` | display: flex; flex-wrap: wrap; align-items: center; gap: var(--tp-space-3) var(--tp-space-6) |
|  | `.tp-cta__contact` | color: var(--tp-color-text); text-decoration: none; font-weight: var(--tp-fw-medium); padding-block: var(--tp-space-2); border-block-end: var(--tp-hairline) |
|  | `.tp-cta__contact:hover` | border-block-end-color: var(--tp-color-accent) |
|  | `[dir="rtl"]` | --tp-origin-start: right |
|  | `[dir="rtl"] .tp-link:hover svg, .tp-link-rtl:hover svg` | transform: translateX(calc(-1 * var(--tp-space-1))) scaleX(-1) |
|  | `[dir="rtl"] .tp-link svg, [dir="rtl"] .tp-card__more svg, .tp-link-rtl svg, .tp-card__more-rtl svg` | transform: scaleX(-1) |

### inner-pages.css (139 rules)

| Media | Selector | Properties |
|---|---|---|
|  | `.tp-page-hero` | padding-block-start: var(--tp-space-6); padding-block-end: var(--tp-section-pad-tight); border-block-end: var(--tp-hairline) |
| (min-width: 64em) | `.tp-page-hero` | padding-block-start: var(--tp-space-7) |
|  | `.tp-page-hero__body` | margin-block-start: var(--tp-space-6); align-items: flex-end |
|  | `.tp-page-hero__text` | gap: var(--tp-space-5) |
|  | `.tp-page-hero__title` | max-inline-size: 16ch |
|  | `.tp-page-hero__lead` | max-inline-size: var(--tp-measure); font-size: var(--tp-fs-lg); color: var(--tp-color-text-muted) |
|  | `.tp-page-hero__media` | flex: 0 1 var(--tp-hero-media-w) |
|  | `.tp-page-hero__media .tp-frame__clip` | aspect-ratio: 4 / 3 |
|  | `.tp-breadcrumb__list` | display: flex; flex-wrap: wrap; align-items: center; gap: 0 var(--tp-space-3); font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-button); text-transform: var(--tp-transform-label) |
|  | `.tp-breadcrumb__list a` | display: inline-block; padding-block: var(--tp-space-2); color: var(--tp-color-text-muted); text-decoration: none |
|  | `.tp-breadcrumb__list a:hover` | color: var(--tp-color-text) |
|  | `.tp-breadcrumb__list [aria-current="page"]` | color: var(--tp-color-text) |
|  | `.tp-breadcrumb__list li + li` | display: flex; align-items: center; gap: var(--tp-space-3) |
|  | `.tp-breadcrumb__list li + li::before` | content: ""; flex: none; inline-size: var(--tp-space-2); block-size: var(--tp-space-2); background: linear-gradient(var(--tp-color-accent), var(--tp-color-accent)) center / 100% var(--tp-border-w) no-repeat, linear-gradient(var(--tp-color-accent), var(--tp-color-accent)) center / var(--tp-border-w) 100% no-repeat |
|  | `.tp-section--sand + .tp-cta` | padding-block-start: var(--tp-section-pad) |
|  | `.tp-chair-page__media` | flex: 0 1 var(--tp-portrait-w); align-self: flex-start |
|  | `.tp-chair-page__media .tp-frame__clip` | aspect-ratio: 706 / 831 |
| (min-width: 64em) | `.tp-chair-page__media` | position: sticky; inset-block-start: calc(var(--tp-header-h) + var(--tp-space-6)) |
|  | `.tp-chair-page__msg` | flex: 1 1 24rem; gap: var(--tp-space-7) |
|  | `.tp-chair-page__lead` | position: relative; font-family: var(--tp-font-display); font-size: var(--tp-fs-h3); font-weight: var(--tp-fw-light); line-height: var(--tp-lh-snug); max-inline-size: 30em; padding-block-start: var(--tp-space-7) |
|  | `.tp-chair-page__lead::before` | content: var(--tp-quote-open); position: absolute; inset-block-start: 0; inset-inline-start: 0; font-size: var(--tp-fs-display); line-height: var(--tp-lh-none); color: var(--tp-color-accent) |
|  | `.tp-chair-page__body` | font-size: var(--tp-fs-lg); max-inline-size: var(--tp-measure) |
|  | `.tp-chair-page__body em` | font-family: var(--tp-font-display); font-weight: var(--tp-fw-light) |
|  | `.tp-chair-page__by` | display: flex; flex-direction: column; gap: var(--tp-space-1); padding-block-start: var(--tp-space-5); border-block-start: var(--tp-hairline-accent); max-inline-size: var(--tp-hero-lead-w) |
|  | `.tp-about-page__text` | flex: 7 1 24rem |
|  | `.tp-about-page__text h2` | max-inline-size: 20ch |
|  | `.tp-about-page__text p` | max-inline-size: var(--tp-measure) |
|  | `.tp-about-page__side` | flex: 5 1 18rem; align-self: center |
|  | `.tp-fact` | gap: var(--tp-space-3); padding: var(--tp-space-7) var(--tp-space-6); background: var(--tp-color-surface); border: var(--tp-hairline); border-radius: var(--tp-radius-sm) |
|  | `.tp-fact__value` | font-family: var(--tp-font-display); font-size: var(--tp-fs-display); font-weight: var(--tp-fw-light); line-height: var(--tp-lh-none); font-variant-numeric: lining-nums tabular-nums |
|  | `.tp-fact__label` | font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-eyebrow); text-transform: var(--tp-transform-label); color: var(--tp-meta-color) |
|  | `.tp-fact__note` | color: var(--tp-color-text-muted) |
|  | `.tp-aims` | display: flex; flex-wrap: wrap; gap: var(--tp-space-6) var(--tp-gap) |
|  | `.tp-aim` | position: relative; flex: 1 1 15rem; display: flex; flex-direction: column; gap: var(--tp-space-3); padding-block-start: var(--tp-space-6); border-block-start: var(--tp-hairline) |
|  | `.tp-aim::before` | content: ""; position: absolute; inset-block-start: calc(var(--tp-plus) / -2); inset-inline-start: 0; inline-size: var(--tp-plus); block-size: var(--tp-plus); background: linear-gradient(var(--tp-color-accent), var(--tp-color-accent)) center / 100% var(--tp-border-w) no-repeat, linear-gradient(var(--tp-color-accent), var(--tp-color-accent)) center / var(--tp-border-w) 100% no-repeat |
|  | `.tp-aim__title` | font-size: var(--tp-fs-h4); font-weight: var(--tp-fw-medium) |
|  | `.tp-aim p` | color: var(--tp-color-text-muted) |
|  | `.tp-team` | display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); gap: var(--tp-space-7) var(--tp-gap) |
|  | `.tp-team__card` | display: flex; flex-direction: column; gap: var(--tp-space-4) |
|  | `.tp-team__photo` | aspect-ratio: var(--tp-team-photo-ratio); overflow: hidden; border-radius: var(--tp-card-radius); background: var(--tp-color-sand); box-shadow: var(--tp-card-shadow) |
|  | `.tp-team__photo img` | inline-size: 100%; block-size: 100%; object-fit: cover |
|  | `.tp-team__name` | font-size: var(--tp-fs-h4); font-weight: var(--tp-fw-medium) |
|  | `.tp-team__role` | font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-eyebrow); text-transform: var(--tp-transform-label); color: var(--tp-eyebrow-color) |
|  | `.tp-team__bio` | color: var(--tp-color-text-muted); max-inline-size: var(--tp-measure) |
|  | `.tp-philosophy` | position: relative; display: flex; flex-direction: column; gap: var(--tp-space-4); margin-block-start: var(--tp-space-8); padding-block-start: var(--tp-space-6); border-block-start: var(--tp-hairline) |
|  | `.tp-philosophy__text` | max-inline-size: 40em; font-family: var(--tp-font-display); font-size: var(--tp-fs-h4); font-weight: var(--tp-fw-light); line-height: var(--tp-lh-snug) |
|  | `.tp-exp` | display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--tp-space-7) var(--tp-gap) |
| (min-width: 40em) | `.tp-exp` | grid-template-columns: repeat(2, minmax(0, 1fr)) |
| (min-width: 64em) | `.tp-exp` | grid-template-columns: repeat(4, minmax(0, 1fr)) |
|  | `.tp-exp__item` | display: flex; flex-direction: column; gap: var(--tp-space-4) |
|  | `.tp-exp__media` | position: relative; overflow: hidden; aspect-ratio: 1 / 1; border-radius: var(--tp-card-radius); background: var(--tp-color-surface); box-shadow: var(--tp-card-shadow) |
|  | `.tp-exp__media img` | inline-size: 100%; block-size: 100%; object-fit: cover |
|  | `.tp-exp__title` | font-size: var(--tp-fs-h4); font-weight: var(--tp-fw-regular) |
|  | `.tp-exp__note` | max-inline-size: var(--tp-measure); font-size: var(--tp-fs-sm); color: var(--tp-color-text-muted) |
|  | `.tp-partner-grid` | --tp-cols: 2; display: flex; flex-wrap: wrap; justify-content: center; gap: var(--tp-space-4) |
| (min-width: 40em) | `.tp-partner-grid` | --tp-cols: 4 |
| (min-width: 64em) | `.tp-partner-grid` | --tp-cols: 7 |
|  | `.tp-partner` | flex: 0 0 calc((100% - (var(--tp-cols) - 1) * var(--tp-space-4)) / var(--tp-cols)); display: grid; place-items: center; min-block-size: calc(var(--tp-partner-h) + 2 * var(--tp-space-5)); padding: var(--tp-space-4); background: var(--tp-color-surface); border: var(--tp-hairline); border-radius: var(--tp-radius-sm); transition: box-shadow var(--tp-dur-base) var(--tp-ease-out), border-color var(--tp-dur-base) var(--tp-ease-out) |
|  | `.tp-partner:hover` | box-shadow: var(--tp-card-shadow); border-color: var(--tp-color-accent) |
|  | `.tp-partner__logo` | block-size: var(--tp-partner-h); inline-size: auto; max-inline-size: 100%; object-fit: contain; filter: grayscale(1); opacity: 0.7; transition: filter var(--tp-dur-base) var(--tp-ease-out), opacity var(--tp-dur-base) var(--tp-ease-out) |
|  | `.tp-partner:hover .tp-partner__logo` | filter: none; opacity: 1 |
|  | `.tp-partner__logo--blend` | mix-blend-mode: multiply |
|  | `.tp-spec--compact .tp-spec__row` | flex-basis: var(--tp-spec-col-min); padding: var(--tp-space-3) 0 |
|  | `.tp-spec--compact .tp-spec__row--wide` | flex-basis: 100% |
|  | `.tp-spec--stack .tp-spec__row` | flex-basis: 100% |
|  | `.tp-spec--compact .tp-spec__row dd` | font-family: var(--tp-font-body); font-size: var(--tp-fs-base); font-weight: var(--tp-fw-medium); line-height: var(--tp-lh-snug); font-variant-numeric: tabular-nums |
|  | `.tp-licenses` | display: flex; flex-wrap: wrap; gap: var(--tp-gap) |
|  | `.tp-license` | flex: 1 1 26rem; display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--tp-space-6); padding: var(--tp-space-6); background: var(--tp-card-bg); border-radius: var(--tp-card-radius); box-shadow: var(--tp-card-shadow) |
|  | `.tp-license__preview` | flex: 0 0 var(--tp-license-preview-w); display: block; border: var(--tp-hairline); border-radius: var(--tp-radius-sm); overflow: hidden; box-shadow: var(--tp-shadow-sm); transition: box-shadow var(--tp-dur-base) var(--tp-ease-out), transform var(--tp-dur-base) var(--tp-ease-out) |
|  | `.tp-license__preview:hover` | box-shadow: var(--tp-shadow-md); transform: translateY(calc(-1 * var(--tp-space-1))) |
|  | `.tp-license__preview img` | inline-size: 100%; aspect-ratio: 3 / 4; object-fit: cover; object-position: top |
|  | `.tp-license__body` | flex: 1 1 14rem; display: flex; flex-direction: column; gap: var(--tp-space-4); min-inline-size: 0 |
|  | `.tp-license__head` | display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--tp-space-3) |
|  | `.tp-license__title` | font-size: var(--tp-fs-h4); font-weight: var(--tp-fw-medium) |
|  | `.tp-license__activities` | display: flex; flex-direction: column; gap: var(--tp-space-1) |
|  | `.tp-license__actions` | display: flex; flex-wrap: wrap; gap: var(--tp-space-3) |
|  | `.tp-service-block` | scroll-margin-block-start: var(--tp-sticky-offset) |
|  | `.tp-service-block__row` | gap: var(--tp-space-7) var(--tp-space-9) |
|  | `.tp-service-block--flip .tp-service-block__row` | flex-direction: row-reverse |
|  | `.tp-service-block__text` | flex: 1 1 24rem; gap: var(--tp-space-5) |
|  | `.tp-service-block__text h2` | max-inline-size: 14ch |
|  | `.tp-service-block__text p:not(.tp-eyebrow, .tp-lead)` | color: var(--tp-color-text-muted); max-inline-size: var(--tp-measure) |
|  | `.tp-service-block__media` | flex: 1 1 24rem |
|  | `.tp-service-block__media .tp-frame__clip` | aspect-ratio: 4 / 3 |
|  | `.tp-service-block__related` | margin-block-start: var(--tp-space-8); padding-block-start: var(--tp-space-6); border-block-start: var(--tp-hairline) |
|  | `.tp-service-block__related-title` | margin-block-end: var(--tp-space-6) |
|  | `.tp-projects-grid--related` | grid-template-columns: minmax(0, 1fr) |
| (min-width: 48em) | `.tp-projects-grid--related` | grid-template-columns: repeat(3, minmax(0, 1fr)) |
| (min-width: 48em) | `.tp-projects-grid--related > :nth-child(n)` | grid-column: auto |
|  | `.tp-projects-grid--related .tp-card__media` | block-size: auto; aspect-ratio: 4 / 3 |
|  | `.tp-projects-grid--even` | grid-template-columns: minmax(0, 1fr) |
| (min-width: 40em) | `.tp-projects-grid--even` | grid-template-columns: repeat(2, minmax(0, 1fr)) |
| (min-width: 64em) | `.tp-projects-grid--even` | grid-template-columns: repeat(3, minmax(0, 1fr)) |
| (min-width: 64em) | `.tp-projects-grid--even > :nth-child(n)` | grid-column: auto |
|  | `.tp-projects-grid--even .tp-card__media` | block-size: auto; aspect-ratio: 4 / 3 |
|  | `.tp-gallery` | display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--tp-space-3) |
| (min-width: 48em) | `.tp-gallery` | grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--tp-space-4) |
|  | `.tp-gallery__item` | position: relative; display: block; overflow: hidden; aspect-ratio: 4 / 3; border-radius: var(--tp-card-radius); background: var(--tp-color-surface); box-shadow: var(--tp-card-shadow) |
|  | `.tp-gallery__item img` | inline-size: 100%; block-size: 100%; object-fit: cover; transition: transform var(--tp-dur-slow) var(--tp-ease-out) |
|  | `.tp-gallery__item:hover img, .tp-gallery__item:focus-visible img` | transform: scale(var(--tp-hover-zoom)) |
|  | `.tp-gallery__item::after` | content: ""; position: absolute; inset-block-end: var(--tp-space-3); inset-inline-end: var(--tp-space-3); inline-size: var(--tp-space-6); block-size: var(--tp-space-6); background: linear-gradient(var(--tp-color-text), var(--tp-color-text)) center / 40% var(--tp-border-w) no-repeat, linear-gradient(var(--tp-color-text), var(--tp-color-text)) center / var(--tp-border-w) 40% no-repeat, var(--tp-color-surface); border-radius: var(--tp-radius-round); box-shadow: var(--tp-shadow-sm) |
| (prefers-reduced-motion: reduce) | `.tp-gallery__item img, .tp-license__preview, .tp-partner, .tp-partner__logo, .tp-chip` | transition: none |
|  | `.tp-letters-page__list` | display: flex; flex-direction: column; gap: var(--tp-space-10) |
|  | `.tp-letter-page` | display: flex; flex-wrap: wrap; align-items: center; gap: var(--tp-space-8); scroll-margin-block-start: var(--tp-space-8) |
|  | `.tp-letter-page--flip` | flex-direction: row-reverse |
|  | `.tp-letter-page__sheet` | flex: 0 1 var(--tp-letter-sheet-w); inline-size: 100% |
|  | `.tp-letter-page__thumb` | position: relative; display: block; overflow: hidden; background: var(--tp-color-surface); border: var(--tp-hairline); border-radius: var(--tp-radius-sm); box-shadow: var(--tp-shadow-lg); text-decoration: none; color: var(--tp-color-text) |
|  | `.tp-letter-page__thumb img` | inline-size: 100%; block-size: auto |
|  | `.tp-letter-page__zoom` | position: absolute; inset-inline: var(--tp-space-4); inset-block-end: var(--tp-space-4); display: inline-flex; align-items: center; justify-content: center; gap: var(--tp-space-2); padding: var(--tp-space-3) var(--tp-space-4); background: var(--tp-color-surface); border-radius: var(--tp-radius-sm); box-shadow: var(--tp-shadow-sm); font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-button); text-transform: var(--tp-transform-label) |
|  | `.tp-letter-page__thumb:hover .tp-letter-page__zoom, .tp-letter-page__thumb:focus-visible .tp-letter-page__zoom` | background: var(--tp-btn-bg); color: var(--tp-btn-fg) |
|  | `.tp-letter-page__text` | flex: 1 1 22rem; display: flex; flex-direction: column; align-items: flex-start; gap: var(--tp-space-5) |
|  | `.tp-letter-page__date` | font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-eyebrow); text-transform: var(--tp-transform-label); color: var(--tp-meta-color) |
|  | `.tp-letter-page__excerpt` | font-family: var(--tp-font-display); font-size: var(--tp-fs-h3); font-weight: var(--tp-fw-regular); line-height: var(--tp-lh-snug); max-inline-size: var(--tp-measure) |
|  | `.tp-letter-page__excerpt p::before` | content: var(--tp-quote-open); color: var(--tp-color-accent) |
|  | `.tp-letter-page__excerpt p::after` | content: var(--tp-quote-close); color: var(--tp-color-accent) |
|  | `.tp-letter-page__by` | display: flex; flex-direction: column; gap: var(--tp-space-1); padding-block-start: var(--tp-space-4); border-block-start: var(--tp-hairline) |
|  | `.tp-letter-page__author` | font-weight: var(--tp-fw-semibold) |
|  | `.tp-letter-page__role, .tp-letter-page__note` | font-size: var(--tp-fs-sm); color: var(--tp-color-text-muted) |
|  | `.tp-contact__info, .tp-contact__form` | gap: var(--tp-space-5) |
|  | `.tp-contact__info a` | color: var(--tp-color-text); text-decoration-color: var(--tp-color-stone) |
|  | `.tp-contact__info a:hover` | text-decoration-color: var(--tp-color-accent) |
|  | `.tp-contact__info address` | font-style: normal |
|  | `.tp-form` | display: flex; flex-direction: column; gap: var(--tp-space-5) |
|  | `.tp-form__field` | display: flex; flex-direction: column; gap: var(--tp-space-2) |
|  | `.tp-form__field label` | font-size: var(--tp-fs-xs); font-weight: var(--tp-fw-semibold); letter-spacing: var(--tp-tracking-eyebrow); text-transform: var(--tp-transform-label); color: var(--tp-color-text) |
|  | `.tp-form__req` | color: var(--tp-color-text) |
|  | `.tp-form input, .tp-form select, .tp-form textarea` | inline-size: 100%; min-block-size: var(--tp-touch); padding: var(--tp-space-3) var(--tp-space-4); background: var(--tp-color-surface); border: var(--tp-hairline); border-radius: var(--tp-radius-sm); font: inherit; color: var(--tp-color-text) |
|  | `.tp-form textarea` | resize: vertical |
|  | `.tp-form input:hover, .tp-form select:hover, .tp-form textarea:hover` | border-color: var(--tp-color-accent) |
|  | `.tp-form [aria-invalid="true"]` | border-color: var(--tp-color-text); box-shadow: inset 0 calc(-1 * var(--tp-space-1)) 0 var(--tp-color-text) |
|  | `.tp-form__error` | font-size: var(--tp-fs-sm); font-weight: var(--tp-fw-medium); color: var(--tp-color-text) |
|  | `.tp-form__error::before` | content: "+ "; color: var(--tp-color-accent) |
|  | `.tp-form__status` | padding: var(--tp-space-4); border: var(--tp-border-w) solid var(--tp-color-text); border-radius: var(--tp-radius-sm); font-weight: var(--tp-fw-semibold) |
|  | `.tp-form__note` | font-size: var(--tp-fs-sm); color: var(--tp-color-text-muted) |
|  | `.tp-form__hp` | position: absolute; inset-inline-start: -10000px; inline-size: 1px; block-size: 1px; overflow: hidden |
|  | `.tp-form__success` | display: flex; flex-direction: column; gap: var(--tp-space-3); padding: var(--tp-space-7); border: var(--tp-hairline); border-radius: var(--tp-radius-sm); background: var(--tp-color-sand) |
|  | `.tp-location` | display: flex; flex-wrap: wrap; align-items: center; gap: var(--tp-space-6); padding: var(--tp-space-8); background: var(--tp-color-surface); border: var(--tp-hairline); border-radius: var(--tp-radius-sm) |
|  | `.tp-location__mark` | flex: none; color: var(--tp-color-accent) |
|  | `.tp-location__text` | flex: 1 1 18rem; display: flex; flex-direction: column; gap: var(--tp-space-3) |

### theme.css (147 rules) — ships as a file (E1), not recreated in Elementor

Selectors only; see the file for properties.

`.tp-404__code`, `.tp-404__hero`, `.tp-404__plus`, `.tp-404__projects`, `.tp-404__text`, `.tp-archive`, `.tp-ba`, `.tp-ba__before`, `.tp-ba__handle`, `.tp-ba__handle svg`, `.tp-ba__handle::before`, `.tp-ba__handle:focus-visible`, `.tp-ba__handle:focus-visible svg`, `.tp-ba__img`, `.tp-ba__img, .tp-ba__before`, `.tp-ba__label`, `.tp-ba__label--after`, `.tp-ba__label--before`, `.tp-before-after`, `.tp-before-after img`, `.tp-chip`, `.tp-chip:focus-visible`, `.tp-chip:hover`, `.tp-chip[aria-current="true"]`, `.tp-chips`, `.tp-chips::-webkit-scrollbar`, `.tp-fab`, `.tp-fab:hover`, `.tp-filter__bar`, `.tp-filter__btn`, `.tp-filter__btn:hover`, `.tp-filter__btn[aria-pressed="true"]`, `.tp-filter__count`, `.tp-filter__empty`, `.tp-footer`, `.tp-footer a`, `.tp-footer a:hover`, `.tp-footer__blurb`, `.tp-footer__bottom`, `.tp-footer__brand`, `.tp-footer__download`, `.tp-footer__grid`, `.tp-footer__heading`, `.tp-footer__label`, `.tp-footer__list`, `.tp-footer__list a`, `.tp-footer__list a[aria-current="page"]`, `.tp-footer__logo`, `.tp-footer__meta`, `.tp-footer__social`, `.tp-footer__social a`, `.tp-header`, `.tp-header__actions`, `.tp-header__actions > .tp-lang`, `.tp-header__cta`, `.tp-header__inner`, `.tp-header__logo`, `.tp-header__logo img`, `.tp-lang`, `.tp-lang abbr`, `.tp-lang__link`, `.tp-lang__link:hover`, `.tp-lang__sep`, `.tp-lbox`, `.tp-lbox, .tp-lbox__img, .tp-lbox__btn`, `.tp-lbox.is-loading .tp-lbox__img`, `.tp-lbox.is-open`, `.tp-lbox__backdrop`, `.tp-lbox__bar`, `.tp-lbox__btn`, `.tp-lbox__btn:hover`, `.tp-lbox__caption`, `.tp-lbox__close`, `.tp-lbox__close svg`, `.tp-lbox__count`, `.tp-lbox__fig`, `.tp-lbox__img`, `.tp-lbox__meta`, `.tp-lbox__next`, `.tp-lbox__prev`, `.tp-lbox__prev svg`, `.tp-masonry`, `.tp-masonry__img`, `.tp-masonry__item`, `.tp-masonry__item:hover .tp-masonry__img, .tp-masonry__item:focus-visible .tp-masonry__img`, `.tp-menu`, `.tp-menu-toggle`, `.tp-menu-toggle, .tp-menu`, `.tp-menu-toggle[aria-expanded="true"] .tp-menu-toggle__icon`, `.tp-menu-toggle__icon`, `.tp-menu.is-open`, `.tp-menu__contact`, `.tp-menu__foot`, `.tp-menu__inner`, `.tp-menu__link`, `.tp-menu__link[aria-current="page"]`, `.tp-nav`, `.tp-nav, .tp-header__cta, .tp-header__actions > .tp-lang`, `.tp-nav__link`, `.tp-nav__link::after`, `.tp-nav__link:hover::after, .tp-nav__link[aria-current="page"]::after`, `.tp-nav__list`, `.tp-notfound`, `.tp-project-body[data-state="empty"]`, `.tp-project-body[data-state="loading"]`, `.tp-project-compare__media`, `.tp-project-cover`, `.tp-project-cover .tp-frame`, `.tp-project-cover .tp-frame__clip`, `.tp-project-cover-wrap`, `.tp-project-cover__plain`, `.tp-project-letter__by`, `.tp-project-letter__fig`, `.tp-project-letter__quote`, `.tp-project-letter__quote p::after`, `.tp-project-letter__quote p::before`, `.tp-project-nav`, `.tp-project-nav__inner`, `.tp-project-nav__label`, `.tp-project-nav__link`, `.tp-project-nav__link:hover .tp-project-nav__label`, `.tp-project-nav__link:hover .tp-project-nav__title`, `.tp-project-nav__next`, `.tp-project-nav__prev .tp-project-nav__label svg`, `.tp-project-nav__title`, `.tp-project-title`, `.tp-render-note`, `.tp-render-note strong`, `.tp-render-note svg`, `.tp-service-nav`, `:root`, `[dir="rtl"] .tp-ba__before`, `[dir="rtl"] .tp-ba__handle`, `[dir="rtl"] .tp-lbox__next svg`, `[dir="rtl"] .tp-lbox__prev svg`, `[dir="rtl"] .tp-project-nav__next .tp-project-nav__label svg`, `[dir="rtl"] .tp-project-nav__prev .tp-project-nav__label svg`
