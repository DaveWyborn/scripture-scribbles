#!/usr/bin/env python3
"""
Convert World English Bible from markdown files to comprehensive JSON.
"""

import os
import json
import re
from pathlib import Path

# Book ID mapping
BOOK_NAMES = {
    "01": ("Genesis", "genesis"),
    "02": ("Exodus", "exodus"),
    "03": ("Leviticus", "leviticus"),
    "04": ("Numbers", "numbers"),
    "05": ("Deuteronomy", "deuteronomy"),
    "06": ("Joshua", "joshua"),
    "07": ("Judges", "judges"),
    "08": ("Ruth", "ruth"),
    "09": ("1 Samuel", "1samuel"),
    "10": ("2 Samuel", "2samuel"),
    "11": ("1 Kings", "1kings"),
    "12": ("2 Kings", "2kings"),
    "13": ("1 Chronicles", "1chronicles"),
    "14": ("2 Chronicles", "2chronicles"),
    "15": ("Ezra", "ezra"),
    "16": ("Nehemiah", "nehemiah"),
    "17": ("Esther", "esther"),
    "18": ("Job", "job"),
    "19": ("Psalms", "psalms"),
    "20": ("Proverbs", "proverbs"),
    "21": ("Ecclesiastes", "ecclesiastes"),
    "22": ("Song of Solomon", "songofsolomon"),
    "23": ("Isaiah", "isaiah"),
    "24": ("Jeremiah", "jeremiah"),
    "25": ("Lamentations", "lamentations"),
    "26": ("Ezekiel", "ezekiel"),
    "27": ("Daniel", "daniel"),
    "28": ("Hosea", "hosea"),
    "29": ("Joel", "joel"),
    "30": ("Amos", "amos"),
    "31": ("Obadiah", "obadiah"),
    "32": ("Jonah", "jonah"),
    "33": ("Micah", "micah"),
    "34": ("Nahum", "nahum"),
    "35": ("Habakkuk", "habakkuk"),
    "36": ("Zephaniah", "zephaniah"),
    "37": ("Haggai", "haggai"),
    "38": ("Zechariah", "zechariah"),
    "39": ("Malachi", "malachi"),
    "40": ("Matthew", "matthew"),
    "41": ("Mark", "mark"),
    "42": ("Luke", "luke"),
    "43": ("John", "john"),
    "44": ("Acts", "acts"),
    "45": ("Romans", "romans"),
    "46": ("1 Corinthians", "1corinthians"),
    "47": ("2 Corinthians", "2corinthians"),
    "48": ("Galatians", "galatians"),
    "49": ("Ephesians", "ephesians"),
    "50": ("Philippians", "philippians"),
    "51": ("Colossians", "colossians"),
    "52": ("1 Thessalonians", "1thessalonians"),
    "53": ("2 Thessalonians", "2thessalonians"),
    "54": ("1 Timothy", "1timothy"),
    "55": ("2 Timothy", "2timothy"),
    "56": ("Titus", "titus"),
    "57": ("Philemon", "philemon"),
    "58": ("Hebrews", "hebrews"),
    "59": ("James", "james"),
    "60": ("1 Peter", "1peter"),
    "61": ("2 Peter", "2peter"),
    "62": ("1 John", "1john"),
    "63": ("2 John", "2john"),
    "64": ("3 John", "3john"),
    "65": ("Jude", "jude"),
    "66": ("Revelation", "revelation")
}


def clean_text(text):
    """Clean verse text by removing markdown and tags."""
    # Remove crossref tags
    text = re.sub(r'<crossref>.*?</crossref>', '', text)

    # Remove #AFV tags
    text = re.sub(r'#AFV/\S+', '', text)

    # Remove navigation links [[...]]
    text = re.sub(r'\[\[.*?\]\]', '', text)

    # Remove markdown bold/italic
    text = re.sub(r'\*\*\*(.+?)\*\*\*', r'\1', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)

    # Clean up extra whitespace
    text = ' '.join(text.split())

    return text.strip()


def parse_chapter_file(filepath):
    """Parse a chapter markdown file and extract verses."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into lines
    lines = content.split('\n')

    verses = []
    current_verse_num = None
    current_verse_text = []

    for line in lines:
        # Skip title lines (# Matthew 5)
        if line.startswith('# '):
            continue

        # Skip navigation links
        if '[[' in line and ']]' in line:
            continue

        # Skip horizontal rules
        if line.strip() == '***':
            continue

        # Check for verse marker
        verse_match = re.match(r'^#+\s*v(\d+)$', line.strip())
        if verse_match:
            # Save previous verse if exists
            if current_verse_num is not None:
                text = ' '.join(current_verse_text)
                text = clean_text(text)
                if text:  # Only add if not empty
                    verses.append({
                        "number": current_verse_num,
                        "text": text
                    })

            # Start new verse
            current_verse_num = int(verse_match.group(1))
            current_verse_text = []
        elif current_verse_num is not None and line.strip():
            # Add to current verse text
            current_verse_text.append(line.strip())

    # Add final verse
    if current_verse_num is not None:
        text = ' '.join(current_verse_text)
        text = clean_text(text)
        if text:
            verses.append({
                "number": current_verse_num,
                "text": text
            })

    return verses


def process_book(book_path, book_num):
    """Process all chapters in a book folder."""
    book_name, book_id = BOOK_NAMES[book_num]
    testament = "old" if int(book_num) <= 39 else "new"

    chapters = []
    chapter_files = sorted(Path(book_path).glob('*.md'))

    for chapter_file in chapter_files:
        # Extract chapter number from filename
        chapter_match = re.search(r'-(\d+)\.md$', chapter_file.name)
        if chapter_match:
            chapter_num = int(chapter_match.group(1))
            verses = parse_chapter_file(chapter_file)

            if verses:  # Only add if verses found
                chapters.append({
                    "number": chapter_num,
                    "verses": verses
                })

    # Sort chapters by number
    chapters.sort(key=lambda x: x['number'])

    return {
        "id": book_id,
        "name": book_name,
        "testament": testament,
        "chapters": chapters
    }


def main():
    """Main conversion function."""
    base_path = Path('/Users/davewyborn/Documents/1_Project/aiforthewin/ScriptureScribbles/WEB')
    output_path = Path('/Users/davewyborn/Documents/1_Project/aiforthewin/ScriptureScribbles/web-bible-complete.json')

    print("Starting World English Bible conversion...")
    print(f"Source: {base_path}")
    print(f"Output: {output_path}")
    print()

    books = []
    total_chapters = 0
    total_verses = 0

    # Get all book folders
    book_folders = sorted([d for d in base_path.iterdir() if d.is_dir()])

    for book_folder in book_folders:
        # Extract book number from folder name
        folder_match = re.match(r'^(\d+)\s*-', book_folder.name)
        if not folder_match:
            continue

        book_num = folder_match.group(1)
        if book_num not in BOOK_NAMES:
            continue

        print(f"Processing {book_folder.name}...", end=' ')

        book_data = process_book(book_folder, book_num)
        books.append(book_data)

        chapters_count = len(book_data['chapters'])
        verses_count = sum(len(ch['verses']) for ch in book_data['chapters'])

        total_chapters += chapters_count
        total_verses += verses_count

        print(f"{chapters_count} chapters, {verses_count} verses")

    # Create final JSON structure
    bible_data = {
        "version": "WEB",
        "books": books
    }

    # Write to file
    print()
    print("Writing JSON file...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(bible_data, f, ensure_ascii=False, indent=2)

    # Get file size
    file_size = output_path.stat().st_size
    file_size_mb = file_size / (1024 * 1024)

    # Print summary
    print()
    print("=" * 60)
    print("CONVERSION COMPLETE")
    print("=" * 60)
    print(f"Books converted:    {len(books)}")
    print(f"Chapters converted: {total_chapters}")
    print(f"Verses converted:   {total_verses}")
    print(f"Output file size:   {file_size:,} bytes ({file_size_mb:.2f} MB)")
    print(f"Output location:    {output_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()
