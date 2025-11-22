// UI Module - Settings, themes, annotation sets, export functionality

// ===== Settings Menu =====

function toggleSettingsMenu() {
    document.getElementById('settings-menu').classList.toggle('open');
}

// ===== Theme Functions =====

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'clean';
    document.documentElement.setAttribute('data-theme', savedTheme);
    setTimeout(applyAutoContrast, 50);
}

function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    setTimeout(applyAutoContrast, 50);
}

// Get theme-appropriate tag colors
function getTagColors() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'clean';
    return WCAG_THEMES.includes(currentTheme) ? TAG_COLORS_WCAG : TAG_COLORS_PASTEL;
}

// ===== Annotation Visibility Mode =====

function loadAnnotationMode() {
    const savedMode = localStorage.getItem('annotationMode') || 'on';
    setAnnotationMode(savedMode);
    const select = document.getElementById('annotation-mode');
    if (select) select.value = savedMode;
}

function setAnnotationMode(mode) {
    const content = document.getElementById('content');
    content.classList.remove('annotation-mode-on', 'annotation-mode-subtle', 'annotation-mode-off');
    content.classList.add(`annotation-mode-${mode}`);
    localStorage.setItem('annotationMode', mode);
}

// ===== Annotation Set Management =====

function loadAnnotationSets() {
    const saved = localStorage.getItem('annotationSets');
    if (saved) {
        userAnnotationSets = JSON.parse(saved);
    }
    const savedCurrent = localStorage.getItem('currentAnnotationSet');
    if (savedCurrent && userAnnotationSets.includes(savedCurrent)) {
        currentAnnotationSet = savedCurrent;
    }
    updateSetSwitcherUI();
}

function saveAnnotationSets() {
    localStorage.setItem('annotationSets', JSON.stringify(userAnnotationSets));
    localStorage.setItem('currentAnnotationSet', currentAnnotationSet);
}

function updateSetSwitcherUI() {
    const setNameEl = document.getElementById('current-set-name');
    if (setNameEl) setNameEl.textContent = currentAnnotationSet;
}

function openSetModal() {
    const modal = document.getElementById('set-modal');
    modal.classList.add('active');
    renderSetList();
}

function closeSetModal() {
    const modal = document.getElementById('set-modal');
    modal.classList.remove('active');
}

function renderSetList() {
    const listEl = document.getElementById('set-list');
    let html = '';

    userAnnotationSets.forEach(setName => {
        const isActive = setName === currentAnnotationSet;
        html += `
            <div class="set-item ${isActive ? 'active' : ''}" onclick="switchAnnotationSet('${setName}')">
                <span class="set-item-name">${setName}</span>
                <div class="set-item-actions" onclick="event.stopPropagation()">
                    ${userAnnotationSets.length > 1 ? `<button onclick="deleteSet('${setName}')" title="Delete set"><i class="ph ph-trash"></i></button>` : ''}
                </div>
            </div>
        `;
    });

    listEl.innerHTML = html;
}

async function switchAnnotationSet(setName) {
    if (setName === currentAnnotationSet) {
        closeSetModal();
        return;
    }

    currentAnnotationSet = setName;
    saveAnnotationSets();
    updateSetSwitcherUI();
    closeSetModal();

    // Reload annotations for new set
    if (currentUser && bibleData) {
        await loadAnnotations();
        displayChapter();
    }
}

async function createSet() {
    const input = document.getElementById('new-set-name');
    const setName = input.value.trim();

    if (!setName) {
        alert('Please enter a set name');
        return;
    }

    if (userAnnotationSets.includes(setName)) {
        alert('A set with this name already exists');
        return;
    }

    userAnnotationSets.push(setName);
    saveAnnotationSets();
    input.value = '';
    renderSetList();
}

async function deleteSet(setName) {
    if (userAnnotationSets.length === 1) {
        alert('Cannot delete the last annotation set');
        return;
    }

    if (!confirm(`Delete annotation set "${setName}"? This will delete all annotations in this set.`)) {
        return;
    }

    // Delete from Supabase if user is logged in
    if (currentUser) {
        try {
            await supabase
                .from('annotations')
                .delete()
                .eq('user_id', currentUser.id)
                .eq('annotation_set', setName);
        } catch (error) {
            console.error('Error deleting set from Supabase:', error);
        }
    }

    // Remove from local list
    userAnnotationSets = userAnnotationSets.filter(s => s !== setName);

    // Switch to first set if we deleted the current one
    if (setName === currentAnnotationSet) {
        currentAnnotationSet = userAnnotationSets[0];
        await switchAnnotationSet(currentAnnotationSet);
    }

    saveAnnotationSets();
    renderSetList();
}

// ===== Auto-Contrast Functions =====

function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseColour(colour) {
    const temp = document.createElement('div');
    temp.style.color = colour;
    document.body.appendChild(temp);
    const computed = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    return [0, 0, 0];
}

function getCSSVariable(name) {
    return getComputedStyle(document.documentElement).getPropertyValue('--' + name).trim();
}

function applyAutoContrast() {
    // Apply to highlighted verses
    const highlightedVerses = document.querySelectorAll('.verse[class*="highlight-"]');

    highlightedVerses.forEach(verse => {
        // Get the highlight class
        const classes = verse.className.split(' ');
        const highlightClass = classes.find(c => c.startsWith('highlight-') && c !== 'highlight-light-text' && c !== 'highlight-dark-text');

        if (!highlightClass) return;

        // Map highlight class to CSS variable
        const colorMap = {
            'highlight-yellow': 'highlight-yellow',
            'highlight-green': 'highlight-green',
            'highlight-blue': 'highlight-blue',
            'highlight-pink': 'highlight-pink',
            'highlight-purple': 'highlight-purple',
            'highlight-orange': 'highlight-orange'
        };

        const varName = colorMap[highlightClass];
        if (!varName) return;

        const bgColour = getCSSVariable(varName);
        const rgb = parseColour(bgColour);
        const luminance = getLuminance(rgb[0], rgb[1], rgb[2]);

        // Remove old classes
        verse.classList.remove('highlight-light-text', 'highlight-dark-text');

        // Apply appropriate text colour
        if (luminance > 0.179) {
            verse.classList.add('highlight-dark-text');
        } else {
            verse.classList.add('highlight-light-text');
        }
    });

    // Apply to tags
    const tags = document.querySelectorAll('.tag, .tag-item');
    tags.forEach(tag => {
        const bg = getComputedStyle(tag).backgroundColor;
        const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const luminance = getLuminance(
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3])
            );
            tag.style.color = luminance > 0.179 ? '#000000' : '#FFFFFF';
        }
    });

    // Apply to highlight buttons
    const highlightBtns = document.querySelectorAll('.highlight-btn:not(.clear)');
    highlightBtns.forEach(btn => {
        const bg = getComputedStyle(btn).backgroundColor;
        const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const luminance = getLuminance(
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3])
            );
            btn.style.color = luminance > 0.179 ? '#000000' : '#FFFFFF';
        }
    });
}

// ===== Export Functions =====

async function openExportModal() {
    if (!currentUser) {
        alert('Please sign in to export notes');
        return;
    }

    // Close settings menu
    document.getElementById('settings-menu').classList.remove('open');

    // Populate annotation sets
    const setSelect = document.getElementById('export-annotation-set');
    setSelect.innerHTML = '';
    userAnnotationSets.forEach(setName => {
        const option = document.createElement('option');
        option.value = setName;
        option.textContent = setName;
        if (setName === currentAnnotationSet) option.selected = true;
        setSelect.appendChild(option);
    });

    exportUseWEB = false;
    document.getElementById('export-modal').classList.add('active');
    await loadExportData();
}

function hideExportModal() {
    document.getElementById('export-modal').classList.remove('active');
    exportBookData = {};
}

async function loadExportData() {
    const setName = document.getElementById('export-annotation-set').value;
    const verseCountEl = document.getElementById('export-verse-count');
    const bookListEl = document.getElementById('export-book-list');

    verseCountEl.textContent = 'Loading annotations...';
    bookListEl.innerHTML = '<div style="text-align: center; padding: 20px;">Loading...</div>';

    try {
        // Fetch all annotations for this set
        const { data, error } = await supabase
            .from('annotations')
            .select('book_id, data')
            .eq('user_id', currentUser.id)
            .eq('bible_version', 'WEB')
            .eq('annotation_set', setName);

        if (error) throw error;

        // Build book data structure
        exportBookData = {};
        let totalVerses = 0;

        data.forEach(row => {
            const [bookId, chapterNum] = row.book_id.split('-');
            const chapter = parseInt(chapterNum);

            if (!exportBookData[bookId]) {
                const book = bibleData.books.find(b => b.id === bookId);
                exportBookData[bookId] = {
                    bookName: book ? book.name : bookId,
                    chapterCount: 0,
                    verseCount: 0,
                    chapters: {},
                    selected: true
                };
            }

            // Count verses in this chapter
            const verseNums = Object.keys(row.data || {});
            if (verseNums.length > 0) {
                exportBookData[bookId].chapters[chapter] = verseNums.map(v => parseInt(v));
                exportBookData[bookId].verseCount += verseNums.length;
                exportBookData[bookId].chapterCount++;
                totalVerses += verseNums.length;
            }
        });

        // Render book checkboxes
        renderExportBookList();
        updateExportVerseCount();

    } catch (error) {
        console.error('Error loading export data:', error);
        bookListEl.innerHTML = '<div style="color: var(--accent-negative); padding: 20px;">Error loading annotations</div>';
    }
}

function renderExportBookList() {
    const bookListEl = document.getElementById('export-book-list');

    if (Object.keys(exportBookData).length === 0) {
        bookListEl.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-tertiary);">No annotations found in this set</div>';
        return;
    }

    let html = '';
    // Sort by Bible order
    const sortedBookIds = Object.keys(exportBookData).sort((a, b) => {
        const indexA = BIBLE_BOOK_ORDER.indexOf(a);
        const indexB = BIBLE_BOOK_ORDER.indexOf(b);
        return indexA - indexB;
    });

    sortedBookIds.forEach(bookId => {
        const book = exportBookData[bookId];
        html += `
            <div style="padding: 8px; border-bottom: 1px solid var(--border);">
                <label style="display: flex; align-items: center; cursor: pointer; gap: 10px;">
                    <input type="checkbox" class="export-book-checkbox" data-book="${bookId}"
                        ${book.selected ? 'checked' : ''}
                        onchange="toggleBookSelection('${bookId}')">
                    <span style="flex: 1;"><strong>${book.bookName}</strong></span>
                    <span style="color: var(--text-tertiary); font-size: 0.9em;">
                        ${book.chapterCount} chapter${book.chapterCount !== 1 ? 's' : ''},
                        ${book.verseCount} verse${book.verseCount !== 1 ? 's' : ''}
                    </span>
                </label>
            </div>
        `;
    });

    bookListEl.innerHTML = html;
}

function toggleBookSelection(bookId) {
    exportBookData[bookId].selected = !exportBookData[bookId].selected;
    updateExportVerseCount();
}

function updateExportVerseCount() {
    let selectedVerses = 0;
    Object.values(exportBookData).forEach(book => {
        if (book.selected) selectedVerses += book.verseCount;
    });

    const verseCountEl = document.getElementById('export-verse-count');
    const warningEl = document.getElementById('export-limit-warning');

    if (selectedVerses === 0) {
        verseCountEl.innerHTML = '<span style="color: var(--text-tertiary);">No books selected</span>';
        warningEl.style.display = 'none';
    } else if (selectedVerses > 250 && !exportUseWEB) {
        verseCountEl.innerHTML = `<span style="color: var(--accent-negative);">${selectedVerses}/250 verses selected</span>`;
        warningEl.style.display = 'block';
    } else {
        verseCountEl.innerHTML = `<span style="color: var(--accent-positive);">${selectedVerses} verses selected</span> ${exportUseWEB ? '(WEB - No limits)' : ''}`;
        warningEl.style.display = 'none';
    }
}

function switchToWebExport() {
    exportUseWEB = !exportUseWEB;
    const btn = document.getElementById('export-switch-web');
    if (exportUseWEB) {
        btn.textContent = 'Using WEB (No Limits) ✓';
        btn.style.background = 'var(--accent-positive)';
    } else {
        btn.textContent = 'Switch to WEB (No Limits)';
        btn.style.background = 'var(--accent-info)';
    }
    updateExportVerseCount();
}

async function exportMarkdown() {
    // Check verse limit
    let selectedVerses = 0;
    Object.values(exportBookData).forEach(book => {
        if (book.selected) selectedVerses += book.verseCount;
    });

    if (selectedVerses === 0) {
        alert('Please select at least one book to export');
        return;
    }

    if (selectedVerses > 250 && !exportUseWEB) {
        alert('Please reduce selection to 250 verses or switch to WEB version');
        return;
    }

    // Build markdown
    const setName = document.getElementById('export-annotation-set').value;
    let markdown = `# ${setName} - Annotation Notes\n\n`;
    markdown += `**Exported:** ${new Date().toLocaleDateString()}\n\n`;
    markdown += `**Bible Version:** ${exportUseWEB ? 'World English Bible (WEB)' : 'WEB'}\n\n`;
    markdown += `---\n\n`;

    // Fetch all annotations for selected books (sorted in Bible order)
    const selectedBooks = Object.keys(exportBookData)
        .filter(bookId => exportBookData[bookId].selected)
        .sort((a, b) => {
            const indexA = BIBLE_BOOK_ORDER.indexOf(a);
            const indexB = BIBLE_BOOK_ORDER.indexOf(b);
            return indexA - indexB;
        });

    for (const bookId of selectedBooks) {
        const bookData = exportBookData[bookId];
        markdown += `## ${bookData.bookName}\n\n`;

        // Sort chapters
        const chapters = Object.keys(bookData.chapters).map(c => parseInt(c)).sort((a, b) => a - b);

        for (const chapterNum of chapters) {
            markdown += `### Chapter ${chapterNum}\n\n`;

            // Fetch annotations for this chapter
            const { data, error } = await supabase
                .from('annotations')
                .select('data')
                .eq('user_id', currentUser.id)
                .eq('bible_version', 'WEB')
                .eq('annotation_set', setName)
                .eq('book_id', `${bookId}-${chapterNum}`)
                .single();

            if (error || !data) continue;

            const annotations = data.data;
            const verses = bookData.chapters[chapterNum].sort((a, b) => a - b);

            for (const verseNum of verses) {
                const annotation = annotations[verseNum];
                if (!annotation) continue;

                // Get verse text
                const book = bibleData.books.find(b => b.id === bookId);
                const chapter = book.chapters.find(c => c.number === chapterNum);
                const verse = chapter.verses.find(v => v.number === verseNum);

                markdown += `**${bookData.bookName} ${chapterNum}:${verseNum}**\n\n`;
                markdown += `> ${verse.text}\n\n`;

                if (annotation.highlight) {
                    markdown += `**Highlight:** ${annotation.highlight}\n\n`;
                }

                if (annotation.tags && annotation.tags.length > 0) {
                    const tagNames = annotation.tags.map(t => typeof t === 'string' ? t : t.name).join(', ');
                    markdown += `**Tags:** ${tagNames}\n\n`;
                }

                if (annotation.note) {
                    markdown += `**Notes:** ${annotation.note}\n\n`;
                }

                markdown += `---\n\n`;
            }
        }
    }

    // Download file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${setName.toLowerCase().replace(/\s+/g, '-')}-notes-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    hideExportModal();
    showCopyFeedback('Notes exported successfully!');
}

async function exportJSON() {
    // Export complete backup - no verse limits
    const setName = document.getElementById('export-annotation-set').value;

    try {
        // Fetch ALL annotations for this set
        const { data, error } = await supabase
            .from('annotations')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('bible_version', 'WEB')
            .eq('annotation_set', setName);

        if (error) throw error;

        const backup = {
            version: '1.1.0',
            exportDate: new Date().toISOString(),
            annotationSet: setName,
            bibleVersion: 'WEB',
            annotations: data
        };

        // Download file
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scripture-scribbles-backup-${setName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        hideExportModal();
        showCopyFeedback('Backup exported successfully!');
    } catch (error) {
        console.error('Error exporting JSON:', error);
        alert('Failed to export backup. Please try again.');
    }
}
