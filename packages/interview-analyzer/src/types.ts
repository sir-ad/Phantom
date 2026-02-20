export interface InterviewInput {
    transcript: string;        // Text or audio→text
    metadata: {
        interviewee: string;
        date: string;
        product_area?: string;
    };
}

export interface InterviewInsights {
    id: string;
    summary: string;
    pain_points: Array<{
        description: string;
        severity: number; // 1-10
        frequency: number;      // Mentions across interviews
        quotes: string[];
    }>;
    jobs_to_be_done: Array<{
        job: string;
        importance: number; // 1-10
        satisfaction: number;     // 1-10
        opportunity_score: number; // importance × (1 - satisfaction)
    }>;
    themes: Array<{
        name: string;
        mentions: number;
        related_pain_points: string[];
    }>;
    quotes: Array<{
        text: string;
        context: string;
        category: string;
    }>;
}

export interface AnalyzerConfig {
    model?: string;
    language?: string;
}
