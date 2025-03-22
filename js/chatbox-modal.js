// ================================================
// 🚀 chatbox-modal.js | Final Version (Fully Enhanced)
// ================================================
// Fully modular chatbox modal component
// Dynamic, animated, responsive, with character counter
// ================================================

export function initChatboxModal(onSendCallback) {
    createChatboxModal();
    setupEventHandlers(onSendCallback);
}

// Dynamically create and append the chatbox modal
function createChatboxModal() {
    const chatboxHTML = `
    <div id="chatboxModal" class="chatbox-modal animated fadeInUp">
    <textarea id="chatboxInput" placeholder="Type your message..." rows="1"></textarea>
    <div class="chatbox-controls">
    <span id="charCounter">0 / 1000</span>
    <button id="chatboxSendBtn">Send ➤</button>
    </div>
    </div>
    `;

    const container = document.createElement('div');
    container.id = 'chatboxContainer';
    container.innerHTML = chatboxHTML;

    document.querySelector('#chat-main').appendChild(container);
}

// Event listeners and user interactions
function setupEventHandlers(onSendCallback) {
    const textarea = document.getElementById('chatboxInput');
    const sendBtn = document.getElementById('chatboxSendBtn');
    const charCounter = document.getElementById('charCounter');

    // Send message on click
    sendBtn.onclick = () => sendMessage(textarea, onSendCallback);

    // Handle Enter (send) & Shift+Enter (newline)
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(textarea, onSendCallback);
        }
    });

    // Update counter dynamically
    textarea.addEventListener('input', updateCharCounter);

    function updateCharCounter() {
        charCounter.textContent = `${textarea.value.length} / 1000`;
    }
}

// Message sending logic
function sendMessage(textarea, onSendCallback) {
    const message = textarea.value.trim();
    if (!message) return;

    onSendCallback(message);
    textarea.value = '';
    document.getElementById('charCounter').textContent = '0 / 1000';
}
