// =====================================
// 🌙 footer.js (v3.0)
// Dynamic Footer with Slider Theme Toggle
// =====================================

document.addEventListener('DOMContentLoaded', buildFooter);

function buildFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
    <footer class="site-footer">
    <div class="footer-content">
    <span>© ${new Date().getFullYear()} Aver-Web. All rights reserved.</span>
    <div class="theme-toggle">
    <label class="theme-slider-label" for="themeToggleSlider">☀️ / 🌙 Switch</label>
    <label class="theme-slider-wrapper">
    <input type="checkbox" id="themeToggleSlider">
    <span class="theme-slider"></span>
    </label>
    </div>
    </div>
    </footer>
    `;

    // Initialize theme toggle functionality
    initThemeToggle();
}

// =====================
// Init Theme Toggle (Matches themeToggle.js)
// =====================
function initThemeToggle() {
    const toggleSwitch = document.getElementById("themeToggleSlider");
    if (!toggleSwitch) return;

    // Load saved theme from localStorage or default to dark
    const storedTheme = localStorage.getItem("theme") || "dark";
    applyTheme(storedTheme);
    toggleSwitch.checked = storedTheme === "light";

    toggleSwitch.addEventListener("change", () => {
        const selectedTheme = toggleSwitch.checked ? "light" : "dark";
        applyTheme(selectedTheme);
        localStorage.setItem("theme", selectedTheme);
    });
}

function applyTheme(theme) {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);

    if (theme === "light") {
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
    } else {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
    }
}
