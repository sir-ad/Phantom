import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export interface MCPConnectionConfig {
    id: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
}

export class MCPSuperIntellect {
    private clients: Map<string, Client> = new Map();

    /**
     * Connect Phantom to an external MCP Server (e.g. Postgres, GitHub, Brave Search)
     * so Phantom can absorb its skills natively.
     */
    async connectExternalSkills(config: MCPConnectionConfig): Promise<void> {
        if (this.clients.has(config.id)) {
            return;
        }

        const transport = new StdioClientTransport({
            command: config.command,
            args: config.args,
            env: { ...process.env, ...config.env }
        });

        const client = new Client(
            {
                name: "phantom-super-intellect",
                version: "2.0.0"
            },
            {
                capabilities: {}
            }
        );

        await client.connect(transport);
        this.clients.set(config.id, client);

        console.log(`[Super Intellect] Phantom absorbed skills from: ${config.id}`);
    }

    /**
     * Bootstraps standard PM Context MCPs (Notion, Slack, Jira)
     * Automatically registers them in Phantom if the API keys are present in the environment.
     */
    async connectPMContexts(): Promise<void> {
        // 1. Notion API
        if (process.env.NOTION_API_KEY) {
            await this.connectExternalSkills({
                id: 'notion',
                command: 'npx',
                args: ['-y', '@modelcontextprotocol/server-notion'],
                env: { NOTION_API_KEY: process.env.NOTION_API_KEY }
            });
        }

        // 2. Slack API
        if (process.env.SLACK_BOT_TOKEN) {
            await this.connectExternalSkills({
                id: 'slack',
                command: 'npx',
                args: ['-y', '@modelcontextprotocol/server-slack'],
                env: { SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN, SLACK_TEAM_ID: process.env.SLACK_TEAM_ID || '' }
            });
        }

        // 3. Jira API (Atlassian)
        if (process.env.JIRA_API_TOKEN && process.env.JIRA_DOMAIN && process.env.JIRA_EMAIL) {
            await this.connectExternalSkills({
                id: 'jira',
                command: 'npx',
                args: ['-y', '@modelcontextprotocol/server-jira'],
                env: {
                    JIRA_API_TOKEN: process.env.JIRA_API_TOKEN,
                    JIRA_DOMAIN: process.env.JIRA_DOMAIN,
                    JIRA_EMAIL: process.env.JIRA_EMAIL
                }
            });
        } else {
            console.warn("[Super Intellect] Jira APIs incomplete. Phantom will fallback to OpenClaws Browser Agent for Jira crawling.");
        }

        // 4. Zoom (Mocking a generic transcript fetch protocol for phase 4)
        if (process.env.ZOOM_API_KEY) {
            // Note: Currently hypothetical MCP, fallback strategy if empty
            console.log("[Super Intellect] Zoom context activated.");
        }
    }

    async getAbsorbedSkills(): Promise<any[]> {
        let allTools: any[] = [];
        for (const [id, client] of this.clients.entries()) {
            try {
                const tools = await client.listTools();
                const mappedTools = tools.tools.map(t => ({
                    ...t,
                    _source_mcp_id: id // track which external brain provides this skill
                }));
                allTools = [...allTools, ...mappedTools];
            } catch (err) {
                console.error(`[Super Intellect] Failed to read skills from ${id}`, err);
            }
        }
        return allTools;
    }

    async callAbsorbedSkill(mcpId: string, toolName: string, args: Record<string, unknown>) {
        const client = this.clients.get(mcpId);
        if (!client) {
            throw new Error(`[Super Intellect] MCP connection not found: ${mcpId}`);
        }

        return await client.callTool({
            name: toolName,
            arguments: args
        });
    }

    async shutdown() {
        for (const client of this.clients.values()) {
            await client.close();
        }
        this.clients.clear();
    }
}

// Singleton for Phantom Core
let superIntellect: MCPSuperIntellect | null = null;
export function getSuperIntellect(): MCPSuperIntellect {
    if (!superIntellect) {
        superIntellect = new MCPSuperIntellect();
    }
    return superIntellect;
}
