import { UsageEvent } from './types.js';
import { UsageStorage } from './storage.js';

export class UsageTracker {
    constructor(private storage: UsageStorage) { }

    track(event: Omit<UsageEvent, 'id' | 'timestamp'> & { timestamp?: string }): void {
        const completeEvent: UsageEvent = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: event.timestamp || new Date().toISOString(),
            ...event
        };

        // Basic validation
        if (!completeEvent.event_name) {
            throw new Error('Event name is required');
        }

        this.storage.saveEvent(completeEvent);
    }
}
