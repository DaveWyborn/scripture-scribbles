// State Management - Global Application State
// All global variables used across the application

// Supabase client (initialized in auth.js)
let supabase = null;

// User authentication
let currentUser = null;

// Bible data
let bibleData = null; // Loaded from JSON

// Navigation state
let currentBook = 'genesis';
let currentChapter = 1;
let isNavigating = false;

// Reading mode state
let readingMode = 'verse'; // 'verse' or 'fluid'
let verseNumberStyle = 'superscript'; // 'superscript', 'margin', or 'hidden'

// Annotation state
let currentAnnotations = {};
let selectedVerse = null;
let currentAnnotationSet = 'Study'; // Default annotation set
let userAnnotationSets = ['Study', 'Church', 'Personal']; // Default sets

// Tag management
let knownTags = {}; // { tagName: color } - persisted to localStorage
let currentTags = []; // Tags being edited in annotation panel
let selectedTagColor = '#ACE5CB'; // Default tag colour

// Auth modal state
let isSignUp = false;

// Export state
let exportBookData = {};
let exportUseWEB = false;

// Tag color palettes
const TAG_COLORS_PASTEL = [
    '#ACE5CB', '#FFD6A5', '#FFADAD', '#FFC6FF', '#BDB2FF', '#A0C4FF',
    '#CAFFBF', '#FFD6A5', '#FFC9C9', '#D4A5A5', '#9BF6FF', '#FDFFB6'
];

const TAG_COLORS_WCAG = [
    '#006644', '#0052CC', '#BF2600', '#6554C0', '#008DA6', '#403294',
    '#FF8B00', '#00875A', '#C1388B', '#5243AA', '#00B8D9', '#172B4D'
];

const WCAG_THEMES = [
    'high-contrast-light',
    'high-contrast-dark',
    'dyslexia-light',
    'dyslexia-dark'
];

let TAG_COLORS = TAG_COLORS_PASTEL;

// Book abbreviations for copy functionality
const BOOK_ABBR = {
    'genesis': 'Gen', 'exodus': 'Exod', 'leviticus': 'Lev', 'numbers': 'Num',
    'deuteronomy': 'Deut', 'joshua': 'Josh', 'judges': 'Judg', 'ruth': 'Ruth',
    '1-samuel': '1 Sam', '2-samuel': '2 Sam', '1-kings': '1 Kgs', '2-kings': '2 Kgs',
    '1-chronicles': '1 Chr', '2-chronicles': '2 Chr', 'ezra': 'Ezra', 'nehemiah': 'Neh',
    'esther': 'Esth', 'job': 'Job', 'psalms': 'Ps', 'proverbs': 'Prov',
    'ecclesiastes': 'Eccl', 'song-of-solomon': 'Song', 'isaiah': 'Isa', 'jeremiah': 'Jer',
    'lamentations': 'Lam', 'ezekiel': 'Ezek', 'daniel': 'Dan', 'hosea': 'Hos',
    'joel': 'Joel', 'amos': 'Amos', 'obadiah': 'Obad', 'jonah': 'Jonah',
    'micah': 'Mic', 'nahum': 'Nah', 'habakkuk': 'Hab', 'zephaniah': 'Zeph',
    'haggai': 'Hag', 'zechariah': 'Zech', 'malachi': 'Mal',
    'matthew': 'Matt', 'mark': 'Mark', 'luke': 'Luke', 'john': 'John',
    'acts': 'Acts', 'romans': 'Rom', '1-corinthians': '1 Cor', '2-corinthians': '2 Cor',
    'galatians': 'Gal', 'ephesians': 'Eph', 'philippians': 'Phil', 'colossians': 'Col',
    '1-thessalonians': '1 Thess', '2-thessalonians': '2 Thess', '1-timothy': '1 Tim',
    '2-timothy': '2 Tim', 'titus': 'Titus', 'philemon': 'Phlm', 'hebrews': 'Heb',
    'james': 'Jas', '1-peter': '1 Pet', '2-peter': '2 Pet', '1-john': '1 John',
    '2-john': '2 John', '3-john': '3 John', 'jude': 'Jude', 'revelation': 'Rev'
};

// Old Testament books list (must match generated IDs: no spaces/hyphens)
const OT_BOOKS = [
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
    'joshua', 'judges', 'ruth', '1samuel', '2samuel',
    '1kings', '2kings', '1chronicles', '2chronicles',
    'ezra', 'nehemiah', 'esther', 'job', 'psalms', 'proverbs',
    'ecclesiastes', 'songofsolomon', 'isaiah', 'jeremiah', 'lamentations',
    'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
    'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk',
    'zephaniah', 'haggai', 'zechariah', 'malachi'
];

// Bible book order (for export sorting)
const BIBLE_BOOK_ORDER = [
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
    'joshua', 'judges', 'ruth', '1samuel', '2samuel',
    '1kings', '2kings', '1chronicles', '2chronicles', 'ezra',
    'nehemiah', 'esther', 'job', 'psalms', 'proverbs',
    'ecclesiastes', 'songofsolomon', 'isaiah', 'jeremiah', 'lamentations',
    'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
    'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk',
    'zephaniah', 'haggai', 'zechariah', 'malachi',
    'matthew', 'mark', 'luke', 'john', 'acts',
    'romans', '1corinthians', '2corinthians', 'galatians', 'ephesians',
    'philippians', 'colossians', '1thessalonians', '2thessalonians',
    '1timothy', '2timothy', 'titus', 'philemon', 'hebrews',
    'james', '1peter', '2peter', '1john', '2john',
    '3john', 'jude', 'revelation'
];

// Export for use in other modules (if using ES6 modules in future)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        supabase, currentUser, bibleData, currentBook, currentChapter,
        currentAnnotations, selectedVerse, currentAnnotationSet, userAnnotationSets,
        isSignUp, knownTags, currentTags, selectedTagColor, isNavigating,
        TAG_COLORS_PASTEL, TAG_COLORS_WCAG, WCAG_THEMES, TAG_COLORS,
        BOOK_ABBR, OT_BOOKS
    };
}
