import { createInterface, Interface } from 'readline';
import { BaseAdapter, AdapterMessage, AdapterResponse, AdapterConfig } from './index.js';

export class CLIAdapter extends BaseAdapter {
    private rl: Interface | null = null;
    private isConnected: boolean = false;

    constructor(config: AdapterConfig) {
        super(config);
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;

        this.rl = createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true
        });

        this.isConnected = true;
        console.log(`[CLIAdapter] Connected to Standard IO.`);
    }

    async disconnect(): Promise<void> {
        if (this.rl) {
            this.rl.close();
            this.rl = null;
        }
        this.isConnected = false;
        console.log(`[CLIAdapter] Disconnected.`);
    }

    listen(callback: (message: AdapterMessage) => void): void {
        if (!this.isConnected || !this.rl) {
            throw new Error("Adapter must be connected before listening.");
        }

        this.rl.on('line', (input) => {
            const trimmed = input.trim();
            if (!trimmed) return;

            const message: AdapterMessage = {
                id: Date.now().toString(),
                content: trimmed,
                senderId: 'user',
                channelId: 'stdio',
                timestamp: Date.now()
            };
            callback(message);
        });
    }

    async send(response: AdapterResponse): Promise<void> {
        if (!this.isConnected) {
            throw new Error("Adapter must be connected to send messages.");
        }
        console.log(response.content);
    }

    // Helper to prompt user (special CLI capability)
    question(query: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.rl) {
                return reject(new Error("CLI Adapter not connected"));
            }
            this.rl.question(query, (answer) => {
                resolve(answer);
            });
        });
    }
}
