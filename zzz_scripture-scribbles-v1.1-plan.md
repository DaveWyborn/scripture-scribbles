# Scripture Scribbles v1.1.0 - Public Launch Plan

## Current State (v1.0.0)

**Live:** https://scripturescribbles.co.uk
**Requires:**
- Chrome/Edge/Brave browser
- User selects local folder with Bible markdown files
- File System Access API for reading Bible + saving annotations

**Limitations:**
- No Bible files = can't use the app
- High barrier to entry for non-technical users
- Must understand folder structure, markdown files

## v1.1.0 Vision: "Open and Use Instantly"

### Goal
User visits scripturescribbles.co.uk → immediately starts reading and annotating → no setup required

### How: Embedded WEB Bible

**World English Bible (WEB):**
- ✅ Public domain
- ✅ Modern English (not archaic like KJV)
- ✅ Free to redistribute
- ✅ Good quality translation
- ✅ Available as structured data

**Alternative Options:**
- ASV (American Standard Version) - classic, public domain
- KJV (King James Version) - most recognizable, public domain
- Both? Let user choose on first launch

## Storage Strategy: Three Tiers

### Tier 1: No Setup (Default)
**Embedded WEB Bible + Browser Storage**

```
User Flow:
1. Visit scripturescribbles.co.uk
2. WEB Bible loads from GitHub (cached in browser)
3. User starts reading immediately
4. Highlights/notes saved to IndexedDB (browser storage)
5. Everything persists locally, works offline after first load
```

**Technical:**
- Store WEB Bible as JSON in GitHub repo
- Fetch on first visit, cache in IndexedDB
- ~5-10MB total (entire Bible)
- Annotations stored separately in IndexedDB
- Export available anytime (download JSON/Markdown)

**Pros:**
- ✅ Zero setup
- ✅ Works on all browsers (not just Chrome)
- ✅ Mobile-friendly
- ✅ Shareable URL
- ✅ Progressive Web App potential

**Cons:**
- ⚠️ Data tied to browser (clearing cache = lose data)
- ⚠️ Need export/backup workflow

### Tier 2: Local Save (Optional Enhancement)
**Connect to Local Folder for Persistence**

```
User Flow:
1. User happy with app, wants more permanence
2. Clicks "Connect Local Folder" in settings
3. Selects folder (or creates new one)
4. App offers to:
   a) Save embedded WEB Bible to folder as markdown
   b) Save annotations to .annotations/ folder
5. Now working exactly like v1.0.0 but with pre-loaded Bible
```

**Benefits:**
- ✅ Full control of data
- ✅ Backup-friendly (folder can be synced/backed up)
- ✅ Can edit files externally
- ✅ Obsidian integration still works

### Tier 3: Bring Your Own Bible (Power Users)
**Add Additional Bible Versions**

```
User Flow:
1. User wants NIV, ESV, or different translation
2. Options:
   a) Select folder with markdown Bible files (current method)
   b) Upload EPUB Bible file
   c) Download from Bible API
3. App stores in IndexedDB or local folder
4. Switch between versions in dropdown
```

## Implementation Plan

### Phase 1: Prepare WEB Bible Data

**Tasks:**
1. Source WEB Bible structured data (JSON/XML)
   - Option A: bible-api.com export
   - Option B: getbible.net API
   - Option C: ebible.org download
2. Convert to JSON format:
```json
{
  "version": "WEB",
  "books": [
    {
      "id": "matthew",
      "name": "Matthew",
      "chapters": [
        {
          "number": 1,
          "verses": [
            {"number": 1, "text": "The book of..."},
            {"number": 2, "text": "Abraham..."}
          ]
        }
      ]
    }
  ]
}
```
3. Commit to GitHub repo (separate file: `web-bible.json`)
4. Add to git LFS if needed (large file)

**Alternative: Store as Markdown**
- More portable
- Can be used directly if user connects folder
- Larger file size but more future-proof

```
/bibles/
  └── WEB/
      ├── 001 - Genesis/
      │   ├── Genesis 1.md
      │   ├── Genesis 2.md
      │   └── ...
      ├── 040 - Matthew/
      │   ├── Matthew 1.md
      │   └── ...
      └── ...
```

Serve entire folder from GitHub, load on demand.

### Phase 2: IndexedDB Storage Layer

**Add new storage backend:**

```javascript
class StorageManager {
  constructor() {
    this.mode = 'indexeddb'; // or 'filesystem'
  }

  async saveBible(version, data) {
    if (this.mode === 'indexeddb') {
      // Save to IndexedDB
    } else {
      // Save to File System Access API
    }
  }

  async loadChapter(book, chapter) {
    if (this.mode === 'indexeddb') {
      // Load from IndexedDB
    } else {
      // Load from file system (current method)
    }
  }

  async saveAnnotations(bookId, annotations) {
    // Same dual storage
  }
}
```

**IndexedDB Schema:**
```javascript
Database: ScriptureScribbles
  Stores:
    - bibles: { version, bookId, chapterNum, content }
    - annotations: { version, annotationSet, bookId, data }
    - settings: { key, value }
```

### Phase 3: First-Run Experience

**Welcome flow:**

```
┌─────────────────────────────────────────┐
│ Welcome to Scripture Scribbles          │
│                                         │
│ Your Bible study companion              │
│                                         │
│ [Get Started with WEB Bible]            │ ← Default, instant
│                                         │
│ Advanced options:                       │
│ [ ] I have my own Bible folder          │
│ [ ] Download different translation      │
└─────────────────────────────────────────┘
```

**Click "Get Started":**
1. Show loading: "Loading World English Bible..."
2. Fetch WEB Bible from GitHub
3. Store in IndexedDB
4. Load Genesis 1
5. Show tutorial overlay (quick tips)

**Settings added:**
- Storage mode: Browser / Local Folder
- Bible version: WEB / (other versions if added)
- Export data button
- Import backup button

### Phase 4: Export/Backup System

**Export Options:**

**1. Export Annotations Only (JSON)**
```json
{
  "version": "1.1.0",
  "exported": "2025-01-19T10:30:00Z",
  "bibleVersion": "WEB",
  "annotationSets": {
    "Study": { /* all annotations */ },
    "Church": { /* all annotations */ }
  }
}
```

**2. Export Everything (ZIP)**
```
scripture-scribbles-backup.zip
  ├── annotations/
  │   ├── Study/
  │   └── Church/
  ├── sermons/
  │   ├── 2025-01-19-sermon.md
  │   └── ...
  └── metadata.json
```

**3. Export to Folder (File System API)**
- Let user select folder
- Write all markdown + JSON files
- Same structure as v1.0.0
- Can then continue using folder mode

**Import:**
- Upload JSON backup → restore to IndexedDB
- Upload ZIP backup → extract and restore
- Select folder → switch to folder mode

### Phase 5: Progressive Web App (PWA)

**Make it installable:**

```javascript
// manifest.json
{
  "name": "Scripture Scribbles",
  "short_name": "ScripScrib",
  "start_url": "/",
  "display": "standalone",
  "icons": [...],
  "description": "Bible study companion"
}
```

**Service Worker:**
- Cache WEB Bible for offline
- Cache app files
- Works completely offline after first load

**Install prompts:**
- "Add to Home Screen" on mobile
- "Install App" on desktop
- Acts like native app

## Answering Your Questions

### Q: "If we save the WEB version to Git users won't need to download and we can just load over the internet?"

**A: YES, exactly!**

**How it works:**
1. WEB Bible stored in GitHub repo (same as index.html)
2. User visits scripturescribbles.co.uk
3. JavaScript fetches WEB Bible from GitHub on first load
4. Stores in browser IndexedDB
5. Subsequent loads instant (from IndexedDB)
6. Updates only if new version available

**File options:**
- Option A: Single `web-bible.json` file (~5-10MB)
- Option B: Markdown files in `/bibles/WEB/` folder structure
- Option C: Compressed JSON (smaller, faster download)

**GitHub hosting:**
- Free (under 100MB per file)
- Fast CDN delivery
- Automatic caching
- Version control

### Q: "Could we have a local save option?"

**A: YES, two ways!**

**Option 1: Export/Download**
```
Settings → Export Data
  [Download Annotations (JSON)]
  [Download Everything (ZIP)]
  [Export to Markdown]
```

User gets file download, saves wherever they want.

**Option 2: Connect Local Folder**
```
Settings → Storage
  Current: Browser Storage (IndexedDB)

  [Connect Local Folder]
    → Opens folder picker
    → Saves WEB Bible as markdown files
    → Saves annotations to .annotations/
    → Switches to File System mode
```

This is best of both worlds:
- Start instantly with browser storage
- Upgrade to local folder when ready
- Or just export periodically as backup

## Technical Architecture

### Current (v1.0.0):
```
User selects folder → Read markdown → Edit annotations → Save to folder
```

### New (v1.1.0):
```
Load WEB from GitHub → Store in IndexedDB → Read/annotate → Save to IndexedDB
                                                          ↓
                                         Optional: Export or connect folder
```

### Storage Comparison:

| Feature | IndexedDB (v1.1) | File System (v1.0) |
|---------|------------------|-------------------|
| Setup required | None | Select folder |
| Browser support | All modern | Chrome/Edge/Brave only |
| Offline | Yes (after first load) | Yes |
| Backup | Export button | OS-level backup |
| Obsidian integration | Via export | Direct |
| Mobile-friendly | Yes | Limited |
| Data persistence | Browser-dependent | Full control |

## Launch Checklist

**Before v1.1.0 launch:**

- [ ] Obtain WEB Bible data (structured format)
- [ ] Convert to JSON or keep as markdown
- [ ] Add to GitHub repo
- [ ] Implement IndexedDB storage layer
- [ ] Update first-run experience
- [ ] Add export/import features
- [ ] Test on multiple browsers
- [ ] Add settings for storage mode switching
- [ ] Update documentation
- [ ] Add PWA manifest + service worker
- [ ] Test offline functionality
- [ ] Create backup/restore workflow
- [ ] Update landing page (emphasize "instant start")

**After launch monitoring:**
- Check GitHub bandwidth usage
- Monitor IndexedDB storage issues
- Collect feedback on storage preferences
- Plan additional Bible versions

## Mobile Support (Critical!)

### Current Problem (v1.0.0):
**File System Access API not supported on:**
- ❌ iOS Safari
- ❌ iOS Chrome (actually Safari underneath)
- ❌ iOS Firefox (actually Safari underneath)
- ❌ Android Firefox
- ❌ Most mobile browsers

**Result:** App currently unusable on iPhone/iPad and many Android devices.

### v1.1.0 Solution: IndexedDB Works Everywhere!

**IndexedDB is supported on:**
- ✅ iOS Safari (iPhone/iPad)
- ✅ Android Chrome
- ✅ Android Firefox
- ✅ All mobile browsers
- ✅ All desktop browsers

**This means v1.1.0 will work on mobile immediately!**

### User Experience by Device:

**Desktop (Chrome/Edge/Brave):**
- Option 1: Use IndexedDB (embedded WEB Bible) ← Default
- Option 2: Connect local folder (File System API) ← Advanced

**Desktop (Firefox/Safari):**
- Only option: IndexedDB (embedded WEB Bible)
- File System API not available (gracefully hidden)

**Mobile (iPhone/iPad/Android):**
- Only option: IndexedDB (embedded WEB Bible)
- Works perfectly!
- Can export/backup via download
- PWA install → acts like native app

### Updated Feature Detection:

```javascript
// Check capabilities on load
const capabilities = {
  fileSystem: 'showDirectoryPicker' in window,
  indexedDB: 'indexedDB' in window,
  mobile: /iPhone|iPad|Android/i.test(navigator.userAgent)
};

// Show appropriate UI
if (capabilities.mobile || !capabilities.fileSystem) {
  // Hide "Connect Local Folder" option
  // Only show IndexedDB mode
  // Emphasize export/backup
} else {
  // Show both options
  // Let user choose
}
```

### Mobile-Specific Features:

**PWA Install (Acts Like Native App):**
- Add to Home Screen
- Full screen (no browser UI)
- App icon on home screen
- Launch like any other app
- Works offline

**Mobile Export:**
- Export → triggers download
- Save to Files app (iOS) or Downloads (Android)
- Can backup to iCloud/Google Drive manually
- Or share via email/messaging

**Sermon Notes on Mobile:**
- Quick-add verse field optimized for mobile
- 📖 Visual selector (no typing needed)
- Large touch targets
- Bottom panel doesn't block view
- Swipe to collapse

### Why This Wasn't Caught Earlier:

**v1.0.0 was designed for:**
- Desktop users with local Bible markdown files
- Obsidian integration (desktop app)
- Power users comfortable with file systems

**Mobile users would hit immediate error:**
```javascript
// Line in current code:
if (!('showDirectoryPicker' in window)) {
  alert('Your browser does not support the File System Access API...');
  return;
}
```

This blocks **all mobile users** from even trying the app.

### v1.1.0 Fixes This:

**New welcome flow:**
```javascript
// Check capabilities
if ('indexedDB' in window) {
  // Great! Load embedded Bible
  loadEmbeddedBible();
} else {
  // Very old browser, show error
  showBrowserUpdateMessage();
}

// File System is optional enhancement
if ('showDirectoryPicker' in window) {
  // Show "Connect Folder" option in settings
}
```

**Everyone gets working app, features vary by capability.**

## Benefits of This Approach

**For Mobile Users (NEW!):**
- ✅ App actually works on iPhone/iPad!
- ✅ Works on Android (all browsers)
- ✅ Install as PWA (home screen app)
- ✅ Full functionality (read, annotate, sermon notes)
- ✅ Export/backup via download
- ✅ Offline after first load

**For Desktop Users:**
- ✅ Instant start, no setup
- ✅ Works on all browsers (not just Chrome)
- ✅ Can upgrade to local storage later
- ✅ Export data anytime
- ✅ Offline-capable

**For Project:**
- ✅ Lower barrier to entry = more users
- ✅ Better first impression
- ✅ Mobile users can participate (HUGE!)
- ✅ Easier to share/demo
- ✅ Progressive enhancement (basic → advanced)
- ✅ Much larger potential audience

**For Advanced Users:**
- ✅ Can still use local folders (desktop only)
- ✅ Can add own Bible versions
- ✅ Full control when wanted
- ✅ Export to Obsidian still works

## Recommendation

**Ship v1.1.0 with:**
1. Embedded WEB Bible (GitHub-hosted)
2. IndexedDB storage (default)
3. Export/backup functionality
4. Optional folder connection (Settings)
5. Keep File System mode for power users

This satisfies both audiences:
- **Mainstream users:** Just works, instant
- **Power users:** Full control available

**Slogan:** "Open and use instantly. Take control when ready."
