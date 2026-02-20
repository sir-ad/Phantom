import { BaseAIProvider, AIProviderConfig, AIRequest, AIResponse, StreamingAIResponse } from './base.js';

export interface UniversalProviderConfig extends AIProviderConfig {
    apiKey: string;
    baseUrl: string;
    providerName: string; // e.g., 'groq', 'opencode', 'openrouter'
}

export class UniversalProvider extends BaseAIProvider {
    public name: string;
    public providerName: string;
    protected apiKey: string;
    protected baseUrl: string;

    constructor(config: UniversalProviderConfig) {
        super(config);
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl;
        this.providerName = config.providerName;
        this.name = config.name || config.providerName;
    }

    async isAvailable(): Promise<boolean> {
        return !!this.apiKey;
    }

    async complete(request: AIRequest): Promise<AIResponse> {
        const startTime = Date.now();

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: request.model || this.getDefaultModel(),
                    messages: request.messages,
                    temperature: request.temperature ?? 0.7,
                    max_tokens: request.maxTokens,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`${this.providerName} API error (${response.status}): ${errorText}`);
            }

            const data: any = await response.json();
            const content = data.choices?.[0]?.message?.content || '';

            return {
                content,
                model: request.model || this.getDefaultModel(),
                latency: Date.now() - startTime,
                usage: {
                    promptTokens: data.usage?.prompt_tokens,
                    completionTokens: data.usage?.completion_tokens,
                    totalTokens: data.usage?.total_tokens
                }
            };
        } catch (error) {
            console.error(`[${this.providerName}] API Error:`, error);
            throw error;
        }
    }

    async stream(request: AIRequest): Promise<StreamingAIResponse> {
        const startTime = Date.now();

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: request.model || this.getDefaultModel(),
                messages: request.messages,
                temperature: request.temperature ?? 0.7,
                max_tokens: request.maxTokens,
                stream: true
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${this.providerName} Streaming error (${response.status}): ${errorText}`);
        }

        if (!response.body) {
            throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullContent = "";

        const stream = (async function* () {
            let buffer = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.trim() === 'data: [DONE]') return;
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const chunk = data.choices[0]?.delta?.content || "";
                            fullContent += chunk;
                            yield chunk;
                        } catch (e) {
                            // Ignore parse errors on incomplete chunks
                        }
                    }
                }
            }
        })();

        const promise = (async () => {
            // Consume the stream entirely to resolve the promise if someone awaits it
            for await (const _ of stream) { }
            return {
                content: fullContent,
                model: request.model || this.getDefaultModel(),
                latency: Date.now() - startTime,
            };
        })();

        return { stream, promise };
    }

    estimateCost(): number {
        return 0; // Universal API costs vary wildly
    }

    async close(): Promise<void> {
        // No specific resources to close for raw fetch implementation
    }

    async getHealth() {
        return {
            available: true,
            latency: 0
        };
    }
}
