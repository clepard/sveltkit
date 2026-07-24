import { mkdirSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const production = process.env.NODE_ENV === 'production';
const databasePath = path.resolve(process.env.DATABASE_PATH ?? (production ? '/var/lib/client-website/database/website.sqlite' : './data/website.sqlite'));
mkdirSync(path.dirname(databasePath), { recursive: true, mode: 0o750 });
const sqlite = new Database(databasePath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('busy_timeout = 5000');
sqlite.pragma('foreign_keys = ON');
migrate(drizzle(sqlite), { migrationsFolder: './drizzle' });
sqlite.close();
console.log(`Migrations applied to ${databasePath}`);
