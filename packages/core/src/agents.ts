// PHANTOM Core - Agent Swarm System
// 7 specialized PM agents working in parallel

import { AGENT_TYPES, AGENT_DESCRIPTIONS, type AgentType } from './constants.js';

export type AgentStatus = 'idle' | 'analyzing' | 'processing' | 'reviewing' | 'monitoring' | 'complete' | 'error';

export interface AgentResult {
  agent: AgentType;
  verdict: 'yes' | 'no' | 'maybe' | 'needs-data';
  confidence: number; // 0-100
  summary: string;
  details: string[];
  duration: number; // ms
}

export interface SwarmResult {
  question: string;
  consensus: 'STRONG YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG NO';
  overallConfidence: number;
  agentResults: AgentResult[];
  recommendation: string;
  totalDuration: number;
  timestamp: string;
}

export interface AgentState {
  type: AgentType;
  status: AgentStatus;
  currentTask?: string;
  elapsed?: number;
}

export class Agent {
  type: AgentType;
  status: AgentStatus = 'idle';
  currentTask?: string;
  startTime?: number;

  constructor(type: AgentType) {
    this.type = type;
  }

  getDescription(): string {
    return AGENT_DESCRIPTIONS[this.type];
  }

  getState(): AgentState {
    return {
      type: this.type,
      status: this.status,
      currentTask: this.currentTask,
      elapsed: this.startTime ? Date.now() - this.startTime : undefined,
    };
  }

  async analyze(question: string): Promise<AgentResult> {
    this.status = 'analyzing';
    this.currentTask = question;
    this.startTime = Date.now();

    // Simulate analysis with realistic timing
    const duration = 2000 + Math.random() * 8000;
    await this.sleep(duration);

    const confidence = 60 + Math.floor(Math.random() * 35);
    const isPositive = Math.random() > 0.3;

    const result: AgentResult = {
      agent: this.type,
      verdict: isPositive ? 'yes' : Math.random() > 0.5 ? 'no' : 'maybe',
      confidence,
      summary: this.generateSummary(question, isPositive),
      details: this.generateDetails(question, isPositive),
      duration: Date.now() - this.startTime,
    };

    this.status = 'complete';
    this.currentTask = undefined;
    return result;
  }

  private generateSummary(question: string, positive: boolean): string {
    const summaries: Record<AgentType, [string, string]> = {
      Strategist: [
        'Aligns with market trends and competitive positioning',
        'Misaligned with current strategic priorities',
      ],
      Analyst: [
        'Data supports positive user impact metrics',
        'Insufficient data to support expected ROI',
      ],
      Builder: [
        'Technically feasible within current architecture',
        'Requires significant architectural changes',
      ],
      Designer: [
        'Enhances user experience and reduces friction',
        'Adds complexity to an already busy interface',
      ],
      Researcher: [
        'Matches user needs identified in research',
        'No clear user demand signal detected',
      ],
      Communicator: [
        'Easy to message and drives positive narrative',
        'Difficult to explain value proposition to stakeholders',
      ],
      Operator: [
        'Fits well into current sprint capacity',
        'Would require deprioritizing existing commitments',
      ],
    };

    return summaries[this.type][positive ? 0 : 1];
  }

  private generateDetails(question: string, positive: boolean): string[] {
    const allDetails: Record<AgentType, string[]> = {
      Strategist: [
        '73% of competitors offer similar functionality',
        'Market demand index: 8.2/10',
        'Aligns with Q2 OKR: "Expand user engagement"',
        'TAM expansion potential: +15% addressable market',
      ],
      Analyst: [
        'Related feature adoption rate: 67% in first 30 days',
        'Projected impact on retention: +4.2%',
        'Similar features show 2.3x engagement increase',
        'Revenue impact estimate: +$12K-34K MRR',
      ],
      Builder: [
        'Estimated effort: 3-5 story points',
        'Dependencies: Authentication service, notification system',
        'Tech debt impact: Neutral',
        'Existing libraries available: 3 mature options',
      ],
      Designer: [
        'Reduces user flow from 4 steps to 2',
        'Accessibility impact: Positive (WCAG AA compliant)',
        'Mobile experience: Responsive design needed',
        'UI consistency: Matches existing design system',
      ],
      Researcher: [
        '42% of surveyed users requested this feature',
        'Matches Job-to-be-Done: "Reduce time to complete task"',
        'Power users would benefit most (34% of base)',
        'Support tickets related: 28 in last 30 days',
      ],
      Communicator: [
        'Stakeholder alignment: Product & Engineering agree',
        'Customer communication plan: In-app + email',
        'Documentation impact: Minor update needed',
        'Marketing opportunity: Feature launch blog post',
      ],
      Operator: [
        'Sprint capacity available: 8 points remaining',
        'No blocking dependencies in current sprint',
        'Testing effort: 2 additional QA days',
        'Rollout strategy: 10% → 50% → 100% over 2 weeks',
      ],
    };

    return allDetails[this.type].slice(0, positive ? 4 : 3);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class AgentSwarm {
  private agents: Map<AgentType, Agent> = new Map();

  constructor() {
    for (const type of AGENT_TYPES) {
      this.agents.set(type, new Agent(type));
    }
  }

  getAgentStates(): AgentState[] {
    return Array.from(this.agents.values()).map(a => a.getState());
  }

  getAgent(type: AgentType): Agent {
    return this.agents.get(type)!;
  }

  async runSwarm(question: string, onProgress?: (states: AgentState[]) => void): Promise<SwarmResult> {
    const startTime = Date.now();

    // Start progress reporting
    let progressInterval: ReturnType<typeof setInterval> | undefined;
    if (onProgress) {
      progressInterval = setInterval(() => {
        onProgress(this.getAgentStates());
      }, 500);
    }

    // Run all agents in parallel
    const results = await Promise.all(
      Array.from(this.agents.values()).map(agent => agent.analyze(question))
    );

    if (progressInterval) {
      clearInterval(progressInterval);
    }

    // Calculate consensus
    const yesVotes = results.filter(r => r.verdict === 'yes').length;
    const noVotes = results.filter(r => r.verdict === 'no').length;
    const avgConfidence = Math.round(
      results.reduce((sum, r) => sum + r.confidence, 0) / results.length
    );

    let consensus: SwarmResult['consensus'];
    if (yesVotes >= 6) consensus = 'STRONG YES';
    else if (yesVotes >= 4) consensus = 'YES';
    else if (yesVotes >= 3 && noVotes <= 2) consensus = 'MAYBE';
    else if (noVotes >= 4) consensus = 'NO';
    else if (noVotes >= 6) consensus = 'STRONG NO';
    else consensus = 'MAYBE';

    return {
      question,
      consensus,
      overallConfidence: avgConfidence,
      agentResults: results,
      recommendation: this.generateRecommendation(consensus, results),
      totalDuration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }

  private generateRecommendation(consensus: SwarmResult['consensus'], results: AgentResult[]): string {
    const topResults = results
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    const summaries = topResults.map(r => `${r.agent}: ${r.summary}`).join('. ');

    switch (consensus) {
      case 'STRONG YES':
        return `Strong recommendation to proceed. ${summaries}`;
      case 'YES':
        return `Recommended with minor considerations. ${summaries}`;
      case 'MAYBE':
        return `Mixed signals — consider gathering more data. ${summaries}`;
      case 'NO':
        return `Not recommended at this time. ${summaries}`;
      case 'STRONG NO':
        return `Strongly advised against. ${summaries}`;
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

// Singleton
let instance: AgentSwarm | null = null;

export function getSwarm(): AgentSwarm {
  if (!instance) {
    instance = new AgentSwarm();
  }
  return instance;
}
