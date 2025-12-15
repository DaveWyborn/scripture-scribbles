// Sermon Notes Module
// Handles creating, loading, saving, and managing sermon notes with Trix editor

/**
 * Initialize sermon notes module
 */
async function initSermons() {
    console.log('Initializing sermon notes module...');

    // Setup Trix event listeners
    setupTrixListeners();

    // Setup swipe handlers for mobile
    if (window.innerWidth < 768) {
        setupSwipeHandlers();
    }

    // Load user's sermons if logged in
    if (currentUser) {
        await loadSermonList();
    }
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
        console.log(`Loaded ${sermonList.length} sermon(s)`);

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
        console.error('Error details:', error.message, error.code, error.details);

        // If table doesn't exist, show helpful message
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
            console.warn('⚠️ Sermons table does not exist. Please create it in Supabase.');
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

        // Populate form fields
        document.getElementById('sermon-title').value = data.title || '';
        document.getElementById('sermon-date').value = data.date || '';
        document.getElementById('sermon-speaker').value = data.speaker || '';
        document.getElementById('sermon-location').value = data.location || '';
        document.getElementById('sermon-series').value = data.series || '';
        document.getElementById('sermon-passage').value = data.passage || '';

        // Load content into Trix
        const trixEditor = document.querySelector('trix-editor');
        if (trixEditor) {
            trixEditor.editor.loadHTML(data.content || '');
        }

        console.log('Loaded sermon:', data.title || 'Untitled');
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
        title: `Sermon - ${today}`,
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

        // Clear Trix editor
        const trixEditor = document.querySelector('trix-editor');
        if (trixEditor) {
            trixEditor.editor.loadHTML('');
        }

        console.log('Created new sermon:', data.title);
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

    const trixEditor = document.querySelector('trix-editor');
    const content = trixEditor ? trixEditor.editor.getDocument().toString() : '';

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

            console.log('Sermon saved:', sermonData.title);
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

        console.log('Sermon deleted');
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

    if (sermonViewMode === 'single') {
        // Show split view
        content.classList.add('split-view');
        notesView.style.display = 'flex';
        sermonViewMode = 'split';

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="ph ph-x"></i> Close Notes';
        }

        // Load current sermon or create new
        if (!currentSermon) {
            await createSermon();
        }
    } else {
        // Return to single view
        content.classList.remove('split-view');
        notesView.style.display = 'none';
        sermonViewMode = 'single';

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="ph ph-notebook"></i> Notes';
        }
    }
}

/**
 * Switch view on mobile (swipe navigation)
 */
function switchMobileView(view) {
    console.log('📱 switchMobileView called:', view);
    activeView = view;
    const indicator = document.getElementById('mobile-view-indicator');
    const notesView = document.getElementById('sermon-notes-view');
    const welcomeView = document.querySelector('.welcome');

    console.log('Elements found:', {
        indicator: !!indicator,
        notesView: !!notesView,
        welcomeView: !!welcomeView,
        currentSermon: !!currentSermon
    });

    // Update visual indicator
    if (indicator) {
        indicator.querySelectorAll('.view-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });
    }

    // Show/hide sermon notes view
    if (view === 'bible') {
        console.log('Switching to Bible view');
        if (notesView) {
            notesView.style.display = 'none';
            console.log('Notes hidden');
        }
    } else {
        console.log('Switching to Notes view');
        if (welcomeView) {
            welcomeView.style.display = 'none';
            console.log('Welcome hidden');
        }
        if (notesView) {
            notesView.style.display = 'flex';
            console.log('Notes shown with display:', notesView.style.display);

            // Load sermon if needed
            if (!currentSermon) {
                console.log('Creating new sermon...');
                createSermon();
            }
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

    // Auto-save after insertion
    debounceSaveSermon();

    console.log('Inserted verse:', reference);
}

/**
 * Open sermon selector modal
 */
function openSermonSelector() {
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
function closeSermonSelector() {
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
async function createNewSermon() {
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
async function exportSermonMarkdown() {
    if (!currentSermon) {
        alert('No sermon to export');
        return;
    }

    const trixEditor = document.querySelector('trix-editor');
    const htmlContent = trixEditor ? trixEditor.editor.getDocument().toString() : '';

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

    console.log('Exported sermon to Markdown');
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
