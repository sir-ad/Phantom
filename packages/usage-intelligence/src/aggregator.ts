import { UsageStorage } from './storage.js';
import { DailyMetric } from './types.js';

export class UsageAggregator {
    constructor(private storage: UsageStorage) { }

    aggregateDailyActiveUsers(date: string): void {
        // 1. Get unique users active on date
        // This is better done in SQL but keeping it simple/portable for now
        // Or we could run a raw SQL query if we wanted to be more efficient

        // Naive implementation fetching all events for day (optimization needed for scale)
        const events = this.storage.getEvents({
            from: `${date}T00:00:00.000Z`,
            to: `${date}T23:59:59.999Z`
        });

        const uniqueUsers = new Set(
            events.filter(e => e.user_id).map(e => e.user_id)
        );

        const metric: DailyMetric = {
            date,
            metric_name: 'active_users',
            value: uniqueUsers.size,
            dimensions: { type: 'daily' }
        };

        this.storage.saveMetric(metric);
    }

    // TODO: Add computeRetention()
    // TODO: Add computeFeatureUsage()
}
