// Verse renderer module - Supports both verse-by-verse and fluid reading modes

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
 * Render chapter in fluid reading mode
 */
function renderFluidMode(chapter, book) {
    let html = '';
    let currentParagraph = [];
    let currentPoetry = [];

    chapter.verses.forEach((verse, index) => {
        // Check for section heading
        if (verse.heading) {
            // Flush current paragraph/poetry
            if (currentParagraph.length > 0) {
                html += renderParagraph(currentParagraph, book.number, chapter.number);
                currentParagraph = [];
            }
            if (currentPoetry.length > 0) {
                html += renderPoetry(currentPoetry, book.number, chapter.number);
                currentPoetry = [];
            }

            // Check if it's a Hebrew letter heading (Psalm 119 style)
            const isHebrewLetter = verse.heading.length < 20 && verse.heading === verse.heading.toUpperCase();
            const headingClass = isHebrewLetter ? 'hebrew-heading' : 'section-heading';
            html += `<div class="${headingClass}">${verse.heading}</div>`;
        }

        // Handle poetry
        if (verse.type && verse.type.startsWith('poetry')) {
            // Flush paragraph if switching from paragraph to poetry
            if (currentParagraph.length > 0) {
                html += renderParagraph(currentParagraph, book.number, chapter.number);
                currentParagraph = [];
            }
            currentPoetry.push(verse);
        } else {
            // Flush poetry if switching from poetry to paragraph
            if (currentPoetry.length > 0) {
                html += renderPoetry(currentPoetry, book.number, chapter.number);
                currentPoetry = [];
            }

            // Start new paragraph on paragraph marker
            if (verse.type === 'paragraph' && currentParagraph.length > 0) {
                html += renderParagraph(currentParagraph, book.number, chapter.number);
                currentParagraph = [];
            }

            currentParagraph.push(verse);
        }
    });

    // Flush remaining content
    if (currentParagraph.length > 0) {
        html += renderParagraph(currentParagraph, book.number, chapter.number);
    }
    if (currentPoetry.length > 0) {
        html += renderPoetry(currentPoetry, book.number, chapter.number);
    }

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

    document.getElementById('chapter-info').textContent = `${book.name} ${currentChapter}`;

    const contentEl = document.getElementById('content');

    let html = `<div class="chapter-title">${book.name} ${currentChapter}</div>`;

    // Choose renderer based on reading mode
    if (readingMode === 'fluid') {
        html += renderFluidMode(chapter, book);
    } else {
        html += renderVerseMode(chapter, book);
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

    // Add footer
    html += `
        <div class="footer">
            <p>Scripture Scribbles v1.1.0 | World English Bible (WEB) | <a href="https://github.com/DaveWyborn/scripture-scribbles" target="_blank">GitHub</a></p>
            <p>Made with ❤️ for people with dyslexia</p>
        </div>
    `;

    // Check if we're in split view mode (sermon notes open)
    const inSplitMode = typeof sermonViewMode !== 'undefined' && sermonViewMode === 'split';
    const bibleWrapper = document.getElementById('bible-content-wrapper');
    const notesView = document.getElementById('sermon-notes-view');

    if (inSplitMode && bibleWrapper) {
        // Update only the Bible wrapper content, preserve notes panel
        bibleWrapper.innerHTML = html;
    } else if (notesView && notesView.style.display !== 'none') {
        // Notes panel exists but no wrapper - shouldn't happen but handle it
        contentEl.innerHTML = html;
        // Re-add notes view
        contentEl.appendChild(notesView);
    } else {
        // Normal mode - replace everything
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
    contentEl.classList.toggle('reading-mode-fluid', readingMode === 'fluid');
    contentEl.classList.toggle('reading-mode-verse', readingMode === 'verse');

    // Add click handlers based on reading mode
    if (readingMode === 'verse') {
        // Verse-by-verse mode: click on verse blocks
        document.querySelectorAll('.verse').forEach(el => {
        // Single click: select/deselect verse (show/hide inline menu)
        el.addEventListener('click', (e) => {
            // Don't handle click if it's on interactive elements
            if (e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.closest('.inline-menu') ||
                e.target.closest('.annotation-panel')) {
                return;
            }

            const verseNum = parseInt(el.dataset.verse);

            // Shift+click: toggle verse selection for insertion into notes
            if (e.shiftKey && typeof toggleVerseSelection === 'function') {
                e.preventDefault();
                toggleVerseSelection(verseNum);
                return;
            }

            // Deselect all verses
            document.querySelectorAll('.verse').forEach(v => v.classList.remove('selected'));

            // Select this verse
            if (selectedVerse !== verseNum) {
                selectedVerse = verseNum;
                el.classList.add('selected');
            } else {
                // Clicking same verse again deselects it
                selectedVerse = null;
            }
        });
        });
    } else {
        // Fluid reading mode: click on verse wrapper to toggle inline menu
        document.querySelectorAll('.verse-inline-wrapper').forEach(el => {
            el.addEventListener('click', (e) => {
                // Don't handle click if it's on interactive elements
                if (e.target.tagName === 'BUTTON' ||
                    e.target.tagName === 'INPUT' ||
                    e.target.tagName === 'TEXTAREA' ||
                    e.target.tagName === 'I' || // Skip icons
                    e.target.closest('.inline-menu')) {
                    return;
                }

                const verseNum = parseInt(el.dataset.verse);

                // Shift+click: toggle verse selection for insertion into notes
                if (e.shiftKey && typeof toggleVerseSelection === 'function') {
                    e.preventDefault();
                    toggleVerseSelection(verseNum);
                    return;
                }

                // Deselect all verse wrappers
                document.querySelectorAll('.verse-inline-wrapper').forEach(v => v.classList.remove('selected'));

                // Toggle selection
                if (selectedVerse === verseNum) {
                    selectedVerse = null;
                } else {
                    selectedVerse = verseNum;
                    el.classList.add('selected');
                }
            });
        });

        // Click note icon to toggle inline menu on that verse
        document.querySelectorAll('.indicator-icon-inline').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const verseNum = parseInt(el.dataset.verse);
                const wrapper = el.closest('.verse-inline-wrapper');

                // Deselect all
                document.querySelectorAll('.verse-inline-wrapper').forEach(v => v.classList.remove('selected'));

                // Select this verse and open note submenu
                if (wrapper) {
                    wrapper.classList.add('selected');
                    selectedVerse = verseNum;
                    // Auto-open note submenu
                    setTimeout(() => toggleSubmenu(verseNum, 'note'), 50);
                }
            });
        });
    }

    // Update navigation buttons
    const book_obj = bibleData.books.find(b => b.id === currentBook);
    document.getElementById('prev-chapter').disabled = currentChapter === 1;
    document.getElementById('next-chapter').disabled = currentChapter === book_obj.chapters.length;

    // Apply auto-contrast to highlights and tags
    setTimeout(applyAutoContrast, 50);
}

// Navigate to previous/next chapter
async function navigateChapter(delta) {
    if (isNavigating) return;
    isNavigating = true;
    try {
        currentChapter += delta;
        await loadAnnotations();
        displayChapter();
    } catch (error) {
        console.error('Error in navigateChapter:', error);
    } finally {
        isNavigating = false;
    }
}
