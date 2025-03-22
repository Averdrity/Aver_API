// =====================================
// 🌙 footer.js (v2.0)
// Dynamic Footer & Theme Toggle
// =====================================

document.addEventListener('DOMContentLoaded', buildFooter);

function buildFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
    <footer class="site-footer">
    <div class="footer-content">
    <span>© ${new Date().getFullYear()} Aver-Web. All rights reserved.</span>
    <div class="theme-toggle">
    <label for="themeSwitch">Dark Mode</label>
    <input type="checkbox" id="themeSwitch" checked>
    </div>
    </div>
    </footer>
    `;

    initThemeToggle();
}

// Initialize Theme Toggle Functionality
function initThemeToggle() {
    const themeSwitch = document.getElementById('themeSwitch');

    // Load theme preference from localStorage
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeSwitch.checked = currentTheme === 'dark';

    themeSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
}

