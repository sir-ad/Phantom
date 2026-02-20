import Database from 'better-sqlite3';
import { FeedbackItem, FeedbackTheme } from './types.js';

export class FeedbackStorage {
    private db: Database.Database;

    constructor(dbPath: string = 'phantom.db') {
        this.db = new Database(dbPath);
        this.init();
    }

    private init() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS feedback_items (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT,
        timestamp TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS feedback_themes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        sentiment REAL,
        frequency INTEGER,
        sources TEXT, -- JSON array
        related_feedback_ids TEXT, -- JSON array
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    }

    saveFeedback(items: FeedbackItem[]): void {
        const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO feedback_items (id, source, content, author, timestamp, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        const tx = this.db.transaction((items: FeedbackItem[]) => {
            for (const item of items) {
                stmt.run(
                    item.id,
                    item.source,
                    item.content,
                    item.author,
                    item.timestamp,
                    JSON.stringify(item.metadata || {})
                );
            }
        });

        tx(items);
    }

    saveThemes(themes: FeedbackTheme[]): void {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO feedback_themes (id, name, description, sentiment, frequency, sources, related_feedback_ids)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        const tx = this.db.transaction((themes: FeedbackTheme[]) => {
            for (const theme of themes) {
                stmt.run(
                    theme.id,
                    theme.name,
                    theme.description,
                    theme.sentiment,
                    theme.frequency,
                    JSON.stringify(theme.sources),
                    JSON.stringify(theme.related_feedback_ids)
                );
            }
        });

        tx(themes);
    }

    getAllFeedback(): FeedbackItem[] {
        const rows = this.db.prepare('SELECT * FROM feedback_items ORDER BY timestamp DESC').all() as any[];
        return rows.map(row => ({
            id: row.id,
            source: row.source,
            content: row.content,
            author: row.author,
            timestamp: row.timestamp,
            metadata: JSON.parse(row.metadata)
        }));
    }

    getAllThemes(): FeedbackTheme[] {
        const rows = this.db.prepare('SELECT * FROM feedback_themes ORDER BY frequency DESC').all() as any[];
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            sentiment: row.sentiment,
            frequency: row.frequency,
            sources: JSON.parse(row.sources),
            related_feedback_ids: JSON.parse(row.related_feedback_ids)
        }));
    }
}
