// ==========================================
// 🚀 injectHeaderFooter.js (v3.0)
// ==========================================
// Dynamically injects header/footer HTML,
// Adjusts buttons according to page context.
// Enhanced with modularity, error handling,
// and improved auth flow.
// ==========================================

import { ThemeToggle } from '/js/themeToggle.js'; // Import ThemeToggle

export { HeaderFooterInjector };

class HeaderFooterInjector {
  constructor() {
    this.headerMount = document.getElementById('headerMountPoint');
    this.footerMount = document.getElementById('footerMountPoint');
    this.currentPage = this.validatePage(this.getPage()); // Validate current page
    this.init();
  }

  init() {
    this.injectComponents();
  }

  validatePage(page) {
    const allowedPages = ['home', 'chat']; // Whitelist allowed pages
    return allowedPages.includes(page) ? page : 'home'; // Default to 'home'
  }

  getPage() {
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1);

    if (pageName === 'chat.html') {
      return 'chat';
    } else if (pageName === 'index.html' || pageName === '') {
      return 'home';
    } else {
      return 'home'; // Default
    }
  }

  async injectComponents() {
    try {
      const [headerHTML, footerHTML] = await Promise.all([
        this.fetchComponent('/components/header.html'),
                                                         this.fetchComponent('/components/footer.html')
      ]);

      this.headerMount.innerHTML = headerHTML;
      this.footerMount.innerHTML = footerHTML;

      this.setupHeaderButtons();
      if (this.currentPage === 'chat') {
        this.showModelStatus();
      }

      // Initialize ThemeToggle Here, after injection
      new ThemeToggle();  // Initialize ThemeToggle AFTER injection

    } catch (error) {
      console.error('Injection Error:', error);
      this.handleInjectionError(error);
    }
  }

  async fetchComponent(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch component: ${url}`);
      }
      return await res.text();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error; // Re-throw to be caught in injectComponents
    }
  }

  setupHeaderButtons() {
    const aiChatBtn = document.getElementById('aiChatBtn');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const profileBtn = document.getElementById('authProfileBtn');
    const logoutBtn = document.getElementById('authActionBtn');

    if (!aiChatBtn || !loginBtn || !registerBtn || !profileBtn || !logoutBtn) {
      console.error('One or more header buttons not found.');
      return;
    }

    // AI Chat ↔ Home
    if (this.currentPage === 'chat') {
      aiChatBtn.textContent = '🏠 Home';
      aiChatBtn.addEventListener('click', () => window.location.href = '/index.html');
    } else {
      aiChatBtn.textContent = '🧠 AI Chat';
      aiChatBtn.addEventListener('click', () => window.location.href = '/chat/chat.html');
    }

    this.checkAuthState().then(authenticated => {
      if (authenticated) {
        this.showAuthButtons(false); // Hide login/register
        this.showAuthButtons(true, true); // Show profile/logout
      } else {
        this.showAuthButtons(true);  // Show login/register
        this.showAuthButtons(false, true); // Hide profile/logout
      }

      loginBtn.addEventListener('click', () => this.openLoginModal());
      registerBtn.addEventListener('click', () => this.openRegisterModal());
      profileBtn.addEventListener('click', () => this.openProfileModal());
      logoutBtn.addEventListener('click', () => this.logoutUser());
    });
  }

  showAuthButtons(showLoginRegister, showProfileLogout = false) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const profileBtn = document.getElementById('authProfileBtn');
    const logoutBtn = document.getElementById('authActionBtn');

    if (loginBtn && registerBtn) {
      loginBtn.style.display = showLoginRegister ? 'inline-block' : 'none';
      registerBtn.style.display = showLoginRegister ? 'inline-block' : 'none';
    }

    if (profileBtn && logoutBtn) {
      profileBtn.style.display = showProfileLogout ? 'inline-block' : 'none';
      logoutBtn.style.display = showProfileLogout ? 'inline-block' : 'none';
    }
  }

  async checkAuthState() {
    try {
      const res = await fetch('/auth/ajax_check_session.php', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Auth check failed.');
      }
      const data = await res.json();
      return data.logged_in === true;
    } catch (e) {
      console.error('Auth check error:', e);
      return false;
    }
  }

  showModelStatus() {
    const statusContainer = document.getElementById('modelStatusContainer');
    const statusText = document.getElementById('modelStatusText');

    if (!statusContainer || !statusText) {
      console.error('Model status elements not found.');
      return;
    }

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

  // Placeholder modal functions (replace with real implementations)
  openLoginModal() {
    console.log('Open login modal');
    // Implement your login modal logic here
  }

  openRegisterModal() {
    console.log('Open register modal');
    // Implement your register modal logic here
  }

  openProfileModal() {
    console.log('Open profile modal');
    // Implement your profile modal logic here
  }

  logoutUser() {
    fetch('/auth/logout.php', { credentials: 'include' })
    .then(() => window.location.reload());
  }

  handleInjectionError(error) {
    // Implement user-friendly error display or fallback
    // Example: Display a message in the header/footer mount points
    if (this.headerMount) {
      this.headerMount.innerHTML = '<p class="error-message">Failed to load header.</p>';
    }
    if (this.footerMount) {
      this.footerMount.innerHTML = '<p class="error-message">Failed to load footer.</p>';
    }
  }
}

// Initialize HeaderFooterInjector
document.addEventListener('DOMContentLoaded', () => {
  new HeaderFooterInjector();
});
