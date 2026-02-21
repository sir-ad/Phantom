import { ConfigManager, getConfig } from '../config.js';
import { SessionManager } from './session.js';
import { BaseChannelAdapter } from './adapters/BaseAdapter.js';

export class GatewayDaemon {
    private config: ConfigManager;
    private sessionManager: SessionManager;
    private adapters: Map<string, BaseChannelAdapter> = new Map();
    private isRunning: boolean = false;
    private heartbeatInterval?: NodeJS.Timeout;

    constructor() {
        this.config = getConfig();
        this.sessionManager = new SessionManager();
    }

    public registerAdapter(adapter: BaseChannelAdapter) {
        adapter.onMessage(async (message, sourceAdapter) => {
            await this.sessionManager.handleIncomingMessage(message, sourceAdapter);
        });
        this.adapters.set(adapter.getName(), adapter);
    }

    public async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('[GatewayDaemon] Starting Phantom Nexus Gateway...');

        for (const [name, adapter] of this.adapters) {
            try {
                console.log(`[GatewayDaemon] Initializing adapter: ${name}`);
                await adapter.start();
            } catch (err: any) {
                console.error(`[GatewayDaemon] Failed to start adapter ${name}: ${err.message}`);
            }
        }

        const autonomyConfig = this.config.get().autonomy;
        if (autonomyConfig?.heartbeatEnabled) {
            this.startHeartbeat(autonomyConfig.heartbeatIntervalMin || 30);
        }
    }

    private startHeartbeat(intervalMin: number) {
        console.log(`[GatewayDaemon] Heartbeat initialized. Interval: ${intervalMin}m`);
        this.heartbeatInterval = setInterval(() => {
            this.executeHeartbeatTask();
        }, intervalMin * 60 * 1000);
    }

    private async executeHeartbeatTask() {
        console.log(`[GatewayDaemon] Heartbeat triggered at ${new Date().toISOString()}`);
        // Future integration: DiscoveryLoop invocation
    }

    public async stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        console.log('[GatewayDaemon] Stopping Phantom Nexus...');

        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }

        for (const [name, adapter] of this.adapters) {
            try {
                await adapter.stop();
            } catch (e) {
                console.error(`[GatewayDaemon] Error stopping adapter ${name}:`, e);
            }
        }
    }
}

// Singleton for easy import
let daemonInstance: GatewayDaemon | null = null;
export function getGatewayDaemon(): GatewayDaemon {
    if (!daemonInstance) {
        daemonInstance = new GatewayDaemon();
    }
    return daemonInstance;
}
