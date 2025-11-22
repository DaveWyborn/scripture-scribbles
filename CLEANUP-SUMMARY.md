# Cleanup Summary - Root Directory Organised

**Date:** 22 November 2025  
**Goal:** Remove pre-refactor clutter, archive old files, maintain clean structure

---

## What Was Archived

### 📦 13 Files Moved to Archive

**Old Prototypes (7 files) → `archive/old-prototypes/`**
- `bible-viewer-prototype.html` - Early prototype (reference)
- `fluid-reading-prototype.html` - v1.2 early iteration
- `fluid-reading-v2.html` - v1.2 iteration 2
- `fluid-reading-v3.html` - v1.2 iteration 3
- `theme-tester.html` - Theme testing tool
- `theme-tester-backup.html` - Backup
- `test-supabase.html` - Connection test

**Old Monolithic CSS (2 files) → `archive/old-css/`**
- `css/scripture-scribbles.css` (1971 lines) - Old monolithic CSS
- `scripture-scribbles-v1.1.css` - v1.1 embedded CSS

**Old Monolithic HTML (1 file) → `archive/old-monolithic/`**
- `scripture-scribbles-v1.1.html` (2330 lines) - Pre-refactor version

**Test Scripts (3 files) → `archive/test-scripts/`**
- `test-json.js` - JSON format testing
- `test-strongs.js` - Strong's number testing
- `fix-psalm-119.js` - One-time fix script

---

## Root Directory NOW (9 active files)

```
/
├── index.html ✅ Landing page
├── preview.html ✅ Preview redirect
├── roadmap.html ✅ Public roadmap
├── themes.html ✅ Theme selector
├── why.html ✅ "Why We Exist" page
├── scripture-scribbles-v1.1-refactored.html ✅ CURRENT VERSION
├── scripture-scribbles-v1.2.html ✅ Work in progress
├── supabase-config.js ✅ Active config
└── usfm-converter.js ✅ Bible conversion tool
```

---

## Modular Structure (Active Files)

```
css/
├── base.css (319 lines) ✅
├── components.css (1192 lines) ✅
└── themes.css (460 lines) ✅

js/
├── state.js (116 lines) ✅
├── bible-loader.js (69 lines) ✅
├── auth.js (129 lines) ✅
├── annotations.js (629 lines) ✅
├── verse-renderer.js (222 lines) ✅
├── navigation.js (220 lines) ✅
├── ui.js (579 lines) ✅
└── app.js (170 lines) ✅

data/
└── web-bible-enhanced.json (88MB) ✅
```

---

## File Size Compliance

**✅ All files under 2000-line limit**

Largest files:
- `css/components.css` - 1192 lines (40% headroom to 2000)
- `js/annotations.js` - 629 lines (69% headroom)
- `js/ui.js` - 579 lines (71% headroom)

**Guideline:** Monitor when files approach 1500 lines, split before 2000.

---

## Benefits

✅ **Cleaner root** - Only 9 active HTML/JS files (was 20+)  
✅ **Clear structure** - Active vs archived separation  
✅ **Preserved history** - All old files still in git  
✅ **Easy navigation** - Find current work instantly  
✅ **Better maintainability** - No confusion about which files are active  
✅ **All files < 2000 lines** - Excellent maintainability  

---

## Archive Structure

```
archive/
├── old-prototypes/ (7 files)
├── old-css/ (2 files)
├── old-monolithic/ (1 file)
└── test-scripts/ (3 files)
```

Files preserved for reference but removed from active workspace.

---

## Next: v1.2 Reading Mode

With clean structure in place, ready to add v1.2:
- Add `css/reading-mode.css` (paragraphs, poetry)
- Add `js/reading-renderer.js` (fluid display)
- Keep all new files < 1500 lines
- Monitor `css/components.css` if adding UI components
