import { readFile } from 'fs/promises';
import { InterviewInput } from './types.js';

export class TranscriptParser {
    async parseFile(filePath: string): Promise<InterviewInput> {
        const content = await readFile(filePath, 'utf-8');

        // TODO: Implement smarter parsing (e.g., detect speakers, timestamps)
        // For now, treat the whole file as the transcript mechanism

        // Try to extract metadata from frontmatter?
        // Or just simple file name as metadata source

        return {
            transcript: content,
            metadata: {
                interviewee: 'Unknown', // Could parse from filename
                date: new Date().toISOString(),
                product_area: 'Generative',
            }
        };
    }
}
