// =====================================
// 🚀 landing.js (v2.0)
// Dynamic Animated Landing Page
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    buildLandingContent();
});

// Build dynamic landing content
function buildLandingContent() {
    const main = document.getElementById('landing-content');

    main.innerHTML = `
    <section class="hero animated fadeInDown">
    <div class="welcome-box">
    <h1>Welcome to Aver-Web!</h1>
    <p>We're currently building something awesome here. Stay tuned for exciting updates!</p>
    </div>
    </section>

    <section class="info-sliders animated fadeInUp">
    <div class="slider placeholder">
    <p>🚧 Upcoming features and updates...</p>
    </div>
    <div class="slider placeholder">
    <p>📢 Stay tuned for amazing content!</p>
    </div>
    </section>
    `;
}

