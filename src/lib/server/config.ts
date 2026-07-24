import path from 'node:path';
// Adapter-node imports server modules while analysing a build. Do not require runtime
// secrets or touch /var/lib during that analysis phase.
const buildPhase = process.env.npm_lifecycle_event === 'build';
const production = process.env.NODE_ENV === 'production' && !buildPhase;
export const databasePath = path.resolve(process.env.DATABASE_PATH ?? (production ? '/var/lib/client-website/database/website.sqlite' : './data/website.sqlite'));
export const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? (production ? '/var/lib/client-website/uploads' : './data/uploads'));
export function assertProductionConfig() {
	if (!production) return;
	if (!databasePath.startsWith('/var/lib/client-website/database/')) throw new Error('Production DATABASE_PATH must be below /var/lib/client-website/database');
	if (!uploadDir.startsWith('/var/lib/client-website/uploads')) throw new Error('Production UPLOAD_DIR must be /var/lib/client-website/uploads');
	if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.includes('development-only')) throw new Error('Set a strong BETTER_AUTH_SECRET in production');
}
