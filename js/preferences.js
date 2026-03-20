// User Preferences Module - Cloud-synced settings

const DEFAULT_PREFERENCES = {
    theme: 'paper',
    fontFamily: 'system',
    fontSize: 16,
    lineSpacing: 1.5,
    letterSpacing: 0,
    wordSpacing: 0,
    readingMode: 'verse',
    verseNumberStyle: 'superscript',
    annotationMode: 'on'
};

// Load user preferences from Supabase
async function loadUserPreferences() {
    if (!currentUser) return;

    try {
        const { data, error } = await supabase
            .from('user_preferences')
            .select('preferences')
            .eq('user_id', currentUser.id)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
            throw error;
        }

        if (data && data.preferences) {
            // Apply preferences
            const prefs = { ...DEFAULT_PREFERENCES, ...data.preferences };

            // Theme
            if (prefs.theme) {
                changeTheme(prefs.theme);
                const themeSelect = document.getElementById('theme-select');
                if (themeSelect) themeSelect.value = prefs.theme;
            }

            // Typography
            if (prefs.fontFamily || prefs.fontSize || prefs.lineSpacing || prefs.letterSpacing || prefs.wordSpacing) {
                applyTypography({
                    fontFamily: prefs.fontFamily,
                    fontSize: prefs.fontSize,
                    lineSpacing: prefs.lineSpacing,
                    letterSpacing: prefs.letterSpacing,
                    wordSpacing: prefs.wordSpacing
                });

                // Update UI controls
                const fontSelect = document.getElementById('font-family');
                if (fontSelect) fontSelect.value = prefs.fontFamily;

                const fontSizeSlider = document.getElementById('font-size');
                if (fontSizeSlider) {
                    fontSizeSlider.value = prefs.fontSize;
                    document.getElementById('font-size-value').textContent = `${prefs.fontSize}px`;
                }

                const lineSpacingSlider = document.getElementById('line-spacing');
                if (lineSpacingSlider) {
                    lineSpacingSlider.value = prefs.lineSpacing;
                    document.getElementById('line-spacing-value').textContent = `${prefs.lineSpacing}x`;
                }

                const letterSpacingSlider = document.getElementById('letter-spacing');
                if (letterSpacingSlider) {
                    letterSpacingSlider.value = prefs.letterSpacing;
                    document.getElementById('letter-spacing-value').textContent =
                        prefs.letterSpacing === 0 ? 'Normal' : `${prefs.letterSpacing}em`;
                }

                const wordSpacingSlider = document.getElementById('word-spacing');
                if (wordSpacingSlider) {
                    wordSpacingSlider.value = prefs.wordSpacing;
                    document.getElementById('word-spacing-value').textContent =
                        prefs.wordSpacing === 0 ? 'Normal' : `${prefs.wordSpacing}em`;
                }
            }

            // Reading mode
            if (prefs.readingMode) {
                setReadingMode(prefs.readingMode);
                const readingModeSelect = document.getElementById('reading-mode');
                if (readingModeSelect) readingModeSelect.value = prefs.readingMode;
            }

            // Verse number style
            if (prefs.verseNumberStyle) {
                setVerseNumberStyle(prefs.verseNumberStyle);
                const verseStyleSelect = document.getElementById('verse-number-style');
                if (verseStyleSelect) verseStyleSelect.value = prefs.verseNumberStyle;
            }

            // Annotation mode
            if (prefs.annotationMode) {
                setAnnotationMode(prefs.annotationMode);
                const annotationModeSelect = document.getElementById('annotation-mode');
                if (annotationModeSelect) annotationModeSelect.value = prefs.annotationMode;
            }

            console.log('User preferences loaded from cloud');
        } else {
            console.log('No saved preferences, using defaults');
        }
    } catch (error) {
        console.error('Error loading user preferences:', error);
    }
}

// Save user preferences to Supabase
async function saveUserPreferences() {
    if (!currentUser) return;

    try {
        // Gather current preferences
        const preferences = {
            theme: document.documentElement.getAttribute('data-theme') || 'paper',
            fontFamily: document.getElementById('font-family')?.value || 'system',
            fontSize: parseInt(document.getElementById('font-size')?.value || 16),
            lineSpacing: parseFloat(document.getElementById('line-spacing')?.value || 1.5),
            letterSpacing: parseFloat(document.getElementById('letter-spacing')?.value || 0),
            wordSpacing: parseFloat(document.getElementById('word-spacing')?.value || 0),
            readingMode: readingMode,
            verseNumberStyle: verseNumberStyle,
            annotationMode: document.getElementById('annotation-mode')?.value || 'on'
        };

        // Upsert to Supabase (use user_id for conflict detection, not primary key)
        const { error } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: currentUser.id,
                preferences: preferences,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (error) throw error;

        console.log('User preferences saved to cloud');
    } catch (error) {
        console.error('Error saving user preferences:', error);
    }
}

// Debounced save to avoid too many requests
let savePreferencesTimeout = null;
function debounceSavePreferences() {
    if (savePreferencesTimeout) {
        clearTimeout(savePreferencesTimeout);
    }
    savePreferencesTimeout = setTimeout(() => {
        saveUserPreferences();
    }, 1000); // Wait 1 second after last change
}
