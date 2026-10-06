"""
extract_pdf.py — Taameer Plus: PDF text + image extraction (re-runnable).

Usage (from project root):
    pip install pymupdf pillow
    python scripts/extract_pdf.py            # full run: text, raw dump, renders, WebP export, manifest
    python scripts/extract_pdf.py --raw      # only dump raw natives to source/extracted/
    python scripts/extract_pdf.py --export   # only WebP export + manifest (raw natives must exist)

Pipeline
  1. Text   -> source/pdf-text.md (## Page N headings)
  2. Raw    -> source/extracted/pNN-xXXXX.png  (native resolution, soft masks composited as alpha)
  3. Render -> source/extracted/render-*.png   (300 DPI crops, ONLY for composite pages: p8 licenses,
               p35/p36 text-layer letters; everything else is native)
  4. Export -> assets/img/<meaning>.webp (width capped at 1920) + <meaning>-md.webp (900px, only if source > 900px)
  5. Manifest -> source/extracted/manifest.json (consumed when writing docs/image-map.md)

Naming is defined in IMAGES below: meaning-based file name -> source. Add rows there, never rename by hand.
"""
import io
import json
import sys
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "source" / "TAAMEER-Company-profile-2026.pdf"
RAW = ROOT / "source" / "extracted"
OUT = ROOT / "assets" / "img"
MAX_W, MD_W, QUALITY = 1920, 900, 82
RENDER_DPI = 300

# Page areas (PDF points, x0,y0,x1,y1) rendered at 300 DPI because the content is a composite
# of text + small overlay images and has no single embedded raster.
RENDERS = {
    "license-left":  (8, 45, 25, 485, 568),
    "license-right": (8, 531, 25, 977, 568),
    "letter-today-engineering": (35, 100, 36, 460, 570),
    "letter-atlas-copco":       (36, 565, 36, 1000, 590),
    # Jan's Noodles: the embedded raster (xref 669) is only a 15%-alpha watermark; the letter itself is vector.
    "letter-jans-noodles":      (36, 90, 36, 470, 570),
}

# Project pages: slug -> (pdf page, xrefs in gallery order: top row left->right, then bottom row).
PROJECT_PAGES = {
    "wadi-alshabak-villas":              (10, [169, 166, 157, 160, 163]),
    "jvc-residential-retail-building":   (11, [182, 188, 186, 184]),
    "al-awir-villas":                    (12, [216, 214, 212, 210, 217]),
    "service-blocks-extensions":         (13, [228, 238, 235, 229, 231]),
    "abu-dhabi-marina-private-gym":      (14, [253, 256, 259, 262]),
    "palm-jumeirah-villa":               (15, [282, 280, 274, 276, 278]),
    "dubai-g-residential-villa":         (16, [298, 296, 290, 292, 294]),
    "al-warqa-1st-g2-villa":             (17, [312, 310, 314, 317, 308]),
    "dubai-marina-triplex-villa":        (18, [333, 331, 334, 328, 329]),
    "kf-inc-headquarters":               (19, [343, 344, 346, 349]),
    "al-warqa-4th-villa":                (20, [359, 361, 363, 365]),
    "mbr-city-villa":                    (21, [375, 378, 387, 384, 381]),
    "faiz-couture-dress-shop":           (22, [401]),
    "souk-al-bahar-apartment":           (23, [412]),
    "beauty-lounge-spa-mirdif":          (24, []),
    "thai-restaurant-deira":             (25, [435, 436, 442, 438, 440]),
    "jumeirah-golf-estates-landscaping": (26, [453, 455, 457, 459, 462]),
    "um-nahad-villa":                    (27, [473, 482, 480, 475, 477]),
    "atlas-copco-headquarters":          (28, [492, 493, 495, 497]),
    "damac-hills-villa":                 (29, [509, 511, 508, 510, 513, 516]),
    "al-twar-villa":                     (30, [526, 531, 533, 535, 538]),
    "wall-cladding":                     (31, [555, 557, 561, 551, 548, 559]),
}

# Flattened collages (pages 22-24): one native raster holding several photos. Boxes are native px,
# found by white-gutter detection. They are appended to that project's gallery after PROJECT_PAGES xrefs.
COLLAGES = {
    "faiz-couture-dress-shop": (399, [(2, 0, 562, 301), (570, 0, 1019, 301), (1026, 0, 1563, 302),
                                      (6, 309, 562, 608), (570, 308, 1019, 608), (1024, 309, 1563, 608)]),
    "souk-al-bahar-apartment": (411, [(12, 0, 570, 605), (581, 0, 1075, 309), (581, 312, 1075, 605),
                                      (1082, 0, 1575, 308), (1083, 313, 1575, 605)]),
    "beauty-lounge-spa-mirdif": (422, [(836, 2, 1556, 524), (0, 529, 272, 884), (279, 529, 709, 884),
                                       (711, 529, 1074, 884), (1075, 529, 1556, 884)]),
}

# Everything else: file name -> (pdf page, source). Source is an xref, ("render", key) or (xref, crop box).
SINGLES = {
    "logo-taameer-plus":                 (1, 47),
    "cover-tower-render":                (1, 45),
    "chairman-fahim-al-ali":             (3, 66),
    "team-rauof-al-otaibi":              (7, 121),   # colour portrait; xref 120 is the B/W duplicate
    "team-mohannad-al-musleh":           (7, 125),
    "team-mohammad-amer":                (7, 127),   # colour portrait; xref 123 is the B/W duplicate
    "license-contracting":               (8, ("render", "license-left")),    # No. 741846
    "license-carpentry":                 (8, ("render", "license-right")),
    "divider-projects":                  (9, 142),
    # Before shot cropped to the after shot's (xref 253) aspect so the slider layers align.
    "project-abu-dhabi-marina-private-gym-before": (14, (264, (24, 0, 485, 463))),
    "team-exp-al-barsha-hotel":          (32, 581),  # xref 584 is an empty mask duplicate
    "team-exp-nadd-al-hamar-residential": (32, 576),  # xref 579 is an empty mask duplicate
    "team-exp-dubai-investments-hq":     (33, 598),  # xref 601 is an empty mask duplicate
    "team-exp-souq-al-kabeer-mixed-use": (33, 603),  # xref 606 is an empty mask duplicate
    "divider-recommendations":           (34, 621),
    "letter-today-engineering":          (35, ("render", "letter-today-engineering")),
    "letter-bella-cure":                 (35, 651),
    "letter-atlas-copco":                (36, ("render", "letter-atlas-copco")),
    "letter-jans-noodles":               (36, ("render", "letter-jans-noodles")),
    "contact-location-map":              (37, 712),
}

KEEP_ALPHA = {"logo-taameer-plus"}
LOW_RES_W = 1200


def extract_text(doc):
    parts = ["# PDF text — TAAMEER-Company-profile-2026.pdf\n"]
    for i, page in enumerate(doc, 1):
        parts.append(f"\n## Page {i}\n\n{page.get_text().strip()}\n")
    (ROOT / "source" / "pdf-text.md").write_text("".join(parts), encoding="utf-8")


def pixmap_to_pil(doc, xref):
    """Native image with its soft mask applied as alpha."""
    info = doc.extract_image(xref)
    img = Image.open(io.BytesIO(info["image"]))
    img.load()
    smask = info.get("smask") or 0
    if smask:
        mask = Image.open(io.BytesIO(doc.extract_image(smask)["image"])).convert("L")
        if mask.size != img.size:
            mask = mask.resize(img.size)
        img = img.convert("RGBA")
        img.putalpha(mask)
    elif img.mode not in ("RGB", "RGBA", "L"):
        img = img.convert("RGB")
    return img


def dump_raw(doc):
    RAW.mkdir(parents=True, exist_ok=True)
    seen = set()
    for pno, page in enumerate(doc, 1):
        for im in page.get_images(full=True):
            xref = im[0]
            if xref in seen:
                continue
            seen.add(xref)
            pixmap_to_pil(doc, xref).save(RAW / f"p{pno:02d}-x{xref}.png")
    for name, (pno, *rect) in RENDERS.items():
        pix = doc[pno - 1].get_pixmap(dpi=RENDER_DPI, clip=pymupdf.Rect(*rect))
        Image.open(io.BytesIO(pix.tobytes("png"))).save(RAW / f"render-{name}.png")


def raw_image(page, src):
    """Load a source from source/extracted/: xref, ("render", key) or (xref, crop box)."""
    if isinstance(src, int):
        return Image.open(RAW / f"p{page:02d}-x{src}.png")
    if src[0] == "render":
        return Image.open(RAW / f"render-{src[1]}.png")
    xref, box = src
    return Image.open(RAW / f"p{page:02d}-x{xref}.png").crop(box)


def flatten(img, keep_alpha):
    """Photos with soft masks: drop alpha if opaque, else trim transparent edges and put on white."""
    if img.mode == "L":
        return img.convert("RGB")
    if img.mode != "RGBA" or keep_alpha:
        return img
    alpha = img.split()[3]
    if alpha.getextrema()[0] < 250:
        bbox = alpha.point(lambda a: 255 if a > 200 else 0).getbbox()
        if bbox:
            img = img.crop(bbox)
    bg = Image.new("RGB", img.size, (255, 255, 255))
    bg.paste(img, mask=img.split()[3])
    return bg


def export(name, img, keep_alpha=False):
    """Write <name>.webp (<=1920px) and <name>-md.webp (900px) when wider than 900. Never upscale."""
    OUT.mkdir(parents=True, exist_ok=True)
    img = flatten(img, keep_alpha)
    if img.width > MAX_W:
        img = img.resize((MAX_W, round(img.height * MAX_W / img.width)), Image.LANCZOS)
    img.save(OUT / f"{name}.webp", "WEBP", quality=QUALITY, method=6)
    md = None
    if img.width > MD_W:
        md_img = img.resize((MD_W, round(img.height * MD_W / img.width)), Image.LANCZOS)
        md_img.save(OUT / f"{name}-md.webp", "WEBP", quality=QUALITY, method=6)
        md = f"{name}-md.webp"
    return {"file": f"{name}.webp", "md": md, "width": img.width, "height": img.height,
            "lowRes": img.width < LOW_RES_W}


def export_all():
    manifest = []
    for slug, (page, xrefs) in PROJECT_PAGES.items():
        sources = [(page, x) for x in xrefs]
        if slug in COLLAGES:
            cxref, boxes = COLLAGES[slug]
            sources += [(page, (cxref, b)) for b in boxes]
        for i, (pg, src) in enumerate(sources, 1):
            entry = export(f"project-{slug}-{i:02d}", raw_image(pg, src))
            manifest.append({**entry, "page": pg, "group": slug, "source": str(src)})
    for name, (page, src) in SINGLES.items():
        entry = export(name, raw_image(page, src), keep_alpha=name in KEEP_ALPHA)
        group = name.rsplit("-before", 1)[0].removeprefix("project-") if name.endswith("-before") else name.split("-")[0]
        manifest.append({**entry, "page": page, "group": group, "source": str(src)})
    (RAW / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    return manifest


if __name__ == "__main__":
    document = pymupdf.open(PDF)
    if "--export" not in sys.argv:
        extract_text(document)
        dump_raw(document)
    if "--raw" in sys.argv:
        sys.exit(0)
    result = export_all()
    print(f"exported {len(result)} images, {sum(e['lowRes'] for e in result)} below {LOW_RES_W}px")
