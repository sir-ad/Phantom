// PHANTOM AI - Ollama Provider (Local)
import { BaseAIProvider, type AIRequest, type AIResponse, type StreamingAIResponse, type AIMessage, type AIModelInfo, type ProviderHealth } from './base.js';

export interface OllamaProviderConfig {
  baseUrl?: string;
  defaultModel?: string;
  timeout?: number;
}

export class OllamaProvider extends BaseAIProvider {
  name = 'ollama';
  private baseUrl: string;
  private models: Map<string, AIModelInfo> = new Map();

  constructor(config: OllamaProviderConfig) {
    super({
      name: 'ollama',
      baseUrl: config.baseUrl || 'http://localhost:11434',
      defaultModel: config.defaultModel || 'llama3.1:70b',
      timeout: config.timeout || 120000, // Longer timeout for local models
    });
    
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.initializeModels();
  }

  private initializeModels() {
    this.models.set('llama3.1:70b', {
      name: 'llama3.1:70b',
      maxTokens: 4096,
      contextWindow: 8192,
      supportsVision: false,
      costPerInputToken: 0,
      costPerOutputToken: 0,
    });
    
    this.models.set('llama3.1:8b', {
      name: 'llama3.1:8b',
      maxTokens: 4096,
      contextWindow: 8192,
      supportsVision: false,
      costPerInputToken: 0,
      costPerOutputToken: 0,
    });
    
    this.models.set('codellama:7b', {
      name: 'codellama:7b',
      maxTokens: 4096,
      contextWindow: 16384,
      supportsVision: false,
      costPerInputToken: 0,
      costPerOutputToken: 0,
    });
    
    this.models.set('mistral:7b', {
      name: 'mistral:7b',
      maxTokens: 4096,
      contextWindow: 32768,
      supportsVision: false,
      costPerInputToken: 0,
      costPerOutputToken: 0,
    });
    
    this.models.set('nomic-embed-text', {
      name: 'nomic-embed-text',
      maxTokens: 0,
      contextWindow: 8192,
      supportsVision: false,
      costPerInputToken: 0,
      costPerOutputToken: 0,
    });
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    return this.rateLimit(async () => {
      const response = await this.timeoutPromise(
        this.makeRequest(request),
        this.config.timeout || 120000
      );

      const latency = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.status} ${await response.text()}`);
      }

      const data = await response.json() as any;
      const content = data.response || '';
      
      return {
        content,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
        latency,
        model: data.model,
      };
    });
  }

  async stream(request: AIRequest): Promise<StreamingAIResponse> {
    const startTime = Date.now();
    const chunks: string[] = [];
    
    return this.rateLimit(async () => {
      const streamResponse = await this.makeRequest(request, true);
      
      if (!streamResponse.ok || !streamResponse.body) {
        throw new Error(`Ollama stream failed: ${streamResponse.status}`);
      }

      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder();
      
      const asyncIterator = (async function* () {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                chunks.push(data.response);
                yield data.response;
              }
            } catch (error) {
              // Ignore parse errors
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
    // Ollama is free (local)
    return 0;
  }

  async close(): Promise<void> {
    // No cleanup needed for HTTP requests
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

  private async makeRequest(request: AIRequest, stream: boolean = false): Promise<Response> {
    const url = `${this.baseUrl}/api/generate`;
    
    const body = {
      model: request.model,
      prompt: this.convertMessagesToPrompt(request.messages),
      stream,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens || 2048,
      system: this.extractSystemPrompt(request.messages),
    };

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  private convertMessagesToPrompt(messages: AIMessage[]): string {
    return messages
      .map(msg => {
        if (msg.role === 'system') {
          return `System: ${msg.content}`;
        } else if (msg.role === 'assistant') {
          return `Assistant: ${msg.content}`;
        } else {
          return `User: ${msg.content}`;
        }
      })
      .join('\n\n');
  }

  private extractSystemPrompt(messages: AIMessage[]): string | undefined {
    const systemMessage = messages.find(msg => msg.role === 'system');
    return systemMessage?.content;
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json() as any;
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      return [];
    }
  }

  async createEmbeddings(text: string, model: string = 'nomic-embed-text'): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: text,
        }),
      });
      
      const data = await response.json() as any;
      return data.embedding || [];
    } catch (error) {
      return [];
    }
  }

  getSupportedModels(): AIModelInfo[] {
    return Array.from(this.models.values());
  }
}