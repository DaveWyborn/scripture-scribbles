# Scripture Scribbles v1.1.0 - Development Tasks (SERVER STORAGE)

## Phase 1: WEB Bible Preparation (Dave)

**Task:** Get WEB Bible in markdown format

**Sources to check:**
1. ✅ Check if you already have it from Obsidian forum
2. Alternative: https://ebible.org/web/ (download)
3. Alternative: Obsidian Bible Reference plugin sources

**Required format:**
```
WEB/
├── 001 - Genesis/
│   ├── Genesis 1.md
│   ├── Genesis 2.md
│   └── ...
├── 040 - Matthew/
│   ├── Matthew 1.md
│   ├── Matthew 2.md
│   └── ...
└── ...
```

**Each file format:**
```markdown
###### 1
In the beginning, God created the heavens and the earth.

###### 2
The earth was formless and empty. Darkness was on the surface of the deep...
```

**Once you have it:**
- Put in: `/Users/davewyborn/Documents/2_Obsidian/WEB/` (or wherever convenient)
- Let me know the path
- I'll convert to JSON and commit to git
- Served from GitHub, cached in browser

---

## Phase 2: Supabase Setup (Claude)

**Create Supabase project:**
1. Sign up at supabase.com
2. Create new project: "scripture-scribbles"
3. Get API keys (anon public key, service role key)
4. Share keys with me (I'll add to code)

**Database schema:**

```sql
-- Users table (handled by Supabase Auth)

-- Annotations table
CREATE TABLE annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  bible_version text DEFAULT 'WEB',
  annotation_set text DEFAULT 'Study',
  book_id text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Row Level Security
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own annotations"
  ON annotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own annotations"
  ON annotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annotations"
  ON annotations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annotations"
  ON annotations FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX annotations_user_id_idx ON annotations(user_id);
CREATE INDEX annotations_book_id_idx ON annotations(book_id);
CREATE INDEX annotations_version_set_idx ON annotations(bible_version, annotation_set);

-- Sermons table (for future sermon notes feature)
CREATE TABLE sermons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  speaker text,
  content text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Row Level Security for sermons
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sermons"
  ON sermons FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX sermons_user_id_idx ON sermons(user_id);
CREATE INDEX sermons_date_idx ON sermons(date DESC);
```

**Auth providers to enable:**
- Email/Password (default)
- Google OAuth (optional but recommended)

---

## Phase 3: Authentication Implementation (Claude)

**Add Supabase client:**

```html
<!-- In scripture-scribbles-reader.html -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const supabase = supabase.createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
  );
</script>
```

**Auth UI:**

1. **Landing page** (index.html):
   - [Sign Up] [Sign In] buttons
   - "Try as Guest" option (browser storage, can upgrade later)

2. **Sign up modal:**
   - Email + Password
   - OR "Continue with Google"
   - Terms acceptance

3. **Sign in modal:**
   - Email + Password
   - OR "Continue with Google"
   - "Forgot password" link

4. **Auth functions:**

```javascript
// Sign up
async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password
  });
  if (error) throw error;
  return data;
}

// Sign in
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });
  if (error) throw error;
  return data;
}

// Sign in with Google
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google'
  });
  if (error) throw error;
}

// Sign out
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Load user's annotations
    loadUserData();
  } else if (event === 'SIGNED_OUT') {
    // Clear data, show sign-in
    clearUserData();
  }
});
```

---

## Phase 4: Data Sync Implementation (Claude)

### 4.1: Create Storage Abstraction Layer

**File:** `storage-manager.js` (or inline in main file)

```javascript
class StorageManager {
  constructor() {
    this.mode = null; // 'indexeddb' | 'filesystem'
    this.db = null;
  }

  async initialize() {
    // Detect capabilities and choose mode
    if ('indexedDB' in window) {
      this.mode = 'indexeddb';
      await this.initIndexedDB();
    } else {
      throw new Error('Browser not supported');
    }
  }

  async initIndexedDB() {
    // Create/open database
    // Set up object stores
  }

  async loadBible(version) {
    // Load from IndexedDB or fetch from GitHub
  }

  async loadChapter(book, chapter) {
    // Get chapter from IndexedDB
  }

  async saveAnnotations(bookId, annotationSet, data) {
    // Save to IndexedDB
  }

  async loadAnnotations(bookId, annotationSet) {
    // Load from IndexedDB
  }
}
```

### 2.2: IndexedDB Schema

**Database:** `ScriptureScribbles`

**Object Stores:**

1. **bibles**
   - Key: `{version}-{bookId}-{chapter}` (e.g., "WEB-matthew-5")
   - Value: `{content: "markdown text", metadata: {...}}`

2. **annotations**
   - Key: `{version}-{annotationSet}-{bookId}` (e.g., "WEB-Study-matthew")
   - Value: `{annotations: {...}}` (current JSON format)

3. **sermons**
   - Key: sermon ID
   - Value: sermon markdown content + metadata

4. **settings**
   - Key: setting name
   - Value: setting value

### 2.3: Bible Loader

**On first run:**
1. Check if WEB Bible exists in IndexedDB
2. If not: Fetch from GitHub (or from committed files)
3. Parse and store in IndexedDB
4. Show progress: "Loading World English Bible... (5%)"

**On subsequent runs:**
1. Load directly from IndexedDB (instant)

### 2.4: Migration for Existing Users

**For v1.0.0 users who have local folders:**

Show option:
```
You're currently using a local folder.

Would you like to:
[ ] Continue using local folder (desktop only)
[ ] Switch to browser storage (works everywhere, including mobile)
[ ] Use both (browser storage + periodic export to folder)
```

### 2.5: Export System

**Add export buttons to settings:**

```javascript
async function exportAnnotations() {
  const data = await storageManager.getAllAnnotations();
  const blob = new Blob([JSON.stringify(data, null, 2)],
    {type: 'application/json'});
  downloadFile(blob, 'scripture-scribbles-backup.json');
}

async function exportEverything() {
  // Create ZIP with annotations, sermons, settings
  const zip = new JSZip();
  // Add files...
  const blob = await zip.generateAsync({type: 'blob'});
  downloadFile(blob, 'scripture-scribbles-full-backup.zip');
}
```

---

## Phase 3: UI Updates (Claude)

### 3.1: Remove Browser Restriction

**Current code (remove):**
```javascript
if (!('showDirectoryPicker' in window)) {
  alert('Your browser does not support...');
  return;
}
```

**New code:**
```javascript
// Check capabilities
const hasFileSystem = 'showDirectoryPicker' in window;
const hasIndexedDB = 'indexedDB' in window;

if (!hasIndexedDB) {
  showError('Please update your browser');
  return;
}

// Continue with IndexedDB mode
// File System mode optional (show in settings if available)
```

### 3.2: Welcome Screen Update

**For first-time users:**
```
Welcome to Scripture Scribbles!

[Start Reading (WEB Bible)]  ← Default action

Advanced:
- I have my own Bible files (desktop only)
- Settings
```

### 3.3: Settings Panel

**Add storage section:**
```
Storage:
  Mode: Browser Storage ✓
  Bible: World English Bible (WEB)

  [Export Annotations]
  [Export Everything]
  [Import Backup]

  Advanced (desktop only):
  [Connect Local Folder]
```

---

## Phase 4: Testing (Both)

### 4.1: Browser Testing

**Desktop:**
- ✅ Chrome (IndexedDB)
- ✅ Firefox (IndexedDB)
- ✅ Safari (IndexedDB)
- ✅ Edge (IndexedDB + File System option)

**Mobile:**
- ✅ iOS Safari (IndexedDB)
- ✅ iOS Chrome (IndexedDB)
- ✅ Android Chrome (IndexedDB)
- ✅ Android Firefox (IndexedDB)

### 4.2: Feature Testing

- ✅ Load WEB Bible from IndexedDB
- ✅ Highlight verses
- ✅ Add notes
- ✅ Add tags
- ✅ Switch annotation sets
- ✅ Data persists after browser close
- ✅ Export annotations works
- ✅ Import backup works
- ✅ Offline mode works (after first load)

### 4.3: Performance Testing

- Bible load time (first visit)
- Bible load time (subsequent visits)
- Chapter switch speed
- Annotation save speed
- Export speed

---

## Phase 5: Design Improvements (Dave + Claude)

**While testing IndexedDB, work on design:**

### UI Improvements from previous discussions:

1. **Click-to-select verses** (replace hover)
2. **Action toolbar** for selected verses
3. **Sermon notes panel** (bottom, collapsible)
4. **Visual verse selector** (e-Sword style)
5. **Copy verse** functionality
6. **Margin space** for cross-version annotations

**Dave's design work:**
- Visual mockups for new UI
- Color scheme refinement
- Mobile-optimized layouts
- Action toolbar placement

**Claude's implementation:**
- Convert designs to HTML/CSS
- JavaScript for interactions
- Mobile responsiveness
- Touch optimization

---

## Phase 6: PWA Setup (Claude)

### 6.1: Manifest

Create `manifest.json`:
```json
{
  "name": "Scripture Scribbles",
  "short_name": "ScripScrib",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#2c3e50",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 6.2: Service Worker

**Cache strategy:**
- Cache app files (HTML, CSS, JS)
- Cache WEB Bible after first load
- Network-first for annotations (freshness)
- Offline fallback

### 6.3: Install Prompt

**Show after user has used app a bit:**
```
Enjoying Scripture Scribbles?

[Install App] [Maybe Later]

Works offline and acts like a native app!
```

---

## Timeline

### This Week:
- **Dave:** Find/prepare WEB Bible markdown files
- **Claude:** Review and plan IndexedDB architecture

### Next Session:
- **Claude:** Implement IndexedDB storage layer
- **Claude:** Update UI for browser storage mode
- **Claude:** Add export/import functionality
- **Test:** Basic IndexedDB functionality

### Following Session:
- **Dave:** Design improvements (mockups/wireframes)
- **Claude:** Implement design changes
- **Both:** Test on multiple devices/browsers

### Final Session Before Launch:
- **Claude:** PWA setup (manifest, service worker)
- **Both:** Final testing and polish
- **Deploy:** Update GitHub, push v1.1.0

---

## Immediate Next Steps (Today/Tomorrow)

**Dave:**
1. Locate WEB Bible markdown files
2. Check format matches required structure
3. Put in accessible location
4. Share path with Claude

**Claude (next session):**
1. Test loading WEB from Dave's files
2. Start IndexedDB implementation
3. Create storage abstraction layer
4. Begin migration from File System to dual-mode storage

---

## Questions to Resolve

1. **Bible format:** Keep as markdown in git or convert to JSON?
   - Markdown: Larger (~10-20MB), more portable
   - JSON: Smaller (~5-10MB), faster parsing
   - **Recommendation:** Keep markdown, generate JSON at build time

2. **Git LFS:** Do we need it for Bible files?
   - GitHub allows 100MB files
   - WEB Bible likely under 20MB
   - **Probably not needed**

3. **Sermon notes:** Build now or wait for v1.2.0?
   - **Recommendation:** v1.2.0 (after IndexedDB stable)

4. **Design improvements:** Parallel with IndexedDB or sequential?
   - **Recommendation:** Parallel - Dave designs while Claude codes
