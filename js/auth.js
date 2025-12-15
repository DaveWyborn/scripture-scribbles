// Authentication module - Supabase auth + session management

// Initialize Supabase client (assign to global variable from state.js)
supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Show auth modal (sign in or sign up)
function showAuthModal(signUp = false) {
    isSignUp = signUp;
    document.getElementById('auth-modal-title').textContent = signUp ? 'Sign Up' : 'Sign In';
    document.getElementById('auth-submit').textContent = signUp ? 'Sign Up' : 'Sign In';
    document.getElementById('auth-toggle-text').innerHTML = signUp
        ? 'Already have an account? <a id="auth-toggle-link">Sign in</a>'
        : 'Don\'t have an account? <a id="auth-toggle-link">Sign up</a>';

    // Re-attach toggle listener
    document.getElementById('auth-toggle-link').addEventListener('click', toggleAuthMode);
    document.getElementById('auth-modal').classList.add('active');
    document.getElementById('auth-message').innerHTML = '';
    document.getElementById('auth-form').reset();

    // Show/hide remember me checkbox (only for sign in) - after reset
    const rememberGroup = document.getElementById('auth-remember').parentElement;
    if (signUp) {
        rememberGroup.style.display = 'none';
    } else {
        rememberGroup.style.display = 'flex';
        // Restore remember me preference (default: true)
        const rememberMe = localStorage.getItem('rememberMe') !== 'false';
        document.getElementById('auth-remember').checked = rememberMe;
    }
}

// Hide auth modal
function hideAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

// Toggle between sign in and sign up
function toggleAuthMode() {
    hideAuthModal();
    showAuthModal(!isSignUp);
}

// Handle authentication (sign in or sign up)
async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const rememberMe = document.getElementById('auth-remember').checked;
    const messageEl = document.getElementById('auth-message');

    try {
        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            messageEl.innerHTML = '<div class="success-message">Account created! Please check your email to verify.</div>';
            setTimeout(() => {
                hideAuthModal();
                showAuthModal(false); // Switch to sign in
            }, 2000);
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            // Store remember me preference
            localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');

            // If not remember me, sign out when browser closes
            if (!rememberMe) {
                window.addEventListener('beforeunload', () => {
                    supabase.auth.signOut();
                });
            }

            hideAuthModal();
        }
    } catch (error) {
        messageEl.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
}

// Sign out
async function signOut() {
    await supabase.auth.signOut();
}

// Handle successful authentication
async function handleAuthSuccess(user) {
    currentUser = user;
    document.getElementById('settings-user-email').textContent = user.email;
    document.getElementById('settings-user-info').style.display = 'flex';
    document.getElementById('settings-guest-buttons').style.display = 'none';
    document.getElementById('navigation').style.display = 'flex';

    // Show sermon notes toggle button (desktop)
    const toggleNotesBtn = document.getElementById('toggle-notes-btn');
    console.log('🔍 Toggle button debug:', {
        element: toggleNotesBtn,
        windowWidth: window.innerWidth,
        isDesktop: window.innerWidth >= 768,
        currentDisplay: toggleNotesBtn?.style.display
    });

    if (toggleNotesBtn && window.innerWidth >= 768) {
        toggleNotesBtn.style.display = 'flex';

        // Force visibility with important inline styles
        toggleNotesBtn.style.setProperty('display', 'flex', 'important');
        toggleNotesBtn.style.visibility = 'visible';
        toggleNotesBtn.style.opacity = '1';

        console.log('✅ Desktop: Showing toggle button');
        console.log('After setting display:', {
            display: toggleNotesBtn.style.display,
            visibility: toggleNotesBtn.style.visibility,
            computedDisplay: window.getComputedStyle(toggleNotesBtn).display,
            computedVisibility: window.getComputedStyle(toggleNotesBtn).visibility,
            offsetWidth: toggleNotesBtn.offsetWidth,
            offsetHeight: toggleNotesBtn.offsetHeight
        });
    }

    // Show mobile view indicator (mobile)
    const mobileIndicator = document.getElementById('mobile-view-indicator');
    console.log('🔍 Mobile indicator debug:', {
        element: mobileIndicator,
        isMobile: window.innerWidth < 768
    });

    if (mobileIndicator && window.innerWidth < 768) {
        mobileIndicator.style.display = 'flex';
        console.log('✅ Mobile: Showing view indicator');
    }

    // Load annotations
    await loadAnnotations();

    // Load user preferences from cloud
    await loadUserPreferences();

    // Check if first visit
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    const welcomeEl = document.querySelector('.welcome');

    if (!hasSeenWelcome) {
        // First-time logged-in user - show welcome screen once
        if (welcomeEl) {
            welcomeEl.style.display = 'block';
        }
    } else {
        // Returning user - hide welcome and show Bible
        if (welcomeEl) {
            welcomeEl.style.display = 'none';
        }
        displayChapter();
    }
}

// Handle sign out
function handleSignOut() {
    currentUser = null;
    currentAnnotations = {};
    document.getElementById('settings-user-info').style.display = 'none';
    document.getElementById('settings-guest-buttons').style.display = 'flex';
    document.getElementById('navigation').style.display = 'none';

    // Show welcome screen
    document.getElementById('content').innerHTML = `
        <div class="welcome">
            <h2>Welcome to Scripture Scribbles</h2>
            <p>Your dyslexia-friendly Bible study companion with rich annotations and sermon notes.</p>

            <div class="features">
                <div class="feature">
                    <h3>📖 Instant Access</h3>
                    <p>World English Bible embedded. No downloads or setup required.</p>
                </div>
                <div class="feature">
                    <h3>✨ Beautiful Annotations</h3>
                    <p>Highlight verses, add notes, and organize your studies.</p>
                </div>
                <div class="feature">
                    <h3>☁️ Sync Everywhere</h3>
                    <p>Your notes sync across all your devices automatically.</p>
                </div>
                <div class="feature">
                    <h3>♿ Accessible</h3>
                    <p>Designed for people with dyslexia. Clean, customizable, readable.</p>
                </div>
            </div>

            <button class="btn primary" id="get-started-btn-2" style="font-size: 1.2em; padding: 15px 40px;">Get Started</button>
        </div>
    `;
    document.getElementById('get-started-btn-2').addEventListener('click', () => showAuthModal(true));
}
