# Fluid Reading Mode - Implementation Guide

## Overview

Fluid Reading Mode displays Bible text in **natural paragraphs** instead of verse-by-verse blocks, creating a more book-like reading experience.

**Prototype:** `fluid-reading-prototype.html`

**View:** http://localhost:8001/fluid-reading-prototype.html (when server running)

## Features Implemented

### ✅ Reading Modes

**1. Reading Mode (Fluid)**
- Verses flow together in paragraphs
- Poetry formatted with proper indentation
- Section headings displayed
- Verse numbers: superscript, margin, or hidden

**2. Verse-by-Verse Mode (Study)**
- Each verse in separate block
- Clear verse numbering
- Good for study and annotation

### ✅ Verse Number Styles

**Superscript** (default)
```
¹In the beginning, God created the heavens... ²The earth was formless...
```

**Margin**
```
1  In the beginning, God created the heavens...
2  The earth was formless...
```

**Hidden**
```
In the beginning, God created the heavens. The earth was formless...
```

### ✅ Content Types

**Paragraphs**
- Natural flowing text
- Justified alignment
- Proper spacing

**Poetry** (Psalms, Prophets)
- Italic text
- 4 indent levels (poetry1-4)
- Maintains poetic structure

**Section Headings**
- Centered, medium weight
- Appears before content
- Examples: "The Beatitudes", "A Psalm of David"

**Footnotes & Cross-References**
- Visual indicators (†, ‡)
- Preserved in data (not yet displayed inline)

## Code Architecture

### Data Flow

```
web-bible-enhanced.json
    ↓
loadBible()
    ↓
renderChapter()
    ↓
renderReadingMode() OR renderVerseMode()
    ↓
renderParagraph() / renderPoetry()
```

### Key Functions

**`renderReadingMode(chapter, verseNumberStyle)`**
- Main rendering logic
- Groups verses into paragraphs/poetry
- Handles transitions between content types

**`renderParagraph(verses, verseNumberStyle)`**
- Renders verse array as flowing paragraph
- Inline verse numbers (if enabled)
- Returns HTML string

**`renderPoetry(verses, level, verseNumberStyle)`**
- Renders poetry with proper indentation
- Handles multiple poetry indent levels
- Returns HTML string

**`renderVerseMode(chapter)`**
- Simple verse-by-verse blocks
- For study/annotation mode

### Verse Grouping Logic

```javascript
// Pseudo-code
for each verse:
  if verse has heading:
    flush current paragraph/poetry
    render heading

  if verse.type starts with 'poetry':
    flush paragraph if exists
    add to poetry array

  else if verse.type === 'paragraph':
    flush poetry if exists
    flush previous paragraph
    start new paragraph

  else:
    add to current paragraph or poetry

flush remaining content
```

## CSS Classes

**Layout:**
- `.reading-mode` - Fluid paragraph layout
- `.verse-mode` - Verse-by-verse blocks
- `.paragraph` - Paragraph container
- `.poetry` - Poetry section container
- `.poetry-line` - Individual poetry line
- `.level-1` through `.level-4` - Poetry indent levels

**Elements:**
- `.verse-number` - Verse number styling
- `.verse-number.margin` - Margin-positioned numbers
- `.verse-text` - Verse text span
- `.section-heading` - Section title
- `.has-footnote` - Footnote indicator (†)
- `.has-crossref` - Cross-reference indicator (‡)

## Integration with Main App

### 1. Mode Toggle

Add to settings menu:

```javascript
const readingMode = localStorage.getItem('readingMode') || 'reading';

function toggleReadingMode() {
  const newMode = readingMode === 'reading' ? 'verse' : 'reading';
  localStorage.setItem('readingMode', newMode);
  renderCurrentChapter();
}
```

### 2. Verse Number Preference

```javascript
const verseNumberStyle = localStorage.getItem('verseNumbers') || 'superscript';

// Options: 'superscript', 'margin', 'hidden'
```

### 3. Annotation Compatibility

**Reading Mode with Annotations:**
- Highlight entire verse span
- Click verse to show annotation panel
- Verse numbers remain clickable targets

```javascript
// Example: Make verses clickable in reading mode
document.querySelectorAll('.verse-wrapper').forEach(wrapper => {
  wrapper.addEventListener('click', (e) => {
    const verseNum = e.target.closest('.verse-wrapper')
      .querySelector('.verse-number').textContent;
    openAnnotationPanel(verseNum);
  });
});
```

## Advanced Features (Future)

### Typography Controls

```javascript
// Font size
document.documentElement.style.setProperty('--base-font-size', '18px');

// Line height
document.documentElement.style.setProperty('--line-height', '1.8');

// Letter spacing
document.documentElement.style.setProperty('--letter-spacing', '0.02em');
```

### Reading Bar Integration

Position reading bar over paragraphs:

```javascript
const readingBar = document.createElement('div');
readingBar.className = 'reading-bar';
readingBar.style.height = '5em'; // 5 lines
readingBar.style.position = 'fixed';
readingBar.style.top = '50%';
// ... blur surrounding text
```

### Smooth Scrolling

```javascript
function scrollToVerse(verseNum) {
  const verse = document.querySelector(`[data-verse="${verseNum}"]`);
  verse?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
```

## Performance Considerations

**Chapter Rendering:**
- Average chapter: 20-50 verses
- Rendering time: <10ms
- No noticeable lag

**Large Chapters:**
- Psalm 119: 176 verses
- Genesis 50: Multi-paragraph
- Still performant with current approach

**Optimization Tips:**
1. Use `documentFragment` for batch DOM updates
2. Cache rendered HTML if switching modes frequently
3. Lazy-load chapters (don't render all 1,189 at once)

## Testing Checklist

**Reading Mode:**
- ✅ Genesis 1 (creation narrative, paragraphs)
- ✅ Psalm 1 (poetry with indentation)
- ✅ Matthew 5 (Beatitudes, mixed prose/poetry)
- ✅ John 3 (narrative prose)

**Verse Number Styles:**
- ✅ Superscript readable
- ✅ Margin aligned properly
- ✅ Hidden maintains flow

**Edge Cases:**
- ✅ Single-verse chapters (Obadiah 1, etc.)
- ✅ Long chapters (Psalm 119)
- ✅ Poetry transitions (Isaiah)
- ✅ Section headings (Psalms)

## Known Limitations

1. **Poetry Detection:**
   - Relies on USFM markers
   - Some poetry may be marked as prose in source

2. **Footnotes/Cross-refs:**
   - Visual indicators only (†, ‡)
   - Not yet clickable/expandable
   - Will implement in v1.2.0

3. **Strong's Numbers:**
   - Not displayed in reading mode
   - Available in data for future features

## Next Steps

**v1.2.0 Implementation:**
1. Integrate fluid reading into main app
2. Add mode toggle to settings
3. Persist user preference (localStorage)
4. Add ASV and KJV Bibles (same format)
5. Bible version selector

**v1.3.0 Enhancements:**
1. Clickable footnotes (modal/tooltip)
2. Cross-reference links (navigate to target)
3. Typography controls (font, spacing)
4. Reading bar overlay

**v1.4.0+ Advanced:**
1. Annotations compatible with reading mode
2. Word-level highlighting
3. Search within reading mode
4. Export formatted text (PDF/ePub)

## Resources

**Files:**
- `fluid-reading-prototype.html` - Working demo
- `web-bible-enhanced.json` - Bible data (92 MB)
- `BIBLE-JSON-FORMAT.md` - Data format docs
- `usfm-converter.js` - USFM to JSON converter

**Start Server:**
```bash
python3 -m http.server 8001
# Open: http://localhost:8001/fluid-reading-prototype.html
```

**Test Data:**
```bash
node test-json.js      # Conversion statistics
node test-strongs.js   # Strong's number coverage
```
