document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // DOM Elements
    const messageContainer = document.getElementById('message-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const anonymousToggle = document.getElementById('anonymous-toggle');
    const statusBar = document.getElementById('status-bar');
    // New elements for file sending
    const fileInput = document.getElementById('file-input');
    const cameraBtn = document.getElementById('camera-btn');
    const attachBtn = document.getElementById('attach-btn');

    // State
    let isAnonymous = false;
    let currentUserName = 'Omkar'; 

    // --- Helper Functions ---
    // Function to find URLs in text and wrap them in <a> tags
    const linkify = (text) => {
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`);
    };

    // --- Main Functions ---

    // Function to create and append any type of message to the chat
    const appendMessage = (data) => {
        const { sender_name, message_text, created_at, is_anonymous, message_type, file_url } = data;
        const time = new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        const isSentByMe = !is_anonymous && sender_name === currentUserName;
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message', isSentByMe ? 'message-sent' : 'message-received');
        
        const displayName = is_anonymous ? 'Anonymous' : sender_name;

        let messageContentHTML = '';
        // Decide content based on message type
        switch (message_type) {
            case 'image':
                messageContentHTML = `<img src="${file_url}" alt="Image" class="chat-image">`;
                break;
            case 'file':
                 messageContentHTML = `
                    <div class="file-attachment">
                        <i class="fas fa-file-alt"></i>
                        <a href="${file_url}" target="_blank" download>${message_text || 'Download File'}</a>
                    </div>`;
                break;
            default: // 'text'
                messageContentHTML = `<span class="message-text">${linkify(message_text)}</span>`;
        }

        const messageHTML = `
            ${!isSentByMe ? `<img src="https://i.pravatar.cc/32?u=${sender_name}" alt="Avatar" class="sender-avatar">` : ''}
            <div class="message-bubble">
                ${!isSentByMe ? `<div class="message-sender">${displayName}</div>` : ''}
                <div class="message-content">
                    ${messageContentHTML}
                    <span class="message-meta">${time} ${isSentByMe ? '<i class="fa-solid fa-check-double ticks"></i>' : ''}</span>
                </div>
            </div>
        `;
        
        messageWrapper.innerHTML = messageHTML;
        messageContainer.appendChild(messageWrapper);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    };

    // --- Event Handlers ---
    
    // Handle sending a TEXT message
    const sendTextMessage = () => {
        const text = messageInput.value.trim();
        if (text) {
            const messageData = { text, isAnonymous };
            socket.emit('chat message', messageData);
            appendMessage({
                sender_name: isAnonymous ? 'Anonymous' : currentUserName,
                message_text: text,
                is_anonymous: isAnonymous,
                message_type: 'text',
                created_at: new Date()
            });
            messageInput.value = '';
            messageInput.focus();
        }
    };

    // Handle selecting and uploading a FILE
    const handleFileUpload = (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('senderName', currentUserName);
        formData.append('isAnonymous', isAnonymous);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => console.log('Upload success:', data))
        .catch(error => console.error('Upload error:', error));
    };

    sendButton.addEventListener('click', sendTextMessage);
    messageInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendTextMessage());
    
    // New Listeners for file buttons
    cameraBtn.addEventListener('click', () => {
        fileInput.setAttribute('accept', 'image/*'); // Only allow images
        fileInput.click();
    });

    attachBtn.addEventListener('click', () => {
        fileInput.removeAttribute('accept'); // Allow any file type
        fileInput.click();
    });

    // Listener for when a file is selected from the dialog
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        handleFileUpload(file);
        fileInput.value = ''; // Reset for next selection
    });
    
    anonymousToggle.addEventListener('click', () => {
        isAnonymous = !isAnonymous;
        anonymousToggle.classList.toggle('active', isAnonymous);
        statusBar.classList.toggle('visible', isAnonymous);
    });

    // --- Socket.IO Event Handlers ---
    socket.on('chat message', (data) => appendMessage(data));
    socket.on('load history', (messages) => {
        messageContainer.innerHTML = '';
        messages.forEach(msg => appendMessage(msg));
    });
});