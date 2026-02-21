import { BaseChannelAdapter } from './BaseAdapter.js';
import { getConfig } from '../../config.js';

export class SlackAdapter extends BaseChannelAdapter {
    private botToken?: string;
    // NOTE: This is an architectural stub. For full implementation, install '@slack/bolt'

    constructor() {
        super('slack');
        const config = getConfig();
        this.botToken = config.getAPIKey('slack') || process.env.SLACK_BOT_TOKEN;
    }

    async start(): Promise<void> {
        if (!this.botToken) {
            console.warn('[SlackAdapter] No Slack token found in config. Skipping Slack initialization.');
            return;
        }
        console.log('[SlackAdapter] Connecting to Slack API...');
    }

    async stop(): Promise<void> {
        console.log('[SlackAdapter] Stopping Slack listener...');
    }

    async sendMessage(channelId: string, text: string): Promise<void> {
        if (!this.botToken) return;
        console.log(`[SlackAdapter] Sending to ${channelId}:`, text);
    }

    async askForApproval(channelId: string, actionDetails: string): Promise<boolean> {
        await this.sendMessage(channelId, `⚠️ *ACTION REQUIRED* ⚠️\nPhantom Nexus needs approval to run:\n\`\`\`\n${actionDetails}\n\`\`\`\nPlease reply with 'approve' or 'reject'`);
        return false;
    }
}
