import { FeedbackCollectorFactory } from './collector.js';
import { FeedbackStorage } from './storage.js';
import { FeedbackSource, FeedbackTheme } from './types.js';

export * from './types.js';
export * from './collector.js';
export * from './storage.js';

// Configuration for active collectors (could come from config file/DB)
const ACTIVE_SOURCES: FeedbackSource[] = [
    { type: 'slack', config: { channel_id: 'C123456' } }
];

export async function runFeedbackHub(args: Record<string, any>): Promise<any> {
    const command = args._?.[0] || 'sync';

    if (command === 'sync') {
        console.log('Syncing feedback from all sources...');

        const storage = new FeedbackStorage();
        let totalCollected = 0;

        for (const source of ACTIVE_SOURCES) {
            try {
                const collector = FeedbackCollectorFactory.create(source);
                const items = await collector.collect();
                storage.saveFeedback(items);
                totalCollected += items.length;
                console.log(`  - ${source.type}: Collected ${items.length} items`);
            } catch (err: any) {
                console.error(`  - ${source.type}: Failed to collect - ${err.message}`);
            }
        }

        return {
            success: true,
            message: `Sync complete. ${totalCollected} new items processed.`,
            stats: { totalCollected }
        };
    }

    if (command === 'themes') {
        const storage = new FeedbackStorage();
        // TODO: Implement AI theme extraction here (Processor)
        // For now, return stored themes (mock or empty)
        const themes = storage.getAllThemes();
        return {
            success: true,
            themes
        };
    }

    throw new Error(`Unknown command: ${command}`);
}
