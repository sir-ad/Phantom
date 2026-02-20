import { UsageStorage } from './storage.js';
import { UsageTracker } from './tracker.js';
import { UsageAggregator } from './aggregator.js';

export * from './types.js';
export * from './tracker.js';
export * from './storage.js';
export * from './aggregator.js';

export async function runUsageIntelligence(args: Record<string, any>): Promise<any> {
    const command = args._?.[0];
    const storage = new UsageStorage();
    const tracker = new UsageTracker(storage);
    const aggregator = new UsageAggregator(storage);

    if (command === 'track') {
        const eventName = args.event || args._?.[1];
        if (!eventName) throw new Error('Event name is required');

        tracker.track({
            event_name: eventName,
            user_id: args.user || 'anonymous',
            properties: args.props ? JSON.parse(args.props) : {}
        });

        return { success: true, message: `Tracked event: ${eventName}` };
    }

    if (command === 'report') {
        // Mock functionality: trigger aggregation for today
        const today = new Date().toISOString().split('T')[0];
        aggregator.aggregateDailyActiveUsers(today);

        const metrics = storage.getMetrics('active_users', today);
        return {
            success: true,
            report: {
                date: today,
                metrics
            }
        };
    }

    throw new Error(`Unknown command: ${command}`);
}
