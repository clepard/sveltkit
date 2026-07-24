import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const SAFE_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp|avif)$/;
const CONTENT_TYPES: Record<string, string> = {
	jpg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp',
	avif: 'image/avif'
};

export const GET: RequestHandler = async ({ params, platform, request }) => {
	if (!SAFE_NAME.test(params.filename) || !platform?.env.MEDIA) error(404);
	const object = await platform.env.MEDIA.get(params.filename);
	if (!object) error(404);
	const extension = params.filename.slice(params.filename.lastIndexOf('.') + 1);
	const headers = new Headers({
		'content-type': CONTENT_TYPES[extension],
		'etag': object.httpEtag,
		'cache-control': 'public, max-age=31536000, immutable',
		'x-content-type-options': 'nosniff'
	});
	if (request.headers.get('if-none-match') === object.httpEtag) {
		return new Response(null, { headers, status: 304 });
	}
	return new Response(object.body, { headers });
};
