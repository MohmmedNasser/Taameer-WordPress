"""check-links.py — verifies every internal link and asset reference in the static pages (re-runnable QA).

    python scripts/check-links.py

For each *.html in the project root: href/src/srcset targets must exist on disk; #fragments must match an id in
the target page (or the same page); project.html?id=<slug> must match data/projects.json; projects.html?type=<slug>
must be a known project type. Both languages are checked (*.html and ar/*.html; relative paths resolve from the
page's own folder). Every language-switcher link and every canonical / hreflang URL (https://www.taameer.ae/[ar/]<slug>/)
must map to an existing page. External links
(http, mailto, tel) are not fetched. Also checks that every project card link generated from the JSON data
(cover/gallery images and ids) resolves.
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parent.parent
failures, skipped = [], set()
ids_cache = {}


def ids_of(path):
    if path not in ids_cache:
        text = path.read_text(encoding="utf-8")
        text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
        ids_cache[path] = set(re.findall(r'\sid="([^"]+)"', text))
    return ids_cache[path]


def main():
    data = json.loads((ROOT / "data" / "projects.json").read_text(encoding="utf-8"))
    project_ids = {p["id"] for p in data["projects"] if p["type"] != "showcase"}
    types = set(data["types"]) - {"showcase"}
    count = 0
    pages = sorted(ROOT.glob("*.html")) + sorted((ROOT / "ar").glob("*.html"))
    for page in pages:
        html = re.sub(r"<!--.*?-->", "", page.read_text(encoding="utf-8"), flags=re.S)
        for url in re.findall(r'<link rel="(?:canonical|alternate)"[^>]*href="([^"]+)"', html):
            m = re.fullmatch(r"https://www\.taameer\.ae/(ar/)?([\w-]*)/?", url)
            slug = m.group(2) if m else None
            target = None if slug is None else ROOT / (m.group(1) or "") / ((slug or "index") + ".html")
            if target is None or not target.exists():
                failures.append(f"{page.relative_to(ROOT).as_posix()}: hreflang/canonical {url} maps to no page")
        base = page.parent
        refs = re.findall(r'\s(?:href|src)="([^"]*)"', html)
        for ss in re.findall(r'\ssrcset="([^"]*)"', html):
            refs += [part.strip().split()[0] for part in ss.split(",") if part.strip()]
        for ref in refs:
            if not ref or ref.startswith(("http:", "https:", "mailto:", "tel:", "data:", "javascript:")):
                continue
            count += 1
            u = urlparse(ref)
            target = page if not u.path else (base / u.path).resolve()
            label = page.relative_to(ROOT).as_posix()
            if not target.exists():
                failures.append(f"{label}: missing file {ref}")
                continue
            if u.fragment and target.suffix == ".html" and u.fragment not in ids_of(target):
                failures.append(f"{label}: no #{u.fragment} in {target.name}")
            q = parse_qs(u.query)
            if Path(u.path).name == "project.html" and u.query and q.get("id", [""])[0] not in project_ids:  # bare = language switcher (JS adds ?id=)
                failures.append(f"{label}: unknown project id in {ref}")
            if Path(u.path).name == "projects.html" and "type" in q and q["type"][0] not in types:
                failures.append(f"{label}: unknown project type in {ref}")
    # Links generated from the data
    for p in data["projects"]:
        for key in ["cover"] + list(p.get("gallery", [])) + ([p["beforeImage"]] if p.get("beforeImage") else []):
            f = p[key] if key == "cover" else key
            if not (ROOT / f).exists():
                failures.append(f"projects.json {p['id']}: missing image {f}")
    for t in json.loads((ROOT / "data" / "testimonials.json").read_text(encoding="utf-8"))["testimonials"]:
        if not (ROOT / t["letterImage"]).exists():
            failures.append(f"testimonials.json {t['id']}: missing {t['letterImage']}")
        if t.get("relatedProject") and t["relatedProject"] not in project_ids:
            failures.append(f"testimonials.json {t['id']}: unknown relatedProject {t['relatedProject']}")
    print(f"checked {count} references in {len(pages)} pages (EN + AR)")
    if failures:
        print(f"\n{len(failures)} FAILURE(S):")
        for f in failures:
            print("  FAIL", f)
        sys.exit(1)
    print("check-links: all internal links resolve")


if __name__ == "__main__":
    main()
