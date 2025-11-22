# Enhanced Bible JSON Format

## Overview

This document describes the enhanced JSON format used for Bible text with paragraphs, poetry, footnotes, cross-references, and Strong's concordance numbers.

**File:** `web-bible-enhanced.json`
**Size:** 92 MB (5.32 MB gzipped)
**Source:** World English Bible (WEB) in USFM format from ebible.org
**Conversion:** `usfm-converter.js`

## Root Structure

```json
{
  "version": "WEB",
  "name": "World English Bible",
  "copyright": "Public Domain",
  "books": [ /* array of book objects */ ]
}
```

## Book Object

```json
{
  "number": 1,
  "name": "Genesis",
  "testament": "OT",
  "chapters": [ /* array of chapter objects */ ]
}
```

**Fields:**
- `number`: 1-66 (canonical book order)
- `name`: Full book name (e.g., "Genesis", "1 Corinthians")
- `testament`: "OT" or "NT"
- `chapters`: Array of chapter objects

## Chapter Object

```json
{
  "number": 1,
  "verses": [ /* array of verse objects */ ]
}
```

**Fields:**
- `number`: Chapter number (1-based)
- `verses`: Array of verse objects

## Verse Object

### Basic Structure

```json
{
  "number": 1,
  "text": "In the beginning, God created the heavens and the earth."
}
```

**Required fields:**
- `number`: Verse number (1-based)
- `text`: Clean verse text (Strong's markers removed, readable)

### Optional Fields

#### Paragraph/Poetry Type

```json
{
  "number": 1,
  "text": "...",
  "type": "paragraph"
}
```

**Possible values:**
- `"paragraph"` - Start of a new paragraph
- `"poetry1"` - Poetry line, indent level 1
- `"poetry2"` - Poetry line, indent level 2
- `"poetry3"` - Poetry line, indent level 3
- `"poetry4"` - Poetry line, indent level 4

**Behaviour:**
- Only the **first verse** in a paragraph/poetry section has `type`
- Subsequent verses in the same section have no `type` field
- Used to render flowing paragraphs vs verse-by-verse blocks

#### Section Headings

```json
{
  "number": 1,
  "text": "...",
  "heading": "The Creation"
}
```

**Fields:**
- `heading`: Section title or Psalm description
- Appears before the verse content

#### Strong's Concordance Numbers

```json
{
  "number": 16,
  "text": "For God so loved the world...",
  "words": [
    { "text": "For", "strong": "G1063" },
    { "text": "God", "strong": "G2316" },
    { "text": "so", "strong": "G3779" },
    { "text": "loved" },
    { "text": "the", "strong": "G1519" }
  ]
}
```

**Word object:**
- `text`: The English word/phrase
- `strong`: (optional) Strong's number (e.g., "G2316" for Greek, "H3068" for Hebrew)

**Coverage:**
- 81.2% of words have Strong's numbers
- Punctuation and untranslatable words have no `strong` field
- Enables cross-version word matching and lexicon lookups

#### Footnotes

```json
{
  "number": 2,
  "text": "...",
  "footnotes": [
    {
      "ref": "1:2",
      "text": "\"Yahweh\" is God's proper Name, sometimes rendered \"LORD\"."
    }
  ]
}
```

**Footnote object:**
- `ref`: Origin reference (chapter:verse)
- `text`: Footnote explanation

**Types of footnotes:**
- Translation alternatives ("Or: kingdom of God")
- Textual notes ("NU omits 'the king'")
- Term explanations ("Yahweh is God's proper Name")
- Manuscript variants (critical apparatus)

#### Cross-References

```json
{
  "number": 23,
  "text": "...",
  "crossRefs": [
    {
      "origin": "1:23",
      "refs": "Isaiah 7:14"
    }
  ]
}
```

**Cross-reference object:**
- `origin`: Where the reference applies (chapter:verse)
- `refs`: Target scripture references (comma-separated)

### Complete Example

```json
{
  "number": 5,
  "text": "Blessed are the gentle, for they shall inherit the earth.",
  "type": "poetry2",
  "words": [
    { "text": "Blessed", "strong": "G3107" },
    { "text": "are", "strong": "G1510" },
    { "text": "the", "strong": "G3588" },
    { "text": "gentle", "strong": "G4239" },
    { "text": "," },
    { "text": "for", "strong": "G3754" },
    { "text": "they", "strong": "G3588" },
    { "text": "shall", "strong": "G3748" },
    { "text": "inherit", "strong": "G2816" },
    { "text": "the", "strong": "G3588" },
    { "text": "earth", "strong": "G1093" },
    { "text": "." }
  ],
  "footnotes": [
    {
      "ref": "5:5",
      "text": "or, land."
    }
  ],
  "crossRefs": [
    {
      "origin": "5:5",
      "refs": "Psalms 37:11"
    }
  ]
}
```

## Statistics

**WEB Bible Enhanced JSON:**
- 66 books
- 1,189 chapters
- 31,098 verses
- 834,859 word objects
- 677,693 words with Strong's numbers (81.2%)

**Content features:**
- 7,305 paragraph markers
- 6,985 poetry lines (various indent levels)
- 1,117 footnotes
- 340 cross-references
- 117 section headings

## Usage Examples

### Display Paragraphs

```javascript
function renderChapter(chapter) {
  let currentParagraph = [];

  chapter.verses.forEach(verse => {
    if (verse.type === 'paragraph' && currentParagraph.length > 0) {
      // Render previous paragraph
      renderParagraph(currentParagraph);
      currentParagraph = [];
    }

    currentParagraph.push(verse);
  });

  // Render final paragraph
  if (currentParagraph.length > 0) {
    renderParagraph(currentParagraph);
  }
}
```

### Find Word by Strong's Number

```javascript
function findWordByStrongs(book, chapter, verse, strongsNumber) {
  const verseData = bible.books[book].chapters[chapter].verses[verse];

  return verseData.words?.filter(w => w.strong === strongsNumber) || [];
}

// Example: Find all instances of "God" (G2316) in John 3:16
const godWords = findWordByStrongs('John', 3, 16, 'G2316');
```

### Display Poetry with Indentation

```javascript
function renderVerse(verse) {
  if (verse.type?.startsWith('poetry')) {
    const level = parseInt(verse.type.replace('poetry', ''));
    const indent = level * 2; // 2em per level
    return `<div style="margin-left: ${indent}em">${verse.text}</div>`;
  }

  return `<div>${verse.text}</div>`;
}
```

## Conversion

**Source:** USFM files from https://ebible.org/Scriptures/eng-web_usfm.zip

**Script:** `usfm-converter.js`

```bash
# Convert USFM to enhanced JSON
node usfm-converter.js /path/to/usfm/dir output.json
```

**Process:**
1. Downloads USFM files (66 canonical books)
2. Parses paragraph markers (`\p`), poetry (`\q1`, `\q2`), headings (`\s`, `\d`)
3. Extracts footnotes (`\f`), cross-references (`\x`), Strong's numbers (`\w`)
4. Cleans text (removes USFM markers)
5. Outputs structured JSON

## Performance Considerations

**File Size:**
- Raw JSON: 92 MB
- Gzipped: 5.32 MB (5.8% compression)
- Recommend serving gzipped with `Content-Encoding: gzip`

**Loading Strategy:**
- Option 1: Load entire Bible (5.32 MB gzipped) - works for most use cases
- Option 2: Split by book (66 files) - faster initial load
- Option 3: Lazy load books on demand - best for mobile

**Memory Usage:**
- Parsed JSON in memory: ~92 MB
- Consider keeping only active book in memory for mobile devices

## License

**World English Bible:** Public Domain
**Enhanced JSON Format:** MIT License
**Conversion Script:** MIT License

No copyright, free to use, modify, and redistribute.
