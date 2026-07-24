import { loadPublishedPage } from '$lib/server/published-page';

export async function load({ locals }) {
	return loadPublishedPage(locals.db, 'home');
}
