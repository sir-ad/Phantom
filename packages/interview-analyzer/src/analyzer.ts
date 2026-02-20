import { getAIManager } from '@phantom-pm/core';
import { InterviewInput, InterviewInsights, AnalyzerConfig } from './types.js';

export class InterviewAnalyzer {
    constructor(private config: AnalyzerConfig = {}) { }

    async analyze(input: InterviewInput): Promise<InterviewInsights> {
        const ai = getAIManager();

        const prompt = `
      Analyze the following customer interview transcript and extract key insights.
      
      TRANSCRIPT:
      ${input.transcript}
      
      OUTPUT FORMAT (JSON):
      {
        "summary": "High-level summary of the interview",
        "pain_points": [
          { "description": "...", "severity": 1-10, "quotes": ["..."] }
        ],
        "jobs_to_be_done": [
          { "job": "...", "importance": 1-10, "satisfaction": 1-10 }
        ],
        "themes": [
          { "name": "...", "related_pain_points": ["..."] }
        ],
        "quotes": [
          { "text": "...", "context": "...", "category": "..." }
        ]
      }
    `;

        try {
            const response = await ai.complete({
                model: this.config.model || 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2
            });

            const result = JSON.parse(response.content);

            return {
                id: `int_${Date.now()}`,
                ...result,
                pain_points: result.pain_points.map((p: any) => ({ ...p, frequency: 1 })),
                themes: result.themes.map((t: any) => ({ ...t, mentions: 1 }))
            };
        } catch (error: any) {
            throw new Error(`AI Analysis failed: ${error.message}`);
        }
    }
}
