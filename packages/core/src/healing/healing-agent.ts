import { InstallationHealer } from './installation-healer.js';
import { CodeHealer, CodeContext } from './code-healer.js';

export type ErrorType =
    | 'missing_dependency'
    | 'permission_error'
    | 'file_not_found'
    | 'network_error'
    | 'configuration_error'
    | 'runtime_error'
    | 'unknown_error';

export interface RecoveryAction {
    strategy: string;
    success: boolean;
    steps: StepResult[];
    timestamp: number;
}

export interface StepResult {
    step: string;
    success: boolean;
    error?: string;
    output?: any;
    fix?: any;
}

export interface FailureEvent {
    timestamp: number;
    error: Error;
    context?: any;
    stackTrace?: string;
}

export interface Experience {
    errorType: ErrorType;
    strategy: string;
    success: boolean;
    timestamp: number;
    context: any;
}

export interface RecoveryStrategy {
    name: string;
    successRate?: number;
    steps?: { action: string; params?: any }[];
}

export class EmotionalBank {
    private experiences: Experience[] = [];

    async appraise(event: FailureEvent, action: RecoveryAction): Promise<void> {
        const experience: Experience = {
            errorType: this.classifyError(event.error),
            strategy: action.strategy,
            success: action.success,
            timestamp: Date.now(),
            context: event.context
        };
        this.experiences.push(experience);
    }

    getStrategy(errorType: ErrorType): RecoveryStrategy | null {
        const relevant = this.experiences.filter(e => e.errorType === errorType);
        if (relevant.length === 0) return null;

        const strategies = new Map<string, { total: number; successes: number }>();
        for (const exp of relevant) {
            const current = strategies.get(exp.strategy) || { total: 0, successes: 0 };
            current.total++;
            if (exp.success) current.successes++;
            strategies.set(exp.strategy, current);
        }

        let bestStrategy: string | null = null;
        let bestRate = 0;

        for (const [strategy, stats] of strategies.entries()) {
            const rate = stats.successes / stats.total;
            if (rate > bestRate) {
                bestRate = rate;
                bestStrategy = strategy;
            }
        }

        return bestStrategy ? { name: bestStrategy, successRate: bestRate } : null;
    }

    private classifyError(error: Error): ErrorType {
        const msg = (error.message || '').toLowerCase();

        if (msg.includes('cannot find module') || msg.includes('module not found')) return 'missing_dependency';
        if (msg.includes('eacces') || msg.includes('permission denied')) return 'permission_error';
        if (msg.includes('enoent') || msg.includes('no such file')) return 'file_not_found';
        if (msg.includes('etimedout') || msg.includes('enotfound')) return 'network_error';
        if (msg.includes('config') || msg.includes('api key')) return 'configuration_error';
        if (msg.includes('typeerror') || msg.includes('referenceerror')) return 'runtime_error';

        return 'unknown_error';
    }
}

export class HealingAgent {
    private failureLog: FailureEvent[] = [];
    private emotionalBank: EmotionalBank;
    private installer: InstallationHealer;
    private coder: CodeHealer;

    constructor() {
        this.emotionalBank = new EmotionalBank();
        this.installer = new InstallationHealer();
        this.coder = new CodeHealer();
    }

    async onError(error: Error, codeContext?: CodeContext): Promise<RecoveryAction> {
        const event: FailureEvent = {
            timestamp: Date.now(),
            error,
            context: codeContext,
            stackTrace: error.stack
        };
        this.failureLog.push(event);

        const msg = error.message.toLowerCase();

        // Installation / Dependency Recovery
        if (msg.includes('module') || msg.includes('peer dep') || msg.includes('conflict') || msg.includes('integrity')) {
            const res = await this.installer.healInstallationError(error);
            const action: RecoveryAction = {
                strategy: 'install_healer',
                success: res.success,
                steps: [{ step: 'healing_install', success: res.success, error: res.error }],
                timestamp: Date.now()
            };
            await this.emotionalBank.appraise(event, action);
            return action;
        }

        // Runtime Code Recovery
        if ((msg.includes('typeerror') || msg.includes('referenceerror') || msg.includes('syntax')) && codeContext) {
            const res = await this.coder.healRuntimeError(error, codeContext);
            const action: RecoveryAction = {
                strategy: 'code_healer',
                success: res.success,
                steps: [{ step: 'healing_code', success: res.success, error: res.error }],
                timestamp: Date.now()
            };
            await this.emotionalBank.appraise(event, action);
            return action;
        }

        // Generic unmatched fallback
        console.warn(`[Healing] No automated strategy mapped for error type: ${error.message}`);
        return {
            strategy: 'fallback',
            success: false,
            steps: [],
            timestamp: Date.now()
        };
    }
}
