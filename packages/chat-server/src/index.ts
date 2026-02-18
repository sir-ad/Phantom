import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { startTelegramBot } from './telegram.js';
import { startDiscordBot } from './discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
const rootEnvPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: rootEnvPath });

console.log('Starting Chat Servers...');

const start = async () => {
    await startTelegramBot();
    await startDiscordBot();
};

start().catch(console.error);


// Enable graceful stop
process.once('SIGINT', () => {
    process.exit(0);
});
process.once('SIGTERM', () => {
    process.exit(0);
});


