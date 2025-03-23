// =====================================
// 🔐 authentication.js (v4.0)
// AJAX-powered Login / Register / Profile / Logout
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    bindAuthEventHandlers();
    setupModalCloseHandlers();
});

// ===============================
// 📌 AUTH EVENT BINDINGS
// ===============================
function bindAuthEventHandlers() {
    document.getElementById('loginSubmit')?.addEventListener('click', loginUser);
    document.getElementById('registerSubmit')?.addEventListener('click', registerUser);
    document.getElementById('profileSubmit')?.addEventListener('click', updateProfile);
    document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);

    // Profile modal trigger
    const profileBtn = document.getElementById('openProfileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            openModal('profileModal');
            loadProfile();
        });
    }

    // Optional: Load profile when modal is opened directly
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) closeAllModals();
        });
    }
}

// ===============================
// 💬 MODAL HANDLERS
// ===============================
function openModal(id) {
    closeAllModals();
    document.getElementById(id)?.classList.remove('hidden');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
}

function setupModalCloseHandlers() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target.classList.contains('modal')) modal.classList.add('hidden');
        });
    });
}

// ===============================
// 🔐 LOGIN FUNCTION
// ===============================
async function loginUser() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const rememberMe = document.getElementById('rememberMe')?.checked;

    if (!username || !password) {
        showError('loginError', 'Please enter both username and password.');
        return;
    }

    const res = await fetch('/auth/ajax_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe })
    });

    const data = await res.json();
    if (data.success) {
        location.reload();
    } else {
        showError('loginError', data.message || 'Login failed.');
    }
}

// ===============================
// 📝 REGISTER FUNCTION
// ===============================
async function registerUser() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();

    if (!username || !password || !confirmPassword) {
        showError('registerError', 'All fields are required.');
        return;
    }

    if (password !== confirmPassword) {
        showError('registerError', 'Passwords do not match.');
        return;
    }

    const res = await fetch('/auth/ajax_register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

// ===============================
// 👤 LOAD PROFILE DATA
// ===============================
async function loadProfile() {
    try {
        const res = await fetch('/auth/ajax_get_profile.php');
        const data = await res.json();

        if (data.success && data.profile) {
            const profile = data.profile;
            document.getElementById('profileName').value = profile.name || '';
            document.getElementById('profileCountry').value = profile.country || '';
            document.getElementById('profileWebsite').value = profile.website || '';
            document.getElementById('profileBio').value = profile.bio || '';
        } else {
            showError('profileMessage', data.message || 'Profile load failed.');
        }
    } catch (err) {
        showError('profileMessage', 'Server error while loading profile.');
    }
}

// ===============================
// 🔄 UPDATE PROFILE DATA
// ===============================
async function updateProfile() {
    const name = document.getElementById('profileName').value.trim();
    const country = document.getElementById('profileCountry').value.trim();
    const website = document.getElementById('profileWebsite').value.trim();
    const bio = document.getElementById('profileBio').value.trim();

    const oldPassword = document.getElementById('oldPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmNewPassword = document.getElementById('confirmNewPassword').value.trim();

    if (newPassword && newPassword !== confirmNewPassword) {
        showError('profileMessage', 'New passwords do not match.');
        return;
    }

    // Update Profile Info
    const profileRes = await fetch('/auth/ajax_update_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, country, website, bio })
    });

    const profileData = await profileRes.json();
    if (!profileData.success) {
        showError('profileMessage', profileData.message || 'Profile update failed.');
        return;
    }

    // Update Password if requested
    if (newPassword) {
        const pwRes = await fetch('/auth/ajax_change_password.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPassword, newPassword, confirmPassword: confirmNewPassword })
        });

        const pwData = await pwRes.json();
        if (!pwData.success) {
            showError('profileMessage', pwData.message || 'Password update failed.');
            return;
        }
    }

    showError('profileMessage', '✅ Profile updated successfully!');
}

// ===============================
// 🚪 LOGOUT FUNCTION
// ===============================
function logoutUser() {
    window.location.href = '/auth/logout.php';
}

// ===============================
// ⚠️ REUSABLE ERROR DISPLAY
// ===============================
function showError(id, message) {
    const el = document.getElementById(id);
    if (el) el.textContent = message;
}
