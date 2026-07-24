import { error } from '@sveltejs/kit';
import { loadPublishedPage } from '$lib/server/published-page';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const page = await loadPublishedPage(params.slug);
	if (!page.document) error(404, 'Page not found');
	return page;
};
