import { Intent } from './types.js';
import { BUILTIN_MODULES } from '@phantom-pm/core';

export class Executor {
    constructor(private modules: any) { }

    async execute(intent: Intent): Promise<any> {
        if (intent.confidence < 0.7) {
            return { message: "I'm not sure what you mean. Could you clarify?" };
        }

        try {
            // dynamic dispatch mapping
            // In a real system, this would be even more generic, but this is a good step towards OCP.
            const dispatchMap: Record<string, Function> = {
                'interview': this.modules.runInterviewAnalyzer,
                'feedback': this.modules.runFeedbackHub,
                'usage': this.modules.runUsageIntelligence,
                'discovery': this.modules.runDiscoveryLoop
            };

            const runner = dispatchMap[intent.targetModule as string];

            if (runner) {
                // Map broad actions to specific CLI-like arguments
                // This logic could be pushed down to the modules themselves in a future refactor
                const args: Record<string, any> = { ...intent.parameters };

                // transform 'action' to cli command style
                if (intent.action) {
                    args._ = [intent.action];
                }

                return await runner(args);
            }

            return { message: `I understood you want to ${intent.action} in ${intent.targetModule}, but I can't do that yet.` };

        } catch (error: any) {
            return { message: `Error executing command: ${error.message}` };
        }
    }
}
