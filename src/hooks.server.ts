import { building } from '$app/environment';
import { createAuth } from '$lib/server/auth';
import { createDb } from '$lib/server/db';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
export const handle: Handle = async ({ event, resolve }) => {
	const env = event.platform?.env;
	if (!env) return new Response('Cloudflare bindings are unavailable. Run the app with Wrangler.', { status: 503 });
	const auth = createAuth(env, event.url.origin);
	event.locals.auth = auth;
	event.locals.db = createDb(env.CONTENT_DB);
	const current = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = current?.user ?? null; event.locals.session = current?.session ?? null;
	if (event.url.pathname.startsWith('/api/auth/sign-up')) return new Response('Not found', { status: 404 });
	if (
		event.url.pathname.startsWith('/admin') &&
		event.url.pathname !== '/admin/login' &&
		event.url.pathname !== '/admin/setup' &&
		current?.user.id !== 'admin'
	) return new Response(null, { status: 303, headers: { location: '/admin/login' } });
	return svelteKitHandler({ event, resolve, auth, building });
};
