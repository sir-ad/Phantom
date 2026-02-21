// PHANTOM CLI - Server & Gateway Master Control

import { Command } from 'commander';
import { Box, Text, Newline } from 'ink';
import express from 'express';
import open from 'open';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { BRAND, getMemoryManager, getAIManager, getContextEngine, getExternalLinkManager } from '@phantom-pm/core';
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

            // Register External Link Adapters (Phase 3)
            modulesPkg.registerAllAdapters();

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

            app.get('/api/models/ollama', async (req, res) => {
                try {
                    const response = await fetch('http://localhost:11434/api/tags');
                    if (!response.ok) throw new Error('Ollama not responding');
                    const data = await response.json() as any;
                    const models = data.models?.map((m: any) => m.name) || [];
                    res.json({ models });
                } catch (error: any) {
                    res.status(503).json({ error: 'Ollama is not running locally', models: [] });
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

            // --- Context Management API ---

            app.get('/api/context/list', async (req, res) => {
                try {
                    const manager = await getMemoryManager();
                    const indexStr = await manager.readEntry('context_index.json');
                    res.json(indexStr ? JSON.parse(indexStr.content) : []);
                } catch (error: any) {
                    res.status(500).json({ error: error.message });
                }
            });

            app.post('/api/context/add', async (req, res) => {
                try {
                    let { type, name, content } = req.body;

                    // URL Handling (Phase 3)
                    if (content.startsWith('http')) {
                        const linkManager = getExternalLinkManager();
                        const linkContent = await linkManager.fetch(content);
                        name = name || linkContent.title;
                        content = linkContent.content;
                        // Map external type to context type
                        type = linkContent.type === 'figma' ? 'figma' : (type || 'web');
                    }

                    if (!type || !name || !content) {
                        return res.status(400).json({ error: 'Type, name, and content required' });
                    }

                    const manager = await getMemoryManager();
                    const engine = getContextEngine();
                    const id = uuidv4();

                    // Save content as a separate file
                    await manager.writeEntry(`context/${id}.txt`, content);

                    // Update index
                    const indexStr = await manager.readEntry('context_index.json');
                    const index = indexStr ? JSON.parse(indexStr.content) : [];

                    const newItem = {
                        id,
                        name,
                        type,
                        status: 'indexed',
                        tokenCount: Math.ceil(content.length / 4), // Rough token estimation
                        active: true,
                        createdAt: new Date().toISOString()
                    };

                    index.push(newItem);
                    await manager.writeEntry('context_index.json', JSON.stringify(index, null, 2));

                    // Trigger background indexing (Phase 2 RAG)
                    engine.indexContextItem(id, name, type, content).catch(err => {
                        console.error(`Failed to index context item ${id}:`, err);
                    });

                    res.json({ success: true, item: newItem });
                } catch (error: any) {
                    res.status(500).json({ error: error.message });
                }
            });

            app.post('/api/context/toggle', async (req, res) => {
                try {
                    const { id, active } = req.body;
                    if (!id) return res.status(400).json({ error: 'ID required' });

                    const manager = await getMemoryManager();
                    const indexStr = await manager.readEntry('context_index.json');
                    if (!indexStr) return res.status(404).json({ error: 'Index not found' });

                    const index = JSON.parse(indexStr.content);
                    const item = index.find((i: any) => i.id === id);
                    if (!item) return res.status(404).json({ error: 'Item not found' });

                    item.active = !!active;
                    await manager.writeEntry('context_index.json', JSON.stringify(index, null, 2));

                    res.json({ success: true, item });
                } catch (error: any) {
                    res.status(500).json({ error: error.message });
                }
            });

            app.delete('/api/context/:id', async (req, res) => {
                try {
                    const { id } = req.params;
                    const manager = await getMemoryManager();

                    // Update index
                    const indexStr = await manager.readEntry('context_index.json');
                    if (!indexStr) return res.status(404).json({ error: 'Index not found' });

                    let index = JSON.parse(indexStr.content);
                    index = index.filter((i: any) => i.id !== id);
                    await manager.writeEntry('context_index.json', JSON.stringify(index, null, 2));

                    // Delete content file (MemoryManager doesn't have delete, so we write empty or just let it be)
                    // For MVP, we just remove from index.

                    res.json({ success: true });
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
