import { redirect, fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { applySetCookies } from '$lib/server/cookies';
import { loginSchema } from '$lib/server/validation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user?.id === 'admin') redirect(303, '/admin');
};

export const actions: Actions = {
	// Authentication is the sole action that cannot require an existing session.
	default: async ({ request, cookies }) => {
		const parsed = loginSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { error: 'Enter your user ID and password.', id: '' });
		try {
			const response = await auth.api.signInEmail({ body: { email: `${parsed.data.id}@local.invalid`, password: parsed.data.password }, asResponse: true });
			if (!response.ok) return fail(400, { error: 'Invalid credentials.', id: parsed.data.id });
			applySetCookies(response.headers, cookies);
		} catch { return fail(400, { error: 'Invalid credentials.', id: parsed.data.id }); }
		redirect(303, '/admin');
	}
};
