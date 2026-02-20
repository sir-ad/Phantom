export interface UsageEvent {
    id: string;
    event_name: string;
    user_id?: string;
    timestamp: string;
    properties?: Record<string, any>;
    context?: {
        platform?: string;
        version?: string;
    };
}

export interface DailyMetric {
    date: string;
    metric_name: string;
    value: number;
    dimensions?: Record<string, string>;
}

export interface RetentionCohort {
    cohort_date: string;
    total_users: number;
    retention_days: Record<string, number>; // "1": 50, "7": 20 (percentages or counts)
}
