import { z } from 'zod';

export interface AdapterConfig {
    id: string;
    type: 'slack' | 'discord' | 'linear' | 'cli' | 'whatsapp';
    enabled: boolean;
    credentials?: Record<string, string>;
}

export interface AdapterMessage {
    id: string;
    content: string;
    senderId: string;
    channelId: string;
    timestamp: number;
    metadata?: Record<string, any>;
    threadId?: string;
}

export interface AdapterResponse {
    content: string;
    channelId: string;
    threadId?: string;
    metadata?: Record<string, any>;
}

export abstract class BaseAdapter {
    protected config: AdapterConfig;

    constructor(config: AdapterConfig) {
        this.config = config;
    }

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract listen(callback: (message: AdapterMessage) => void): void;
    abstract send(response: AdapterResponse): Promise<void>;

    getId(): string {
        return this.config.id;
    }
}

export * from './slack.js';
export * from './cli.js';
