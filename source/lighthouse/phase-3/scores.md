# Lighthouse (mobile, simulated slow 4G) — Arabic pages, Phase 3

`PREFIX=ar/ node scripts/lighthouse-run.mjs source/lighthouse/phase-3` against `python -m http.server 5173`. The full reports (about 11 MB) were not kept; re-run the command to regenerate them.

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| ar/index | 74 | 100 | 96 | 100 | 4.5 s | 0 | 0 ms |
| ar/about | 79 | 100 | 96 | 100 | 3.7 s | 0 | 0 ms |
| ar/services | 57 | 100 | 96 | 100 | 7.2 s | 0 | 0 ms |
| ar/projects | 76 | 100 | 96 | 100 | 4.4 s | 0 | 0 ms |
| ar/project (?id=dubai-g-residential-villa) | 67 | 100 | 96 | 100 | 4.8 s | 0 | 0 ms |
| ar/testimonials | 81 | 100 | 96 | 100 | 3.6 s | 0 | 0 ms |
| ar/contact | 82 | 100 | 96 | 100 | 3.4 s | 0 | 0 ms |
| ar/404 | 82 | 100 | 96 | 63 | 3.8 s | 0 | 0 ms |

Accessibility is 100 on all 8 (gate: >= 95). Performance is for reference only (the gate moved to Phase 5, PRD v1.6); it is 5-30 points below the English pages, mostly LCP on image-heavy pages over the throttled connection. SEO 63 on the 404 is its required `noindex`.
