// PHANTOM AI - Mock Provider (Fallback)
import { BaseAIProvider, type AIRequest, type AIResponse, type StreamingAIResponse, type ProviderHealth } from './base.js';

export class MockProvider extends BaseAIProvider {
    name = 'mock';

    constructor() {
        super({
            name: 'mock',
            defaultModel: 'mock-model',
            timeout: 5000,
        });
    }

    async isAvailable(): Promise<boolean> {
        return true; // Always available
    }

    async complete(request: AIRequest): Promise<AIResponse> {
        const startTime = Date.now();
        const prompt = (request.messages[request.messages.length - 1]?.content || '').toLowerCase();

        let content = "I am a mock response. Please configure a real AI provider in Settings.";

        if (prompt.includes('prd') || prompt.includes('product requirement')) {
            content = `# Product Requirements Document
## Overview
This is a generated mock PRD because no AI provider was configured or available.
## Goals
1. Provide a fallback so the UI does not break.
2. Show structured markdown.
## Requirements
- Set up an API key or install Ollama.
`;
        } else if (prompt.includes('interview') || prompt.includes('feedback')) {
            content = `# Interview Analysis
## Key Takeaways
- User needs an AI provider configured.
- The UI handled the fallback gracefully.
`;
        } else if (prompt.includes('user story') || prompt.includes('story')) {
            content = `**As a** PM\n**I want** to configure an AI provider\n**So that** I can generate real product documents.`;
        } else if (prompt.includes('help') || prompt.includes('commands')) {
            content = `### Available Commands
- **Draft PRD**: Generate a PRD
- **Write user stories**: Extract stories from PRD
- **Analyze interviews**: Extract insights
*Note: Currently running in MOCK mode. Configure an AI provider in Settings to unlock full functionality.*`;
        }

        return {
            content,
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            latency: Date.now() - startTime,
            model: this.config.defaultModel,
        };
    }

    async stream(request: AIRequest): Promise<StreamingAIResponse> {
        const startTime = Date.now();
        const response = await this.complete(request);

        const stream = (async function* () {
            const words = response.content.split(' ');
            for (const word of words) {
                yield word + ' ';
                await new Promise(r => setTimeout(r, 10)); // tiny delay for visual effect
            }
        })();

        return this.createStreamingResponse(stream, Promise.resolve(response));
    }

    estimateCost(): number {
        return 0;
    }

    async close(): Promise<void> { }

    async getHealth(): Promise<ProviderHealth> {
        return { available: true, latency: 1 };
    }
}
