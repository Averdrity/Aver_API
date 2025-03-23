// =======================================================
// 🚀 chat.js | Final Version (Token Stream + Markdown + Live Sidebar)
// =======================================================

let currentChatId = null;

import { initChatboxModal } from './chatbox-modal.js';

document.addEventListener('DOMContentLoaded', () => {
    loadMemories();
    loadChatHistory();
    initChatboxModal(sendMessageToServer);

    const newBtn = document.getElementById('newChatBtn');
    if (newBtn) newBtn.addEventListener('click', startNewChatSession);
});

// =================== AJAX Load Memories ===================
async function loadMemories() {
    try {
        const res = await fetch('/backend/ajax/ajax_memory_handler.php?action=getMemories');
        const data = await res.json();
        if (data.success && data.memories) renderMemories(data.memories);
        else console.warn('No memories or load issue:', data.message || 'Unknown error');
    } catch (error) {
        console.error('Memory fetch failed:', error);
    }
}

function renderMemories(memories) {
    const sidebar = document.getElementById('memory-sidebar');
    sidebar.innerHTML = '';
    memories.forEach(memory => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.innerHTML = `
        <div class="memory-title">${memory.title}</div>
        <div class="memory-tag">${memory.tag}</div>
        <div class="memory-date">${memory.created_at}</div>
        <button class="memory-delete">Delete</button>
        `;
        card.querySelector('.memory-delete').onclick = () => deleteMemory(memory.id);
        sidebar.appendChild(card);
    });
}

async function deleteMemory(id) {
    if (!confirm('Delete this memory?')) return;
    try {
        const res = await fetch('/backend/ajax/ajax_memory_handler.php?action=deleteMemory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memoryId: id })
        });
        const data = await res.json();
        if (data.success) loadMemories();
        else console.error('Memory deletion failed:', data.message);
    } catch (err) {
        console.error('Memory deletion error:', err);
    }
}

// =================== Load Chat History ===================
async function loadChatHistory() {
    try {
        const res = await fetch('/backend/ajax/ajax_chat_handler.php?action=getChats');
        const data = await res.json();
        if (data.success && data.chats) {
            const grouped = categorizeChatsByDate(data.chats);
            renderChatHistory(grouped);
        }
    } catch (err) {
        console.error('Chat history error:', err);
    }
}

function categorizeChatsByDate(chats) {
    const groups = { "Today": [], "Yesterday": [], "Previous 7 Days": [], "Previous 30 Days": [], "Earlier": {} };
    const now = new Date();

    chats.forEach(chat => {
        const created = new Date(chat.created_at);
        const daysDiff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        const label = created.toLocaleDateString();

        if (daysDiff === 0) groups["Today"].push(chat);
        else if (daysDiff === 1) groups["Yesterday"].push(chat);
        else if (daysDiff <= 7) groups["Previous 7 Days"].push(chat);
        else if (daysDiff <= 30) groups["Previous 30 Days"].push(chat);
        else {
            if (!groups["Earlier"][label]) groups["Earlier"][label] = [];
            groups["Earlier"][label].push(chat);
        }
    });
    return groups;
}

function renderChatHistory(groups) {
    const container = document.getElementById('chat-history');
    container.innerHTML = '';

    // 🧠 Toolbar wrapper
    const toolbar = document.createElement('div');
    toolbar.className = 'chat-toolbar';

    // 🔍 Search Icon Button with native browser tooltip
    const searchIconBtn = document.createElement('button');
    searchIconBtn.className = 'toolbar-icon search-icon-btn';
    searchIconBtn.title = 'Search Chat History'; // Tooltip on button

    const searchIcon = document.createElement('i');
    searchIcon.className = 'icon-search';
    searchIcon.innerText = '🔍';
    searchIcon.title = 'Search Chat History'; // Tooltip on icon too
    searchIconBtn.appendChild(searchIcon);
    toolbar.appendChild(searchIconBtn);

    // New Chat Button
    const newChatIconBtn = document.createElement('button');
    newChatIconBtn.className = 'toolbar-icon new-chat-icon-btn';
    newChatIconBtn.title = 'Start New Chat';

    const newChatIcon = document.createElement('i');
    newChatIcon.className = 'icon-newchat';
    newChatIcon.innerText = '✏️';
    newChatIcon.title = 'Start New Chat';
    newChatIconBtn.appendChild(newChatIcon);
    newChatIconBtn.onclick = startNewChatSession;
    toolbar.appendChild(newChatIconBtn);

    // Append toolbar to container
    container.appendChild(toolbar);

    // 🔍 Search input wrapper (initially hidden)
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-input-wrapper hidden'; // Start hidden

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search chats...';
    searchInput.className = 'chat-search';
    searchInput.addEventListener('input', () => filterChatCards(searchInput.value));

    searchWrapper.appendChild(searchInput);
    container.appendChild(searchWrapper);

    // Toggle search bar visibility
    searchIconBtn.addEventListener('click', () => {
        searchWrapper.classList.toggle('hidden');
        if (!searchWrapper.classList.contains('hidden')) {
            searchInput.focus();
        }
    });

    // 💬 Render chat groups and chat cards
    for (const group in groups) {
        const title = document.createElement('h4');
        title.textContent = group;
        container.appendChild(title);

        const chats = Array.isArray(groups[group]) ? groups[group] : Object.values(groups[group]).flat();
        chats.forEach(chat => {
            const card = renderChatCard(chat);
            container.appendChild(card);
        });
    }
}


// ================= Render Chat Cards =================
function renderChatCard(chat) {
    const card = document.createElement('div');
    card.className = 'chat-card';

    const title = document.createElement('div');
    title.className = 'chat-title';
    title.textContent = chat.title;

    const wrapper = document.createElement('div');
    wrapper.className = 'chat-dropdown-wrapper';

    const btn = document.createElement('button');
    btn.className = 'chat-dropdown-btn';
    btn.innerHTML = '&#8942;';

    const menu = document.createElement('div');
    menu.className = 'chat-dropdown-menu hidden';
    menu.innerHTML = `
    <div class="dropdown-item" onclick="loadChat(${chat.id})">📂 Load Chat</div>
    <div class="dropdown-item" onclick="renameChat(${chat.id})">✏️ Edit Title</div>
    <div class="dropdown-item" onclick="deleteChat(${chat.id})">❌ Delete</div>
    `;

    btn.onclick = e => {
        e.stopPropagation();
        closeAllDropdowns();
        menu.classList.toggle('hidden');
    };

    document.addEventListener('click', e => {
        if (!wrapper.contains(e.target)) menu.classList.add('hidden');
    });

        wrapper.appendChild(btn);
        wrapper.appendChild(menu);
        card.appendChild(title);
        card.appendChild(wrapper);
        return card;
}

// ================= Chat Actions =================
window.loadChat = async function(chatId) {
    try {
        const res = await fetch(`/backend/ajax/ajax_chat_handler.php?action=loadChat&chatId=${chatId}`);
        const data = await res.json();
        if (data.success) {
            currentChatId = chatId;
            const container = document.getElementById('chatMessages');
            container.innerHTML = '';
            data.messages.forEach(m => displayMessage(m.sender, m.content));
        }
    } catch (err) {
        console.error('Load chat error:', err);
    }
};

window.renameChat = async function(chatId) {
    const newTitle = prompt('Enter new title:');
    if (!newTitle) return;
    try {
        const res = await fetch('/backend/ajax/ajax_chat_handler.php?action=renameChat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, newTitle })
        });
        const data = await res.json();
        if (data.success) loadChatHistory();
    } catch (err) {
        console.error('Rename chat error:', err);
    }
};

window.deleteChat = async function(chatId) {
    if (!confirm('Delete this chat?')) return;
    try {
        const res = await fetch('/backend/ajax/ajax_chat_handler.php?action=deleteChat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId })
        });
        const data = await res.json();
        if (data.success) loadChatHistory();
    } catch (err) {
        console.error('Delete chat error:', err);
    }
};

// ================= New Chat Session =================
function startNewChatSession() {
    currentChatId = null;
    document.getElementById('chatMessages').innerHTML = '';
    const input = document.getElementById('chatboxInput');
    if (input) input.value = '';

    fetch('/backend/ajax/ajax_chat_handler.php?action=resetChatSession')
    .then(res => res.json())
    .then(data => {
        if (data.success) createNewChatPrompt();
    });
}

function createNewChatPrompt() {
    const box = document.createElement('div');
    box.className = 'new-chat-popup';
    box.textContent = '🆕 New chat session started';
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3000);
}

// ================= Message Handling =================
async function sendMessageToServer(message) {
    displayMessage('user', message);

    const chatBox = document.getElementById('chatMessages');
    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'message-bubble message-ai';
    thinkingBubble.textContent = '🤖 AI is thinking...';
    chatBox.appendChild(thinkingBubble);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const res = await fetch('/backend/ajax/ajax_chat_handler.php?action=sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, chatId: currentChatId })
        });

        const data = await res.json();
        thinkingBubble.remove();

        if (data.success && data.response) {
            displayMessageTokenByToken('ai', data.response);
            if (data.chatId) {
                currentChatId = data.chatId;
                loadChatHistory();
            }
        } else {
            console.error('Message send failed:', data.message);
        }
    } catch (error) {
        thinkingBubble.remove();
        console.error('Send error:', error);
    }
}

function displayMessage(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender === 'user' ? 'message-user' : 'message-ai'}`;
    if (sender === 'ai') {
        bubble.innerHTML = marked.parse(message);
    } else {
        bubble.textContent = message;
    }
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displayMessageTokenByToken(sender, fullText) {
    const chatMessages = document.getElementById('chatMessages');
    const msgBubble = document.createElement('div');
    msgBubble.className = `message-bubble ${sender === 'user' ? 'message-user' : 'message-ai'}`;
    chatMessages.appendChild(msgBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    let buffer = '';
    let index = 0;
    const typingSpeed = 20; // milliseconds per char
    const markdownRefreshRate = 3; // Re-parse every 3 characters for smoother rendering

    const renderMarkdown = () => {
        msgBubble.innerHTML = marked.parse(buffer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    function typeNextChar() {
        if (index < fullText.length) {
            buffer += fullText[index];
            index++;

            // Update markdown-rendered HTML every N characters
            if (index % markdownRefreshRate === 0 || index === fullText.length) {
                renderMarkdown();
            }

            setTimeout(typeNextChar, typingSpeed);
        }
    }

    typeNextChar();
}



// ================= Utilities =================
function closeAllDropdowns() {
    document.querySelectorAll('.chat-dropdown-menu').forEach(menu => menu.classList.add('hidden'));
}

function filterChatCards(term) {
    const cards = document.querySelectorAll('.chat-card');
    cards.forEach(card => {
        const title = card.querySelector('.chat-title').textContent.toLowerCase();
        card.style.display = title.includes(term.toLowerCase()) ? '' : 'none';
    });
}
