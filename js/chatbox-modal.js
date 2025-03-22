// File: /js/chatbox-modal.js

export function initChatboxModal(onSendMessage) {
    const modal = document.createElement('div');
    modal.classList.add('chatbox-modal', 'show');

    modal.innerHTML = `
    <div class="chatbox-modal-container">
    <div class="chatbox-modal-header">
    <h3 class="chatbox-title">💬 Message AI</h3>
    <button class="chatbox-close-btn" title="Close">✖</button>
    </div>

    <div class="chatbox-modal-body">
    <div class="chat-toolbar">
    <button class="tool-btn" data-insert="code" title="Insert Code">🧠</button>
    <button class="tool-btn" data-insert="align-left" title="Align Left">⬅</button>
    <button class="tool-btn" data-insert="align-center" title="Center">⬍</button>
    <button class="tool-btn" data-insert="align-right" title="Align Right">➡</button>
    <button class="tool-btn" data-insert="ul" title="Bullet List">•</button>
    <button class="tool-btn" data-insert="ol" title="Numbered List">1️⃣</button>
    </div>

    <textarea id="chatboxTextarea" placeholder="Type your message..." maxlength="5000" class="chatbox-textarea"></textarea>
    <div class="chatbox-meta">
    <span id="charCounter">0 / 5000</span>
    </div>
    </div>

    <div class="chatbox-modal-footer">
    <button id="sendMsgBtn" class="btn-primary send-btn">➤ Send</button>
    </div>
    </div>`;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.chatbox-close-btn');
    const sendBtn = modal.querySelector('#sendMsgBtn');
    const textarea = modal.querySelector('#chatboxTextarea');
    const counter = modal.querySelector('#charCounter');
    const toolbarBtns = modal.querySelectorAll('.tool-btn');

    closeBtn.addEventListener('click', () => modal.remove());

    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
        counter.textContent = `${textarea.value.length} / 5000`;
    });

    sendBtn.addEventListener('click', sendMessage);
    textarea.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    function sendMessage() {
        const message = textarea.value.trim();
        if (!message) return;
        onSendMessage(message);
        textarea.value = '';
        textarea.dispatchEvent(new Event('input'));
    }

    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tag = btn.dataset.insert;
            let wrapStart = '', wrapEnd = '';

            switch (tag) {
                case 'code': wrapStart = '<code>'; wrapEnd = '</code>'; break;
                case 'align-left': wrapStart = '<div style="text-align:left">'; wrapEnd = '</div>'; break;
                case 'align-center': wrapStart = '<div style="text-align:center">'; wrapEnd = '</div>'; break;
                case 'align-right': wrapStart = '<div style="text-align:right">'; wrapEnd = '</div>'; break;
                case 'ul': wrapStart = '<ul><li>'; wrapEnd = '</li></ul>'; break;
                case 'ol': wrapStart = '<ol><li>'; wrapEnd = '</li></ol>'; break;
            }

            insertTextAtCursor(textarea, `${wrapStart} ${wrapEnd}`);
        });
    });

    function insertTextAtCursor(el, text) {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const before = el.value.substring(0, start);
        const after = el.value.substring(end);
        el.value = before + text + after;
        el.focus();
        el.selectionEnd = start + text.length;
        el.dispatchEvent(new Event('input'));
    }
}
