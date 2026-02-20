export interface Opportunity {
    id: string;
    title: string;
    description: string;
    score: number;
    framework: 'RICE' | 'ICE';
    components: {
        reach?: number;
        impact?: number;
        confidence?: number;
        effort?: number;
    };
    sources: {
        interview_ids?: string[];
        feedback_ids?: string[];
        usage_event_ids?: string[];
    };
    status: 'new' | 'investigating' | 'approved' | 'rejected';
    created_at: string;
}

export interface ScoringConfig {
    framework: 'RICE' | 'ICE';
    weights?: {
        reach?: number;
        impact?: number;
        confidence?: number;
        effort?: number;
    };
}
