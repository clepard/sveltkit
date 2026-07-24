import type { Auth, AuthSession } from '$lib/server/auth';
import type { Database } from '$lib/server/db';

declare global {
	namespace App {
		interface Locals {
			auth: Auth;
			db: Database;
			user: AuthSession['user'] | null;
			session: AuthSession['session'] | null;
		}
		interface Platform {
			env: {
				DB: D1Database;
				MEDIA: R2Bucket;
				BETTER_AUTH_SECRET: string;
				BETTER_AUTH_URL?: string;
				SETUP_TOKEN?: string;
			};
			context: ExecutionContext;
			caches: CacheStorage;
		}
	}
}
export {};
