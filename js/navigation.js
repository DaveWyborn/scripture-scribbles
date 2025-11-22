// Navigation module - Book/chapter navigation + visual navigation modal

// Open navigation modal
function openNavModal() {
    document.getElementById('nav-modal').classList.add('open');
    updateNavDisplay();
    renderBookGrid();
    showNavTab('book');
}

// Close navigation modal
function closeNavModal() {
    document.getElementById('nav-modal').classList.remove('open');
}

// Update navigation current display
function updateNavDisplay() {
    const book = bibleData.books.find(b => b.id === currentBook);
    document.getElementById('nav-current-display').textContent = `${book.name} ${currentChapter}`;
}

// Show book or chapter tab in navigation modal
function showNavTab(tab) {
    document.getElementById('nav-tab-book').classList.toggle('active', tab === 'book');
    document.getElementById('nav-tab-chapter').classList.toggle('active', tab === 'chapter');
    document.getElementById('nav-book-view').classList.toggle('active', tab === 'book');
    document.getElementById('nav-chapter-view').classList.toggle('active', tab === 'chapter');

    if (tab === 'chapter') {
        renderChapterGrid();
    }
}

// Render book grid (Old Testament and New Testament)
function renderBookGrid() {
    const otContainer = document.getElementById('old-testament-books');
    const ntContainer = document.getElementById('new-testament-books');

    // Old Testament
    let otHtml = '<div class="testament-label">Old Testament</div><div class="book-grid">';
    bibleData.books.forEach(book => {
        if (OT_BOOKS.includes(book.id)) {
            const abbr = BOOK_ABBR[book.id] || book.name.substring(0, 4);
            const isCurrent = book.id === currentBook ? 'current' : '';
            otHtml += `<button class="book-btn ${isCurrent}" data-book="${book.id}" title="${book.name}">${abbr}</button>`;
        }
    });
    otHtml += '</div>';
    otContainer.innerHTML = otHtml;

    // New Testament
    let ntHtml = '<div class="testament-label">New Testament</div><div class="book-grid">';
    bibleData.books.forEach(book => {
        if (!OT_BOOKS.includes(book.id)) {
            const abbr = BOOK_ABBR[book.id] || book.name.substring(0, 4);
            const isCurrent = book.id === currentBook ? 'current' : '';
            ntHtml += `<button class="book-btn ${isCurrent}" data-book="${book.id}" title="${book.name}">${abbr}</button>`;
        }
    });
    ntHtml += '</div>';
    ntContainer.innerHTML = ntHtml;

    // Add click handlers
    document.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', () => selectBook(btn.dataset.book));
    });
}

// Select a book (from navigation modal)
function selectBook(bookId) {
    currentBook = bookId;
    currentChapter = 1;
    updateNavDisplay();
    renderBookGrid();
    showNavTab('chapter');
    renderChapterGrid();
}

// Render chapter grid for currently selected book
function renderChapterGrid() {
    const book = bibleData.books.find(b => b.id === currentBook);
    document.getElementById('selected-book-name').textContent = book.name;

    let html = '';
    for (let i = 1; i <= book.chapters.length; i++) {
        const isCurrent = i === currentChapter ? 'current' : '';
        html += `<button class="chapter-btn ${isCurrent}" data-chapter="${i}">${i}</button>`;
    }

    document.getElementById('chapter-grid').innerHTML = html;

    // Add click handlers
    document.querySelectorAll('.chapter-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            currentChapter = parseInt(btn.dataset.chapter);
            await loadAnnotations();
            displayChapter();
            closeNavModal();
        });
    });
}

// Tag management in annotation panel (used by annotation panel UI)
function renderTagChips() {
    const container = document.getElementById('tags-container');
    container.innerHTML = '';

    currentTags.forEach((tag, index) => {
        const chip = document.createElement('div');
        chip.className = 'tag-chip';
        chip.style.background = tag.color;
        chip.innerHTML = `
            ${tag.name}
            <span class="tag-chip-remove" data-index="${index}">×</span>
        `;
        container.appendChild(chip);

        // Remove tag handler
        chip.querySelector('.tag-chip-remove').addEventListener('click', () => {
            currentTags.splice(index, 1);
            renderTagChips();
        });
    });
}

// Add tag in annotation panel
function addTag() {
    const input = document.getElementById('new-tag-input');
    const tagName = input.value.trim();

    if (!tagName) return;

    // Check if tag already exists
    if (currentTags.some(t => t.name.toLowerCase() === tagName.toLowerCase())) {
        input.value = '';
        return;
    }

    // Get colour from known tags or use selected colour
    const color = knownTags[tagName.toLowerCase()] || selectedTagColor;

    currentTags.push({ name: tagName, color });
    addKnownTag(tagName, color);

    input.value = '';
    selectedTagColor = getRandomTagColor(); // New random colour for next tag
    document.getElementById('new-tag-color').style.background = selectedTagColor;

    renderTagChips();
}

// Show color picker for tag colours (annotation panel)
function showColorPicker() {
    // Create popup
    const popup = document.createElement('div');
    popup.className = 'color-picker-popup open';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';

    const grid = document.createElement('div');
    grid.className = 'color-picker-grid';

    // Use theme-aware colours
    const colors = getTagColors();
    colors.forEach(color => {
        const option = document.createElement('div');
        option.className = 'color-picker-option';
        option.style.background = color;
        option.addEventListener('click', () => {
            selectedTagColor = color;
            document.getElementById('new-tag-color').style.background = color;
            document.body.removeChild(popup);
        });
        grid.appendChild(option);
    });

    popup.appendChild(grid);
    document.body.appendChild(popup);

    // Close on click outside
    setTimeout(() => {
        const closeHandler = (e) => {
            if (!popup.contains(e.target)) {
                document.body.removeChild(popup);
                document.removeEventListener('click', closeHandler);
            }
        };
        document.addEventListener('click', closeHandler);
    }, 100);
}

// Show tag suggestions in annotation panel
function showTagSuggestions() {
    const tagList = document.getElementById('tag-suggestion-list');
    tagList.innerHTML = '';

    if (Object.keys(knownTags).length > 0) {
        document.getElementById('tag-suggestions').style.display = 'block';

        Object.keys(knownTags).sort().forEach(tag => {
            const tagBtn = document.createElement('span');
            tagBtn.className = 'tag';
            tagBtn.textContent = tag;
            tagBtn.style.cursor = 'pointer';
            tagBtn.style.background = knownTags[tag];
            tagBtn.addEventListener('click', () => {
                // Add to currentTags if not already there
                if (!currentTags.some(t => t.name.toLowerCase() === tag.toLowerCase())) {
                    currentTags.push({ name: tag, color: knownTags[tag] });
                    renderTagChips();
                }
            });
            tagList.appendChild(tagBtn);
        });
    } else {
        document.getElementById('tag-suggestions').style.display = 'none';
    }
}
