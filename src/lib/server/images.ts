import { mkdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { uploadDir } from '$lib/server/config';
import type { ImageVariant } from '$lib/server/db/schema';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 12_000;
const MAX_PIXELS = 40_000_000;
const FORMATS = new Set(['jpeg', 'png', 'webp', 'avif']);

export async function optimizeImage(file: File, id: string): Promise<{ width: number; height: number; variants: ImageVariant[] }> {
	if (file.size < 1 || file.size > MAX_BYTES) throw new Error('Image must be between 1 byte and 10 MB');
	const buffer = Buffer.from(await file.arrayBuffer());
	const metadata = await sharp(buffer, { failOn: 'error', limitInputPixels: MAX_PIXELS }).metadata();
	if (!metadata.format || !FORMATS.has(metadata.format) || !metadata.width || !metadata.height) throw new Error('Only valid JPEG, PNG, WebP, and AVIF images are accepted');
	if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION || metadata.width * metadata.height > MAX_PIXELS) throw new Error('Image dimensions exceed 12000px or 40 megapixels');

	await mkdir(uploadDir, { recursive: true, mode: 0o750 });
	const widths = [...new Set([480, 960, 1600, Math.min(metadata.width, 2400)].filter((width) => width <= metadata.width))].sort((a, b) => a - b);
	const variants: ImageVariant[] = [];
	const temporary: string[] = [];
	try {
		for (const width of widths) for (const format of ['webp', 'avif'] as const) {
			const filename = `${id}-${width}.${format}`;
			const finalPath = path.join(uploadDir, filename);
			const tempPath = `${finalPath}.${crypto.randomUUID()}.tmp`;
			temporary.push(tempPath);
			let pipeline = sharp(buffer, { failOn: 'error', limitInputPixels: MAX_PIXELS }).rotate().resize({ width, withoutEnlargement: true });
			pipeline = format === 'webp' ? pipeline.webp({ quality: 82 }) : pipeline.avif({ quality: 55, effort: 5 });
			await pipeline.toFile(tempPath);
			await rename(tempPath, finalPath);
			variants.push({ width, format, filename });
		}
		return { width: metadata.width, height: metadata.height, variants };
	} catch (cause) {
		await Promise.allSettled([...temporary, ...variants.map((v) => path.join(uploadDir, v.filename))].map((target) => rm(target, { force: true })));
		throw cause;
	}
}
