#!/usr/bin/env python3
"""
Strip/transform leftover USFM markers in enhanced Bible JSON files.

Original converters left some inline USFM markup unprocessed. This walks
data/*-bible-enhanced.json.gz, rewrites verse text, and writes back gzipped.

Transformations:
    \\nd LORD\\nd*    → <span class="nd">Lord</span>   (divine name, small-caps)
    \\add of\\add*    → <em>of</em>                    (translator-supplied words)
    \\tl X\\tl*       → <em>X</em>                     (transliterated)
    \\b              → (dropped — paragraph structure lives elsewhere)
    \\bk*            → (dropped — orphan closing tag)

Run from project root:
    python3 clean_usfm_markers.py
"""
import gzip
import json
import re
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"

# Order matters:
#   1. Nested markers (\+nd ... \+nd*) resolve first so their parent (\add) can match.
#   2. \bk* before \b standalone so the latter doesn't eat the former.
TRANSFORMS = [
    (re.compile(r"\\\+nd\s+([^\\]+?)\\\+nd\*"),
     lambda m: f'<span class="nd">{_format_divine_name(m.group(1))}</span>'),
    (re.compile(r"\\nd\s+([^\\]+?)\\nd\*"),
     lambda m: f'<span class="nd">{_format_divine_name(m.group(1))}</span>'),
    (re.compile(r"\\add\s+(.+?)\\add\*"),
     lambda m: f"<em>{m.group(1).strip()}</em>"),
    (re.compile(r"\\tl\s+(.+?)\\tl\*"),
     lambda m: f"<em>{m.group(1).strip()}</em>"),
    (re.compile(r"\\bk\*"), lambda m: ""),
    (re.compile(r"\\b(?=\s|$)"), lambda m: ""),
]


def _format_divine_name(raw: str) -> str:
    """LORD → Lord, GOD → God, LORD's → Lord's. CSS gives small-caps."""
    text = raw.strip()
    if not text:
        return text
    # Capitalise first letter, lowercase the rest. Apostrophes preserved.
    return text[0].upper() + text[1:].lower()


def clean_text(text: str) -> str:
    for pattern, repl in TRANSFORMS:
        text = pattern.sub(repl, text)
    # Tidy stray double spaces left by dropped \b markers.
    text = re.sub(r" {2,}", " ", text).strip()
    return text


def process_file(gz_path: Path) -> dict:
    with gzip.open(gz_path, "rt", encoding="utf-8") as f:
        data = json.load(f)

    before = after = 0
    for book in data["books"]:
        for ch in book["chapters"]:
            for v in ch["verses"]:
                original = v.get("text", "")
                before += sum(1 for _ in re.finditer(r"\\[a-z]+\*?", original))
                cleaned = clean_text(original)
                after += sum(1 for _ in re.finditer(r"\\[a-z]+\*?", cleaned))
                if cleaned != original:
                    v["text"] = cleaned

    # Re-gzip in place. Same compression level as our other Bible files.
    with gzip.open(gz_path, "wt", encoding="utf-8", compresslevel=6) as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    return {"before": before, "after": after}


def main():
    targets = sorted(DATA_DIR.glob("*-bible-enhanced.json.gz"))
    if not targets:
        print("No Bible JSON files found in data/", file=sys.stderr)
        sys.exit(1)

    for path in targets:
        stats = process_file(path)
        delta = stats["before"] - stats["after"]
        print(
            f"{path.name:40s} "
            f"markers: {stats['before']:>6} → {stats['after']:>4}  "
            f"(transformed {delta})"
        )


if __name__ == "__main__":
    main()
