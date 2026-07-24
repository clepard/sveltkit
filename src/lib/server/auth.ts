import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { createDb } from '$lib/server/db';
import { schema } from '$lib/server/db/schema';

export function createAuth(env: App.Platform['env'], requestOrigin: string) {
	const baseURL = env.BETTER_AUTH_URL || requestOrigin;
	return betterAuth({
		appName: 'Client Website Editor',
		baseURL,
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(createDb(env.CONTENT_DB), { provider: 'sqlite', schema }),
		// Public sign-up requests are blocked in hooks.server.ts. The internal setup
		// endpoint uses this API once to provision the administrator.
		emailAndPassword: { enabled: true, disableSignUp: false, minPasswordLength: 8 },
		session: { expiresIn: 60 * 60 * 12, updateAge: 60 * 60 },
		advanced: {
			useSecureCookies: new URL(baseURL).protocol === 'https:',
			database: {
				generateId: ({ model }) => model === 'user' ? 'admin' : crypto.randomUUID()
			}
		}
	});
}

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = Auth['$Infer']['Session'];
