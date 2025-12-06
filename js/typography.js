// Typography Controls - Font, size, spacing

// Default values
const DEFAULT_TYPOGRAPHY = {
    fontFamily: 'system',
    fontSize: 16,
    lineSpacing: 1.5,
    letterSpacing: 0,
    wordSpacing: 0
};

// Dyslexia-optimised preset (research-backed)
const DYSLEXIA_TYPOGRAPHY = {
    fontFamily: 'atkinson',
    fontSize: 20,
    lineSpacing: 1.8,
    letterSpacing: 0.08,  // 0.08em = research-backed optimal
    wordSpacing: 0.15     // 1.15x word spacing
};

// Current typography state
let currentTypography = { ...DEFAULT_TYPOGRAPHY };

/**
 * Load typography settings from localStorage
 */
function loadTypography() {
    const saved = localStorage.getItem('typography');
    if (saved) {
        try {
            currentTypography = { ...DEFAULT_TYPOGRAPHY, ...JSON.parse(saved) };
        } catch (e) {
            currentTypography = { ...DEFAULT_TYPOGRAPHY };
        }
    }

    // Apply to DOM
    applyTypography(currentTypography);

    // Update UI controls
    updateTypographyControls();
}

/**
 * Save typography settings to localStorage
 */
function saveTypography() {
    localStorage.setItem('typography', JSON.stringify(currentTypography));
}

/**
 * Apply typography settings to content
 */
function applyTypography(settings) {
    const content = document.getElementById('content');
    if (!content) return;

    // Font family (via data attribute for CSS)
    content.setAttribute('data-font', settings.fontFamily);

    // Font size
    content.style.fontSize = `${settings.fontSize}px`;

    // Line spacing
    content.style.lineHeight = settings.lineSpacing;

    // Letter spacing
    content.style.letterSpacing = settings.letterSpacing > 0 ? `${settings.letterSpacing}em` : 'normal';

    // Word spacing
    content.style.wordSpacing = settings.wordSpacing > 0 ? `${settings.wordSpacing}em` : 'normal';
}

/**
 * Update UI controls to match current settings
 */
function updateTypographyControls() {
    // Font family
    const fontSelect = document.getElementById('font-family');
    if (fontSelect) fontSelect.value = currentTypography.fontFamily;

    // Font size
    const fontSizeSlider = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    if (fontSizeSlider) fontSizeSlider.value = currentTypography.fontSize;
    if (fontSizeValue) fontSizeValue.textContent = `${currentTypography.fontSize}px`;

    // Line spacing
    const lineSpacingSlider = document.getElementById('line-spacing');
    const lineSpacingValue = document.getElementById('line-spacing-value');
    if (lineSpacingSlider) lineSpacingSlider.value = currentTypography.lineSpacing;
    if (lineSpacingValue) lineSpacingValue.textContent = `${currentTypography.lineSpacing}x`;

    // Letter spacing
    const letterSpacingSlider = document.getElementById('letter-spacing');
    const letterSpacingValue = document.getElementById('letter-spacing-value');
    if (letterSpacingSlider) letterSpacingSlider.value = currentTypography.letterSpacing;
    if (letterSpacingValue) {
        letterSpacingValue.textContent = currentTypography.letterSpacing === 0
            ? 'Normal'
            : `${(currentTypography.letterSpacing * 100).toFixed(0)}%`;
    }

    // Word spacing
    const wordSpacingSlider = document.getElementById('word-spacing');
    const wordSpacingValue = document.getElementById('word-spacing-value');
    if (wordSpacingSlider) wordSpacingSlider.value = currentTypography.wordSpacing;
    if (wordSpacingValue) {
        wordSpacingValue.textContent = currentTypography.wordSpacing === 0
            ? 'Normal'
            : `${(currentTypography.wordSpacing * 100).toFixed(0)}%`;
    }
}

/**
 * Set font family
 */
function setFontFamily(font) {
    currentTypography.fontFamily = font;
    applyTypography(currentTypography);
    saveTypography();
}

/**
 * Set font size
 */
function setFontSize(size) {
    currentTypography.fontSize = parseInt(size);
    applyTypography(currentTypography);
    saveTypography();

    // Update value display
    const valueEl = document.getElementById('font-size-value');
    if (valueEl) valueEl.textContent = `${size}px`;
}

/**
 * Set line spacing
 */
function setLineSpacing(spacing) {
    currentTypography.lineSpacing = parseFloat(spacing);
    applyTypography(currentTypography);
    saveTypography();

    // Update value display
    const valueEl = document.getElementById('line-spacing-value');
    if (valueEl) valueEl.textContent = `${parseFloat(spacing).toFixed(1)}x`;
}

/**
 * Set letter spacing
 */
function setLetterSpacing(spacing) {
    currentTypography.letterSpacing = parseFloat(spacing);
    applyTypography(currentTypography);
    saveTypography();

    // Update value display
    const valueEl = document.getElementById('letter-spacing-value');
    if (valueEl) {
        valueEl.textContent = spacing == 0
            ? 'Normal'
            : `${(parseFloat(spacing) * 100).toFixed(0)}%`;
    }
}

/**
 * Set word spacing
 */
function setWordSpacing(spacing) {
    currentTypography.wordSpacing = parseFloat(spacing);
    applyTypography(currentTypography);
    saveTypography();

    // Update value display
    const valueEl = document.getElementById('word-spacing-value');
    if (valueEl) {
        valueEl.textContent = spacing == 0
            ? 'Normal'
            : `${(parseFloat(spacing) * 100).toFixed(0)}%`;
    }
}

/**
 * Reset typography to defaults
 */
function resetTypography() {
    currentTypography = { ...DEFAULT_TYPOGRAPHY };
    applyTypography(currentTypography);
    updateTypographyControls();
    saveTypography();
}

/**
 * Apply dyslexia-optimised preset
 */
function applyDyslexiaPreset() {
    currentTypography = { ...DYSLEXIA_TYPOGRAPHY };
    applyTypography(currentTypography);
    updateTypographyControls();
    saveTypography();
}
