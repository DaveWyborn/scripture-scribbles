# Bible Paragraph & Heading Research

## Summary

Public domain Bibles **DO** include paragraph markers and section headings when downloaded in USFM format from ebible.org.

## Available Public Domain Bibles (USFM Format)

All available from **https://ebible.org/**

### 1. World English Bible (WEB)
- **Status**: Public domain (no copyright)
- **Style**: Modern English update of ASV
- **URL**: https://ebible.org/web/ (likely - search site)
- **Download**: Available in USFM format

### 2. American Standard Version (ASV 1901)
- **Status**: Public domain (copyright expired)
- **URL**: https://ebible.org/eng-asv/
- **Download**: `eng-asv_usfm.zip`
- **Note**: Older English but solid translation

### 3. King James Version (KJV)
- **Status**: Public domain
- **URL**: https://ebible.org/kjv/
- **Download**: Available in zipped archives
- **Note**: Classic but archaic English

### 4. Others Worth Exploring
- **Young's Literal Translation (YLT)**
- **Darby Translation**
- **Basic English Bible (BBE)**
- **Webster's Bible**

## USFM Format Markers

USFM (Unified Standard Format Markers) is the standard for encoding scripture translations. It includes:

### Paragraph Markers
- `\p` - Normal paragraph (most common)
- `\m` - Flush left (margin) paragraph (no indent)
- `\pi#` - Indented paragraph (# = level)
- `\q#` - Poetic line (# = indent level)

### Section Headings
- `\s` or `\s1` - Section heading (level 1)
- `\s2` - Section heading (level 2)
- `\s3` - Section heading (level 3)

### Other Structural Markers
- `\c` - Chapter number
- `\v` - Verse number
- `\mt#` - Main title
- `\li#` - List item

### Example USFM Text
```
\c 5
\s1 The Sermon on the Mount
\p
\v 1 Seeing the multitudes, he went up onto the mountain. When he had sat down, his disciples came to him.
\v 2 He opened his mouth and taught them, saying,
\p
\v 3 "Blessed are the poor in spirit, for theirs is the Kingdom of Heaven.
\v 4 Blessed are those who mourn, for they shall be comforted.
```

## Implementation Path

### Option A: Convert WEB from USFM (Recommended)
**Effort**: Medium (10-20 hours one-time)

1. Download WEB in USFM format from ebible.org
2. Write Python/Node script to parse USFM
3. Convert to JSON with paragraph and heading data
4. Structure:
   ```json
   {
     "number": 1,
     "text": "In the beginning...",
     "paragraph": true,      // Start of new paragraph
     "heading": null         // Or "Creation" if heading present
   }
   ```

### Option B: Multiple Public Domain Bibles
**Effort**: High (20-40 hours)

- Convert WEB, ASV, and KJV from USFM
- Store all three in database
- Let users switch between versions
- Annotations would reference version + book + chapter + verse

### Option C: Use Existing Parser Libraries
**Effort**: Low-Medium (5-10 hours)

- Use existing USFM parsers:
  - **Node.js**: https://github.com/awoken-bible/usfm
  - **Python**: Various USFM parsing libraries
- Convert to your JSON format
- One-time conversion per Bible version

## Recommended Next Steps

1. **Download WEB USFM**: Get the USFM file from ebible.org
2. **Examine structure**: Look at actual paragraph and heading markers
3. **Choose parser**: Node.js or Python script
4. **Convert to JSON**: Add `paragraph` and `heading` fields to verse objects
5. **Update display code**: Render paragraphs and headings properly

## Display Options Once You Have Paragraph Data

### Reading Mode Options
1. **Verse-by-verse** (current) - Clear study mode
2. **Paragraph mode** - Natural reading with verse numbers in margin or superscript
3. **Pure reading mode** - No verse numbers, just paragraphs and headings
4. **Toggle verse numbers** - User choice

### UI Changes Needed
- CSS for flowing text with inline verse numbers
- Section heading styles
- Paragraph spacing
- Optional: Font size increase for headings

## License Confirmation

All public domain Bibles from ebible.org are:
- ✅ Free to download
- ✅ Free to redistribute
- ✅ Free to modify
- ✅ No attribution required (though nice to include)
- ✅ Can be used commercially

## Questions to Answer

1. **Which Bible first?**
   - WEB (modern English, already using)
   - ASV (more formal, 1901)
   - Both?

2. **Display priority?**
   - Keep verse-by-verse as default?
   - Add "Reading Mode" toggle?
   - Make paragraph mode the default?

3. **Headings style?**
   - Include all section headings?
   - Make them optional/toggleable?
   - What font size/weight?

4. **Annotations compatibility?**
   - Keep verse-based highlights?
   - Allow paragraph-level highlights?
   - Word-level highlights (future)?
