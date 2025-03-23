// ===================================================
// 🚀 chatbox-modal.js | Final Version (Clean + Fixed + Animated UI)
// ===================================================

export function initChatboxModal(onSendCallback) {
    createChatboxModal();
    setupEventHandlers(onSendCallback);
}

// Dynamically create and append the chatbox modal
function createChatboxModal() {
    const chatboxHTML = `
    <div id="chatboxModal" class="chatbox-modal">
    <!-- Toolbar -->
    <div class="chat-toolbar">
    <button data-action="bold"><b>B</b></button>
    <button data-action="italic"><i>I</i></button>
    <button data-action="code">{ }</button>
    <button data-action="quote">❝</button>
    <button data-action="ul">• List</button>
    <button data-action="inline-code">\`</button>
    </div>
    <!-- Chat Input -->
    <textarea id="chatboxInput" placeholder="Type your message..." rows="1"></textarea>

    <!-- Controls -->
    <div class="chatbox-controls">
    <span id="charCounter">0 / 1000</span>
    <button id="chatboxSendBtn">
    <span class="send-text">Send ➤</span>
    <span class="send-loading hidden">Sending...</span>
    </button>
    </div>
    </div>`;

    const container = document.createElement('div');
    container.id = 'chatboxContainer';
    container.innerHTML = chatboxHTML;
    document.querySelector('#chat-main').appendChild(container);
}

// Setup all event handlers
function setupEventHandlers(onSendCallback) {
    const textarea = document.getElementById('chatboxInput');
    const sendBtn = document.getElementById('chatboxSendBtn');
    const charCounter = document.getElementById('charCounter');
    const sendText = sendBtn.querySelector('.send-text');
    const sendLoading = sendBtn.querySelector('.send-loading');
    const toolbar = document.querySelector('.chat-toolbar');

    let isSending = false;

    // Auto-grow textarea height
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 240) + 'px';
    });

    // Handle toolbar button clicks
    toolbar.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action) {
            applyFormatting(action, textarea);
        }
    });

    // Keyboard shortcuts
    textarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            if (e.key === 'b') { e.preventDefault(); applyFormatting('bold', textarea); }
            if (e.key === 'i') { e.preventDefault(); applyFormatting('italic', textarea); }
            if (e.key === 'k') { e.preventDefault(); applyFormatting('inline-code', textarea); }
        }

        if (e.key === 'Enter' && !e.shiftKey && !isSending) {
            e.preventDefault();
            sendMessage(textarea, onSendCallback);
        }
    });

    // Send message on click
    sendBtn.onclick = () => {
        if (!isSending) sendMessage(textarea, onSendCallback);
    };

        // Character counter
        textarea.addEventListener('input', () => {
            charCounter.textContent = `${textarea.value.length} / 1000`;
        });

        // Expose method to unlock send button after AI responds
        window.unlockSendButton = () => {
            isSending = false;
            sendText.classList.remove('hidden');
            sendLoading.classList.add('hidden');
            sendBtn.disabled = false;
        };

        // Send message handler
        function sendMessage(textarea, onSendCallback) {
            const message = textarea.value.trim();
            if (!message) return;

            isSending = true;
            sendText.classList.add('hidden');
            sendLoading.classList.remove('hidden');
            sendBtn.disabled = true;

            onSendCallback(message).finally(() => {
                window.unlockSendButton();
            });

            textarea.value = '';
            charCounter.textContent = '0 / 50000';
        }
}

// Apply markdown formatting
function applyFormatting(action, textarea) {
    switch (action) {
        case 'bold':
            insertMarkdownSyntax(textarea, '**', '**');
            break;
        case 'italic':
            insertMarkdownSyntax(textarea, '*', '*');
            break;
        case 'code':
            insertMarkdownSyntax(textarea, '\n```html\n', '\n```');
            break;
        case 'quote':
            insertMarkdownSyntax(textarea, '> ', '');
            break;
        case 'ul':
            insertMarkdownSyntax(textarea, '- ', '');
            break;
        case 'inline-code':
            insertMarkdownSyntax(textarea, '`', '`');
            break;
    }
}

// Insert markdown wrappers
function insertMarkdownSyntax(textarea, prefix, suffix) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);

    textarea.value = before + prefix + selected + suffix + after;
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, end + prefix.length);
}
