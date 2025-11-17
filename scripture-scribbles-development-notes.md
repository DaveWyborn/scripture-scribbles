# Scripture Scribbles Reader - Development Notes

## Project Overview
Custom Bible study tool with highlights, notes, and tags using markdown syntax. Built as single-file HTML application using File System Access API.

## Current Status (Phase 2 - Complete!)

### Completed Features ✅

**Core App (`scripture-scribbles-reader.html`)**
- ✅ File System Access API integration
- ✅ Deep folder scanning with template file filtering
- ✅ Two-tier dropdown (Book → Chapter)
- ✅ Previous/Next navigation
- ✅ WikiLink navigation (`[[chapter]]` links)
- ✅ All view modes (Reading, Study, Church, Custom)
- ✅ Dark mode with toggle
- ✅ Font size controls (87.5% - 137.5%)
- ✅ Collapsible advanced settings
- ✅ Book file ordering (overview files first)
- ✅ _ssr duplicate filtering in dropdown

**Editing System**
- ✅ Two-mode interaction (hover icons + text selection)
- ✅ Word-level highlights (six colours)
- ✅ Full verse highlights
- ✅ Multi-verse notes
- ✅ Tag system with chips
- ✅ Highlight conflict detection
- ✅ Live preview before saving
- ✅ Delete buttons for notes/tags

**Save Functionality**
- ✅ Markdown generation (all syntax types)
- ✅ File System Access API write
- ✅ Two save strategies (overwrite/copy)
- ✅ Persistent save strategy preference
- ✅ Auto-load _ssr files
- ✅ Save preview modal with diff
- ✅ Post-save reload

**Settings Persistence**
- ✅ View mode (localStorage)
- ✅ Dark mode preference
- ✅ Font size setting
- ✅ Last viewed chapter (book + chapter name)
- ✅ Save strategy preference

**Documentation**
- ✅ README.md with full usage guide
- ✅ Custom syntax reference
- ✅ Sample Bible chapter (1 Peter 2)
- ✅ Annotated example file
- ✅ Site structure plan for Cloudflare Pages

### Remaining Phase 2 Tasks

**High Priority:**
- ⏳ **Replace browser popups with custom UX modals**
  - Current: Uses `alert()` and `confirm()` (functional but not user-friendly)
  - Replace with: Styled modal dialogs matching app design
  - Locations to update:
    - File selection errors
    - WikiLink not found warnings
    - Highlight conflict confirmations
    - Save errors/success messages
    - Chapter loading errors

**Medium Priority:**
- ⏳ **Cleanup tools** (Advanced Settings panel):
  - Remove all highlights from chapter
  - Remove all notes from chapter
  - Merge _ssr file back to original
  - Extract notes to separate file
  - Revert chapter to original

## Annotation Storage Structure

### Current Implementation (Per-Book Folders)
```
Scripture/
└── A Faithful Version/
    ├── 046 - 1 Peter/
    │   ├── 1 Peter 1.md
    │   ├── 1 Peter 2.md
    │   └── .annotations-Study.json  ← Current approach
    └── 047 - 2 Peter/
        ├── 2 Peter 1.md
        └── .annotations-Study.json
```

### Recommended: Centralised Annotations Folder
```
Scripture/
├── A Faithful Version/
│   ├── 046 - 1 Peter/
│   │   ├── 1 Peter 1.md
│   │   └── 1 Peter 2.md
│   └── 047 - 2 Peter/
│       ├── 2 Peter 1.md
│       └── 2 Peter 2.md
└── .annotations/
    ├── Study/
    │   ├── 046-1-Peter.json
    │   └── 047-2-Peter.json
    ├── Church/
    │   ├── 046-1-Peter.json
    │   └── 047-2-Peter.json
    └── HomeGroup/
        └── 046-1-Peter.json
```

### Benefits of Centralised Approach

**Organisation:**
- All annotations in one place (easy to find, backup, share)
- Grouped by annotation set (Study/Church/HomeGroup/Personal)
- Doesn't clutter Bible book folders

**Backup & Sync:**
- Single folder to backup: `/.annotations/`
- Google Drive sync: Just sync one folder
- Export annotations: Zip entire `.annotations` folder

**Multi-Bible Support:**
- One `.annotations` folder per Bible version
- User can switch Bibles, keep annotations separate
- Future: Compare annotations across versions

**Search & Analysis:**
- All Study notes: Scan `.annotations/Study/*.json`
- All annotations across all sets: Scan `.annotations/*/*.json`
- Faster than searching through 66 book folders

**File System:**
- Cleaner book folders (just Bible text)
- Hidden `.annotations` folder (starts with dot)
- Less visual clutter in file manager

### File Naming Convention

**Format:** `{book-number}-{book-name}.json`

**Examples:**
- `001-Genesis.json`
- `046-1-Peter.json`
- `047-2-Peter.json`
- `066-Revelation.json`

**Why include book number:**
- Ensures correct sort order (Genesis before Exodus)
- Handles edge cases (1 Peter vs 2 Peter vs 3 John)
- Future-proof for search/indexing

### Implementation Changes Needed

**Update `loadAnnotationsForBook()`:**
```javascript
async function loadAnnotationsForBook(bookName) {
    try {
        // Navigate to .annotations folder at Bible root
        const annotationsFolder = await bibleFolder.getDirectoryHandle('.annotations', { create: true });

        // Get or create annotation set folder (Study/Church/etc.)
        const setFolder = await annotationsFolder.getDirectoryHandle(currentAnnotationSet, { create: true });

        // File naming: book number + book name (e.g., "046-1-Peter.json")
        const filename = `${bookName.replace(/ /g, '-')}.json`;

        try {
            const fileHandle = await setFolder.getFileHandle(filename);
            const file = await fileHandle.getFile();
            const text = await file.text();
            currentAnnotations = JSON.parse(text);
        } catch (err) {
            // File doesn't exist - create new
            currentAnnotations = {
                version: "1.0",
                annotationSet: currentAnnotationSet,
                bookName: bookName,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                chapters: {}
            };
        }
    } catch (err) {
        console.error('Error loading annotations:', err);
    }
}
```

**Update `saveAnnotationsForBook()`:**
```javascript
async function saveAnnotationsForBook() {
    try {
        // Navigate to .annotations/[SetName] folder
        const annotationsFolder = await bibleFolder.getDirectoryHandle('.annotations', { create: true });
        const setFolder = await annotationsFolder.getDirectoryHandle(currentAnnotationSet, { create: true });

        // Save to book-specific file
        const bookName = getCurrentBookName(); // e.g., "046 - 1 Peter"
        const filename = `${bookName.replace(/ /g, '-')}.json`;

        currentAnnotations.modified = new Date().toISOString();

        const fileHandle = await setFolder.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(currentAnnotations, null, 2));
        await writable.close();

        return true;
    } catch (err) {
        console.error('Error saving annotations:', err);
        return false;
    }
}
```

### Migration from Current Implementation

For existing users (future):
```javascript
async function migrateAnnotations() {
    // Scan all book folders for .annotations-*.json files
    // Move to centralised .annotations/{SetName}/ structure
    // Clean up old files
}
```

**Decision:** Implement centralised structure from the start (before public release)

## Custom Markdown Syntax

### Highlights
```markdown
±1{text} through ±6{text}
```
Colours: yellow, green, pink, blue, orange, purple

### Notes
```markdown
±n{note text}           # Assumes verse above
±n9{note}               # Specific verse
±n9-12{note}            # Range
±n9,12{note}            # Multiple specific verses
±n3:12-4:5{note}        # Cross-chapter
```

### Tags
```markdown
±t{#tag1 #tag2}
±t9{#theology}
```

## File Structure

### Bible Organization
```
3. Resources/Scripture/[Bible Version]/
├── 001 - Genesis/
│   ├── Genesis 1.md
│   ├── Genesis 2.md
│   └── ...
├── 046 - 1 Peter/
│   ├── 1 Peter 1.md
│   ├── 1 Peter 2.md
│   └── ...
```

### Markdown Format
- Chapter title: `# 1 Peter 2`
- Navigation links: `[[1 Peter 1| ← Previous]] | [[1 Peter 3| Next →]]`
- Verses: `###### 1` (H6 header)
- Verse text follows on next line

### Skip Patterns
Indexer filters out files/folders containing:
- `template`, `temp`, `_draft`, `scratch`, `test`, `.`, `README`

## View Modes

### Reading Mode
- Everything off
- Clean text only

### Study Mode
- All features enabled
- Highlights, notes, tags visible
- All margin markers showing

### Church Mode
- Only note markers (blue bars)
- Quick glance at annotated verses

### Custom Mode
- Manual configuration
- Auto-switches when user changes toggles
- Opens Advanced Settings panel

## Technical Architecture

### File System Access API
```javascript
// Select folder
const dirHandle = await window.showDirectoryPicker({mode: 'readwrite'});

// Read file
const fileHandle = await dirHandle.getFileHandle('filename.md');
const file = await fileHandle.getFile();
const content = await file.text();

// Write file (for future editing feature)
const writable = await fileHandle.createWritable();
await writable.write(content);
await writable.close();
```

### Data Structures
```javascript
fileIndex = [
  {
    handle: FileSystemFileHandle,
    path: "046 - 1 Peter/1 Peter 2.md",
    displayName: "046 - 1 Peter/1 Peter 2",
    index: 42
  },
  ...
]

bookIndex = {
  "046 - 1 Peter": [
    {file objects for all chapters in 1 Peter}
  ],
  ...
}
```

### Rendering Flow
1. Parse markdown line by line
2. First pass: identify verses with highlights/notes/tags
3. Second pass: render HTML with appropriate classes
4. CSS controls visibility based on body classes

## Pending Features (Phase 2)

### High Priority
1. **Fix chapter loading bug** - Debug why chapters don't appear
2. **In-browser editing** - Select text, add highlight/note/tag via UI
3. **Save modal** - Show example syntax changes, choose save strategy
4. **WikiLink navigation** - Click [[link]] to jump to chapter

### Medium Priority
5. **Cleanup tools** (Advanced Settings)
   - Remove all highlights/notes (scrub)
   - Merge _ssr files to originals
   - Extract notes to separate file
   - Revert single chapter
6. **Settings persistence** - localStorage for preferences
7. **Auto-save** - Optional auto-save on edit

### Lower Priority
8. **WEB Bible bundling** - Include public domain Bible
9. **Bible download feature** - Link to free markdown Bibles
10. **API.Bible integration** - Fetch chapters on demand

## Future Phases

### Phase 3: Import/Export Notes
**Purpose:** Share study notes with friends, life groups, or transfer between Bible versions

#### Export Features
- **Export annotations only** (no Bible text)
  - JSON format with verse references
  - Includes highlights, notes, tags
  - Book/chapter/verse metadata

- **Export options:**
  - Single chapter
  - Entire book
  - Selected books (e.g., all NT epistles)
  - Full Bible annotations
  - Date range (notes added/modified within timeframe)

#### Import Features
- **Import from JSON** → Apply to current Bible
- **Conflict handling:**
  - Keep mine / Keep theirs / Merge
  - Show diff before applying

#### Highlight Conversion Strategy
**Problem:** Word-specific highlights break across Bible versions
- Version A: "Jesus ±1{Christ}"
- Version B: "Jesus ±1{the Messiah}" ← Text mismatch, highlight lost

**Solution: Smart version-aware export with text verification**

**Same version + text match → Exact copy:**
- Both use AFV 2020 edition, text identical
- Export includes highlighted text for verification
- Import attempts exact match first
- `±1{Christ}` → Searches verse 9 for "Christ" → Found → Word-level highlight preserved

**Same version + text mismatch → Verse expansion:**
- AFV 2018 vs AFV 2023 (minor edits between editions)
- Export: `{"text": "Christ", ...}`
- Import: Searches verse 9 for "Christ" → Not found (now "the Christ")
- Falls back to verse-level highlight

**Different version → Verse expansion:**
- AFV → ESV → Expected mismatch
- Import applies to full verse immediately

**Export format example:**
```json
{
  "exportVersion": "A Faithful Version",
  "book": "1 Peter",
  "chapter": 2,
  "verses": [
    {
      "verse": 9,
      "highlights": [
        {
          "colour": 1,
          "text": "Christ",
          "offset": 45
        }
      ],
      "notes": ["Important verse about identity"],
      "tags": ["#theology", "#identity"]
    }
  ]
}
```

**UI workflow:**
1. User clicks "Export annotations"
2. Detects Bible version from folder structure or user input
3. Exports with highlighted text snippets for verification
4. Friend imports
5. **Import logic:**
   - Try exact text match in target verse
   - Match found → Apply word-level highlight
   - No match → Fall back to verse-level
   - Show summary: "Applied 47 exact, 3 expanded to verse"

**Edge cases:**
- Text appears multiple times in verse → Highlight first occurrence, log ambiguity
- Text partially matches → Expand to verse (e.g., "Christ" vs "Christ Jesus")
- Verse numbers differ (rare) → Manual review needed

#### Implementation Notes
- Preserve note text exactly (version-independent)
- Tags transfer directly (metadata)
- Highlight colours preserved but applied to full verse
- Book/chapter notes transfer without modification

### Phase 4: CLI Tools
- `extract-notes --book "1 Peter"` → study guide
- `extract-notes --search "grace"` → find notes
- Syntax conversion scripts
- `convert-export --format json` → JSON export from CLI

### Phase 5: Advanced Features
- Section heading support (H2/H3)
- Multi-version comparison
- Export formatted study guides
- Collaborative merge tools

### Phase 6: Settings Persistence
- localStorage for custom mode config
- Remember font size, dark mode
- Last viewed chapter

### Phase 7: Mobile App (Capacitor)
**Goal:** Native iOS/Android apps using existing codebase

#### Why Capacitor
- Reuse 95% of current HTML/CSS/JS code
- Real filesystem access on iOS/Android
- App Store distribution capability
- Medium effort (~1-2 weeks)

#### Technical Changes Required

**1. Setup & Configuration (1 hour)**
```bash
npm init
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
```

**2. Replace File System Access API → Capacitor Filesystem (2-3 days)**
- Current: `window.showDirectoryPicker()` (Chrome-only)
- Replace with: Capacitor Filesystem plugin
- Handle iOS document picker
- Handle Android storage permissions
- Maintain folder scanning/indexing logic

**3. Mobile UX Enhancements (2 days)**
- **Touch gestures:**
  - Swipe left/right for next/previous chapter
  - Long-press verse for action menu (replaces hover)
  - Pull-to-refresh folder index
- **Bottom sheets:** Replace modals with mobile-friendly bottom sheets
- **Keyboard:** Handle on-screen keyboard for note/tag input
- **Safe areas:** Respect notch/home indicator on modern phones

**4. Mobile-Specific Features**
- Share button → iOS/Android share sheet (export annotations)
- Haptic feedback on selections
- Dark mode follows system preference
- Optimise font sizes for phone screens
- Portrait/landscape support

**5. Testing & Deployment (2-3 days)**
- Test on iOS simulator (requires Mac + Xcode)
- Test on Android emulator
- Physical device testing
- App Store setup:
  - Apple Developer account ($99/year)
  - Google Play Developer ($25 one-time)
  - Screenshots, descriptions, privacy policy
  - Submit for review

#### File Access Strategy (iOS/Android)

**iOS:**
- Use `UIDocumentPickerViewController` via Capacitor
- User selects Bible folder → App gets bookmark access
- Folder remains accessible between sessions

**Android:**
- Use Storage Access Framework (SAF)
- Request `READ_EXTERNAL_STORAGE` permission
- User grants folder access via system picker

#### Folder Structure (Mobile)
```
ios/
  App/
    App/
      public/
        index.html  ← Symlink to main HTML
android/
  app/
    src/
      main/
        assets/
          public/
            index.html  ← Symlink to main HTML
scripture-scribbles-reader.html  ← Main source (unchanged)
package.json
capacitor.config.json
```

#### Distribution Options

**Option A: App Stores (Recommended)**
- iOS App Store
- Google Play Store
- Reach widest audience
- Automatic updates
- Requires developer accounts

**Option B: Direct Distribution**
- iOS: TestFlight (limited to 10k testers)
- Android: APK sideloading
- No fees, more control
- Manual updates, smaller reach

#### Estimated Timeline
- Week 1: Filesystem API migration, mobile gestures, testing
- Week 2: Polish, store setup, submission
- Week 3-4: App review (iOS ~1-2 weeks, Android ~1-3 days)

#### Future Mobile Enhancements (Phase 8+)
- Cloud sync (iCloud Drive, Google Drive)
- Offline Bible bundling (ship with WEB Bible)
- Audio Bible integration
- Split-screen for cross-references
- Widget: Verse of the day with your notes

## Save Strategy Design

### Modal Example (Not Yet Implemented)
```
┌──────────────────────────────────────────┐
│  💾 Save Your Changes - Matthew 1        │
├──────────────────────────────────────────┤
│  Example of what will be added:          │
│                                           │
│  ###### 18                                │
│  The birth of ±1{Jesus Christ}...        │
│  ±n18{Important note}                    │
│  ±t18{#prophecy}                         │
│                                           │
│  ○ Overwrite original (Matthew 1.md)     │
│  ○ Save as copy (Matthew 1_ssr.md)       │
│                                           │
│  ☑ Remember my choice                    │
│                                           │
│  [Cancel]  [Save Changes]                │
└──────────────────────────────────────────┘
```

## Development Environment

### Browser Support
- **Required:** Chrome, Edge, or Chromium-based browser
- **Reason:** File System Access API
- **Safari/Firefox:** Not currently supported

### Testing
- Use prototype for syntax testing
- Use Phase 2 app for file navigation testing
- Test with actual Bible markdown files in proper structure

## Key Design Decisions

1. **Single HTML file** - Maximum portability, no build step
2. **Local-first** - All data stays on user's device
3. **Plain markdown** - Future-proof, tool-agnostic
4. **Progressive enhancement** - Works with existing markdown, adds features non-destructively

## Margin Bar Colour System

### Single Markers
- Yellow: Has highlight (±1-6)
- Blue: Has note (±n)
- Purple: Has tag (±t)

### Combined Markers (Gradients)
- Yellow/Blue: Highlight + Note
- Yellow/Purple: Highlight + Tag
- Blue/Purple: Note + Tag
- Yellow/Blue/Purple: All three (33/33/33 split)

Only shows colours for enabled features (respects toggle state).

## Dark Mode Colours

### Highlights (adjusted for readability on dark background)
- ±1: #665500 (dark golden)
- ±2: #2d5a2d (dark green)
- ±3: #6b3d52 (dark pink)
- ±4: #2d5a6b (dark blue)
- ±5: #6b4d2d (dark orange)
- ±6: #5a3d6b (dark purple)

## Debugging Tips

### Check file indexing
```javascript
console.log(`Indexed ${fileIndex.length} chapters in ${Object.keys(bookIndex).length} books`);
```

### Verify File System Access
```javascript
// After folder selection
console.log(fileIndex);
console.log(bookIndex);
```

### Test with sample
Open prototype, paste 1 Peter 2 sample to verify rendering logic works.

## Distribution & Monetisation Strategy

### Hosting Model
**scripturescribbles.com - Hosted Web App (Always Free)**
- Static hosting: Netlify/Vercel/Cloudflare Pages (free tier)
- Custom domain: ~£10/year
- SSL certificate: free (Let's Encrypt)
- **Total hosting cost: ~£10/year**
- Data stays local (File System Access API)
- No backend required for core functionality

### Pricing Model

**Philosophy: "One Year = One Coffee"**
Maximum affordability - anyone can access God's Word with powerful study tools for the price of a single coffee per year.

**Free Tier (Always Free):**
- Core functionality: **Free forever**
- Public domain Bibles: WEB, KJV, ASV (bundled)
- BYOB (Bring Your Own Bible) - local markdown support
- All annotation features (highlights, notes, tags)
- Google Drive sync (to user's account): **Free**
- Web app access: **Free**
- **Cost to you:** £0/user
- **Revenue:** £0 (charity donations optional)

**Premium Tier: £10/year (~£0.83/month)**
- Everything in Free +
- Premium Bible versions via API: NIV, ESV, NLT, NASB, MSG, NKJV
- Mobile apps ad-free
- Managed cloud sync + backups
- Priority support
- **Cost to you:** ~£2/user/year (API fees)
- **Profit:** £8/user/year
- **Charity split:** 70% to charities (£5.60), 30% reinvested (£2.40)

**Ultimate Tier: £20/year (~£1.67/month)**
- Everything in Premium +
- 50+ Bible versions (via multiple APIs)
- Parallel view (compare versions side-by-side)
- Advanced search across all versions
- Study resources (commentaries, dictionaries via API)
- **Cost to you:** ~£5/user/year (API fees + resources)
- **Profit:** £15/user/year
- **Charity split:** 70% to charities (£10.50), 30% reinvested (£4.50)

**Mobile Apps (Phase 7):**
- Free tier: Ad-supported (minimal ads on load/exit only)
- **"No ads on Sundays" policy** - respects church usage
- Premium/Ultimate: Ad-free (included in subscription)

### Revenue Strategy

**Primary Goal:** "One Year = One Coffee" - Maximum Affordability
- Target: Premium £10/year = price of 1 coffee
- Ultimate £20/year = price of 2 coffees
- Max cost to project: £5/user (API fees, infrastructure)
- Ensures anyone globally can afford powerful Bible study tools

**Break-Even Analysis:**
- **Basic costs:** Domain (£10) + Apple Dev (£99) + Google Play (£25) = £134/year
- **With API access:** Domain + Dev accounts + API fees (£9-29/month) = £240-480/year
- **Break-even Premium:** 24-48 users at £10/year
- **Break-even Ultimate:** 12-24 users at £20/year

**Charitable Model:**
- 70% of profit → New Routes Foundation + Wycliffe Bible Translators
- 30% reinvested (API costs, development, scaling, new features)

**Example Revenue (100 Premium users):**
- Revenue: £1,000/year
- API costs: £200/year
- Infrastructure: £120/year
- Profit: £680/year
- **To charity: £476/year**
- **Reinvested: £204/year**

**Scaling targets:**
- 500 users = £4,000/year revenue → £2,800 to charity
- 1,000 users = £8,000/year revenue → £5,600 to charity
- 5,000 users = £40,000/year revenue → £28,000 to charity

### Partnership Opportunity: Wycliffe Bible Translators
**Why partner:**
- Established trust in Christian community
- Distribution networks (missionaries, churches, Bible colleges)
- Potential funding/grants for development
- Access to Bible translations in minority languages
- Legitimacy and reach

**Partnership structure options:**
1. Licence to charity (retain copyright, grant free perpetual licence)
2. Joint ownership (shared governance, revenue split)
3. Full donation (transfer copyright, retain maintainer role)

**What they provide:**
- Promotion (website, newsletters, social media)
- Bible translations in markdown (if digital rights available)
- Donation infrastructure
- Endorsement/validation

**Next step:** Draft one-page proposal showing prototype, explain vision, gauge interest

### Cloud Sync Implementation

**Free Tier: Google Drive Sync**
- User connects own Google account (OAuth)
- Saves to hidden appDataFolder in their Drive
- Zero cost to project
- User controls their data
- **Implement in Phase 3**

**Paid Tier (Future): Managed Sync**
- Hosted sync service (Supabase/Firebase)
- Automatic backups + version history
- For users without Google accounts
- £10-20/year premium feature

### Running Costs Estimate

**Year 1:**
- Domain registration: £10
- Apple Developer Account: $99 (~£80)
- Google Play Developer: $25 one-time (~£20)
- **Total: ~£110/year** (after year 1: £90/year)

**If backend added (managed sync):**
- Cloud hosting: ~£5-20/month
- **Could reach £200/year**

**Break-even scenarios:**
- 11 users at £10/year = basic costs covered
- 100 users at £10/year = £1,000/year (development time compensation or → charity)

### Bible Content Strategy
- Current Bible: A Faithful Version (personal use only)
- For release: Use World English Bible (WEB) - public domain
- Tool works with any markdown structure
- BYOB (Bring Your Own Bible) - user provides markdown files
- Sample chapter provided for testing
- Future: Bundle public domain Bibles for offline use

### Branding
- Primary: "Scripture Scribbles" (Christian audience)
- Alternative: "SS Reader" (non-Christian markets if needed)
- Domain: scripturescribbles.com

## Bible API Integration Strategy (Phase 4+)

### Why API-First Approach

**Instead of Direct Licensing:**
- **Avoid upfront costs:** Publishers charge £50k-100k+ per version
- **No legal complexity:** API provider handles all licensing
- **Always updated:** Publishers handle revisions automatically
- **Multiple versions:** One integration = 10-50+ Bibles
- **Pay-per-use:** Costs scale with actual usage
- **Validate demand:** See which versions users want before investing

### API Providers

**API.Bible (American Bible Society)**
- **Free Tier:** 500 requests/day (WEB, KJV, ASV)
- **Paid Tiers:**
  - £9/month (1,000 requests/day)
  - £29/month (10,000 requests/day)
  - £99/month (100,000 requests/day)
- **Versions:** NIV, ESV, NLT, NASB, MSG, NKJV, 50+ others
- **Best for:** Initial launch, low-medium traffic

**ESV API (Crossway)**
- **Free:** Non-commercial use
- **Paid:** Commercial licensing available
- **Best for:** ESV-specific features, study notes

**Biblia API (Logos/Faithlife)**
- **Multiple versions**
- **Study resources:** Commentaries, dictionaries
- **Best for:** Ultimate tier, advanced features

### Technical Implementation

**Our architecture already supports this:**

```javascript
async function loadChapter(source, book, chapter) {
    let markdown;

    if (source.type === 'local') {
        // Current: BYOB local markdown files
        const file = await fileHandle.getFile();
        markdown = await file.text();
    } else if (source.type === 'bundled') {
        // Phase 2.5: Bundled public domain Bibles
        markdown = await fetch(`/bibles/${source.version}/${book}/${chapter}.md`);
    } else if (source.type === 'api') {
        // Phase 4: Premium Bible versions via API
        markdown = await fetchFromAPI(source.version, book, chapter);
    }

    // Load annotations (same for all sources!)
    const annotations = await loadAnnotationsForBook(book);

    // Render (same for all sources!)
    renderMarkdown(markdown);
}
```

**Key advantage:** `renderMarkdown()` doesn't care where markdown comes from!

### Caching Strategy (Reduce API Costs)

```javascript
// Cache chapters in IndexedDB
const cachedChapter = await db.get(`${version}-${book}-${chapter}`);
if (cachedChapter && !needsRefresh(cachedChapter.timestamp)) {
    return cachedChapter.markdown; // Serve from cache
}

// Fetch from API and cache
const markdown = await fetchFromAPI(version, book, chapter);
await db.put(`${version}-${book}-${chapter}`, {
    markdown,
    timestamp: Date.now()
});
return markdown;
```

**Cache benefits:**
- First load: API call (costs ~£0.01)
- Subsequent loads: Free (from cache)
- 95%+ of requests served from cache
- Typical user cost: £0.50-1.00/year (API fees)

### Non-Markdown Format Support

**Common Bible formats:**
- **OSIS XML** (Open Scripture Information Standard)
- **USFM** (Unified Standard Format Markers)
- **JSON** (Bible APIs use this)
- **HTML** (Some publishers)

**Converter approach:**
```javascript
function convertToMarkdown(content, format) {
    switch(format) {
        case 'osis':
            return osisToMarkdown(content);
        case 'usfm':
            return usfmToMarkdown(content);
        case 'json':
            return jsonToMarkdown(content);
        default:
            return content; // Already markdown
    }
}
```

**Effort:** 1-2 days per format (straightforward parsers)

### Implementation Phases

**Phase 2.5 (Next): Bundled Public Domain Bibles**
- Include WEB, KJV, ASV in app bundle
- Converted to markdown, bundled with app
- **Effort:** 1-2 days
- **Cost:** £0
- **Benefit:** Instant access, no BYOB needed, offline-ready

**Phase 3: Google Drive Sync**
- Free sync to user's Google Drive
- **Effort:** 1 week
- **Cost:** £0
- **Benefit:** Cross-device access for free

**Phase 4: Premium Bible API Integration**
- API.Bible integration
- NIV, ESV, NLT, NASB, MSG, NKJV
- Caching for offline use
- **Effort:** 2-3 weeks
- **Cost:** £9-29/month (scales with users)
- **Revenue:** £10/year per Premium user
- **Break-even:** 24-48 users

**Phase 5: Multiple API Providers**
- ESV API (Crossway)
- Biblia API (Logos) for study resources
- Expand to 50+ versions
- **Effort:** 2-3 weeks
- **Cost:** £20-50/month
- **Revenue:** £20/year per Ultimate user
- **Break-even:** 12-24 users

**Phase 6: Direct Licensing (If Proven Demand)**
- **When:** 1,000+ paying users
- **Why:** Lower per-user cost, offline bundling, faster
- **Example:** NIV direct licence £50k → break-even at 5,000 users

### Cost Per User Analysis

**Free Tier Users:**
- Bundled Bibles (WEB/KJV): £0
- BYOB local files: £0
- Google Drive sync: £0
- **Total cost:** £0/user

**Premium Tier Users:**
- API calls (cached): ~£0.50-1.00/year
- Managed cloud sync: ~£0.50/year
- Infrastructure: ~£0.50/year
- **Total cost:** ~£2/user/year
- **Price:** £10/year
- **Profit:** £8/user → £5.60 to charity

**Ultimate Tier Users:**
- API calls (multiple sources): ~£2-3/year
- Study resources: ~£1-2/year
- Infrastructure: ~£0.50/year
- **Total cost:** ~£5/user/year (max)
- **Price:** £20/year
- **Profit:** £15/user → £10.50 to charity

**Maximum cost guarantee:** Never more than £5/user/year

## Cloudflare Pages Site Structure

### Deployment Setup
- **Hosting**: Cloudflare Pages (free tier)
- **Domain**: scripturescribbles.com (already registered)
- **Deployment**: Git-based (push to main → auto-deploy)
- **SSL**: Automatic via Cloudflare
- **CDN**: Global, unlimited bandwidth

### Directory Structure

```
scripture-scribbles/
├── index.html                      # Landing page
├── app/
│   └── index.html                 # The Bible reader app
├── guides/
│   ├── getting-started.html       # Quick start guide
│   ├── custom-syntax.html         # Markdown syntax reference
│   ├── keyboard-shortcuts.html    # Shortcuts guide
│   └── byob.html                  # Bring Your Own Bible guide
├── blog/
│   └── index.html                 # Blog listing (future)
├── support/
│   ├── index.html                 # Support us page
│   ├── charity.html               # Charity partnership info
│   └── donate.html                # Donation page
├── about/
│   ├── index.html                 # About the project
│   └── privacy.html               # Privacy policy
├── assets/
│   ├── css/
│   │   └── main.css              # Shared styles
│   ├── js/
│   │   └── common.js             # Shared scripts
│   └── images/
│       ├── logo.svg
│       ├── screenshots/
│       └── icons/
├── auth/                           # Future: authentication for paid features
│   ├── login.html
│   └── signup.html
├── samples/
│   ├── 1-peter-2.md              # Sample clean chapter
│   └── 1-peter-2-annotated.md    # Sample with annotations
├── README.md
├── LICENCE
└── _redirects                     # Cloudflare redirects config
```

### Landing Page (index.html) Content Plan

**Hero Section:**
- Headline: "Your Bible, Your Notes, Your Way"
- Subhead: "Privacy-first Bible study tool. All your data stays on your device."
- CTA: "Launch App" + "Download Sample"
- Screenshot/demo video

**Features Section:**
- Highlights, Notes, Tags
- View Modes
- Dark Mode
- Local-First Privacy
- Free Forever

**How It Works:**
1. Select your Bible folder
2. Read and annotate
3. Save to your device
4. Access anywhere (with Google Drive sync)

**Trust Indicators:**
- "No account required"
- "Zero tracking"
- "Your data never leaves your device"
- "Open source"

**Charity Mission:**
- "100% of profits donated to:"
  - New Routes Foundation
  - Wycliffe Bible Translators

**Footer:**
- Links to guides, about, privacy
- Social media (future)
- Support/donate
- © 2025 Scripture Scribbles

### Guide Pages

**Getting Started** - Step-by-step tutorial with screenshots
**Custom Syntax** - Markdown reference with examples
**Keyboard Shortcuts** - Quick reference table
**BYOB Guide** - How to prepare your Bible, where to download free Bibles

### Support Pages

**Support Us** - Donation options, how funds are used
**Charity Info** - Details on New Routes + Wycliffe partnerships
**Donate** - Payment integration (future), or links to charity direct donation

### About Pages

**About** - Project mission, why it exists, who built it
**Privacy** - Data policy, what we collect (nothing), GDPR compliance

### Future: Auth Pages

For paid features (managed sync, mobile app subscriptions):
- Login/signup via email or Google OAuth
- Payment integration (Stripe)
- Account management

### Cloudflare Pages Configuration

**_redirects file:**
```
/app   /app/index.html   200
/*     /index.html       404
```

**Build settings:**
- Build command: (none - static HTML)
- Build output directory: /
- Root directory: /

**Environment variables:**
- None required for Phase 2
- Future: API keys for Google Drive, Stripe, analytics

### Assets Plan

**CSS:**
- Shared header/footer styles
- Consistent branding (colours, fonts)
- Responsive grid

**JS:**
- Minimal - analytics (privacy-respecting, opt-in only)
- Newsletter signup (future)

**Images:**
- Logo (SVG for scalability)
- Screenshots (annotated app views)
- Feature icons
- Social sharing image (Open Graph)

### SEO & Meta

**Every page needs:**
```html
<title>Scripture Scribbles - Privacy-First Bible Study Tool</title>
<meta name="description" content="Free Bible study tool with highlights, notes, and tags. All your data stays on your device. No account required.">
<meta property="og:image" content="/assets/images/og-image.png">
<link rel="canonical" href="https://scripturescribbles.com/">
```

**Sitemap.xml** - For search indexing
**robots.txt** - Allow all

### Analytics Plan

**Privacy-respecting options:**
- Plausible Analytics (£9/month, GDPR-compliant, no cookies)
- Simple Analytics (£19/month)
- OR none (truly privacy-first)

**Decision**: Start with NO analytics, add Plausible later if needed for understanding user needs

### Performance Targets

- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Lighthouse Score**: 95+

Cloudflare Pages + static HTML should easily hit these.

## Performance Considerations

- Lazy loading: Only renders current chapter
- No indexing on render: Pre-indexed on folder selection
- ~1,200 chapters in full Bible = manageable with proper indexing
- Previous issue: Tools that index everything on every load = too slow

## Recent Fixes (Latest Session)

### Fixed: Chapter Loading Issue ✅
**Problem:** Selecting Scripture folder showed "Indexed 0 chapters in 0 books"

**Root Cause:** Scanner wasn't recursing deep enough through folder structure:
```
Scripture/
  └─ A Faithful Version/
      └─ 001 - Genesis/
          └─ Genesis 1.md  ← Files were here, 2 levels deeper
```

**Solution:**
- Enhanced `scanDirectory()` to properly recurse through all subdirectories
- Added book name tracking during scan (recognizes `001 - Genesis` pattern)
- Better filtering for hidden files (starts with `.`) and temp patterns
- Now successfully indexes all chapters across nested structure

### Fixed: Book File Ordering ✅
**Problem:** Book-level files (e.g., `Malachi.md`) appeared at bottom of chapter list instead of top

**Solution:** Implemented custom sort in `populateChapterSelect()`:
- Detects book overview files (no digits in filename)
- Book files sorted to top (return -1)
- Chapter files sorted numerically after
- Located at scripture-scribbles-reader.html:2485-2500

**Result:** Book overview files now appear first in chapter dropdown before numbered chapters

## Enhanced Notes System Design (To Implement)

### Three Note Types

1. **Verse Notes** (Current implementation)
   ```markdown
   ±n9{My note on verse 9}
   ```

2. **Chapter Notes** (New - To Add)
   ```markdown
   ±nc{Overall chapter summary and themes}
   ```
   - Location: End of chapter markdown file
   - Toggle: Show/hide independently from verse notes
   - Collapsible in UI

3. **Book Notes** (New - To Add)
   ```markdown
   # Book Overview

   ±nb{Book-level notes, authorship, themes, structure}
   ```
   - Location: Book overview file (e.g., `Malachi.md`)
   - Toggle: Show/hide independently
   - Collapsible in UI

4. **Section Notes** (Future - Phase 4)
   ```markdown
   ## The Parable of the Mustard Seed

   ±ns{Analysis of this parable section}
   ```
   - Location: End of section (after H2/H3 heading)
   - Requires section heading implementation first
   - Toggle: Show/hide independently
   - Collapsible in UI

### Note Display Toggles
- Show Verse Notes (current)
- Show Chapter Notes (new)
- Show Book Notes (new)
- Show Section Notes (future)
- All independent - mix and match as needed

### UI Changes Needed

#### Advanced Settings - Notes Section
```
NOTES
☑ Show Verse Notes
☑ Show Chapter Notes
☑ Show Book Notes
☐ Show Section Notes (coming soon)
☑ Note Background
☑ Note Markers
```

## Margin Marker Redesign (To Implement)

### Current Behavior
- Small 3px bar next to verse number
- Shows if verse has annotation

### New Behavior - Grouped Markers
- Margin marker **spans all related verses AND their notes**
- Visual grouping shows which notes belong to which verses

#### Example Visual:
```
┌─────────────────────────────────────┐
│ 9  Therefore, having put away...    │ ├─ Blue bar
│                                      │ │  spans
│    ⓝ Note                            │ │  verses
│    Verse 9                           │ │  9-12
│    Important point about verse 9    │ │  and
│                                      │ │  their
│ 10 As newborn babes, yearn after...  │ │  note
│                                      │ │
│ 11 If you yourselves have indeed...  │ │
│                                      │ │
│ 12 To Whom coming, as to a living... │ │
│                                      │ │
│    ⓝ Note                            │ │
│    Verses 9-12                       │ │
│    Analysis of the full passage     │ ├─
└─────────────────────────────────────┘
```

### Interactive Selection
- Click on a note → That note's marker becomes **brighter**
- Highlights active selection
- Helps track which verses belong to which note

### Tag Markers
- **No grouping needed** for tags
- Tags stay inline where they appear
- Will be searchable when search is implemented

## Latest Session Summary (2025-11-14)

### Completed Features ✅

**Phase 2 Editing UI - COMPLETE**
- ✅ Two-mode interaction system
  - Hover icons (🎨 📝 🏷️) above verse numbers
  - Text selection floating toolbar for precise highlights
- ✅ Multi-verse notes (single note under last verse)
- ✅ Tag chip input (Tab/Enter to add, auto # prefix)
- ✅ Keyboard shortcuts (Esc to cancel, Cmd/Ctrl+Enter to save)
- ✅ Multi-verse highlighting support
- ✅ Highlight conflict detection (word vs full verse)
- ✅ Clear highlight option in modal (✕ button)
- ✅ Live preview of edits before saving
- ✅ Delete buttons for notes/tags (🗑️)
- ✅ Highlight replacement (not duplication)

**Save Functionality - COMPLETE**
- ✅ Markdown generation (highlights, notes, tags)
- ✅ File System Access API write implementation
- ✅ Two save strategies:
  - Overwrite original
  - Save as copy (_ssr.md)
- ✅ Persistent save strategy (localStorage)
- ✅ Auto-load _ssr files when strategy = "copy"
- ✅ Save preview modal with human-readable diff
- ✅ Post-save reload to show saved state
- ✅ Only first occurrence highlighted (no duplicates)

**Bug Fixes This Session**
- ✅ Duplicate word highlighting (now only first occurrence)
- ✅ Highlight replacement instead of adding duplicates
- ✅ Icon positioning moved higher (above verse text)
- ✅ Multi-verse note formatting ("Verses 9-12")
- ✅ Tag dialog Cmd+Enter works from input field
- ✅ Removed confusing inline highlight delete button
- ✅ Clear button added to highlight modal

### Current Working State

**Fully Functional:**
1. File navigation (Book → Chapter dropdowns, Prev/Next)
2. View modes (Reading, Study, Church, Custom)
3. Dark mode, font controls
4. Complete editing UI (highlights, notes, tags)
5. Save to file (both strategies working)
6. Live preview of unsaved edits
7. Persistent save strategy preference
8. Auto-load _ssr files

**Known Minor Issues:**
- _ssr files show in chapter list alongside originals (cosmetic)
- No cleanup tools yet (planned Phase 2 feature)
- No WikiLink navigation yet (planned Phase 2 feature)
- Other settings not persisted (only save strategy saved)

### Technical Implementation Details

**Editing System:**
- Tracks edits in `unsavedEdits` object before saving
- Live preview updates verse HTML immediately
- Save generates markdown with proper `±` syntax
- Handles full verse vs word-level highlights correctly
- Conflict detection prevents incompatible highlight types

**Save System:**
- Parses original markdown line by line
- Inserts highlight syntax: `±1{text}` or wraps words
- Appends notes/tags after verses: `±n9{text}`, `±t9{#tags}`
- Writes via File System Access API `createWritable()`
- Strategy persisted in localStorage

**File Loading:**
- When strategy="copy", checks for _ssr version first
- Automatically loads _ssr if exists
- Transparent to user - highlights always visible

## Editing UI Design (Phase 2 - IMPLEMENTED)

### Two Interaction Modes

**1. Word/Phrase Selection (Precise Highlights)**
- User selects specific text within verse
- Floating toolbar appears with colour options: `[🟡][🟢][🩷][🔵][🟠][🟣]`
- Click colour → Highlight applied instantly to selected text
- Only for highlights (notes/tags are verse-level)

**2. Verse-Level Actions (Quick Access)**
- Hover near verse margin → Icons fade in (60% opacity)
  - 🎨 Highlight picker (full verse, 6 colours)
  - 📝 Add note
  - 🏷️ Add tags
- Click icon → Dialog/picker for that verse
- Active icon brightens to 100%

### Multi-Verse Selection

**Notes and tags can span multiple verses:**

**Interaction:**
- Click note/tag icon on first verse
- Shift-click on last verse (creates range)
- Or: Dialog asks "Apply to which verses?"
  - Current verse (default)
  - Range: `3-5` or `9:3-5` (cross-chapter)
  - Multiple: `3,7,12` (scattered)

**Syntax examples:**
```markdown
±n3-5{Multi-verse note}           # Verses 3-5 current chapter
±n9:3-5{Cross-chapter note}       # Chapter 9, verses 3-5
±n3,7,12{Scattered verses}        # Specific verses
±t3-5{#theme #important}          # Tags for verse range
```

### Visual Feedback

**States:**
- Hover: Margin icons fade in
- Unsaved changes: Yellow dot badge on verse number
- Save button: Fixed in toolbar, appears when edits exist

**Save workflow:**
1. User makes edits (tracked in memory)
2. "💾 Save Changes" button appears in toolbar
3. Click → Modal shows markdown diff preview
4. User confirms save strategy (overwrite/copy)
5. Write to file via File System Access API

### Implementation Tasks

- [ ] Add CSS for margin hover icons
- [ ] Text selection handler for precise highlights
- [ ] Verse-level icon handlers (hover/click)
- [ ] Multi-verse range selection (shift-click)
- [ ] Floating highlight toolbar
- [ ] Note/tag input dialogs
- [ ] Unsaved changes tracking
- [ ] Save modal with diff preview
- [ ] File write logic

## Next Session Priorities

1. **Implement editing UI** - Two-mode selection system
2. **Save modal with diff preview** - Show markdown changes before write
3. **Implement chapter notes** (`±nc{...}`)
4. **Implement book notes** (`±nb{...}`)
5. **Add note type toggles** to Advanced Settings
6. **Redesign margin markers** - Grouped spanning style with click-to-highlight
