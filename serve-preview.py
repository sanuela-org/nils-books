#!/usr/bin/env python3
"""Preview server for the built Quartz site (mimics GitHub Pages clean URLs).

Serves ./public on 0.0.0.0:9120: /confident-heart -> confident-heart.html,
/books/ -> books/index.html. Run:  python3 serve-preview.py
"""
import http.server
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path):
        p = super().translate_path(path)
        if os.path.isdir(p):
            idx = os.path.join(p, "index.html")
            if os.path.exists(idx):
                return idx
        elif not os.path.exists(p) and not os.path.splitext(p)[1]:
            if os.path.exists(p + ".html"):
                return p + ".html"
        return p


if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("0.0.0.0", 9120), Handler).serve_forever()
