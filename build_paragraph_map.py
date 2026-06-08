#!/usr/bin/env python3
"""
Build a paragraph break-point map from the reference version (WEB).

Other versions vary wildly in how their source marks paragraphs:
  - ASV / KJV: a single \\p per chapter → render as one giant block
  - AFV / BSB: a marker on (nearly) every verse → render as individual verses
  - WEB: balanced, lands breaks on real topic/speaker changes → reads best

So we take WEB's per-verse break-points (any verse whose segments include a
`start: true` marker begins a new block) and let the app overlay them onto
versions flagged for normalisation (see NORMALISE_PARAGRAPHS in
js/paragraph-map.js). Headings are NOT borrowed — each version keeps its own.

Keyed by book NAME, not number: AFV uses a deliberate non-traditional book
order, so numbers are not comparable across versions. Names are stable.

Output: data/paragraph-map.json + .gz
"""
import gzip
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "data" / "web-bible-enhanced.json.gz"
OUT_JSON = ROOT / "data" / "paragraph-map.json"
OUT_GZ = ROOT / "data" / "paragraph-map.json.gz"


def main():
    with gzip.open(SRC, "rt", encoding="utf-8") as f:
        bible = json.load(f)

    out = {}
    total = 0
    for book in bible["books"]:
        chapters = {}
        for ch in book["chapters"]:
            starts = []
            for v in ch["verses"]:
                for seg in (v.get("segments") or []):
                    if seg.get("start"):
                        starts.append(v["number"])
                        break
            if starts:
                chapters[str(ch["number"])] = starts
                total += len(starts)
        out[book["name"]] = chapters

    payload = {"reference": "WEB", "books": out}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    with gzip.open(OUT_GZ, "wt", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False)

    print(f"Built paragraph map: {len(out)} books, {total} break-points")
    print(f"  {OUT_JSON} ({OUT_JSON.stat().st_size // 1024} KB)")
    print(f"  {OUT_GZ} ({OUT_GZ.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
