// Reading Plans Module - Phase 1: Reading History
// Tracks which chapters/sections the user has read
// Guests: localStorage. Logged-in: Supabase with silent merge on login.

const READING_HISTORY_KEY = 'readingHistory';

// In-memory cache lives in state.js: readingHistory = {}

// ─── Init ────────────────────────────────────────────────────────────────────

async function initReadingHistory() {
    if (currentUser) {
        await loadReadingHistoryFromSupabase();
    } else {
        loadReadingHistoryFromLocalStorage();
    }
}

// ─── LocalStorage ────────────────────────────────────────────────────────────

function loadReadingHistoryFromLocalStorage() {
    try {
        const raw = localStorage.getItem(READING_HISTORY_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        readingHistory = {};
        Object.entries(data).forEach(([bookId, chapters]) => {
            readingHistory[bookId] = {};
            Object.entries(chapters).forEach(([ch, info]) => {
                readingHistory[bookId][parseInt(ch)] = {
                    marked: new Set(info.marked),
                    total: info.total
                };
            });
        });
    } catch (e) {
        console.error('Failed to load reading history from localStorage', e);
        readingHistory = {};
    }
}

function saveReadingHistoryToLocalStorage() {
    try {
        const out = {};
        Object.entries(readingHistory).forEach(([bookId, chapters]) => {
            out[bookId] = {};
            Object.entries(chapters).forEach(([ch, info]) => {
                out[bookId][ch] = { marked: Array.from(info.marked), total: info.total };
            });
        });
        localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(out));
    } catch (e) {
        console.error('Failed to save reading history to localStorage', e);
    }
}

// ─── Supabase ─────────────────────────────────────────────────────────────────

async function loadReadingHistoryFromSupabase() {
    if (!supabase || !currentUser) return;
    try {
        const { data, error } = await supabase
            .from('reading_history')
            .select('book_id, chapter, section_index, total_sections')
            .eq('user_id', currentUser.id);
        if (error) throw error;
        readingHistory = {};
        (data || []).forEach(row => {
            if (!readingHistory[row.book_id]) readingHistory[row.book_id] = {};
            const ch = readingHistory[row.book_id][row.chapter];
            if (!ch) {
                readingHistory[row.book_id][row.chapter] = {
                    marked: new Set([row.section_index]),
                    total: row.total_sections
                };
            } else {
                ch.marked.add(row.section_index);
                ch.total = row.total_sections;
            }
        });
    } catch (e) {
        console.error('Failed to load reading history from Supabase', e);
    }
}

async function saveReadingMarkToSupabase(bookId, chapter, sectionIndex, totalSections) {
    if (!supabase || !currentUser) return;
    try {
        const { error } = await supabase.from('reading_history').upsert({
            user_id: currentUser.id,
            book_id: bookId,
            chapter,
            section_index: sectionIndex,
            total_sections: totalSections,
            version: getCurrentVersionTag().toLowerCase(),
            read_at: new Date().toISOString()
        }, { onConflict: 'user_id,book_id,chapter,section_index,version' });
        if (error) throw error;
    } catch (e) {
        console.error('Failed to save reading mark to Supabase', e);
    }
}

async function deleteReadingMarkFromSupabase(bookId, chapter, sectionIndex) {
    if (!supabase || !currentUser) return;
    try {
        const { error } = await supabase.from('reading_history')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('book_id', bookId)
            .eq('chapter', chapter)
            .eq('section_index', sectionIndex);
        if (error) throw error;
    } catch (e) {
        console.error('Failed to delete reading mark from Supabase', e);
    }
}

// Called on login — silently merges any guest marks into Supabase, then reloads.
// localStorage is only cleared once the upsert is confirmed; otherwise the guest
// data stays put so a transient Supabase failure cannot silently delete it.
async function mergeGuestHistoryToSupabase() {
    if (!currentUser || !supabase) return;
    const raw = localStorage.getItem(READING_HISTORY_KEY);
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        const records = [];
        Object.entries(data).forEach(([bookId, chapters]) => {
            Object.entries(chapters).forEach(([ch, info]) => {
                info.marked.forEach(sectionIndex => {
                    records.push({
                        user_id: currentUser.id,
                        book_id: bookId,
                        chapter: parseInt(ch),
                        section_index: sectionIndex,
                        total_sections: info.total,
                        version: getCurrentVersionTag().toLowerCase(),
                        read_at: new Date().toISOString()
                    });
                });
            });
        });
        if (records.length > 0) {
            const { error } = await supabase.from('reading_history').upsert(records, {
                onConflict: 'user_id,book_id,chapter,section_index,version'
            });
            if (error) throw error;
        }
        localStorage.removeItem(READING_HISTORY_KEY);
        await loadReadingHistoryFromSupabase();
    } catch (e) {
        console.error('Failed to merge guest reading history — keeping local copy', e);
    }
}

// ─── In-memory helpers ───────────────────────────────────────────────────────

function markSectionInMemory(bookId, chapter, sectionIndex, totalSections) {
    if (!readingHistory[bookId]) readingHistory[bookId] = {};
    if (!readingHistory[bookId][chapter]) {
        readingHistory[bookId][chapter] = { marked: new Set(), total: totalSections };
    }
    readingHistory[bookId][chapter].marked.add(sectionIndex);
    readingHistory[bookId][chapter].total = totalSections;
}

function unmarkSectionInMemory(bookId, chapter, sectionIndex) {
    readingHistory[bookId]?.[chapter]?.marked.delete(sectionIndex);
}

// ─── Status queries ──────────────────────────────────────────────────────────

function getSectionStatus(bookId, chapter, sectionIndex) {
    return readingHistory[bookId]?.[chapter]?.marked.has(sectionIndex) ? 'read' : 'unread';
}

function getChapterStatus(bookId, chapter) {
    const ch = readingHistory[bookId]?.[chapter];
    if (!ch || ch.marked.size === 0) return 'unread';
    if (ch.marked.size >= ch.total) return 'complete';
    return 'partial';
}

// ─── Toggle handlers (called from rendered HTML) ─────────────────────────────

async function toggleSectionRead(bookId, chapter, sectionIndex, totalSections) {
    const wasRead = getSectionStatus(bookId, chapter, sectionIndex) === 'read';

    // Optimistic in-memory update
    if (wasRead) {
        unmarkSectionInMemory(bookId, chapter, sectionIndex);
    } else {
        markSectionInMemory(bookId, chapter, sectionIndex, totalSections);
    }

    // Update DOM immediately
    updateMarkButtonInDOM(bookId, chapter, sectionIndex);
    updateChapterStatusInNav(bookId, chapter);

    // Persist async
    if (currentUser && supabase) {
        if (wasRead) {
            await deleteReadingMarkFromSupabase(bookId, chapter, sectionIndex);
        } else {
            await saveReadingMarkToSupabase(bookId, chapter, sectionIndex, totalSections);
        }
    } else {
        saveReadingHistoryToLocalStorage();
    }
}

async function markAllSectionsRead(bookId, chapter, totalSections) {
    const wasComplete = getChapterStatus(bookId, chapter) === 'complete';

    // Optimistic in-memory update
    for (let i = 0; i < totalSections; i++) {
        if (wasComplete) {
            unmarkSectionInMemory(bookId, chapter, i);
        } else {
            markSectionInMemory(bookId, chapter, i, totalSections);
        }
    }

    // Update the verse-mode mark-all button
    const marker = document.querySelector('.read-marker[data-mark-all]');
    if (marker) {
        const isNowComplete = !wasComplete;
        _applyMarkButtonState(marker, isNowComplete ? 'read' : 'unread', false);
    }
    updateChapterStatusInNav(bookId, chapter);

    // Persist async
    const saves = [];
    for (let i = 0; i < totalSections; i++) {
        if (currentUser && supabase) {
            saves.push(wasComplete
                ? deleteReadingMarkFromSupabase(bookId, chapter, i)
                : saveReadingMarkToSupabase(bookId, chapter, i, totalSections));
        }
    }
    if (saves.length > 0) {
        await Promise.all(saves);
    } else {
        saveReadingHistoryToLocalStorage();
    }
}

// ─── DOM update helpers ───────────────────────────────────────────────────────

function updateMarkButtonInDOM(bookId, chapter, sectionIndex) {
    const marker = document.querySelector(
        `.read-marker[data-book="${bookId}"][data-chapter="${chapter}"][data-section="${sectionIndex}"]`
    );
    if (!marker) return;
    const status = getSectionStatus(bookId, chapter, sectionIndex);
    _applyMarkButtonState(marker, status, false);
}

function updateChapterStatusInNav(bookId, chapter) {
    if (bookId !== currentBook) return;
    const btn = document.querySelector(`.chapter-btn[data-chapter="${chapter}"]`);
    if (!btn) return;
    const status = getChapterStatus(bookId, chapter);
    btn.classList.remove('chapter-complete', 'chapter-partial');
    if (status === 'complete') btn.classList.add('chapter-complete');
    else if (status === 'partial') btn.classList.add('chapter-partial');
}

function _applyMarkButtonState(marker, status, isMarkAll) {
    const isRead = status === 'read' || status === 'complete';
    const isPartial = status === 'partial';
    marker.classList.toggle('read', isRead);
    marker.classList.toggle('partial', isPartial && !isRead);
    const icon = marker.querySelector('i');
    const label = marker.querySelector('span');
    if (icon) icon.className = `ph ${isRead ? 'ph-check-circle' : isPartial ? 'ph-circle-half' : 'ph-circle'}`;
    if (label) label.textContent = isRead ? 'Read' : 'Mark as read';
}

// ─── Auto-mark as read ──────────────────────────────────────────────────────

let autoMarkEnabled = false;
let autoMarkObserver = null;
let sectionEnterTimes = new Map(); // key: 'bookId-chapter-section' → timestamp
const AUTO_MARK_MIN_SECONDS = 10; // absolute minimum time before auto-marking
const AUTO_MARK_WPM = 200; // words per minute threshold (conservative for dyslexic readers)

function initAutoMark() {
    autoMarkEnabled = localStorage.getItem('autoMarkRead') === 'true';
    const toggle = document.getElementById('auto-mark-toggle');
    if (toggle) toggle.checked = autoMarkEnabled;
}

function setAutoMarkRead(enabled) {
    autoMarkEnabled = enabled;
    localStorage.setItem('autoMarkRead', enabled ? 'true' : 'false');
    if (enabled) {
        setupAutoMarkObserver();
    } else {
        teardownAutoMarkObserver();
    }
}

function setupAutoMarkObserver() {
    teardownAutoMarkObserver();
    if (!autoMarkEnabled) return;

    sectionEnterTimes.clear();

    // Observe reading sections (fluid mode) and read-marker elements
    autoMarkObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;
            const key = sectionKeyFromElement(el);
            if (!key) return;

            if (entry.isIntersecting) {
                // Section entered viewport — start timing
                if (!sectionEnterTimes.has(key)) {
                    sectionEnterTimes.set(key, Date.now());
                }
            } else {
                // Section left viewport — check if it scrolled UP (was read)
                if (entry.boundingClientRect.bottom < 0 && sectionEnterTimes.has(key)) {
                    checkAndAutoMark(el, key);
                }
            }
        });
    }, { threshold: 0 });

    // Observe all current reading sections
    observeReadingSections();
}

function teardownAutoMarkObserver() {
    if (autoMarkObserver) {
        autoMarkObserver.disconnect();
        autoMarkObserver = null;
    }
    sectionEnterTimes.clear();
}

function observeReadingSections() {
    if (!autoMarkObserver) return;

    // Both fluid and verse mode now mark at chapter level via the mark-all
    // button, so auto-mark observes that single marker per chapter.
    document.querySelectorAll('.read-marker[data-mark-all]').forEach(el => {
        autoMarkObserver.observe(el);
    });
}

function sectionKeyFromElement(el) {
    // Reading section (fluid mode): find parent chapter-section for book/chapter
    if (el.classList.contains('reading-section')) {
        const chapterSection = el.closest('.chapter-section');
        const bookId = chapterSection ? chapterSection.dataset.book : currentBook;
        const chapter = chapterSection ? parseInt(chapterSection.dataset.chapter) : currentChapter;
        // Get section index from the mark button inside
        const marker = el.querySelector('.read-marker');
        const sectionIndex = marker ? parseInt(marker.dataset.section) : 0;
        return `${bookId}-${chapter}-${sectionIndex}`;
    }

    // Read marker (verse mode)
    if (el.classList.contains('read-marker')) {
        const bookId = el.dataset.book || currentBook;
        const chapter = parseInt(el.dataset.chapter || currentChapter);
        if (el.dataset.markAll) {
            return `${bookId}-${chapter}-all`;
        }
        const section = parseInt(el.dataset.section || 0);
        return `${bookId}-${chapter}-${section}`;
    }

    return null;
}

function checkAndAutoMark(el, key) {
    const enterTime = sectionEnterTimes.get(key);
    if (!enterTime) return;

    const elapsed = (Date.now() - enterTime) / 1000; // seconds

    // Calculate minimum read time based on word count
    const wordCount = estimateWordCount(el);
    const minTime = Math.max(AUTO_MARK_MIN_SECONDS, (wordCount / AUTO_MARK_WPM) * 60);

    if (elapsed < minTime) {
        // Not enough time — user was skimming/scrolling, don't auto-mark
        sectionEnterTimes.delete(key);
        return;
    }

    sectionEnterTimes.delete(key);

    // Extract book/chapter/section from key and auto-mark
    if (el.classList.contains('reading-section')) {
        const marker = el.querySelector('.read-marker');
        if (marker && !marker.classList.contains('read')) {
            const bookId = marker.dataset.book;
            const chapter = parseInt(marker.dataset.chapter);
            const section = parseInt(marker.dataset.section);
            const total = parseInt(marker.dataset.total || 1);
            autoMarkSection(bookId, chapter, section, total);
        }
    } else if (el.classList.contains('read-marker')) {
        if (el.dataset.markAll) {
            // Verse mode: mark all sections in chapter
            if (getChapterStatus(el.dataset.book, parseInt(el.dataset.chapter)) !== 'complete') {
                const bookId = el.dataset.book;
                const chapter = parseInt(el.dataset.chapter);
                const total = parseInt(el.dataset.total || 1);
                markAllSectionsRead(bookId, chapter, total);
            }
        } else if (!el.classList.contains('read')) {
            const bookId = el.dataset.book;
            const chapter = parseInt(el.dataset.chapter);
            const section = parseInt(el.dataset.section);
            const total = parseInt(el.dataset.total || 1);
            autoMarkSection(bookId, chapter, section, total);
        }
    }
}

function autoMarkSection(bookId, chapter, sectionIndex, totalSections) {
    if (getSectionStatus(bookId, chapter, sectionIndex) === 'read') return;

    markSectionInMemory(bookId, chapter, sectionIndex, totalSections);
    updateMarkButtonInDOM(bookId, chapter, sectionIndex);
    updateChapterStatusInNav(bookId, chapter);

    // Persist
    if (currentUser && supabase) {
        saveReadingMarkToSupabase(bookId, chapter, sectionIndex, totalSections);
    } else {
        saveReadingHistoryToLocalStorage();
    }
}

function estimateWordCount(el) {
    const text = el.textContent || '';
    return text.split(/\s+/).filter(w => w.length > 0).length;
}

// ─── HTML renderers (called from verse-renderer.js) ───────────────────────────

function renderMarkButton(bookId, chapter, sectionIndex, totalSections) {
    const isRead = getSectionStatus(bookId, chapter, sectionIndex) === 'read';
    return `<div class="read-marker${isRead ? ' read' : ''}"
                 data-book="${bookId}"
                 data-chapter="${chapter}"
                 data-section="${sectionIndex}"
                 data-total="${totalSections}"
                 onclick="toggleSectionRead('${bookId}', ${chapter}, ${sectionIndex}, ${totalSections})">
                <i class="ph ${isRead ? 'ph-check-circle' : 'ph-circle'}"></i>
                <span>${isRead ? 'Read' : 'Mark as read'}</span>
            </div>`;
}

function renderMarkAllButton(bookId, chapter, totalSections) {
    const status = getChapterStatus(bookId, chapter);
    const isRead = status === 'complete';
    const isPartial = status === 'partial';
    const icon = isRead ? 'ph-check-circle' : isPartial ? 'ph-circle-half' : 'ph-circle';
    const stateClass = isRead ? ' read' : isPartial ? ' partial' : '';
    return `<div class="read-marker${stateClass}"
                 data-book="${bookId}"
                 data-chapter="${chapter}"
                 data-mark-all="true"
                 data-total="${totalSections}"
                 onclick="markAllSectionsRead('${bookId}', ${chapter}, ${totalSections})">
                <i class="ph ${icon}"></i>
                <span>${isRead ? 'Read' : 'Mark as read'}</span>
            </div>`;
}
