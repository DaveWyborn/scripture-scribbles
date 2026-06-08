#!/usr/bin/env python3
"""
Convert A Faithful Version (AFV) Obsidian markdown to enhanced-JSON Bible format.

Source:  /opt/vault/3. Resources/Scripture/🎚 A Faithful Version/
Output:  data/afv-bible-enhanced.json + .gz

Per chapter file:
  - ###### N   marks verse N
  - line after = verse text
  - _word_     = translator-supplied italics
  - [^N]       = footnote reference (inline)
  - [^N]: ...  = footnote definition (at file end)

Preserves AFV's own book ordering. Standard book IDs (lowercased, no spaces)
so user data (annotations/tags) stays portable across versions.
"""
import json
import gzip
import re
import sys
from pathlib import Path

SRC = Path("/opt/vault/3. Resources/Scripture/🎚 A Faithful Version")
OUT_JSON = Path("/opt/projects/scripture-scribbles/data/afv-bible-enhanced.json")
OUT_GZ = OUT_JSON.with_suffix(".json.gz")

# OT/NT testament classification by book name (post-strip).
OT_BOOK_NAMES = {
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
    "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
    "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
    "Ecclesiastes", "Song of Solomon", "Solomon", "Song of Songs",
    "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
    "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
    "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
}

VERSE_HEADER = re.compile(r"^######\s+(\d+)\s*$")
FOOTNOTE_DEF = re.compile(r"^\[\^(\d+)\]:\s*(.+)$")
FOOTNOTE_REF = re.compile(r"\[\^(\d+)\]")
ITALICS = re.compile(r"_([^_\n]+)_")
CENTER_LINK = re.compile(r"<span class=\"center-me\">.*?</span>", re.DOTALL)
CHAPTER_HEADER = re.compile(r"^#\s+.+$")


def clean_verse_text(raw: str, footnote_refs_seen: list) -> str:
    """Strip footnote refs from text (we record them separately), convert _italics_ to <em>."""
    # Capture footnote ref numbers as we strip them
    for m in FOOTNOTE_REF.finditer(raw):
        footnote_refs_seen.append(int(m.group(1)))
    text = FOOTNOTE_REF.sub("", raw)
    text = ITALICS.sub(r"<em>\1</em>", text)
    # Drop empty parens "()" — the source AFV markdown has ~59 of these where a
    # Greek/Hebrew transliteration note was stripped upstream, leaving the
    # brackets behind (e.g. John 14:17). Nothing to render, so remove them.
    text = re.sub(r"\s*\(\s*\)", "", text)
    # Collapse repeated whitespace (the stripped footnote refs leave gaps)
    text = re.sub(r"\s+", " ", text).strip()
    # Strip leading/trailing whitespace around punctuation introduced by strip
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    return text


def parse_chapter_file(path: Path, chapter_num: int) -> dict:
    lines = path.read_text(encoding="utf-8").splitlines()
    verses = []
    footnote_defs = {}  # n -> text
    verse_footnote_refs = {}  # verse_num -> [footnote_n, ...]

    i = 0
    while i < len(lines):
        line = lines[i]
        # Footnote definition
        m_def = FOOTNOTE_DEF.match(line)
        if m_def:
            footnote_defs[int(m_def.group(1))] = m_def.group(2).strip()
            i += 1
            continue
        # Verse header
        m_ver = VERSE_HEADER.match(line)
        if m_ver:
            vnum = int(m_ver.group(1))
            # Body = following non-blank lines until next verse/footnote/EOF
            body_parts = []
            i += 1
            while i < len(lines):
                nxt = lines[i]
                if VERSE_HEADER.match(nxt) or FOOTNOTE_DEF.match(nxt):
                    break
                stripped = nxt.strip()
                if stripped:
                    body_parts.append(stripped)
                i += 1
            raw = " ".join(body_parts).strip()
            refs = []
            cleaned = clean_verse_text(raw, refs)
            verse_footnote_refs[vnum] = refs
            verses.append({"num": vnum, "text": cleaned})
            continue
        i += 1

    # Build enhanced verse objects
    out_verses = []
    for v in verses:
        verse_obj = {
            "number": v["num"],
            "text": v["text"],
            "type": "paragraph",
            "segments": [
                {"type": "paragraph", "text": v["text"], "start": True}
            ],
        }
        fns = []
        for ref_n in verse_footnote_refs.get(v["num"], []):
            if ref_n in footnote_defs:
                fns.append({
                    "ref": f"{chapter_num}:{v['num']}",
                    "text": footnote_defs[ref_n],
                })
        if fns:
            verse_obj["footnotes"] = fns
        out_verses.append(verse_obj)

    return {"number": chapter_num, "verses": out_verses}


def parse_chapter_num(filename: str) -> int:
    # "Genesis 12.md" -> 12; "Psalms 119.md" -> 119
    m = re.search(r"(\d+)\.md$", filename)
    return int(m.group(1)) if m else 0


def main() -> int:
    if not SRC.exists():
        print(f"AFV source not found at {SRC}", file=sys.stderr)
        return 1

    book_dirs = sorted(
        [p for p in SRC.iterdir() if p.is_dir() and re.match(r"^\d{3}", p.name)],
        key=lambda p: int(p.name[:3]),
    )

    books = []
    for d in book_dirs:
        m = re.match(r"^(\d{3})\s*-\s*(.+)$", d.name)
        if not m:
            print(f"  skip (unrecognised dir): {d.name}", file=sys.stderr)
            continue
        number = int(m.group(1))
        name = m.group(2).strip()
        testament = "OT" if name in OT_BOOK_NAMES else "NT"

        chapter_files = sorted(
            [f for f in d.iterdir() if f.suffix == ".md"],
            key=lambda f: parse_chapter_num(f.name),
        )
        chapters = []
        for cf in chapter_files:
            cnum = parse_chapter_num(cf.name)
            if cnum == 0:
                continue
            chapters.append(parse_chapter_file(cf, cnum))

        verse_count = sum(len(c["verses"]) for c in chapters)
        print(f"  [{number:03d}] {name:24s}  {len(chapters):3d} ch  {verse_count:5d} v  ({testament})")

        books.append({
            "number": number,
            "name": name,
            "testament": testament,
            "chapters": chapters,
        })

    bible = {
        "version": "AFV",
        "name": "A Faithful Version",
        "copyright": "© Coulter; private use only — not for public distribution",
        "books": books,
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(bible, ensure_ascii=False), encoding="utf-8")
    with gzip.open(OUT_GZ, "wt", encoding="utf-8") as f:
        json.dump(bible, f, ensure_ascii=False)

    total_v = sum(sum(len(c["verses"]) for c in b["chapters"]) for b in books)
    total_c = sum(len(b["chapters"]) for b in books)
    print(f"\nWrote {OUT_JSON} ({OUT_JSON.stat().st_size:,} bytes)")
    print(f"Wrote {OUT_GZ} ({OUT_GZ.stat().st_size:,} bytes)")
    print(f"Totals: {len(books)} books, {total_c} chapters, {total_v} verses")
    return 0


if __name__ == "__main__":
    sys.exit(main())
