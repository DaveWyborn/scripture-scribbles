// Sermon Notes Module
// Handles creating, loading, saving, and managing sermon notes with Trix editor

/**
 * Initialize sermon notes module
 */
async function initSermons() {

    // Setup Trix event listeners
    setupTrixListeners();

    // Setup swipe handlers for mobile
    if (window.innerWidth < 768) {
        setupSwipeHandlers();
    }

    // Restore metadata collapsed state (default collapsed on mobile)
    const storedCollapsed = localStorage.getItem('metadataCollapsed');
    const metadataCollapsed = storedCollapsed !== null
        ? storedCollapsed === 'true'
        : window.innerWidth < 768;
    if (metadataCollapsed) {
        const metadata = document.getElementById('sermon-metadata');
        const toggleBtn = document.querySelector('.metadata-toggle-btn');
        if (metadata && toggleBtn) {
            metadata.classList.add('collapsed');
            toggleBtn.classList.add('collapsed');
        }
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
 * Toggle verse selection for insertion into notes
 */
function toggleVerseSelection(verseNum) {
    if (!sermonViewMode || sermonViewMode === 'single') {
        return; // Only allow selection when notes are open
    }

    if (selectedVerses.has(verseNum)) {
        selectedVerses.delete(verseNum);
    } else {
        selectedVerses.add(verseNum);
    }

    updateVerseSelectionUI();
}

/**
 * Update UI for selected verses
 */
function updateVerseSelectionUI() {
    // Update visual state of verses
    document.querySelectorAll('.verse, .verse-inline-wrapper').forEach(el => {
        const verseNum = parseInt(el.dataset.verse);
        if (selectedVerses.has(verseNum)) {
            el.classList.add('selected-for-insertion');
        } else {
            el.classList.remove('selected-for-insertion');
        }
    });

    // Show/hide insertion bar
    const insertionBar = document.getElementById('verse-insertion-bar');
    const label = document.getElementById('verses-selected-label');

    if (selectedVerses.size > 0 && insertionBar) {
        insertionBar.style.display = 'flex';
        if (label) {
            const count = selectedVerses.size;
            label.textContent = `${count} verse${count > 1 ? 's' : ''} selected`;
        }
    } else if (insertionBar) {
        insertionBar.style.display = 'none';
    }
}

/**
 * Clear all selected verses
 * Note: Must be globally accessible for onclick handlers
 */
window.clearVerseSelection = function() {
    selectedVerses.clear();
    updateVerseSelectionUI();
}

/**
 * Insert selected verses as reference (e.g., "Gen 1:1-3")
 * Note: Must be globally accessible for onclick handlers
 */
window.insertSelectedAsReference = function() {
    if (selectedVerses.size === 0) return;

    const book = bibleData.books.find(b => b.id === currentBook);
    if (!book) return;

    // Sort verse numbers
    const verses = Array.from(selectedVerses).sort((a, b) => a - b);

    // Format reference
    let reference;
    if (verses.length === 1) {
        reference = `${book.name} ${currentChapter}:${verses[0]}`;
    } else if (verses.length === 2) {
        reference = `${book.name} ${currentChapter}:${verses[0]}, ${verses[1]}`;
    } else {
        // Check for continuous range
        const isContinuous = verses.every((v, i) => i === 0 || v === verses[i - 1] + 1);
        if (isContinuous) {
            reference = `${book.name} ${currentChapter}:${verses[0]}-${verses[verses.length - 1]}`;
        } else {
            reference = `${book.name} ${currentChapter}:${verses.join(', ')}`;
        }
    }

    // Insert into Trix at cursor
    const trixEditor = document.querySelector('trix-editor');
    if (trixEditor && trixEditor.editor) {
        trixEditor.editor.insertString(reference);
    }

    clearVerseSelection();
}

/**
 * Insert selected verses as full text
 * Note: Must be globally accessible for onclick handlers
 */
window.insertSelectedAsText = function() {
    if (selectedVerses.size === 0) return;

    const book = bibleData.books.find(b => b.id === currentBook);
    if (!book) return;

    const chapter = book.chapters.find(c => c.number === currentChapter);
    if (!chapter) return;

    // Sort verse numbers and get text
    const verses = Array.from(selectedVerses).sort((a, b) => a - b);
    const verseTexts = verses.map(verseNum => {
        const verse = chapter.verses.find(v => v.number === verseNum);
        return verse ? `${verseNum} ${verse.text}` : '';
    }).filter(t => t).join(' ');

    // Insert into Trix at cursor
    const trixEditor = document.querySelector('trix-editor');
    if (trixEditor && trixEditor.editor) {
        trixEditor.editor.insertHTML(`<blockquote>${verseTexts}<br><em>${book.name} ${currentChapter}:${verses[0]}${verses.length > 1 ? '-' + verses[verses.length - 1] : ''}</em></blockquote>`);
    }

    clearVerseSelection();
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
 * Toggle notes view (desktop split screen)
 */
async function toggleNotesView() {
    const content = document.getElementById('content');
    const notesView = document.getElementById('sermon-notes-view');
    const toggleBtn = document.getElementById('toggle-notes-btn');

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
            <div class="verse-insertion-bar" id="verse-insertion-bar" style="display: none;">
                <span class="verses-selected-label" id="verses-selected-label">0 verses selected</span>
                <div class="insertion-buttons">
                    <button class="btn-insert" onclick="insertSelectedAsReference()">
                        <i class="ph ph-link"></i> Add as Reference
                    </button>
                    <button class="btn-insert" onclick="insertSelectedAsText()">
                        <i class="ph ph-quotes"></i> Add Full Text
                    </button>
                    <button class="btn-clear-selection" onclick="clearVerseSelection()">
                        <i class="ph ph-x"></i>
                    </button>
                </div>
            </div>
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

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="ph ph-x"></i> Close Notes';
        }

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

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="ph ph-notebook"></i> Notes';
        }
    }
}

/**
 * Switch view on mobile (swipe navigation)
 * Note: Must be globally accessible for onclick handlers
 */
window.switchMobileView = async function(view) {
    activeView = view;
    const indicator = document.getElementById('mobile-view-indicator');
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
            <div class="verse-insertion-bar" id="verse-insertion-bar" style="display: none;">
                <span class="verses-selected-label" id="verses-selected-label">0 verses selected</span>
                <div class="insertion-buttons">
                    <button class="btn-insert" onclick="insertSelectedAsReference()">
                        <i class="ph ph-link"></i> Add as Reference
                    </button>
                    <button class="btn-insert" onclick="insertSelectedAsText()">
                        <i class="ph ph-quotes"></i> Add Full Text
                    </button>
                    <button class="btn-clear-selection" onclick="clearVerseSelection()">
                        <i class="ph ph-x"></i>
                    </button>
                </div>
            </div>
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

    // Show and update visual indicator (once notes mode is active, keep visible)
    if (indicator) {
        indicator.classList.add('active');
        indicator.querySelectorAll('.view-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });
    }

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
