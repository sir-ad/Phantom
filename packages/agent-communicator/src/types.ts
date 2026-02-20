export interface AgentMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AgentContext {
    history: AgentMessage[];
    currentModule?: string;
}

export interface AgentResponse {
    message: string;
    action?: {
        module: string;
        command: string;
        args: Record<string, any>;
    };
    data?: any;
}

export interface Intent {
    category: 'query' | 'command' | 'clarification' | 'unknown';
    targetModule?: 'interview' | 'feedback' | 'usage' | 'discovery';
    action?: string;
    parameters?: Record<string, any>;
    confidence: number;
}
