import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import { uploadDir } from '$lib/server/config';
import type { RequestHandler } from './$types';

const SAFE_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-\d{1,4}\.(?:webp|avif)$/;
export const GET: RequestHandler = async ({ params }) => {
	const width = Number(params.filename.match(/-(\d{1,4})\.(?:webp|avif)$/)?.[1]);
	if (!SAFE_NAME.test(params.filename) || width < 1 || width > 2400 || path.basename(params.filename) !== params.filename) error(404);
	try {
		const body = await readFile(path.join(uploadDir, params.filename));
		return new Response(body, { headers: { 'content-type': params.filename.endsWith('.avif') ? 'image/avif' : 'image/webp', 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
	} catch { error(404); }
};
