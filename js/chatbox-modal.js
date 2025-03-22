// ========================================
// 💬 chatbox-modal.js (v2.0)
// ========================================
// Modular, dynamic chat input modal.
// Supports multiline input and animations.
// ========================================

export function initChatboxModal(onSendCallback) {
    createChatboxModal();
    setupEventHandlers(onSendCallback);
}

// Create Chatbox Modal HTML dynamically
function createChatboxModal() {
    const chatboxContainer = document.createElement('div');
    chatboxContainer.id = 'chatboxContainer';
    chatboxContainer.innerHTML = `
    <div class="chatbox-modal animated fadeInUp">
    <textarea id="chatboxInput" placeholder="Type your message..." rows="1"></textarea>
    <button id="chatboxSendBtn">➤</button>
    <span id="charCounter">0 / 1000</span>
    </div>
    `;
    document.body.appendChild(chatboxContainer);
}

// Event Handlers for Chatbox
function setupEventHandlers(onSendCallback) {
    const textarea = document.getElementById('chatboxInput');
    const sendBtn = document.getElementById('chatboxSendBtn');
    const charCounter = document.getElementById('charCounter');

    textarea.focus();

    // Dynamic textarea height adjustment
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        charCounter.textContent = `${textarea.value.length} / 1000`;
    });

    // Handle Enter (send) and Shift+Enter (newline)
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            attemptSend();
        }
    });

    // Send button click
    sendBtn.addEventListener('click', () => {
        attemptSend();
    });

    // Send message function with validation
    function attemptSend() {
        const message = textarea.value.trim();
        if (message && message.length <= 1000) {
            onSendCallback(message);
            resetChatbox();
        }
    }

    // Reset Chatbox after sending
    function resetChatbox() {
        textarea.value = '';
        textarea.style.height = 'auto';
        charCounter.textContent = `0 / 1000`;
        textarea.focus();
    }
}
