import Database from 'better-sqlite3';
import { join } from 'path';
import { InterviewInsights } from './types.js';

export class InterviewStorage {
    private db: Database.Database;

    constructor(dbPath: string = 'phantom.db') {
        this.db = new Database(dbPath);
        this.init();
    }

    private init() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS interviews (
        id TEXT PRIMARY KEY,
        summary TEXT,
        pain_points TEXT,
        jobs_to_be_done TEXT,
        themes TEXT,
        quotes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }

    save(insights: InterviewInsights): void {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO interviews (id, summary, pain_points, jobs_to_be_done, themes, quotes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            insights.id,
            insights.summary,
            JSON.stringify(insights.pain_points),
            JSON.stringify(insights.jobs_to_be_done),
            JSON.stringify(insights.themes),
            JSON.stringify(insights.quotes)
        );
    }

    get(id: string): InterviewInsights | null {
        const row = this.db.prepare('SELECT * FROM interviews WHERE id = ?').get(id) as any;
        if (!row) return null;

        return {
            id: row.id,
            summary: row.summary,
            pain_points: JSON.parse(row.pain_points),
            jobs_to_be_done: JSON.parse(row.jobs_to_be_done),
            themes: JSON.parse(row.themes),
            quotes: JSON.parse(row.quotes)
        };
    }

    getAll(): InterviewInsights[] {
        const rows = this.db.prepare('SELECT * FROM interviews ORDER BY created_at DESC').all() as any[];
        return rows.map(row => ({
            id: row.id,
            summary: row.summary,
            pain_points: JSON.parse(row.pain_points),
            jobs_to_be_done: JSON.parse(row.jobs_to_be_done),
            themes: JSON.parse(row.themes),
            quotes: JSON.parse(row.quotes)
        }));
    }
}
