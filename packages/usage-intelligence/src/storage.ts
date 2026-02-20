import Database from 'better-sqlite3';
import { UsageEvent, DailyMetric } from './types.js';

export class UsageStorage {
    private db: Database.Database;

    constructor(dbPath: string = 'phantom.db') {
        this.db = new Database(dbPath);
        this.init();
    }

    private init() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS usage_events (
        id TEXT PRIMARY KEY,
        event_name TEXT NOT NULL,
        user_id TEXT,
        timestamp TEXT NOT NULL,
        properties TEXT,
        context TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS daily_metrics (
        date TEXT NOT NULL,
        metric_name TEXT NOT NULL,
        value REAL NOT NULL,
        dimensions TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (date, metric_name, dimensions)
      );
    `);
    }

    saveEvent(event: UsageEvent): void {
        const stmt = this.db.prepare(`
      INSERT INTO usage_events (id, event_name, user_id, timestamp, properties, context)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            event.id,
            event.event_name,
            event.user_id,
            event.timestamp,
            JSON.stringify(event.properties || {}),
            JSON.stringify(event.context || {})
        );
    }

    saveMetric(metric: DailyMetric): void {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO daily_metrics (date, metric_name, value, dimensions)
      VALUES (?, ?, ?, ?)
    `);

        stmt.run(
            metric.date,
            metric.metric_name,
            metric.value,
            JSON.stringify(metric.dimensions || {})
        );
    }

    getEvents(filter?: { name?: string; from?: string; to?: string }): UsageEvent[] {
        let query = 'SELECT * FROM usage_events WHERE 1=1';
        const params: any[] = [];

        if (filter?.name) {
            query += ' AND event_name = ?';
            params.push(filter.name);
        }
        if (filter?.from) {
            query += ' AND timestamp >= ?';
            params.push(filter.from);
        }
        if (filter?.to) {
            query += ' AND timestamp <= ?';
            params.push(filter.to);
        }

        query += ' ORDER BY timestamp DESC';

        const rows = this.db.prepare(query).all(...params) as any[];
        return rows.map(row => ({
            id: row.id,
            event_name: row.event_name,
            user_id: row.user_id,
            timestamp: row.timestamp,
            properties: JSON.parse(row.properties),
            context: JSON.parse(row.context)
        }));
    }

    getMetrics(metricName: string, fromDate: string): DailyMetric[] {
        const rows = this.db.prepare(`
      SELECT * FROM daily_metrics 
      WHERE metric_name = ? AND date >= ?
      ORDER BY date ASC
    `).all(metricName, fromDate) as any[];

        return rows.map(row => ({
            date: row.date,
            metric_name: row.metric_name,
            value: row.value,
            dimensions: JSON.parse(row.dimensions)
        }));
    }
}
