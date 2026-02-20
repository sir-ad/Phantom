import { getAIManager, AGENT_PROMPTS } from '@phantom-pm/core';
import { Intent } from './types.js';

export class IntentRouter {
    async route(query: string): Promise<Intent> {
        const ai = getAIManager();
        const prompt = \`\${AGENT_PROMPTS.ROUTER_SYSTEM}
      
      USER QUERY: "\${query}"
    \`;

        try {
            const response = await ai.complete({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1
            });

            const cleanContent = response.content.replace(/```json / g, '').replace(/```/g, '');
        return JSON.parse(cleanContent);
    } catch(error) {
        console.error('Routing failed', error);
        return { category: 'unknown', confidence: 0 };
    }
}
}
