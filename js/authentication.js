// =====================================
// 🔐 authentication.js (v2.0)
// AJAX-powered Login/Register/Profile
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    // Login
    document.getElementById('loginSubmit').onclick = loginUser;

    // Register
    document.getElementById('registerSubmit').onclick = registerUser;

    // Profile
    document.getElementById('profileSubmit').onclick = updateProfile;

    // Close modals on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
    });
});

// LOGIN AJAX
async function loginUser() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const res = await fetch('/auth/ajax_login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
        location.reload();
    } else {
        document.getElementById('loginError').textContent = data.message;
    }
}

// REGISTER AJAX
async function registerUser() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    const res = await fetch('/auth/ajax_register.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password, confirmPassword })
    });

    const data = await res.json();

    if (data.success) {
        setTimeout(() => location.reload(), 2000);
    } else {
        document.getElementById('registerError').textContent = data.message;
    }
}

// LOAD PROFILE ON MODAL OPEN
async function loadProfile() {
    const res = await fetch('/auth/ajax_get_profile.php');
    const data = await res.json();

    if (data.success) {
        document.getElementById('profileName').value = data.profile.name || '';
        document.getElementById('profileCountry').value = data.profile.country || '';
        document.getElementById('profileWebsite').value = data.profile.website || '';
        document.getElementById('profileBio').value = data.profile.bio || '';
    }
}

// UPDATE PROFILE AJAX
async function updateProfile() {
    const name = document.getElementById('profileName').value;
    const country = document.getElementById('profileCountry').value;
    const website = document.getElementById('profileWebsite').value;
    const bio = document.getElementById('profileBio').value;

    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword && newPassword !== confirmNewPassword) {
        document.getElementById('profileMessage').textContent = 'Passwords do not match.';
        return;
    }

    await fetch('/auth/ajax_update_profile.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, country, website, bio })
    });

    if (newPassword) {
        await fetch('/auth/ajax_change_password.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ oldPassword, newPassword, confirmPassword: confirmNewPassword })
        });
    }

    document.getElementById('profileMessage').textContent = 'Profile updated successfully!';
}

