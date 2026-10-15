#!/usr/bin/env python3
"""Bundle the game (index.html + css/ + js/) into ONE self-contained HTML file.

Usage:  python3 tools/bundle.py [output.html]
Useful for hosting the game as a single file (the source stays modular).
"""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")

def inline_css(m):
    return "<style>\n" + (root / m.group(1)).read_text(encoding="utf-8") + "\n</style>"

def inline_js(m):
    return "<script>\n" + (root / m.group(1)).read_text(encoding="utf-8") + "\n</script>"

html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)"\s*/?>', inline_css, html)
html = re.sub(r'<script src="(js/[^"]+)"></script>', inline_js, html)
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else root / "white-knuckle-bundle.html")
out.write_text(html, encoding="utf-8")
print("wrote", out, f"({out.stat().st_size // 1024} KB)")
