import { BaseChannelAdapter } from './BaseAdapter.js';
import { getConfig } from '../../config.js';

export class TelegramAdapter extends BaseChannelAdapter {
    private botToken?: string;
    // NOTE: This is an architectural stub. To run fully, we install 'grammy' and instantiate it here.

    constructor() {
        super('telegram');
        const config = getConfig();
        this.botToken = config.getAPIKey('telegram') || process.env.TELEGRAM_BOT_TOKEN;
    }

    async start(): Promise<void> {
        if (!this.botToken) {
            console.warn('[TelegramAdapter] No bot token found in config. Skipping Telegram initialization.');
            return;
        }
        console.log('[TelegramAdapter] Connecting to Telegram API...');

        // Example implementation once grammY is added:
        // this.bot = new Bot(this.botToken);
        // this.bot.on('message:text', async (ctx) => {
        //     if (this.handler) {
        //         await this.handler({
        //             id: ctx.message.message_id.toString(),
        //             senderId: ctx.from.id.toString(),
        //             senderName: ctx.from.username || ctx.from.first_name,
        //             channelId: ctx.chat.id.toString(),
        //             text: ctx.message.text,
        //             timestamp: new Date().toISOString()
        //         }, this);
        //     }
        // });
        // this.bot.start();
    }

    async stop(): Promise<void> {
        console.log('[TelegramAdapter] Stopping Telegram listener...');
    }

    async sendMessage(channelId: string, text: string): Promise<void> {
        if (!this.botToken) return;
        console.log(`[TelegramAdapter] Sending to ${channelId}:`, text);
        // await this.bot?.api.sendMessage(channelId, text);
    }

    async askForApproval(channelId: string, actionDetails: string): Promise<boolean> {
        await this.sendMessage(channelId, `⚠️ **ACTION REQUIRED** ⚠️\nPhantom Nexus needs approval to run:\n\`\`\`\n${actionDetails}\n\`\`\`\nReply with /approve or /reject`);
        return false; // Handled asynchronously by UI or SessionManager intercepting the reply
    }
}
