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

    // Load annotation sets
    loadAnnotationSets();

    // Load known tags from localStorage
    loadKnownTags();

    // Check auth status
    const { data: { session } } = await supabase.auth.getSession();

    // Start loading Bible in background
    const bibleLoadPromise = loadBibleData();

    if (session) {
        // Returning user - show loading message if Bible not ready yet
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (hasSeenWelcome && !bibleData) {
            // Show loading message for returning users
            document.getElementById('bible-loading-message').style.display = 'block';
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
            // Ensure Bible is loaded before showing content
            await bibleLoadPromise;
            await handleAuthSuccess(session.user);
        } else if (event === 'SIGNED_OUT') {
            handleSignOut();
        }
    });

    setupEventListeners();
}

// Setup all event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Settings menu toggle - add both click and touchend for mobile
    const menuBtn = document.getElementById('menu-btn');
    menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSettingsMenu();
    });
    menuBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSettingsMenu();
    });

    // Close settings menu when clicking outside
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('settings-menu');
        const btn = document.getElementById('menu-btn');
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.remove('open');
        }
    });

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
document.addEventListener('DOMContentLoaded', initApp);
