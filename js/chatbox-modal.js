// ==========================================
// ✉️ chatbox-modal.js (v3.0)
// ==========================================
// Manages the chatbox modal for composing
// and sending messages. Includes formatting
// toolbar, character counter, and send logic.
// Enhanced for modularity, accessibility,
// UX, and security.
// ==========================================

class ChatboxModal {
    constructor(onSendMessage) {
        this.onSendMessage = onSendMessage;
        this.modal = null;
        this.textarea = null;
        this.counter = null;
        this.init();
    }

    init() {
        this.createModal();
        this.cacheElements();
        this.setupEventListeners();
        this.showModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.classList.add('chatbox-modal');
        this.modal.setAttribute('role', 'dialog'); // ARIA role for modal
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.innerHTML = `
        <div class="chatbox-modal-container">
        <div class="chatbox-modal-header">
        <h3 class="chatbox-title">💬 Message AI</h3>
        <button class="chatbox-close-btn" title="Close" aria-label="Close">✖</button>
        </div>
        <div class="chatbox-modal-body">
        <div class="chat-toolbar" role="toolbar" aria-label="Formatting Tools">
        <button class="tool-btn" data-insert="code" title="Insert Code" aria-label="Insert Code">
        <span aria-hidden="true">🧠</span>
        </button>
        <button class="tool-btn" data-insert="align-left" title="Align Left" aria-label="Align Left">
        <span aria-hidden="true">⬅</span>
        </button>
        <button class="tool-btn" data-insert="align-center" title="Center" aria-label="Center">
        <span aria-hidden="true">⬍</span>
        </button>
        <button class="tool-btn" data-insert="align-right" title="Align Right" aria-label="Align Right">
        <span aria-hidden="true">➡</span>
        </button>
        <button class="tool-btn" data-insert="ul" title="Bullet List" aria-label="Bullet List">
        <span aria-hidden="true">•</span>
        </button>
        <button class="tool-btn" data-insert="ol" title="Numbered List" aria-label="Numbered List">
        <span aria-hidden="true">1️⃣</span>
        </button>
        </div>
        <textarea id="chatboxTextarea" placeholder="Type your message..."
        maxlength="5000" class="chatbox-textarea" aria-label="Message input"></textarea>
        <div class="chatbox-meta">
        <span id="charCounter">0 / 5000</span>
        </div>
        </div>
        <div class="chatbox-modal-footer">
        <button id="sendMsgBtn" class="btn-primary send-btn" aria-label="Send Message">➤ Send</button>
        </div>
        </div>`;
        document.body.appendChild(this.modal);
    }

    cacheElements() {
        this.closeBtn = this.modal.querySelector('.chatbox-close-btn');
        this.sendBtn = this.modal.querySelector('#sendMsgBtn');
        this.textarea = this.modal.querySelector('#chatboxTextarea');
        this.counter = this.modal.querySelector('#charCounter');
        this.toolbarBtns = this.modal.querySelectorAll('.tool-btn');
    }

    setupEventListeners() {
        this.closeBtn.addEventListener('click', () => this.closeModal());

        this.textarea.addEventListener('input', () => {
            this.adjustTextareaHeight();
            this.updateCharCounter();
        });

        this.sendBtn.addEventListener('click', () => this.sendMessage());

        this.textarea.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.toolbarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.formatText(btn.dataset.insert);
            });
        });
    }

    showModal() {
        this.modal.classList.add('show');
        this.textarea.focus(); // Focus on textarea when modal opens
    }

    closeModal() {
        this.modal.remove();
    }

    adjustTextareaHeight() {
        this.textarea.style.height = 'auto';
        this.textarea.style.height = (this.textarea.scrollHeight) + 'px';
    }

    updateCharCounter() {
        this.counter.textContent = `${this.textarea.value.length} / 5000`;
    }

    sendMessage() {
        const message = this.textarea.value.trim();
        if (!message) return;

        if (this.onSendMessage) {
            this.onSendMessage(this.sanitizeInput(message)); // Sanitize input
        }

        this.textarea.value = '';
        this.textarea.dispatchEvent(new Event('input')); // Trigger input event for height reset
    }

    formatText(tag) {
        let wrapStart = '', wrapEnd = '';

        switch (tag) {
            case 'code': wrapStart = '<code>'; wrapEnd = '</code>'; break;
            case 'align-left': wrapStart = '<div style="text-align:left">'; wrapEnd = '</div>'; break;
            case 'align-center': wrapStart = '<div style="text-align:center">'; wrapEnd = '</div>'; break;
            case 'align-right': wrapStart = '<div style="text-align:right">'; wrapEnd = '</div>'; break;
            case 'ul': wrapStart = '<ul><li>'; wrapEnd = '</li></ul>'; break;
            case 'ol': wrapStart = '<ol><li>'; wrapEnd = '</li></ol>'; break;
            default: return; // Exit if tag is invalid
        }

        this.insertTextAtCursor(`${wrapStart} ${wrapEnd}`);
    }

    insertTextAtCursor(text) {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const before = this.textarea.value.substring(0, start);
        const after = this.textarea.value.substring(end);
        this.textarea.value = before + text + after;
        this.textarea.focus();
        this.textarea.selectionEnd = start + text.length;
        this.textarea.dispatchEvent(new Event('input'));
    }

    sanitizeInput(text) {
        // Basic HTML escaping (more robust solutions may be needed)
        return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

// Initialization
export function initChatboxModal(onSendMessage) {
    new ChatboxModal(onSendMessage);
}
