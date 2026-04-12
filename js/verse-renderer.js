// Verse renderer module - Supports both verse-by-verse and fluid reading modes

function saveLastPosition() {
    localStorage.setItem('lastPosition', JSON.stringify({ book: currentBook, chapter: currentChapter, passageIndex: currentPassageIndex }));
}

function loadLastPosition() {
    try {
        const saved = localStorage.getItem('lastPosition');
        if (saved) {
            const { book, chapter, passageIndex } = JSON.parse(saved);
            if (book) currentBook = book;
            if (chapter != null) currentChapter = chapter;
            if (passageIndex != null) currentPassageIndex = passageIndex;
        }
    } catch (e) {}
}

// ─── Continuous Scroll ──────────────────────────────────────────────────────

/**
 * Get the next chapter/book after a given position.
 * Returns {bookId, bookName, chapter, bookObj, chapterObj} or null if at end of Bible.
 */
function getNextChapterInfo(bookId, chapterNum) {
    const book = bibleData.books.find(b => b.id === bookId);
    if (!book) return null;

    // Next chapter in same book
    const nextChapter = book.chapters.find(c => c.number === chapterNum + 1);
    if (nextChapter) {
        return { bookId, bookName: book.name, chapter: chapterNum + 1, bookObj: book, chapterObj: nextChapter };
    }

    // First chapter of next book
    const bookIndex = bibleData.books.indexOf(book);
    if (bookIndex < bibleData.books.length - 1) {
        const nextBook = bibleData.books[bookIndex + 1];
        const firstChapter = nextBook.chapters.find(c => c.number === 1);
        if (firstChapter) {
            return { bookId: nextBook.id, bookName: nextBook.name, chapter: 1, bookObj: nextBook, chapterObj: firstChapter };
        }
    }

    return null; // End of Bible
}

/**
 * Load annotations for a specific book+chapter combo.
 * Caches results to avoid duplicate fetches.
 */
async function loadAnnotationsForChapter(bookId, chapterNum) {
    const cacheKey = `${bookId}-${chapterNum}`;
    if (annotationCache[cacheKey] !== undefined) return annotationCache[cacheKey];

    if (!currentUser) {
        annotationCache[cacheKey] = {};
        return {};
    }

    try {
        const { data, error } = await supabase
            .from('annotations')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('bible_version', 'WEB')
            .eq('annotation_set', currentAnnotationSet)
            .eq('book_id', cacheKey)
            .maybeSingle();

        if (error) console.warn('Annotation load error:', error.code, error.message);
        const annotations = data ? data.data : {};
        annotationCache[cacheKey] = annotations;
        return annotations;
    } catch (e) {
        console.error('Error loading annotations for', cacheKey, e);
        annotationCache[cacheKey] = {};
        return {};
    }
}

/**
 * Render a chapter section's HTML for appending (fluid or verse mode).
 * Temporarily swaps globals so existing render functions work unchanged.
 */
function renderChapterSection(bookId, chapterNum, bookObj, chapterObj, annotations) {
    // Save globals
    const savedBook = currentBook;
    const savedChapter = currentChapter;
    const savedAnnotations = currentAnnotations;

    // Swap to target chapter
    currentBook = bookId;
    currentChapter = chapterNum;
    currentAnnotations = annotations;

    let innerHtml = '';

    // Chapter divider + title
    innerHtml += `<div class="chapter-divider"></div>`;
    innerHtml += `<div class="chapter-title">${bookObj.name} ${chapterNum}</div>`;

    if (readingMode === 'fluid') {
        innerHtml += renderFluidMode(chapterObj, bookObj);
    } else {
        innerHtml += renderVerseMode(chapterObj, bookObj);
        if (typeof renderMarkAllButton === 'function') {
            const sections = buildReadingSections(chapterObj.verses);
            innerHtml += renderMarkAllButton(bookId, chapterNum, sections.length);
        }
    }

    // Restore globals
    currentBook = savedBook;
    currentChapter = savedChapter;
    currentAnnotations = savedAnnotations;

    return `<div class="chapter-section" data-book="${bookId}" data-chapter="${chapterNum}">${innerHtml}</div>`;
}

/**
 * Append the next chapter to the scrollable content area.
 */
async function appendNextChapter() {
    if (isAppendingChapter || readingMode === 'passage') return;

    // Find what comes after the last loaded section
    const lastSection = loadedChapterSections[loadedChapterSections.length - 1];
    if (!lastSection) return;

    const next = getNextChapterInfo(lastSection.bookId, lastSection.chapter);
    if (!next) return; // End of Bible

    isAppendingChapter = true;

    try {
        const annotations = await loadAnnotationsForChapter(next.bookId, next.chapter);
        const html = renderChapterSection(next.bookId, next.chapter, next.bookObj, next.chapterObj, annotations);

        // Find the bottom-nav and insert before it
        const contentEl = document.getElementById('content');
        const bibleWrapper = document.getElementById('bible-content-wrapper');
        const target = bibleWrapper || contentEl;
        const bottomNav = target.querySelector('.bottom-nav');

        if (bottomNav) {
            bottomNav.insertAdjacentHTML('beforebegin', html);
        } else {
            target.insertAdjacentHTML('beforeend', html);
        }

        loadedChapterSections.push({ bookId: next.bookId, chapter: next.chapter });

        // Attach verse click handlers for the new section
        const newSection = target.querySelector(`.chapter-section[data-book="${next.bookId}"][data-chapter="${next.chapter}"]`);
        if (newSection) {
            attachVerseHandlers(newSection);
            observeChapterSection(newSection);
        }

        // Apply auto-contrast to new highlights
        setTimeout(applyAutoContrast, 50);
    } catch (e) {
        console.error('Error appending next chapter:', e);
    } finally {
        isAppendingChapter = false;
    }
}

/**
 * Attach click handlers to verses within a chapter section.
 * Works for both fluid and verse reading modes.
 */
function attachVerseHandlers(sectionEl) {
    const bookId = sectionEl.dataset.book || currentBook;
    const chapterNum = parseInt(sectionEl.dataset.chapter) || currentChapter;

    if (readingMode === 'verse') {
        sectionEl.querySelectorAll('.verse').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' ||
                    e.target.tagName === 'TEXTAREA' || e.target.closest('.inline-menu') ||
                    e.target.closest('.annotation-panel')) return;

                // Switch context to this chapter
                switchChapterContext(bookId, chapterNum);

                const verseNum = parseInt(el.dataset.verse);
                if (e.shiftKey && typeof toggleVerseSelection === 'function') {
                    e.preventDefault();
                    toggleVerseSelection(verseNum);
                    return;
                }

                document.querySelectorAll('.verse').forEach(v => v.classList.remove('selected'));
                if (selectedVerse !== verseNum) {
                    selectedVerse = verseNum;
                    el.classList.add('selected');
                } else {
                    selectedVerse = null;
                }
            });
        });
    } else {
        sectionEl.querySelectorAll('.verse-inline-wrapper').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' ||
                    e.target.tagName === 'TEXTAREA' || e.target.tagName === 'I' ||
                    e.target.closest('.inline-menu')) return;

                // Switch context to this chapter
                switchChapterContext(bookId, chapterNum);

                const verseNum = parseInt(el.dataset.verse);
                if (e.shiftKey && typeof toggleVerseSelection === 'function') {
                    e.preventDefault();
                    toggleVerseSelection(verseNum);
                    return;
                }

                document.querySelectorAll('.verse-inline-wrapper').forEach(v => v.classList.remove('selected'));
                if (selectedVerse === verseNum) {
                    selectedVerse = null;
                } else {
                    selectedVerse = verseNum;
                    el.classList.add('selected');
                }
            });
        });

        sectionEl.querySelectorAll('.indicator-icon-inline').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                switchChapterContext(bookId, chapterNum);
                const verseNum = parseInt(el.dataset.verse);
                const wrapper = el.closest('.verse-inline-wrapper');
                document.querySelectorAll('.verse-inline-wrapper').forEach(v => v.classList.remove('selected'));
                if (wrapper) {
                    wrapper.classList.add('selected');
                    selectedVerse = verseNum;
                    setTimeout(() => toggleSubmenu(verseNum, 'note'), 50);
                }
            });
        });
    }
}

/**
 * Switch the global annotation context to a specific chapter.
 * Called when user interacts with a verse in an appended chapter.
 */
function switchChapterContext(bookId, chapterNum) {
    if (currentBook === bookId && currentChapter === chapterNum) return;

    // Cache current annotations before switching
    const currentKey = `${currentBook}-${currentChapter}`;
    annotationCache[currentKey] = currentAnnotations;

    // Switch
    currentBook = bookId;
    currentChapter = chapterNum;
    currentAnnotations = annotationCache[`${bookId}-${chapterNum}`] || {};

    saveLastPosition();

    // Update toolbar
    const book = bibleData.books.find(b => b.id === bookId);
    if (book) {
        document.getElementById('chapter-info').textContent = `${book.name} ${chapterNum}`;
    }
}

/**
 * Set up IntersectionObserver on a chapter section for visibility tracking.
 */
function observeChapterSection(sectionEl) {
    if (!chapterVisibilityObserver) return;
    chapterVisibilityObserver.observe(sectionEl);
}

/**
 * Set up the continuous scroll system: bottom sentinel + chapter visibility observer.
 */
function setupContinuousScroll() {
    // Clean up previous observers
    if (continuousScrollObserver) continuousScrollObserver.disconnect();
    if (chapterVisibilityObserver) chapterVisibilityObserver.disconnect();

    if (readingMode === 'passage') return;

    // Chapter visibility observer — updates toolbar as user scrolls between chapters
    chapterVisibilityObserver = new IntersectionObserver((entries) => {
        // Find the topmost visible chapter section
        let topVisible = null;
        let topY = Infinity;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const rect = entry.boundingClientRect;
                if (rect.top < topY) {
                    topY = rect.top;
                    topVisible = entry.target;
                }
            }
        });

        if (topVisible) {
            const bookId = topVisible.dataset.book;
            const chapterNum = parseInt(topVisible.dataset.chapter);
            if (bookId && chapterNum) {
                // Update toolbar without triggering full context switch
                const book = bibleData.books.find(b => b.id === bookId);
                if (book) {
                    document.getElementById('chapter-info').textContent = `${book.name} ${chapterNum}`;
                }
                // Update position for save
                if (currentBook !== bookId || currentChapter !== chapterNum) {
                    const currentKey = `${currentBook}-${currentChapter}`;
                    annotationCache[currentKey] = currentAnnotations;
                    currentBook = bookId;
                    currentChapter = chapterNum;
                    currentAnnotations = annotationCache[`${bookId}-${chapterNum}`] || {};
                    saveLastPosition();
                }
            }
        }
    }, { threshold: 0, rootMargin: '-20% 0px -60% 0px' });

    // Bottom sentinel observer — auto-loads next chapter when near bottom
    continuousScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                appendNextChapter();
            }
        });
    }, { rootMargin: '0px 0px 600px 0px' }); // trigger 600px before reaching bottom

    // Add sentinel element
    const contentEl = document.getElementById('content');
    const bibleWrapper = document.getElementById('bible-content-wrapper');
    const target = bibleWrapper || contentEl;

    let sentinel = target.querySelector('.scroll-sentinel');
    if (!sentinel) {
        sentinel = document.createElement('div');
        sentinel.className = 'scroll-sentinel';
        sentinel.style.height = '1px';
        const bottomNav = target.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.insertAdjacentElement('beforebegin', sentinel);
        } else {
            target.appendChild(sentinel);
        }
    }
    continuousScrollObserver.observe(sentinel);

    // Observe the initial chapter section
    const initialSection = target.querySelector('.chapter-section');
    if (initialSection) {
        chapterVisibilityObserver.observe(initialSection);
    }
}

/**
 * Reset continuous scroll state (called when navigating manually).
 */
function resetContinuousScroll() {
    if (continuousScrollObserver) continuousScrollObserver.disconnect();
    if (chapterVisibilityObserver) chapterVisibilityObserver.disconnect();
    loadedChapterSections = [];
    annotationCache = {};
    isAppendingChapter = false;
}

/**
 * Render the chapter title with an optional section outline button
 */
function renderChapterTitleWithOutline(bookName, chapterNum, headings, showOutline) {
    let html = `<div class="chapter-title-row">`;
    html += `<div class="chapter-title">${bookName} ${chapterNum}</div>`;
    if (showOutline) {
        html += `<button class="scroll-nav-btn" onclick="toggleScrollNav()" aria-label="Section outline" title="Jump to section">`;
        html += `<i class="ph ph-list-bullets"></i>`;
        html += `</button>`;
        html += `<div class="scroll-nav-dropdown" id="scroll-nav-dropdown">`;
        headings.forEach((h, i) => {
            html += `<button class="scroll-nav-item" onclick="scrollToSection(${i}, ${h.verse})" data-heading-index="${i}" data-verse="${h.verse}">${h.heading}</button>`;
        });
        html += `</div>`;
    }
    html += `</div>`;
    return html;
}

/**
 * Toggle the scroll navigation dropdown
 */
function toggleScrollNav() {
    const dropdown = document.getElementById('scroll-nav-dropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('open');

    // Close on outside click
    if (dropdown.classList.contains('open')) {
        setTimeout(() => {
            const close = (e) => {
                if (!e.target.closest('.scroll-nav-dropdown') && !e.target.closest('.scroll-nav-btn')) {
                    dropdown.classList.remove('open');
                    document.removeEventListener('click', close);
                }
            };
            document.addEventListener('click', close);
        }, 0);
    }
}

/**
 * Scroll to a section heading or jump to its passage chunk
 */
function scrollToSection(headingIndex, verseNum) {
    const dropdown = document.getElementById('scroll-nav-dropdown');
    if (dropdown) dropdown.classList.remove('open');

    if (readingMode === 'passage') {
        // Find the chunk containing this verse
        for (let i = 0; i < passageChunks.length; i++) {
            const chunk = passageChunks[i];
            if (chunk.verses.some(v => v.number === verseNum)) {
                currentPassageIndex = i;
                saveLastPosition();
                displayChapter();
                window.scrollTo(0, 0);
                return;
            }
        }
    } else {
        // Fluid mode: scroll to the section heading element
        const headings = document.querySelectorAll('.section-heading, .hebrew-heading');
        if (headings[headingIndex]) {
            headings[headingIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

/**
 * Render a paragraph in fluid reading mode
 */
function renderParagraph(verses, bookNum, chapterNum) {
    let html = '<p class="paragraph">';

    console.log('renderParagraph called with verses:', verses.map(v => v.number));

    verses.forEach(verse => {
        console.log(`  Rendering verse ${verse.number}`);
        const annotation = currentAnnotations[verse.number] || {};
        const verseNumClass = verseNumberStyle === 'hidden' ? 'verse-number hidden' :
                               verseNumberStyle === 'margin' ? 'verse-number margin' :
                               'verse-number superscript';

        const verseNum = `<span class="${verseNumClass}">${verse.number}</span>`;

        let verseText = verse.text;

        // Wrap in highlight if annotated
        if (annotation.highlight) {
            verseText = `<span class="highlighted-text highlight-${annotation.highlight}" data-verse="${verse.number}">${verseText}</span>`;
        } else {
            verseText = `<span class="verse-text-inline" data-verse="${verse.number}">${verseText}</span>`;
        }

        html += `<div class="verse-inline-wrapper" data-verse="${verse.number}">`;
        html += `<span class="verse-inline">${verseNum}${verseText}`;

        // Add indicators
        const hasNote = annotation.note && annotation.note.trim();
        const hasTags = annotation.tags && annotation.tags.length > 0;

        // Dagger (†) reserved for Bible translation footnotes only
        // User notes shown via note icon below

        if (hasTags) {
            html += '<span class="verse-tags-inline">';
            annotation.tags.forEach(tag => {
                const tagName = typeof tag === 'string' ? tag : tag.name;
                const tagColor = typeof tag === 'object' ? tag.color : (knownTags[tagName.toLowerCase()] || '#ACE5CB');
                html += `<span class="tag-chip-inline" style="background: ${tagColor}">${tagName}</span>`;
            });
            html += '</span>';
        }

        html += ' </span>';

        // Add note icon for user notes (opens inline menu)
        if (hasNote) {
            html += `<i class="ph ph-note-pencil indicator-icon-inline" style="color: var(--accent-info); margin-left: 4px; font-size: 0.9em; cursor: pointer;" data-verse="${verse.number}"></i>`;
        }

        // Add inline menu (same as verse-by-verse mode)
        console.log(`  Adding inline menu for verse ${verse.number}`);
        html += `
            <div class="inline-menu">
                <div class="menu-buttons">
                    <button class="menu-btn" data-menu="highlight" onclick="toggleSubmenu(${verse.number}, 'highlight')">
                        <i class="ph ph-highlighter-circle"></i> Highlight
                    </button>
                    <button class="menu-btn" data-menu="note" onclick="toggleSubmenu(${verse.number}, 'note')">
                        <i class="ph ph-note-pencil"></i> Note
                    </button>
                    <button class="menu-btn" data-menu="tag" onclick="toggleSubmenu(${verse.number}, 'tag')">
                        <i class="ph ph-tag"></i> Tag
                    </button>
                    <button class="menu-btn" onclick="copyVerse(${verse.number})">
                        <i class="ph ph-copy"></i> Copy
                    </button>
                    ${(typeof sermonViewMode !== 'undefined' && (sermonViewMode === 'split' || activeView === 'notes')) ? `
                    <button class="menu-btn" onclick="insertVerseReference(${verse.number})" title="Add to sermon notes">
                        <i class="ph ph-arrow-right"></i> Add to Notes
                    </button>
                    ` : ''}
                </div>

                <!-- Highlight submenu -->
                <div class="submenu" id="submenu-highlight-${verse.number}">
                    <div class="submenu-title">Highlight</div>
                    <div class="highlight-grid">
                        <button class="highlight-btn ${annotation.highlight === 'yellow' ? 'selected' : ''}" style="background: var(--highlight-yellow)" onclick="setHighlight(${verse.number}, 'yellow')">H1</button>
                        <button class="highlight-btn ${annotation.highlight === 'green' ? 'selected' : ''}" style="background: var(--highlight-green)" onclick="setHighlight(${verse.number}, 'green')">H2</button>
                        <button class="highlight-btn ${annotation.highlight === 'blue' ? 'selected' : ''}" style="background: var(--highlight-blue)" onclick="setHighlight(${verse.number}, 'blue')">H3</button>
                        <button class="highlight-btn ${annotation.highlight === 'pink' ? 'selected' : ''}" style="background: var(--highlight-pink)" onclick="setHighlight(${verse.number}, 'pink')">H4</button>
                        <button class="highlight-btn ${annotation.highlight === 'purple' ? 'selected' : ''}" style="background: var(--highlight-purple)" onclick="setHighlight(${verse.number}, 'purple')">H5</button>
                        <button class="highlight-btn ${annotation.highlight === 'orange' ? 'selected' : ''}" style="background: var(--highlight-orange)" onclick="setHighlight(${verse.number}, 'orange')">H6</button>
                        <button class="highlight-btn clear" onclick="setHighlight(${verse.number}, null)">X</button>
                    </div>
                    <div class="submenu-title">Underline</div>
                    <div class="underline-grid">
                        <button class="underline-btn ${annotation.underline === 'yellow' ? 'selected' : ''}" style="--underline-color: var(--highlight-yellow)" onclick="setUnderline(${verse.number}, 'yellow')">U1</button>
                        <button class="underline-btn ${annotation.underline === 'green' ? 'selected' : ''}" style="--underline-color: var(--highlight-green)" onclick="setUnderline(${verse.number}, 'green')">U2</button>
                        <button class="underline-btn ${annotation.underline === 'blue' ? 'selected' : ''}" style="--underline-color: var(--highlight-blue)" onclick="setUnderline(${verse.number}, 'blue')">U3</button>
                        <button class="underline-btn ${annotation.underline === 'pink' ? 'selected' : ''}" style="--underline-color: var(--highlight-pink)" onclick="setUnderline(${verse.number}, 'pink')">U4</button>
                        <button class="underline-btn ${annotation.underline === 'purple' ? 'selected' : ''}" style="--underline-color: var(--highlight-purple)" onclick="setUnderline(${verse.number}, 'purple')">U5</button>
                        <button class="underline-btn ${annotation.underline === 'orange' ? 'selected' : ''}" style="--underline-color: var(--highlight-orange)" onclick="setUnderline(${verse.number}, 'orange')">U6</button>
                        <button class="underline-btn clear" onclick="setUnderline(${verse.number}, null)">X</button>
                    </div>
                </div>

                <!-- Note submenu -->
                <div class="submenu" id="submenu-note-${verse.number}">
                    <textarea class="note-textarea" id="note-input-${verse.number}" placeholder="Add your thoughts... (Cmd+Enter to save)" onkeydown="handleNoteKeydown(event, ${verse.number})">${annotation.note || ''}</textarea>
                    <div class="note-actions">
                        <button class="note-delete" onclick="deleteNote(${verse.number})">Delete</button>
                        <button class="note-save" onclick="saveNote(${verse.number})">Save</button>
                    </div>
                </div>

                <!-- Tag submenu -->
                <div class="submenu" id="submenu-tag-${verse.number}">
                    <div class="tag-section">
                        <div class="tag-section-title">Active tags (tap to remove)</div>
                        <div class="active-tags" id="active-tags-${verse.number}">
                            ${hasTags ? annotation.tags.map(tag => {
                                const tagName = typeof tag === 'string' ? tag : tag.name;
                                const tagColor = typeof tag === 'object' ? tag.color : knownTags[tagName.toLowerCase()] || '#ACE5CB';
                                return `<span class="tag-item active" style="background: ${tagColor}" onclick="removeTag(${verse.number}, '${tagName}')">${tagName}</span>`;
                            }).join('') : '<span style="color: var(--text-tertiary); font-size: 0.8em;">No tags</span>'}
                        </div>
                    </div>
                    <div class="tag-section">
                        <div class="tag-section-title">Add existing tag</div>
                        <div class="existing-tags" id="existing-tags-${verse.number}">
                            ${Object.keys(knownTags).length > 0 ?
                                Object.entries(knownTags).map(([name, color]) => {
                                    const isActive = hasTags && annotation.tags.some(t => (typeof t === 'string' ? t : t.name).toLowerCase() === name.toLowerCase());
                                    if (isActive) return '';
                                    return `<span class="tag-item" style="background: ${color}" onclick="addExistingTag(${verse.number}, '${name}', '${color}')">${name}</span>`;
                                }).join('') || '<span style="color: var(--text-tertiary); font-size: 0.8em;">No saved tags</span>'
                            : '<span style="color: var(--text-tertiary); font-size: 0.8em;">No saved tags</span>'}
                        </div>
                    </div>
                    <div class="tag-section">
                        <div class="tag-section-title">New tag</div>
                        <div class="new-tag-row">
                            <input type="text" id="new-tag-input-${verse.number}" placeholder="Tag name...">
                            <div class="new-tag-color" id="new-tag-color-${verse.number}" style="background: #ACE5CB" onclick="event.stopPropagation(); showInlineColorPicker(${verse.number})"></div>
                            <button class="new-tag-add" onclick="addNewTag(${verse.number})">Add</button>
                        </div>
                    </div>
                    <div style="padding: 8px; font-size: 0.75em; color: var(--text-tertiary); text-align: center; border-top: 1px solid var(--border); margin-top: 8px;">
                        Edit colours or text: Settings > Manage Tags
                    </div>
                </div>
            </div>`;
        html += '</div>'; // Close verse-inline-wrapper
        console.log(`  Verse ${verse.number} HTML built, wrapper closed`);
    });

    html += '</p>';
    return html;
}

/**
 * Render poetry in fluid reading mode
 */
function renderPoetry(verses, bookNum, chapterNum) {
    let html = '<div class="poetry">';

    verses.forEach(verse => {
        const annotation = currentAnnotations[verse.number] || {};
        const poetryLevel = verse.type || 'poetry1';
        const verseNumClass = verseNumberStyle === 'hidden' ? 'verse-number hidden' :
                               verseNumberStyle === 'margin' ? 'verse-number margin' :
                               'verse-number superscript';

        const verseNum = `<span class="${verseNumClass}">${verse.number}</span>`;

        let verseText = verse.text;

        // Wrap in highlight if annotated
        if (annotation.highlight) {
            verseText = `<span class="highlighted-text highlight-${annotation.highlight}" data-verse="${verse.number}">${verseText}</span>`;
        } else {
            verseText = `<span class="verse-text-inline" data-verse="${verse.number}">${verseText}</span>`;
        }

        html += `<div class="verse-inline-wrapper poetry-line ${poetryLevel}" data-verse="${verse.number}"><span class="verse-inline">${verseNum}${verseText}`;

        // Add indicators
        const hasNote = annotation.note && annotation.note.trim();
        const hasTags = annotation.tags && annotation.tags.length > 0;

        // Dagger (†) reserved for Bible translation footnotes only
        // User notes shown via note icon below

        if (hasTags) {
            html += '<span class="verse-tags-inline">';
            annotation.tags.forEach(tag => {
                const tagName = typeof tag === 'string' ? tag : tag.name;
                const tagColor = typeof tag === 'object' ? tag.color : (knownTags[tagName.toLowerCase()] || '#ACE5CB');
                html += `<span class="tag-chip-inline" style="background: ${tagColor}">${tagName}</span>`;
            });
            html += '</span>';
        }

        html += '</span>'; // Close verse-inline

        // Add note icon for user notes (opens inline menu)
        if (hasNote) {
            html += `<i class="ph ph-note-pencil indicator-icon-inline" style="color: var(--accent-info); margin-left: 4px; font-size: 0.9em; cursor: pointer;" data-verse="${verse.number}"></i>`;
        }

        // TODO: Add inline menu for poetry (copy from paragraph renderer)

        html += '</div>'; // Close verse-inline-wrapper
    });

    html += '</div>';
    return html;
}

/**
 * Build natural paragraph chunks from chapter verses using USFM boundary markers
 */
function buildNaturalChunks(verses) {
    const chunks = [];
    let currentVerses = [];
    let pendingHeading = null;
    let currentIsPoetry = false;

    verses.forEach(verse => {
        const isPoetry = verse.type && verse.type.startsWith('poetry');
        const startsNewSentence = verse.text &&
            verse.text[0] === verse.text[0].toUpperCase() &&
            verse.text[0] !== verse.text[0].toLowerCase();

        if (verse.heading) {
            if (currentVerses.length > 0) {
                chunks.push({ verses: currentVerses, heading: pendingHeading });
                currentVerses = [];
                currentIsPoetry = false;
            }
            pendingHeading = verse.heading;
        }

        if (currentVerses.length > 0 && isPoetry !== currentIsPoetry) {
            chunks.push({ verses: currentVerses, heading: pendingHeading });
            currentVerses = [];
            pendingHeading = null;
        }

        if (!isPoetry && verse.type === 'paragraph' && currentVerses.length > 0 && startsNewSentence) {
            chunks.push({ verses: currentVerses, heading: pendingHeading });
            currentVerses = [];
            pendingHeading = null;
        }

        currentVerses.push(verse);
        currentIsPoetry = isPoetry;
    });

    if (currentVerses.length > 0) {
        chunks.push({ verses: currentVerses, heading: pendingHeading });
    }

    return chunks;
}

/**
 * Build passage chunks for a chapter.
 * Rules (in order):
 *   1. Merge small non-heading chunks backward into previous (min = 3)
 *   2. Merge first chunk forward if below min (can't go backward)
 *   3. Split chunks above maxSize (10) at paragraph boundaries, targeting ~targetSize (5)
 *   4. Orphan rule: last chunk below min → halve or absorb
 */
function buildPassageChunks(chapter, targetSize = 5, minSize = 3, maxSize = 10) {
    const natural = buildNaturalChunks(chapter.verses);

    // Pass 1: Merge small non-heading chunks backward
    const merged = [];
    for (const chunk of natural) {
        if (chunk.verses.length < minSize && !chunk.heading && merged.length > 0) {
            merged[merged.length - 1].verses.push(...chunk.verses);
        } else {
            merged.push({ verses: [...chunk.verses], heading: chunk.heading });
        }
    }

    // Pass 2: Merge first chunk forward if below min
    if (merged.length >= 2 && merged[0].verses.length < minSize) {
        merged[1].verses = [...merged[0].verses, ...merged[1].verses];
        if (!merged[1].heading) merged[1].heading = merged[0].heading;
        merged.shift();
    }

    // Pass 3: Split chunks above maxSize at paragraph boundaries
    const split = [];
    for (const chunk of merged) {
        if (chunk.verses.length <= maxSize) {
            split.push(chunk);
            continue;
        }
        let remaining = chunk.verses;
        let isFirst = true;
        while (remaining.length > maxSize) {
            // Scan for a paragraph boundary between minSize and maxSize, prefer near targetSize
            let splitAt = Math.min(targetSize, remaining.length - minSize);
            for (let i = minSize; i <= Math.min(maxSize - 1, remaining.length - minSize); i++) {
                const v = remaining[i];
                const text = v.text || '';
                const startsNew = text && text[0] === text[0].toUpperCase() && text[0] !== text[0].toLowerCase();
                if (v.type === 'paragraph' && startsNew) {
                    splitAt = i;
                    if (i >= targetSize) break;
                }
            }
            split.push({ verses: remaining.slice(0, splitAt), heading: isFirst ? chunk.heading : null });
            remaining = remaining.slice(splitAt);
            isFirst = false;
        }
        split.push({ verses: remaining, heading: isFirst ? chunk.heading : null });
    }

    // Pass 4: Orphan rule — last chunk below min → halve or absorb
    if (split.length >= 2) {
        const last = split[split.length - 1];
        const prev = split[split.length - 2];
        if (last.verses.length < minSize) {
            const all = [...prev.verses, ...last.verses];
            const half = Math.ceil(all.length / 2);
            if (half >= minSize && (all.length - half) >= minSize) {
                split[split.length - 2] = { verses: all.slice(0, half), heading: prev.heading };
                split[split.length - 1] = { verses: all.slice(half), heading: null };
            } else {
                prev.verses.push(...last.verses);
                split.pop();
            }
        }
    }

    return split;
}

/**
 * Split verses into heading-delimited sections for read tracking.
 * Each new heading starts a new section. Chapters with no headings = one section.
 */
function buildReadingSections(verses) {
    const sections = [];
    let current = null;
    verses.forEach(verse => {
        if (current === null) {
            current = { heading: verse.heading || null, verses: [] };
        } else if (verse.heading) {
            sections.push(current);
            current = { heading: verse.heading, verses: [] };
        }
        current.verses.push(verse);
    });
    if (current && current.verses.length > 0) sections.push(current);
    return sections;
}

/**
 * Render verse content (paragraphs + poetry) without section headings or mark buttons.
 * Called by renderFluidMode (per section) and renderPassageMode.
 */
function renderFluidModeContent(verses, bookNum, chapterNum) {
    let html = '';
    let currentParagraph = [];
    let currentPoetry = [];

    verses.forEach(verse => {
        if (verse.type && verse.type.startsWith('poetry')) {
            if (currentParagraph.length > 0) {
                html += renderParagraph(currentParagraph, bookNum, chapterNum);
                currentParagraph = [];
            }
            currentPoetry.push(verse);
        } else {
            if (currentPoetry.length > 0) {
                html += renderPoetry(currentPoetry, bookNum, chapterNum);
                currentPoetry = [];
            }
            const startsNewSentence = verse.text &&
                verse.text[0] === verse.text[0].toUpperCase() &&
                verse.text[0] !== verse.text[0].toLowerCase();
            if (verse.type === 'paragraph' && currentParagraph.length > 0 && startsNewSentence) {
                html += renderParagraph(currentParagraph, bookNum, chapterNum);
                currentParagraph = [];
            }
            currentParagraph.push(verse);
        }
    });

    if (currentParagraph.length > 0) html += renderParagraph(currentParagraph, bookNum, chapterNum);
    if (currentPoetry.length > 0) html += renderPoetry(currentPoetry, bookNum, chapterNum);

    return html;
}

/**
 * Render the current passage chunk in passage mode
 */
function renderPassageMode(chapter, book) {
    if (passageChunks.length === 0) {
        passageChunks = buildPassageChunks(chapter);
        currentPassageIndex = Math.max(0, Math.min(currentPassageIndex, passageChunks.length - 1));
    }

    const chunk = passageChunks[currentPassageIndex];

    let html = '';
    if (chunk.heading) {
        const isHebrewLetter = chunk.heading.length < 20 && chunk.heading === chunk.heading.toUpperCase();
        html += `<div class="${isHebrewLetter ? 'hebrew-heading' : 'section-heading'}">${chunk.heading}</div>`;
    }
    // Strip heading from first verse (already rendered above) before passing to content renderer
    const verses = chunk.verses.map((v, i) => i === 0 ? Object.assign({}, v, { heading: undefined }) : v);
    html += renderFluidModeContent(verses, book.number, chapter.number);

    if (typeof renderMarkButton === 'function') {
        html += renderMarkButton(currentBook, chapter.number, currentPassageIndex, passageChunks.length);
    }

    return html;
}

/**
 * Render chapter in fluid reading mode.
 * Splits into heading-delimited sections, each with a mark-as-read button.
 */
function renderFluidMode(chapter, book) {
    const sections = buildReadingSections(chapter.verses);
    let html = '';

    sections.forEach((section, sectionIndex) => {
        html += `<div class="reading-section">`;

        if (section.heading) {
            const isHebrewLetter = section.heading.length < 20 && section.heading === section.heading.toUpperCase();
            html += `<div class="${isHebrewLetter ? 'hebrew-heading' : 'section-heading'}">${section.heading}</div>`;
        }

        // Strip heading from first verse (already rendered above)
        const verses = section.verses.map((v, i) => i === 0 ? Object.assign({}, v, { heading: undefined }) : v);
        html += renderFluidModeContent(verses, book.number, chapter.number);

        if (typeof renderMarkButton === 'function') {
            html += renderMarkButton(currentBook, chapter.number, sectionIndex, sections.length);
        }

        html += '</div>';
    });

    return html;
}

/**
 * Render chapter in verse-by-verse mode (existing function)
 */
function renderVerseMode(chapter, book) {
    let html = '';

    chapter.verses.forEach(verse => {
        const annotation = currentAnnotations[verse.number] || {};
        const highlightClass = annotation.highlight ? `highlight-${annotation.highlight}` : '';
        const underlineClass = annotation.underline ? `underline-${annotation.underline}` : '';
        const selectedClass = selectedVerse === verse.number ? 'selected' : '';

        const hasNote = annotation.note && annotation.note.trim();
        const hasTags = annotation.tags && annotation.tags.length > 0;
        const hasAnnotations = hasNote || hasTags || annotation.highlight || annotation.underline;

        html += `
            <div class="verse ${highlightClass} ${underlineClass} ${selectedClass} ${hasAnnotations ? 'has-annotations' : ''}" data-verse="${verse.number}">
                <div class="verse-body">
                    <div class="verse-content">
                        <span class="verse-number">${verse.number}</span>
                        <div class="verse-text-wrapper">
                            <span class="verse-text">${verse.text}</span>
                        </div>
                    </div>
                </div>
        `;

        // Indicators below verse (outside highlight area)
        html += `<div class="verse-indicators">`;
        if (hasTags) {
            const tags = annotation.tags;
            const tagNames = tags.map(t => typeof t === 'string' ? t : t.name).join(', ');
            if (tags.length === 1) {
                const tag = tags[0];
                const tagColor = typeof tag === 'object' ? tag.color : (knownTags[tag.toLowerCase()] || '#ACE5CB');
                html += `<i class="ph-fill ph-tag indicator-icon" style="color: ${tagColor}" title="${tagNames}"></i>`;
            } else {
                html += `<i class="ph-fill ph-tags indicator-icon" style="color: var(--text-tertiary)" title="${tagNames}"></i>`;
            }
        }
        if (hasNote) {
            html += `<i class="ph ph-note-pencil indicator-icon" style="color: var(--accent-info)" title="Note"></i>`;
        }
        html += `</div>`;

        // Inline menu (shown when selected)
        html += `
            <div class="inline-menu">
                <div class="menu-buttons">
                    <button class="menu-btn" data-menu="highlight" onclick="toggleSubmenu(${verse.number}, 'highlight')">
                        <i class="ph ph-highlighter-circle"></i> Highlight
                    </button>
                    <button class="menu-btn" data-menu="note" onclick="toggleSubmenu(${verse.number}, 'note')">
                        <i class="ph ph-note-pencil"></i> Note
                    </button>
                    <button class="menu-btn" data-menu="tag" onclick="toggleSubmenu(${verse.number}, 'tag')">
                        <i class="ph ph-tag"></i> Tag
                    </button>
                    <button class="menu-btn" onclick="copyVerse(${verse.number})">
                        <i class="ph ph-copy"></i> Copy
                    </button>
                    ${(typeof sermonViewMode !== 'undefined' && (sermonViewMode === 'split' || activeView === 'notes')) ? `
                    <button class="menu-btn" onclick="insertVerseReference(${verse.number})" title="Add to sermon notes">
                        <i class="ph ph-arrow-right"></i> Add to Notes
                    </button>
                    ` : ''}
                </div>

                <!-- Highlight submenu -->
                <div class="submenu" id="submenu-highlight-${verse.number}">
                    <div class="submenu-title">Highlight</div>
                    <div class="highlight-grid">
                        <button class="highlight-btn ${annotation.highlight === 'yellow' ? 'selected' : ''}" style="background: var(--highlight-yellow)" onclick="setHighlight(${verse.number}, 'yellow')">H1</button>
                        <button class="highlight-btn ${annotation.highlight === 'green' ? 'selected' : ''}" style="background: var(--highlight-green)" onclick="setHighlight(${verse.number}, 'green')">H2</button>
                        <button class="highlight-btn ${annotation.highlight === 'blue' ? 'selected' : ''}" style="background: var(--highlight-blue)" onclick="setHighlight(${verse.number}, 'blue')">H3</button>
                        <button class="highlight-btn ${annotation.highlight === 'pink' ? 'selected' : ''}" style="background: var(--highlight-pink)" onclick="setHighlight(${verse.number}, 'pink')">H4</button>
                        <button class="highlight-btn ${annotation.highlight === 'purple' ? 'selected' : ''}" style="background: var(--highlight-purple)" onclick="setHighlight(${verse.number}, 'purple')">H5</button>
                        <button class="highlight-btn ${annotation.highlight === 'orange' ? 'selected' : ''}" style="background: var(--highlight-orange)" onclick="setHighlight(${verse.number}, 'orange')">H6</button>
                        <button class="highlight-btn clear" onclick="setHighlight(${verse.number}, null)">X</button>
                    </div>
                    <div class="submenu-title">Underline</div>
                    <div class="underline-grid">
                        <button class="underline-btn ${annotation.underline === 'yellow' ? 'selected' : ''}" style="--underline-color: var(--highlight-yellow)" onclick="setUnderline(${verse.number}, 'yellow')">U1</button>
                        <button class="underline-btn ${annotation.underline === 'green' ? 'selected' : ''}" style="--underline-color: var(--highlight-green)" onclick="setUnderline(${verse.number}, 'green')">U2</button>
                        <button class="underline-btn ${annotation.underline === 'blue' ? 'selected' : ''}" style="--underline-color: var(--highlight-blue)" onclick="setUnderline(${verse.number}, 'blue')">U3</button>
                        <button class="underline-btn ${annotation.underline === 'pink' ? 'selected' : ''}" style="--underline-color: var(--highlight-pink)" onclick="setUnderline(${verse.number}, 'pink')">U4</button>
                        <button class="underline-btn ${annotation.underline === 'purple' ? 'selected' : ''}" style="--underline-color: var(--highlight-purple)" onclick="setUnderline(${verse.number}, 'purple')">U5</button>
                        <button class="underline-btn ${annotation.underline === 'orange' ? 'selected' : ''}" style="--underline-color: var(--highlight-orange)" onclick="setUnderline(${verse.number}, 'orange')">U6</button>
                        <button class="underline-btn clear" onclick="setUnderline(${verse.number}, null)">X</button>
                    </div>
                </div>

                <!-- Note submenu -->
                <div class="submenu" id="submenu-note-${verse.number}">
                    <textarea class="note-textarea" id="note-input-${verse.number}" placeholder="Add your thoughts... (Cmd+Enter to save)" onkeydown="handleNoteKeydown(event, ${verse.number})">${annotation.note || ''}</textarea>
                    <div class="note-actions">
                        <button class="note-delete" onclick="deleteNote(${verse.number})">Delete</button>
                        <button class="note-save" onclick="saveNote(${verse.number})">Save</button>
                    </div>
                </div>

                <!-- Tag submenu -->
                <div class="submenu" id="submenu-tag-${verse.number}">
                    <div class="tag-section">
                        <div class="tag-section-title">Active tags (tap to remove)</div>
                        <div class="active-tags" id="active-tags-${verse.number}">
                            ${hasTags ? annotation.tags.map(tag => {
                                const tagName = typeof tag === 'string' ? tag : tag.name;
                                const tagColor = typeof tag === 'object' ? tag.color : knownTags[tagName.toLowerCase()] || '#ACE5CB';
                                return `<span class="tag-item active" style="background: ${tagColor}" onclick="removeTag(${verse.number}, '${tagName}')">${tagName}</span>`;
                            }).join('') : '<span style="color: var(--text-tertiary); font-size: 0.8em;">No tags</span>'}
                        </div>
                    </div>
                    <div class="tag-section">
                        <div class="tag-section-title">Add existing tag</div>
                        <div class="existing-tags" id="existing-tags-${verse.number}">
                            ${Object.keys(knownTags).length > 0 ?
                                Object.entries(knownTags).map(([name, color]) => {
                                    const isActive = hasTags && annotation.tags.some(t => (typeof t === 'string' ? t : t.name).toLowerCase() === name.toLowerCase());
                                    if (isActive) return '';
                                    return `<span class="tag-item" style="background: ${color}" onclick="addExistingTag(${verse.number}, '${name}', '${color}')">${name}</span>`;
                                }).join('') || '<span style="color: var(--text-tertiary); font-size: 0.8em;">No saved tags</span>'
                            : '<span style="color: var(--text-tertiary); font-size: 0.8em;">No saved tags</span>'}
                        </div>
                    </div>
                    <div class="tag-section">
                        <div class="tag-section-title">New tag</div>
                        <div class="new-tag-row">
                            <input type="text" id="new-tag-input-${verse.number}" placeholder="Tag name...">
                            <div class="new-tag-color" id="new-tag-color-${verse.number}" style="background: #ACE5CB" onclick="event.stopPropagation(); showInlineColorPicker(${verse.number})"></div>
                            <button class="new-tag-add" onclick="addNewTag(${verse.number})">Add</button>
                        </div>
                    </div>
                    <div style="padding: 8px; font-size: 0.75em; color: var(--text-tertiary); text-align: center; border-top: 1px solid var(--border); margin-top: 8px;">
                        Edit colours or text: Settings > Manage Tags
                    </div>
                </div>
            </div>
            </div>
        `;
    });

    return html;
}

// Display current chapter (main render function)
function displayChapter() {
    if (!bibleData || !bibleData.books) {
        console.error('Bible data not loaded!');
        return;
    }

    const book = bibleData.books.find(b => b.id === currentBook);
    if (!book) {
        console.error('Book not found:', currentBook);
        return;
    }

    const chapter = book.chapters.find(c => c.number === currentChapter);
    if (!chapter) {
        console.error('Chapter not found:', currentChapter);
        return;
    }

    const contentEl = document.getElementById('content');

    let html;

    // Build section headings list for scroll nav
    const sectionHeadings = chapter.verses
        .filter(v => v.heading)
        .map(v => ({ heading: v.heading, verse: v.number }));
    const hasOutline = sectionHeadings.length > 0 && readingMode !== 'verse';

    // Reset continuous scroll state for fresh render
    resetContinuousScroll();

    if (readingMode === 'passage') {
        if (passageChunks.length === 0) {
            passageChunks = buildPassageChunks(chapter);
            currentPassageIndex = Math.max(0, Math.min(currentPassageIndex, passageChunks.length - 1));
        }
        document.getElementById('chapter-info').textContent =
            `${book.name} ${currentChapter} · ${currentPassageIndex + 1}/${passageChunks.length}`;
        html = renderChapterTitleWithOutline(book.name, currentChapter, sectionHeadings, hasOutline);
        html += renderPassageMode(chapter, book);
    } else {
        document.getElementById('chapter-info').textContent = `${book.name} ${currentChapter}`;
        html = renderChapterTitleWithOutline(book.name, currentChapter, sectionHeadings, hasOutline);

        let chapterContent = '';
        if (readingMode === 'fluid') {
            chapterContent += renderFluidMode(chapter, book);
        } else {
            chapterContent += renderVerseMode(chapter, book);
            if (typeof renderMarkAllButton === 'function') {
                const sections = buildReadingSections(chapter.verses);
                chapterContent += renderMarkAllButton(currentBook, currentChapter, sections.length);
            }
        }

        // Wrap in chapter-section for continuous scroll tracking
        html += `<div class="chapter-section" data-book="${currentBook}" data-chapter="${currentChapter}">${chapterContent}</div>`;

        // Seed continuous scroll state
        annotationCache[`${currentBook}-${currentChapter}`] = currentAnnotations;
        loadedChapterSections = [{ bookId: currentBook, chapter: currentChapter }];
    }

    // OLD VERSE-BY-VERSE CODE BELOW - NOW HANDLED BY renderVerseMode()
    /*
    chapter.verses.forEach(verse => {
        const annotation = currentAnnotations[verse.number] || {};
        const highlightClass = annotation.highlight ? `highlight-${annotation.highlight}` : '';
        const underlineClass = annotation.underline ? `underline-${annotation.underline}` : '';
        const selectedClass = selectedVerse === verse.number ? 'selected' : '';

        const hasNote = annotation.note && annotation.note.trim();
        const hasTags = annotation.tags && annotation.tags.length > 0;
        const hasAnnotations = hasNote || hasTags || annotation.highlight || annotation.underline;

        html += `
            <div class="verse ${highlightClass} ${underlineClass} ${selectedClass} ${hasAnnotations ? 'has-annotations' : ''}" data-verse="${verse.number}">
                <div class="verse-body">
                    <div class="verse-content">
                        <span class="verse-number">${verse.number}</span>
                        <div class="verse-text-wrapper">
                            <span class="verse-text">${verse.text}</span>
                        </div>
                    </div>
                </div>
        `;

        // Indicators below verse (outside highlight area)
        html += `<div class="verse-indicators">`;
        if (hasTags) {
            const tags = annotation.tags;
            const tagNames = tags.map(t => typeof t === 'string' ? t : t.name).join(', ');
            if (tags.length === 1) {
                const tag = tags[0];
                const tagColor = typeof tag === 'object' ? tag.color : (knownTags[tag.toLowerCase()] || '#ACE5CB');
                html += `<i class="ph-fill ph-tag indicator-icon" style="color: ${tagColor}" title="${tagNames}"></i>`;
            } else {
                html += `<i class="ph-fill ph-tags indicator-icon" style="color: var(--text-tertiary)" title="${tagNames}"></i>`;
            }
        }
        if (hasNote) {
            html += `<i class="ph ph-note-pencil indicator-icon" style="color: var(--accent-info)" title="Note"></i>`;
        }
        html += `</div>`;

        // Inline menu (shown when selected)
        html += `
            <div class="inline-menu">
                <div class="menu-buttons">
                    <button class="menu-btn" data-menu="highlight" onclick="toggleSubmenu(${verse.number}, 'highlight')">
                        <i class="ph ph-highlighter-circle"></i> Highlight
                    </button>
                    <button class="menu-btn" data-menu="note" onclick="toggleSubmenu(${verse.number}, 'note')">
                        <i class="ph ph-note-pencil"></i> Note
                    </button>
                    <button class="menu-btn" data-menu="tag" onclick="toggleSubmenu(${verse.number}, 'tag')">
                        <i class="ph ph-tag"></i> Tag
                    </button>
                    <button class="menu-btn" onclick="copyVerse(${verse.number})">
                        <i class="ph ph-copy"></i> Copy
                    </button>
                    ${(typeof sermonViewMode !== 'undefined' && (sermonViewMode === 'split' || activeView === 'notes')) ? `
                    <button class="menu-btn" onclick="insertVerseReference(${verse.number})" title="Add to sermon notes">
                        <i class="ph ph-arrow-right"></i> Add to Notes
                    </button>
                    ` : ''}
                </div>

                <!-- Highlight submenu -->
                <div class="submenu" id="submenu-highlight-${verse.number}">
                    <div class="submenu-title">Highlight</div>
                    <div class="highlight-grid">
                        <button class="highlight-btn ${annotation.highlight === 'yellow' ? 'selected' : ''}" style="background: var(--highlight-yellow)" onclick="setHighlight(${verse.number}, 'yellow')">H1</button>
                        <button class="highlight-btn ${annotation.highlight === 'green' ? 'selected' : ''}" style="background: var(--highlight-green)" onclick="setHighlight(${verse.number}, 'green')">H2</button>
                        <button class="highlight-btn ${annotation.highlight === 'blue' ? 'selected' : ''}" style="background: var(--highlight-blue)" onclick="setHighlight(${verse.number}, 'blue')">H3</button>
                        <button class="highlight-btn ${annotation.highlight === 'pink' ? 'selected' : ''}" style="background: var(--highlight-pink)" onclick="setHighlight(${verse.number}, 'pink')">H4</button>
                        <button class="highlight-btn ${annotation.highlight === 'purple' ? 'selected' : ''}" style="background: var(--highlight-purple)" onclick="setHighlight(${verse.number}, 'purple')">H5</button>
                        <button class="highlight-btn ${annotation.highlight === 'orange' ? 'selected' : ''}" style="background: var(--highlight-orange)" onclick="setHighlight(${verse.number}, 'orange')">H6</button>
                        <button class="highlight-btn clear" onclick="setHighlight(${verse.number}, null)">X</button>
                    </div>
                    <div class="submenu-title">Underline</div>
                    <div class="underline-grid">
                        <button class="underline-btn ${annotation.underline === 'yellow' ? 'selected' : ''}" style="--underline-color: var(--highlight-yellow)" onclick="setUnderline(${verse.number}, 'yellow')">U1</button>
                        <button class="underline-btn ${annotation.underline === 'green' ? 'selected' : ''}" style="--underline-color: var(--highlight-green)" onclick="setUnderline(${verse.number}, 'green')">U2</button>
                        <button class="underline-btn ${annotation.underline === 'blue' ? 'selected' : ''}" style="--underline-color: var(--highlight-blue)" onclick="setUnderline(${verse.number}, 'blue')">U3</button>
                        <button class="underline-btn ${annotation.underline === 'pink' ? 'selected' : ''}" style="--underline-color: var(--highlight-pink)" onclick="setUnderline(${verse.number}, 'pink')">U4</button>
                        <button class="underline-btn ${annotation.underline === 'purple' ? 'selected' : ''}" style="--underline-color: var(--highlight-purple)" onclick="setUnderline(${verse.number}, 'purple')">U5</button>
                        <button class="underline-btn ${annotation.underline === 'orange' ? 'selected' : ''}" style="--underline-color: var(--highlight-orange)" onclick="setUnderline(${verse.number}, 'orange')">U6</button>
                        <button class="underline-btn clear" onclick="setUnderline(${verse.number}, null)">X</button>
                    </div>
                </div>

                <!-- Note submenu -->
                <div class="submenu" id="submenu-note-${verse.number}">
                    <textarea class="note-textarea" id="note-input-${verse.number}" placeholder="Add your thoughts... (Cmd+Enter to save)" onkeydown="handleNoteKeydown(event, ${verse.number})">${annotation.note || ''}</textarea>
                    <div class="note-actions">
                        <button class="note-delete" onclick="deleteNote(${verse.number})">Delete</button>
                        <button class="note-save" onclick="saveNote(${verse.number})">Save</button>
                    </div>
                </div>

                <!-- Tag submenu -->
                <div class="submenu" id="submenu-tag-${verse.number}">
                    <div class="tag-section">
                        <div class="tag-section-title">Active tags (tap to remove)</div>
                        <div class="active-tags" id="active-tags-${verse.number}">
                            ${hasTags ? annotation.tags.map(tag => {
                                const tagName = typeof tag === 'string' ? tag : tag.name;
                                const tagColor = typeof tag === 'object' ? tag.color : knownTags[tagName.toLowerCase()] || '#ACE5CB';
                                return `<span class="tag-item active" style="background: ${tagColor}" onclick="removeTag(${verse.number}, '${tagName}')">${tagName}</span>`;
                            }).join('') : '<span style="color: var(--text-tertiary); font-size: 0.8em;">No tags</span>'}
                        </div>
                    </div>
                    <div class="tag-section">
                        <div class="tag-section-title">Add existing tag</div>
                        <div class="existing-tags" id="existing-tags-${verse.number}">
                            ${Object.keys(knownTags).length > 0 ?
                                Object.entries(knownTags).map(([name, color]) => {
                                    const isActive = hasTags && annotation.tags.some(t => (typeof t === 'string' ? t : t.name).toLowerCase() === name.toLowerCase());
                                    if (isActive) return '';
                                    return `<span class="tag-item" style="background: ${color}" onclick="addExistingTag(${verse.number}, '${name}', '${color}')">${name}</span>`;
                                }).join('') || '<span style="color: var(--text-tertiary); font-size: 0.8em;">No saved tags</span>'
                            : '<span style="color: var(--text-tertiary); font-size: 0.8em;">No saved tags</span>'}
                        </div>
                    </div>
                    <div class="tag-section">
                        <div class="tag-section-title">New tag</div>
                        <div class="new-tag-row">
                            <input type="text" id="new-tag-input-${verse.number}" placeholder="Tag name...">
                            <div class="new-tag-color" id="new-tag-color-${verse.number}" style="background: #ACE5CB" onclick="event.stopPropagation(); showInlineColorPicker(${verse.number})"></div>
                            <button class="new-tag-add" onclick="addNewTag(${verse.number})">Add</button>
                        </div>
                    </div>
                    <div style="padding: 8px; font-size: 0.75em; color: var(--text-tertiary); text-align: center; border-top: 1px solid var(--border); margin-top: 8px;">
                        Edit colours or text: Settings > Manage Tags
                    </div>
                </div>
            </div>
            </div>
        `;
    });
    */
    // END OF OLD COMMENTED CODE

    // Bottom navigation + footer
    html += `
        <div class="bottom-nav">
            <button class="nav-btn nav-arrow" id="prev-chapter-bottom" aria-label="Previous chapter" onclick="navigateChapter(-1)">←</button>
            <button class="chapter-info" onclick="openNavModal()">${book.name} ${currentChapter}</button>
            <button class="nav-btn nav-arrow" id="next-chapter-bottom" aria-label="Next chapter" onclick="navigateChapter(1)">→</button>
        </div>
        <div class="footer">
            <p>Scripture Scribbles v1.4.1 | World English Bible (WEB) | <a href="https://github.com/DaveWyborn/scripture-scribbles" target="_blank">GitHub</a></p>
            <p>Made with ❤️ for people with dyslexia</p>
        </div>
    `;

    // Check if we're in split view mode (sermon notes open)
    const inSplitMode = typeof sermonViewMode !== 'undefined' && sermonViewMode === 'split';
    const bibleWrapper = document.getElementById('bible-content-wrapper');
    const notesView = document.getElementById('sermon-notes-view');

    console.log('📖 displayChapter() preservation check:', {
        inSplitMode,
        bibleWrapper: !!bibleWrapper,
        notesView: !!notesView,
        notesViewParent: notesView ? notesView.parentElement?.id : 'no parent',
        notesViewDisplay: notesView ? notesView.style.display : 'N/A'
    });

    if (inSplitMode && bibleWrapper) {
        // Update only the Bible wrapper content, preserve notes panel
        console.log('✅ Split mode: updating bible-content-wrapper only');
        bibleWrapper.innerHTML = html;
    } else if (notesView) {
        // Notes panel exists - preserve it regardless of visibility
        console.log('✅ Preserving sermon-notes-view by re-appending');
        contentEl.innerHTML = html;
        // Re-add notes view (whether visible or not)
        contentEl.appendChild(notesView);
        console.log('✅ sermon-notes-view re-appended, parent:', notesView.parentElement?.id);
    } else {
        // Normal mode - replace everything
        console.log('⚠️ No sermon-notes-view found, replacing all content');
        contentEl.innerHTML = html;
    }

    // Re-apply annotation mode class (innerHTML wipes classes)
    const annotationMode = localStorage.getItem('annotationMode') || 'on';
    contentEl.classList.add(`annotation-mode-${annotationMode}`);

    // Restore split-view class if needed
    if (inSplitMode) {
        contentEl.classList.add('split-view');
    }

    // Add reading mode class
    contentEl.classList.toggle('reading-mode-fluid', readingMode === 'fluid' || readingMode === 'passage');
    contentEl.classList.toggle('reading-mode-verse', readingMode === 'verse');

    // Attach verse click handlers
    if (readingMode === 'passage') {
        // Passage mode: no chapter-section wrapper, use content element directly
        const target = bibleWrapper || contentEl;
        attachVerseHandlers(target);
    } else {
        // Fluid/verse mode: attach per chapter section (supports continuous scroll)
        document.querySelectorAll('.chapter-section').forEach(section => {
            attachVerseHandlers(section);
        });
    }

    // Update navigation buttons (top + bottom)
    const book_obj = bibleData.books.find(b => b.id === currentBook);
    let prevDisabled, nextDisabled;
    if (readingMode === 'passage') {
        prevDisabled = currentChapter === 1 && currentPassageIndex === 0;
        nextDisabled = currentChapter === book_obj.chapters.length && currentPassageIndex === passageChunks.length - 1;
    } else {
        // With continuous scroll, next is never disabled (auto-loads).
        // Prev disabled only at Genesis 1.
        const isFirstBook = bibleData.books.indexOf(book_obj) === 0;
        prevDisabled = isFirstBook && currentChapter === 1;
        nextDisabled = false;
    }
    document.getElementById('prev-chapter').disabled = prevDisabled;
    document.getElementById('next-chapter').disabled = nextDisabled;
    const prevBottom = document.getElementById('prev-chapter-bottom');
    const nextBottom = document.getElementById('next-chapter-bottom');
    if (prevBottom) prevBottom.disabled = prevDisabled;
    if (nextBottom) nextBottom.disabled = nextDisabled;

    // Apply auto-contrast to highlights and tags
    setTimeout(applyAutoContrast, 50);

    // Set up continuous scroll for fluid and verse modes
    if (readingMode !== 'passage') {
        setupContinuousScroll();
    }
}

// Navigate to previous/next chapter (or passage in passage mode)
async function navigateChapter(delta) {
    if (isNavigating) return;

    // Passage mode: navigate within chunks first, cross chapter at boundaries
    if (readingMode === 'passage' && passageChunks.length > 0) {
        const newIndex = currentPassageIndex + delta;
        if (newIndex >= 0 && newIndex < passageChunks.length) {
            currentPassageIndex = newIndex;
            saveLastPosition();
            displayChapter();
            window.scrollTo(0, 0);
            return;
        }
        // At chapter boundary — move to adjacent chapter
        isNavigating = true;
        try {
            currentChapter += delta;
            passageChunks = [];
            await loadAnnotations();
            // Build chunks now so we can land on last passage when going back
            const book = bibleData.books.find(b => b.id === currentBook);
            const chapter = book && book.chapters.find(c => c.number === currentChapter);
            if (chapter) {
                passageChunks = buildPassageChunks(chapter);
                currentPassageIndex = delta > 0 ? 0 : passageChunks.length - 1;
            }
            saveLastPosition();
            displayChapter();
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error in navigateChapter:', error);
        } finally {
            isNavigating = false;
        }
        return;
    }

    isNavigating = true;
    try {
        const book = bibleData.books.find(b => b.id === currentBook);
        const bookIndex = bibleData.books.indexOf(book);
        const newChapter = currentChapter + delta;

        if (newChapter >= 1 && newChapter <= book.chapters.length) {
            // Same book
            currentChapter = newChapter;
        } else if (delta > 0 && bookIndex < bibleData.books.length - 1) {
            // Next book
            const nextBook = bibleData.books[bookIndex + 1];
            currentBook = nextBook.id;
            currentChapter = 1;
        } else if (delta < 0 && bookIndex > 0) {
            // Previous book (go to last chapter)
            const prevBook = bibleData.books[bookIndex - 1];
            currentBook = prevBook.id;
            currentChapter = prevBook.chapters.length;
        } else {
            // At boundary of Bible, nothing to do
            isNavigating = false;
            return;
        }

        passageChunks = [];
        currentPassageIndex = 0;
        saveLastPosition();
        await loadAnnotations();
        displayChapter();
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error in navigateChapter:', error);
    } finally {
        isNavigating = false;
    }
}
