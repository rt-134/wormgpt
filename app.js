// Global State
let currentChatId = null;
let chatHistory = [];
let apiKey = '';
let settings = {
    temperature: 0.7,
    maxTokens: 2000,
    streamResponse: true,
    syntaxHighlight: true,
    theme: 'dark'
};
let attachedFiles = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadChatHistory();
    initializeEventListeners();
    autoResizeTextarea();
});

// Event Listeners
function initializeEventListeners() {
    const temperatureSlider = document.getElementById('temperature');
    if (temperatureSlider) {
        temperatureSlider.addEventListener('input', (e) => {
            document.getElementById('temperatureValue').textContent = e.target.value;
        });
    }
}

// Auto-resize textarea
function autoResizeTextarea() {
    const textarea = document.getElementById('userInput');
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });
}

// Handle key press in textarea
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}

// New Chat
function newChat() {
    currentChatId = Date.now().toString();
    document.getElementById('messages').innerHTML = '';
    document.getElementById('welcomeScreen').style.display = 'flex';
    document.getElementById('chatTitle').textContent = 'محادثة جديدة';
    attachedFiles = [];
    updateAttachedFiles();
}

// Send Message
async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (!message && attachedFiles.length === 0) return;
    
    if (!apiKey) {
        showNotification('يرجى إدخال مفتاح API في الإعدادات', 'error');
        openSettings();
        return;
    }
    
    // Hide welcome screen
    document.getElementById('welcomeScreen').style.display = 'none';
    
    // Add user message
    addMessage('user', message);
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Disable send button
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    
    // Show typing indicator
    const typingId = showTypingIndicator();
    
    try {
        // Prepare request
        const formData = new FormData();
        formData.append('key', apiKey);
        formData.append('text', message);
        
        // Add attached files if any
        attachedFiles.forEach(file => {
            formData.append('files[]', file);
        });
        
        // Send request
        const response = await fetch('https://sii3.top/api/error/wormgpt.php', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.text();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        // Add assistant message
        addMessage('assistant', data);
        
        // Save chat
        saveChatToHistory();
        
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessage('assistant', `حدث خطأ: ${error.message}. يرجى التحقق من مفتاح API والاتصال بالإنترنت.`);
        console.error('Error:', error);
    } finally {
        sendBtn.disabled = false;
        attachedFiles = [];
        updateAttachedFiles();
    }
}

// Add Message to Chat
function addMessage(role, content) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    const roleName = role === 'user' ? 'أنت' : 'WormGPT';
    
    let formattedContent = content;
    
    // Process markdown if syntax highlighting is enabled
    if (settings.syntaxHighlight && role === 'assistant') {
        formattedContent = processMarkdown(content);
    } else {
        formattedContent = escapeHtml(content).replace(/\n/g, '<br>');
    }
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">${avatar}</div>
            <span class="message-role">${roleName}</span>
        </div>
        <div class="message-content">${formattedContent}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Highlight code blocks
    if (settings.syntaxHighlight) {
        messageDiv.querySelectorAll('pre code').forEach(block => {
            Prism.highlightElement(block);
        });
    }
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Process Markdown
function processMarkdown(text) {
    // Enhanced markdown processing
    let html = text;
    
    // Code blocks with language
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'plaintext';
        const escapedCode = escapeHtml(code.trim());
        return `
            <div class="code-block-header">
                <span class="code-language">${language}</span>
                <button class="btn-copy-code" onclick="copyCode(this)">
                    <i class="fas fa-copy"></i> نسخ
                </button>
            </div>
            <pre><code class="language-${language}">${escapedCode}</code></pre>
        `;
    });
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

// Copy Code
function copyCode(button) {
    const codeBlock = button.closest('.message-content').querySelector('pre code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        button.innerHTML = '<i class="fas fa-check"></i> تم النسخ';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i> نسخ';
        }, 2000);
    });
}

// Show Typing Indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('messages');
    const typingDiv = document.createElement('div');
    const id = 'typing-' + Date.now();
    typingDiv.id = id;
    typingDiv.className = 'message assistant';
    typingDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <span class="message-role">WormGPT</span>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return id;
}

// Remove Typing Indicator
function removeTypingIndicator(id) {
    const typingDiv = document.getElementById(id);
    if (typingDiv) {
        typingDiv.remove();
    }
}

// File Upload
function openFileUpload() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    attachedFiles = attachedFiles.concat(files);
    updateAttachedFiles();
    event.target.value = '';
}

function updateAttachedFiles() {
    const container = document.getElementById('attachedFiles');
    container.innerHTML = '';
    
    attachedFiles.forEach((file, index) => {
        const chip = document.createElement('div');
        chip.className = 'file-chip';
        chip.innerHTML = `
            <i class="fas fa-file"></i>
            <span>${file.name}</span>
            <button class="btn-remove-file" onclick="removeFile(${index})">×</button>
        `;
        container.appendChild(chip);
    });
}

function removeFile(index) {
    attachedFiles.splice(index, 1);
    updateAttachedFiles();
}

// Code Editor
function openCodeEditor() {
    document.getElementById('codeEditorModal').classList.add('show');
}

function closeCodeEditor() {
    document.getElementById('codeEditorModal').classList.remove('show');
}

function changeLanguage() {
    const select = document.getElementById('languageSelect');
    const editor = document.getElementById('codeEditor');
    
    // Set placeholder based on language
    const placeholders = {
        javascript: '// اكتب كود JavaScript هنا\nconsole.log("Hello World!");',
        python: '# اكتب كود Python هنا\nprint("Hello World!")',
        java: '// اكتب كود Java هنا\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}',
        cpp: '// اكتب كود C++ هنا\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World!" << endl;\n    return 0;\n}',
        csharp: '// اكتب كود C# هنا\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello World!");\n    }\n}',
        php: '<?php\n// اكتب كود PHP هنا\necho "Hello World!";\n?>',
        html: '<!-- اكتب كود HTML هنا -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Page Title</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>',
        css: '/* اكتب كود CSS هنا */\nbody {\n    font-family: Arial, sans-serif;\n    background: #f0f0f0;\n}',
        sql: '-- اكتب استعلام SQL هنا\nSELECT * FROM users WHERE active = 1;'
    };
    
    if (!editor.value) {
        editor.value = placeholders[select.value] || '';
    }
}

function executeCode() {
    const code = document.getElementById('codeEditor').value;
    const language = document.getElementById('languageSelect').value;
    const output = document.getElementById('outputContent');
    
    output.textContent = 'جاري التنفيذ...';
    
    // Simulate code execution (in real implementation, use a backend service)
    setTimeout(() => {
        output.textContent = `تم تنفيذ الكود بنجاح!\n\nملاحظة: لتنفيذ الأكواد بشكل فعلي، يجب ربط المحرر بخدمة تنفيذ على السيرفر.\n\nاللغة: ${language}\nعدد الأسطر: ${code.split('\n').length}`;
    }, 1000);
}

function formatCode() {
    const editor = document.getElementById('codeEditor');
    const code = editor.value;
    
    // Basic formatting (add proper indentation)
    const lines = code.split('\n');
    let formatted = '';
    let indent = 0;
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.includes('}') || trimmed.includes(']') || trimmed.includes(')')) {
            indent = Math.max(0, indent - 1);
        }
        formatted += '    '.repeat(indent) + trimmed + '\n';
        if (trimmed.includes('{') || trimmed.includes('[') || trimmed.includes('(')) {
            indent++;
        }
    });
    
    editor.value = formatted;
}

function insertCode() {
    const code = document.getElementById('codeEditor').value;
    const language = document.getElementById('languageSelect').value;
    const input = document.getElementById('userInput');
    
    input.value = `قم بتحليل وشرح هذا الكود:\n\`\`\`${language}\n${code}\n\`\`\``;
    closeCodeEditor();
    input.focus();
}

// Settings
function openSettings() {
    document.getElementById('settingsModal').classList.add('show');
    
    // Load current settings
    document.getElementById('apiKey').value = apiKey;
    document.getElementById('temperature').value = settings.temperature;
    document.getElementById('temperatureValue').textContent = settings.temperature;
    document.getElementById('maxTokens').value = settings.maxTokens;
    document.getElementById('streamResponse').checked = settings.streamResponse;
    document.getElementById('syntaxHighlight').checked = settings.syntaxHighlight;
    document.getElementById('theme').value = settings.theme;
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('show');
}

function saveSettings() {
    apiKey = document.getElementById('apiKey').value;
    settings.temperature = parseFloat(document.getElementById('temperature').value);
    settings.maxTokens = parseInt(document.getElementById('maxTokens').value);
    settings.streamResponse = document.getElementById('streamResponse').checked;
    settings.syntaxHighlight = document.getElementById('syntaxHighlight').checked;
    settings.theme = document.getElementById('theme').value;
    
    // Save to localStorage
    localStorage.setItem('wormgpt_api_key', apiKey);
    localStorage.setItem('wormgpt_settings', JSON.stringify(settings));
    
    showNotification('تم حفظ الإعدادات بنجاح', 'success');
    closeSettings();
    
    // Apply theme
    changeTheme();
}

function loadSettings() {
    apiKey = localStorage.getItem('wormgpt_api_key') || '';
    const savedSettings = localStorage.getItem('wormgpt_settings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    }
    changeTheme();
}

function testApiKey() {
    const key = document.getElementById('apiKey').value;
    if (!key) {
        showNotification('يرجى إدخال مفتاح API', 'error');
        return;
    }
    
    showLoading();
    
    // Test API call
    const formData = new FormData();
    formData.append('key', key);
    formData.append('text', 'test');
    
    fetch('https://sii3.top/api/error/wormgpt.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        hideLoading();
        if (response.ok) {
            showNotification('مفتاح API صالح ✓', 'success');
        } else {
            showNotification('مفتاح API غير صالح', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        showNotification('فشل الاتصال بالخادم', 'error');
    });
}

function changeTheme() {
    // Theme implementation (can be extended)
    document.body.setAttribute('data-theme', settings.theme);
}

// Chat History
function loadChatHistory() {
    const saved = localStorage.getItem('wormgpt_chats');
    if (saved) {
        chatHistory = JSON.parse(saved);
        renderChatHistory();
    }
}

function saveChatToHistory() {
    const messages = document.getElementById('messages').innerHTML;
    const title = generateChatTitle(messages);
    
    const chat = {
        id: currentChatId,
        title: title,
        date: new Date().toLocaleDateString('ar-SA'),
        messages: messages
    };
    
    const existingIndex = chatHistory.findIndex(c => c.id === currentChatId);
    if (existingIndex >= 0) {
        chatHistory[existingIndex] = chat;
    } else {
        chatHistory.unshift(chat);
    }
    
    // Keep only last 50 chats
    chatHistory = chatHistory.slice(0, 50);
    
    localStorage.setItem('wormgpt_chats', JSON.stringify(chatHistory));
    renderChatHistory();
    
    document.getElementById('chatTitle').textContent = title;
}

function generateChatTitle(messagesHtml) {
    const div = document.createElement('div');
    div.innerHTML = messagesHtml;
    const firstMessage = div.querySelector('.message.user .message-content');
    if (firstMessage) {
        const text = firstMessage.textContent.trim();
        return text.length > 30 ? text.substring(0, 30) + '...' : text;
    }
    return 'محادثة جديدة';
}

function renderChatHistory() {
    const container = document.getElementById('chatHistory');
    container.innerHTML = '';
    
    chatHistory.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'chat-item';
        if (chat.id === currentChatId) {
            item.classList.add('active');
        }
        item.innerHTML = `
            <div class="chat-item-title">${chat.title}</div>
            <div class="chat-item-date">${chat.date}</div>
        `;
        item.onclick = () => loadChat(chat.id);
        container.appendChild(item);
    });
}

function loadChat(chatId) {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
        currentChatId = chatId;
        document.getElementById('messages').innerHTML = chat.messages;
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('chatTitle').textContent = chat.title;
        renderChatHistory();
        
        // Re-highlight code blocks
        if (settings.syntaxHighlight) {
            document.querySelectorAll('pre code').forEach(block => {
                Prism.highlightElement(block);
            });
        }
    }
}

// Export Chat
function exportChat() {
    const messages = document.getElementById('messages').innerText;
    if (!messages.trim()) {
        showNotification('لا توجد محادثة لتصديرها', 'error');
        return;
    }
    
    const blob = new Blob([messages], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('تم تصدير المحادثة', 'success');
}

// Clear Chat
function clearChat() {
    if (confirm('هل أنت متأكد من مسح المحادثة الحالية؟')) {
        newChat();
        showNotification('تم مسح المحادثة', 'success');
    }
}

// Voice Input (placeholder)
function toggleVoiceInput() {
    showNotification('ميزة الإدخال الصوتي قيد التطوير', 'warning');
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'var(--error)' : type === 'success' ? 'var(--success)' : 'var(--primary-color)'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 4000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize with first chat
if (chatHistory.length === 0) {
    newChat();
}
