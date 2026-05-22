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

    // Show universal notes toggle in header (works on all viewports)
    const notesToggleBtn = document.getElementById('notes-toggle-btn');
    if (notesToggleBtn) {
        notesToggleBtn.style.display = '';
    }

    // Load annotations
    await loadAnnotations();

    // Load reading history from cloud (initReadingHistory ran before currentUser was set)
    if (typeof loadReadingHistoryFromSupabase === 'function') {
        await loadReadingHistoryFromSupabase();
    }

    // Load private-Bible access grants before preferences (prefs may select a private version)
    if (typeof loadUserBibleAccess === 'function') {
        await loadUserBibleAccess();
    }

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
    if (typeof userBibleAccess !== 'undefined') {
        userBibleAccess = new Set();
        if (typeof updateBibleVersionPicker === 'function') updateBibleVersionPicker();
    }
    // If signed-in user was reading a private version, drop back to default
    if (typeof isPrivateVersion === 'function' && isPrivateVersion(currentBibleVersion)) {
        switchBibleVersion('web').catch(e => console.warn('Fallback to WEB failed:', e));
    }
    document.getElementById('settings-user-info').style.display = 'none';
    document.getElementById('settings-guest-buttons').style.display = 'flex';
    document.getElementById('navigation').style.display = 'none';

    // Show welcome screen
    document.getElementById('content').innerHTML = `
        <div class="welcome">
            <h2>Welcome to<br>Scripture Scribbles</h2>
            <p>A beautiful Bible reader designed around how you read.</p>

            <div class="features">
                <div class="feature">
                    <h3>📖 Instant Access</h3>
                    <p>Three translations built in — World English Bible, ASV, and KJV. More on the way.</p>
                </div>
                <div class="feature">
                    <h3>🎛 Reading Your Way</h3>
                    <p>Tune the font, size, spacing, and colour until the page suits your eyes. 24 themes and accessibility-minded typography mean the words get out of your way.</p>
                </div>
                <div class="feature">
                    <h3>✨ Beautiful Annotations</h3>
                    <p>Highlight verses, add notes, and organise your studies across multiple annotation sets.</p>
                </div>
                <div class="feature">
                    <h3>📄 Passage Mode</h3>
                    <p>Put off by long chapters? Passage mode splits the text into smaller, manageable chunks.</p>
                </div>
            </div>

            <button class="btn primary" id="get-started-btn-2" style="font-size: 1.2em; padding: 15px 40px;">Get Started</button>
            <p class="free-tagline">Core features always free.</p>
        </div>
    `;
    document.getElementById('get-started-btn-2').addEventListener('click', () => showAuthModal(true));
}
