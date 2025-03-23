// =====================================
// 🚀 header.js (v3.0)
// Dynamic Floating Header with Session-Aware Buttons
// =====================================

document.addEventListener('DOMContentLoaded', buildHeader);

async function buildHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    header.innerHTML = `
    <nav class="floating-header animated fadeInDown">
    <div class="header-btn-group left">
    <button id="aiChatBtn" class="header-btn">AI Chat</button>
    <button class="header-btn soon" disabled>Soon</button>
    <button class="header-btn soon" disabled>Soon</button>
    </div>

    <div class="header-logo pulse-logo">
    <img src="/assets/aw_logo_transparent_64x64.png" alt="AW Logo" />
    </div>

    <div class="header-btn-group right">
    <button id="loginProfileBtn" class="header-btn">Login</button>
    <button id="registerLogoutBtn" class="header-btn">Register</button>
    <button class="header-btn soon" disabled>Soon</button>
    </div>
    </nav>
    `;

    await updateHeaderButtons();
    attachHeaderEvents();
}

// Update header buttons based on session status
async function updateHeaderButtons() {
    try {
        const res = await fetch('/auth/ajax_check_session.php');
        const session = await res.json();

        const loginProfileBtn = document.getElementById('loginProfileBtn');
        const registerLogoutBtn = document.getElementById('registerLogoutBtn');

        if (session.authenticated) {
            loginProfileBtn.textContent = 'Profile';
            registerLogoutBtn.textContent = 'Logout';
            loginProfileBtn.title = 'View your profile';
            registerLogoutBtn.title = 'Logout';
        } else {
            loginProfileBtn.textContent = 'Login';
            registerLogoutBtn.textContent = 'Register';
            loginProfileBtn.title = 'Login to your account';
            registerLogoutBtn.title = 'Register a new account';
        }

        // AI Chat/Home dynamic label
        const aiChatBtn = document.getElementById('aiChatBtn');
        if (window.location.pathname.includes('chat')) {
            aiChatBtn.textContent = 'Home';
            aiChatBtn.title = 'Back to Homepage';
        } else {
            aiChatBtn.textContent = 'AI Chat';
            aiChatBtn.title = 'Go to AI Chat';
        }
    } catch (err) {
        console.error('[Header] Failed to check session:', err);
    }
}

// Attach button click events
function attachHeaderEvents() {
    const aiChatBtn = document.getElementById('aiChatBtn');
    const loginProfileBtn = document.getElementById('loginProfileBtn');
    const registerLogoutBtn = document.getElementById('registerLogoutBtn');

    if (aiChatBtn) {
        aiChatBtn.addEventListener('click', () => {
            const isChatPage = window.location.pathname.includes('chat');
            window.location.href = isChatPage ? '/index.html' : '/chat/chat.html';
        });
    }

    if (loginProfileBtn) {
        loginProfileBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/auth/ajax_check_session.php');
                const session = await res.json();
                if (session.authenticated) {
                    openProfileModal();
                } else {
                    openLoginModal();
                }
            } catch (err) {
                console.error('Error checking session:', err);
            }
        });
    }

    if (registerLogoutBtn) {
        registerLogoutBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/auth/ajax_check_session.php');
                const session = await res.json();
                if (session.authenticated) {
                    // Perform logout
                    window.location.href = '/auth/logout.php';
                } else {
                    openRegisterModal();
                }
            } catch (err) {
                console.error('Error checking session:', err);
            }
        });
    }
}

// Modal opening helpers
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('hidden');
}

function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.classList.remove('hidden');
}

function openProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.remove('hidden');
        if (typeof loadProfile === 'function') {
            loadProfile();
        }
    }
}
