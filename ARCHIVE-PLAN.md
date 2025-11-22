# Archive Plan - Clean Up Pre-Refactor Files

## Files to Archive

### Old Prototypes (move to archive/old-prototypes/)
- `bible-viewer-prototype.html` - Early prototype (reference only)
- `fluid-reading-prototype.html` - v1.2 prototype (superseded by v1.2.html)
- `fluid-reading-v2.html` - v1.2 iteration (superseded)
- `fluid-reading-v3.html` - v1.2 iteration (superseded)
- `theme-tester.html` - Theme testing tool (can keep or archive)
- `theme-tester-backup.html` - Backup of theme tester
- `test-supabase.html` - Supabase connection test

### Old Monolithic CSS (move to archive/old-css/)
- `css/scripture-scribbles.css` (1971 lines) - OLD monolithic CSS
- `scripture-scribbles-v1.1.css` - v1.1 monolithic CSS (no longer used)

### Old Monolithic HTML (move to archive/old-monolithic/)
- `scripture-scribbles-v1.1.html` (2330 lines) - Keep as reference

### Test Scripts (move to archive/test-scripts/)
- `test-json.js` - JSON format testing
- `test-strongs.js` - Strong's number testing
- `fix-psalm-119.js` - One-time fix script

### Keep in Root (still actively used)
✅ `index.html` - Landing page
✅ `preview.html` - Preview redirect
✅ `roadmap.html` - Public roadmap
✅ `themes.html` - Theme selector
✅ `why.html` - "Why We Exist" page
✅ `scripture-scribbles-v1.1-refactored.html` - Current version
✅ `scripture-scribbles-v1.2.html` - Work in progress
✅ `supabase-config.js` - Active config
✅ `usfm-converter.js` - Active tool for Bible conversion

## Archive Strategy

1. Create archive structure
2. Move files (preserve git history)
3. Update any references
4. Commit with clear message
5. Verify nothing breaks

## Benefits

- Cleaner root directory
- Easier to find current files
- Preserved history for reference
- Clear separation: active vs archived
