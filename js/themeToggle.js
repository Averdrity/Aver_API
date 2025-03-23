document.addEventListener("DOMContentLoaded", initThemeToggle);

function initThemeToggle() {
    updateToggleUI();
}

function updateToggleUI() {
    const toggleSwitch = document.getElementById("themeSwitch");

    if (!toggleSwitch) return;

    // Set the initial theme based on localStorage
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        toggleSwitch.checked = true;
    } else {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        toggleSwitch.checked = false;
    }

    // Listen for toggle changes
    toggleSwitch.addEventListener("change", () => {
        const mode = toggleSwitch.checked ? "light" : "dark";
        localStorage.setItem("theme", mode);
        if (mode === "light") {
            document.body.classList.remove("dark-mode");
            document.body.classList.add("light-mode");
        } else {
            document.body.classList.remove("light-mode");
            document.body.classList.add("dark-mode");
        }
    });
}

