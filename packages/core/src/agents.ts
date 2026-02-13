// PHANTOM Core - Deterministic Agent Swarm
import { createHash } from 'crypto';
import { AGENT_DESCRIPTIONS, AGENT_TYPES, type AgentType } from './constants.js';
import { doctorIntegrations } from './integrations.js';
import { getContextEngine } from './context.js';

export type AgentStatus =
  | 'idle'
  | 'analyzing'
  | 'processing'
  | 'reviewing'
  | 'monitoring'
  | 'complete'
  | 'error';

export interface AgentResult {
  agent: AgentType;
  verdict: 'yes' | 'no' | 'maybe' | 'needs-data';
  confidence: number; // 0-100
  summary: string;
  details: string[];
  evidence: string[];
  duration: number; // deterministic synthetic ms
  score: number;
}

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
}

export interface AgentState {
  type: AgentType;
  status: AgentStatus;
  currentTask?: string;
  elapsed?: number;
}

interface SwarmInputSnapshot {
  contextFiles: number;
  contextHealth: number;
  connectedIntegrations: number;
  totalIntegrations: number;
  tokenCount: number;
}

function hashInt(input: string): number {
  const hex = createHash('sha256').update(input).digest('hex').slice(0, 8);
  return parseInt(hex, 16) >>> 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreToVerdict(score: number): AgentResult['verdict'] {
  if (score >= 72) return 'yes';
  if (score <= 38) return 'no';
  if (score >= 55) return 'maybe';
  return 'needs-data';
}

function summarizeVerdict(agent: AgentType, verdict: AgentResult['verdict']): string {
  const byVerdict: Record<AgentResult['verdict'], string> = {
    yes: 'supports proceeding with implementation',
    no: 'recommends against implementation under current constraints',
    maybe: 'sees mixed signals and requires tighter scope',
    'needs-data': 'requires additional evidence before committing',
  };
  return `${agent} ${byVerdict[verdict]}.`;
}

function getSnapshot(question: string): SwarmInputSnapshot {
  const context = getContextEngine();
  const stats = context.getStats();
  const checks = doctorIntegrations(process.cwd());
  const tokenCount = question.trim().split(/\s+/).filter(Boolean).length;
  return {
    contextFiles: stats.totalFiles,
    contextHealth: stats.healthScore,
    connectedIntegrations: checks.filter(c => c.healthy).length,
    totalIntegrations: checks.length,
    tokenCount,
  };
}

function baseScoreForAgent(agent: AgentType, snapshot: SwarmInputSnapshot, question: string): number {
  const seed = hashInt(`${agent}|${question.toLowerCase()}`);
  const seedBias = (seed % 31) - 15;
  const contextBias = Math.floor(snapshot.contextHealth / 12) - 3;
  const sizeBias = Math.min(8, Math.floor(snapshot.contextFiles / 120));
  const integrationBias =
    snapshot.totalIntegrations > 0
      ? Math.floor((snapshot.connectedIntegrations / snapshot.totalIntegrations) * 10) - 3
      : -2;
  const brevityBias = snapshot.tokenCount < 4 ? -4 : 0;

  const roleBias: Record<AgentType, number> = {
    Strategist: 3,
    Analyst: 1,
    Builder: 0,
    Designer: 1,
    Researcher: 2,
    Communicator: 0,
    Operator: 2,
  };

  const intentLower = question.toLowerCase();
  const intentBoost =
    (intentLower.includes('should') ? 4 : 0) +
    (intentLower.includes('priority') ? 3 : 0) +
    (intentLower.includes('revenue') ? 3 : 0) +
    (intentLower.includes('risk') ? 2 : 0);

  return clamp(52 + roleBias[agent] + seedBias + contextBias + sizeBias + integrationBias + brevityBias + intentBoost, 5, 95);
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

  analyze(question: string, snapshot: SwarmInputSnapshot): AgentResult {
    this.status = 'processing';
    this.currentTask = question;
    this.startTime = Date.now();

    const score = baseScoreForAgent(this.type, snapshot, question);
    const verdict = scoreToVerdict(score);
    const confidence = clamp(score + (verdict === 'maybe' ? -8 : verdict === 'needs-data' ? -10 : 0), 15, 98);
    const duration = 120 + (hashInt(`${this.type}|${question}|duration`) % 180);

    const evidence = [
      `context.health=${snapshot.contextHealth}`,
      `context.files=${snapshot.contextFiles}`,
      `integrations.connected=${snapshot.connectedIntegrations}/${snapshot.totalIntegrations}`,
      `question.tokens=${snapshot.tokenCount}`,
      `agent.score=${score}`,
    ];

    const details = [
      this.getDescription(),
      `Deterministic score model evaluated at ${score}/100.`,
      verdict === 'needs-data'
        ? 'Insufficient decision signal; add richer context before committing scope.'
        : `Decision posture: ${verdict.toUpperCase()}.`,
      `Evidence chain: ${evidence.join(' | ')}`,
    ];

    const result: AgentResult = {
      agent: this.type,
      verdict,
      confidence,
      summary: summarizeVerdict(this.type, verdict),
      details,
      evidence,
      duration,
      score,
    };

    this.status = 'complete';
    this.currentTask = undefined;
    return result;
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
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion) {
      throw new Error('Question must not be empty.');
    }

    const snapshot = getSnapshot(normalizedQuestion);
    if (onProgress) onProgress(this.getAgentStates());

    const results = AGENT_TYPES.map((agentType) =>
      this.agents.get(agentType)!.analyze(normalizedQuestion, snapshot)
    );

    if (onProgress) onProgress(this.getAgentStates());

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
    const evidence = results.flatMap(r => r.evidence);
    const provenance = [
      'engine=context.stats',
      'engine=integration.doctor',
      'engine=swarm.deterministic.score.v1',
    ];
    const deterministicMillis =
      1_700_000_000_000 + (hashInt(normalizedQuestion.toLowerCase()) % 31_536_000_000);

    return {
      question: normalizedQuestion,
      consensus,
      overallConfidence,
      agentResults: results,
      recommendation: this.generateRecommendation(consensus, results),
      totalDuration,
      timestamp: new Date(deterministicMillis).toISOString(),
      evidence,
      provenance,
    };
  }

  private generateRecommendation(consensus: SwarmResult['consensus'], results: AgentResult[]): string {
    const sorted = [...results].sort((a, b) => b.confidence - a.confidence);
    const top = sorted.slice(0, 3).map(r => `${r.agent}=${r.verdict}(${r.confidence}%)`).join(', ');

    switch (consensus) {
      case 'STRONG YES':
        return `Proceed with implementation. Top signals: ${top}.`;
      case 'YES':
        return `Proceed with scoped rollout and measurement plan. Top signals: ${top}.`;
      case 'MAYBE':
        return `Hold for additional evidence and narrowed scope. Top signals: ${top}.`;
      case 'NO':
        return `Do not prioritize this now; revisit after dependency or context changes. Top signals: ${top}.`;
      case 'STRONG NO':
        return `Reject current proposal and reframe objective with stronger evidence. Top signals: ${top}.`;
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
