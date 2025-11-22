# Bible Version Integration Guide

**Purpose:** Ensure consistent book IDs, ordering, and structure across all Bible versions

---

## Critical Lessons Learned (WEB Enhanced Integration)

### Issue 1: Book ID Generation
**Problem:** Enhanced JSON had `name` field only, no `id` field
**Solution:** Generate IDs on load: `book.id = book.name.toLowerCase().replace(/\s+/g, '')`
**Result:** `"Genesis"` → `"genesis"`, `"1 Samuel"` → `"1samuel"`, `"Song of Solomon"` → `"songofsolomon"`

### Issue 2: OT/NT Book Classification Mismatch
**Problem:** `OT_BOOKS` constant used hyphens (`'1-samuel'`) but generated IDs didn't (`'1samuel'`)
**Solution:** Match ID generation format exactly (no hyphens, no spaces)
**Result:** Correct 39 OT / 27 NT split ✅

---

## Integration Checklist for New Bible Versions

### 1. Book ID Consistency ✅
- [ ] **Check:** Does the JSON have `id` fields?
- [ ] **If NO:** Add ID generation in `bible-loader.js`
- [ ] **Format:** `lowercase`, `no spaces`, `no hyphens`, `no punctuation`
- [ ] **Example transforms:**
  - `"Genesis"` → `"genesis"`
  - `"1 Samuel"` → `"1samuel"`
  - `"Song of Solomon"` → `"songofsolomon"`
  - `"1 Corinthians"` → `"1corinthians"`

### 2. Book Order ✅
- [ ] **Verify:** First 39 books are OT, next 27 are NT
- [ ] **Check:** Book `number` field matches traditional order
- [ ] **Test:** Navigation modal shows correct OT/NT separation

### 3. Constants to Update

**In `js/state.js`:**
- [ ] **OT_BOOKS** - Must match generated ID format exactly
- [ ] **BIBLE_BOOK_ORDER** - For export sorting (all 66 books)
- [ ] **BOOK_ABBR** - For navigation grid display

**Format rules:**
```javascript
// ❌ WRONG (with hyphens/spaces)
'1-samuel', 'song-of-solomon'

// ✅ CORRECT (matches ID generation)
'1samuel', 'songofsolomon'
```

### 4. Chapter/Verse Structure
- [ ] **Check:** Chapter `number` field exists
- [ ] **Check:** Verses have `number` and `text` fields
- [ ] **Test:** Chapter navigation works (1-150 for Psalms, etc.)

### 5. Enhanced Features (Optional)
- [ ] **Paragraphs:** `type: 'paragraph'` markers
- [ ] **Poetry:** Indentation levels for poetic books
- [ ] **Headings:** Section titles
- [ ] **Footnotes:** Cross-references, study notes
- [ ] **Strong's:** Original language word numbers

---

## Example ID Generation Function

```javascript
// In bible-loader.js after loading JSON
bibleData.books.forEach(book => {
    // Generate consistent ID from name
    book.id = book.name
        .toLowerCase()           // "Genesis" → "genesis"
        .replace(/\s+/g, '')     // "1 Samuel" → "1samuel"
        .replace(/[-_]/g, '');   // Remove hyphens/underscores
});
```

---

## Testing New Bible Versions

### Quick Test Checklist
1. **Load Bible data** - No console errors
2. **Check first book** - Should be Genesis (OT)
3. **Navigate to 1 Samuel** - Should appear in OT section
4. **Navigate to Matthew** - Should appear in NT section
5. **Check last book** - Should be Revelation (NT)
6. **Test chapter count** - Psalms has 150, Genesis has 50
7. **Test verse count** - John 3:16 exists, Psalm 119:176 exists

### Console Checks
```javascript
// In browser console
bibleData.books[0].id === 'genesis'  // Should be true
bibleData.books[38].id === 'malachi' // Last OT book
bibleData.books[39].id === 'matthew' // First NT book
bibleData.books[65].id === 'revelation' // Last NT book

// Check OT_BOOKS matches
OT_BOOKS.includes('1samuel') // Should be true
OT_BOOKS.includes('matthew') // Should be false
```

---

## Common Pitfalls to Avoid

### ❌ Inconsistent ID Formats
```javascript
// DON'T mix formats:
OT_BOOKS = ['genesis', '1-samuel']  // Hyphen in one, not others
book.id = name.toLowerCase()         // Spaces still present
```

### ❌ Hardcoded Book Numbers
```javascript
// DON'T assume book numbers:
if (bookNumber <= 39) { /* OT */ }  // May not match all versions
```

### ✅ Use Testament Field or OT_BOOKS Array
```javascript
// DO use explicit lists:
if (OT_BOOKS.includes(book.id)) { /* OT */ }
// OR use testament field if available:
if (book.testament === 'OT') { /* OT */ }
```

---

## Version-Specific Quirks

### World English Bible (WEB)
- ✅ Traditional 66-book Protestant canon
- ✅ Standard order (Genesis → Revelation)
- ⚠️ Enhanced JSON uses `name` only (no `id` field)

### American Standard Version (ASV) - Future
- ✅ Same as WEB (66 books, traditional order)
- ⚠️ May have different JSON structure

### Catholic/Orthodox Bibles - Future
- ⚠️ Deuterocanonical books (73+ books total)
- ⚠️ Different book order (Tobit, Judith, Maccabees, etc.)
- 🔴 **Requires:** Separate OT_BOOKS list for each canon

### Commercial Versions (NIV, ESV, NASB) - v1.6.0+
- ⚠️ API-based (not bundled JSON)
- ⚠️ May return different structure
- 🔴 **Requires:** Transform layer to normalize structure

---

## File Size Limits (GitHub)

**Current:** `web-bible-enhanced.json` = 88MB (⚠️ Warning at 50MB)
**Recommendation:** Compress or split large Bible versions
**Strategy for v1.2+:**
- Consider splitting OT/NT into separate files
- Use Git LFS for files > 50MB
- Or compress with gzip (fetch + decompress on load)

---

## Version Control Strategy

### When Adding New Bible Versions:
1. **Create branch:** `git checkout -b add-bible-asv`
2. **Add JSON:** `data/asv-bible-enhanced.json`
3. **Test thoroughly** (use checklist above)
4. **Update constants** (`OT_BOOKS`, `BOOK_ABBR`, etc.)
5. **Document quirks** in this file
6. **Commit with clear message:**
   ```
   Add: American Standard Version (ASV) Bible

   - 66 books, traditional Protestant canon
   - Enhanced JSON with paragraphs + poetry
   - Book IDs normalized (no spaces/hyphens)
   - Tested: Genesis, Psalms, Matthew, Revelation
   ```

---

## Summary: Golden Rules

✅ **Always generate/normalize book IDs** on load
✅ **Match OT_BOOKS format** to ID generation exactly
✅ **Test OT/NT split** in navigation modal
✅ **Document version quirks** in this file
✅ **Keep files < 50MB** or use Git LFS

**When in doubt:** Check how WEB Enhanced is integrated (see `js/bible-loader.js`)
