"""gen-wp-tables.py — regenerates the two master tables of docs/wp-mapping.md from the CSS sources.

    python scripts/gen-wp-tables.py            # rewrites the GENERATED block of docs/wp-mapping.md

Global variables = every --tp- custom property in tokens.css (name, value, layer comment).
Global classes   = every rule in the ELEMENTOR SOURCE stylesheets (base, layout, components, inner-pages) with
                   the properties it sets; rules inside @media carry the media query in the selector column.
Theme rules (theme.css) are listed separately: they ship as a file and are not recreated in Elementor.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS = ROOT / "assets" / "css"


def strip_comments(s):
    return re.sub(r"/\*.*?\*/", "", s, flags=re.S)


def variables():
    text = (CSS / "tokens.css").read_text(encoding="utf-8")
    rows = []
    layer = ""
    for line in text.splitlines():
        m = re.match(r"\s*/\*\s*-+\s*(.*?)\s*-*\s*\*/\s*$", line)
        if m:
            layer = m.group(1)
        d = re.match(r"\s*(--tp-[\w-]+)\s*:\s*(.*?);\s*(?:/\*\s*(.*?)\s*\*/)?\s*$", line)
        if d:
            rows.append((d.group(1), d.group(2), d.group(3) or "", layer))
    return rows


def rules(path):
    text = strip_comments(path.read_text(encoding="utf-8"))
    out = []
    i = 0
    stack = []  # media prefixes
    buf = ""
    while i < len(text):
        c = text[i]
        if c == "{":
            head = buf.strip()
            buf = ""
            if head.startswith("@media"):
                stack.append(re.sub(r"\s+", " ", head))
                i += 1
                continue
            if head.startswith("@keyframes") or head.startswith("@font-face"):
                depth = 1
                i += 1
                while depth and i < len(text):
                    depth += (text[i] == "{") - (text[i] == "}")
                    i += 1
                continue
            j = text.index("}", i)
            body = text[i + 1:j]
            decls = [re.sub(r"\s+", " ", x.strip()) for x in body.split(";") if x.strip()]
            out.append((" ".join(stack), re.sub(r"\s+", " ", head), "; ".join(decls)))
            i = j + 1
            continue
        if c == "}":
            if stack:
                stack.pop()
            buf = ""
            i += 1
            continue
        buf += c
        i += 1
    return out


def esc(s):
    return s.replace("|", "\\|")


def main():
    lines = ["## Global variables (every `--tp-` token)", "",
             f"{len(variables())} variables, generated from `assets/css/tokens.css`. Create each as an Elementor v4 global variable with the same name and value.", "",
             "| Variable | Value | Note | Layer |", "|---|---|---|---|"]
    for n, v, note, layer in variables():
        lines.append(f"| `{n}` | `{esc(v)}` | {esc(note)} | {esc(layer)} |")
    lines += ["", "## Global classes (every reusable class and the properties it sets)", "",
              "Generated from the ELEMENTOR SOURCE stylesheets. Create one Elementor v4 global class per class name; rules with a media query map to the tablet/mobile controls (the breakpoint is 64em = desktop, below it the base rule). Heading classes `tp-h1`–`tp-h4` set colour explicitly.", ""]
    total = 0
    for f in ("base", "layout", "components", "inner-pages"):
        rs = rules(CSS / f"{f}.css")
        lines += [f"### {f}.css ({len(rs)} rules)", "", "| Media | Selector | Properties |", "|---|---|---|"]
        for media, sel, props in rs:
            lines.append(f"| {esc(media.replace('@media ', ''))} | `{esc(sel)}` | {esc(props)} |")
        lines.append("")
        total += len(rs)
    th = rules(CSS / "theme.css")
    lines += [f"### theme.css ({len(th)} rules) — ships as a file (E1), not recreated in Elementor", "",
              "Selectors only; see the file for properties.", ""]
    sels = sorted({re.sub(r"\s+", " ", s) for _, s, _ in th})
    lines.append(", ".join(f"`{esc(s)}`" for s in sels))
    lines.append("")
    (ROOT / "docs" / "wp-mapping-tables.generated.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"variables: {len(variables())}, class rules: {total}, theme rules: {len(th)}")


if __name__ == "__main__":
    main()
