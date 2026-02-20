import Database from 'better-sqlite3';
import { Opportunity } from './types.js';

export class DiscoveryStorage {
    private db: Database.Database;

    constructor(dbPath: string = 'phantom.db') {
        this.db = new Database(dbPath);
        this.init();
    }

    private init() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        score REAL,
        framework TEXT,
        components TEXT, -- JSON
        sources TEXT, -- JSON
        status TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    }

    saveOpportunity(opp: Opportunity): void {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO opportunities (id, title, description, score, framework, components, sources, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            opp.id,
            opp.title,
            opp.description,
            opp.score,
            opp.framework,
            JSON.stringify(opp.components),
            JSON.stringify(opp.sources),
            opp.status
        );
    }

    getAllOpportunities(): Opportunity[] {
        const rows = this.db.prepare('SELECT * FROM opportunities ORDER BY score DESC').all() as any[];
        return rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            score: row.score,
            framework: row.framework,
            components: JSON.parse(row.components),
            sources: JSON.parse(row.sources),
            status: row.status,
            created_at: row.created_at
        }));
    }
}
