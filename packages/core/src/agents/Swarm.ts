
import { AGENT_TYPES, type AgentType } from '../constants.js';
import { BaseAgent, type AgentResult, type SwarmInputSnapshot, type AgentState, getSnapshot } from './BaseAgent.js';
import pLimit from 'p-limit';

export interface SwarmResult {
    question: string;
    consensus: 'STRONG YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG NO';
    overallConfidence: number;
    agentResults: AgentResult[];
    recommendation: string;
    totalDuration: number;
    timestamp: string;
    evidence: string[];
    provenance: string[];
    totalCost: number;
}

export class AgentSwarm {
    private agents: Map<AgentType, BaseAgent> = new Map();
    private limit = pLimit(7); // Run all 7 agents in parallel

    constructor() {
        for (const type of AGENT_TYPES) {
            this.agents.set(type, new BaseAgent(type));
        }
    }

    getAgentStates(): AgentState[] {
        return Array.from(this.agents.values()).map(a => a.getState());
    }

    getAgent(type: AgentType): BaseAgent {
        return this.agents.get(type)!;
    }

    async runSwarm(question: string, onProgress?: (states: AgentState[]) => void): Promise<SwarmResult> {
        const normalizedQuestion = question.trim();
        if (!normalizedQuestion) {
            throw new Error('Question must not be empty.');
        }

        const snapshot = getSnapshot(normalizedQuestion);
        if (onProgress) onProgress(this.getAgentStates());

        // Run all agents in parallel
        const agentPromises = AGENT_TYPES.map(agentType =>
            this.limit(() => {
                if (onProgress) {
                    const states = this.getAgentStates();
                    states.find(s => s.type === agentType)!.status = 'processing';
                    onProgress(states);
                }

                return this.agents.get(agentType)!.analyze(normalizedQuestion, snapshot);
            })
        );

        const results = await Promise.all(agentPromises);
        if (onProgress) onProgress(this.getAgentStates());

        // Calculate consensus
        const yesVotes = results.filter(r => r.verdict === 'yes').length;
        const noVotes = results.filter(r => r.verdict === 'no').length;
        const maybeVotes = results.filter(r => r.verdict === 'maybe').length;

        let consensus: SwarmResult['consensus'] = 'MAYBE';
        if (yesVotes >= 6) consensus = 'STRONG YES';
        else if (yesVotes >= 4) consensus = 'YES';
        else if (noVotes >= 6) consensus = 'STRONG NO';
        else if (noVotes >= 4) consensus = 'NO';
        else if (maybeVotes >= 3) consensus = 'MAYBE';

        const overallConfidence = Math.round(
            results.reduce((sum, item) => sum + item.confidence, 0) / results.length
        );

        const totalDuration = results.reduce((sum, item) => sum + item.duration, 0);
        const totalCost = results.reduce((sum, item) => sum + item.cost, 0);
        const evidence = results.flatMap(r => r.evidence);
        const provenance = [
            'engine=ai.manager',
            'engine=parallel.agents',
            'engine=context.rag',
            'model=gpt-4-turbo-preview',
        ];

        return {
            question: normalizedQuestion,
            consensus,
            overallConfidence,
            agentResults: results,
            recommendation: this.generateRecommendation(consensus, results),
            totalDuration,
            timestamp: new Date().toISOString(),
            evidence,
            provenance,
            totalCost,
        };
    }

    private generateRecommendation(consensus: SwarmResult['consensus'], results: AgentResult[]): string {
        const sorted = [...results].sort((a, b) => b.confidence - a.confidence);
        const top = sorted.slice(0, 3).map(r => `${r.agent}=${r.verdict}(${r.confidence}%)`).join(', ');

        switch (consensus) {
            case 'STRONG YES':
                return `Proceed with implementation. Strong consensus with high confidence. Top signals: ${top}.`;
            case 'YES':
                return `Proceed with scoped rollout and measurement plan. Top signals: ${top}.`;
            case 'MAYBE':
                return `Hold for additional evidence and narrowed scope. Mixed signals. Top signals: ${top}.`;
            case 'NO':
                return `Do not prioritize this now; revisit after dependency or context changes. Top signals: ${top}.`;
            case 'STRONG NO':
                return `Reject current proposal and reframe objective with stronger evidence. Top signals: ${top}.`;
            default:
                return `Inconclusive result. Top signals: ${top}.`;
        }
    }

    resetAll(): void {
        for (const agent of this.agents.values()) {
            agent.status = 'idle';
            agent.currentTask = undefined;
            agent.startTime = undefined;
        }
    }
}

let swarmInstance: AgentSwarm | null = null;

export function getSwarm(): AgentSwarm {
    if (!swarmInstance) {
        swarmInstance = new AgentSwarm();
    }
    return swarmInstance;
}
