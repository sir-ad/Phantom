// PHANTOM AI - Base Provider Interface
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AITool {
  name: string;
  description: string;
  input_schema: any;
  type?: 'computer_20241022' | 'bash_20241022' | 'text_editor_20241022';
}

export interface AIRequest {
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  tools?: AITool[];
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latency: number;
  model: string;
}

export interface StreamingAIResponse {
  stream: AsyncIterable<string>;
  promise: Promise<AIResponse>;
}

export interface AIProviderConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel: string;
  maxConcurrentRequests?: number;
  timeout?: number;
}

export interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  complete(request: AIRequest): Promise<AIResponse>;
  stream(request: AIRequest): Promise<StreamingAIResponse>;
  estimateCost(request: AIRequest, response: AIResponse): number;
  close(): Promise<void>;
}

export interface AIModelInfo {
  name: string;
  maxTokens: number;
  contextWindow: number;
  supportsVision: boolean;
  costPerInputToken?: number;
  costPerOutputToken?: number;
}

export interface ProviderHealth {
  available: boolean;
  latency: number;
  error?: string;
}

export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig;
  protected rateLimiter: Set<Promise<unknown>> = new Set();

  constructor(config: AIProviderConfig) {
    this.config = {
      maxConcurrentRequests: 5,
      timeout: 30000,
      ...config,
    };
  }

  abstract name: string;

  abstract isAvailable(): Promise<boolean>;
  abstract complete(request: AIRequest): Promise<AIResponse>;
  abstract stream(request: AIRequest): Promise<StreamingAIResponse>;
  abstract estimateCost(request: AIRequest, response: AIResponse): number;
  abstract close(): Promise<void>;

  getDefaultModel(): string {
    return this.config.defaultModel;
  }

  protected async rateLimit<T>(fn: () => Promise<T>): Promise<T> {
    while (this.rateLimiter.size >= (this.config.maxConcurrentRequests || 5)) {
      await Promise.race(this.rateLimiter);
    }

    const promise = fn();
    this.rateLimiter.add(promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.rateLimiter.delete(promise);
    }
  }

  protected timeoutPromise<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      // Do not keep Node.js process alive because of timeout handles.
      if (typeof (timer as NodeJS.Timeout & { unref?: () => void }).unref === 'function') {
        (timer as NodeJS.Timeout & { unref?: () => void }).unref?.();
      }

      promise.then(
        value => {
          clearTimeout(timer);
          resolve(value);
        },
        error => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  }

  protected createStreamingResponse(
    stream: AsyncIterable<string>,
    responsePromise: Promise<AIResponse>
  ): StreamingAIResponse {
    return {
      stream,
      promise: responsePromise,
    };
  }
}
