# Scripture Scribbles - Feature Ideas & Strategic Direction

## Strategic Focus (v1.1.0+)

**Primary Goal:** Make it dead simple for mainstream users
- "Open your Bible, take notes, done"
- Export/import features = secondary (power users only)
- Lower barrier to entry

## File Format Support

### EPUB Support
- Many Bible apps export to EPUB
- Would massively expand compatibility
- Technical considerations:
  - EPUB is zipped HTML/XHTML
  - Need chapter/verse detection logic
  - May need different parsing strategy vs markdown
  - File System Access API can handle

### e-Sword Support
- Popular Windows Bible software
- Uses proprietary database format (.bblx)
- Would need format reverse engineering or export capability
- Alternative: e-Sword exports to text - could support that

### Other Digital Bible Formats
- YouVersion (exports?)
- Logos Bible Software
- Olive Tree
- **Research needed:** What formats do they export?

## Sermon Notes Feature

**Concept:** Persistent note area that follows you through navigation

**Implementation Ideas:**
- Bottom panel/sidebar that stays visible
- Not tied to specific passage (though can reference passages)
- Metadata: Date, speaker, church, series, passage(s) referenced
- Saved separately from verse annotations
- Could have own "Sermons" section in app

**Use Cases:**
- Take notes during sermon while reading along
- Reference multiple passages without losing notes
- Review sermon notes later
- Link sermon to specific date/speaker

**Storage:**
```
.annotations/
  └── Sermons/
      └── 2025-01-19-grace-in-trials.json
```

## Multi-Bible Support

**Easy to Sync:**
- Notes (full verse annotations) ✅
- Tags ✅
- Full verse highlights ✅
- User preference: "Apply annotations to all Bible versions"

**Hard to Sync:**
- Word/phrase highlights (position-dependent)
- Different translations have different text
- Possible solution: Store by verse + word index/range
- Or: Keep word highlights version-specific

**Implementation:**
- Annotations reference verse numbers (universal)
- Word highlights store version ID + position
- User can choose: "Sync simple annotations" vs "Keep everything version-specific"

## Mainstream User Focus

**Current Friction Points:**
1. File System Access API browser requirement
2. Need markdown Bible files
3. Folder structure requirements

**Solutions for v1.1.0:**

### Option 1: Built-in Bible
- Ship with one open-license Bible (WEB, ASV, KJV)
- Users can immediately start without any files
- "Add your own Bible" becomes optional advanced feature

### Option 2: Easy Bible Download
- "Get Started" wizard
- Download Bible button → fetches markdown from online source
- Saves to IndexedDB or asks for folder permission
- User doesn't need to know about markdown

### Option 3: Upload Bible
- Drag & drop EPUB/text file
- App converts and stores internally
- No File System Access API needed (use IndexedDB)

## Technical Considerations

**Browser Storage Options:**
- File System Access API (current) - requires folder selection
- IndexedDB - works in all browsers, 50MB+ limit
- localStorage - too small for Bible text
- **Hybrid approach:** IndexedDB for Bible text, File System for annotations (if user wants)

**Progressive Enhancement:**
1. Start with built-in Bible (no permissions needed)
2. Let users add more Bibles (upload/download)
3. Optionally connect to local folder for advanced users
4. Export annotations anytime

## Priority Ranking

**Must Have (v1.1.0):**
1. Built-in Bible option (remove folder requirement)
2. Better onboarding for mainstream users

**Should Have (v1.2.0):**
1. Sermon notes feature
2. EPUB support
3. Multi-Bible with annotation sync

**Nice to Have (v2.0.0):**
1. e-Sword import
2. Other Bible format support
3. Advanced word-highlight syncing across versions

## Questions to Resolve

1. Which open-license Bible to ship with?
   - WEB (World English Bible) - modern, public domain
   - ASV (American Standard Version) - classic, public domain
   - KJV - most recognizable, public domain

2. Sermon notes UI placement?
   - Bottom panel?
   - Sidebar?
   - Separate page?
   - Floating window?

3. Multi-Bible UI?
   - Version switcher dropdown?
   - Side-by-side comparison?
   - Quick toggle?

4. Storage strategy?
   - Keep File System Access API as advanced feature?
   - Move to IndexedDB primary with File System optional?
   - Hybrid approach?

## Next Steps

1. Design improvements (current focus)
2. Downloadable WEB version with built-in Bible
3. Test with non-technical users
4. Iterate based on feedback
