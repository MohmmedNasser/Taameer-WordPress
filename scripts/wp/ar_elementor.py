"""ar_elementor.py — turns an English Elementor document (the approved WordPress page) into its Arabic twin (WP Phase 8).

Used by 14-arabic.py. The Arabic pages keep the English element tree, classes, CSS IDs, responsive settings and animations
(same generated architecture, D-045); only these change:
  * text: every text node and text attribute (alt, aria-label, title) is looked up in the prototype's translation memory
    (scripts/ar_text.py + scripts/ar_data.py, the same lookup that generated ar/*.html, via build_ar.tr) plus the pairs
    collected from the rendered static Arabic pages (ar-pairs.json, built by 14-arabic.py); Latin runs and phone numbers
    inside Arabic text are isolated in <bdi>; tel:/mailto:/WhatsApp/Instagram links get dir="ltr" (as build_ar.py does);
  * links: internal URLs gain the /ar/ prefix (same slugs, D-045); media, tel:, mailto: and external links are unchanged;
  * media: image / gallery attachment ids are swapped for their Arabic Polylang media translations (Arabic alt + title);
  * templates and forms: [tp_template id] and the WPForms form id point to their Arabic copies;
  * typography: per-widget custom fonts follow the prototype's :lang(ar) tokens (tokens.css): Playfair Display → El Messiri
    500, Inter → IBM Plex Sans Arabic, letter-spacing 0, no uppercase, no italics, taller line heights, small sizes +8 %;
    the Kit's global fonts are overridden for Arabic in the child theme (taameer-ar.css);
  * direction: the few asymmetric physical dimensions (padding / margin / border width / radius) swap left ↔ right.
Prototype tooling style: no third-party packages.
"""
import html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))  # scripts/
import build_ar  # noqa: E402  (translation memory + bidi isolation of the prototype)

TRANSLATED_LABEL = build_ar.TRANSLATED_LABEL
missing = {}
EXTRA = {}  # filled by load_pairs(): English text -> Arabic, collected from the rendered static pages


def load_pairs(path):
    if os.path.exists(path):
        for k, v in json.load(open(path, encoding='utf-8')).items():
            EXTRA[' '.join(k.split())] = v


def tr(text, where=''):
    key = ' '.join(text.split())
    if key in build_ar.MEMORY:  # exact entries first, punctuation-only ones too ('”' -> '»')
        return build_ar.MEMORY[key]
    if not key or not re.search(r'[A-Za-z]', key) or re.match(r'^\[[a-z_]+[^\]]*\]$', key):  # shortcodes stay
        return key
    if key in EXTRA:
        return EXTRA[key]
    if key in build_ar.IDENT:
        return key
    n = build_ar.norm(key)
    if n in build_ar.FUZZY:
        ar = build_ar.FUZZY[n]
        # A quoted English excerpt (“…”) matched its unquoted entry: Arabic quotation marks, as the prototype's «…».
        if key[0] in '“"' and key[-1] in '”"' and not ar.startswith('«'):
            ar = '«' + ar + '»'
        return ar
    missing.setdefault(key, set()).add(where)
    return key


# ---------------------------------------------------------------- links
LANG_PATHS = ('about', 'services', 'projects', 'testimonials', 'contact')


def ar_url(url):
    if not isinstance(url, str) or not url:
        return url
    m = re.match(r'^(https?://taameer\.local)?(/[^?#]*)?([?#].*)?$', url)
    if not m or url.startswith('//'):
        return url
    host, path, rest = m.group(1) or '', m.group(2), m.group(3) or ''
    if path is None:
        return url
    if path.startswith(('/wp-content/', '/wp-admin/', '/ar/')) or path == '/ar':
        return url
    if path == '/' or path.split('/')[1] in LANG_PATHS:
        return host + '/ar' + path + rest
    return url


# ---------------------------------------------------------------- HTML text
TOKEN = re.compile(r'(<!--.*?-->|<[^>]+>)', re.S)
ATTR = re.compile(r'(\s)([\w:-]+)(="([^"]*)")')
TEXT_ATTRS = ('alt', 'aria-label', 'title', 'placeholder')


def fix_tag(tag, where):
    name = re.match(r'<\s*/?\s*([A-Za-z0-9-]+)', tag)
    name = name.group(1).lower() if name else ''
    if name == 'a' and re.search(r'href="(?:tel:|mailto:|https://wa\.me/|https://instagram\.com/)', tag) and ' dir=' not in tag:
        tag = re.sub(r'\s*/?>$', lambda m: ' dir="ltr"' + m.group(0).strip(), tag)

    def attr(m):
        sp, k, v = m.group(1), m.group(2), m.group(4)
        if k in TEXT_ATTRS:
            return sp + k + '="' + html.escape(tr(html.unescape(v), where), quote=True) + '"'
        if k == 'href':
            return sp + k + '="' + ar_url(html.unescape(v)).replace('&', '&amp;') + '"'
        return m.group(0)
    return ATTR.sub(attr, tag)


def tr_html(src, where=''):
    """Translate the text nodes and text attributes of an HTML fragment (Heading title, Text Editor, Button text)."""
    out = []
    for tok in TOKEN.split(src):
        if not tok:
            continue
        if tok.startswith('<!--'):
            out.append(tok)
        elif tok.startswith('<'):
            out.append(fix_tag(tok, where))
        elif not tok.strip():
            out.append(tok)
        else:
            lead = tok[:len(tok) - len(tok.lstrip())]
            trail = tok[len(tok.rstrip()):]
            out.append(lead + build_ar.bidi(tr(html.unescape(tok.strip()), where)) + trail)
    return ''.join(out)


def tr_html_whole(src, where=''):
    """Like tr_html, but first tries the whole fragment's text as one string (a heading with a <br> or a <span>)."""
    plain = ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', src)).split())
    if '<' in src and plain and re.search(r'[A-Za-z]', plain):
        key = plain
        hit = build_ar.MEMORY.get(key) or EXTRA.get(key) or build_ar.FUZZY.get(build_ar.norm(key))
        if hit:
            # keep decorations that carry no words (e.g. <span class="tp-hero-plus">+</span>) at the end
            deco = ''.join(re.findall(r'<span[^>]*aria-hidden="true"[^>]*>[^<A-Za-z]*</span>', src))
            return build_ar.bidi(hit) + deco
    return tr_html(src, where)


# ---------------------------------------------------------------- typography (prototype tokens.css :lang(ar))
FS = {  # English token clamp -> Arabic token clamp (small sizes +8 %)
    'clamp(0.75rem, 0.73rem + 0.08vw, 0.8125rem)': 'clamp(0.8125rem, 0.79rem + 0.1vw, 0.9rem)',
    'clamp(0.875rem, 0.86rem + 0.06vw, 0.9375rem)': 'clamp(0.9375rem, 0.91rem + 0.1vw, 1.0125rem)',
    'clamp(1rem, 0.97rem + 0.12vw, 1.0625rem)': 'clamp(1.0625rem, 1.03rem + 0.14vw, 1.1875rem)',
    'clamp(1.125rem, 1.07rem + 0.24vw, 1.3125rem)': 'clamp(1.1875rem, 1.12rem + 0.26vw, 1.4rem)',
}
DISPLAY_AR = 'El Messiri'
BODY_AR = 'IBM Plex Sans Arabic'


def ar_line_height(v):
    if v <= 1.0:
        return v           # --tp-lh-none
    if v < 1.1:
        return 1.35        # --tp-lh-tight
    if v < 1.5:
        return 1.4         # --tp-lh-heading / --tp-lh-snug
    return 1.85            # --tp-lh-body


def ar_typography(s):
    for k in list(s.keys()):
        v = s[k]
        if k.endswith('_font_family') and isinstance(v, str):
            display = v == 'Playfair Display'
            s[k] = DISPLAY_AR if display else BODY_AR if v == 'Inter' else v
            if display:
                s[k[:-len('_font_family')] + '_font_weight'] = '500'
        elif re.search(r'_text_transform(_tablet|_mobile)?$', k) and v == 'uppercase':
            s[k] = 'none'
        elif re.search(r'_font_style(_tablet|_mobile)?$', k) and v == 'italic':
            s[k] = 'normal'
        elif re.search(r'typography_letter_spacing(_tablet|_mobile)?$', k) and isinstance(v, dict) and v.get('size') not in ('', None):
            s[k] = dict(v, size=0)
        elif re.search(r'typography_line_height(_tablet|_mobile)?$', k) and isinstance(v, dict) and v.get('unit') == 'em' \
                and isinstance(v.get('size'), (int, float)):
            s[k] = dict(v, size=ar_line_height(float(v['size'])))
        elif re.search(r'typography_font_size(_tablet|_mobile)?$', k) and isinstance(v, dict) and v.get('size') in FS:
            s[k] = dict(v, size=FS[v['size']])


# ---------------------------------------------------------------- direction
DIMS = re.compile(r'^_?(padding|margin|border_width|border_radius|_border_width|_border_radius)(_tablet|_mobile)?$')


def flip_dims(s):
    for k, v in list(s.items()):
        if not (DIMS.match(k) and isinstance(v, dict) and 'left' in v and 'right' in v):
            continue
        if v.get('left') == v.get('right') and (('radius' not in k) or v.get('top') == v.get('bottom')):
            continue
        if 'radius' in k:  # top=top-left, right=top-right, bottom=bottom-right, left=bottom-left
            s[k] = dict(v, top=v['right'], right=v['top'], bottom=v['left'], left=v['bottom'])
        else:
            s[k] = dict(v, left=v['right'], right=v['left'])


# ---------------------------------------------------------------- document
LETTER_CONTEXT = re.compile(r'(?:^|\s)(tp-letter-entry|tp-project-letter|tp-lift)(?:\s|$)')


def convert(elements, ctx, where, anc=''):
    """ctx: media (en id -> {id, alt}), templates (en id -> ar id), forms (en id -> ar id). anc: ancestor CSS classes."""
    for e in elements:
        s = e.get('settings', {})
        if isinstance(s, list):
            s = e['settings'] = {}
        w = e.get('widgetType') or e.get('elType')
        here = anc + ' ' + (s.get('css_classes') or '') + ' ' + (s.get('_css_classes') or '')
        if w == 'heading' and isinstance(s.get('title'), str):
            s['title'] = tr_html_whole(s['title'], where)
        elif w == 'text-editor' and isinstance(s.get('editor'), str):
            ed = tr_html(s['editor'], where)
            # testimonial excerpts are translations of third-party letters: labelled as in the prototype
            if LETTER_CONTEXT.search(here) and re.search(r'^\s*(<blockquote>)?\s*<p>\s*[“"]', s['editor']):
                ed += '<p class="tp-caption tp-translated">' + TRANSLATED_LABEL + '</p>'
            s['editor'] = ed
        elif w == 'button' and isinstance(s.get('text'), str):
            s['text'] = tr_html_whole(s['text'], where)
        elif w == 'counter':
            for k in ('title', 'prefix', 'suffix'):
                if isinstance(s.get(k), str):
                    s[k] = tr(s[k], where) if re.search(r'[A-Za-z]{2}', s[k]) else s[k]
        elif w == 'shortcode' and isinstance(s.get('shortcode'), str):
            s['shortcode'] = re.sub(r'(\[tp_template id=")(\d+)', lambda m: m.group(1) + str(ctx['templates'].get(int(m.group(2)), m.group(2))),
                                    s['shortcode'])
        elif w == 'wpforms' and s.get('form_id'):
            s['form_id'] = str(ctx['forms'].get(int(s['form_id']), s['form_id']))
        if w == 'image' and isinstance(s.get('image'), dict) and s['image'].get('id'):
            m = ctx['media'].get(int(s['image']['id']))
            if m:
                s['image'] = dict(s['image'], id=m['id'], alt=m.get('alt', s['image'].get('alt', '')))
        if w == 'image-gallery' and isinstance(s.get('wp_gallery'), list):
            s['wp_gallery'] = [dict(g, id=ctx['media'][int(g['id'])]['id']) if g.get('id') and int(g['id']) in ctx['media'] else g
                               for g in s['wp_gallery']]
        for k, v in list(s.items()):
            if isinstance(v, dict) and 'url' in v and ('link' in k or k == 'link'):
                s[k] = dict(v, url=ar_url(v['url']))
            if isinstance(v, dict) and v.get('id') and k.startswith(('background_image', '_background_image')):
                m = ctx['media'].get(int(v['id']))
                if m:
                    s[k] = dict(v, id=m['id'])
        if isinstance(s.get('_title'), str):
            pass  # navigator labels stay as they are (editor only)
        ar_typography(s)
        flip_dims(s)
        convert(e.get('elements', []), ctx, where, here)
    return elements
