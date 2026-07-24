import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
export const handle: Handle = async ({ event, resolve }) => {
	const current = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = current?.user ?? null; event.locals.session = current?.session ?? null;
	if (event.url.pathname.startsWith('/admin') && event.url.pathname !== '/admin/login' && current?.user.id !== 'admin') return new Response(null, { status: 303, headers: { location: '/admin/login' } });
	return svelteKitHandler({ event, resolve, auth, building });
};
