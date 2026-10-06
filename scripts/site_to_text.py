"""site_to_text.py — convert source/site/index.html to source/site-content.md (headings, text, img/alt, links).
Run once after fetch_site.py. Skips <style>, <script>, <svg> and the accessibility widget."""
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {"style", "script", "svg", "noscript", "head"}
BLOCK = {"p", "div", "section", "li", "br", "tr", "footer", "header", "nav", "article", "span", "a", "button"}


class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.out, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in SKIP or (a.get("id") or "").startswith("a11y"):
            self.skip += 1 if tag in SKIP or tag == "div" else 0
            return
        if self.skip:
            return
        if tag == "section" and a.get("id"):
            self.out.append(f"\n\n# [section #{a['id']}]\n")
        if re.fullmatch(r"h[1-6]", tag):
            self.out.append("\n\n" + "#" * (int(tag[1]) + 1) + " ")
        elif tag == "img":
            self.out.append(f"\n[img {a.get('src')} alt=\"{a.get('alt', '')}\"]\n")
        elif tag == "a" and a.get("href", "").startswith(("tel:", "mailto:", "http", "documents", "licenses")):
            self.out.append(f" <{a['href']}> ")
        elif tag in BLOCK:
            self.out.append("\n")

    def handle_endtag(self, tag):
        if tag in SKIP and self.skip:
            self.skip -= 1

    def handle_data(self, d):
        if not self.skip and d.strip():
            self.out.append(" ".join(d.split()) + " ")


p = P()
p.feed((ROOT / "source/site/index.html").read_text(encoding="utf-8"))
text = re.sub(r"\n\s*\n\s*\n+", "\n\n", "".join(p.out))
text = "\n".join(l.strip() for l in text.splitlines())
(ROOT / "source/site-content.md").write_text("# Website text — taameer.ae (fetched 2026-09-30)\n" + text, encoding="utf-8")
