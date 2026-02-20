
import { AGENT_DESCRIPTIONS, type AgentType } from '../constants.js';
import { getAIManager, type AIMessage } from '../ai/manager.js';
import { getContextEngine } from '../context.js';
import { doctorIntegrations } from '../integrations.js';
import { SkillRegistry } from '../skills/registry.js';

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

export interface AgentState {
    type: AgentType;
    status: AgentStatus;
    currentTask?: string;
    elapsed?: number;
}

export interface SwarmInputSnapshot {
    contextFiles: number;
    contextHealth: number;
    connectedIntegrations: number;
    totalIntegrations: number;
    tokenCount: number;
    healthScore: number;
}

// Helper: Get System Prompt (Moved from original file)
function getSystemPrompt(agent: AgentType, snapshot: SwarmInputSnapshot): string {
    // ... (Full prompt logic from original file, omitted for brevity in this step, but needed in real file)
    // For now, I will use a simplified version or copy the full logic.
    // copying full logic is safer.
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

    return basePrompts[agent] || "You are a specialized agent.";
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
    // ... (Same parsing logic)
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

export function getSnapshot(question: string): SwarmInputSnapshot {
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

export class BaseAgent {
    type: AgentType;
    status: AgentStatus = 'idle';
    currentTask?: string;
    startTime?: number;

    constructor(type: AgentType) {
        this.type = type;
    }

    getDescription(): string {
        return AGENT_DESCRIPTIONS[this.type] || "A specialized AI agent.";
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
        const MAX_TURNS = 5;
        let turnCount = 0;

        try {
            const ai = getAIManager();
            const registry = SkillRegistry.getInstance();
            const tools = registry.getAllTools();

            // 1. Construct Tool Definitions for Prompt
            const toolDesc = tools.map(t =>
                `- ${t.name}: ${t.description} (Args: ${JSON.stringify(t.parameters)})`
            ).join('\n');

            const toolPrompt = tools.length > 0 ? `
## Available Tools
You can use tools to gather information before giving your final verdict.
To use a tool, responding ONLY with a JSON object:
{ "tool": "tool_name", "args": { ... } }

Available Tools:
${toolDesc}
` : '';

            let systemPrompt = getSystemPrompt(this.type, snapshot);
            systemPrompt += toolPrompt;

            const relevantContext = await extractRelevantContext(question);

            let messages: AIMessage[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Question: ${question}\n\nRelevant Context:\n${relevantContext}\n\nPlease provide your analysis with:\n1. Verdict: yes/no/maybe/needs-data\n2. Confidence: 0-100\n3. Reasoning: Your detailed analysis\n\nYour response should start with "Verdict:" followed by your verdict, then "Confidence:" followed by a number, then your reasoning.` },
            ];

            // ReAct Loop
            while (turnCount < MAX_TURNS) {
                turnCount++;

                const request = {
                    model: ai.getDefaultProvider()?.getDefaultModel() || 'o3-mini',
                    messages,
                    temperature: 0.3,
                    maxTokens: 1000,
                };

                const response = await ai.complete(request);
                const content = response.content.trim();

                // Check for Tool Call (JSON)
                if (content.startsWith('{') && content.endsWith('}')) {
                    try {
                        const call = JSON.parse(content);
                        if (call.tool && call.args) {
                            const tool = tools.find(t => t.name === call.tool);
                            if (tool) {
                                // Execute Tool
                                messages.push({ role: 'assistant', content });

                                try {
                                    const result = await tool.handler(call.args);
                                    messages.push({ role: 'user', content: `Tool Output (${call.tool}): ${JSON.stringify(result)}` });
                                    continue; // Loop again with tool output
                                } catch (toolErr: any) {
                                    messages.push({ role: 'user', content: `Tool Error (${call.tool}): ${toolErr.message}` });
                                    continue;
                                }
                            }
                        }
                    } catch (e) {
                        // Not JSON, or failed parse - treat as final response
                    }
                }

                // If not a tool call, parse as final verdict
                const { verdict, confidence, reasoning } = parseAIResponse(content);

                // ... (Rest of result construction)
                const evidence = [
                    `context.files=${snapshot.contextFiles}`,
                    `context.health=${snapshot.contextHealth}`,
                    `integrations=${snapshot.connectedIntegrations}/${snapshot.totalIntegrations}`,
                    `ai.model=${response.model}`,
                    `ai.latency=${response.latency}ms`,
                    `tool_turns=${turnCount}`,
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
            }

            // Fallback if max turns reached
            throw new Error("Max turns reached without verdict");

        } catch (error) {
            // ... (Error handling)
            this.status = 'error';
            this.currentTask = undefined;
            return {
                agent: this.type,
                verdict: 'maybe',
                confidence: 50,
                summary: `${this.type} could not analyze due to AI service error.`,
                details: ['AI service unavailable, using fallback analysis.', error instanceof Error ? error.message : 'Unknown error'],
                evidence: ['ai.fallback=true', 'error=service_unavailable'],
                duration: Date.now() - (this.startTime || Date.now()),
                cost: 0,
            };
        }
    }
}
