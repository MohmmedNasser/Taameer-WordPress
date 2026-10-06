"""build_ar.py — generates ar/*.html from the English pages (re-runnable; PROTOTYPE TOOLING, never shipped).

    python scripts/build_ar.py            build ar/*.html and fill the English SEO links
    (prints every English string that still has no Arabic entry)

Why a generator: the Arabic pages must mirror the English ones section by section with identical partials
(header, footer, CTA, WhatsApp, sprite). Every text node and text attribute is looked up in scripts/ar_text.py
(+ the data translations in scripts/ar_data.py); the markup, annotations and classes are copied unchanged.
What changes per page: <html lang dir>, <head> (title, description, Open Graph, hreflang/canonical, Arabic fonts),
relative paths (assets/, data/ get ../), the language switcher, <bdi> isolation around Latin runs, and the
"translation from the English original" label next to testimonial excerpts.
After running, edit ar_text.py (not the generated pages) and run again.
"""
import html
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ar_data  # noqa: E402
import ar_text  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ['index', 'about', 'services', 'projects', 'project', 'testimonials', 'contact', '404']
SITE = 'https://www.taameer.ae'
TEXT_ATTRS = ('alt', 'aria-label', 'title', 'placeholder')
META_TEXT = ('description', 'twitter:title', 'twitter:description', 'og:title', 'og:description', 'og:site_name')
AR_FONTS = ('https://fonts.googleapis.com/css2?family=El+Messiri:wght@500&amp;family=IBM+Plex+Sans+Arabic:wght@400;500;600'
            '&amp;display=swap')
TRANSLATED_LABEL = 'ترجمة عن الأصل الإنجليزي'

# ---------------------------------------------------------------- translation lookup


def norm(s):
    return re.sub(r'[\W_]+', '', s.lower())


MEMORY = {}
FUZZY = {}
for src in (ar_data.TR, ar_text.TEXT):
    for k, v in src.items():
        MEMORY[' '.join(k.split())] = v
        FUZZY[norm(k)] = v
IDENT = {' '.join(x.split()) for x in ar_text.IDENT}
missing = {}


def tr(text, page):
    key = ' '.join(text.split())
    if key in MEMORY:
        return MEMORY[key]
    if not key or not re.search(r'[A-Za-z]', key) or key in IDENT:
        return key
    if norm(key) in FUZZY:
        return FUZZY[norm(key)]
    missing.setdefault(key, set()).add(page)
    return key


# ---------------------------------------------------------------- bidi isolation
LATIN_RUN = re.compile(
    r"(\+\d{3}(?: \d+)+)"                                           # phone numbers
    r"|((?:@?\d+[A-Z]|@?[A-Za-z])(?:[A-Za-z0-9+&’'/@_-]|\.(?=[A-Za-z]))*"
    r"(?: (?:[A-Za-z](?:[A-Za-z0-9+&’'/@_-]|\.(?=[A-Za-z]))*))*)")


def has_arabic(s):
    return re.search(r'[؀-ۿ]', s) is not None


def bidi(text):
    """Escape text and wrap Latin runs / phone numbers in <bdi> (only inside Arabic text)."""
    if not has_arabic(text):
        return html.escape(text, quote=False)
    out, pos = [], 0
    for m in LATIN_RUN.finditer(text):
        out.append(html.escape(text[pos:m.start()], quote=False))
        out.append('<bdi>' + html.escape(m.group(0), quote=False) + '</bdi>')
        pos = m.end()
    out.append(html.escape(text[pos:], quote=False))
    return ''.join(out)


# ---------------------------------------------------------------- tokenizer
TOKEN = re.compile(r'(<!--.*?-->|<script\b.*?</script>|<style\b.*?</style>|<[^>]+>)', re.S)
ATTR = re.compile(r'(\s)([\w:-]+)(="([^"]*)")')


def fix_tag(tag, page):
    name = re.match(r'<\s*/?\s*([A-Za-z0-9-]+)', tag)
    name = name.group(1).lower() if name else ''

    # Phone numbers, e-mail addresses and handles must never be reordered by the bidi algorithm.
    if name == 'a' and re.search(r'href="(?:tel:|mailto:|https://wa\.me/|https://instagram\.com/)', tag) and ' dir=' not in tag:
        tag = tag[:-1] + ' dir="ltr">'

    def attr(m):
        sp, k, eq, v = m.group(1), m.group(2), m.group(3), m.group(4)
        raw = html.unescape(v)
        if k in TEXT_ATTRS:
            raw = tr(raw, page)
            return sp + k + '="' + html.escape(raw, quote=True) + '"'
        if k == 'content' and name == 'meta':
            return m.group(0)  # handled in head()
        # paths
        v2 = re.sub(r'(^|[\s,])((?:assets|data)/)', r'\1../\2', v)
        return sp + k + '="' + v2 + '"'

    if name in ('script', 'link', 'img', 'a', 'source', 'template', 'div', 'span', 'ul', 'li', 'section', 'figure', 'meta',
                'nav', 'p', 'input', 'select', 'textarea', 'button', 'abbr', 'svg', 'use', 'dl', 'dt', 'dd', 'blockquote',
                'article', 'h1', 'h2', 'h3', 'h4', 'header', 'footer', 'main', 'label', 'form', 'time', 'em', 'html', 'body',
                'head', 'ol', 'figcaption', 'strong', 'picture', 'aside', 'iframe', 'option', 'bdi', 'small', 'b', 'i'):
        return ATTR.sub(attr, tag)
    return tag


LANG_AR = ('<p class="tp-lang">\n{i}  <span class="tp-lang__current" aria-current="true" lang="ar"><abbr title="العربية">عربي</abbr></span>\n'
           '{i}  <span class="tp-lang__sep" aria-hidden="true">|</span>\n'
           '{i}  <a class="tp-lang__link" href="../{page}.html" lang="en" hreflang="en">English</a>\n{i}</p>')
LANG_BLOCK = re.compile(r'<p class="tp-lang">.*?</p>', re.S)


def lang_switcher(src, page, to_ar):
    def sub(m):
        pre = src[src.rfind(chr(10), 0, m.start()) + 1:m.start()]
        return LANG_AR.format(i=pre if not pre.strip() else '', page=page)
    return LANG_BLOCK.sub(sub, src)


def url(page, ar):
    slug = '' if page == 'index' else page + '/'
    return SITE + ('/ar/' if ar else '/') + slug


SEO_COMMENT = re.compile(r'[ \t]*<!-- (?:SEO \(per page\)|No canonical).*?-->\n', re.S)


def seo_links(page, ar):
    if page == '404':
        return ('  <!-- No canonical/hreflang: the 404 page is noindex (WordPress prints none). -->\n')
    if page == 'project':
        pat = SITE + ('/ar' if ar else '') + '/projects/{slug}/'
        return ('  <!-- SEO (per page): canonical + hreflang cannot be literal in the prototype because the URL depends on ?id=.\n'
                '       WordPress (Polylang + SEO plugin) prints, per project:\n'
                '       <link rel="canonical" href="' + pat + '">\n'
                '       <link rel="alternate" hreflang="en" href="' + SITE + '/projects/{slug}/">\n'
                '       <link rel="alternate" hreflang="ar" href="' + SITE + '/ar/projects/{slug}/">\n'
                '       <link rel="alternate" hreflang="x-default" href="' + SITE + '/projects/{slug}/"> -->\n')
    return ('  <link rel="canonical" href="' + url(page, ar) + '">\n'
            '  <link rel="alternate" hreflang="en" href="' + url(page, False) + '">\n'
            '  <link rel="alternate" hreflang="ar" href="' + url(page, True) + '">\n'
            '  <link rel="alternate" hreflang="x-default" href="' + url(page, False) + '">\n')


def head_meta(src, page):
    def meta(m):
        tag = m.group(0)
        nm = re.search(r'(?:name|property)="([^"]+)"', tag)
        if not nm:
            return tag
        n = nm.group(1)
        if n == 'og:locale':
            return tag.replace('en_US', 'ar_AE')
        if n in META_TEXT:
            cm = re.search(r'content="([^"]*)"', tag)
            val = tr(html.unescape(cm.group(1)), page)
            return tag.replace(cm.group(0), 'content="' + html.escape(val, quote=True) + '"')
        if n == 'og:image':
            return re.sub(r'content="assets/', 'content="../assets/', tag)
        return tag
    return re.sub(r'<meta\b[^>]*>', meta, src)


def build(page):
    path = os.path.join(ROOT, page + '.html')
    src = open(path, encoding='utf-8').read()
    # --- English page: live SEO links instead of the commented placeholder
    en = SEO_COMMENT.sub(lambda m: seo_links(page, False), src) if SEO_COMMENT.search(src) else src
    if en != src:
        open(path, 'w', encoding='utf-8', newline='').write(en)

    s = en
    # --- Arabic variant
    s = SEO_COMMENT.sub('', s)
    s = re.sub(r'(<link rel="canonical"[^\n]*\n(?:\s*<link rel="alternate"[^\n]*\n)*)', '', s)
    s = s.replace('<html lang="en" dir="ltr">', '<html lang="ar" dir="rtl">')
    s = head_meta(s, page)
    s = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2\?family=Playfair[^"]*">',
               '<link rel="stylesheet" href="' + AR_FONTS + '">', s)
    s = lang_switcher(s, page, True)

    parts = TOKEN.split(s)
    out = []
    in_title = False
    in_noprocess = 0
    for tok in parts:
        if not tok:
            continue
        if tok.lower().startswith('<script') and ' src="' in tok:
            out.append(re.sub(r'src="((?:assets|data)/)', r'src="../\1', tok))
            continue
        if tok.startswith('<!--') or tok.lower().startswith('<script') or tok.lower().startswith('<style'):
            out.append(tok)
            continue
        if tok.startswith('<'):
            low = tok.lower()
            if low.startswith('<title'):
                in_title = True
            elif low.startswith('</title'):
                in_title = False
            if low.startswith(('<option', '<textarea')):
                in_noprocess += 1
            elif low.startswith(('</option', '</textarea')):
                in_noprocess = max(0, in_noprocess - 1)
            out.append(fix_tag(tok, page))
            continue
        # text node
        stripped = tok.strip()
        if not stripped:
            out.append(tok)
            continue
        lead = tok[:len(tok) - len(tok.lstrip())]
        trail = tok[len(tok.rstrip()):]
        ar = tr(html.unescape(stripped), page)
        body = html.escape(ar, quote=False) if (in_title or in_noprocess) else bidi(ar)
        out.append(lead + body + trail)
    s = ''.join(out)

    # SEO links go right after the description meta
    s = re.sub(r'(<meta name="description"[^\n]*\n)', lambda m: m.group(1) + seo_links(page, True), s, count=1)

    # testimonial excerpts are translations of third-party letters: label them
    def label(m):
        indent = m.group(1)
        return m.group(0) + '\n' + indent + '<p class="tp-caption">' + TRANSLATED_LABEL + '</p>'
    s = re.sub(r'([ \t]*)<blockquote class="tp-(?:project-)?letter(?:-page)?__(?:quote|excerpt)">.*?</blockquote>', label, s, flags=re.S)

    os.makedirs(os.path.join(ROOT, 'ar'), exist_ok=True)
    open(os.path.join(ROOT, 'ar', page + '.html'), 'w', encoding='utf-8', newline='').write(s)


if __name__ == '__main__':
    for p in PAGES:
        build(p)
    if missing:
        print('MISSING Arabic for', len(missing), 'strings:')
        for k, v in sorted(missing.items()):
            print('  -', k[:150], '|', ','.join(sorted(v)))
    else:
        print('all text translated for', len(PAGES), 'pages')
