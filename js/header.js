// =====================================
// 🚀 header.js (v5.0 FINAL)
// Fully Dynamic Floating Header
// =====================================

document.addEventListener('DOMContentLoaded', buildHeader);

// Build Dynamic Header
async function buildHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    header.innerHTML = `
    <nav class="floating-header">
    <div class="header-btn-group left">
    <button id="aiChatBtn" class="header-btn">AI Chat</button>
    <button class="header-btn soon" disabled>Coming Soon</button>
    <button class="header-btn soon" disabled>Coming Soon</button>
    </div>

    <div class="header-logo animated">
    <img src="/assets/aw_logo_transparent_64x64.png" alt="Aver-Web Logo">
    </div>

    <div class="header-btn-group right">
    <button id="loginProfileBtn" class="header-btn">Login</button>
    <button id="registerLogoutBtn" class="header-btn">Register</button>
    <button class="header-btn soon" disabled>Coming Soon</button>
    </div>
    </nav>
    `;

    await updateHeaderSessionButtons();
    attachHeaderEvents();
}

// Check Session and Update Header Buttons
async function updateHeaderSessionButtons() {
    try {
        const res = await fetch('/auth/ajax_check_session.php');
        const session = await res.json();

        const loginProfileBtn = document.getElementById('loginProfileBtn');
        const registerLogoutBtn = document.getElementById('registerLogoutBtn');

        if (session.authenticated) {
            loginProfileBtn.textContent = 'Profile';
            loginProfileBtn.setAttribute('data-user', session.username);
            registerLogoutBtn.textContent = 'Logout';
        } else {
            loginProfileBtn.textContent = 'Login';
            registerLogoutBtn.textContent = 'Register';
        }

        // Change "AI Chat" to "Home" if already on /chat.html
        const aiChatBtn = document.getElementById('aiChatBtn');
        if (window.location.pathname.includes('/chat')) {
            aiChatBtn.textContent = 'Home';
        } else {
            aiChatBtn.textContent = 'AI Chat';
        }

    } catch (error) {
        console.error('Header session check error:', error);
    }
}

// Attach Header Button Events
function attachHeaderEvents() {
    const aiChatBtn = document.getElementById('aiChatBtn');
    const loginProfileBtn = document.getElementById('loginProfileBtn');
    const registerLogoutBtn = document.getElementById('registerLogoutBtn');

    // AI Chat = switch between home/chat
    aiChatBtn?.addEventListener('click', () => {
        const isChatPage = window.location.pathname.includes('/chat');
        window.location.href = isChatPage ? '/' : '/chat/chat.html';
    });

    // Login/Profile Button
    loginProfileBtn?.addEventListener('click', async () => {
        const res = await fetch('/auth/ajax_check_session.php');
        const session = await res.json();
        if (session.authenticated) {
            openModal('profileModal');
            loadProfile(); // Trigger profile load
        } else {
            openModal('loginModal');
        }
    });

    // Register/Logout Button
    registerLogoutBtn?.addEventListener('click', async () => {
        const res = await fetch('/auth/ajax_check_session.php');
        const session = await res.json();
        if (session.authenticated) {
            logoutUser();
        } else {
            openModal('registerModal');
        }
    });
}

// Utility Modal Open (if not globally defined already)
function openModal(id) {
    closeAllModals();
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('hidden');
}

// Utility Modal Close
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
}

// Logout Shortcut
function logoutUser() {
    window.location.href = '/auth/logout.php';
}
