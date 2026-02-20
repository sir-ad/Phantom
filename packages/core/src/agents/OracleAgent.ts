import { BaseAgent, type AgentState } from './BaseAgent.js';
import { getAIManager } from '../ai/manager.js';

export interface OracleCalibration {
    quote: string;
    author: string;
    insight: string;
    topic: string;
}

export class OracleAgent extends BaseAgent {
    private systemPrompt: string;

    constructor() {
        super('Oracle');
        this.systemPrompt = `You are the Oracle of Phantom. Your role is to provide philosophical calibration to product managers and developers based on their current research and dialogue with other AIs.

Given a snippet of a conversation they are having with an LLM (ChatGPT, Claude, etc.), you must:
1. Identify the core "struggle" or "topic" (e.g., debugging frustration, strategic ambiguity, creative block).
2. Select or generate a highly relevant philosophical quote (Stoicism, Existentialism, Taoism, etc.).
3. Provide a brief, "calibration insight" that connects the philosophy to their technical/product challenge.

Return the result in JSON format:
{
  "quote": "The quote text",
  "author": "Philosopher Name",
  "topic": "The identified topic",
  "insight": "Calibration insight for the user"
}`;
    }

    async calibrate(context: string): Promise<OracleCalibration> {
        const ai = getAIManager();
        const response = await ai.complete({
            model: ai.getDefaultProvider()?.getDefaultModel() || 'o3-mini',
            messages: [
                { role: 'system', content: this.systemPrompt },
                { role: 'user', content: `Analyze this chat context and calibrate: \n\n${context}` }
            ],
            temperature: 0.7
        });

        try {
            const cleanContent = response.content.includes('```json')
                ? response.content.split('```json')[1].split('```')[0].trim()
                : response.content.replace(/```/g, '').trim();
            return JSON.parse(cleanContent) as OracleCalibration;
        } catch (e) {
            // High-quality fallback
            return {
                quote: "The unexamined life is not worth living.",
                author: "Socrates",
                topic: "Wisdom",
                insight: "Your research is a form of examination. Keep digging deeper into the first principles of this problem."
            };
        }
    }
}
