// ========================================
// 🌙 themeToggle.js (v3.0)
// ========================================
// Enhanced Dark/Light Mode Switching Module
// - Persistent user preference (localStorage)
// - Improved accessibility & performance
// ========================================

export class ThemeToggle {  // Export the class, not an instance
    constructor() {
        this.toggleSwitch = document.getElementById('themeModeToggle');
        this.themeLabel = document.getElementById('themeLabel');
        this.initialize();
    }

    initialize() {
        this.loadTheme();
        this.setupEventListeners();
    }

    loadTheme() {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        this.updateToggleUI(currentTheme);
    }

    setupEventListeners() {
        if (!this.toggleSwitch) {
            console.error('Theme toggle switch not found.');
            return;
        }

        this.toggleSwitch.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateToggleUI(newTheme);
        });
    }

    updateToggleUI(theme) {
        const isDark = theme === 'dark';
        if (this.toggleSwitch) {
            this.toggleSwitch.checked = isDark;
        }
        if (this.themeLabel) {
            this.themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
        }

        // Optional: Smooth transition (add to CSS as well)
        document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }
}
