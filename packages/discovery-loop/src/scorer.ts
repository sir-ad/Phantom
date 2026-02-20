import { Opportunity, ScoringConfig } from './types.js';

export class OpportunityScorer {
    constructor(private config: ScoringConfig = { framework: 'RICE' }) { }

    calculateScore(components: Opportunity['components']): number {
        if (this.config.framework === 'RICE') {
            const reach = components.reach || 0;
            const impact = components.impact || 0;
            const confidence = (components.confidence || 0) / 100; // Assuming percentage
            const effort = components.effort || 1; // Avoid division by zero

            return (reach * impact * confidence) / effort;
        }

        if (this.config.framework === 'ICE') {
            const impact = components.impact || 0;
            const confidence = components.confidence || 0;
            const ease = components.effort ? (10 - components.effort) : 0; // Inverse of effort

            return (impact * confidence * ease) / 3; // Average
        }

        return 0;
    }
}
