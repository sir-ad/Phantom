// PHANTOM CLI - Server & Gateway Master Control

import { Command } from 'commander';
import { Box, Text, Newline } from 'ink';
import express from 'express';
import open from 'open';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import os from 'os';
import { BRAND, getMemoryManager, getAIManager } from '@phantom-pm/core';
import { runAgentCommunicator } from '@phantom-pm/modules';
import * as modulesPkg from '@phantom-pm/modules';

export function registerServerCommands(program: Command) {
    program
        .command('server')
        .description('Boot the Phantom OS Server & Web UI')
        .option('-p, --port <number>', 'Port to run the UI server on', '3333')
        .action(async (options) => {
            console.log(BRAND);
            console.log('🎭 Booting Phantom OS Gateway Server...');

            const app = express();
            app.use(express.json());

            // 1. Resolve UI Directory
            const phantomDir = path.join(os.homedir(), '.phantom', 'web');
            if (!fs.existsSync(phantomDir)) {
                console.error('❌ Web UI not found. Please run "phantom boot" first to download the latest interface.');
                process.exit(1);
            }

            console.log(`✓ Hosting static UI from: ${phantomDir}`);
            app.use(express.static(phantomDir));

            // 2. Map API Routes (Replicating the old Next.js Backend)
            const CONFIG_PATH = path.join(os.homedir(), '.phantom', 'config.json');

            app.get('/api/config', async (req, res) => {
                try {
                    const config = await fsPromises.readFile(CONFIG_PATH, 'utf-8').catch(() => '{}');
                    res.json(JSON.parse(config));
                } catch {
                    res.json({
                        brand: BRAND,
                        system: {
                            version: '3.0.0',
                            status: 'online',
                            mode: 'desktop-gateway'
                        }
                    });
                }
            });

            app.post('/api/config', async (req, res) => {
                try {
                    const config = req.body;
                    await fsPromises.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
                    // Since AIManager is a singleton, we clear it and let the next access recreate it from config 
                    // However, getAIManager doesn't have a reload. Wait, let's look at getAIManager().close().
                    await getAIManager().close();

                    // Note: Since `getAIManager` caches the instance locally in process:
                    // we'll need a reload method.

                    res.json({ success: true });
                } catch (error: any) {
                    res.status(500).json({ error: error.message });
                }
            });

            // Memory Endpoint GET
            app.get('/api/memory', async (req, res) => {
                try {
                    const manager = await getMemoryManager();
                    const files = await manager.listEntries();
                    res.json({ files });
                } catch (error: any) {
                    res.status(500).json({ error: error.message });
                }
            });

            // Memory Endpoint POST
            app.post('/api/memory', async (req, res) => {
                try {
                    const { filename, content } = req.body;
                    if (!filename || !content) {
                        return res.status(400).json({ error: 'Filename and content required' });
                    }
                    const manager = await getMemoryManager();
                    await manager.writeEntry(filename, content);
                    res.json({ success: true, filename });
                } catch (error: any) {
                    res.status(500).json({ error: error.message });
                }
            });

            // Chat/Agent Endpoint
            app.post('/api/chat', async (req, res) => {
                try {
                    const { message } = req.body;
                    if (!message) {
                        return res.status(400).json({ error: 'Message is required' });
                    }
                    console.log(`[API] Agent query: ${message}`);
                    const result = await runAgentCommunicator(
                        { _: ['chat'], query: message },
                        modulesPkg
                    );
                    res.json(result);
                } catch (error: any) {
                    console.error('[API] Agent error:', error);
                    res.status(500).json({ error: error.message || 'Internal Server Error' });
                }
            });

            // 3. Fallback Route for Next.js Hash Routing
            app.get(/.*/, (req, res) => {
                res.sendFile(path.join(phantomDir, 'index.html'));
            });

            // 4. Start Server
            const port = parseInt(options.port, 10);
            app.listen(port, () => {
                console.log(`\n✅ Phantom OS Matrix UI Online: http://localhost:${port}`);
                console.log(`Press Ctrl+C to terminate the OS gateway.\n`);
                open(`http://localhost:${port}`);
            });
        });
}
