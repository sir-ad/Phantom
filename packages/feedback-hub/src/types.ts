export type FeedbackSourceType = 'slack' | 'intercom' | 'zendesk' | 'linear' | 'github' | 'email';

export interface FeedbackSource {
    type: FeedbackSourceType;
    config: {
        api_key?: string;
        webhook_url?: string;
        channel_id?: string;
        [key: string]: any;
    };
}

export interface FeedbackItem {
    id: string;
    source: FeedbackSourceType;
    content: string;
    author?: string;
    timestamp: string;
    metadata?: Record<string, any>;
    embedding?: number[]; // For vector search later
}

export interface FeedbackTheme {
    id: string;
    name: string;
    description: string;
    sentiment: number;        // -1 to +1
    frequency: number;        // Total mentions
    sources: Array<{
        source: string;
        count: number;
    }>;
    related_feedback_ids: string[];
}

export interface Collector {
    type: FeedbackSourceType;
    collect(): Promise<FeedbackItem[]>;
    validateConfig(): boolean;
}
