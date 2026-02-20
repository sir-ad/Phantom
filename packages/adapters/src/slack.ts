import { BaseAdapter, AdapterMessage, AdapterResponse, AdapterConfig } from './index.js';

export class SlackAdapter extends BaseAdapter {
    private isConnected: boolean = false;

    constructor(config: AdapterConfig) {
        super(config);
    }

    async connect(): Promise<void> {
        console.log(`[SlackAdapter] Connecting to workspace ${this.config.id}...`);
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 500));
        this.isConnected = true;
        console.log(`[SlackAdapter] Connected.`);
    }

    async disconnect(): Promise<void> {
        this.isConnected = false;
        console.log(`[SlackAdapter] Disconnected.`);
    }

    listen(callback: (message: AdapterMessage) => void): void {
        if (!this.isConnected) {
            throw new Error("Adapter must be connected before listening.");
        }

        console.log(`[SlackAdapter] Listening for events...`);
        // In a real implementation, this would hook into Slack's Event API/Socket Mode
        // For POC, we'll manually expose a trigger method if needed, or just leave it passive.
    }

    async send(response: AdapterResponse): Promise<void> {
        if (!this.isConnected) {
            throw new Error("Adapter must be connected to send messages.");
        }
        console.log(`[SlackAdapter] Sending to ${response.channelId}: ${response.content}`);
    }
}
