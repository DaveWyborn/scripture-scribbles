// Bible Data Loading
// Handles loading and caching of Bible data from JSON

/**
 * Update loading overlay progress
 */
function updateLoadingProgress(percent, status) {
    const overlay = document.getElementById('bible-loading-overlay');
    const progress = document.getElementById('bible-loading-progress');
    const statusText = document.getElementById('bible-loading-status');

    if (overlay && progress && statusText) {
        progress.style.width = `${percent}%`;
        statusText.textContent = status;

        // Hide overlay when complete
        if (percent >= 100) {
            setTimeout(() => {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 500);
            }, 300);
        }
    }
}

/**
 * Load gzipped Bible JSON file
 * Falls back to uncompressed if gzip fails
 */
async function loadGzippedBible(version = 'web') {
    const gzippedUrl = `data/${version}-bible-enhanced.json.gz`;
    const fallbackUrl = `data/${version}-bible-enhanced.json`;

    try {
        console.log(`Loading ${version.toUpperCase()} Bible (gzipped)...`);
        updateLoadingProgress(10, 'Downloading Bible...');

        const response = await fetch(gzippedUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        updateLoadingProgress(40, 'Download complete, decompressing...');

        // Decompress using browser's DecompressionStream API
        const blob = await response.blob();
        const decompressedStream = blob.stream().pipeThrough(
            new DecompressionStream('gzip')
        );
        const decompressedBlob = await new Response(decompressedStream).blob();

        updateLoadingProgress(70, 'Processing Bible text...');

        const text = await decompressedBlob.text();

        updateLoadingProgress(90, 'Almost ready...');

        return JSON.parse(text);
    } catch (error) {
        console.warn(`Gzipped version failed (${error.message}), trying uncompressed...`);
        updateLoadingProgress(40, 'Loading Bible...');

        // Fallback to uncompressed JSON
        const response = await fetch(fallbackUrl);
        if (!response.ok) {
            throw new Error(`Failed to load Bible: ${response.status}`);
        }

        updateLoadingProgress(80, 'Processing...');
        return await response.json();
    }
}

async function loadBibleData(version = 'web') {
    try {
        bibleData = await loadGzippedBible(version);

        // Add ID fields to books (enhanced JSON uses name only)
        bibleData.books.forEach(book => {
            book.id = book.name.toLowerCase().replace(/\s+/g, '');
        });

        updateLoadingProgress(100, 'Ready!');

        console.log(`✅ Bible loaded: ${bibleData.version || version.toUpperCase()}`);
        console.log(`   Books: ${bibleData.books.length}`);
        console.log(`   Features: paragraphs, poetry, headings, footnotes, Strong's numbers`);
    } catch (error) {
        console.error('Error loading Bible:', error);
        updateLoadingProgress(0, 'Failed to load. Please refresh.');
        alert('Failed to load Bible data. Please refresh the page or check your connection.');
    }
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
