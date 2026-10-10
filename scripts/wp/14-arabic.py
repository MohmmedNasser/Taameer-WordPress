"""14-arabic.py — builds the Arabic WordPress site from the approved English one (WP Phase 8, D-045).

    python scripts/wp/14-arabic.py            export → translate → import (re-runnable; Arabic posts updated in place)
    python scripts/wp/14-arabic.py --dry      export + translate only; prints the strings that have no Arabic

Same generated architecture as the English pages: every Arabic page is a Polylang translation of its English page, with
the English Elementor element tree (Containers + native widgets, classes, CSS IDs, responsive settings, animations)
and the prototype's Arabic wording (scripts/ar_text.py + ar_data.py, the memory that generated ar/*.html), converted by
ar_elementor.py. Steps (all through the Novamira CLI, as the other build scripts):
  1. 14-arabic-export.php (read only) → English pages, templates, media, form, menus, widgets, Astra strings
  2. 14-arabic-import.php prepare      → Arabic media translations, Arabic WPForms form, Arabic template shells
  3. ar_elementor.convert              → Arabic Elementor data pointing at those ids
  4. 14-arabic-import.php build        → Arabic pages, templates, menus, widgets, Polylang strings, [tp_lang]
"""
import copy
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import ar_elementor as A  # noqa: E402

COMP = 'تعمير بلس للمقاولات ش.ذ.م.م'
TMP = tempfile.mkdtemp(prefix='tp-ar-')

# ---------------------------------------------------------------- Novamira


def run_php(name, prefix=''):
    code = prefix + open(os.path.join(HERE, name), encoding='utf-8').read()
    src = os.path.join(TMP, 'in.json')
    json.dump({'code': code}, open(src, 'w', encoding='utf-8'))
    env = dict(os.environ, NODE_OPTIONS='--use-system-ca')
    out = subprocess.run('novamira --site taameer.local run novamira/execute-php --input @"' + src + '" --yes --json',
                         shell=True, capture_output=True, text=True, encoding='utf-8', env=env)
    try:
        data = json.loads(out.stdout)['data']
    except Exception:
        sys.exit('Novamira call failed (' + name + '): ' + out.stdout[-2000:] + out.stderr[-2000:])
    if data.get('errors') or not data.get('success', True):
        sys.exit('PHP error (' + name + '): ' + json.dumps(data)[:3000])
    return data.get('return_value')


def php_str(path):
    return "'" + path.replace('\\', '/').replace("'", "\\'") + "'"


# ---------------------------------------------------------------- translations not in the prototype memory
PROJECTS = json.load(open(os.path.join(ROOT, 'data', 'projects.json'), encoding='utf-8'))['projects']
TESTIMONIALS = json.load(open(os.path.join(ROOT, 'data', 'testimonials.json'), encoding='utf-8'))
TESTIMONIALS = TESTIMONIALS.get('testimonials', TESTIMONIALS) if isinstance(TESTIMONIALS, dict) else TESTIMONIALS
MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']  # projects.js


def extra_strings():
    e = {
        'All': 'الكل',                    # projects filter (ar/projects.html)
        'Duration': 'المدة',             # project spec (projects.js specDuration)
        # About licences: the English page dropped "(PDF)" (licence PDFs pending, D-041); same edit in Arabic
        'Commercial licenses issued by the Dubai Department of Economy and Tourism. Open a license to view the full document.':
            'رخص تجارية صادرة عن دائرة الاقتصاد والسياحة في دبي. افتح الرخصة لعرض المستند كاملاً.',
    }
    for y in range(2010, 2031):
        for en, ar in zip(MONTHS_EN, MONTHS_AR):
            e[en + ' ' + str(y)] = ar + ' ' + str(y)
    for t in TESTIMONIALS:  # project-page letter by-line: "author, title"
        n, ti = t.get('authorName') or {}, t.get('authorTitle') or {}
        if n.get('en') and ti.get('en'):
            e[n['en'] + ', ' + ti['en']] = n['ar'] + '، ' + ti['ar']
    A.EXTRA.update(e)


def tr_counted(text, where):
    """Filter labels such as "Construction 6": translate the label, keep the count (as ar/projects.html)."""
    m = re.match(r'^(.*\D)\s+(\d+)$', ' '.join(text.split()))
    if m:
        before = len(A.missing)
        ar = A.tr(m.group(1), where)
        if len(A.missing) == before and ar != m.group(1):
            return ar + ' ' + m.group(2)
    return None


_orig_tr = A.tr


def tr_with_counts(text, where=''):
    key = ' '.join(text.split())
    if key in A.build_ar.MEMORY or key in A.EXTRA:
        return _orig_tr(text, where)
    hit = tr_counted(text, where)
    return hit if hit is not None else _orig_tr(text, where)


A.tr = tr_with_counts

# ---------------------------------------------------------------- media (Arabic alt / title / caption)
GALLERY = {}
for p in PROJECTS:
    GALLERY[p['title']['en'] + ', ' + p['location']['en']] = p['title']['ar'] + ', ' + p['location']['ar']  # project-page.js joins with ", "


def media_ar(m):
    def one(text):
        if not text:
            return text
        g = re.match(r'^(.*) — image (\d+) of (\d+)$', text)
        if g and g.group(1) in GALLERY:
            return GALLERY[g.group(1)] + ' — الصورة {} من {}'.format(g.group(2), g.group(3))  # projects.js imageOf
        if text in GALLERY:
            return GALLERY[text]
        return A.tr(text, 'media')
    alt = one(m['alt'])
    title = alt if m['title'] == m['alt'] else m['title']
    return {'alt': alt, 'title': title, 'caption': one(m['caption'])}


# ---------------------------------------------------------------- form
FORM_TEXT = {
    'Full name': 'الاسم الكامل', 'Email address': 'عنوان البريد الإلكتروني', 'Phone number': 'رقم الهاتف', 'Project type': 'نوع المشروع',
    'Message': 'الرسالة', 'Select a service': 'اختر خدمة', 'Fields marked * are required.': 'الحقول المميزة بعلامة * مطلوبة.',
    'Send message': 'إرسال الرسالة', 'Sending…': 'جارٍ الإرسال…', 'Other': 'أخرى',
}


def form_ar(form):
    f = copy.deepcopy(form)
    for fld in f['fields'].values():
        fld['label'] = FORM_TEXT.get(fld['label'], A.tr(fld['label'], 'form'))
        if fld.get('placeholder'):
            fld['placeholder'] = FORM_TEXT.get(fld['placeholder'], fld['placeholder'])
        for c in (fld.get('choices') or {}).values():
            c['label'] = FORM_TEXT.get(c['label'], A.tr(c['label'], 'form'))
    st = f['settings']
    st['form_title'] = 'Contact (العربية)'
    for k in ('form_desc', 'submit_text', 'submit_text_processing'):
        st[k] = FORM_TEXT.get(st[k], st[k])
    st['notifications']['1']['subject'] = 'New enquiry (Arabic site) from {field_id="1"} — taameer.ae'
    st['confirmations']['1']['message'] = ('<h3>شكراً لرسالتك</h3><p>سيتواصل معك فريقنا قريباً. وللأمور العاجلة، اتصل على '
                                           '<bdi>+971 4 329 0500</bdi> أو راسلنا عبر واتساب.</p>')  # ar/contact.html
    return f


# ---------------------------------------------------------------- pages
TITLES = {'home': 'الرئيسية', 'about': 'من نحن', 'services': 'خدماتنا', 'projects': 'مشاريعنا', 'testimonials': 'آراء العملاء', 'contact': 'اتصل بنا'}
PROJECT_TITLE = {p['id']: p['title']['ar'] for p in PROJECTS}


def main():
    dry = '--dry' in sys.argv
    extra_strings()
    export = os.path.join(TMP, 'en.json')
    print('export:', run_php('14-arabic-export.php', '$OUT = ' + php_str(export) + ';\n'))
    en = json.load(open(export, encoding='utf-8'))

    media = {int(k): media_ar(m) for k, m in en['media'].items()}
    form = form_ar(en['form']['data'])

    # English Astra HTML elements: the switcher becomes [tp_lang]
    lang_p = re.compile(r'<p class="tp-lang">.*?</p>', re.S)
    astra_en = {k: lang_p.sub('[tp_lang]', en['astra'][k]) for k in ('header-html-1', 'header-html-2', 'footer-html-1')}

    if dry:
        ctx = {'media': {}, 'templates': {}, 'forms': {}}
        for key, pg in list(en['pages'].items()) + list(en['templates'].items()):
            A.convert(copy.deepcopy(pg['data']), ctx, key)
    else:
        payload = {'media': {k: v for k, v in media.items()}, 'form': form,
                   'templates': {'cta': 'CTA band (site-wide) — العربية', '404': '404 page — العربية'}}
        path = os.path.join(TMP, 'prepare.json')
        json.dump(payload, open(path, 'w', encoding='utf-8'), ensure_ascii=False)
        prep = run_php('14-arabic-import.php', "$MODE = 'prepare';\n$IN = " + php_str(path) + ';\n')
        print('prepare: media', len(prep['media']), 'form', prep['form'], 'templates', prep['templates'])
        ctx = {
            'media': {int(k): {'id': v, 'alt': media[int(k)]['alt']} for k, v in prep['media'].items()},
            'templates': {en['templates']['cta']['id']: prep['templates']['cta'], en['templates']['404']['id']: prep['templates']['404']},
            'forms': {en['form']['id']: prep['form']},
        }

    pages = []
    order = ['home', 'about', 'services', 'projects'] + sorted(k for k in en['pages'] if k.startswith('project:')) + ['testimonials', 'contact']
    for key in order:
        pg = en['pages'][key]
        data = A.convert(copy.deepcopy(pg['data']), ctx, key)
        title = TITLES.get(key) or PROJECT_TITLE.get(key.split(':', 1)[-1], pg['title'])
        pages.append({'key': key, 'en': pg['id'], 'title': title, 'slug': pg['slug'], 'parent_en': pg['parent'],
                      'menu_order': pg['menu_order'], 'meta': pg['meta'], 'data': data})
    templates = {k: {'ar': None if dry else ctx['templates'][t['id']], 'data': A.convert(copy.deepcopy(t['data']), ctx, 'template:' + k)}
                 for k, t in en['templates'].items()}

    # menus
    MENU_NAMES = {'Main navigation': 'Main navigation — العربية', 'Footer: Quick links': 'Footer: Quick links — العربية',
                  'Footer: Services': 'Footer: Services — العربية'}
    menus = {}
    for mid, m in en['menus'].items():
        if m['name'] not in MENU_NAMES:
            continue
        menus[mid] = {'name': MENU_NAMES[m['name']], 'items': [{'title': A.tr(it['title'], 'menu'), 'url': A.ar_url(it['url'])}
                                                                for it in sorted(m['items'], key=lambda i: i['order'])]}

    # footer widgets: Arabic copies (keys 102, 103) in the same columns
    sidebars = en['widgets']['sidebars']
    where = {w: sb for sb, ws in sidebars.items() if isinstance(ws, list) for w in ws}
    blocks = {}
    navs = {}
    for i, (k, ar_key) in enumerate((('100', 102), ('101', 103))):
        blocks[k] = {'ar_key': ar_key, 'content': A.tr_html(en['widgets']['block'][k]['content'], 'footer'), 'sidebar': where['block-' + k]}
        w = en['widgets']['nav_menu'][k]
        navs[k] = {'ar_key': ar_key, 'title': A.tr(w['title'], 'footer'), 'menu_en': w['nav_menu'], 'sidebar': where['nav_menu-' + k]}

    # Polylang string translations (Arabic)
    a = en['astra']
    strings = [
        [astra_en['header-html-2'], A.tr_html(astra_en['header-html-2'], 'header')],
        [a['footer-html-2'], A.tr_html(a['footer-html-2'], 'footer')],
        [a['header-button1-text'], A.tr(a['header-button1-text'], 'header')],
        [a['header-button1-link-option']['url'], A.ar_url(a['header-button1-link-option']['url'])],
        [a['footer-copyright-editor'], '© [current_year] ' + COMP + '. جميع الحقوق محفوظة.'],
        [en['blog']['name'], COMP],
        [en['blog']['description'], 'إنشاءات وتشطيبات داخلية وتجديد في دبي'],  # ar_text.py: site title line
        ['Menu', 'القائمة'],
        # taameer.js (prototype interactions.js STRINGS.ar and the ar/ pages' labels)
        ['Before', 'قبل'], ['After', 'بعد'], ['Before and after divider', 'فاصل المقارنة بين قبل وبعد'],
        ['{n}% of the before image shown', '{n}% من صورة «قبل» ظاهرة'], ['Services on this page', 'الخدمات في هذه الصفحة'],
        ['Showing 1 project', 'عرض مشروع واحد'], ['Showing 2 projects', 'عرض مشروعين'], ['Showing {n} projects', 'عرض {n} مشاريع'],
        ['Showing {n} projects (11 or more)', 'عرض {n} مشروعاً'], ['More projects', 'مزيد من المشاريع'],
        ['Open the original letter from {company}', 'افتح الخطاب الأصلي من {company}'],
        # WPForms global validation messages (contact-form.js ar)
        ['Please fill in this field.', 'يرجى تعبئة هذا الحقل.'],
        ['Please enter a valid email address, for example name@example.com.', 'يرجى إدخال عنوان بريد إلكتروني صحيح، مثل name@example.com.'],
        ['Please enable JavaScript in your browser to complete this form.', 'يرجى تفعيل JavaScript في متصفحك لإكمال هذا النموذج.'],
    ]

    if A.missing:
        print('NO ARABIC for', len(A.missing), 'strings:')
        for k, v in sorted(A.missing.items()):
            print('  -', k[:140], '|', ','.join(sorted(v))[:80])
    if dry:
        return

    def build(part, label):
        path = os.path.join(TMP, 'build.json')
        json.dump(part, open(path, 'w', encoding='utf-8'), ensure_ascii=False)
        res = run_php('14-arabic-import.php', "$MODE = 'build';\n$IN = " + php_str(path) + ';\n')
        for k, v in (res.get('pages') or {}).items():
            print('  ', k, v['id'], v['url'], 'saved' if v['saved'] else 'NOT SAVED')
        if res.get('errors'):
            print('  errors', res['errors'])
        return res

    for i in range(0, len(pages), 8):  # parents come first in `pages`
        build({'pages': pages[i:i + 8]}, 'pages')
    res = build({'templates': templates, 'menus': menus, 'locations': en['locations'],
                 'widgets': {'block': blocks, 'nav_menu': navs}, 'astra_en': astra_en, 'strings': strings}, 'site')
    print('templates', res.get('templates'), 'menus', res.get('menus'), 'strings', res.get('strings'))


if __name__ == '__main__':
    main()
