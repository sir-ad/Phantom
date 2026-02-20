// PHANTOM Core - Vector Embeddings for Semantic Search

import { getAIManager } from './manager.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

export interface Embedding {
  id: string;
  path: string;
  relativePath: string;
  type: 'code' | 'document' | 'image' | 'design' | 'data' | 'ticket' | 'message' | 'person';
  content: string;
  vector: number[];
  metadata: {
    language?: string;
    lines?: number;
    size: number;
    lastModified: string;
  };
  createdAt: string;
}

export interface SearchResult {
  entry: Embedding;
  score: number;
}

export class EmbeddingEngine {
  private embeddings: Map<string, Embedding> = new Map();
  private readonly storePath: string;
  private aiManager: ReturnType<typeof getAIManager>;

  constructor(storeDir: string) {
    mkdirSync(storeDir, { recursive: true });
    this.storePath = join(storeDir, 'embeddings.json');
    this.aiManager = getAIManager();
    this.load();
  }

  private load(): void {
    if (!existsSync(this.storePath)) return;

    try {
      const raw = readFileSync(this.storePath, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.embeddings)) {
        this.embeddings.clear();
        for (const emb of data.embeddings) {
          if (emb?.id && emb?.vector) {
            this.embeddings.set(emb.id, emb);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load embeddings:', error);
      this.embeddings.clear();
    }
  }

  private persist(): void {
    const payload = {
      embeddings: Array.from(this.embeddings.values()),
      version: '1.0',
      updatedAt: new Date().toISOString(),
    };
    writeFileSync(this.storePath, JSON.stringify(payload, null, 2), 'utf8');
  }

  async createEmbedding(content: string): Promise<number[]> {
    try {
      const provider = this.aiManager.getPreferredProvider();
      if (!provider) {
        throw new Error('No AI provider available for embeddings');
      }

      // For OpenAI, use text-embedding-3-small
      if (provider.name === 'openai') {
        // Need to access OpenAI client directly
        const openaiClient = (provider as any).client;
        if (openaiClient) {
          const response = await openaiClient.embeddings.create({
            model: 'text-embedding-3-small',
            input: content,
            encoding_format: 'float',
          });
          const data = response.data as any[];
          return data[0].embedding;
        }
      }

      // For Anthropic, use their embeddings endpoint
      if (provider.name === 'anthropic') {
        // Note: Anthropic embeddings API is different - using text completion for now
        // This is a fallback - consider adding proper embedding support
        console.warn('Anthropic embeddings not fully implemented, using fallback');
        return this.createFallbackEmbedding(content);
      }

      // For Ollama, use local embeddings
      if (provider.name === 'ollama') {
        // Ollama embeddings endpoint
        try {
          const ollamaConfig = (provider as any).config;
          const baseUrl = ollamaConfig?.baseUrl || 'http://localhost:11434';

          const response = await fetch(`${baseUrl}/api/embeddings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'nomic-embed-text',
              prompt: content,
            }),
          });

          if (response.ok) {
            const data = await response.json() as any;
            return data.embedding || [];
          }
        } catch {
          // Fall back to simple embedding
        }
      }

      return this.createFallbackEmbedding(content);
    } catch (error) {
      console.warn('Failed to create embedding:', error);
      return this.createFallbackEmbedding(content);
    }
  }

  private createFallbackEmbedding(content: string): number[] {
    // Simple TF-IDF like fallback embedding (deterministic)
    const words = content.toLowerCase().split(/\W+/).filter(Boolean);
    const uniqueWords = [...new Set(words)];
    const embedding = new Array(128).fill(0);

    uniqueWords.forEach((word, idx) => {
      const hash = createHash('sha256').update(word).digest('hex');
      const position = parseInt(hash.slice(0, 2), 16) % 128;
      const value = parseInt(hash.slice(2, 4), 16) / 255;
      embedding[position] += value;
    });

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return embedding.map(val => val / magnitude);
    }
    return embedding;
  }

  async indexEntry(
    id: string,
    path: string,
    relativePath: string,
    type: Embedding['type'],
    content: string,
    metadata: Embedding['metadata']
  ): Promise<void> {
    // Truncate content for embedding (token limits)
    const maxChars = 8000;
    const truncatedContent = content.length > maxChars
      ? content.substring(0, maxChars) + '...'
      : content;

    const vector = await this.createEmbedding(truncatedContent);

    const embedding: Embedding = {
      id,
      path,
      relativePath,
      type,
      content: truncatedContent,
      vector,
      metadata,
      createdAt: new Date().toISOString(),
    };

    this.embeddings.set(id, embedding);
    this.persist();
  }

  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    const queryVector = await this.createEmbedding(query);
    const results: SearchResult[] = [];

    for (const embedding of this.embeddings.values()) {
      const similarity = this.cosineSimilarity(queryVector, embedding.vector);
      results.push({
        entry: embedding,
        score: similarity,
      });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const norm = Math.sqrt(normA) * Math.sqrt(normB);
    return norm > 0 ? dot / norm : 0;
  }

  removeEntry(id: string): boolean {
    const deleted = this.embeddings.delete(id);
    if (deleted) {
      this.persist();
    }
    return deleted;
  }

  clear(): void {
    this.embeddings.clear();
    this.persist();
  }

  getStats() {
    return {
      totalEmbeddings: this.embeddings.size,
      byType: Array.from(this.embeddings.values()).reduce((acc, emb) => {
        acc[emb.type] = (acc[emb.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}