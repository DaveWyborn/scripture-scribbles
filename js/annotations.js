// Annotations module - Highlight/note/tag management + Supabase sync

// Load annotations from Supabase for current book/chapter
async function loadAnnotations() {
    if (!currentUser) return;

    try {
        const bookId = `${currentBook}-${currentChapter}`;

        // Add timeout to prevent hung requests
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 5000)
        );

        const queryPromise = supabase
            .from('annotations')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('bible_version', 'WEB')
            .eq('annotation_set', currentAnnotationSet)
            .eq('book_id', bookId)
            .maybeSingle();

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

        if (error) {
            console.warn('Annotation load error:', error.code, error.message);
        }

        currentAnnotations = data ? data.data : {};
    } catch (error) {
        console.error('Error loading annotations:', error);
        currentAnnotations = {};
    }
}

// Open annotation panel for a verse
function openAnnotationPanel(verseNum) {
    console.log('openAnnotationPanel called with verse:', verseNum);

    if (!currentUser) {
        alert('Please sign in to add annotations');
        return;
    }

    selectedVerse = verseNum;
    console.log('Set selectedVerse to:', selectedVerse);
    document.getElementById('annotation-verse-num').textContent = verseNum;

    // Load existing annotation
    const annotation = currentAnnotations[verseNum] || {};

    // Clear all color selections
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));

    // Select current color
    if (annotation.highlight) {
        document.querySelector(`[data-color="${annotation.highlight}"]`).classList.add('selected');
    }

    document.getElementById('verse-note').value = annotation.note || '';

    // Load tags into currentTags array
    currentTags = [];
    if (annotation.tags && annotation.tags.length > 0) {
        annotation.tags.forEach(tag => {
            if (typeof tag === 'string') {
                // Old format - convert
                const color = knownTags[tag.toLowerCase()] || getRandomTagColor();
                currentTags.push({ name: tag, color });
            } else {
                // New format
                currentTags.push({ ...tag });
            }
        });
    }
    renderTagChips();

    // Show tag suggestions
    showTagSuggestions();

    document.getElementById('annotation-panel').classList.add('open');

    // Update selected verse in UI
    document.querySelectorAll('.verse').forEach(el => el.classList.remove('selected'));
    const verseElement = document.querySelector(`[data-verse="${verseNum}"]`);
    if (verseElement) {
        verseElement.classList.add('selected');

        // Scroll verse into view above the panel
        setTimeout(() => {
            const panelHeight = document.getElementById('annotation-panel').offsetHeight;
            const verseRect = verseElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Check if verse is hidden behind panel
            if (verseRect.bottom > viewportHeight - panelHeight) {
                // Scroll so verse is visible above panel with some padding
                const scrollTarget = verseElement.offsetTop - 200; // 200px padding from top (less aggressive on desktop)
                window.scrollTo({
                    top: scrollTarget,
                    behavior: 'smooth'
                });
            }
        }, 300); // Wait for panel animation to complete
    }
}

// Close annotation panel
function closeAnnotationPanel() {
    document.getElementById('annotation-panel').classList.remove('open');
    // Don't clear selectedVerse immediately - wait for animation
    setTimeout(() => {
        selectedVerse = null;
        document.querySelectorAll('.verse').forEach(el => el.classList.remove('selected'));
    }, 300);
}

// Select highlight color in annotation panel
function selectHighlight(color) {
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-color="${color}"]`).classList.add('selected');
}

// Clear highlight selection
function clearHighlight() {
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
}

// Save annotation from annotation panel
async function saveAnnotation() {
    console.log('Save annotation called', { currentUser, selectedVerse });

    if (!currentUser) {
        console.error('No user logged in');
        alert('Please sign in to save annotations');
        return;
    }

    if (selectedVerse === null) {
        console.error('No verse selected');
        return;
    }

    // Store verse number locally in case it gets cleared
    const verseToSave = selectedVerse;

    const selectedColor = document.querySelector('.color-option.selected');
    const highlight = selectedColor ? selectedColor.dataset.color : null;
    const note = document.getElementById('verse-note').value.trim();

    // Use currentTags array (already has name + color)
    const tags = [...currentTags];

    console.log('Saving annotation:', { verseToSave, highlight, note, tags });

    // Update local annotations
    if (!highlight && !note && tags.length === 0) {
        delete currentAnnotations[verseToSave];
    } else {
        currentAnnotations[verseToSave] = { highlight, note, tags };
    }

    // Save to Supabase
    try {
        const bookId = `${currentBook}-${currentChapter}`;

        console.log('Saving to Supabase:', { bookId, verseToSave });

        // Check if annotation exists
        const { data: existing } = await supabase
            .from('annotations')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('bible_version', 'WEB')
            .eq('annotation_set', currentAnnotationSet)
            .eq('book_id', bookId)
            .maybeSingle();

        if (existing) {
            // Update existing
            console.log('Updating existing annotation');
            const { error } = await supabase
                .from('annotations')
                .update({ data: currentAnnotations })
                .eq('id', existing.id);

            if (error) throw error;
        } else {
            // Insert new
            console.log('Inserting new annotation');
            const { error } = await supabase
                .from('annotations')
                .insert({
                    user_id: currentUser.id,
                    bible_version: 'WEB',
                    annotation_set: currentAnnotationSet,
                    book_id: bookId,
                    data: currentAnnotations
                });

            if (error) throw error;
        }

        console.log('Save successful, refreshing display');

        // Refresh display
        displayChapter();
        closeAnnotationPanel();
    } catch (error) {
        console.error('Error saving annotation:', error);
        alert('Failed to save annotation. Please try again.');
    }
}

// Toggle inline submenu (highlight/note/tag)
function toggleSubmenu(verseNum, menuType) {
    const submenuId = `submenu-${menuType}-${verseNum}`;
    const submenu = document.getElementById(submenuId);

    if (!submenu) return;

    // Close all other submenus for this verse
    const verse = document.querySelector(`[data-verse="${verseNum}"]`);
    verse.querySelectorAll('.submenu').forEach(s => {
        if (s.id !== submenuId) s.classList.remove('open');
    });

    // Toggle menu button active state
    verse.querySelectorAll('.menu-btn').forEach(btn => {
        if (btn.dataset.menu === menuType) {
            btn.classList.toggle('active', !submenu.classList.contains('open'));
        } else {
            btn.classList.remove('active');
        }
    });

    // Toggle this submenu
    submenu.classList.toggle('open');
}

// Set highlight color for a verse (inline)
async function setHighlight(verseNum, color) {
    if (!currentUser) {
        alert('Please sign in to add annotations');
        return;
    }

    // Update annotation
    if (!currentAnnotations[verseNum]) {
        currentAnnotations[verseNum] = {};
    }

    if (color) {
        currentAnnotations[verseNum].highlight = color;
    } else {
        delete currentAnnotations[verseNum].highlight;
    }

    // Clean up empty annotations
    if (!currentAnnotations[verseNum].highlight &&
        !currentAnnotations[verseNum].underline &&
        !currentAnnotations[verseNum].note &&
        (!currentAnnotations[verseNum].tags || currentAnnotations[verseNum].tags.length === 0)) {
        delete currentAnnotations[verseNum];
    }

    await saveInlineAnnotation(verseNum);
}

// Set underline color for a verse (inline)
async function setUnderline(verseNum, color) {
    if (!currentUser) {
        alert('Please sign in to add annotations');
        return;
    }

    // Update annotation
    if (!currentAnnotations[verseNum]) {
        currentAnnotations[verseNum] = {};
    }

    if (color) {
        currentAnnotations[verseNum].underline = color;
    } else {
        delete currentAnnotations[verseNum].underline;
    }

    // Clean up empty annotations
    if (!currentAnnotations[verseNum].highlight &&
        !currentAnnotations[verseNum].underline &&
        !currentAnnotations[verseNum].note &&
        (!currentAnnotations[verseNum].tags || currentAnnotations[verseNum].tags.length === 0)) {
        delete currentAnnotations[verseNum];
    }

    await saveInlineAnnotation(verseNum);
}

// Save note for a verse (inline)
async function saveNote(verseNum) {
    if (!currentUser) {
        alert('Please sign in to add annotations');
        return;
    }

    const noteInput = document.getElementById(`note-input-${verseNum}`);
    const note = noteInput.value.trim();

    if (!currentAnnotations[verseNum]) {
        currentAnnotations[verseNum] = {};
    }

    if (note) {
        currentAnnotations[verseNum].note = note;
    } else {
        delete currentAnnotations[verseNum].note;
    }

    // Clean up empty annotations
    if (!currentAnnotations[verseNum].highlight &&
        !currentAnnotations[verseNum].underline &&
        !currentAnnotations[verseNum].note &&
        (!currentAnnotations[verseNum].tags || currentAnnotations[verseNum].tags.length === 0)) {
        delete currentAnnotations[verseNum];
    }

    await saveInlineAnnotation(verseNum);
}

// Delete note for a verse (inline)
async function deleteNote(verseNum) {
    if (!currentUser) return;

    if (!currentAnnotations[verseNum]) return;

    delete currentAnnotations[verseNum].note;

    // Clean up empty annotations
    if (!currentAnnotations[verseNum].highlight &&
        !currentAnnotations[verseNum].underline &&
        !currentAnnotations[verseNum].note &&
        (!currentAnnotations[verseNum].tags || currentAnnotations[verseNum].tags.length === 0)) {
        delete currentAnnotations[verseNum];
    }

    await saveInlineAnnotation(verseNum);
}

// Add existing tag to a verse (inline)
async function addExistingTag(verseNum, tagName, tagColor) {
    if (!currentUser) {
        alert('Please sign in to add annotations');
        return;
    }

    if (!currentAnnotations[verseNum]) {
        currentAnnotations[verseNum] = {};
    }
    if (!currentAnnotations[verseNum].tags) {
        currentAnnotations[verseNum].tags = [];
    }

    // Check if already exists
    const exists = currentAnnotations[verseNum].tags.some(t =>
        (typeof t === 'string' ? t : t.name).toLowerCase() === tagName.toLowerCase()
    );

    if (!exists) {
        currentAnnotations[verseNum].tags.push({ name: tagName, color: tagColor });
        await saveInlineAnnotation(verseNum);
    }
}

// Add new tag to a verse (inline)
async function addNewTag(verseNum) {
    if (!currentUser) {
        alert('Please sign in to add annotations');
        return;
    }

    const input = document.getElementById(`new-tag-input-${verseNum}`);
    const colorPicker = document.getElementById(`new-tag-color-${verseNum}`);
    const tagName = input.value.trim();

    if (!tagName) return;

    const tagColor = colorPicker.style.background || '#ACE5CB';

    if (!currentAnnotations[verseNum]) {
        currentAnnotations[verseNum] = {};
    }
    if (!currentAnnotations[verseNum].tags) {
        currentAnnotations[verseNum].tags = [];
    }

    // Check if already exists
    const exists = currentAnnotations[verseNum].tags.some(t =>
        (typeof t === 'string' ? t : t.name).toLowerCase() === tagName.toLowerCase()
    );

    if (!exists) {
        currentAnnotations[verseNum].tags.push({ name: tagName, color: tagColor });

        // Save to knownTags
        knownTags[tagName.toLowerCase()] = tagColor;
        saveKnownTags();

        input.value = '';
        await saveInlineAnnotation(verseNum);
    }
}

// Remove tag from a verse (inline)
async function removeTag(verseNum, tagName) {
    if (!currentUser) return;

    if (!currentAnnotations[verseNum] || !currentAnnotations[verseNum].tags) return;

    currentAnnotations[verseNum].tags = currentAnnotations[verseNum].tags.filter(t => {
        const name = typeof t === 'string' ? t : t.name;
        return name.toLowerCase() !== tagName.toLowerCase();
    });

    // Clean up empty annotations
    if (!currentAnnotations[verseNum].highlight &&
        !currentAnnotations[verseNum].underline &&
        !currentAnnotations[verseNum].note &&
        (!currentAnnotations[verseNum].tags || currentAnnotations[verseNum].tags.length === 0)) {
        delete currentAnnotations[verseNum];
    }

    await saveInlineAnnotation(verseNum);
}

// Handle keyboard shortcuts in note textarea
function handleNoteKeydown(event, verseNum) {
    // CMD+Enter (Mac) or Ctrl+Enter (Windows) to save
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        saveNote(verseNum);
    }
}

// Show inline color picker for new tags
function showInlineColorPicker(verseNum) {
    // Show a popup with colour options
    const colorPicker = document.getElementById(`new-tag-color-${verseNum}`);
    const colors = getTagColors();

    // Check if popup already exists
    let popup = document.getElementById(`color-popup-${verseNum}`);
    if (popup) {
        popup.remove();
        return;
    }

    // Create popup
    popup = document.createElement('div');
    popup.id = `color-popup-${verseNum}`;
    popup.className = 'color-picker-popup open';
    popup.style.position = 'absolute';
    popup.style.bottom = '40px';
    popup.style.right = '0';

    let html = '<div class="color-picker-grid">';
    colors.forEach(color => {
        html += `<div class="color-picker-option" style="background: ${color}" onclick="event.stopPropagation(); selectInlineTagColor(${verseNum}, '${color}')"></div>`;
    });
    html += '</div>';

    popup.innerHTML = html;

    // Position relative to the color picker button
    const tagSection = colorPicker.closest('.tag-section');
    if (tagSection) {
        tagSection.style.position = 'relative';
        tagSection.appendChild(popup);
    } else {
        colorPicker.parentElement.style.position = 'relative';
        colorPicker.parentElement.appendChild(popup);
    }

    // Close on click outside
    setTimeout(() => {
        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target) && e.target !== colorPicker) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        });
    }, 10);
}

// Select tag color in inline color picker
function selectInlineTagColor(verseNum, color) {
    const colorPicker = document.getElementById(`new-tag-color-${verseNum}`);
    colorPicker.style.background = color;

    // Remove popup
    const popup = document.getElementById(`color-popup-${verseNum}`);
    if (popup) popup.remove();
}

// Save inline annotation to Supabase (used by inline menu actions)
async function saveInlineAnnotation(verseNum) {
    try {
        const bookId = `${currentBook}-${currentChapter}`;

        // Check if annotation exists
        const { data: existing } = await supabase
            .from('annotations')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('bible_version', 'WEB')
            .eq('annotation_set', currentAnnotationSet)
            .eq('book_id', bookId)
            .maybeSingle();

        if (existing) {
            // Update existing
            const { error } = await supabase
                .from('annotations')
                .update({ data: currentAnnotations })
                .eq('id', existing.id);

            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('annotations')
                .insert({
                    user_id: currentUser.id,
                    bible_version: 'WEB',
                    annotation_set: currentAnnotationSet,
                    book_id: bookId,
                    data: currentAnnotations
                });

            if (error) throw error;
        }

        // Refresh display but keep verse selected and submenu open
        const wasSelected = selectedVerse;

        // Find which submenu was open
        let openSubmenuType = null;
        if (wasSelected) {
            const openSubmenu = document.querySelector(`[data-verse="${wasSelected}"] .submenu.open`);
            if (openSubmenu) {
                const id = openSubmenu.id;
                const match = id.match(/submenu-(\w+)-/);
                if (match) openSubmenuType = match[1];
            }
        }

        displayChapter();

        // Re-select the verse and re-open submenu
        if (wasSelected) {
            selectedVerse = wasSelected;
            const verseEl = document.querySelector(`[data-verse="${wasSelected}"]`);
            if (verseEl) {
                verseEl.classList.add('selected');

                // Re-open the submenu that was open
                if (openSubmenuType) {
                    setTimeout(() => {
                        toggleSubmenu(wasSelected, openSubmenuType);
                    }, 50);
                }
            }
        }
    } catch (error) {
        console.error('Error saving annotation:', error);
        alert('Failed to save annotation. Please try again.');
    }
}

// Copy verse to clipboard
function copyVerse(verseNum) {
    if (!bibleData) return;

    const book = bibleData.books.find(b => b.id === currentBook);
    if (!book) return;

    const chapter = book.chapters.find(c => c.number === currentChapter);
    if (!chapter) return;

    const verse = chapter.verses.find(v => v.number === verseNum);
    if (!verse) return;

    const text = `${book.name} ${currentChapter}:${verseNum} - ${verse.text}`;

    navigator.clipboard.writeText(text).then(() => {
        // Show feedback
        showCopyFeedback('Verse copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showCopyFeedback('Verse copied to clipboard');
    });
}

// Show copy feedback toast
function showCopyFeedback(message) {
    // Create feedback element if it doesn't exist
    let feedback = document.getElementById('copy-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'copy-feedback';
        feedback.className = 'copy-feedback';
        document.body.appendChild(feedback);
    }

    feedback.textContent = message;
    feedback.classList.add('show');

    // Hide after 2s
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 2000);
}
