"""check-partials.py — verifies the shared blocks are byte-identical on every page (re-runnable QA).

    python scripts/check-partials.py

Every page carries the header, footer, icon sprite, WhatsApp button and CTA band literally, wrapped in
<!-- PARTIAL:name START --> / <!-- PARTIAL:name END --> (they become header.php / footer.php / a
shared template in the WordPress theme). The blocks must match index.html except for the two
per-page facts that are allowed to differ:
  1. the active nav state (aria-current="page" on the current page's link)
  2. the language-switcher target (ar/<this page>.html; the Polylang switcher in WordPress)
Also checks: exactly one active nav link per nav, pointing at the right page; the per-page SEO head
(title, description, Open Graph, canonical/hreflang placeholder); one <h1>; the shared stylesheet set.
Two partial sets: English (reference index.html, pages in the root) and Arabic (reference ar/index.html, pages in ar/).
Arabic pages must match ar/index.html; the Arabic partials must also have the same tag/class skeleton as the English ones
(text may differ). Arabic pages: lang="ar" dir="rtl", assets under ../, language switcher -> ../<page>.html.
Exit code 1 on any failure.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REFERENCE = "index.html"
PARTS = ("sprite", "header", "footer", "whatsapp", "cta")
OPTIONAL = {"cta"}  # pages such as 404 may omit the CTA band
# Pages whose nav highlight is a different page (None = no active link).
NAV_FOR = {"project.html": "projects.html", "404.html": None}
SHARED_CSS = ("tokens.css", "base.css", "layout.css", "components.css", "theme.css", "animations.css")
SHARED_JS = ("animations.js", "interactions.js")

failures = []


def fail(page, msg):
    failures.append(f"{page}: {msg}")


def block(html, name):
    m = re.search(rf"<!-- PARTIAL:{name} START -->(.*?)<!-- PARTIAL:{name} END -->", html, re.S)
    return m.group(1) if m else None


def normalize(text):
    text = text.replace('\r\n', '\n')
    text = re.sub(r' aria-current="page"', "", text)
    text = re.sub(r'href="(?:\.\./)?(?:ar/)?[\w-]+\.html"(?= lang="(?:ar|en)" hreflang)', 'href="LANG-SWITCH"', text)
    return text


def skeleton(text):
    """Tag names and classes only: proves the Arabic partial mirrors the English one."""
    tags = re.findall(r"<([A-Za-z][\w-]*)([^>]*)>", re.sub(r"<!--.*?-->", "", text, flags=re.S))
    out = []
    for name, attrs in tags:
        if name == "bdi":  # bidi isolation added around Latin runs in Arabic text
            continue
        cls = re.search(r'class="([^"]*)"', attrs)
        out.append(name + "." + (cls.group(1) if cls else ""))
    return out


def pages(ar=None):
    en = sorted(ROOT.glob("*.html"))
    arp = sorted((ROOT / "ar").glob("*.html"))
    return en + arp if ar is None else (arp if ar else en)


def main():
    refs = {}
    for is_ar, name in ((False, REFERENCE), (True, "ar/" + REFERENCE)):
        ref_html = (ROOT / name).read_text(encoding="utf-8")
        refs[is_ar] = {n: normalize(block(ref_html, n) or "") for n in PARTS}
        for n in PARTS:
            if not refs[is_ar][n].strip():
                fail(name, f"reference has no PARTIAL:{n} block")
    for n in PARTS:
        if skeleton(refs[False][n]) != skeleton(refs[True][n]):
            fail("ar/index.html", f"PARTIAL:{n} has a different tag/class skeleton from index.html")

    checked = 0
    for path in pages():
        rel = path.relative_to(ROOT).as_posix()
        html = path.read_text(encoding="utf-8")
        checked += 1
        is_ar = path.parent.name == "ar"
        ref = refs[is_ar]
        prefix = "../" if is_ar else ""
        if is_ar and '<html lang="ar" dir="rtl">' not in html:
            fail(rel, 'Arabic page must be <html lang="ar" dir="rtl">')
        if not is_ar and '<html lang="en" dir="ltr">' not in html:
            fail(rel, 'English page must be <html lang="en" dir="ltr">')

        for n in PARTS:
            b = block(html, n)
            if b is None:
                if n not in OPTIONAL:
                    fail(rel, f"missing PARTIAL:{n}")
                continue
            if normalize(b) != ref[n]:
                # show the first differing line to make the drift easy to find
                a, c = normalize(b).splitlines(), ref[n].splitlines()
                first = next((i for i, (x, y) in enumerate(zip(a, c)) if x != y), min(len(a), len(c)))
                got = a[first].strip()[:90] if first < len(a) else "(end)"
                want = c[first].strip()[:90] if first < len(c) else "(end)"
                fail(rel, f"PARTIAL:{n} differs from {REFERENCE} at line {first + 1}: «{got}» vs «{want}»")

        # Active nav state: exactly one per nav, on the right page.
        name = path.name
        expected = NAV_FOR.get(name, name)
        hdr = block(html, "header") or ""
        ftr = block(html, "footer") or ""
        for label, region, css in (("desktop nav", hdr, "tp-nav__link"), ("mobile menu", hdr, "tp-menu__link"),
                                   ("footer quick links", ftr, None)):
            if css:
                links = re.findall(rf'<a class="{css}"[^>]*>', region)
            else:
                m = re.search(r'id="tp-footer-links".*?</nav>', region, re.S)
                links = re.findall(r"<a [^>]*>", m.group(0)) if m else []
            current = [l for l in links if 'aria-current="page"' in l]
            if expected is None:
                if current:
                    fail(rel, f"{label}: no link should be active on this page")
            elif len(current) != 1:
                fail(rel, f"{label}: {len(current)} links marked aria-current (want 1)")
            elif f'href="{expected}"' not in current[0]:
                fail(rel, f"{label}: active link is {current[0]}, expected {expected}")

        # Per-page SEO head.
        head = html.split("</head>")[0]
        title = re.search(r"<title>(.*?)</title>", head, re.S)
        if not title or len(title.group(1).strip()) < 15:
            fail(rel, "missing/short <title>")
        if not re.search(r'<meta name="description" content="[^"]{60,}"', head):
            fail(rel, "missing meta description (>= 60 chars)")
        for prop in ("og:type", "og:site_name", "og:title", "og:description", "og:image"):
            if f'property="{prop}"' not in head:
                fail(rel, f"missing {prop}")
        live = re.sub(r"<!--.*?-->", "", head, flags=re.S)
        if name in ("project.html", "404.html"):
            if "canonical" not in head and name == "project.html":
                fail(rel, "missing canonical/hreflang template comment")
            if re.search(r'<link rel="(canonical|alternate)"', live):
                fail(rel, "template/noindex page must not carry live canonical/hreflang links")
        else:
            slug = "" if name == "index.html" else name[:-5] + "/"
            want = {
                "canonical": "https://www.taameer.ae/" + ("ar/" if is_ar else "") + slug,
                "en": "https://www.taameer.ae/" + slug,
                "ar": "https://www.taameer.ae/ar/" + slug,
                "x-default": "https://www.taameer.ae/" + slug,
            }
            if f'<link rel="canonical" href="{want["canonical"]}">' not in live:
                fail(rel, f"canonical should be {want['canonical']}")
            for lang in ("en", "ar", "x-default"):
                if f'<link rel="alternate" hreflang="{lang}" href="{want[lang]}">' not in live:
                    fail(rel, f"missing hreflang {lang} -> {want[lang]}")
        sw = re.findall(r'<a class="tp-lang__link" href="([^"]+)"', html)
        sw_want = (("../" if is_ar else "ar/") + name)
        if len(sw) != 3 or any(x != sw_want for x in sw):
            fail(rel, f"language switcher should link to {sw_want} (3 times), found {sw}")
        for f in SHARED_CSS:
            if f"{prefix}assets/css/{f}" not in head:
                fail(rel, f"missing stylesheet {f}")
        for f in SHARED_JS:
            if f"{prefix}assets/js/{f}" not in head:
                fail(rel, f"missing script {f}")
        if 'data-brand' in html or 'brand-switcher' in html:
            fail(rel, "brand switcher remnants")
        h1_count = len(re.findall(r"<h1[\s>]", html))
        if h1_count != 1:
            fail(rel, f"{h1_count} <h1> elements (want 1)")
        if "<main id=\"main\"" not in html:
            fail(rel, "missing <main id=\"main\">")

    print(f"checked {checked} page(s): {', '.join(p.relative_to(ROOT).as_posix() for p in pages())}")
    if failures:
        print(f"\n{len(failures)} FAILURE(S):")
        for f in failures:
            print("  FAIL", f)
        sys.exit(1)
    print("check-partials: all pages OK")


if __name__ == "__main__":
    main()
