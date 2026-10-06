"""
fetch_site.py — Taameer Plus: mirror the current website's assets (re-runnable, skips existing files).

Usage (from project root):
    python scripts/fetch_site.py

What it does, sequentially with a pause between requests (polite crawl):
  1. Downloads https://taameer.ae/ to source/site/index.html (skipped if present).
  2. Collects every images/…, licenses/… and documents/… path found anywhere in the HTML, including
     the inline `projectGalleries` JS map (it skips numbers, e.g. no 4.jpg in folder -3, so plain
     "probe until 404" would miss files).
  3. For each project folder, probes N+1.jpg, N+2.jpg… past the highest known number until a 404.
  4. Saves files under source/site/ keeping the site's folder structure; writes source/site/manifest.json
     (path, bytes, pixel size for images).
Stdlib only, plus Pillow for image sizes.
"""
import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://taameer.ae/"
OUT = ROOT / "source" / "site"
PAUSE = 0.8
UA = "Mozilla/5.0 (TaameerPlus prototype asset mirror; contact info@taameer.ae)"
ASSET_RE = re.compile(r"""(?:images|licenses|documents)/[^"'\s)#?]+\.(?:jpe?g|png|webp|svg|gif|pdf)""", re.I)


def get(path, attempts=4):
    """Return bytes. HTTPError (e.g. 404) raises; network timeouts are retried with backoff."""
    # A custom User-Agent is required: the host answers urllib's default UA with 406.
    req = urllib.request.Request(BASE + path, headers={"User-Agent": UA})
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except urllib.error.HTTPError:
            raise
        except (urllib.error.URLError, TimeoutError):
            if attempt == attempts - 1:
                raise
            time.sleep(5 * (attempt + 1))
        finally:
            time.sleep(PAUSE)


def fetch(path):
    dest = OUT / path
    if dest.exists():
        return True
    try:
        data = get(path)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False
        raise
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    print("got", path, len(data))
    return True


def main():
    index = OUT / "index.html"
    if not index.exists():
        OUT.mkdir(parents=True, exist_ok=True)
        index.write_bytes(get(""))
    html = index.read_text(encoding="utf-8")
    paths = sorted(set(ASSET_RE.findall(html)))
    missing = [p for p in paths if not fetch(p)]

    # Probe past the highest known gallery number in every project folder.
    folders = {}
    for p in paths:
        m = re.match(r"(images/projects/[^/]+)/(\d+)\.jpg$", p)
        if m:
            folders[m.group(1)] = max(folders.get(m.group(1), 0), int(m.group(2)))
    for folder, top in sorted(folders.items()):
        n = top + 1
        while fetch(f"{folder}/{n}.jpg"):
            n += 1

    manifest = []
    for f in sorted(OUT.rglob("*")):
        if f.is_file() and f.name not in ("index.html", "manifest.json"):
            entry = {"path": f.relative_to(OUT).as_posix(), "bytes": f.stat().st_size}
            if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
                with Image.open(f) as im:
                    entry["width"], entry["height"] = im.size
            manifest.append(entry)
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    print(f"{len(manifest)} files; referenced but 404: {missing}")


if __name__ == "__main__":
    main()
