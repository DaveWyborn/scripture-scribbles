// Verse Picker — insert verse references into a sermon note by number.
//
// Distinct from the clip bar: the user isn't reading here, they just want to
// drop one or more verse references into the note they're writing. Pick
// book → chapter → verse(s), and a compact reference link (e.g.
// "John 3:16-18, 20") is inserted at the cursor.

// Picker state (independent of the reader's currentBook/currentChapter).
let vpBook = null;
let vpChapter = null;
let vpSelected = new Set(); // verse numbers selected in the current chapter

// --- Open / close -----------------------------------------------------------

window.openVersePicker = function() {
    if (!bibleData) return;

    // Notes are user-scoped; nudge guests to sign in.
    if (!currentUser) {
        if (typeof showGuestGate === 'function') {
            showGuestGate('Sermon notes need a free account so they sync across your devices.');
        } else if (typeof showErrorIndicator === 'function') {
            showErrorIndicator('Sign in to add verse references to a note');
        }
        return;
    }

    // Default to wherever the reader currently is.
    vpBook = currentBook;
    vpChapter = currentChapter;
    vpSelected = new Set();

    document.getElementById('verse-picker-modal').classList.add('open');
    vpRenderBookGrid();
    vpShowTab('book');
    vpUpdateSummary();
};

function closeVersePicker() {
    document.getElementById('verse-picker-modal').classList.remove('open');
}

// --- Tabs -------------------------------------------------------------------

function vpShowTab(tab) {
    document.getElementById('vp-tab-book').classList.toggle('active', tab === 'book');
    document.getElementById('vp-tab-chapter').classList.toggle('active', tab === 'chapter');
    document.getElementById('vp-tab-verse').classList.toggle('active', tab === 'verse');
    document.getElementById('vp-book-view').classList.toggle('active', tab === 'book');
    document.getElementById('vp-chapter-view').classList.toggle('active', tab === 'chapter');
    document.getElementById('vp-verse-view').classList.toggle('active', tab === 'verse');

    if (tab === 'chapter') vpRenderChapterGrid();
    if (tab === 'verse') vpRenderVerseGrid();
}

// --- Book grid --------------------------------------------------------------

function vpRenderBookGrid() {
    const ot = document.getElementById('vp-ot-books');
    const nt = document.getElementById('vp-nt-books');

    const grid = (label, predicate) => {
        let html = `<div class="testament-label">${label}</div><div class="book-grid">`;
        bibleData.books.forEach(book => {
            if (!predicate(book)) return;
            const abbr = BOOK_ABBR[book.id] || book.name.substring(0, 4);
            const isCurrent = book.id === vpBook ? 'current' : '';
            html += `<button class="book-btn ${isCurrent}" data-book="${book.id}" title="${book.name}">${abbr}</button>`;
        });
        return html + '</div>';
    };

    ot.innerHTML = grid('Old Testament', b => OT_BOOKS.includes(b.id));
    nt.innerHTML = grid('New Testament', b => !OT_BOOKS.includes(b.id));

    document.querySelectorAll('#verse-picker-modal .book-btn').forEach(btn => {
        btn.addEventListener('click', () => vpSelectBook(btn.dataset.book));
    });
}

function vpSelectBook(bookId) {
    vpBook = bookId;
    vpChapter = 1;
    vpSelected = new Set();
    vpRenderBookGrid();
    vpShowTab('chapter');
    vpUpdateSummary();
}

// --- Chapter grid -----------------------------------------------------------

function vpRenderChapterGrid() {
    const book = bibleData.books.find(b => b.id === vpBook);
    if (!book) return;
    document.getElementById('vp-selected-book-name').textContent = book.name;

    let html = '';
    for (let i = 1; i <= book.chapters.length; i++) {
        const isCurrent = i === vpChapter ? 'current' : '';
        html += `<button class="chapter-btn ${isCurrent}" data-chapter="${i}">${i}</button>`;
    }
    document.getElementById('vp-chapter-grid').innerHTML = html;

    document.querySelectorAll('#vp-chapter-grid .chapter-btn').forEach(btn => {
        btn.addEventListener('click', () => vpSelectChapter(parseInt(btn.dataset.chapter)));
    });
}

function vpSelectChapter(n) {
    // Changing chapter resets the selection — references are scoped to one chapter.
    if (n !== vpChapter) vpSelected = new Set();
    vpChapter = n;
    vpShowTab('verse');
    vpUpdateSummary();
}

// --- Verse grid (multi-select) ---------------------------------------------

function vpRenderVerseGrid() {
    const book = bibleData.books.find(b => b.id === vpBook);
    if (!book) return;
    const chapter = book.chapters.find(c => c.number === vpChapter);
    if (!chapter) return;

    document.getElementById('vp-selected-chapter-name').textContent = `${book.name} ${vpChapter}`;

    let html = '';
    chapter.verses.forEach(v => {
        const sel = vpSelected.has(v.number) ? 'selected' : '';
        html += `<button class="verse-pick-btn ${sel}" data-verse="${v.number}">${v.number}</button>`;
    });
    document.getElementById('vp-verse-grid').innerHTML = html;

    document.querySelectorAll('#vp-verse-grid .verse-pick-btn').forEach(btn => {
        btn.addEventListener('click', () => vpToggleVerse(parseInt(btn.dataset.verse), btn));
    });
}

function vpToggleVerse(n, btn) {
    if (vpSelected.has(n)) {
        vpSelected.delete(n);
        btn.classList.remove('selected');
    } else {
        vpSelected.add(n);
        btn.classList.add('selected');
    }
    vpUpdateSummary();
}

// --- Reference formatting ---------------------------------------------------

// Collapse a sorted list of verse numbers into contiguous ranges.
// [16,17,18,20] -> [[16,18],[20,20]]
function vpRanges() {
    const nums = Array.from(vpSelected).sort((a, b) => a - b);
    const ranges = [];
    for (const n of nums) {
        const last = ranges[ranges.length - 1];
        if (last && n === last[1] + 1) {
            last[1] = n;
        } else {
            ranges.push([n, n]);
        }
    }
    return ranges;
}

// "John 3:16-18, 20"
function vpRefText() {
    const book = bibleData.books.find(b => b.id === vpBook);
    if (!book || vpSelected.size === 0) return '';
    const parts = vpRanges().map(([s, e]) => (s === e ? `${s}` : `${s}-${e}`));
    return `${book.name} ${vpChapter}:${parts.join(', ')}`;
}

function vpUpdateSummary() {
    const summary = document.getElementById('vp-summary');
    const btn = document.getElementById('vp-insert-btn');
    const ref = vpRefText();
    if (ref) {
        summary.textContent = ref;
        summary.classList.add('has-selection');
        btn.disabled = false;
    } else {
        summary.textContent = 'Select one or more verses…';
        summary.classList.remove('has-selection');
        btn.disabled = true;
    }
}

// --- Insert into note -------------------------------------------------------

async function vpInsert() {
    if (vpSelected.size === 0) return;

    // Build clip records for the selected verses, then reuse the clip-bar
    // formatter so the picker inserts the full verse text + clickable
    // reference, identical to clipping a verse and tapping "Add to note".
    const records = Array.from(vpSelected)
        .sort((a, b) => a - b)
        .map(n => (typeof buildClipRecord === 'function' ? buildClipRecord(n, vpBook, vpChapter) : null))
        .filter(Boolean);
    if (records.length === 0) return;

    // Make sure a note exists and Trix is mounted.
    if (!currentSermon && typeof createSermon === 'function') {
        await createSermon();
    }
    const editor = typeof ensureTrixEditor === 'function' ? await ensureTrixEditor() : null;
    if (!editor) {
        console.error('Verse picker: no editor available');
        return;
    }

    // Insert at the cursor (not the end) so verses drop in mid-message.
    const html = typeof renderClipsHTML === 'function' ? renderClipsHTML(records) : '';
    if (html) {
        editor.insertHTML(html);
        if (typeof debounceSaveSermon === 'function') debounceSaveSermon();
    }

    closeVersePicker();

    const trix = document.querySelector('trix-editor');
    if (trix) trix.focus();
}

// --- Wire up static modal controls -----------------------------------------

(function initVersePicker() {
    const close = document.getElementById('close-verse-picker');
    if (close) close.addEventListener('click', closeVersePicker);

    const tabBook = document.getElementById('vp-tab-book');
    const tabChapter = document.getElementById('vp-tab-chapter');
    const tabVerse = document.getElementById('vp-tab-verse');
    if (tabBook) tabBook.addEventListener('click', () => vpShowTab('book'));
    if (tabChapter) tabChapter.addEventListener('click', () => vpShowTab('chapter'));
    if (tabVerse) tabVerse.addEventListener('click', () => vpShowTab('verse'));

    const insertBtn = document.getElementById('vp-insert-btn');
    if (insertBtn) insertBtn.addEventListener('click', vpInsert);

    // Close when clicking the backdrop.
    const modal = document.getElementById('verse-picker-modal');
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) closeVersePicker();
    });
})();
