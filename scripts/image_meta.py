"""image_meta.py — refresh the "imageMeta" map in data/projects.json (re-runnable, touches nothing else).

    python scripts/image_meta.py

For every assets/img/*.webp path referenced anywhere in data/*.json: [width, height, hasMd].
JS uses it for <img width/height> (no layout shift) and to add the -md srcset only when that file exists.
In WordPress this role is played by attachment metadata (wp_get_attachment_image_src / srcset).
"""
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PATH_RE = re.compile(r'"(assets/img/[^"]+?\.webp)"')

refs = set()
for f in (ROOT / "data").glob("*.json"):
    refs.update(PATH_RE.findall(f.read_text(encoding="utf-8")))

meta = {}
for ref in sorted(refs):
    p = ROOT / ref
    with Image.open(p) as im:
        meta[ref] = [im.width, im.height, p.with_name(p.stem + "-md.webp").exists()]

target = ROOT / "data" / "projects.json"
data = json.loads(target.read_text(encoding="utf-8"))
data["imageMeta"] = meta
target.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"imageMeta: {len(meta)} images")
