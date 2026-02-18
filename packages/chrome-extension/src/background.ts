console.log('Phantom Oracle Background Service Worker Active');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'PHANTOM_CONTEXT_UPDATE') {
        console.log('Received context update:', message.payload);

        // Store in local storage
        chrome.storage.local.set({
            lastContext: message.payload,
            timestamp: Date.now()
        });

        // TODO: Send to Phantom Server (localhost:3000)
        // fetch('http://localhost:3000/analyze-context', ...)
    }
});
