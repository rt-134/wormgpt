// Advanced Features and Utilities for WormGPT Pro

// ==================== Advanced Code Execution ====================

class CodeExecutor {
    constructor() {
        this.supportedLanguages = {
            javascript: this.executeJavaScript,
            python: this.executePython,
            html: this.executeHTML
        };
    }

    async execute(code, language) {
        if (this.supportedLanguages[language]) {
            return await this.supportedLanguages[language](code);
        }
        return { success: false, message: 'اللغة غير مدعومة للتنفيذ المباشر' };
    }

    executeJavaScript(code) {
        try {
            // Create isolated context
            const result = eval(code);
            return { success: true, output: String(result) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    executePython(code) {
        // This would require a backend service like Skulpt or Brython
        return { 
            success: false, 
            message: 'تنفيذ Python يتطلب خدمة خلفية. سيتم إضافتها قريباً.' 
        };
    }

    executeHTML(code) {
        try {
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '400px';
            iframe.style.border = '1px solid var(--border-color)';
            iframe.style.borderRadius = '8px';
            
            const output = document.getElementById('outputContent');
            output.innerHTML = '';
            output.appendChild(iframe);
            
            iframe.contentDocument.open();
            iframe.contentDocument.write(code);
            iframe.contentDocument.close();
            
            return { success: true, output: 'تم عرض HTML بنجاح' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// ==================== Smart Suggestions ====================

class SmartSuggestions {
    constructor() {
        this.suggestions = {
            programming: [
                'اشرح لي مفهوم',
                'اكتب كود لـ',
                'كيف أقوم بـ',
                'ما الفرق بين',
                'أصلح هذا الخطأ'
            ],
            general: [
                'اكتب لي مقال عن',
                'لخص لي',
                'ترجم إلى',
                'أنشئ قائمة بـ',
                'اقترح أفكار لـ'
            ],
            creative: [
                'اكتب قصة عن',
                'صمم لي',
                'أنشئ سيناريو لـ',
                'ابتكر فكرة لـ',
                'اقترح عناوين لـ'
            ]
        };
    }

    getSuggestions(category = 'general') {
        return this.suggestions[category] || this.suggestions.general;
    }

    showSuggestions() {
        const container = document.createElement('div');
        container.className = 'suggestions-container';
        container.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;
            background: var(--surface);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 10px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        `;

        const allSuggestions = [
            ...this.suggestions.programming,
            ...this.suggestions.general,
            ...this.suggestions.creative
        ];

        // Pick random 5 suggestions
        const randomSuggestions = allSuggestions
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        randomSuggestions.forEach(suggestion => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.textContent = suggestion;
            chip.style.cssText = `
                background: var(--surface-light);
                border: 1px solid var(--border-color);
                color: var(--text-primary);
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 0.9rem;
            `;
            chip.onclick = () => {
                document.getElementById('userInput').value = suggestion + ' ';
                document.getElementById('userInput').focus();
                container.remove();
            };
            container.appendChild(chip);
        });

        return container;
    }
}

// ==================== Performance Monitor ====================

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            messageCount: 0,
            totalResponseTime: 0,
            averageResponseTime: 0
        };
    }

    startTimer() {
        this.startTime = performance.now();
    }

    endTimer() {
        const endTime = performance.now();
        const duration = endTime - this.startTime;
        
        this.metrics.messageCount++;
        this.metrics.totalResponseTime += duration;
        this.metrics.averageResponseTime = 
            this.metrics.totalResponseTime / this.metrics.messageCount;
        
        return duration;
    }

    getStats() {
        return {
            messages: this.metrics.messageCount,
            avgTime: (this.metrics.averageResponseTime / 1000).toFixed(2) + 's',
            totalTime: (this.metrics.totalResponseTime / 1000).toFixed(2) + 's'
        };
    }

    displayStats() {
        const stats = this.getStats();
        console.log('📊 إحصائيات الأداء:', stats);
        return stats;
    }
}

// ==================== Enhanced Search ====================

class EnhancedSearch {
    constructor() {
        this.searchHistory = [];
    }

    async searchInConversation(query) {
        const messages = document.querySelectorAll('.message');
        const results = [];

        messages.forEach((message, index) => {
            const content = message.querySelector('.message-content').textContent;
            if (content.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    index: index,
                    content: content,
                    element: message
                });
            }
        });

        return results;
    }

    highlightResults(results) {
        results.forEach(result => {
            result.element.style.backgroundColor = 'var(--warning)';
            setTimeout(() => {
                result.element.style.backgroundColor = '';
            }, 2000);
        });
    }

    createSearchUI() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input 
                type="text" 
                id="conversationSearch" 
                placeholder="ابحث في المحادثة..."
                style="
                    width: 100%;
                    padding: 10px;
                    background: var(--surface-light);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    color: var(--text-primary);
                "
            >
            <div id="searchResults"></div>
        `;

        const input = searchContainer.querySelector('input');
        input.addEventListener('input', async (e) => {
            const query = e.target.value;
            if (query.length > 2) {
                const results = await this.searchInConversation(query);
                this.displaySearchResults(results, searchContainer);
            }
        });

        return searchContainer;
    }

    displaySearchResults(results, container) {
        const resultsDiv = container.querySelector('#searchResults');
        resultsDiv.innerHTML = '';

        if (results.length === 0) {
            resultsDiv.innerHTML = '<p>لا توجد نتائج</p>';
            return;
        }

        resultsDiv.innerHTML = `<p>وُجد ${results.length} نتيجة</p>`;
        this.highlightResults(results);
    }
}

// ==================== Auto-Complete ====================

class AutoComplete {
    constructor() {
        this.commonPhrases = [
            'كيف يمكنني',
            'ما هو',
            'اشرح لي',
            'أعطني مثال عن',
            'ما الفرق بين',
            'كيف أستطيع أن',
            'هل يمكنك',
            'أريد أن',
            'ساعدني في',
            'اكتب لي'
        ];
    }

    getSuggestions(input) {
        return this.commonPhrases.filter(phrase => 
            phrase.startsWith(input) && input.length > 2
        );
    }

    attachToInput(inputElement) {
        let suggestionsBox = document.getElementById('autocompleteSuggestions');
        
        if (!suggestionsBox) {
            suggestionsBox = document.createElement('div');
            suggestionsBox.id = 'autocompleteSuggestions';
            suggestionsBox.style.cssText = `
                position: absolute;
                bottom: 100%;
                left: 0;
                right: 0;
                background: var(--surface);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                margin-bottom: 5px;
                max-height: 200px;
                overflow-y: auto;
                display: none;
                z-index: 1000;
            `;
            inputElement.parentElement.style.position = 'relative';
            inputElement.parentElement.appendChild(suggestionsBox);
        }

        inputElement.addEventListener('input', (e) => {
            const value = e.target.value;
            const suggestions = this.getSuggestions(value);

            if (suggestions.length > 0) {
                suggestionsBox.innerHTML = suggestions.map(suggestion => `
                    <div class="autocomplete-item" style="
                        padding: 10px;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.background='var(--surface-light)'"
                       onmouseout="this.style.background=''"
                    >${suggestion}</div>
                `).join('');
                suggestionsBox.style.display = 'block';

                // Add click handlers
                suggestionsBox.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.onclick = () => {
                        inputElement.value = item.textContent + ' ';
                        suggestionsBox.style.display = 'none';
                        inputElement.focus();
                    };
                });
            } else {
                suggestionsBox.style.display = 'none';
            }
        });

        // Hide on outside click
        document.addEventListener('click', (e) => {
            if (!inputElement.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });
    }
}

// ==================== Keyboard Shortcuts ====================

class KeyboardShortcuts {
    constructor() {
        this.shortcuts = {
            'ctrl+k': () => newChat(),
            'ctrl+s': () => saveSettings(),
            'ctrl+/': () => openCodeEditor(),
            'ctrl+l': () => clearChat(),
            'ctrl+e': () => exportChat(),
            'esc': () => this.closeAllModals()
        };
    }

    init() {
        document.addEventListener('keydown', (e) => {
            const key = this.getKeyString(e);
            
            if (this.shortcuts[key]) {
                e.preventDefault();
                this.shortcuts[key]();
            }
        });
    }

    getKeyString(event) {
        const parts = [];
        if (event.ctrlKey) parts.push('ctrl');
        if (event.shiftKey) parts.push('shift');
        if (event.altKey) parts.push('alt');
        parts.push(event.key.toLowerCase());
        return parts.join('+');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    showShortcuts() {
        const shortcuts = `
            <div style="padding: 20px;">
                <h3>اختصارات لوحة المفاتيح ⌨️</h3>
                <ul style="list-style: none; padding: 0;">
                    <li>Ctrl + K : محادثة جديدة</li>
                    <li>Ctrl + S : حفظ الإعدادات</li>
                    <li>Ctrl + / : محرر الأكواد</li>
                    <li>Ctrl + L : مسح المحادثة</li>
                    <li>Ctrl + E : تصدير المحادثة</li>
                    <li>ESC : إغلاق النوافذ</li>
                    <li>Shift + Enter : سطر جديد</li>
                    <li>Enter : إرسال الرسالة</li>
                </ul>
            </div>
        `;
        
        showNotification('راجع Console للاختصارات', 'info');
        console.log(shortcuts);
    }
}

// ==================== Theme Manager ====================

class ThemeManager {
    constructor() {
        this.themes = {
            dark: {
                '--primary-color': '#6366f1',
                '--background': '#0f0f1e',
                '--surface': '#1a1a2e',
                '--text-primary': '#e5e7eb'
            },
            light: {
                '--primary-color': '#4f46e5',
                '--background': '#ffffff',
                '--surface': '#f9fafb',
                '--text-primary': '#1f2937'
            },
            blue: {
                '--primary-color': '#3b82f6',
                '--background': '#0a192f',
                '--surface': '#172a45',
                '--text-primary': '#ccd6f6'
            }
        };
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        Object.keys(theme).forEach(property => {
            document.documentElement.style.setProperty(property, theme[property]);
        });

        localStorage.setItem('wormgpt_theme', themeName);
    }

    getCurrentTheme() {
        return localStorage.getItem('wormgpt_theme') || 'dark';
    }
}

// ==================== Export Manager ====================

class ExportManager {
    exportAsJSON() {
        const messages = [];
        document.querySelectorAll('.message').forEach(msg => {
            messages.push({
                role: msg.classList.contains('user') ? 'user' : 'assistant',
                content: msg.querySelector('.message-content').textContent
            });
        });

        const json = JSON.stringify(messages, null, 2);
        this.download(json, 'chat.json', 'application/json');
    }

    exportAsMarkdown() {
        let markdown = '# WormGPT Pro Conversation\n\n';
        document.querySelectorAll('.message').forEach(msg => {
            const role = msg.classList.contains('user') ? 'المستخدم' : 'WormGPT';
            const content = msg.querySelector('.message-content').textContent;
            markdown += `## ${role}\n\n${content}\n\n---\n\n`;
        });

        this.download(markdown, 'chat.md', 'text/markdown');
    }

    exportAsHTML() {
        const html = `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>WormGPT Conversation</title>
                <style>
                    body { font-family: Arial; padding: 20px; background: #f5f5f5; }
                    .message { margin: 20px 0; padding: 15px; border-radius: 8px; }
                    .user { background: #e3f2fd; }
                    .assistant { background: #f3e5f5; }
                </style>
            </head>
            <body>
                ${document.getElementById('messages').innerHTML}
            </body>
            </html>
        `;

        this.download(html, 'chat.html', 'text/html');
    }

    download(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// ==================== Initialize Advanced Features ====================

const codeExecutor = new CodeExecutor();
const smartSuggestions = new SmartSuggestions();
const performanceMonitor = new PerformanceMonitor();
const enhancedSearch = new EnhancedSearch();
const autoComplete = new AutoComplete();
const keyboardShortcuts = new KeyboardShortcuts();
const themeManager = new ThemeManager();
const exportManager = new ExportManager();

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        keyboardShortcuts.init();
        
        // Attach autocomplete to input
        const userInput = document.getElementById('userInput');
        if (userInput) {
            autoComplete.attachToInput(userInput);
        }
        
        // Apply saved theme
        const savedTheme = themeManager.getCurrentTheme();
        themeManager.applyTheme(savedTheme);
    });
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CodeExecutor,
        SmartSuggestions,
        PerformanceMonitor,
        EnhancedSearch,
        AutoComplete,
        KeyboardShortcuts,
        ThemeManager,
        ExportManager
    };
}
