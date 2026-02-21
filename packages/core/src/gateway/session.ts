import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { AgentSwarm } from '../agents/Swarm.js';
import { BaseChannelAdapter, ChannelMessage } from './adapters/BaseAdapter.js';

export interface SessionContext {
    id: string; // e.g. "telegram_12345"
    platform: string;
    externalUserId: string;
    activeProject?: string;
    memories: string[];
    lastActive: string;
}

export class SessionManager {
    private sessionsPath: string;
    private memoryMap: Map<string, SessionContext> = new Map();
    private swarmInstances: Map<string, AgentSwarm> = new Map();

    constructor() {
        this.sessionsPath = join(process.env.PHANTOM_HOME || join(homedir(), '.phantom'), 'sessions');
        if (!existsSync(this.sessionsPath)) {
            mkdirSync(this.sessionsPath, { recursive: true });
        }
    }

    public getSession(platform: string, externalUserId: string): SessionContext {
        const id = `${platform}_${externalUserId}`;
        if (this.memoryMap.has(id)) {
            return this.memoryMap.get(id)!;
        }

        const sessionFile = join(this.sessionsPath, `${id}.json`);
        if (existsSync(sessionFile)) {
            try {
                const data = JSON.parse(readFileSync(sessionFile, 'utf-8'));
                this.memoryMap.set(id, data);
                return data;
            } catch (e) {
                console.warn(`[SessionManager] Failed to load session ${id}`, e);
            }
        }

        const newSession: SessionContext = {
            id,
            platform,
            externalUserId,
            memories: [],
            lastActive: new Date().toISOString()
        };

        this.saveSession(newSession);
        return newSession;
    }

    public saveSession(session: SessionContext) {
        session.lastActive = new Date().toISOString();
        this.memoryMap.set(session.id, session);
        writeFileSync(join(this.sessionsPath, `${session.id}.json`), JSON.stringify(session, null, 2));
    }

    public getSwarmForSession(session: SessionContext): AgentSwarm {
        if (this.swarmInstances.has(session.id)) {
            return this.swarmInstances.get(session.id)!;
        }

        // Isolate agent swarm instance per user chat session
        const swarm = new AgentSwarm();
        this.swarmInstances.set(session.id, swarm);
        return swarm;
    }

    public async handleIncomingMessage(message: ChannelMessage, adapter: BaseChannelAdapter) {
        const session = this.getSession(adapter.getName(), message.senderId);
        session.memories.push(`[${message.timestamp}] User: ${message.text}`);
        this.saveSession(session);

        const swarm = this.getSwarmForSession(session);

        try {
            console.log(`[SessionManager] Routing message from ${session.id} to Swarm...`);
            // Currently triggering default swarm. In the future this will be routed via the LLM context.
            const result = await swarm.runSwarm(message.text);

            // Structure the reply
            let reply = `[Phantom Response]\n${result.recommendation}`;
            if (result.evidence && result.evidence.length > 0) {
                reply += `\n\nEvidence: ${result.evidence.join(', ')}`;
            }

            session.memories.push(`[${new Date().toISOString()}] Phantom: ${reply}`);
            this.saveSession(session);

            await adapter.sendMessage(message.channelId, reply);
        } catch (err: any) {
            console.error(`[SessionManager] Swarm Error for ${session.id}:`, err);
            await adapter.sendMessage(message.channelId, `[Error] The Phantom Nexus encountered an issue processing your request: ${err.message}`);
        }
    }
}
