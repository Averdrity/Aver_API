// =====================================
// 🚀 landing.js (v3.0)
// Dynamic Animated Landing Page with Enhanced Styling
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    buildLandingContent();
});

function buildLandingContent() {
    const main = document.getElementById('landing-content');
    if (!main) return;

    main.innerHTML = `
    <section class="hero animated fadeInDown">
    <div class="welcome-box shadow-card">
    <h1 class="landing-title">👋 Welcome to <span class="accent-text">Aver-Web</span>!</h1>
    <p class="landing-subtitle">We're currently building something amazing. Stay tuned for exciting updates, powerful features, and a polished user experience.</p>
    </div>
    </section>

    <section class="info-sliders animated fadeInUp">
    <div class="slider placeholder shadow-card">
    <h3>🚧 Upcoming Features</h3>
    <ul class="slider-list">
    <li>✔️ Personal AI Assistant</li>
    <li>✔️ Advanced Chat Memory System</li>
    <li>✔️ Secure Profiles & History</li>
    <li>✔️ Model Switching in Real-Time</li>
    <li>✔️ Dynamic Theming System</li>
    </ul>
    </div>

    <div class="slider placeholder shadow-card">
    <h3>📢 Community & Updates</h3>
    <p>Follow our journey and stay updated with all the upcoming features. We’re building this platform for you.</p>
    <p class="coming-soon-label">🔔 More features coming soon!</p>
    </div>
    </section>
    `;
}
