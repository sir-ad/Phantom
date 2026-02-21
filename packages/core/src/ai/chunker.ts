/**
 * PHANTOM Core - Text Chunking Utility
 * Implements recursive character splitting for RAG preparation.
 */

export interface Chunk {
    id: string;
    content: string;
    index: number;
}

export interface ChunkingOptions {
    chunkSize?: number;
    chunkOverlap?: number;
}

export class TextChunker {
    private readonly chunkSize: number;
    private readonly chunkOverlap: number;

    constructor(options: ChunkingOptions = {}) {
        this.chunkSize = options.chunkSize || 4000; // ~1000 tokens
        this.chunkOverlap = options.chunkOverlap || 400; // 10% overlap
    }

    /**
     * Simple recursive chunking for text metadata.
     */
    chunk(text: string): Chunk[] {
        const chunks: Chunk[] = [];
        let start = 0;
        let index = 0;

        while (start < text.length) {
            let end = start + this.chunkSize;

            // If not at the end, try to find a natural break point (newline, period, space)
            if (end < text.length) {
                const breakPoints = ['\n\n', '\n', '. ', ' '];
                let foundBreak = false;

                for (const sep of breakPoints) {
                    const lastIndex = text.lastIndexOf(sep, end);
                    if (lastIndex > start + (this.chunkSize * 0.7)) { // Only break if we've filled at least 70% of the chunk
                        end = lastIndex + sep.length;
                        foundBreak = true;
                        break;
                    }
                }
            } else {
                end = text.length;
            }

            chunks.push({
                id: `chunk_${index}`,
                content: text.substring(start, end).trim(),
                index
            });

            // Move start forward, accounting for overlap
            start = end - this.chunkOverlap;
            if (start < 0) start = 0;

            // Safety break to prevent infinite loops
            if (start >= end) start = end + 1;

            index++;
        }

        return chunks;
    }
}
