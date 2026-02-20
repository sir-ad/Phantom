import { InterviewInput, InterviewInsights, AnalyzerConfig } from './types.js';
import { TranscriptParser } from './parser.js';
import { InterviewAnalyzer } from './analyzer.js';
import { InterviewStorage } from './storage.js';

export * from './types.js';
export * from './parser.js';
export * from './analyzer.js';
export * from './storage.js';

export async function runInterviewAnalyzer(args: Record<string, any>): Promise<any> {
    const command = args._?.[0] || 'analyze';

    if (command === 'analyze') {
        const file = args.file || args._?.[1];

        if (!file) {
            throw new Error('Interview transcript file is required');
        }

        console.log(`Analyzing interview transcript: ${file}`);

        try {
            // 1. Parse
            const parser = new TranscriptParser();
            const input = await parser.parseFile(file);

            // 2. Analyze
            const analyzer = new InterviewAnalyzer({
                model: args.model
            });
            const insights = await analyzer.analyze(input);

            // 3. Save
            const storage = new InterviewStorage();
            storage.save(insights);

            return {
                success: true,
                message: 'Analysis complete',
                data: insights
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    throw new Error(`Unknown command: ${command}`);
}
