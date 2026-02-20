import { Collector, FeedbackItem, FeedbackSource } from './types.js';

export class SlackCollector implements Collector {
    type: 'slack' = 'slack';

    constructor(private config: FeedbackSource['config']) { }

    validateConfig(): boolean {
        return !!this.config.channel_id; // Minimal validation
    }

    async collect(): Promise<FeedbackItem[]> {
        // TODO: Implement real Slack API client
        // For now, return mock data
        console.log(`Collecting feedback from Slack channel: ${this.config.channel_id}`);

        return [
            {
                id: `slack_${Date.now()}_1`,
                source: 'slack',
                content: "I wish I could export this report to PDF directly.",
                author: "@jane_doe",
                timestamp: new Date().toISOString(),
                metadata: { channel: this.config.channel_id }
            },
            {
                id: `slack_${Date.now()}_2`,
                source: 'slack',
                content: "The dark mode contrast is a bit too low on the dashboard.",
                author: "@dev_dave",
                timestamp: new Date().toISOString(),
                metadata: { channel: this.config.channel_id }
            }
        ];
    }
}

export class FeedbackCollectorFactory {
    static create(source: FeedbackSource): Collector {
        switch (source.type) {
            case 'slack':
                return new SlackCollector(source.config);
            default:
                throw new Error(`Unsupported collector type: ${source.type}`);
        }
    }
}
