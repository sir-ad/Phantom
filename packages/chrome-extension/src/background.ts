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

        // Send to Phantom Server (localhost:3000)
        fetch('http://localhost:3000/analyze-context', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message.payload)
        })
            .then(response => response.json())
            .then(data => {
                if (data.quote) {
                    chrome.storage.local.set({
                        lastQuote: data.quote
                    });
                }
            })
            .catch(err => console.error('Phantom: Failed to fetch calibration', err));
    }
});
