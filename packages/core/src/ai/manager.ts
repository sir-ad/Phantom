// PHANTOM AI - Manager
import { OpenAIProvider, type OpenAIProviderConfig } from './providers/openai.js';
import { AnthropicProvider, type AnthropicProviderConfig } from './providers/anthropic.js';
import { OllamaProvider, type OllamaProviderConfig } from './providers/ollama.js';
import { GeminiProvider, type GeminiProviderConfig } from './providers/gemini.js';
import { BaseAIProvider, type AIRequest, type AIResponse, type StreamingAIResponse, type AIProviderConfig, type ProviderHealth } from './providers/base.js';
import { getConfig } from '../config.js';

export type ProviderType = 'openai' | 'anthropic' | 'ollama' | 'gemini';

// Re-export AIMessage from base
export type { AIMessage } from './providers/base.js';

export interface AIManagerConfig {
  defaultProvider: ProviderType;
  providers: {
    openai?: OpenAIProviderConfig;
    anthropic?: AnthropicProviderConfig;
    ollama?: OllamaProviderConfig;
    gemini?: GeminiProviderConfig;
  };
  fallbackProviders?: ProviderType[];
  enableCaching?: boolean;
  maxRetries?: number;
}

export interface ProviderMetrics {
  provider: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  averageLatency: number;
  lastUsed: Date;
}

export class AIManager {
  private providers: Map<ProviderType, BaseAIProvider> = new Map();
  private config: AIManagerConfig;
  private metrics: Map<string, ProviderMetrics> = new Map();
  private cache: Map<string, { response: AIResponse; timestamp: number }> = new Map();
  private defaultProvider: BaseAIProvider | null = null;
  private fallbackChain: BaseAIProvider[] = [];

  constructor(config: AIManagerConfig) {
    this.config = {
      enableCaching: true,
      maxRetries: 3,
      ...config,
    };

    this.initializeProviders();
    this.buildFallbackChain();
  }

  private initializeProviders(): void {
    if (this.config.providers.openai?.apiKey) {
      const provider = new OpenAIProvider(this.config.providers.openai);
      this.providers.set('openai', provider);
      this.defaultProvider = provider;
    }

    if (this.config.providers.anthropic?.apiKey) {
      const provider = new AnthropicProvider(this.config.providers.anthropic);
      this.providers.set('anthropic', provider);
      if (!this.defaultProvider) {
        this.defaultProvider = provider;
      }
    }

    if (this.config.providers.ollama) {
      const provider = new OllamaProvider(this.config.providers.ollama);
      this.providers.set('ollama', provider);
      if (!this.defaultProvider) {
        this.defaultProvider = provider;
      }
    }

    if (this.config.providers.gemini?.apiKey) {
      const provider = new GeminiProvider(this.config.providers.gemini);
      this.providers.set('gemini', provider);
      if (!this.defaultProvider) {
        this.defaultProvider = provider;
      }
    }
  }

  private buildFallbackChain(): void {
    // Add default provider first
    if (this.defaultProvider) {
      this.fallbackChain.push(this.defaultProvider);
    }

    // Add specified fallbacks
    for (const providerName of (this.config.fallbackProviders || [])) {
      const provider = this.providers.get(providerName);
      if (provider && !this.fallbackChain.includes(provider)) {
        this.fallbackChain.push(provider);
      }
    }

    // Add any remaining providers
    for (const [name, provider] of this.providers) {
      if (!this.fallbackChain.includes(provider)) {
        this.fallbackChain.push(provider);
      }
    }
  }

  private getCacheKey(request: AIRequest): string {
    return JSON.stringify({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    });
  }

  private updateMetrics(provider: BaseAIProvider, response: AIResponse, success: boolean): void {
    const key = provider.name;
    const current = this.metrics.get(key) || {
      provider: key,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalCost: 0,
      averageLatency: 0,
      lastUsed: new Date(),
    };

    current.totalRequests++;
    current.lastUsed = new Date();

    if (success) {
      current.successfulRequests++;
      current.totalCost += provider.estimateCost(
        { model: response.model, messages: [] },
        response
      );

      // Update average latency (moving average)
      const totalLatency = (current.averageLatency * (current.successfulRequests - 1)) + response.latency;
      current.averageLatency = totalLatency / current.successfulRequests;
    } else {
      current.failedRequests++;
    }

    this.metrics.set(key, current);
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    // Check cache
    if (this.config.enableCaching) {
      const cacheKey = this.getCacheKey(request);
      const cached = this.cache.get(cacheKey);

      if (cached && (Date.now() - cached.timestamp) < 5 * 60 * 1000) { // 5 minute cache
        return cached.response;
      }
    }

    // Try providers in fallback chain
    let lastError: Error | null = null;

    for (let i = 0; i < this.fallbackChain.length; i++) {
      const provider = this.fallbackChain[i];

      // For fallback providers, we should probably prefer their default model
      const modelToUse = i > 0 ? provider.getDefaultModel() : request.model;
      const effectiveRequest = { ...request, model: modelToUse };

      try {
        const response = await provider.complete(effectiveRequest);
        this.updateMetrics(provider, response, true);

        // Cache the response
        if (this.config.enableCaching) {
          const cacheKey = this.getCacheKey(request);
          this.cache.set(cacheKey, {
            response,
            timestamp: Date.now(),
          });
        }

        return response;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);

        // If the specific model failed on the primary provider, try its default before moving on
        if (i === 0 && (errorMsg.includes('not found') || errorMsg.includes('404'))) {
          try {
            const fallbackRequest = { ...request, model: provider.getDefaultModel() };
            if (fallbackRequest.model !== request.model) {
              const response = await provider.complete(fallbackRequest);
              this.updateMetrics(provider, response, true);
              return response;
            }
          } catch (innerError) {
            // silent fail
          }
        }

        lastError = error instanceof Error ? error : new Error('Unknown provider error');
        this.updateMetrics(provider, { content: '', latency: 0, model: effectiveRequest.model }, false);

        // Continue to next provider
        continue;
      }
    }

    throw lastError || new Error('No AI providers available');
  }

  async stream(request: AIRequest): Promise<StreamingAIResponse> {
    // No caching for streaming

    // Try providers in fallback chain
    let lastError: Error | null = null;

    for (let i = 0; i < this.fallbackChain.length; i++) {
      const provider = this.fallbackChain[i];

      try {
        const streamingResponse = await provider.stream(request);

        // Wrap the stream to track metrics
        const originalStream = streamingResponse.stream;
        const originalPromise = streamingResponse.promise;

        const wrappedStream = (async function* () {
          yield* originalStream;
        })();

        const wrappedPromise = originalPromise.then(response => {
          this.updateMetrics(provider, response, true);
          return response;
        }).catch(error => {
          this.updateMetrics(provider, { content: '', latency: 0, model: request.model }, false);
          throw error;
        });

        return {
          stream: wrappedStream,
          promise: wrappedPromise,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown provider error');
        this.updateMetrics(provider, { content: '', latency: 0, model: request.model }, false);

        // Continue to next provider
        continue;
      }
    }

    throw lastError || new Error('No AI providers available');
  }

  async completeWithRetry(request: AIRequest, maxRetries?: number): Promise<AIResponse> {
    const retries = maxRetries || this.config.maxRetries || 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await this.complete(request);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Exponential backoff
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError || new Error('All retries failed');
  }

  getProvider(name: ProviderType): BaseAIProvider | undefined {
    return this.providers.get(name);
  }

  getDefaultProvider(): BaseAIProvider | null {
    return this.defaultProvider;
  }

  getPreferredProvider(): BaseAIProvider | null {
    // For embeddings, prefer OpenAI (best embedding support)
    return this.getProvider('openai') || this.defaultProvider;
  }

  async getHealth(): Promise<Record<string, ProviderHealth>> {
    const health: Record<string, ProviderHealth> = {};

    for (const [name, provider] of this.providers) {
      try {
        health[name] = await (provider as any).getHealth?.() || {
          available: false,
          latency: 0,
          error: 'Health check not available',
        };
      } catch (error) {
        health[name] = {
          available: false,
          latency: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return health;
  }

  getMetrics(): ProviderMetrics[] {
    return Array.from(this.metrics.values());
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  async close(): Promise<void> {
    for (const provider of this.providers.values()) {
      await provider.close();
    }
    this.providers.clear();
    this.fallbackChain = [];
    this.defaultProvider = null;
  }
}

// Singleton instance
let aiManager: AIManager | null = null;

export function getAIManager(): AIManager {
  if (!aiManager) {
    try {
      const configManager = getConfig();
      const phantomConfig = configManager.get();

      const config: AIManagerConfig = {
        defaultProvider: phantomConfig.primaryModel.provider as ProviderType,
        providers: {
          openai: {
            apiKey: phantomConfig.apiKeys.openai || process.env.OPENAI_API_KEY || '',
            defaultModel: phantomConfig.primaryModel.provider === 'openai' ? phantomConfig.primaryModel.model : 'gpt-4-turbo-preview'
          },
          anthropic: {
            apiKey: phantomConfig.apiKeys.anthropic || process.env.ANTHROPIC_API_KEY || '',
            defaultModel: phantomConfig.primaryModel.provider === 'anthropic' ? phantomConfig.primaryModel.model : 'claude-3-5-sonnet-20241022'
          },
          ollama: {
            baseUrl: phantomConfig.primaryModel.baseUrl || 'http://localhost:11434',
            defaultModel: phantomConfig.primaryModel.provider === 'ollama' ? phantomConfig.primaryModel.model : 'llama3.1:8b'
          },
          gemini: {
            apiKey: phantomConfig.apiKeys.gemini || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
            defaultModel: phantomConfig.primaryModel.provider === 'gemini' ? phantomConfig.primaryModel.model : 'gemini-2.0-flash'
          }
        },
        fallbackProviders: ['anthropic', 'ollama', 'gemini'],
        enableCaching: true,
        maxRetries: 3,
      };

      aiManager = new AIManager(config);
    } catch (e) {
      // Fallback if config manager fails
      const config: AIManagerConfig = {
        defaultProvider: 'ollama',
        providers: {
          ollama: { baseUrl: 'http://localhost:11434', defaultModel: 'llama3.1:8b' },
        },
        enableCaching: true,
        maxRetries: 3,
      };
      aiManager = new AIManager(config);
    }
  }
  return aiManager;
}

export function createAIManagerFromConfig(overrides?: Partial<AIManagerConfig>): AIManager {
  const config: AIManagerConfig = {
    defaultProvider: overrides?.defaultProvider || 'ollama',
    providers: {
      openai: { apiKey: process.env.OPENAI_API_KEY || '' },
      anthropic: { apiKey: process.env.ANTHROPIC_API_KEY || '' },
      ollama: { baseUrl: 'http://localhost:11434' },
      gemini: { apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '' },
      ...overrides?.providers,
    },
    fallbackProviders: overrides?.fallbackProviders || ['anthropic', 'ollama', 'gemini'],
    enableCaching: overrides?.enableCaching ?? true,
    maxRetries: overrides?.maxRetries ?? 3,
  };
  return new AIManager(config);
}