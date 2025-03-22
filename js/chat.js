// File: /js/chat.js

let chatMessages = [];
let isAIThinking = false;

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const chatBox = document.getElementById('chatBox');
    const chatInput = document.getElementById('chatInput');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isAIThinking) return;

        const message = chatInput.value.trim();
        if (!message) return;

        renderMessage('user', message);
        chatMessages.push({ sender: 'user', content: message });

        chatInput.value = '';
        isAIThinking = true;
        showTypingIndicator();

        const response = await fetchAIResponse(message);
        removeTypingIndicator();

        if (response) {
            renderMessage('ai', response);
            chatMessages.push({ sender: 'ai', content: response });

            if (chatMessages.length === 2) saveNewChat(chatMessages);
        }

        isAIThinking = false;
    });
});

function renderMessage(sender, content) {
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', `${sender}-msg`);

    const msgWrapper = document.createElement('div');
    msgWrapper.classList.add('message-content');
    msgWrapper.innerHTML = renderFormatted(content);

    bubble.appendChild(msgWrapper);
    document.getElementById('chatBox').appendChild(bubble);
    scrollToBottom();
}

function renderFormatted(text) {
    let html = text
    .replace(/\n/g, '<br>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/<code>(.*?)<\/code>/g, '<code>$1</code>');
    return html;
}

function showTypingIndicator() {
    const typing = document.createElement('div');
    typing.classList.add('typing-indicator');
    typing.id = 'typingIndicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    document.getElementById('chatBox').appendChild(typing);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

function scrollToBottom() {
    const chatBox = document.getElementById('chatBox');
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function fetchAIResponse(message) {
    try {
        const res = await fetch('/backend/ajax/ajax_chat_handler.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await res.json();
        return data.reply || '[No reply]';
    } catch (err) {
        console.error('AI fetch failed:', err);
        return '[Error: AI not responding]';
    }
}

// CONTINUATION: /js/chat.js

function saveNewChat(messages) {
    const firstUserMsg = messages.find(m => m.sender === 'user')?.content || '';
    const autoTitle = generateChatTitle(firstUserMsg);

    const chat = {
        id: Date.now(),
        title: autoTitle,
        messages,
        date: new Date().toISOString()
    };

    // Save to localStorage (or call backend)
    const savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    savedChats.push(chat);
    localStorage.setItem('savedChats', JSON.stringify(savedChats));

    renderChatItem(chat);
}

function generateChatTitle(text) {
    const words = text.trim().split(/\s+/).slice(0, 5).join(' ');
    const keywords = ['Question', 'Idea', 'Prompt', 'Note'];
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    return `${keyword}: ${words}`;
}

function renderChatItem(chat) {
    const group = getChatDateGroup(chat.date);
    const history = document.getElementById('chatHistory');

    // Create group block if not exists
    let groupEl = document.querySelector(`.chat-history-group[data-group="${group}"]`);
    if (!groupEl) {
        groupEl = document.createElement('div');
        groupEl.classList.add('chat-history-group');
        groupEl.dataset.group = group;
        groupEl.innerHTML = `<div class="chat-history-date">${group}</div>`;
        history.appendChild(groupEl);
    }

    const item = document.createElement('div');
    item.classList.add('chat-item');
    item.innerHTML = `
    <span class="chat-title-text">${chat.title}</span>
    <button class="chat-options" title="Options">⋮</button>
    <div class="chat-dropdown">
    <button onclick="loadChat(${chat.id})">📂 Load</button>
    <button onclick="editChatTitle(${chat.id})">✏️ Edit</button>
    <button onclick="deleteChat(${chat.id})">❌ Delete</button>
    </div>
    `;

    item.querySelector('.chat-options').addEventListener('click', (e) => {
        const dropdown = item.querySelector('.chat-dropdown');
        dropdown.classList.toggle('visible');
        e.stopPropagation();
    });

    groupEl.appendChild(item);
}

function getChatDateGroup(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);

    if (diff < 1) return 'Today';
    if (diff < 2) return 'Yesterday';
    if (diff < 7) return 'Last 7 Days';
    if (diff < 30) return 'Last 30 Days';

    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
}

window.loadChat = (id) => alert(`Loading chat #${id}...`);
window.editChatTitle = (id) => alert(`Edit title for chat #${id}`);
window.deleteChat = (id) => {
    if (confirm('Are you sure to delete this chat?')) {
        let savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
        savedChats = savedChats.filter(c => c.id !== id);
        localStorage.setItem('savedChats', JSON.stringify(savedChats));
        location.reload();
    }
}

