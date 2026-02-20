// PHANTOM Core: OS-Claws Gateway
// The central hub that accepts connections from lightweight Edge Nodes (like os-agent)

import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';

export interface OSNode {
    id: string;
    capabilities: string[];
    ws: WebSocket;
}

export class OSGateway extends EventEmitter {
    private wss: WebSocketServer | null = null;
    private nodes: Map<string, OSNode> = new Map();
    private pendingRequests: Map<string, { resolve: (val: any) => void; reject: (err: Error) => void; timer: NodeJS.Timeout }> = new Map();

    constructor(private port: number = 8080) {
        super();
    }

    public start() {
        if (this.wss) return;

        this.wss = new WebSocketServer({ port: this.port });

        this.wss.on('connection', (ws: WebSocket) => {
            console.log(`[OS-Gateway] New connection established.`);

            let nodeId: string | null = null;

            ws.on('message', (message: string) => {
                try {
                    const data = JSON.parse(message.toString());

                    if (data.type === 'register') {
                        nodeId = data.payload.nodeName || `node-${Date.now()}`;
                        this.nodes.set(nodeId!, {
                            id: nodeId!,
                            capabilities: data.payload.capabilities || [],
                            ws
                        });
                        console.log(`[OS-Gateway] Registered Edge Node: ${nodeId}`);
                        this.emit('node_registered', this.nodes.get(nodeId!));
                    }

                    else if (data.type === 'response') {
                        const pending = this.pendingRequests.get(data.replyTo);
                        if (pending) {
                            clearTimeout(pending.timer);
                            pending.resolve(data.payload);
                            this.pendingRequests.delete(data.replyTo);
                        }
                    }
                } catch (error) {
                    console.error('[OS-Gateway] Failed to parse message', error);
                }
            });

            ws.on('close', () => {
                if (nodeId) {
                    console.log(`[OS-Gateway] Edge Node disconnected: ${nodeId}`);
                    this.nodes.delete(nodeId);
                    this.emit('node_disconnected', nodeId);
                }
            });
        });

        console.log(`[OS-Gateway] Listening for Edge Nodes on ws://localhost:${this.port}`);
    }

    public stop() {
        if (this.wss) {
            this.wss.close();
            this.wss = null;
        }
    }

    public async executeCommand(commandType: string, payload: any = {}): Promise<any> {
        // Find a node that supports this capability
        const node = Array.from(this.nodes.values()).find(n => n.capabilities.includes(commandType) || n.capabilities.includes('bash'));

        if (!node) {
            throw new Error(`[OS-Gateway] No available edge nodes found with capability: ${commandType}`);
        }

        const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error(`[OS-Gateway] OS Command Timeout: ${commandType}`));
            }, 30000); // 30s timeout

            this.pendingRequests.set(requestId, { resolve, reject, timer });

            node.ws.send(JSON.stringify({
                id: requestId,
                type: commandType,
                payload
            }));
        });
    }

    public getConnectedNodes(): OSNode[] {
        return Array.from(this.nodes.values());
    }
}

let instance: OSGateway | null = null;
export function getOSGateway(): OSGateway {
    if (!instance) {
        instance = new OSGateway();
    }
    return instance;
}
