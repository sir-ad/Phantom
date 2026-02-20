import { getAIManager, AGENT_PROMPTS } from '@phantom-pm/core';
import { Intent } from './types.js';

export class IntentRouter {
    private keywordRouter(input: string): Intent {
        const lower = input.toLowerCase();

        const INTENT_KEYWORDS: Record<string, string[]> = {
            'prd': ['prd', 'product requirement', 'spec', 'requirements doc'],
            'user_story': ['user story', 'story', 'acceptance criteria', 'as a user'],
            'sprint': ['sprint', 'iteration', 'planning', 'velocity', 'backlog'],
            'interview': ['interview', 'user research', 'feedback', 'analyze interviews'],
            'metrics': ['metrics', 'kpi', 'analytics', 'measure', 'dashboard'],
            'roadmap': ['roadmap', 'timeline', 'milestones', 'quarters'],
            'competitive': ['competitive', 'competitor', 'market', 'landscape'],
            'persona': ['persona', 'user segment', 'target user', 'icp'],
            'health': ['health', 'doctor', 'status', 'check'],
            'help': ['help', '--help', 'commands', 'what can you do'],
            'greeting': ['hi', 'hello', 'hey', 'sup', 'good morning'],
        };

        for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
            if (keywords.some(k => lower.includes(k))) {
                return { category: intent as any, confidence: 0.85 };
            }
        }

        // General chat fallback — NEVER return unknown for plain text
        return { category: 'unknown', confidence: 0.6 }; // treating 'unknown' as general chat
    }

    async route(query: string): Promise<Intent> {
        const ai = getAIManager();
        const prompt = `${AGENT_PROMPTS.ROUTER_SYSTEM}
      
      USER QUERY: "${query}"
    `;

        try {
            const response = await ai.complete({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1
            });

            const cleanContent = response.content.replace(/```json /g, '').replace(/```/g, '');
            const parsed = JSON.parse(cleanContent);

            if (parsed.confidence > 0.5) return parsed;

            return this.keywordRouter(query);
        } catch (error) {
            console.error('Routing failed', error);
            return this.keywordRouter(query);
        }
    }
}
