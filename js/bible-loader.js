// Bible Data Loading
// Handles loading and caching of Bible data from JSON

async function loadBibleData() {
    try {
        console.log('Loading Bible data...');
        const response = await fetch('data/web-bible-enhanced.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        bibleData = await response.json();
        console.log(`Bible loaded: ${bibleData.books.length} books`);
        console.log(`Enhanced features: paragraphs, poetry, footnotes, Strong's numbers`);
    } catch (error) {
        console.error('Error loading Bible:', error);
        alert('Failed to load Bible data. Please ensure you are running from a web server (http://localhost:8001)');
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
