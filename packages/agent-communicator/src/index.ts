import { IntentRouter } from './router.js';
import { Executor } from './executor.js';

export * from './types.js';
export * from './router.js';
export * from './executor.js';

export async function runAgentCommunicator(args: Record<string, any>, modulesPkg: any): Promise<any> {
    const command = args._?.[0];

    if (command === 'chat') {
        const query = args.query || args._?.[1];
        if (!query) {
            throw new Error('Query is required for chat');
        }

        console.log(`Agent received: "${query}"`);

        const router = new IntentRouter();
        const intent = await router.route(query);

        console.log(`Identified intent: ${intent.category} -> ${intent.targetModule} :: ${intent.action}`);

        const executor = new Executor(modulesPkg);
        const result = await executor.execute(intent);

        return {
            success: true,
            intent,
            result
        };
    }

    throw new Error(`Unknown agent command: ${command}`);
}
