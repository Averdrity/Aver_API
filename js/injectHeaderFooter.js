// ==========================================
// 🚀 injectHeaderFooter.js (v2.0)
// ==========================================
// Dynamically injects header/footer HTML,
// Adjusts buttons according to page context.
// ==========================================

export async function injectHeaderFooter(currentPage = 'home') {
  try {
    const headerMount = document.getElementById('headerMountPoint');
    const footerMount = document.getElementById('footerMountPoint');

    const [headerRes, footerRes] = await Promise.all([
      fetch('/components/header.html'),
                                                     fetch('/components/footer.html')
    ]);

    if (!headerRes.ok || !footerRes.ok) {
      throw new Error('Failed to fetch header or footer.');
    }

    const [headerHTML, footerHTML] = await Promise.all([
      headerRes.text(),
                                                       footerRes.text()
    ]);

    headerMount.innerHTML = headerHTML;
    footerMount.innerHTML = footerHTML;

    setupHeaderButtons(currentPage);
    if (currentPage === 'chat') showModelStatus();

  } catch (error) {
    console.error('Injection Error:', error);
  }
}

// Setup Header Buttons based on page context and user auth
function setupHeaderButtons(page) {
  const aiChatBtn = document.getElementById('aiChatBtn');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const profileBtn = document.getElementById('authProfileBtn');
  const logoutBtn = document.getElementById('authActionBtn');

  // AI Chat ↔ Home
  if (page === 'chat') {
    aiChatBtn.textContent = '🏠 Home';
    aiChatBtn.onclick = () => window.location.href = '/index.html';
  } else {
    aiChatBtn.textContent = '🧠 AI Chat';
    aiChatBtn.onclick = () => window.location.href = '/chat/chat.html';
  }

  // Authentication Buttons
  checkAuthState().then(authenticated => {
    if (authenticated) {
      loginBtn.style.display = 'none';
      registerBtn.style.display = 'none';
      profileBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'inline-block';
    } else {
      loginBtn.style.display = 'inline-block';
      registerBtn.style.display = 'inline-block';
      profileBtn.style.display = 'none';
      logoutBtn.style.display = 'none';
    }

    loginBtn.onclick = () => openLoginModal();
    registerBtn.onclick = () => openRegisterModal();
    profileBtn.onclick = () => openProfileModal();
    logoutBtn.onclick = () => logoutUser();
  });
}

// Check session state via AJAX
async function checkAuthState() {
  try {
    const res = await fetch('/auth/ajax_check_session.php', { credentials: 'include' });
    const data = await res.json();
    return data.authenticated === true;
  } catch (e) {
    console.error('Auth check error:', e);
    return false;
  }
}

// Show AI model status on chat page
function showModelStatus() {
  const statusContainer = document.getElementById('modelStatusContainer');
  const statusText = document.getElementById('modelStatusText');

  statusContainer.style.display = 'block';

  fetch('/backend/ollama-server.py', { method: 'GET' })
  .then(res => {
    if (res.ok) {
      statusText.textContent = '✅ AI Model Active (Gemma 3:27b)';
    } else {
      statusText.textContent = '❌ AI Model Offline';
    }
  })
  .catch(() => {
    statusText.textContent = '❌ AI Model Offline';
  });
}

// Real implementation of modal functions
function openLoginModal() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) loginModal.style.display = 'flex';
}

function openRegisterModal() {
  const registerModal = document.getElementById('registerModal');
  if (registerModal) registerModal.style.display = 'flex';
}

function openProfileModal() {
  const profileModal = document.getElementById('profileModal');
  if (profileModal) profileModal.style.display = 'flex';
}


function logoutUser() {
  fetch('/auth/logout.php', { credentials: 'include' })
  .then(() => window.location.reload());
}
