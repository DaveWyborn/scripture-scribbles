// Bible Data Loading
// Handles loading and caching of Bible data from JSON

// Public versions live in /data/ on GitHub Pages.
// Private versions are copyright-restricted, hosted in Supabase Storage
// (bibles-private bucket), and gated by bible_version_access grants.
const PRIVATE_BIBLE_VERSIONS = {
    afv: { label: 'AFV — A Faithful Version' },
};
// Cached set of version codes the current user has access to.
let userBibleAccess = new Set();

function isPrivateVersion(code) {
    return Object.prototype.hasOwnProperty.call(PRIVATE_BIBLE_VERSIONS, code);
}

/**
 * Load gzipped Bible JSON file
 * Falls back to uncompressed if gzip fails
 */
function fetchWithTimeout(url, timeoutMs = 20000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function decompressGzipBlob(blob) {
    const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
    const text = await new Response(stream).blob().then(b => b.text());
    return JSON.parse(text);
}

async function loadPrivateBible(version) {
    if (!supabase) throw new Error('Supabase client not initialised');
    if (!currentUser) throw new Error('Sign-in required to load this Bible version');

    console.log(`Loading private ${version.toUpperCase()} Bible from Supabase Storage...`);
    const filename = `${version}-bible-enhanced.json.gz`;
    const { data, error } = await supabase.storage
        .from('bibles-private')
        .download(filename);
    if (error) throw new Error(`Storage download failed: ${error.message}`);
    return await decompressGzipBlob(data);
}

async function loadGzippedBible(version = 'web') {
    if (isPrivateVersion(version)) {
        return await loadPrivateBible(version);
    }

    const cacheBust = 'v=1.8.0';
    const gzippedUrl = `data/${version}-bible-enhanced.json.gz?${cacheBust}`;
    const fallbackUrl = `data/${version}-bible-enhanced.json?${cacheBust}`;

    try {
        console.log(`Loading ${version.toUpperCase()} Bible (gzipped)...`);
        const response = await fetchWithTimeout(gzippedUrl, 20000);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        return await decompressGzipBlob(blob);
    } catch (error) {
        console.warn(`Gzipped version failed (${error.message}), trying uncompressed...`);

        const response = await fetchWithTimeout(fallbackUrl, 30000);
        if (!response.ok) {
            throw new Error(`Failed to load Bible: ${response.status}`);
        }
        return await response.json();
    }
}

// Fetch the current user's private-version access grants from Supabase.
// Updates `userBibleAccess` and the settings-panel picker to surface accessible
// private versions (e.g. AFV) when granted.
async function loadUserBibleAccess() {
    userBibleAccess = new Set();
    if (!supabase || !currentUser) {
        updateBibleVersionPicker();
        return userBibleAccess;
    }
    try {
        const { data, error } = await supabase
            .from('bible_version_access')
            .select('version_code')
            .eq('user_id', currentUser.id);
        if (error) throw error;
        (data || []).forEach(row => {
            if (row.version_code) userBibleAccess.add(row.version_code.toLowerCase());
        });
    } catch (e) {
        console.warn('Could not load bible version access grants:', e.message);
    }
    updateBibleVersionPicker();
    return userBibleAccess;
}

// Refresh the version dropdown so granted private versions appear.
function updateBibleVersionPicker() {
    const select = document.getElementById('bible-version');
    if (!select) return;
    Object.entries(PRIVATE_BIBLE_VERSIONS).forEach(([code, meta]) => {
        const existing = select.querySelector(`option[value="${code}"]`);
        if (userBibleAccess.has(code)) {
            if (!existing) {
                const opt = document.createElement('option');
                opt.value = code;
                opt.textContent = meta.label;
                select.appendChild(opt);
            }
        } else if (existing) {
            existing.remove();
        }
    });
    // Keep the visible selection in sync with the loaded version
    if (currentBibleVersion) select.value = currentBibleVersion;
}

async function loadBibleData(version = 'web') {
    try {
        bibleData = await loadGzippedBible(version);
        currentBibleVersion = version.toLowerCase();

        // Add ID fields to books (enhanced JSON uses name only)
        bibleData.books.forEach(book => {
            book.id = book.name.toLowerCase().replace(/\s+/g, '');
        });

        // Hide loading message if showing
        const loadingMsg = document.getElementById('bible-loading-message');
        if (loadingMsg) {
            loadingMsg.style.display = 'none';
        }

        console.log(`✅ Bible loaded: ${getCurrentVersionTag()}`);
        console.log(`   Books: ${bibleData.books.length}`);
    } catch (error) {
        console.error('Error loading Bible:', error);
        alert('Failed to load Bible data. Please refresh the page or check your connection.');
    }
}

// Hot-switch the active Bible version. Reloads the JSON, clears caches,
// refreshes annotations (they're scoped per-version), and re-renders current chapter.
async function switchBibleVersion(version) {
    const target = (version || 'web').toLowerCase();
    if (target === currentBibleVersion) return;

    const loadingMsg = document.getElementById('bible-loading-message');
    if (loadingMsg) loadingMsg.style.display = 'block';

    await loadBibleData(target);

    // Clear caches that are scoped per-version
    annotationCache = {};
    if (typeof loadAnnotations === 'function') await loadAnnotations();

    // Re-render the current chapter with new version's text
    if (typeof displayChapter === 'function') displayChapter();
}

// Get book by ID
function getBook(bookId) {
    if (!bibleData || !bibleData.books) return null;
    return bibleData.books.find(b => b.id === bookId);
}

// Get chapter from book
function getChapter(bookId, chapterNum) {
    const book = getBook(bookId);
    if (!book) return null;
    return book.chapters.find(c => c.number === chapterNum);
}

// Get verse from chapter
function getVerse(bookId, chapterNum, verseNum) {
    const chapter = getChapter(bookId, chapterNum);
    if (!chapter) return null;
    return chapter.verses.find(v => v.number === verseNum);
}

// Tag management (localStorage)
function loadKnownTags() {
    const saved = localStorage.getItem('knownTags');
    if (saved) {
        try {
            knownTags = JSON.parse(saved);
        } catch (e) {
            knownTags = {};
        }
    }
}

function saveKnownTags() {
    localStorage.setItem('knownTags', JSON.stringify(knownTags));
}

function addKnownTag(tagName, color = null) {
    const normalizedTag = tagName.trim().toLowerCase();
    if (!normalizedTag) return;

    if (!knownTags[normalizedTag]) {
        knownTags[normalizedTag] = color || getRandomTagColor();
        saveKnownTags();
    }
}

function getRandomTagColor() {
    const colors = getTagColors();
    return colors[Math.floor(Math.random() * colors.length)];
}
