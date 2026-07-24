import { error } from '@sveltejs/kit';
import { seedSite } from '$lib/server/seed';
import type { RequestHandler } from './$types';

function safeEqual(actual: string, expected: string) {
	const left = new TextEncoder().encode(actual);
	const right = new TextEncoder().encode(expected);
	let difference = left.length ^ right.length;
	for (let index = 0; index < Math.max(left.length, right.length); index++) {
		difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
	}
	return difference === 0;
}

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	const setupToken = platform?.env.SETUP_TOKEN;
	const authorization = request.headers.get('authorization') ?? '';
	if (!setupToken || !safeEqual(authorization, `Bearer ${setupToken}`)) error(404);

	let password = '';
	try {
		const body = await request.json() as { password?: unknown };
		password = typeof body.password === 'string' ? body.password : '';
	} catch {
		error(400, 'Expected a JSON body');
	}
	if (password.length < 12 || password.length > 128) error(400, 'Password must be between 12 and 128 characters');

	try {
		await seedSite(locals.db, locals.auth, password);
		return Response.json({ created: true });
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Setup failed';
		error(message.includes('already') ? 409 : 500, message);
	}
};
