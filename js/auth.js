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

    // Load annotations
    await loadAnnotations();

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
