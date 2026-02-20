// PHANTOM AI - Google Gemini Provider
import { BaseAIProvider, type AIRequest, type AIResponse, type StreamingAIResponse, type AIMessage, type AIModelInfo, type ProviderHealth } from './base.js';

export interface GeminiProviderConfig {
    apiKey?: string;
    defaultModel?: string;
    timeout?: number;
}

export class GeminiProvider extends BaseAIProvider {
    name = 'gemini';
    private apiKey: string;
    private models: Map<string, AIModelInfo> = new Map();

    constructor(config: GeminiProviderConfig) {
        super({
            name: 'gemini',
            apiKey: config.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
            defaultModel: config.defaultModel || 'gemini-3.1-pro',
            timeout: config.timeout || 60000,
        });

        this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
        this.initializeModels();
    }

    private initializeModels() {
        this.models.set('gemini-3.1-pro', {
            name: 'gemini-3.1-pro',
            maxTokens: 8192,
            contextWindow: 1048576,
            supportsVision: true,
            costPerInputToken: 0.000000075,
            costPerOutputToken: 0.0000003,
        });

        this.models.set('gemini-3.1-pro', {
            name: 'gemini-3.1-pro',
            maxTokens: 65536,
            contextWindow: 1048576,
            supportsVision: true,
            costPerInputToken: 0.00000125,
            costPerOutputToken: 0.000005,
        });

        this.models.set('gemini-3.1-pro', {
            name: 'gemini-3.1-pro',
            maxTokens: 8192,
            contextWindow: 2097152,
            supportsVision: true,
            costPerInputToken: 0.00000125,
            costPerOutputToken: 0.000005,
        });

        this.models.set('gemini-1.5-flash', {
            name: 'gemini-1.5-flash',
            maxTokens: 8192,
            contextWindow: 1048576,
            supportsVision: true,
            costPerInputToken: 0.000000075,
            costPerOutputToken: 0.0000003,
        });
    }

    async isAvailable(): Promise<boolean> {
        if (!this.apiKey) return false;
        try {
            const url = `${this.config.baseUrl}/models?key=${this.apiKey}`;
            const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
            return response.ok;
        } catch {
            return false;
        }
    }

    async complete(request: AIRequest): Promise<AIResponse> {
        const startTime = Date.now();

        return this.rateLimit(async () => {
            const model = request.model || this.config.defaultModel;
            const url = `${this.config.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

            const body = {
                contents: this.convertMessages(request.messages),
                generationConfig: {
                    temperature: request.temperature ?? 0.7,
                    maxOutputTokens: request.maxTokens || 4096,
                },
            };

            const response = await this.timeoutPromise(
                fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                }),
                this.config.timeout || 60000,
            );

            const latency = Date.now() - startTime;

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
            }

            const data = await response.json() as any;
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const usage = data.usageMetadata;

            return {
                content,
                usage: usage ? {
                    promptTokens: usage.promptTokenCount || 0,
                    completionTokens: usage.candidatesTokenCount || 0,
                    totalTokens: usage.totalTokenCount || 0,
                } : undefined,
                latency,
                model,
            };
        });
    }

    async stream(request: AIRequest): Promise<StreamingAIResponse> {
        const startTime = Date.now();

        return this.rateLimit(async () => {
            const model = request.model || this.config.defaultModel;
            const url = `${this.config.baseUrl}/models/${model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

            const body = {
                contents: this.convertMessages(request.messages),
                generationConfig: {
                    temperature: request.temperature ?? 0.7,
                    maxOutputTokens: request.maxTokens || 4096,
                },
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok || !response.body) {
                throw new Error(`Gemini stream failed: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            const asyncIterator = (async function* () {
                let buffer = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const jsonStr = line.slice(6).trim();
                        if (!jsonStr || jsonStr === '[DONE]') continue;

                        try {
                            const data = JSON.parse(jsonStr);
                            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (text) {
                                fullContent += text;
                                yield text;
                            }
                        } catch {
                            // skip parse errors
                        }
                    }
                }
            })();

            const responsePromise = (async () => {
                // Consume the stream to completion
                const chunks: string[] = [];
                for await (const chunk of asyncIterator) {
                    chunks.push(chunk);
                }
                const latency = Date.now() - startTime;
                return {
                    content: chunks.join(''),
                    usage: undefined,
                    latency,
                    model,
                };
            })();

            return this.createStreamingResponse(asyncIterator, responsePromise);
        });
    }

    estimateCost(request: AIRequest, response: AIResponse): number {
        const model = this.models.get(request.model);
        if (!model || !response.usage) return 0;
        const inputCost = (response.usage.promptTokens || 0) * (model.costPerInputToken || 0);
        const outputCost = (response.usage.completionTokens || 0) * (model.costPerOutputToken || 0);
        return inputCost + outputCost;
    }

    async close(): Promise<void> {
        // No cleanup needed
    }

    async getHealth(): Promise<ProviderHealth> {
        const startTime = Date.now();
        try {
            const available = await this.isAvailable();
            return { available, latency: Date.now() - startTime };
        } catch (error) {
            return {
                available: false,
                latency: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    private convertMessages(messages: AIMessage[]): Array<{ role: string; parts: Array<{ text: string }> }> {
        const systemMessage = messages.find(m => m.role === 'system');
        const conversationMessages = messages.filter(m => m.role !== 'system');

        // Gemini uses 'user'/'model' roles. System instruction goes as first user message if present.
        const result: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        if (systemMessage) {
            result.push({ role: 'user', parts: [{ text: `[System Instructions]\n${systemMessage.content}` }] });
            result.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
        }

        for (const msg of conversationMessages) {
            result.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            });
        }

        return result;
    }

    getSupportedModels(): AIModelInfo[] {
        return Array.from(this.models.values());
    }
}
