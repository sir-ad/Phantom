// PHANTOM AI - Anthropic Provider
import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider, type AIRequest, type AIResponse, type StreamingAIResponse, type AIMessage, type AIModelInfo, type ProviderHealth } from './base.js';

export interface AnthropicProviderConfig {
  apiKey: string;
  defaultModel?: string;
  timeout?: number;
}

export class AnthropicProvider extends BaseAIProvider {
  name = 'anthropic';
  private client: Anthropic | null = null;
  private models: Map<string, AIModelInfo> = new Map();

  constructor(config: AnthropicProviderConfig) {
    super({
      name: 'anthropic',
      apiKey: config.apiKey,
      defaultModel: config.defaultModel || 'claude-3-7-sonnet-20250219',
      timeout: config.timeout,
    });

    this.initializeModels();
  }

  private initializeModels() {
    this.models.set('claude-3-7-sonnet-20250219', {
      name: 'claude-3-7-sonnet-20250219',
      maxTokens: 4096,
      contextWindow: 200000,
      supportsVision: true,
      costPerInputToken: 0.000003,
      costPerOutputToken: 0.000015,
    });

    this.models.set('claude-4.6-opus', {
      name: 'claude-4.6-opus',
      maxTokens: 4096,
      contextWindow: 200000,
      supportsVision: true,
      costPerInputToken: 0.000015,
      costPerOutputToken: 0.000075,
    });

    this.models.set('claude-3-haiku-20240307', {
      name: 'claude-3-haiku-20240307',
      maxTokens: 4096,
      contextWindow: 200000,
      supportsVision: true,
      costPerInputToken: 0.00000025,
      costPerOutputToken: 0.00000125,
    });

    this.models.set('claude-2.1', {
      name: 'claude-2.1',
      maxTokens: 4096,
      contextWindow: 200000,
      supportsVision: false,
      costPerInputToken: 0.000008,
      costPerOutputToken: 0.000024,
    });
  }

  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({
        apiKey: this.config.apiKey!,
      });
    }
    return this.client;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.config.apiKey) return false;

    try {
      const client = this.getClient();
      await client.messages.create({
        model: this.config.defaultModel,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    return this.rateLimit(async () => {
      const client = this.getClient();

      const response = await this.timeoutPromise(
        client.messages.create({
          model: request.model,
          messages: this.convertMessages(request.messages),
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens || 2048,
          system: this.extractSystemPrompt(request.messages),
          tools: request.tools as any,
        }),
        this.config.timeout || 30000
      );

      const latency = Date.now() - startTime;
      const content = (response.content[0] as any)?.text || '';

      return {
        content,
        usage: {
          promptTokens: response.usage?.input_tokens || 0,
          completionTokens: response.usage?.output_tokens || 0,
          totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
        },
        latency,
        model: response.model,
      };
    });
  }

  async stream(request: AIRequest): Promise<StreamingAIResponse> {
    const startTime = Date.now();
    const chunks: string[] = [];

    return this.rateLimit(async () => {
      const client = this.getClient();

      const stream = await this.timeoutPromise(
        client.messages.create({
          model: request.model,
          messages: this.convertMessages(request.messages),
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens || 2048,
          system: this.extractSystemPrompt(request.messages),
          stream: true,
          tools: request.tools as any,
        }),
        this.config.timeout || 30000
      );

      const asyncIterator = (async function* () {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta') {
            const content = (chunk.delta as any)?.text || '';
            if (content) {
              chunks.push(content);
              yield content;
            }
          }
        }
      })();

      const responsePromise = (async () => {
        let fullContent = '';
        for await (const chunk of asyncIterator) {
          fullContent += chunk;
        }

        const latency = Date.now() - startTime;
        return {
          content: fullContent,
          usage: undefined,
          latency,
          model: request.model,
        };
      })();

      return this.createStreamingResponse(asyncIterator, responsePromise);
    });
  }

  estimateCost(request: AIRequest, response: AIResponse): number {
    const modelInfo = this.models.get(request.model) || this.models.get('claude-3-7-sonnet-20250219')!;
    const inputCost = (response.usage?.promptTokens || 0) * (modelInfo.costPerInputToken || 0);
    const outputCost = (response.usage?.completionTokens || 0) * (modelInfo.costPerOutputToken || 0);
    return inputCost + outputCost;
  }

  async close(): Promise<void> {
    this.client = null;
  }

  async getHealth(): Promise<ProviderHealth> {
    const startTime = Date.now();
    try {
      const available = await this.isAvailable();
      const latency = Date.now() - startTime;
      return {
        available,
        latency,
      };
    } catch (error) {
      return {
        available: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private convertMessages(messages: AIMessage[]): Anthropic.MessageParam[] {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));
  }

  private extractSystemPrompt(messages: AIMessage[]): string | undefined {
    const systemMessage = messages.find(msg => msg.role === 'system');
    return systemMessage?.content;
  }

  getSupportedModels(): AIModelInfo[] {
    return Array.from(this.models.values());
  }
}