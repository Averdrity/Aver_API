// =====================================
// 🔐 authentication.js (v5.0 FINAL)
// AJAX-powered Login / Register / Profile / Logout System
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    bindAuthHandlers();
    handleModalBackgroundClose();
});

// 📌 Bind All Authentication Handlers
function bindAuthHandlers() {
    document.getElementById('loginSubmit')?.addEventListener('click', loginUser);
    document.getElementById('registerSubmit')?.addEventListener('click', registerUser);
    document.getElementById('profileSubmit')?.addEventListener('click', updateProfile);
    document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);

    const loginBtn = document.getElementById('loginProfileBtn');
    const registerBtn = document.getElementById('registerLogoutBtn');

    if (loginBtn) loginBtn.addEventListener('click', handleLoginOrProfile);
    if (registerBtn) registerBtn.addEventListener('click', handleRegisterOrLogout);
}

// Handle login/profile button based on session
async function handleLoginOrProfile() {
    const session = await fetchSession();
    if (session?.authenticated) {
        openModal('profileModal');
        loadProfile();
    } else {
        openModal('loginModal');
    }
}

// Handle register/logout button based on session
async function handleRegisterOrLogout() {
    const session = await fetchSession();
    if (session?.authenticated) {
        logoutUser();
    } else {
        openModal('registerModal');
    }
}

// Global Session Check
async function fetchSession() {
    try {
        const res = await fetch('/auth/ajax_check_session.php');
        return await res.json();
    } catch {
        return null;
    }
}

// ✅ Login
async function loginUser() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const rememberMe = document.getElementById('rememberMe')?.checked;

    if (!username || !password) return showError('loginError', 'Enter both username and password.');

    const res = await fetch('/auth/ajax_login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password, rememberMe })
    });

    const data = await res.json();
    if (data.success) location.reload();
    else showError('loginError', data.message || 'Login failed.');
}

// 📝 Register
async function registerUser() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();

    if (!username || !password || !confirmPassword)
        return showError('registerError', 'All fields required.');
    if (password !== confirmPassword)
        return showError('registerError', 'Passwords do not match.');

    const res = await fetch('/auth/ajax_register.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password, confirmPassword })
    });

    const data = await res.json();
    if (data.success) {
        showError('registerError', '✅ Registered! Logging in...');
        setTimeout(() => location.reload(), 1500);
    } else {
        showError('registerError', data.message || 'Registration failed.');
    }
}

// 👤 Load Profile
async function loadProfile() {
    try {
        const res = await fetch('/auth/ajax_get_profile.php');
        const data = await res.json();
        if (data.success) {
            document.getElementById('profileName').value = data.profile.name || '';
            document.getElementById('profileCountry').value = data.profile.country || '';
            document.getElementById('profileWebsite').value = data.profile.website || '';
            document.getElementById('profileBio').value = data.profile.bio || '';
        } else {
            showError('profileMessage', data.message || 'Profile load error.');
        }
    } catch (err) {
        showError('profileMessage', 'Server error loading profile.');
    }
}

// 🔄 Update Profile
async function updateProfile() {
    const name = document.getElementById('profileName').value.trim();
    const country = document.getElementById('profileCountry').value.trim();
    const website = document.getElementById('profileWebsite').value.trim();
    const bio = document.getElementById('profileBio').value.trim();

    const oldPassword = document.getElementById('oldPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmNewPassword = document.getElementById('confirmNewPassword').value.trim();

    if (newPassword && newPassword !== confirmNewPassword) {
        return showError('profileMessage', 'New passwords do not match.');
    }

    const profileRes = await fetch('/auth/ajax_update_profile.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, country, website, bio })
    });
    const profileData = await profileRes.json();
    if (!profileData.success) return showError('profileMessage', profileData.message || 'Profile update failed.');

    if (newPassword) {
        const pwRes = await fetch('/auth/ajax_change_password.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ oldPassword, newPassword, confirmPassword: confirmNewPassword })
        });
        const pwData = await pwRes.json();
        if (!pwData.success) return showError('profileMessage', pwData.message || 'Password update failed.');
    }

    showError('profileMessage', '✅ Profile updated successfully!');
}

// 🚪 Logout
function logoutUser() {
    window.location.href = '/auth/logout.php';
}

// 🧠 Show Error Utility
function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

// 💬 Modal Handling
function openModal(id) {
    closeAllModals();
    document.getElementById(id)?.classList.remove('hidden');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

function handleModalBackgroundClose() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target.classList.contains('modal')) closeAllModals();
        });
    });
}
