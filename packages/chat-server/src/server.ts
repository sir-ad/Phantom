import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { OracleAgent } from '@phantom-pm/core';

export const startServer = async (port: number = 3000) => {
    const app = express();
    const oracle = new OracleAgent();

    app.use(cors());
    app.use(bodyParser.json());

    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: Date.now() });
    });

    app.post('/analyze-context', async (req, res) => {
        const { role, text, source } = req.body;
        console.log(`[Phantom Oracle] Received context from ${source}:`, { role, text: text?.substring(0, 50) + '...' });

        try {
            const calibration = await oracle.calibrate(text || '');
            res.json({ quote: calibration });
        } catch (error) {
            console.error('[Phantom Oracle] Calibration failed:', error);
            res.status(500).json({ error: 'Calibration failed' });
        }
    });

    return new Promise<void>((resolve) => {
        app.listen(port, () => {
            console.log(`Phantom Chat Server (HTTP) running on port ${port}`);
            resolve();
        });
    });
};
