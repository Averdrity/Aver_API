// =======================================================
// 🚀 chat.js | Final Version (Fully Enhanced & Optimized)
// =======================================================
// Handles full chat functionalities:
// AJAX memory/chat loading, sending messages, dynamic UI
// =======================================================

import { initChatboxModal } from './chatbox-modal.js';

document.addEventListener('DOMContentLoaded', () => {
    loadMemories();
    loadChatHistory();
    initChatboxModal(sendMessageToServer);
});

// =================== AJAX Load Memories ===================
async function loadMemories() {
    try {
        const res = await fetch('/backend/ajax/ajax_memory_handler.php?action=getMemories');
        const data = await res.json();
        if (data.success && data.memories) {
            renderMemories(data.memories);
        } else {
            console.warn('No memories or load issue:', data.message);
        }
    } catch (error) {
        console.error('Memory fetch failed:', error);
    }
}

function renderMemories(memories) {
    const memorySidebar = document.getElementById('memory-sidebar');
    memorySidebar.innerHTML = ''; // clear first

    memories.forEach(memory => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.innerHTML = `
        <div class="memory-title">${memory.title}</div>
        <div class="memory-tag">${memory.tag}</div>
        <div class="memory-date">${memory.created_at}</div>
        <button class="memory-delete">Delete</button>
        `;
        memorySidebar.appendChild(card);

        card.querySelector('.memory-delete').onclick = () => deleteMemory(memory.id);
    });
}

async function deleteMemory(memoryId) {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    try {
        const res = await fetch('/backend/ajax/ajax_memory_handler.php?action=deleteMemory', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ memoryId })
        });
        const data = await res.json();
        if (data.success) loadMemories();
        else console.error('Deletion failed:', data.message);
    } catch (error) {
        console.error('Memory deletion error:', error);
    }
}

// =================== AJAX Load Chats ===================
async function loadChatHistory() {
    try {
        const res = await fetch('/backend/ajax/ajax_chat_handler.php?action=getChats');
        const data = await res.json();
        if (data.success && data.chats) {
            renderChatHistory(data.chats);
        } else {
            console.warn('No chats or load issue:', data.message);
        }
    } catch (error) {
        console.error('Chat history fetch failed:', error);
    }
}

function renderChatHistory(chats) {
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = '';

    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.classList.add('chat-item');
        chatItem.textContent = chat.title;
        chatHistory.appendChild(chatItem);
    });
}

// =================== Send Messages ===================
async function sendMessageToServer(message) {
    displayMessage('user', message);
    try {
        const res = await fetch('/backend/ajax/ajax_chat_handler.php?action=sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await res.json();
        if (data.success && data.response) {
            displayMessage('ai', data.response);
        } else {
            console.error('Message send failed:', data.message);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function displayMessage(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    const msgBubble = document.createElement('div');
    msgBubble.classList.add('message-bubble', sender === 'user' ? 'message-user' : 'message-ai');
    msgBubble.textContent = message;
    chatMessages.appendChild(msgBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
