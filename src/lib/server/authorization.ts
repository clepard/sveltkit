import { error, type RequestEvent } from '@sveltejs/kit';

export function requireAdmin(event: Pick<RequestEvent, 'locals'>) {
	if (!event.locals.user || !event.locals.session || event.locals.user.id !== 'admin') error(403, 'Administrator access required');
	return event.locals.user;
}
