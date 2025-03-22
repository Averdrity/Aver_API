// ========================================
// 🤖 chat.js (v4.0)
// ========================================
// Main Chat Logic & AI Integration
// Part 1 of 5: Initialization & Globals
// ========================================

// Global State
let currentChatId = null;
let chatHistory = [];
let memories = [];
let aiThinking = false;

// DOM Elements
const chatBox = document.getElementById('chatBox');
const chatSessionTitle = document.getElementById('chatSessionTitle');
const newChatBtn = document.getElementById('newChatBtn');
const chatSearchInput = document.getElementById('chatSearch');
const memorySearchInput = document.getElementById('memorySearch');
const memoryList = document.getElementById('memoryList');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeChatSession();
    loadChatHistory();
    loadMemories();
    setupEventListeners();
});

// Initialize a new Chat Session
function initializeChatSession() {
    currentChatId = null;
    chatSessionTitle.textContent = '✨ AI Chat Session';
    chatBox.innerHTML = '';
}

// Setup global event listeners
function setupEventListeners() {
    newChatBtn.onclick = () => startNewChat();
    chatSearchInput.addEventListener('input', filterChatHistory);
    memorySearchInput.addEventListener('input', filterMemories);
}

// ========================================
// 🤖 chat.js (v4.0)
// ========================================
// Part 2 of 5: Load & Render Chat History
// ========================================

// Load saved chat history from the server
async function loadChatHistory() {
    try {
        const res = await fetch('/backend/ajax/ajax_chat_handler.php?action=getChats', {
            credentials: 'include'
        });
        const data = await res.json();
        chatHistory = data.chats;
        renderChatHistory(chatHistory);
    } catch (error) {
        console.error('Failed to load chats:', error);
    }
}

// Render Chat History in the Sidebar
function renderChatHistory(chats) {
    const chatHistoryContainer = document.getElementById('chatHistory');
    chatHistoryContainer.innerHTML = '';

    if (!chats || !Array.isArray(chats)) {
        console.warn('No chats found or invalid response.');
        return;
    }

    const categorizedChats = categorizeChatsByDate(chats);

    Object.entries(categorizedChats).forEach(([category, chats]) => {
        const categoryHeader = document.createElement('h4');
        categoryHeader.textContent = category;
        categoryHeader.classList.add('chat-category-header');
        chatHistoryContainer.appendChild(categoryHeader);

        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');
            chatItem.dataset.chatId = chat.id;
            chatItem.textContent = chat.title;

            const optionsBtn = document.createElement('button');
            optionsBtn.classList.add('chat-options');
            optionsBtn.innerHTML = '⋮';
            chatItem.appendChild(optionsBtn);

            const dropdownMenu = document.createElement('div');
            dropdownMenu.classList.add('chat-dropdown');
            dropdownMenu.innerHTML = `
            <button onclick="loadChat('${chat.id}')">📂 Load Chat</button>
            <button onclick="renameChat('${chat.id}')">✏️ Rename Chat</button>
            <button onclick="deleteChat('${chat.id}')">🗑️ Delete Chat</button>
            `;
            chatItem.appendChild(dropdownMenu);

            optionsBtn.onclick = (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('visible');
            };

            chatHistoryContainer.appendChild(chatItem);
        });
    });
}


// Categorize chats by date
function categorizeChatsByDate(chats) {
    const categories = {
        'Today': [],
        'Yesterday': [],
        'Previous 7 Days': [],
        'Previous 30 Days': [],
        'Older': []
    };

    const now = new Date();

    chats.forEach(chat => {
        const chatDate = new Date(chat.created_at);
        const diffDays = Math.floor((now - chatDate) / (1000 * 3600 * 24));

        if (diffDays === 0) categories['Today'].push(chat);
        else if (diffDays === 1) categories['Yesterday'].push(chat);
        else if (diffDays <= 7) categories['Previous 7 Days'].push(chat);
        else if (diffDays <= 30) categories['Previous 30 Days'].push(chat);
        else categories['Older'].push(chat);
    });

        return categories;
}

// Filter chats based on search input
function filterChatHistory() {
    const query = chatSearchInput.value.toLowerCase();
    const filteredChats = chatHistory.filter(chat => chat.title.toLowerCase().includes(query));
    renderChatHistory(filteredChats);
}

// ========================================
// 🤖 chat.js (v4.0)
// ========================================
// Part 3 of 5: Handling New Chats & Options
// ========================================

// Start a New Chat Session
function startNewChat() {
    initializeChatSession();
    displaySystemMessage('🆕 New chat session started.');
}

// Load a chat from history
async function loadChat(chatId) {
    try {
        const res = await fetch(`/backend/ajax/ajax_chat_handler.php?action=getMessages&chatId=${chatId}`, {
            credentials: 'include'
        });
        const data = await res.json();
        currentChatId = chatId;
        chatSessionTitle.textContent = data.chatTitle || 'Loaded Chat';
        renderMessages(data.messages);
    } catch (error) {
        console.error('Failed to load chat:', error);
    }
}

// Rename chat
function renameChat(chatId) {
    const newTitle = prompt('Enter new chat title:');
    if (!newTitle) return;

    fetch(`/backend/ajax/ajax_chat_handler.php?action=renameChat&chatId=${chatId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
    }).then(() => {
        loadChatHistory();
    });
}

// Delete chat
function deleteChat(chatId) {
    if (confirm('Are you sure you want to delete this chat?')) {
        fetch(`/backend/ajax/ajax_chat_handler.php?action=deleteChat&chatId=${chatId}`, {
            method: 'POST',
            credentials: 'include'
        }).then(() => {
            if (chatId === currentChatId) startNewChat();
            loadChatHistory();
        });
    }
}

// Render loaded messages
function renderMessages(messages) {
    chatBox.innerHTML = '';
    messages.forEach(msg => renderMessage(msg.role, msg.content));
}

// Render individual message
function renderMessage(role, content) {
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', role === 'user' ? 'user-msg' : 'ai-msg');
    bubble.innerHTML = `
    <div class="message-content">${content}</div>
    <button class="copy-btn" onclick="copyText(this)">📋</button>
    `;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Display temporary system message
function displaySystemMessage(content) {
    const sysMsg = document.createElement('div');
    sysMsg.classList.add('chat-bubble', 'system-msg');
    sysMsg.textContent = content;
    chatBox.appendChild(sysMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => sysMsg.remove(), 3000);
}

// Copy message content to clipboard
function copyText(btn) {
    const text = btn.previousElementSibling.innerText;
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✅';
        setTimeout(() => (btn.textContent = '📋'), 2000);
    });
}

// ========================================
// 🤖 chat.js (v4.0)
// ========================================
// Part 4 of 5: Memory System Management
// ========================================

// Load user memories from server
async function loadMemories() {
    try {
        const res = await fetch('/backend/ajax/ajax_memory_handler.php?action=getMemories', {
            credentials: 'include'
        });
        const data = await res.json();
        memories = data.memories;
        renderMemories(memories);
    } catch (error) {
        console.error('Failed to load memories:', error);
    }
}

// Render memories as cards
function renderMemories(memoryArray) {
    memoryList.innerHTML = '';
    if (!memoryArray || !Array.isArray(memoryArray)) {
        console.warn('No memories found or invalid response.');
        return;
    }

    memoryArray.forEach(memory => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.memoryId = memory.id;
        card.innerHTML = `
        <div class="memory-title">${memory.title}</div>
        <div class="memory-tag">${memory.tags}</div>
        <div class="memory-date">${new Date(memory.created_at).toLocaleDateString()}</div>
        <button class="memory-delete">🗑️</button>
        `;

        card.onclick = (e) => {
            if (!e.target.classList.contains('memory-delete')) {
                editMemory(memory.id);
            }
        };

        card.querySelector('.memory-delete').onclick = (e) => {
            e.stopPropagation();
            deleteMemory(memory.id);
        };

        memoryList.appendChild(card);
    });
}


// Edit memory content
function editMemory(memoryId) {
    const memory = memories.find(mem => mem.id === memoryId);
    const newContent = prompt('Edit memory content:', memory.content);
    if (newContent === null) return;

    fetch(`/backend/ajax/ajax_memory_handler.php?action=editMemory&memoryId=${memoryId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
    }).then(() => loadMemories());
}

// Delete memory
function deleteMemory(memoryId) {
    if (confirm('Are you sure you want to delete this memory?')) {
        fetch(`/backend/ajax/ajax_memory_handler.php?action=deleteMemory&memoryId=${memoryId}`, {
            method: 'POST',
            credentials: 'include'
        }).then(() => loadMemories());
    }
}

// Filter memories based on search input
function filterMemories() {
    const query = memorySearchInput.value.toLowerCase();
    const filtered = memories.filter(mem =>
    mem.title.toLowerCase().includes(query) || mem.tags.toLowerCase().includes(query)
    );
    renderMemories(filtered);
}

// Clear all memories
document.getElementById('clearAllMemoriesBtn').onclick = () => {
    if (confirm('Clear all memories? This action is irreversible.')) {
        fetch('/backend/ajax/ajax_memory_handler.php?action=clearAll', {
            method: 'POST',
            credentials: 'include'
        }).then(() => loadMemories());
    }
};

// ========================================
// 🤖 chat.js (v4.0)
// ========================================
// Part 5 of 5: Sending/Receiving & AI Integration
// ========================================

// Event listener for chat form submission
document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (message && !aiThinking) {
        sendMessage(message);
        input.value = '';
    }
});

// Send message and fetch AI response
async function sendMessage(message) {
    renderMessage('user', message);
    aiThinking = true;
    renderTypingIndicator(true);

    // Save message to server and get chatId if new
    const saveRes = await fetch('/backend/ajax/ajax_chat_handler.php?action=saveMessage', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: currentChatId, role: 'user', content: message })
    });

    const saveData = await saveRes.json();
    if (!currentChatId) {
        currentChatId = saveData.chatId;
        loadChatHistory();
    }

    // Fetch AI response from Flask backend
    try {
        const aiRes = await fetch('/backend/ollama-server.py', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: message })
        });

        const aiData = await aiRes.json();
        const aiMessage = aiData.response || 'Oops! Something went wrong.';

        renderMessage('ai', aiMessage);

        // Save AI message to server
        fetch('/backend/ajax/ajax_chat_handler.php?action=saveMessage', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId: currentChatId, role: 'ai', content: aiMessage })
        });

    } catch (error) {
        console.error('AI response error:', error);
        renderMessage('system', 'Error fetching AI response.');
    }

    aiThinking = false;
    renderTypingIndicator(false);
}

// Typing indicator
function renderTypingIndicator(active) {
    if (active) {
        const indicator = document.createElement('div');
        indicator.classList.add('chat-bubble', 'ai-msg', 'typing-indicator');
        indicator.innerHTML = '<span></span><span></span><span></span>';
        indicator.id = 'typingIndicator';
        chatBox.appendChild(indicator);
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }
}
