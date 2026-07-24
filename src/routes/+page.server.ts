import { loadPublishedPage } from '$lib/server/published-page';

export async function load() {
	return loadPublishedPage('home');
}
