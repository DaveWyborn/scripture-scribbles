// Reading Bar Module
// Focus aid for dyslexic readers — mimics a physical ruler/guide

const READING_BAR_DEFAULTS = {
    enabled: false,
    style: 'highlight',  // highlight | ruler | focus
    lines: 3,            // 1 | 3 | 5
    opacity: 0.3,
    colour: '#C4903A'    // accent-primary
};

let readingBarState = { ...READING_BAR_DEFAULTS };
let readingBarEl = null;
let isDragging = false;
let dragOffsetY = 0;

/**
 * Initialise reading bar — create DOM element, load saved state
 */
function initReadingBar() {
    const saved = localStorage.getItem('readingBar');
    if (saved) {
        try {
            readingBarState = { ...READING_BAR_DEFAULTS, ...JSON.parse(saved) };
        } catch (e) {
            readingBarState = { ...READING_BAR_DEFAULTS };
        }
    }

    createReadingBarElement();
    updateReadingBarControls();

    if (readingBarState.enabled) {
        showReadingBar();
    }
}

/**
 * Create the reading bar DOM element
 */
function createReadingBarElement() {
    if (readingBarEl) return;

    readingBarEl = document.createElement('div');
    readingBarEl.className = 'reading-bar';
    readingBarEl.id = 'reading-bar';
    readingBarEl.style.display = 'none';

    // Drag handle (visual affordance)
    const handle = document.createElement('div');
    handle.className = 'reading-bar-handle';
    readingBarEl.appendChild(handle);

    document.body.appendChild(readingBarEl);

    // Touch drag
    readingBarEl.addEventListener('touchstart', onDragStart, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);

    // Mouse drag
    readingBarEl.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
}

/**
 * Show/hide the reading bar
 */
function showReadingBar() {
    if (!readingBarEl) createReadingBarElement();

    readingBarState.enabled = true;
    applyReadingBarStyle();
    readingBarEl.style.display = '';

    // Position in centre of viewport if no saved position
    const savedTop = localStorage.getItem('readingBarTop');
    if (savedTop) {
        readingBarEl.style.top = savedTop;
    } else {
        readingBarEl.style.top = '40%';
    }

    saveReadingBar();
}

function hideReadingBar() {
    readingBarState.enabled = false;
    if (readingBarEl) {
        readingBarEl.style.display = 'none';
    }
    saveReadingBar();
}

function toggleReadingBar() {
    if (readingBarState.enabled) {
        hideReadingBar();
    } else {
        showReadingBar();
    }
    updateReadingBarControls();
}

/**
 * Apply visual style based on current state
 */
function applyReadingBarStyle() {
    if (!readingBarEl) return;

    const content = document.getElementById('content');
    const fontSize = content ? parseFloat(getComputedStyle(content).fontSize) : 16;
    const lineHeight = content ? parseFloat(getComputedStyle(content).lineHeight) / fontSize : 1.5;
    const barHeight = fontSize * lineHeight * readingBarState.lines;

    // Reset classes
    readingBarEl.className = 'reading-bar';
    readingBarEl.classList.add(`reading-bar--${readingBarState.style}`);

    readingBarEl.style.height = `${barHeight}px`;

    // Style-specific rendering
    if (readingBarState.style === 'highlight') {
        readingBarEl.style.backgroundColor = readingBarState.colour;
        readingBarEl.style.opacity = readingBarState.opacity;
        readingBarEl.style.mixBlendMode = 'multiply';
        readingBarEl.style.borderTop = 'none';
        readingBarEl.style.borderBottom = 'none';
        readingBarEl.style.outline = 'none';
        readingBarEl.style.boxShadow = 'none';
    } else if (readingBarState.style === 'ruler') {
        readingBarEl.style.backgroundColor = 'transparent';
        readingBarEl.style.opacity = '1';
        readingBarEl.style.mixBlendMode = 'normal';
        readingBarEl.style.borderTop = `2px solid ${readingBarState.colour}`;
        readingBarEl.style.borderBottom = `2px solid ${readingBarState.colour}`;
        readingBarEl.style.outline = 'none';
        readingBarEl.style.outlineOffset = '0';
        readingBarEl.style.boxShadow = 'none';
    } else if (readingBarState.style === 'focus') {
        readingBarEl.style.backgroundColor = 'transparent';
        readingBarEl.style.opacity = '1';
        readingBarEl.style.mixBlendMode = 'normal';
        readingBarEl.style.borderTop = 'none';
        readingBarEl.style.borderBottom = 'none';
        // Massive outline to dim everything outside the bar
        readingBarEl.style.outline = '200vh solid rgba(0,0,0,0.5)';
        readingBarEl.style.outlineOffset = '0';
        readingBarEl.style.boxShadow = 'none';
    }
}

// --- Drag handlers ---

function onDragStart(e) {
    isDragging = true;
    readingBarEl.classList.add('reading-bar--dragging');

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = readingBarEl.getBoundingClientRect();
    dragOffsetY = clientY - rect.top;

    e.preventDefault();
}

function onDragMove(e) {
    if (!isDragging) return;

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const newTop = clientY - dragOffsetY;

    // Clamp to viewport
    const maxTop = window.innerHeight - readingBarEl.offsetHeight;
    const clamped = Math.max(0, Math.min(newTop, maxTop));

    readingBarEl.style.top = `${clamped}px`;

    e.preventDefault();
}

function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    readingBarEl.classList.remove('reading-bar--dragging');

    // Save position
    localStorage.setItem('readingBarTop', readingBarEl.style.top);
}

// --- Settings ---

function setReadingBarStyle(style) {
    readingBarState.style = style;
    applyReadingBarStyle();
    saveReadingBar();
    updateReadingBarControls();
}

function setReadingBarLines(lines) {
    readingBarState.lines = parseInt(lines);
    applyReadingBarStyle();
    saveReadingBar();
}

function setReadingBarOpacity(opacity) {
    readingBarState.opacity = parseFloat(opacity);
    applyReadingBarStyle();
    saveReadingBar();
}

function setReadingBarColour(colour) {
    readingBarState.colour = colour;
    applyReadingBarStyle();
    saveReadingBar();
}

function saveReadingBar() {
    localStorage.setItem('readingBar', JSON.stringify(readingBarState));
    debounceSavePreferences();
}

/**
 * Update settings panel controls to reflect current state
 */
function updateReadingBarControls() {
    const toggle = document.getElementById('reading-bar-toggle');
    if (toggle) toggle.checked = readingBarState.enabled;

    // Show/hide sub-controls
    const controls = document.getElementById('reading-bar-controls');
    if (controls) {
        controls.classList.toggle('active', readingBarState.enabled);
    }

    const styleSelect = document.getElementById('reading-bar-style');
    if (styleSelect) styleSelect.value = readingBarState.style;

    const linesSelect = document.getElementById('reading-bar-lines');
    if (linesSelect) linesSelect.value = readingBarState.lines;

    const opacitySlider = document.getElementById('reading-bar-opacity');
    if (opacitySlider) {
        opacitySlider.value = readingBarState.opacity;
        const label = document.getElementById('reading-bar-opacity-value');
        if (label) label.textContent = `${Math.round(readingBarState.opacity * 100)}%`;
    }

    const colourPicker = document.getElementById('reading-bar-colour');
    if (colourPicker) colourPicker.value = readingBarState.colour;

    // Show/hide opacity control (only relevant for highlight style)
    const opacityRow = document.getElementById('reading-bar-opacity-row');
    if (opacityRow) {
        opacityRow.style.display = readingBarState.style === 'highlight' ? '' : 'none';
    }
}

/**
 * Recalculate bar height when typography changes
 */
function onTypographyChange() {
    if (readingBarState.enabled) {
        applyReadingBarStyle();
    }
}
