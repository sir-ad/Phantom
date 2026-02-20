// PHANTOM Core: Autonomous Swarm Routines
// Inspired by OpenClaw Use Cases: The "Overnight App Builder" / "Multi-Agent Factory"

import { getAIManager } from '../ai/manager.js';
import { getContextEngine } from '../context.js';
import { getSuperIntellect } from '../mcp/client.js';

export interface NightlyBuildResult {
    prd: string;
    systemDesign: string;
    uiComponent: string;
    jiraTicketPreview: string;
}

/**
 * The Nightly Build Workflow
 * 
 * At 5 PM, a PM speaks a brain-dump into WisprFlow.
 * Over the night, Phantom creates a structured Graph mapping that voice command into 
 * actionable Jira tickets, a comprehensive PRD, and a live OpenUI generated component.
 */
export class SwarmRoutines {
    private aiManager = getAIManager();
    private contextEngine = getContextEngine();
    private intellect = getSuperIntellect();

    /**
     * Executes the Overnight Mini-App Builder logic.
     * @param voiceDump The raw unformatted thought dump recorded via WisprFlow.
     */
    public async triggerNightlyBuild(voiceDump: string): Promise<NightlyBuildResult> {
        console.log(`[Swarm] Initiating Nightly Build for Input: "${voiceDump.substring(0, 50)}..."`);

        // 1. Gather Deep Context (Rowboat-style graph)
        // Find existing Notion PRDs or Jira tickets mentioned in the 5PM brain dump.
        const graphContext = await this.contextEngine.search(voiceDump);
        const contextStr = graphContext.map(c => `[Context: ${c.type}] ${c.content || c.relativePath}`).join('\n\n');

        const systemPrompt = `You are the Phantom Swarm Orchestrator. The PM provided a chaotic brain-dump at 5 PM. 
You have access to their company's Context Graph:
${contextStr}`;

        const defaultModel = 'claude-3-7-sonnet-20250219';

        // Phase A: The Tech Lead (System Design & Jira Breakdown)
        const sysDesignRes = await this.aiManager.complete({
            model: defaultModel,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Based on this brain-dump: "${voiceDump}"\n\nWrite a brief architectural system design and list 3 Jira Epic/Task names we need to create.` }]
        });
        const sysDesignStr = sysDesignRes.content;

        // Phase B: The Product Manager Agent (PRD Drafting)
        const prdRes = await this.aiManager.complete({
            model: defaultModel,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Based on this brain-dump: "${voiceDump}"\n\nDraft a highly concise 1-page PRD highlighting goals, anti-goals, and core user flows.` }]
        });
        const prdStr = prdRes.content;

        // Phase C: The OpenUI Design Agent (React Component Mocking)
        const uiMockupRes = await this.aiManager.complete({
            model: defaultModel,
            messages: [{ role: 'system', content: `You are a Senior Frontend Engineer. Based on the following PRD: ${prdStr}` }, { role: 'user', content: `Generate ONE single-file React TSX component using Tailwind CSS that mocks the core user flow interface being requested. DO NOT use markdown, output ONLY the code.` }]
        });
        const uiMockupStr = uiMockupRes.content;

        // Link the generated artifacts in the Semantic Knowledge Graph
        const prdId = `artifact_prd_${Date.now()}`;
        const uiId = `artifact_ui_${Date.now()}`;

        this.contextEngine.addLink(prdId, uiId, 'mentions', 1.0);
        console.log(`[Swarm] Nightly Build Complete. Waking up the PM with a fresh Feature.`);

        return {
            prd: prdStr || "",
            systemDesign: sysDesignStr || "",
            uiComponent: uiMockupStr || "// UI Generation failed",
            jiraTicketPreview: "Jira tickets formulated locally. Connect MCP to sync."
        };
    }
}
