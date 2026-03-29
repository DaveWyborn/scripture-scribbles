// App Module - Main initialization and event listeners

// Initialize application
async function initApp() {
    // Load theme preference
    loadTheme();

    // Load annotation visibility mode
    loadAnnotationMode();

    // Load reading mode preferences
    loadReadingMode();
    loadVerseNumberStyle();

    // Load typography preferences
    loadTypography();

    // Load annotation sets
    loadAnnotationSets();

    // Load known tags from localStorage
    loadKnownTags();

    // Load reading history (localStorage for guests, Supabase for logged-in users)
    if (typeof initReadingHistory === 'function') {
        await initReadingHistory();
    }

    // Check auth status
    const { data: { session } } = await supabase.auth.getSession();

    // Start loading Bible in background
    const bibleLoadPromise = loadBibleData();

    if (session) {
        // Show loading message while Bible loads
        if (!bibleData) {
            const loadingMsg = document.getElementById('bible-loading-message');
            if (loadingMsg) loadingMsg.style.display = 'block';
        }

        // Wait for Bible to load before showing content
        await bibleLoadPromise;
        await handleAuthSuccess(session.user);
    } else {
        // No user logged in - show welcome screen immediately
        // Bible loads in background whilst they sign up
        const welcomeEl = document.querySelector('.welcome');
        if (welcomeEl) {
            welcomeEl.style.display = 'block';
        }

        // Continue loading Bible in background
        bibleLoadPromise.then(() => {
            console.log('✅ Bible ready for new user');
        });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session && !currentUser) {
            // Merge any guest reading history before handling auth
            if (typeof mergeGuestHistoryToSupabase === 'function') {
                await mergeGuestHistoryToSupabase();
            }
            // Ensure Bible is loaded before showing content
            await bibleLoadPromise;
            await handleAuthSuccess(session.user);
        } else if (event === 'SIGNED_OUT') {
            handleSignOut();
        }
    });

    setupEventListeners();

    // Initialize sermon notes module (after user is loaded if applicable)
    if (typeof initSermons === 'function') {
        await initSermons();
    }
}

// Setup all event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Settings panel toggle
    const menuBtn = document.getElementById('menu-btn');
    menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSettingsPanel();
    });
    menuBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSettingsPanel();
    });

    // Close panel via close button
    const closePanelBtn = document.getElementById('close-panel-btn');
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', closeSettingsPanel);
    }

    // Close panel via overlay click
    const overlay = document.getElementById('settings-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeSettingsPanel);
    }

    // Theme selector
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        const savedTheme = localStorage.getItem('theme') || 'paper';
        themeSelect.value = savedTheme;
        themeSelect.addEventListener('change', (e) => {
            changeTheme(e.target.value);
        });
    }

    // Annotation mode selector
    const annotationModeSelect = document.getElementById('annotation-mode');
    if (annotationModeSelect) {
        annotationModeSelect.addEventListener('change', (e) => {
            setAnnotationMode(e.target.value);
        });
    }

    // Reading mode selector
    const readingModeSelect = document.getElementById('reading-mode');
    if (readingModeSelect) {
        readingModeSelect.addEventListener('change', (e) => {
            setReadingMode(e.target.value);
        });
    }

    // Verse number style selector
    const verseNumberStyleSelect = document.getElementById('verse-number-style');
    if (verseNumberStyleSelect) {
        verseNumberStyleSelect.addEventListener('change', (e) => {
            setVerseNumberStyle(e.target.value);
        });
    }

    // Typography controls
    const fontFamilySelect = document.getElementById('font-family');
    if (fontFamilySelect) {
        fontFamilySelect.addEventListener('change', (e) => {
            setFontFamily(e.target.value);
        });
    }

    const fontSizeSlider = document.getElementById('font-size');
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', (e) => {
            setFontSize(e.target.value);
        });
    }

    const lineSpacingSlider = document.getElementById('line-spacing');
    if (lineSpacingSlider) {
        lineSpacingSlider.addEventListener('input', (e) => {
            setLineSpacing(e.target.value);
        });
    }

    const letterSpacingSlider = document.getElementById('letter-spacing');
    if (letterSpacingSlider) {
        letterSpacingSlider.addEventListener('input', (e) => {
            setLetterSpacing(e.target.value);
        });
    }

    const wordSpacingSlider = document.getElementById('word-spacing');
    if (wordSpacingSlider) {
        wordSpacingSlider.addEventListener('input', (e) => {
            setWordSpacing(e.target.value);
        });
    }

    const typographyResetBtn = document.getElementById('typography-reset');
    if (typographyResetBtn) {
        typographyResetBtn.addEventListener('click', resetTypography);
    }

    const typographyDyslexiaBtn = document.getElementById('typography-dyslexia');
    if (typographyDyslexiaBtn) {
        typographyDyslexiaBtn.addEventListener('click', applyDyslexiaPreset);
    }

    // Auth buttons
    const signInBtn = document.getElementById('sign-in-btn');
    const signUpBtn = document.getElementById('sign-up-btn');
    const getStartedBtn = document.getElementById('get-started-btn');

    console.log('Buttons found:', { signInBtn, signUpBtn, getStartedBtn });

    if (signInBtn) signInBtn.addEventListener('click', () => {
        console.log('Sign in clicked');
        showAuthModal(false);
    });
    if (signUpBtn) signUpBtn.addEventListener('click', () => {
        console.log('Sign up clicked');
        showAuthModal(true);
    });
    if (getStartedBtn) getStartedBtn.addEventListener('click', () => {
        console.log('Get started clicked');
        if (currentUser) {
            // User is logged in, mark welcome as seen and show Bible
            localStorage.setItem('hasSeenWelcome', 'true');
            document.querySelector('.welcome').style.display = 'none';
            displayChapter();
        } else {
            // User not logged in, show sign up modal
            showAuthModal(true);
        }
    });
    document.getElementById('sign-out-btn').addEventListener('click', signOut);
    document.getElementById('auth-cancel').addEventListener('click', hideAuthModal);
    document.getElementById('auth-form').addEventListener('submit', handleAuth);
    document.getElementById('auth-toggle-link').addEventListener('click', toggleAuthMode);

    // Navigation - chapter-info now opens nav modal
    document.getElementById('chapter-info').addEventListener('click', openNavModal);
    document.getElementById('close-nav-modal').addEventListener('click', closeNavModal);
    document.getElementById('nav-tab-book').addEventListener('click', () => showNavTab('book'));
    document.getElementById('nav-tab-chapter').addEventListener('click', () => showNavTab('chapter'));

    // Annotation set switcher
    document.getElementById('set-switcher-btn').addEventListener('click', openSetModal);
    document.getElementById('prev-chapter').addEventListener('click', () => navigateChapter(-1));
    document.getElementById('next-chapter').addEventListener('click', () => navigateChapter(1));

    // Close modal on background click
    document.getElementById('nav-modal').addEventListener('click', (e) => {
        if (e.target.id === 'nav-modal') closeNavModal();
    });

    // Annotation panel
    document.getElementById('close-annotation').addEventListener('click', closeAnnotationPanel);
    document.querySelectorAll('.color-option').forEach(el => {
        el.addEventListener('click', () => selectHighlight(el.dataset.color));
    });
    document.getElementById('clear-highlight').addEventListener('click', clearHighlight);
    document.getElementById('save-annotation').addEventListener('click', saveAnnotation);

    // Tag management
    document.getElementById('add-tag-btn').addEventListener('click', addTag);
    document.getElementById('new-tag-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    });
    document.getElementById('new-tag-color').addEventListener('click', showColorPicker);

    // Export functionality
    document.getElementById('export-notes-btn').addEventListener('click', openExportModal);
    document.getElementById('export-cancel').addEventListener('click', hideExportModal);
    document.getElementById('export-markdown').addEventListener('click', exportMarkdown);
    document.getElementById('export-json').addEventListener('click', exportJSON);
    document.getElementById('export-switch-web').addEventListener('click', switchToWebExport);
    document.getElementById('export-modal').addEventListener('click', (e) => {
        if (e.target.id === 'export-modal') hideExportModal();
    });
    document.getElementById('export-annotation-set').addEventListener('change', loadExportData);

    // Tag management
    document.getElementById('manage-tags-btn').addEventListener('click', openTagManager);
    document.getElementById('tag-manager-close').addEventListener('click', closeTagManager);
    document.getElementById('tag-manager-modal').addEventListener('click', (e) => {
        if (e.target.id === 'tag-manager-modal') closeTagManager();
    });

    // Sermon notes toggle button
    const toggleNotesBtn = document.getElementById('toggle-notes-btn');
    if (toggleNotesBtn) {
        toggleNotesBtn.addEventListener('click', toggleNotesView);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd+Shift+N - Toggle notes
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            if (currentUser && typeof toggleNotesView === 'function') {
                toggleNotesView();
            }
        }

        // Ctrl/Cmd+S - Manual save sermon
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && currentSermon) {
            e.preventDefault();
            if (typeof saveSermon === 'function') {
                saveSermon();
            }
        }
    });

    // Annotation set management
    document.getElementById('close-set-modal').addEventListener('click', closeSetModal);
    document.getElementById('create-set-btn').addEventListener('click', createSet);
    document.getElementById('new-set-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            createSet();
        }
    });
    document.getElementById('set-modal').addEventListener('click', (e) => {
        if (e.target.id === 'set-modal') closeSetModal();
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 DOM loaded - checking for sermon-notes-view...');
    const notesView = document.getElementById('sermon-notes-view');
    console.log('sermon-notes-view in initial HTML:', {
        exists: !!notesView,
        parent: notesView ? notesView.parentElement?.id : 'N/A',
        display: notesView ? notesView.style.display : 'N/A',
        classList: notesView ? Array.from(notesView.classList) : []
    });

    initApp();
});
