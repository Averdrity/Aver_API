// File: /js/chat.js

// =========================================
// 💬 chat.js (v3.0)
// =========================================
// Handles chat interface logic: sending/
// receiving messages, rendering, history,
// and memory management. Modularized and
// uses templates for rendering.
// =========================================

export class Chat {
    constructor() {
        this.chatMessages = [];
        this.isAIThinking = false;
        this.chatBox = document.getElementById('chatBox');
        this.chatInput = document.getElementById('chatInput');
        this.chatSubmitButton = document.getElementById('chat-submit-button');
        this.chatHistory = document.getElementById('chatHistory');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.memoryList = document.getElementById('memoryList');
        this.clearAllMemoriesBtn = document.getElementById('clearAllMemoriesBtn');
        this.chatSearch = document.getElementById('chatSearch');
        this.memorySearch = document.getElementById('memorySearch');
        this.chatSessionTitle = document.getElementById('chatSessionTitle');
        this.headerMountPoint = document.getElementById('headerMountPoint');
        this.footerMountPoint = document.getElementById('footerMountPoint');
    }

    init() {
        this.loadChatHistory();
        this.setupEventListeners();
        this.loadMemories(); // Load memories on init
    }

    setupEventListeners() {
        this.chatSubmitButton.addEventListener('click', () => this.handleUserInput());

        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });

        this.newChatBtn.addEventListener('click', () => this.startNewChat());

        // Memory management event listeners
        this.clearAllMemoriesBtn.addEventListener('click', () => this.clearAllMemories());

        // Search functionality
        this.chatSearch.addEventListener('input', () => this.filterChatHistory());
        this.memorySearch.addEventListener('input', () => this.filterMemories());
    }

    handleUserInput() {
        if (this.isAIThinking) return;

        const message = this.chatInput.value.trim();
        if (!message) return;

        this.renderMessage('user', message);
        this.chatMessages.push({ sender: 'user', content: message });

        this.chatInput.value = '';
        this.isAIThinking = true;
        this.showTypingIndicator();

        this.fetchAIResponse(message)
        .then(response => {
            this.removeTypingIndicator();
            if (response) {
                this.renderMessage('ai', response);
                this.chatMessages.push({ sender: 'ai', content: response });

                if (this.chatMessages.length === 2) this.saveNewChat(this.chatMessages);
            }
            this.isAIThinking = false;
        })
        .catch(error => {
            this.removeTypingIndicator();
            this.renderError(error.message || 'Failed to get response from AI.');
            this.isAIThinking = false;
        });
    }

    renderMessage(sender, content) {
        const messageHTML = this.createMessageHTML(sender, content);
        this.chatBox.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
    }

    createMessageHTML(sender, content) {
        const formattedContent = this.renderFormatted(content);
        const timestamp = new Date().toLocaleTimeString();

        return `
        <div class="chat-bubble ${sender}-msg">
        <div class="message-content">
        ${formattedContent}
        <span class="message-timestamp">${timestamp}</span>
        </div>
        </div>
        `;
    }

    renderFormatted(text) {
        if (!text) return ''; // Handle null or undefined

        let html = text
        .replace(/\n/g, '<br>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/<code>(.*?)<\/code>/g, '<code>$1</code>')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
        .replace(/\*(.*?)\*/g, '<i>$1</i>')     // Italic
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>'); // Links
        return html;
    }

    showTypingIndicator() {
        const typingHTML = `
        <div class="typing-indicator" id="typingIndicator">
        <span></span><span></span><span></span>
        </div>
        `;
        this.chatBox.insertAdjacentHTML('beforeend', typingHTML);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    scrollToBottom() {
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    async fetchAIResponse(message) {
        try {
            const res = await fetch('/backend/ajax/ajax_chat_handler.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            return data.reply || '[No reply]';
        } catch (err) {
            console.error('AI fetch failed:', err);
            this.renderError('Error: Failed to fetch AI response.');
            return null; // Important: Indicate failure
        }
    }

    renderError(message) {
        const errorHTML = `
        <div class="chat-bubble error-msg">
        <div class="message-content">
        ⚠️ ${message}
        </div>
        </div>
        `;
        this.chatBox.insertAdjacentHTML('beforeend', errorHTML);
        this.scrollToBottom();
    }

    saveNewChat(messages) {
        const firstUserMsg = messages.find(m => m.sender === 'user')?.content || '';
        const autoTitle = this.generateChatTitle(firstUserMsg);

        const chat = {
            id: Date.now(),
            title: autoTitle,
            messages,
            date: new Date().toISOString()
        };

        // Save to localStorage (or call backend)
        const savedChats = JSON.parse(localStorage.getItem('savedChats') || '');
        savedChats.push(chat);
        localStorage.setItem('savedChats', JSON.stringify(savedChats));

        this.renderChatItem(chat);
    }

    generateChatTitle(text) {
        if (!text) return 'New Chat'; // Handle empty input

        const words = text.trim().split(/\s+/).slice(0, 5).join(' ');
        const keywords = ['Question', 'Idea', 'Prompt', 'Note'];
        const keyword = keywords[Math.floor(Math.random() * keywords.length)];
        return `${keyword}: ${words}`;
    }

    renderChatItem(chat) {
        const group = this.getChatDateGroup(chat.date);

        // Create group block if not exists
        let groupEl = this.chatHistory.querySelector(`.chat-history-group[data-group="${group}"]`);
        if (!groupEl) {
            groupEl = document.createElement('div');
            groupEl.classList.add('chat-history-group');
            groupEl.dataset.group = group;
            groupEl.innerHTML = `<div class="chat-history-date">${group}</div>`;
            this.chatHistory.appendChild(groupEl);
        }

        const itemHTML = this.createChatItemHTML(chat);
        groupEl.insertAdjacentHTML('beforeend', itemHTML);

        // Attach event listeners after insertion (important!)
        const item = groupEl.lastElementChild;
        item.querySelector('.chat-options').addEventListener('click', (e) => {
            this.toggleChatOptions(item.querySelector('.chat-dropdown'), e);
        });
        item.querySelector('.load-chat-btn').addEventListener('click', () => this.loadChat(chat.id));
        item.querySelector('.edit-chat-btn').addEventListener('click', () => this.editChatTitle(chat.id));
        item.querySelector('.delete-chat-btn').addEventListener('click', () => this.deleteChat(chat.id));
    }

    createChatItemHTML(chat) {
        return `
        <div class="chat-item" role="listitem">
        <span class="chat-title-text">${chat.title}</span>
        <button class="chat-options" title="Options" aria-label="Chat options">
        <span aria-hidden="true">⋮</span>
        </button>
        <div class="chat-dropdown">
        <button class="load-chat-btn" data-id="${chat.id}">📂 Load</button>
        <button class="edit-chat-btn" data-id="${chat.id}">✏️ Edit</button>
        <button class="delete-chat-btn" data-id="${chat.id}">❌ Delete</button>
        </div>
        </div>
        `;
    }

    getChatDateGroup(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = (now - d) / (1000 * 60 * 60 * 24);

        if (diff < 1) return 'Today';
        if (diff < 2) return 'Yesterday';
        if (diff < 7) return 'Last 7 Days';
        if (diff < 30) return 'Last 30 Days';

        return d.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    toggleChatOptions(dropdown, e) {
        dropdown.classList.toggle('visible');
        e.stopPropagation();
    }

    startNewChat() {
        this.chatMessages = [];
        this.chatBox.innerHTML = '';
        this.chatSessionTitle.textContent = '✨ New Chat Session';
        // Potentially clear input and reset other UI elements
    }

    loadChat(id) {
        alert(`Loading chat #${id}...`);
        // Implement logic to load chat from storage (localStorage or backend)
        // and render the chat messages in the chatBox.
    }

    editChatTitle(id) {
        alert(`Edit title for chat #${id}`);
        // Implement logic to allow editing the chat title.
        // This might involve showing an input field or a modal dialog.
    }

    deleteChat(id) {
        if (confirm('Are you sure to delete this chat?')) {
            let savedChats = JSON.parse(localStorage.getItem('savedChats') || '');
            savedChats = savedChats.filter(c => c.id !== id);
            localStorage.setItem('savedChats', JSON.stringify(savedChats));
            // Remove the chat item from the UI
            const itemToRemove = this.chatHistory.querySelector(`.chat-item [data-id="${id}"]`).closest('.chat-item');
            if (itemToRemove) {
                itemToRemove.remove();
            }
            // Optionally, reload the chat history or parts of it.
            // this.loadChatHistory();
        }
    }

    loadChatHistory() {
        const savedChats = JSON.parse(localStorage.getItem('savedChats') || '');
        if (savedChats && savedChats.length > 0) {
            savedChats.forEach(chat => this.renderChatItem(chat));
        } else {
            this.chatHistory.innerHTML = '<p>No chat history available.</p>';
        }
    }

    // Memory card functions (placeholders - implement these)
    loadMemories() {
        this.memoryList.innerHTML = '<p>Memories feature is a placeholder.</p>';
    }

    clearAllMemories() {
        alert("Clear all memories - functionality not implemented.");
    }

    // Search/Filter Functions
    filterChatHistory() {
        const searchTerm = this.chatSearch.value.toLowerCase();
        const chatItems = this.chatHistory.querySelectorAll('.chat-item');

        chatItems.forEach(item => {
            const title = item.querySelector('.chat-title-text').textContent.toLowerCase();
            if (title.includes(searchTerm)) {
                item.style.display = ''; // Show item
            } else {
                item.style.display = 'none'; // Hide item
            }
        });
    }

    filterMemories() {
        const searchTerm = this.memorySearch.value.toLowerCase();
        const memoryCards = this.memoryList.querySelectorAll('.memory-card'); // Assuming memory cards have this class

        memoryCards.forEach(card => {
            const text = card.textContent.toLowerCase(); // Or use specific elements within the card
            if (text.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
}
