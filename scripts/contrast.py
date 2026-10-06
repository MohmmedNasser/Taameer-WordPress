"""contrast.py — WCAG 2.1 contrast of every text/background token pair used by the design (re-runnable).

    python scripts/contrast.py

Reads the hex values from assets/css/tokens.css.
AA: normal text >= 4.5, large text (>= 24px, or >= 18.66px bold) >= 3.0, UI components/graphics >= 3.0.
"""
import re
from pathlib import Path

TOKENS = Path(__file__).resolve().parent.parent / "assets" / "css" / "tokens.css"
DEFAULT = {"bg": "#FFFFFF", "surface": "#FFFFFF", "sand": "#F4F4F4", "stone": "#D9D9D9", "accent": "#0D0D0D",
           "accent-text": "#262626", "secondary": "#595959", "text": "#0D0D0D", "text-muted": "#595959",
           "white": "#FFFFFF", "on-accent": "#FFFFFF"}


def load():
    c = dict(DEFAULT)
    if TOKENS.exists():
        for name, hexv in re.findall(r"--tp-color-([a-z-]+):\s*(#[0-9A-Fa-f]{6})", TOKENS.read_text(encoding="utf-8")):
            c[name] = hexv
    return c


def lum(h):
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda v: v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


# (foreground, background, minimum, usage)
PAIRS = [(fg, bg, 4.5, "body/small text") for fg in ("text", "text-muted", "accent-text", "secondary")
         for bg in ("bg", "surface", "sand")]
# Bronze accent is decorative only ("+" marks, hairlines, FAB fill) and never used for text: informational.
INFO = [("accent", bg, "decorative only (no text) — informational") for bg in ("bg", "surface", "sand")]
PAIRS += [("on-accent", "accent", 4.5, "button label / FAB icon on accent fill"),
          ("white", "accent-text", 4.5, "official button hover: white label on charcoal (informational for bronze)"),
          ("stone", "bg", 1.0, "hairline (decorative, exempt)")]

if __name__ == "__main__":
    c = load()
    fails = 0
    print(f"{'foreground':<14}{'background':<15}{'ratio':>7}  {'min':>4}  result  usage")
    for fg, bg, need, use in PAIRS:
        if fg not in c or bg not in c:
            continue
        r = ratio(c[fg], c[bg])
        ok = r >= need
        fails += not ok
        print(f"{fg:<14}{bg:<15}{r:>7.2f}  {need:>4}  {'PASS' if ok else 'FAIL'}    {use}")
    for fg, bg, use in INFO:
        print(f"{fg:<14}{bg:<15}{ratio(c[fg], c[bg]):>7.2f}     -  INFO    {use}")
    print(f"\n{fails} failing pair(s)")
