// PHANTOM AI - OpenAI Provider
import OpenAI from 'openai';
import { BaseAIProvider, type AIRequest, type AIResponse, type StreamingAIResponse, type AIMessage, type AIModelInfo, type ProviderHealth } from './base.js';

export interface OpenAIProviderConfig {
  apiKey: string;
  baseURL?: string;
  organization?: string;
  defaultModel?: string;
  timeout?: number;
}

export class OpenAIProvider extends BaseAIProvider {
  name = 'openai';
  private client: OpenAI | null = null;
  private models: Map<string, AIModelInfo> = new Map();

  constructor(config: OpenAIProviderConfig) {
    super({
      name: 'openai',
      apiKey: config.apiKey,
      baseUrl: config.baseURL,
      defaultModel: config.defaultModel || 'gpt-4-turbo-preview',
      timeout: config.timeout,
    });
    
    this.initializeModels();
  }

  private initializeModels() {
    this.models.set('gpt-4-turbo-preview', {
      name: 'gpt-4-turbo-preview',
      maxTokens: 4096,
      contextWindow: 128000,
      supportsVision: false,
      costPerInputToken: 0.00001,
      costPerOutputToken: 0.00003,
    });
    
    this.models.set('gpt-4', {
      name: 'gpt-4',
      maxTokens: 8192,
      contextWindow: 8192,
      supportsVision: false,
      costPerInputToken: 0.00003,
      costPerOutputToken: 0.00006,
    });
    
    this.models.set('gpt-3.5-turbo', {
      name: 'gpt-3.5-turbo',
      maxTokens: 4096,
      contextWindow: 16385,
      supportsVision: false,
      costPerInputToken: 0.0000015,
      costPerOutputToken: 0.000002,
    });
    
    this.models.set('gpt-4o', {
      name: 'gpt-4o',
      maxTokens: 4096,
      contextWindow: 128000,
      supportsVision: true,
      costPerInputToken: 0.000005,
      costPerOutputToken: 0.000015,
    });
  }

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: this.config.apiKey!,
        baseURL: this.config.baseUrl,
      });
    }
    return this.client;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.config.apiKey) return false;
    
    try {
      const client = this.getClient();
      await client.chat.completions.create({
        model: this.config.defaultModel,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
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
        client.chat.completions.create({
          model: request.model,
          messages: this.convertMessages(request.messages),
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens,
        }),
        this.config.timeout || 30000
      );

      const latency = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';
      
      return {
        content,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
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
        client.chat.completions.create({
          model: request.model,
          messages: this.convertMessages(request.messages),
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens,
          stream: true,
        }),
        this.config.timeout || 30000
      );

      const asyncIterator = (async function* () {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            chunks.push(content);
            yield content;
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
          latency,
          model: request.model,
        };
      })();

      return this.createStreamingResponse(asyncIterator, responsePromise);
    });
  }

  estimateCost(request: AIRequest, response: AIResponse): number {
    const modelInfo = this.models.get(request.model) || this.models.get('gpt-4-turbo-preview')!;
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

  private convertMessages(messages: AIMessage[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  getSupportedModels(): AIModelInfo[] {
    return Array.from(this.models.values());
  }
}