import { mkdir, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import Database from 'better-sqlite3';

const production = process.env.NODE_ENV === 'production';
const databasePath = path.resolve(process.env.DATABASE_PATH ?? (production ? '/var/lib/client-website/database/website.sqlite' : './data/website.sqlite'));
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? (production ? '/var/lib/client-website/uploads' : './data/uploads'));
const backupDir = path.resolve(process.env.BACKUP_DIR ?? (production ? '/var/backups/client-website' : './backups'));
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
await mkdir(backupDir, { recursive: true, mode: 0o750 });
await mkdir(uploadDir, { recursive: true, mode: 0o750 });

const databaseFinal = path.join(backupDir, `website-${stamp}.sqlite`);
const databaseTemp = `${databaseFinal}.tmp`;
const sqlite = new Database(databasePath, { readonly: true, fileMustExist: true });
sqlite.pragma('busy_timeout = 5000');
await sqlite.backup(databaseTemp);
sqlite.close();
await rename(databaseTemp, databaseFinal);

const uploadsFinal = path.join(backupDir, `uploads-${stamp}.tar.gz`);
const uploadsTemp = `${uploadsFinal}.tmp`;
const tar = spawnSync('tar', ['--exclude=*.tmp', '-C', path.dirname(uploadDir), '-czf', uploadsTemp, path.basename(uploadDir)], { stdio: 'inherit' });
if (tar.status !== 0) { await rm(uploadsTemp, { force: true }); throw new Error('Upload archive failed'); }
await rename(uploadsTemp, uploadsFinal);

const cutoff = Date.now() - Number(process.env.BACKUP_RETENTION_DAYS ?? 14) * 86_400_000;
for (const name of await readdir(backupDir)) {
	if (!/^(website-.*\.sqlite|uploads-.*\.tar\.gz)$/.test(name)) continue;
	const match = name.match(/^(?:website|uploads)-(\d{4}-\d{2}-\d{2})T/);
	if (match && new Date(`${match[1]}T00:00:00Z`).getTime() < cutoff) await rm(path.join(backupDir, name), { force: true });
}
console.log(`Backup complete: ${databaseFinal} and ${uploadsFinal}`);
