export interface ChannelMessage {
    id: string;
    senderId: string;
    senderName: string;
    channelId: string;
    text: string;
    timestamp: string;
    attachments?: string[];
}

export type MessageHandler = (message: ChannelMessage, adapter: BaseChannelAdapter) => Promise<void>;

export abstract class BaseChannelAdapter {
    protected name: string;
    protected handler?: MessageHandler;

    constructor(name: string) {
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    onMessage(handler: MessageHandler): void {
        this.handler = handler;
    }

    abstract start(): Promise<void>;
    abstract stop(): Promise<void>;
    abstract sendMessage(channelId: string, text: string): Promise<void>;
    abstract askForApproval(channelId: string, actionDetails: string): Promise<boolean>;
}
