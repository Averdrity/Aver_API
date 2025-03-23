// File: /js/themeToggle.js

document.addEventListener("DOMContentLoaded", initThemeToggle);

function initThemeToggle() {
    const toggleSwitch = document.getElementById("themeToggleSlider");
    if (!toggleSwitch) return;

    // Apply stored theme or default to dark
    const storedTheme = localStorage.getItem("theme") || "dark";
    applyTheme(storedTheme);
    toggleSwitch.checked = storedTheme === "light";

    // Listen for toggle change
    toggleSwitch.addEventListener("change", () => {
        const newTheme = toggleSwitch.checked ? "light" : "dark";
        applyTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    });
}

function applyTheme(theme) {
    const html = document.documentElement;

    if (theme === "light") {
        html.setAttribute("data-theme", "light");
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
    } else {
        html.setAttribute("data-theme", "dark");
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
    }
}
