import { Synthesizer } from './synthesizer.js';
import { DiscoveryStorage } from './storage.js';

export * from './types.js';
export * from './scorer.js';
export * from './storage.js';
export * from './synthesizer.js';

export async function runDiscoveryLoop(args: Record<string, any>): Promise<any> {
    const command = args._?.[0] || 'list';

    if (command === 'run' || command === 'synthesize') {
        console.log('Running Discovery Loop synthesis...');
        const synthesizer = new Synthesizer();
        const opportunities = await synthesizer.synthesize();

        if (opportunities.length > 0) {
            const storage = new DiscoveryStorage();
            opportunities.forEach(opp => storage.saveOpportunity(opp));
            console.log(`Generated ${opportunities.length} opportunities.`);
        }

        return {
            success: true,
            opportunities
        };
    }

    if (command === 'list') {
        const storage = new DiscoveryStorage();
        const opportunities = storage.getAllOpportunities();
        return {
            success: true,
            opportunities
        };
    }

    throw new Error(`Unknown command: ${command}`);
}
