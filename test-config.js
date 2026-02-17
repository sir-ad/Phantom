#!/usr/bin/env node

// Test config directly
const { getConfig } = require('./packages/core/dist/config.js');

const cfg = getConfig();
console.log('Config loaded:', {
  version: cfg.get().version,
  apiKeys: cfg.get().apiKeys,
  theme: cfg.get().theme,
});

// Set an API key
cfg.setAPIKey('openai', 'test-key-123');
console.log('Set OpenAI key');

// Get it back
console.log('OpenAI key:', cfg.getAPIKey('openai'));

// Show all keys
console.log('All API keys:', cfg.getAllAPIKeys());