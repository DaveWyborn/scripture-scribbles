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
        await supabase.from('reading_history').upsert({
            user_id: currentUser.id,
            book_id: bookId,
            chapter,
            section_index: sectionIndex,
            total_sections: totalSections,
            version: 'web',
            read_at: new Date().toISOString()
        }, { onConflict: 'user_id,book_id,chapter,section_index,version' });
    } catch (e) {
        console.error('Failed to save reading mark to Supabase', e);
    }
}

async function deleteReadingMarkFromSupabase(bookId, chapter, sectionIndex) {
    if (!supabase || !currentUser) return;
    try {
        await supabase.from('reading_history')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('book_id', bookId)
            .eq('chapter', chapter)
            .eq('section_index', sectionIndex);
    } catch (e) {
        console.error('Failed to delete reading mark from Supabase', e);
    }
}

// Called on login — silently merges any guest marks into Supabase, then reloads
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
                        version: 'web',
                        read_at: new Date().toISOString()
                    });
                });
            });
        });
        if (records.length > 0) {
            await supabase.from('reading_history').upsert(records, {
                onConflict: 'user_id,book_id,chapter,section_index,version'
            });
        }
        localStorage.removeItem(READING_HISTORY_KEY);
        await loadReadingHistoryFromSupabase();
    } catch (e) {
        console.error('Failed to merge guest reading history', e);
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

// ─── HTML renderers (called from verse-renderer.js) ───────────────────────────

function renderMarkButton(bookId, chapter, sectionIndex, totalSections) {
    const isRead = getSectionStatus(bookId, chapter, sectionIndex) === 'read';
    return `<div class="read-marker${isRead ? ' read' : ''}"
                 data-book="${bookId}"
                 data-chapter="${chapter}"
                 data-section="${sectionIndex}"
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
                 onclick="markAllSectionsRead('${bookId}', ${chapter}, ${totalSections})">
                <i class="ph ${icon}"></i>
                <span>${isRead ? 'Read' : 'Mark as read'}</span>
            </div>`;
}
