// PHANTOM Core - Real AI Agent Swarm
import { AGENT_DESCRIPTIONS, AGENT_TYPES, type AgentType } from './constants.js';
import { doctorIntegrations } from './integrations.js';
import { getContextEngine } from './context.js';
import { getAIManager, type AIMessage } from './ai/manager.js';
import pLimit from 'p-limit';

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
  duration: number; // real ms
  cost: number;
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
  totalCost: number;
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
  healthScore: number;
}

function getSystemPrompt(agent: AgentType, snapshot: SwarmInputSnapshot): string {
  const basePrompts: Record<AgentType, string> = {
    Strategist: `You are a Product Strategy Expert. Analyze from a market positioning, competitive landscape, and strategic advantage perspective.

Project Context:
- Indexed files: ${snapshot.contextFiles}
- Context health: ${snapshot.healthScore}%
- Connected integrations: ${snapshot.connectedIntegrations}/${snapshot.totalIntegrations}

Focus on:
1. Market positioning and differentiation
2. Competitive advantages/weaknesses
3. Strategic alignment with company vision
4. Long-term product strategy
5. Go-to-market considerations

Provide a clear verdict (yes/no/maybe/needs-data) with confidence score (0-100) and reasoning.`,

    Analyst: `You are a Data & Analytics Expert. Analyze from metrics, user behavior, and quantitative impact perspective.

Project Context:
- Indexed files: ${snapshot.contextFiles}
- Context health: ${snapshot.healthScore}%
- Connected integrations: ${snapshot.connectedIntegrations}/${snapshot.totalIntegrations}

Focus on:
1. Data-driven decision making
2. Metrics and KPI impact
3. User behavior patterns
4. Quantitative risk assessment
5. Success measurement framework

Provide a clear verdict (yes/no/maybe/needs-data) with confidence score (0-100) and reasoning.`,

    Builder: `You are a Technical Implementation Expert. Analyze from feasibility, architecture, and development effort perspective.

Project Context:
- Indexed files: ${snapshot.contextFiles}
- Context health: ${snapshot.healthScore}%
- Connected integrations: ${snapshot.connectedIntegrations}/${snapshot.totalIntegrations}

Focus on:
1. Technical feasibility and constraints
2. Implementation complexity and effort
3. Architecture implications
4. Security and performance considerations
5. Maintenance and scalability impact

Provide a clear verdict (yes/no/maybe/needs-data) with confidence score (0-100) and reasoning.`,

    Designer: `You are a UX/UI Design Expert. Analyze from user experience, interface design, and accessibility perspective.

Project Context:
- Indexed files: ${snapshot.contextFiles}
- Context health: ${snapshot.healthScore}%
- Connected integrations: ${snapshot.connectedIntegrations}/${snapshot.totalIntegrations}

Focus on:
1. User experience and usability
2. Interface design consistency
3. Accessibility and inclusivity
4. User research and testing needs
5. Design system impact

Provide a clear verdict (yes/no/maybe/needs-data) with confidence score (0-100) and reasoning.`,

    Researcher: `You are a User Research Expert. Analyze from user needs, jobs-to-be-done, and qualitative insights perspective.

Project Context:
- Indexed files: ${snapshot.contextFiles}
- Context health: ${snapshot.healthScore}%
- Connected integrations: ${snapshot.connectedIntegrations}/${snapshot.totalIntegrations}

Focus on:
1. User needs and pain points
2. Jobs-to-be-done framework
3. Qualitative research insights
4. Persona alignment
5. Feature validation approach

Provide a clear verdict (yes/no/maybe/needs-data) with confidence score (0-100) and reasoning.`,

    Communicator: `You are a Stakeholder Communication Expert. Analyze from messaging, documentation, and team alignment perspective.

Project Context:
- Indexed files: ${snapshot.contextFiles}
- Context health: ${snapshot.healthScore}%
- Connected integrations: ${snapshot.connectedIntegrations}/${snapshot.totalIntegrations}

Focus on:
1. Stakeholder communication needs
2. Documentation and knowledge sharing
3. Team alignment and buy-in
4. Change management considerations
5. External messaging strategy

Provide a clear verdict (yes/no/maybe/needs-data) with confidence score (0-100) and reasoning.`,

    Operator: `You are a Product Operations Expert. Analyze from process, delivery, and operational excellence perspective.

Project Context:
- Indexed files: ${snapshot.contextFiles}
- Context health: ${snapshot.healthScore}%
- Connected integrations: ${snapshot.connectedIntegrations}/${snapshot.totalIntegrations}

Focus on:
1. Process efficiency and bottlenecks
2. Sprint planning and delivery capacity
3. Quality assurance and testing
4. Risk management and mitigation
5. Continuous improvement opportunities

Provide a clear verdict (yes/no/maybe/needs-data) with confidence score (0-100) and reasoning.`,

    TaskMaster: `You are a Technical Project Architect. Analyze from a work decomposition, complexity, and resource assignment perspective.
Project Context:
- Indexed files: ${snapshot.contextFiles}
- Context health: ${snapshot.healthScore}%
Focus on:
1. Recursive task decomposition
2. Complexity hotspots (Complexity > 5)
3. Specialized agent assignment
4. Critical path identification
Provide a clear verdict (yes/no/maybe/needs-data) with confidence score (0-100) and reasoning.`,

    Oracle: `You are a Philosophical Calibration Agent. Analyze from a context-aware, first-principles, and insight-driven perspective.
Project Context:
- Indexed files: ${snapshot.contextFiles}
Focus on:
1. Contextual alignment with research
2. Philosophical insights (Stoicism, Taoism)
3. Research-to-Action mapping
4. Mental model calibration
Provide a clear verdict (yes/no/maybe/needs-data) with confidence score (0-100) and reasoning.`,
  };

  return basePrompts[agent];
}

async function extractRelevantContext(question: string): Promise<string> {
  const context = getContextEngine();
  const searchResults = await context.search(question);
  const topResults = searchResults.slice(0, 3);

  if (topResults.length === 0) {
    return 'No relevant project context found.';
  }

  return topResults.map((entry: any) =>
    `File: ${entry.relativePath}\n` +
    `Type: ${entry.type}\n` +
    `Snippet: ${entry.content?.slice(0, 300) || 'No content available'}\n`
  ).join('\n---\n');
}

function parseAIResponse(response: string): { verdict: AgentResult['verdict']; confidence: number; reasoning: string } {
  const lines = response.split('\n');
  let verdict: AgentResult['verdict'] = 'maybe';
  let confidence = 50;
  let reasoning = '';

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.includes('verdict:')) {
      if (lower.includes('yes')) verdict = 'yes';
      else if (lower.includes('no')) verdict = 'no';
      else if (lower.includes('maybe')) verdict = 'maybe';
      else if (lower.includes('needs-data') || lower.includes('needs data')) verdict = 'needs-data';
    }

    if (lower.includes('confidence:')) {
      const match = line.match(/(\d+)/);
      if (match) {
        confidence = Math.min(100, Math.max(0, parseInt(match[1], 10)));
      }
    }

    if (!lower.includes('verdict:') && !lower.includes('confidence:')) {
      reasoning += line + '\n';
    }
  }

  reasoning = reasoning.trim();

  // Fallback if parsing failed
  if (verdict === 'maybe' && confidence === 50) {
    const lowerResponse = response.toLowerCase();
    if (lowerResponse.includes('recommend') && lowerResponse.includes('proceed')) {
      verdict = 'yes';
      confidence = 70;
    } else if (lowerResponse.includes('do not') || lowerResponse.includes('avoid')) {
      verdict = 'no';
      confidence = 60;
    }
  }

  return { verdict, confidence, reasoning };
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
    healthScore: stats.healthScore,
  };
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

  async analyze(question: string, snapshot: SwarmInputSnapshot): Promise<AgentResult> {
    this.status = 'analyzing';
    this.currentTask = question;
    this.startTime = Date.now();

    try {
      const ai = getAIManager();
      const systemPrompt = getSystemPrompt(this.type, snapshot);
      const relevantContext = await extractRelevantContext(question);

      const messages: AIMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Question: ${question}\n\nRelevant Context:\n${relevantContext}\n\nPlease provide your analysis with:\n1. Verdict: yes/no/maybe/needs-data\n2. Confidence: 0-100\n3. Reasoning: Your detailed analysis\n\nYour response should start with "Verdict:" followed by your verdict, then "Confidence:" followed by a number, then your reasoning.` },
      ];

      const request = {
        model: 'o3-mini', // Will be overridden by provider
        messages,
        temperature: 0.3,
        maxTokens: 1000,
      };

      const response = await ai.complete(request);
      const { verdict, confidence, reasoning } = parseAIResponse(response.content);

      const evidence = [
        `context.files=${snapshot.contextFiles}`,
        `context.health=${snapshot.contextHealth}`,
        `integrations=${snapshot.connectedIntegrations}/${snapshot.totalIntegrations}`,
        `ai.model=${response.model}`,
        `ai.latency=${response.latency}ms`,
      ];

      const details = [
        this.getDescription(),
        `AI Model: ${response.model}`,
        `Confidence Score: ${confidence}/100`,
        reasoning || 'No detailed reasoning provided.',
      ];

      const result: AgentResult = {
        agent: this.type,
        verdict,
        confidence,
        summary: `${this.type} ${verdict === 'yes' ? 'supports' : verdict === 'no' ? 'opposes' : 'has reservations about'} proceeding with implementation.`,
        details,
        evidence,
        duration: Date.now() - this.startTime,
        cost: ai.getMetrics().find(m => m.provider === 'openai')?.totalCost || 0,
      };

      this.status = 'complete';
      this.currentTask = undefined;
      return result;

    } catch (error) {
      this.status = 'error';
      this.currentTask = undefined;

      // Fallback to deterministic result if AI fails
      const deterministicVerdict: AgentResult['verdict'] = 'maybe';
      const deterministicConfidence = 50;

      return {
        agent: this.type,
        verdict: deterministicVerdict,
        confidence: deterministicConfidence,
        summary: `${this.type} could not analyze due to AI service error.`,
        details: ['AI service unavailable, using fallback analysis.', error instanceof Error ? error.message : 'Unknown error'],
        evidence: ['ai.fallback=true', 'error=service_unavailable'],
        duration: Date.now() - (this.startTime || Date.now()),
        cost: 0,
      };
    }
  }
}

export class AgentSwarm {
  private agents: Map<AgentType, Agent> = new Map();
  private limit = pLimit(7); // Run all 7 agents in parallel

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
      'model=o3-mini',
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