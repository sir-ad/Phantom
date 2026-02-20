import { getAIManager } from '@phantom-pm/core';
// Import storage from other modules to direct access data
// @ts-ignore - Local packages might not be resolved perfectly in IDE but work in monorepo
import { InterviewStorage } from '@phantom-pm/interview-analyzer';
// @ts-ignore
import { FeedbackStorage } from '@phantom-pm/feedback-hub';
// @ts-ignore
import { UsageStorage } from '@phantom-pm/usage-intelligence';

import { Opportunity } from './types.js';
import { OpportunityScorer } from './scorer.js';

export class Synthesizer {
    private interviewStorage: any; // Type inference might fail across packages without full build
    private feedbackStorage: any;
    private usageStorage: any;
    private scorer: OpportunityScorer;

    constructor() {
        this.interviewStorage = new InterviewStorage();
        this.feedbackStorage = new FeedbackStorage();
        this.usageStorage = new UsageStorage();
        this.scorer = new OpportunityScorer();
    }

    async synthesize(): Promise<Opportunity[]> {
        console.log('Fetching data from all sources...');

        // 1. Gather Context
        const interviews = this.interviewStorage.getAll();
        const feedbackThemes = this.feedbackStorage.getAllThemes();
        // Daily active users as a baseline metric
        const usageMetrics = this.usageStorage.getMetrics('active_users', '2024-01-01');

        console.log(`Found: ${interviews.length} interviews, ${feedbackThemes.length} feedback themes.`);

        // 2. AI Synthesis
        const ai = getAIManager();
        const prompt = `
      Analyze the following product data and identify high-potential product opportunities.
      
      INTERVIEW INSIGHTS:
      ${JSON.stringify(interviews.slice(0, 5))} 

      FEEDBACK THEMES:
      ${JSON.stringify(feedbackThemes.slice(0, 5))}

      USAGE TRENDS:
      ${JSON.stringify(usageMetrics.slice(-7))}

      OUTPUT FORMAT (JSON):
      {
        "opportunities": [
          {
            "title": "Short title",
            "description": "Validation based on data...",
            "components": { "reach": 1-10, "impact": 1-10, "confidence": 0-100, "effort": 1-10 },
             "source_ids": ["related_id_1"]
          }
        ]
      }
    `;

        try {
            const response = await ai.complete({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
                // jsonMode removed to avoid type error, trusting generic response
            });

            // Heuristic parsing if strict JSON mode isn't available
            const cleanContent = response.content.replace(/```json/g, '').replace(/```/g, '');
            const result = JSON.parse(cleanContent);

            return result.opportunities.map((opp: any) => {
                const components = opp.components;
                return {
                    id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    title: opp.title,
                    description: opp.description,
                    score: this.scorer.calculateScore(components),
                    framework: 'RICE',
                    components,
                    sources: {}, // Todo: map back specific IDs
                    status: 'new',
                    created_at: new Date().toISOString()
                };
            });

        } catch (error: any) {
            console.error('Synthesis failed', error);
            return [];
        }
    }
}
