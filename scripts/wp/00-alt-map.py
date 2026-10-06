"""00-alt-map.py — filename -> alt text for the media upload (WP phase 1).
HTML alts first (index.html wins), then the prototype's own gallery pattern for JSON-only images.
Usage: python scripts/wp/00-alt-map.py . scripts/wp/alt-map.json
"""
import json, re, os, html, sys
root = sys.argv[1]; out = sys.argv[2]
pages = ['index.html'] + sorted(f for f in os.listdir(root) if f.endswith('.html') and f != 'index.html')
alts = {}
for p in pages:
    s = open(os.path.join(root, p), encoding='utf-8').read()
    for tag in re.findall(r'<img\b[^>]*>', s, re.S):
        src = re.search(r'\ssrc="assets/img/([^"]+)"', tag)
        alt = re.search(r'\salt="([^"]*)"', tag)
        if not src or alt is None: continue
        f = src.group(1).replace('-md.webp', '.webp')
        a = html.unescape(alt.group(1)).strip()
        if a and f not in alts: alts[f] = a
d = json.load(open(os.path.join(root, 'data/projects.json'), encoding='utf-8'))
for p in d['projects']:
    g = p.get('gallery') or []
    for i, src in enumerate(g):
        f = os.path.basename(src)
        if f not in alts:
            alts[f] = f"{p['title']['en']}, {p['location']['en']} — image {i+1} of {len(g)}"
    for k in ('cover', 'beforeImage'):
        if p.get(k):
            f = os.path.basename(p[k])
            alts.setdefault(f, f"{p['title']['en']}, {p['location']['en']}" + (' (before)' if k == 'beforeImage' else ''))
for fn in ('team.json', 'testimonials.json'):
    raw = open(os.path.join(root, 'data', fn), encoding='utf-8').read()
    for m in re.finditer(r'"(?:photo|image|letter|thumb)"\s*:\s*"assets/img/([^"]+)"', raw):
        alts.setdefault(m.group(1).replace('-md.webp', '.webp'), '')
files = sorted(f for f in os.listdir(os.path.join(root, 'assets/img')) if f.endswith('.webp') and not f.endswith('-md.webp'))
res = {f: alts.get(f, '') for f in files}
json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
missing = [f for f, a in res.items() if not a]
print(len(files), 'images;', len(missing), 'without alt:', missing)
