export interface AgentMessage {
    id: string;
    from: string;
    to: string;
    type: 'request' | 'response' | 'broadcast';
    payload: {
        method: string;
        params?: any;
        result?: any;
        error?: any;
    };
    timestamp: number;
}

/**
 * Standardized protocol for Agent-to-Agent communication.
 * Compatible with MCP and OpenClaw message structures.
 */
export class AgentProtocol {
    private handlers: Map<string, (msg: AgentMessage) => void> = new Map();

    async send(message: AgentMessage): Promise<void> {
        console.log(`[Protocol] Message from ${message.from} to ${message.to}: ${message.payload.method}`);

        // In a real implementation, this would route through an event bus,
        // WebSocket, or MCP transport.

        const handler = this.handlers.get(message.to);
        if (handler) {
            handler(message);
        } else if (message.to === '*') {
            // Broadcast
            this.handlers.forEach(h => h(message));
        }
    }

    onMessage(agentId: string, handler: (msg: AgentMessage) => void): void {
        this.handlers.set(agentId, handler);
    }
}

// Singleton protocol bus for local agent talk
export const globalAgentBus = new AgentProtocol();
