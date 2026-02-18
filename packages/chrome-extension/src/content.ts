console.log('Phantom Oracle Content Script Active');

const DEBOUNCE_MS = 2000;
let timeoutId: number | null = null;

function scrapeChat() {
    const url = window.location.hostname;
    let text = '';
    let role = '';

    if (url.includes('chatgpt.com')) {
        const messages = document.querySelectorAll('[data-message-author-role]');
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            text = (lastMsg as HTMLElement).innerText;
            role = lastMsg.getAttribute('data-message-author-role') || 'unknown';
        }
    } else if (url.includes('claude.ai')) {
        // Claude uses .font-user-message / .font-claude-message usually, but classes change.
        // Look for specific layout.
        const msgs = document.querySelectorAll('.font-user-message, .font-claude-message');
        if (msgs.length > 0) {
            const last = msgs[msgs.length - 1];
            text = (last as HTMLElement).innerText;
            role = last.classList.contains('font-user-message') ? 'user' : 'assistant';
        }
    } else if (url.includes('gemini.google.com')) {
        // Gemini logic (complex, often deep shadow DOM or specific classes)
        // Placeholder for now
        const msgs = document.querySelectorAll('message-content');
        if (msgs.length > 0) {
            text = (msgs[msgs.length - 1] as HTMLElement).innerText;
            role = 'unknown'; // Hard to detect without more inspection
        }
    }

    if (text && text.length > 50) {
        console.log('Phantom: Extracted context', { role, text: text.substring(0, 50) + '...' });
        chrome.runtime.sendMessage({
            type: 'PHANTOM_CONTEXT_UPDATE',
            payload: {
                source: url,
                role,
                text,
                timestamp: Date.now()
            }
        });
    }
}

// Observe DOM changes
const observer = new MutationObserver(() => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(scrapeChat, DEBOUNCE_MS);
});

observer.observe(document.body, { childList: true, subtree: true });

