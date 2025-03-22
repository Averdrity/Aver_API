// =====================================
// 🚀 header.js (v2.0)
// Fully Dynamic Floating Header
// =====================================

document.addEventListener('DOMContentLoaded', buildHeader);

async function buildHeader() {
    const header = document.getElementById('header');
    header.innerHTML = `
    <nav class="floating-header">
    <div class="header-btn-group left">
    <button id="aiChatBtn" class="header-btn">AI Chat</button>
    <button class="header-btn soon">Soon</button>
    <button class="header-btn soon">Soon</button>
    </div>

    <div class="header-logo animated">
    <img src="/assets/aw_logo_transparent_64x64.png" alt="AW Logo">
    </div>

    <div class="header-btn-group right">
    <button id="loginProfileBtn" class="header-btn">Login</button>
    <button id="registerLogoutBtn" class="header-btn">Register</button>
    <button class="header-btn soon">Soon</button>
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
        } else {
            loginProfileBtn.textContent = 'Login';
            registerLogoutBtn.textContent = 'Register';
        }

        // Adjust AI Chat button based on current page
        const aiChatBtn = document.getElementById('aiChatBtn');
        if (window.location.pathname.includes('chat')) {
            aiChatBtn.textContent = 'Home';
        } else {
            aiChatBtn.textContent = 'AI Chat';
        }
    } catch (error) {
        console.error('Header session check failed:', error);
    }
}

// Attach button click events
function attachHeaderEvents() {
    document.getElementById('aiChatBtn').onclick = () => {
        window.location.href = window.location.pathname.includes('chat') ? '/' : '/chat/chat.html';
    };

    document.getElementById('loginProfileBtn').onclick = async () => {
        const res = await fetch('/auth/ajax_check_session.php');
        const session = await res.json();

        if (session.authenticated) {
            openProfileModal();
        } else {
            openLoginModal();
        }
    };

    document.getElementById('registerLogoutBtn').onclick = async () => {
        const res = await fetch('/auth/ajax_check_session.php');
        const session = await res.json();

        if (session.authenticated) {
            window.location.href = '/auth/logout.php';
        } else {
            openRegisterModal();
        }
    };
}

// Modal opening functions (ensure these exist globally)
function openLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function openRegisterModal() {
    document.getElementById('registerModal').classList.remove('hidden');
}

function openProfileModal() {
    document.getElementById('profileModal').classList.remove('hidden');
}

