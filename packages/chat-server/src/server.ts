import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

export const startServer = async (port: number = 3000) => {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());

    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: Date.now() });
    });

    app.post('/analyze-context', async (req, res) => {
        const { role, text, source } = req.body;
        console.log(`[Phantom Oracle] Received context from ${source}:`, { role, text: text?.substring(0, 50) + '...' });

        // TODO: Integrate AgentSwarm to analyze and generate quote
        // For now, return a placeholder or random quote logic if we want to move it here
        // actually, the extension has default quotes. 
        // We can override them here.

        const quote = {
            text: "The art of coding is the art of thinking clearly.",
            author: "Phantom Philosopher",
            topic: "Clarity"
        };

        res.json({ quote });
    });

    return new Promise<void>((resolve) => {
        app.listen(port, () => {
            console.log(`Phantom Chat Server (HTTP) running on port ${port}`);
            resolve();
        });
    });
};
