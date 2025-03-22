// ========================================
// 🌙 themeToggle.js (v2.0)
// ========================================
// Smooth Dark/Light Mode Switching
// Persistent user preference using localStorage
// ========================================

export function initThemeToggle() {
    const toggleSwitch = document.getElementById('themeModeToggle');
    const themeLabel = document.getElementById('themeLabel');

    // Load saved theme from localStorage
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateToggleUI(currentTheme);

    // Event Listener for toggle change
    toggleSwitch.addEventListener('change', (e) => {
        const newTheme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleUI(newTheme);
    });

    // Update UI to reflect current theme
    function updateToggleUI(theme) {
        const isDark = theme === 'dark';
        toggleSwitch.checked = isDark;
        themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
    }
}
