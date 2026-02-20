// PHANTOM OS-Agent Edge Node
// Connects to the Phantom Core Gateway to execute OS-level commands (OpenClaws pattern)

import WebSocket from 'ws';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GATEWAY_URL = process.env.PHANTOM_GATEWAY_URL || 'ws://localhost:8080/os-claws';
const NODE_NAME = process.env.NODE_NAME || `edge-node-${Math.random().toString(36).substring(7)}`;

console.log(`[OS-Agent] Starting Phantom Edge Node: ${NODE_NAME}`);
console.log(`[OS-Agent] Connecting to Gateway: ${GATEWAY_URL}`);

let ws: WebSocket;
let reconnectTimer: NodeJS.Timeout;

function connect() {
    ws = new WebSocket(GATEWAY_URL);

    ws.on('open', () => {
        console.log(`[OS-Agent] Connected to Gateway.`);
        // Identify self to gateway
        ws.send(JSON.stringify({
            type: 'register',
            payload: { nodeName: NODE_NAME, capabilities: ['screenshot', 'mouse', 'keyboard', 'bash'] }
        }));
    });

    ws.on('message', async (data) => {
        try {
            const msg = JSON.parse(data.toString());
            console.log(`[OS-Agent] Received command: ${msg.type}`);

            const response = await handleCommand(msg);

            if (response) {
                ws.send(JSON.stringify({
                    type: 'response',
                    replyTo: msg.id,
                    payload: response
                }));
            }
        } catch (err) {
            console.error(`[OS-Agent] Error processing message:`, err);
        }
    });

    ws.on('close', () => {
        console.log(`[OS-Agent] Disconnected from Gateway. Reconnecting in 5s...`);
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 5000);
    });

    ws.on('error', (err) => {
        console.error(`[OS-Agent] WebSocket Error:`, err.message);
        ws.close();
    });
}

async function handleCommand(msg: any): Promise<any> {
    switch (msg.type) {
        case 'ping':
            return { status: 'ok', timestamp: Date.now() };

        case 'bash':
            console.log(`[OS-Agent] Executing bash: ${msg.payload.command}`);
            try {
                const { stdout, stderr } = await execAsync(msg.payload.command);
                return { status: 'success', stdout, stderr };
            } catch (error: any) {
                return { status: 'error', error: error.message };
            }

        case 'screenshot':
            console.log(`[OS-Agent] Capturing screenshot...`);
            // Mock screenshot for now without nut.js
            return { status: 'success', imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==' };

        case 'mouse_move':
            console.log(`[OS-Agent] Moving mouse to X:${msg.payload.x}, Y:${msg.payload.y}`);
            return { status: 'success' };

        case 'type_text':
            console.log(`[OS-Agent] Typing text: ${msg.payload.text}`);
            return { status: 'success' };

        default:
            console.warn(`[OS-Agent] Unknown command type: ${msg.type}`);
            return { status: 'error', error: 'Unknown command type' };
    }
}

connect();
