// Sermon Notes Module
// Handles creating, loading, saving, and managing sermon notes with Trix editor

/**
 * Persist the clip-format preference. 'full' = ref link + verse text;
 * 'link' = ref link only.
 * Note: Must be globally accessible for onchange handlers.
 */
window.setClipFormat = function(value) {
    if (value !== 'full' && value !== 'link') value = 'full';
    localStorage.setItem('clipFormat', value);
}

/**
 * Sync the clip-format <select> with the saved preference on init.
 */
function initClipFormatControl() {
    const select = document.getElementById('clip-format');
    if (!select) return;
    select.value = localStorage.getItem('clipFormat') || 'full';
}

/**
 * Initialize sermon notes module
 */
async function initSermons() {

    // Setup Trix event listeners
    setupTrixListeners();

    // Setup swipe handlers for mobile/tablet
    if (window.innerWidth < 1024) {
        setupSwipeHandlers();
    }

    // Restore metadata collapsed state (default collapsed on mobile/tablet)
    const storedCollapsed = localStorage.getItem('metadataCollapsed');
    const metadataCollapsed = storedCollapsed !== null
        ? storedCollapsed === 'true'
        : window.innerWidth < 1024;
    if (metadataCollapsed) {
        const metadata = document.getElementById('sermon-metadata');
        const toggleBtn = document.querySelector('.metadata-toggle-btn');
        if (metadata && toggleBtn) {
            metadata.classList.add('collapsed');
            toggleBtn.classList.add('collapsed');
        }
    }

    // Restore clip format preference into settings UI
    initClipFormatControl();

    // Wire hash-link routing for clip references in notes
    if (typeof setupClipLinkRouter === 'function') {
        setupClipLinkRouter();
    }

    // Load user's sermons if logged in
    if (currentUser) {
        await loadSermonList();
    }
}

/**
 * Toggle metadata section collapse/expand
 * Note: Must be globally accessible for onclick handlers
 */
window.toggleMetadata = function() {
    const metadata = document.getElementById('sermon-metadata');
    const toggleBtn = document.querySelector('.metadata-toggle-btn');

    if (!metadata || !toggleBtn) return;

    const isCollapsed = metadata.classList.contains('collapsed');

    if (isCollapsed) {
        // Expand
        metadata.classList.remove('collapsed');
        toggleBtn.classList.remove('collapsed');
        localStorage.setItem('metadataCollapsed', 'false');
    } else {
        // Collapse
        metadata.classList.add('collapsed');
        toggleBtn.classList.add('collapsed');
        localStorage.setItem('metadataCollapsed', 'true');
    }
}

/**
 * Ensure Trix editor is mounted and initialized.
 * Injects the trix-editor element into #trix-mount only when called
 * (notes view must already be visible), then waits for trix-initialize.
 */
async function ensureTrixEditor() {
    // Already mounted and ready
    const existing = document.querySelector('trix-editor');
    if (existing && existing.editor) return existing.editor;

    // Already mounted but not yet initialized — wait for it
    if (existing) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(existing.editor || null), 3000);
            existing.addEventListener('trix-initialize', () => {
                clearTimeout(timeout);
                resolve(existing.editor);
            }, { once: true });
        });
    }

    // Not mounted yet — inject into mount point (notes view must be visible)
    const mount = document.getElementById('trix-mount');
    if (!mount) {
        console.warn('No #trix-mount found');
        return null;
    }

    const trix = document.createElement('trix-editor');
    trix.setAttribute('input', 'sermon-content');
    trix.setAttribute('placeholder', 'Start typing your notes...');
    mount.appendChild(trix);

    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.warn('Trix init timeout');
            resolve(trix.editor || null);
        }, 3000);
        trix.addEventListener('trix-initialize', () => {
            clearTimeout(timeout);
            resolve(trix.editor);
        }, { once: true });
        if (trix.editor) {
            clearTimeout(timeout);
            resolve(trix.editor);
        }
    });
}

/**
 * Setup Trix editor event listeners
 */
function setupTrixListeners() {
    // Auto-save on content change
    document.addEventListener('trix-change', () => {
        if (currentSermon) {
            debounceSaveSermon();
        }
    });

    // Metadata field changes
    const metadataFields = ['sermon-title', 'sermon-date', 'sermon-speaker', 'sermon-location', 'sermon-series', 'sermon-passage'];
    metadataFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => {
                if (currentSermon) {
                    debounceSaveSermon();
                }
            });
        }
    });
}

/**
 * Build the storage key for a clip record.
 */
function clipKey(bookId, chapter, verse) {
    return `${bookId}:${chapter}:${verse}`;
}

/**
 * Build a clip record from current bible state for the given verse number.
 * Captures book, chapter, version, and verse text at clip-time so output is
 * accurate even if the user has navigated elsewhere.
 */
function buildClipRecord(verseNum, bookId = currentBook, chapter = currentChapter) {
    if (!bibleData) return null;
    const book = bibleData.books.find(b => b.id === bookId);
    if (!book) return null;
    const ch = book.chapters.find(c => c.number === chapter);
    if (!ch) return null;
    const verse = ch.verses.find(v => v.number === verseNum);
    if (!verse) return null;
    return {
        bookId,
        bookName: book.name,
        chapter,
        verse: verseNum,
        version: getCurrentVersionTag(),
        text: verse.text
    };
}

/**
 * Toggle clip state from a menu button — resolves the verse's actual chapter
 * by walking up to its enclosing .chapter-section, so clipping works correctly
 * even when continuous scroll has loaded multiple chapters.
 * Note: Must be globally accessible for onclick handlers.
 */
window.toggleClipFromMenu = function(menuBtn, verseNum) {
    const section = menuBtn.closest('.chapter-section');
    const bookId = section ? section.dataset.book : currentBook;
    const chapter = section ? parseInt(section.dataset.chapter) : currentChapter;
    toggleVerseSelection(verseNum, bookId, chapter);
}

/**
 * Toggle clip state for a verse in the current chapter.
 * Note: Must be globally accessible for onclick handlers.
 */
window.toggleVerseSelection = function(verseNum, bookId, chapter) {
    bookId = bookId || currentBook;
    chapter = chapter || currentChapter;
    const key = clipKey(bookId, chapter, verseNum);
    if (clippedVerses.has(key)) {
        clippedVerses.delete(key);
    } else {
        const record = buildClipRecord(verseNum, bookId, chapter);
        if (!record) return;
        clippedVerses.set(key, record);
    }
    updateClipUI();
}

/**
 * Sync clip visual state, count chip, and bar visibility.
 * Walks all rendered verses (across continuously-scrolled chapters) and marks
 * those whose passage key is in clippedVerses.
 */
function updateClipUI() {
    document.querySelectorAll('.verse, .verse-inline-wrapper').forEach(el => {
        const verseNum = parseInt(el.dataset.verse);
        if (!verseNum) return;
        // Each chapter section in continuous scroll carries data-book + data-chapter.
        // Passage mode has no section wrapper; fall back to current state.
        const section = el.closest('.chapter-section');
        const bookId = section ? section.dataset.book : currentBook;
        const chapter = section ? parseInt(section.dataset.chapter) : currentChapter;
        const key = clipKey(bookId, chapter, verseNum);
        el.classList.toggle('clipped', clippedVerses.has(key));
        // Keep legacy class in sync for any leftover styles
        el.classList.toggle('selected-for-insertion', clippedVerses.has(key));
    });

    const bar = document.getElementById('clip-bar');
    const countEl = document.getElementById('clip-count-label');
    if (!bar) return;
    if (clippedVerses.size > 0) {
        bar.classList.add('visible');
        if (countEl) {
            const n = clippedVerses.size;
            countEl.textContent = `${n} clip${n === 1 ? '' : 's'}`;
        }
    } else {
        bar.classList.remove('visible');
    }
}
// Back-compat alias for any callers still using the old name.
const updateVerseSelectionUI = updateClipUI;

/**
 * Clear all clips. Called on book change / chapter jump / explicit clear.
 * Note: Must be globally accessible for onclick handlers.
 */
window.clearVerseSelection = function() {
    clippedVerses.clear();
    updateClipUI();
}
window.clearClips = window.clearVerseSelection;

/**
 * Group clips into ordered passages, collapsing contiguous verse runs.
 * Returns array of { bookId, bookName, chapter, version, ranges: [{start, end, verses: [{verse, text}]}] }.
 * Each "range" is a contiguous run of clipped verses within one chapter.
 */
function groupClipsByPassage() {
    // Sort by canonical book order, then chapter, then verse. Book IDs are
    // generated as `book.name.toLowerCase().replace(/\s+/g, '')` so they match
    // BIBLE_BOOK_ORDER directly (no hyphens).
    const records = Array.from(clippedVerses.values()).sort((a, b) => {
        const ai = BIBLE_BOOK_ORDER.indexOf(a.bookId);
        const bi = BIBLE_BOOK_ORDER.indexOf(b.bookId);
        if (ai !== bi) return ai - bi;
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.verse - b.verse;
    });

    const groups = [];
    for (const r of records) {
        let group = groups[groups.length - 1];
        if (!group || group.bookId !== r.bookId || group.chapter !== r.chapter) {
            group = {
                bookId: r.bookId,
                bookName: r.bookName,
                chapter: r.chapter,
                version: r.version,
                ranges: []
            };
            groups.push(group);
        }
        const lastRange = group.ranges[group.ranges.length - 1];
        if (lastRange && r.verse === lastRange.end + 1) {
            lastRange.end = r.verse;
            lastRange.verses.push({ verse: r.verse, text: r.text });
        } else {
            group.ranges.push({ start: r.verse, end: r.verse, verses: [{ verse: r.verse, text: r.text }] });
        }
    }
    return groups;
}

/**
 * Format a single range's reference label, e.g. "John 3:16" or "Genesis 1:1-3".
 */
function formatRangeRef(group, range) {
    const v = range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`;
    return `${group.bookName} ${group.chapter}:${v} (${group.version})`;
}

/**
 * Build a hash link that reopens a passage at the first clipped verse.
 * Format: #/<version>/<bookId>/<chapter>/<verse>
 */
function buildPassageLink(group, range) {
    return `#/${group.version.toLowerCase()}/${group.bookId}/${group.chapter}/${range.start}`;
}

/**
 * Render clips as HTML for Trix insertion.
 * Format depends on `clipFormat` localStorage setting:
 *   'full' (default): reference link followed by verse text on next line
 *   'link': reference link only
 */
function renderClipsHTML() {
    const format = localStorage.getItem('clipFormat') || 'full';
    const groups = groupClipsByPassage();
    if (groups.length === 0) return '';

    const blocks = [];
    for (const group of groups) {
        for (const range of group.ranges) {
            const ref = formatRangeRef(group, range);
            const href = buildPassageLink(group, range);
            const refLine = `<p><a href="${href}"><strong>${ref}</strong></a></p>`;
            if (format === 'link') {
                blocks.push(refLine);
            } else {
                const verseLines = range.verses
                    .map(v => `<p>${v.text}</p>`)
                    .join('');
                blocks.push(refLine + verseLines);
            }
        }
    }
    // Trailing blank paragraph keeps the cursor below the inserted block.
    return blocks.join('') + '<p><br></p>';
}

/**
 * Append clipped verses to the current sermon note. If notes panel is closed,
 * open it first. If no current sermon, create an untitled one.
 * Note: Must be globally accessible for onclick handlers.
 */
window.addClipsToNote = async function() {
    if (clippedVerses.size === 0) return;

    // Notes are user-scoped; nudge guests to sign in instead of mounting Trix
    // into nowhere.
    if (!currentUser) {
        if (typeof showGuestGate === 'function') {
            showGuestGate('Sermon notes need a free account so they sync across your devices. Your clipped verses will still be here when you sign in.');
        } else if (typeof showErrorIndicator === 'function') {
            showErrorIndicator('Sign in to save clipped verses to a note');
        } else {
            alert('Sign in to save clipped verses to a note.');
        }
        return;
    }

    // 1. Make sure the notes panel is visible.
    if (window.innerWidth >= 1024) {
        if (sermonViewMode !== 'split' && typeof toggleNotesView === 'function') {
            await toggleNotesView();
        }
    } else {
        if (activeView !== 'notes' && typeof switchMobileView === 'function') {
            await switchMobileView('notes');
        }
    }

    // 2. Make sure a sermon exists.
    if (!currentSermon) {
        await createSermon();
    }

    // 3. Make sure Trix is mounted.
    const editor = await ensureTrixEditor();
    if (!editor) {
        console.error('Could not mount Trix editor');
        return;
    }

    // 4. Append at end of document, regardless of where the cursor was.
    const html = renderClipsHTML();
    if (html) {
        const end = editor.getDocument().toString().length;
        editor.setSelectedRange([end, end]);
        editor.insertHTML(html);
        debounceSaveSermon();
    }
    clearClips();
}

// Back-compat aliases for any old onclick="insertSelectedAsReference()" or
// onclick="insertSelectedAsText()" — both now route to addClipsToNote.
window.insertSelectedAsReference = window.addClipsToNote;
window.insertSelectedAsText = window.addClipsToNote;

/**
 * Parse a clip-style hash (#/<version>/<bookId>/<chapter>/<verse>) into parts.
 * Returns null if the hash isn't in the expected shape.
 */
function parseClipHash(hash) {
    if (!hash || !hash.startsWith('#/')) return null;
    const parts = hash.slice(2).split('/');
    if (parts.length < 3) return null;
    const [version, bookId, chapterStr, verseStr] = parts;
    const chapter = parseInt(chapterStr, 10);
    const verse = verseStr ? parseInt(verseStr, 10) : null;
    if (!bookId || !chapter || isNaN(chapter)) return null;
    return { version, bookId, chapter, verse };
}

/**
 * Navigate the reader to the passage encoded in a clip hash. Used both for
 * direct hash changes and for clicks on `<a href="#/...">` clip references
 * inside the Trix editor.
 */
async function openClipTarget(target) {
    if (!target || !bibleData) return;

    const book = bibleData.books.find(b => b.id === target.bookId);
    if (!book) return;
    const chapterObj = book.chapters.find(c => c.number === target.chapter);
    if (!chapterObj) return;

    // Switch reader state.
    currentBook = target.bookId;
    currentChapter = target.chapter;
    passageChunks = [];
    currentPassageIndex = 0;

    if (typeof saveLastPosition === 'function') saveLastPosition();
    if (typeof loadAnnotations === 'function') await loadAnnotations();
    if (typeof displayChapter === 'function') displayChapter();

    // On mobile, switching to bible view so the user can see the passage.
    if (window.innerWidth < 1024 && activeView !== 'bible' && typeof switchMobileView === 'function') {
        switchMobileView('bible');
    }

    // After render, scroll the target verse into view.
    if (target.verse) {
        setTimeout(() => {
            const verseEl = document.querySelector(
                `.chapter-section[data-book="${target.bookId}"][data-chapter="${target.chapter}"] [data-verse="${target.verse}"]`
            ) || document.querySelector(`[data-verse="${target.verse}"]`);
            if (verseEl) {
                verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                verseEl.classList.add('clip-link-flash');
                setTimeout(() => verseEl.classList.remove('clip-link-flash'), 1600);
            }
        }, 200);
    }
}

/**
 * Wire up clip-link routing: hashchange events for cold links, and a
 * delegated click handler so links inside the Trix editor (which lives in a
 * shadow-free iframe-like contenteditable) work without page reload.
 */
function setupClipLinkRouter() {
    window.addEventListener('hashchange', () => {
        const target = parseClipHash(location.hash);
        if (target) openClipTarget(target);
    });

    // Trix renders its content in a regular contenteditable (no shadow DOM),
    // so a single delegated click listener catches both editor and rendered
    // notes-export anchors.
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href^="#/"]');
        if (!a) return;
        const target = parseClipHash(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        openClipTarget(target);
    });

    // Honour an initial clip hash on first load.
    const initial = parseClipHash(location.hash);
    if (initial) {
        // Defer until the bible has loaded.
        const wait = setInterval(() => {
            if (bibleData) {
                clearInterval(wait);
                openClipTarget(initial);
            }
        }, 100);
    }
}

/**
 * Load list of user's sermons from Supabase
 */
async function loadSermonList() {
    try {
        const { data, error } = await supabase
            .from('sermons')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('date', { ascending: false })
            .limit(50);

        if (error) throw error;

        sermonList = data || [];

        // Load most recent sermon
        const lastSermonId = localStorage.getItem('lastSermonId');
        if (lastSermonId) {
            const sermon = sermonList.find(s => s.id === lastSermonId);
            if (sermon) {
                await loadSermon(sermon.id);
            } else if (sermonList.length > 0) {
                await loadSermon(sermonList[0].id);
            }
        } else if (sermonList.length > 0) {
            await loadSermon(sermonList[0].id);
        }
    } catch (error) {
        console.error('Error loading sermon list:', error);
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
            console.warn('Sermons table does not exist — create it in Supabase');
        }
    }
}

/**
 * Load specific sermon by ID
 */
async function loadSermon(sermonId) {
    try {
        const { data, error } = await supabase
            .from('sermons')
            .select('*')
            .eq('id', sermonId)
            .eq('user_id', currentUser.id)
            .single();

        if (error) throw error;

        currentSermon = data;
        localStorage.setItem('lastSermonId', sermonId);

        // Populate form fields (only if they exist)
        const titleField = document.getElementById('sermon-title');
        const dateField = document.getElementById('sermon-date');
        const speakerField = document.getElementById('sermon-speaker');
        const locationField = document.getElementById('sermon-location');
        const seriesField = document.getElementById('sermon-series');
        const passageField = document.getElementById('sermon-passage');

        if (titleField) titleField.value = data.title || '';
        if (dateField) dateField.value = data.date || '';
        if (speakerField) speakerField.value = data.speaker || '';
        if (locationField) locationField.value = data.location || '';
        if (seriesField) seriesField.value = data.series || '';
        if (passageField) passageField.value = data.passage || '';

        // Load content into Trix (only if notes view is visible)
        const notesView = document.getElementById('sermon-notes-view');
        const notesVisible = notesView && (
            window.getComputedStyle(notesView).display !== 'none' ||
            sermonViewMode === 'split'
        );

        if (notesVisible) {
            const editor = await ensureTrixEditor();
            if (editor) {
                editor.loadHTML(data.content || '');
            } else {
                console.error('Could not initialise Trix editor');
            }
        }
    } catch (error) {
        console.error('Error loading sermon:', error);
    }
}

/**
 * Create a new sermon with default values
 */
async function createSermon() {
    if (!currentUser) {
        console.error('Must be logged in to create sermon');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const defaultPassage = `${bibleData.books.find(b => b.id === currentBook)?.name || ''} ${currentChapter}`;

    const sermonData = {
        user_id: currentUser.id,
        title: '',
        date: today,
        speaker: '',
        location: '',
        series: '',
        passage: defaultPassage,
        content: '',
        metadata: {
            bible_position: { book: currentBook, chapter: currentChapter }
        }
    };

    try {
        const { data, error } = await supabase
            .from('sermons')
            .insert(sermonData)
            .select()
            .single();

        if (error) throw error;

        currentSermon = data;
        sermonList.unshift(data);
        localStorage.setItem('lastSermonId', data.id);

        // Populate form with new sermon
        document.getElementById('sermon-title').value = data.title;
        document.getElementById('sermon-date').value = data.date;
        document.getElementById('sermon-speaker').value = '';
        document.getElementById('sermon-location').value = '';
        document.getElementById('sermon-series').value = '';
        document.getElementById('sermon-passage').value = data.passage;

        // Clear Trix editor if mounted
        const trixEl = document.querySelector('trix-editor');
        if (trixEl && trixEl.editor) {
            trixEl.editor.loadHTML('');
        }

        return data;
    } catch (error) {
        console.error('Error creating sermon:', error);
        return null;
    }
}

/**
 * Debounced save - waits 1 second after last edit
 */
function debounceSaveSermon() {
    clearTimeout(sermonSaveTimeout);
    sermonSaveTimeout = setTimeout(async () => {
        await saveSermon();
    }, 1000);
}

/**
 * Save current sermon to Supabase
 */
async function saveSermon() {
    if (!currentUser || !currentSermon) {
        console.warn('Cannot save: no user or sermon');
        return;
    }

    // Get HTML content from Trix (not plain text)
    const contentInput = document.getElementById('sermon-content');
    const content = contentInput ? contentInput.value : '';

    const sermonData = {
        user_id: currentUser.id,
        title: document.getElementById('sermon-title').value || 'Untitled',
        date: document.getElementById('sermon-date').value || new Date().toISOString().split('T')[0],
        speaker: document.getElementById('sermon-speaker').value || null,
        location: document.getElementById('sermon-location').value || null,
        series: document.getElementById('sermon-series').value || null,
        passage: document.getElementById('sermon-passage').value || null,
        content: content,
        metadata: {
            bible_position: { book: currentBook, chapter: currentChapter }
        },
        updated_at: new Date().toISOString()
    };

    try {
        if (currentSermon.id) {
            // Update existing
            const { error } = await supabase
                .from('sermons')
                .update(sermonData)
                .eq('id', currentSermon.id);

            if (error) throw error;

            // Update local copy
            Object.assign(currentSermon, sermonData);

            showSaveIndicator();
        }
    } catch (error) {
        console.error('Error saving sermon:', error);
        showErrorIndicator('Failed to save');
    }
}

/**
 * Delete sermon by ID
 */
async function deleteSermon(sermonId) {
    if (!confirm('Delete this sermon note? This cannot be undone.')) {
        return false;
    }

    try {
        const { error } = await supabase
            .from('sermons')
            .delete()
            .eq('id', sermonId)
            .eq('user_id', currentUser.id);

        if (error) throw error;

        // Remove from list
        sermonList = sermonList.filter(s => s.id !== sermonId);

        // If deleting current sermon, load another
        if (currentSermon && currentSermon.id === sermonId) {
            if (sermonList.length > 0) {
                await loadSermon(sermonList[0].id);
            } else {
                // No sermons left, create new
                currentSermon = null;
                await createSermon();
            }
        }

        return true;
    } catch (error) {
        console.error('Error deleting sermon:', error);
        return false;
    }
}

/**
 * Universal notes toggle — viewport-aware entry point.
 * Desktop (≥1024px) → split view. Mobile/tablet (<1024px) → full-screen overlay.
 */
window.toggleNotes = async function() {
    if (window.innerWidth >= 1024) {
        await toggleNotesView();
    } else {
        const next = activeView === 'notes' ? 'bible' : 'notes';
        await window.switchMobileView(next);
    }
};

/**
 * Update the universal header icon to reflect open/closed state.
 */
function setNotesToggleIcon(isOpen) {
    const btn = document.getElementById('notes-toggle-btn');
    const icon = document.getElementById('notes-toggle-icon');
    if (icon) {
        icon.className = isOpen ? 'ph ph-x' : 'ph ph-notebook';
    }
    if (btn) {
        btn.setAttribute('aria-label', isOpen ? 'Close sermon notes' : 'Open sermon notes');
        btn.classList.toggle('notes-open', isOpen);
    }
}

/**
 * Toggle notes view (desktop split screen)
 */
async function toggleNotesView() {
    const content = document.getElementById('content');
    const notesView = document.getElementById('sermon-notes-view');

    if (!notesView) {
        console.warn('sermon-notes-view not found, creating fallback');
        const newNotesView = document.createElement('div');
        newNotesView.id = 'sermon-notes-view';
        newNotesView.className = 'sermon-notes-view';
        newNotesView.style.display = 'none';
        newNotesView.innerHTML = `
            <div class="sermon-metadata-wrapper">
                <div class="sermon-metadata-header">
                    <input type="text" id="sermon-title" placeholder="Message title...">
                    <button class="metadata-toggle-btn" onclick="toggleMetadata()" aria-label="Toggle details">
                        <i class="ph ph-caret-down" id="metadata-toggle-icon"></i>
                        <span class="metadata-toggle-label">Details</span>
                    </button>
                </div>
                <div class="sermon-metadata" id="sermon-metadata">
                    <input type="date" id="sermon-date">
                    <input type="text" id="sermon-speaker" placeholder="Speaker...">
                    <input type="text" id="sermon-location" placeholder="Location...">
                    <input type="text" id="sermon-series" placeholder="Series/Theme...">
                    <input type="text" id="sermon-passage" placeholder="Passage...">
                </div>
            </div>
<!-- Clip bar lives at container level (see main HTML); not embedded in notes view. -->
            <div class="sermon-editor-container">
                <div id="trix-mount"></div>
                <input type="hidden" id="sermon-content">
            </div>
            <div class="sermon-actions">
                <button onclick="openSermonSelector()">Manage Notes</button>
                <button onclick="exportSermonMarkdown()">Export</button>
            </div>
        `;
        content.appendChild(newNotesView);
        // Retry with deferred Trix mounting
        return toggleNotesView();
    }

    if (sermonViewMode === 'single') {
        // Show split view
        let bibleWrapper = document.getElementById('bible-content-wrapper');
        if (!bibleWrapper) {
            bibleWrapper = document.createElement('div');
            bibleWrapper.id = 'bible-content-wrapper';
            bibleWrapper.className = 'bible-content-wrapper';

            const children = Array.from(content.children);
            children.forEach(child => {
                if (child.id !== 'sermon-notes-view') {
                    bibleWrapper.appendChild(child);
                }
            });

            content.insertBefore(bibleWrapper, notesView);
        }

        // Show notes with transition: set display first, then add split-view
        // class on next frame so CSS transition can run
        notesView.style.display = 'flex';
        requestAnimationFrame(() => {
            content.classList.add('split-view');
        });
        sermonViewMode = 'split';

        setNotesToggleIcon(true);

        // Mount and initialise Trix now that notes are visible
        await ensureTrixEditor();

        if (!currentSermon) {
            await createSermon();
        }
    } else {
        // Return to single view
        const bibleWrapper = document.getElementById('bible-content-wrapper');
        if (bibleWrapper) {
            const children = Array.from(bibleWrapper.children);
            children.forEach(child => {
                content.insertBefore(child, notesView);
            });
            bibleWrapper.remove();
        }

        // Animate out then hide
        content.classList.remove('split-view');
        sermonViewMode = 'single';
        // Wait for transition to finish before hiding
        setTimeout(() => {
            if (sermonViewMode === 'single') {
                notesView.style.display = 'none';
            }
        }, 400);

        setNotesToggleIcon(false);
    }
}

/**
 * Switch view on mobile (swipe navigation)
 * Note: Must be globally accessible for onclick handlers
 */
window.switchMobileView = async function(view) {
    activeView = view;
    document.body.classList.toggle('mobile-notes-open', view === 'notes');
    let notesView = document.getElementById('sermon-notes-view');
    const welcomeView = document.querySelector('.welcome');

    // Create notes view if it doesn't exist
    if (!notesView && view === 'notes') {
        console.warn('sermon-notes-view missing on mobile, creating fallback');
        const content = document.getElementById('content');
        notesView = document.createElement('div');
        notesView.id = 'sermon-notes-view';
        notesView.className = 'sermon-notes-view';
        notesView.style.display = 'none';
        notesView.innerHTML = `
            <div class="sermon-metadata-wrapper">
                <div class="sermon-metadata-header">
                    <input type="text" id="sermon-title" placeholder="Message title...">
                    <button class="metadata-toggle-btn" onclick="toggleMetadata()" aria-label="Toggle details">
                        <i class="ph ph-caret-down" id="metadata-toggle-icon"></i>
                        <span class="metadata-toggle-label">Details</span>
                    </button>
                </div>
                <div class="sermon-metadata" id="sermon-metadata">
                    <input type="date" id="sermon-date">
                    <input type="text" id="sermon-speaker" placeholder="Speaker...">
                    <input type="text" id="sermon-location" placeholder="Location...">
                    <input type="text" id="sermon-series" placeholder="Series/Theme...">
                    <input type="text" id="sermon-passage" placeholder="Passage...">
                </div>
            </div>
<!-- Clip bar lives at container level (see main HTML); not embedded in notes view. -->
            <div class="sermon-editor-container">
                <div id="trix-mount"></div>
                <input type="hidden" id="sermon-content">
            </div>
            <div class="sermon-actions">
                <button onclick="openSermonSelector()">Manage Notes</button>
                <button onclick="exportSermonMarkdown()">Export</button>
            </div>
        `;
        content.appendChild(notesView);

        // Setup event listeners for the dynamically created metadata fields
        setupTrixListeners();
    }

    // Reflect open/closed state on the universal header icon
    setNotesToggleIcon(view === 'notes');

    // Show/hide sermon notes view
    if (view === 'bible') {
        if (notesView) {
            notesView.style.display = 'none';
        }
    } else {
        if (welcomeView) {
            welcomeView.style.display = 'none';
        }
        if (notesView) {
            notesView.style.display = 'flex';

            // Mount and initialise Trix now that notes are visible
            await ensureTrixEditor();

            if (!currentSermon) {
                await createSermon();
            } else {
                await loadSermon(currentSermon.id);
            }
        } else {
            console.error('sermon-notes-view not found after fallback creation');
        }
    }
}

/**
 * Setup swipe handlers for mobile
 */
function setupSwipeHandlers() {
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    const container = document.getElementById('content');
    if (!container) return;

    container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    container.addEventListener('touchmove', (e) => {
        if (!touchStartX) return;

        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;

        // Only horizontal swipes (not vertical scrolls)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            isSwiping = true;
            // Don't prevent default - let scroll work
        }
    });

    container.addEventListener('touchend', (e) => {
        if (!isSwiping) {
            touchStartX = 0;
            touchStartY = 0;
            return;
        }

        const deltaX = e.changedTouches[0].clientX - touchStartX;

        // Threshold: 50px
        if (Math.abs(deltaX) > 50) {
            if (deltaX > 0 && activeView === 'notes') {
                // Swipe right → Bible
                switchMobileView('bible');
            } else if (deltaX < 0 && activeView === 'bible') {
                // Swipe left → Notes
                switchMobileView('notes');
            }
        }

        // Reset
        touchStartX = 0;
        touchStartY = 0;
        isSwiping = false;
    });
}

/**
 * Insert verse reference into Trix editor
 */
function insertVerseReference(verseNum) {
    const trixEditor = document.querySelector('trix-editor');
    if (!trixEditor) {
        console.error('Trix editor not found');
        return;
    }

    const book = bibleData.books.find(b => b.id === currentBook);
    const chapter = book.chapters.find(c => c.number === currentChapter);
    const verse = chapter.verses.find(v => v.number === verseNum);

    if (!verse) {
        console.error('Verse not found');
        return;
    }

    const reference = `${book.name} ${currentChapter}:${verseNum}`;
    const format = localStorage.getItem('verseInsertFormat') || 'blockquote';

    let html;
    if (format === 'blockquote') {
        html = `<blockquote>"${verse.text}" — ${reference}</blockquote><br>`;
    } else if (format === 'reference') {
        html = `<p><strong>${reference}</strong></p>`;
    } else {
        // Inline format
        html = `<p>${verse.text} (${reference})</p>`;
    }

    trixEditor.editor.insertHTML(html);
    debounceSaveSermon();
}

/**
 * Open sermon selector modal
 */
window.openSermonSelector = function() {
    const modal = document.getElementById('sermon-selector-modal');
    if (!modal) return;

    // Populate sermon list
    const sermonListEl = document.getElementById('sermon-list');
    if (!sermonListEl) return;

    sermonListEl.innerHTML = '';

    if (sermonList.length === 0) {
        sermonListEl.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No sermon notes yet</p>';
    } else {
        sermonList.forEach(sermon => {
            const item = document.createElement('div');
            item.className = 'sermon-list-item';
            if (currentSermon && currentSermon.id === sermon.id) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <div class="sermon-item-content" onclick="selectSermon('${sermon.id}')">
                    <h4>${sermon.title || 'Untitled'}</h4>
                    <p>${sermon.date || ''} ${sermon.speaker ? '• ' + sermon.speaker : ''}</p>
                    <p class="sermon-passage">${sermon.passage || ''}</p>
                </div>
                <button class="btn-icon" onclick="event.stopPropagation(); deleteSermon('${sermon.id}')">
                    <i class="ph ph-trash"></i>
                </button>
            `;

            sermonListEl.appendChild(item);
        });
    }

    modal.classList.add('open');
}

/**
 * Close sermon selector modal
 */
window.closeSermonSelector = function() {
    const modal = document.getElementById('sermon-selector-modal');
    if (modal) {
        modal.classList.remove('open');
    }
}

/**
 * Select sermon from list
 */
async function selectSermon(sermonId) {
    await loadSermon(sermonId);
    closeSermonSelector();
}

/**
 * Create new sermon and open it
 */
window.createNewSermon = async function() {
    const sermon = await createSermon();
    if (sermon) {
        closeSermonSelector();

        // Focus title field
        const titleField = document.getElementById('sermon-title');
        if (titleField) {
            titleField.select();
        }
    }
}

/**
 * Show save indicator
 */
function showSaveIndicator() {
    const indicator = document.getElementById('save-indicator');
    if (indicator) {
        indicator.textContent = '✓ Saved';
        indicator.style.display = 'block';
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 2000);
    }
}

/**
 * Show error indicator
 */
function showErrorIndicator(message) {
    const indicator = document.getElementById('save-indicator');
    if (indicator) {
        indicator.textContent = `✗ ${message}`;
        indicator.style.display = 'block';
        indicator.style.color = 'var(--accent-negative)';
        setTimeout(() => {
            indicator.style.display = 'none';
            indicator.style.color = '';
        }, 3000);
    }
}

/**
 * Export sermon to Markdown
 */
window.exportSermonMarkdown = async function() {
    if (!currentSermon) {
        alert('No sermon to export');
        return;
    }

    // Get HTML content from Trix
    const contentInput = document.getElementById('sermon-content');
    const htmlContent = contentInput ? contentInput.value : '';

    // Convert HTML to Markdown
    const mdContent = trixToMarkdown(htmlContent);

    // Build full export
    const metadata = `# ${currentSermon.title || 'Untitled'}

**Date:** ${currentSermon.date || 'N/A'}
**Speaker:** ${currentSermon.speaker || 'N/A'}
**Location:** ${currentSermon.location || 'N/A'}
**Series:** ${currentSermon.series || 'N/A'}
**Passage:** ${currentSermon.passage || 'N/A'}

---

`;

    const fullMarkdown = metadata + mdContent;

    // Download as file
    const blob = new Blob([fullMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSermon.title || 'sermon'}.md`;
    a.click();
    URL.revokeObjectURL(url);

}

/**
 * Convert Trix HTML to Markdown
 */
function trixToMarkdown(html) {
    let md = html;

    // Headings
    md = md.replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n');
    md = md.replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n');

    // Bold and italic
    md = md.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    md = md.replace(/<b>(.*?)<\/b>/g, '**$1**');
    md = md.replace(/<em>(.*?)<\/em>/g, '*$1*');
    md = md.replace(/<i>(.*?)<\/i>/g, '*$1*');

    // Blockquotes
    md = md.replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1\n\n');

    // Lists
    md = md.replace(/<ul>(.*?)<\/ul>/gs, (match, items) => {
        const listItems = items.match(/<li>(.*?)<\/li>/g);
        if (!listItems) return match;
        return listItems.map(item => {
            const text = item.replace(/<\/?li>/g, '');
            return `- ${text}`;
        }).join('\n') + '\n\n';
    });

    md = md.replace(/<ol>(.*?)<\/ol>/gs, (match, items) => {
        const listItems = items.match(/<li>(.*?)<\/li>/g);
        if (!listItems) return match;
        return listItems.map((item, i) => {
            const text = item.replace(/<\/?li>/g, '');
            return `${i + 1}. ${text}`;
        }).join('\n') + '\n\n';
    });

    // Links
    md = md.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');

    // Paragraphs
    md = md.replace(/<p>(.*?)<\/p>/g, '$1\n\n');

    // Line breaks
    md = md.replace(/<br\s*\/?>/g, '\n');

    // Strip remaining HTML tags
    md = md.replace(/<[^>]+>/g, '');

    // Clean up excessive newlines
    md = md.replace(/\n{3,}/g, '\n\n');

    return md.trim();
}
