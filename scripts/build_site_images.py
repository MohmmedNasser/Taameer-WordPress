"""
build_site_images.py — Taameer Plus: merge website images (source/site/) with the PDF exports (re-runnable).

Run AFTER extract_pdf.py --export and fetch_site.py:
    python scripts/build_site_images.py

Rules (source precedence, see docs/decisions.md):
  * Projects on both sources: site photos (1200px) come first in site order; PDF photos that match a
    site photo (perceptual dHash) are dropped, unmatched PDF photos are appended. Files are rewritten as
    project-<slug>-NN.webp, so this script owns those slugs after extract_pdf.py.
  * Site-only project (Perfume Shop) is exported from the site gallery.
  * Team portraits: site (700px) > PDF (425–512px). Chairman and landmarks: PDF is equal or larger, kept.
  * Licenses: the site's vector PDFs are renewed copies -> rendered at 200 DPI, replacing the PDF crops.
  * Partner logos: white-box logos exported as-is (CSS multiplies them); black-box logos are knocked out to
    transparency (white -> charcoal text colour, saturated brand colours kept) because multiply cannot
    blend a black box on a light section.
  * Service "images" on the site are black line icons: mirrored only, not exported (decision D-006).
Writes source/site/export-manifest.json for docs/image-map.md.
"""
import json
import sys
from pathlib import Path

import pymupdf
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import extract_pdf as ex  # noqa: E402  reuse export(), raw_image(), PROJECT_PAGES, COLLAGES

SITE = ex.ROOT / "source" / "site"
IMG = SITE / "images"
CHARCOAL = (46, 42, 38)  # --tp-color-text

# site folder -> our slug
SITE_PROJECTS = {
    "construction-of-g-2-private-villa-1": "al-warqa-1st-g2-villa",
    "full-renovation-for-residential-and-reta-2": "jvc-residential-retail-building",
    "renovation-decoration-of-g-2-triplex-vil-3": "dubai-marina-triplex-villa",
    "proposed-g-1-resident-villas-4": "al-awir-villas",
    "renovation-decoration-for-atlas-copco-he-5": "atlas-copco-headquarters",
    "fit-out-ladies-beauty-lounge-spa-6": "beauty-lounge-spa-mirdif",
    "fit-out-landscaping-work-for-private-vil-7": "jumeirah-golf-estates-landscaping",
    "fit-out-of-m-s-kf-inc-head-quarter-offic-8": "kf-inc-headquarters",
    "proposed-g-residential-villa-9": "dubai-g-residential-villa",
    "renovation-decoration-for-g-1-private-vi-10": "mbr-city-villa",
    "perfume-shop-fitout-and-decoration-11": "perfume-shop-al-barsha",
    "renovation-decoration-of-residential-fla-12": "souk-al-bahar-apartment",
    "renovation-decoration-of-private-villa-13": "al-warqa-4th-villa",
}
# PDF photos that ARE a site photo but re-cropped too heavily for the hash (verified visually 2026-09-30).
MANUAL_DUPES = {
    "al-warqa-1st-g2-villa": [310], "al-awir-villas": [214], "mbr-city-villa": [378, 384],
    "jumeirah-golf-estates-landscaping": [453, 455, 457, 459, 462],
    "beauty-lounge-spa-mirdif": [(422, (1075, 529, 1556, 884))],
}
TEAM = {"2.jpg": "team-mohannad-al-musleh", "3.jpg": "team-rauof-al-otaibi", "4.jpg": "team-mohammad-amer"}
LICENSES = {"4.pdf": "license-contracting", "3.pdf": "license-carpentry"}
# partner file -> (slug, alt, background) ; background "white" = multiply in CSS, "dark" = knock out here
PARTNERS = {
    1: ("al-gurm", "Al Gurm Real Estate", "dark"), 2: ("al-bastaki", "Al Bastaki Business Services", "white"),
    3: ("amec", "A.M.E.C.", "dark"), 4: ("al-sondos", "Al Sondos Holding", "white"),
    5: ("atlas-copco", "Atlas Copco", "white"), 6: ("cooltech", "Cooltech, a Tabreed company", "white"),
    7: ("cifa", "CIFA, a Zoomlion company", "dark"), 8: ("innovative-consultants", "Innovative Consultants", "white"),
    9: ("kf-inc", "KF INC Investment Group", "white"), 10: ("nahas-interiors", "Nahas Interiors", "dark"),
    11: ("oceanworld", "Oceanworld Group of Companies", "dark"), 12: ("rd2-design", "RD2 Design", "dark"),
    13: ("r-monogram", "Partner logo (R monogram)", "dark"), 14: ("owa", "OWA", "white"),
}


def dhash(img, size=12):
    g = img.convert("L").resize((size + 1, size), Image.LANCZOS)
    px = g.tobytes()
    return [px[r * (size + 1) + c] > px[r * (size + 1) + c + 1] for r in range(size) for c in range(size)]


def similar(a, b, tol=0.2):
    return sum(x != y for x, y in zip(a, b)) / len(a) <= tol


def crop_hashes(site_img, aspect):
    """Hashes of site-photo crops with the PDF photo's aspect ratio, at several scales and 3x3 anchors.
    The PDF layout re-crops the same photos, so a plain whole-image hash misses duplicates."""
    w, h = site_img.size
    small = site_img.resize((w // 4, h // 4))
    w, h = small.size
    cw, ch = (w, w / aspect) if w / aspect <= h else (h * aspect, h)
    out = []
    for scale in (1, 0.9, 0.8, 0.7, 0.6):
        sw, sh = cw * scale, ch * scale
        for fx in (0, 0.5, 1):
            for fy in (0, 0.5, 1):
                x, y = (w - sw) * fx, (h - sh) * fy
                out.append(dhash(small.crop((round(x), round(y), round(x + sw), round(y + sh)))))
    return out


def clear(prefix):
    for f in ex.OUT.glob(f"{prefix}-[0-9][0-9]*.webp"):
        f.unlink()


def pdf_sources(slug):
    if slug not in ex.PROJECT_PAGES:
        return []
    page, xrefs = ex.PROJECT_PAGES[slug]
    srcs = [(page, x) for x in xrefs]
    if slug in ex.COLLAGES:
        cx, boxes = ex.COLLAGES[slug]
        srcs += [(page, (cx, b)) for b in boxes]
    return srcs


def knockout(img):
    """Black-box logo -> RGBA: alpha from brightness/saturation, greys become charcoal, colours kept."""
    img = img.convert("RGB")
    # Some logos have a white margin around the black box (Nahas): crop to the dark box first.
    dark_box = img.convert("L").point(lambda v: 255 if v < 40 else 0).getbbox()
    if dark_box:
        img = img.crop(dark_box)
    bg = sorted(img.convert("L").getpixel(c) for c in ((0, 0), (img.width - 1, 0), (0, img.height - 1),
                                                          (img.width - 1, img.height - 1)))[1]  # box tone (Nahas is grey, not black)
    out = Image.new("RGBA", img.size)
    src, dst = img.load(), out.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b = src[x, y]
            mx, mn = max(r, g, b), min(r, g, b)
            sat = (mx - mn) / mx if mx else 0
            if sat < 0.3:
                a = max(0, round((mx - bg) * 255 / (255 - bg)))
                dst[x, y] = (*CHARCOAL, a)  # white text on black -> charcoal text, edges anti-aliased
            else:
                dst[x, y] = (r, g, b, min(255, mx * 2))
    bbox = out.split()[3].point(lambda a: 255 if a > 24 else 0).getbbox()
    return out.crop(bbox) if bbox else out


def main():
    manifest = []

    def log(entry, source, group, note=""):
        manifest.append({**entry, "source": source, "group": group, "note": note})

    for folder, slug in SITE_PROJECTS.items():
        site_files = sorted((IMG / "projects" / folder).glob("*.jpg"), key=lambda p: int(p.stem))
        site_imgs = [(f, Image.open(f).convert("RGB")) for f in site_files]
        extra = []
        for pg, src in pdf_sources(slug):
            if src in MANUAL_DUPES.get(slug, []):
                continue
            im = ex.flatten(ex.raw_image(pg, src), False)
            h = dhash(im)
            if any(similar(h, c) for _, s_im in site_imgs for c in crop_hashes(s_im, im.width / im.height)):
                continue
            extra.append((pg, src, im))
        clear(f"project-{slug}")
        n = 0
        for f, im in site_imgs:
            n += 1
            log(ex.export(f"project-{slug}-{n:02d}", im), f"site {f.relative_to(SITE).as_posix()}", slug)
        for pg, src, im in extra:
            n += 1
            log(ex.export(f"project-{slug}-{n:02d}", im), f"pdf p{pg} {src}", slug, "PDF-only photo")
        print(f"{slug}: {len(site_imgs)} site + {len(extra)} pdf-only")

    for fname, name in TEAM.items():
        log(ex.export(name, Image.open(IMG / "team" / fname)), f"site images/team/{fname}", "team",
            "replaces PDF p7 (smaller)")

    for fname, name in LICENSES.items():
        pix = pymupdf.open(SITE.parent / "site" / "licenses" / fname)[0].get_pixmap(dpi=200)
        im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        log(ex.export(name, im), f"site licenses/{fname} (200 DPI render)", "license", "renewed copy")

    for i, (slug, alt, bg) in PARTNERS.items():
        im = Image.open(IMG / "partners" / f"{i}.jpg")
        if bg == "dark":
            im = knockout(im)
        entry = ex.export(f"partner-{slug}", im, keep_alpha=bg == "dark")
        log({**entry, "alt": alt}, f"site images/partners/{i}.jpg", "partner", "knocked out" if bg == "dark" else "")

    (SITE / "export-manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    print(f"exported {len(manifest)} images")
    write_image_map(manifest)


def write_image_map(site_manifest):
    """docs/image-map.md = final state: site exports + PDF exports not superseded by the site stage."""
    site_files = {e["file"] for e in site_manifest}
    site_slugs = set(SITE_PROJECTS.values())
    pdf = [e for e in json.loads((ex.RAW / "manifest.json").read_text(encoding="utf-8"))
           if e["file"] not in site_files and e["group"] not in site_slugs]
    for e in pdf:
        e["source"] = f"pdf p{e['page']} {e['source']}"
        e.setdefault("note", "")
    rows = sorted(site_manifest + pdf, key=lambda e: (e["group"], e["file"]))
    lines = ["# Image map", "",
             "Generated by `scripts/build_site_images.py` (do not edit by hand). Final files in `assets/img/`.",
             "Precedence: same photo in both sources -> larger pixel width kept (site project photos are 1200px, "
             "PDF ~450-600px). **Low res** = kept width < 1200px.", "",
             f"Total: {len(rows)} images, {sum(e['lowRes'] for e in rows)} low res.", "",
             "| File | -md | Source | Group | px | Low res | Note |", "|---|---|---|---|---|---|---|"]
    for e in rows:
        lines.append(f"| {e['file']} | {'yes' if e['md'] else ''} | {e['source']} | {e['group']} | "
                     f"{e['width']}x{e['height']} | {'**yes**' if e['lowRes'] else ''} | {e.get('note', '')} |")
    lines += ["", "## Mirrored from the website but not exported", "",
              "| Site file | Reason |", "|---|---|",
              "| images/services/icons/1-6.jpg | Black line icons, not photos; homepage uses project photos per service (D-006) |",
              "| images/header/logo.jpg, images/footer/logo.jpg (863x277) | White-on-black JPG; PDF logo (809x263, transparent) used instead (D-005) |",
              "| images/chairman/photo.jpg (700x823) | PDF copy is larger (706x831) |",
              "| images/landmark/1-4.jpg | PDF copies equal or larger (team-exp-*) |",
              "| images/hero/background.jpg, images/services/banner.jpg | Referenced by the site but 404 on the server |"]
    (ex.ROOT / "docs" / "image-map.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
