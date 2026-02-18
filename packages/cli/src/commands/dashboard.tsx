import React, { useEffect, useState } from 'react';
import { Box, Text, Newline } from 'ink';
import express from 'express';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';
import { BRAND } from '@phantom-pm/core';
import Spinner from 'ink-spinner';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BoxAny = Box as any;

export function Dashboard({ port: initialPort = 3333 }: { port?: number }) {
    const [status, setStatus] = useState<'starting' | 'running' | 'error'>('starting');
    const [port, setPort] = useState(initialPort);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const startServer = async () => {
            try {
                const app = express();
                // Resolve path relative to where CLI is built/run
                // packages/cli/dist/commands/dashboard.js -> packages/dashboard/dist
                // Adjusting path resolution to be more robust
                const distPath = path.resolve(__dirname, '../../../dashboard/dist');

                app.use(express.static(distPath));

                app.get('/api/config', (req, res) => {
                    res.json({
                        brand: BRAND,
                        system: {
                            version: '1.0.1',
                            status: 'online',
                            mcp: 'enabled'
                        }
                    });
                });

                app.get(/.*/, (req, res) => {
                    res.sendFile(path.join(distPath, 'index.html'));
                });

                app.listen(port, () => {
                    setStatus('running');
                    open(`http://localhost:${port}`);
                });

            } catch (err) {
                setStatus('error');
                setError(String(err));
            }
        };

        startServer();
    }, [port]);

    if (status === 'error') {
        return (
            <BoxAny flexDirection="column" padding={1} borderStyle="round" borderColor="red">
                <Text color="red" bold>Dashboard Error</Text>
                <Text>{error}</Text>
            </BoxAny>
        );
    }

    if (status === 'starting') {
        return (
            <BoxAny padding={1}>
                <Text color="green">
                    <Spinner type="dots" /> Starting local dashboard...
                </Text>
            </BoxAny>
        );
    }

    return (
        <BoxAny flexDirection="column" padding={1} borderStyle="round" borderColor="green">
            <Text bold color="green">PHANTOM DASHBOARD ONLINE</Text>
            <Newline />
            <Text>Localhost: <Text color="cyan" underline>http://localhost:{port}</Text></Text>
            <Newline />
            <Text color="gray">Press Ctrl+C to stop.</Text>
            <Newline />
            <Text color="gray" dimColor>Dashboard source: {path.resolve(__dirname, '../../../packages/dashboard/dist')}</Text>
        </BoxAny>
    );
}
