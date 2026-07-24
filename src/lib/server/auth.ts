import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from '$lib/server/db';
import { schema } from '$lib/server/db/schema';
const production = process.env.NODE_ENV === 'production';
export const auth = betterAuth({
	appName: 'Client Website Editor', baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:5173', secret: process.env.BETTER_AUTH_SECRET ?? 'development-only-change-me-development-only',
	database: drizzleAdapter(db, { provider: 'sqlite', schema }),
	emailAndPassword: { enabled: true, disableSignUp: process.env.ALLOW_SEED_SIGNUP !== 'true', minPasswordLength: 5 },
	session: { expiresIn: 60 * 60 * 12, updateAge: 60 * 60 },
	advanced: { useSecureCookies: production, database: { generateId: ({ model }) => model === 'user' && process.env.ALLOW_SEED_SIGNUP === 'true' ? 'admin' : crypto.randomUUID() } }
});
