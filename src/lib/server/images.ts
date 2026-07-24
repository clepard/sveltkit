import { imageSize } from 'image-size';
import type { ImageVariant } from '$lib/server/db/schema';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 12_000;
const MAX_PIXELS = 40_000_000;
const FORMATS = {
	jpg: { format: 'jpeg', extension: 'jpg', contentType: 'image/jpeg' },
	jpeg: { format: 'jpeg', extension: 'jpg', contentType: 'image/jpeg' },
	png: { format: 'png', extension: 'png', contentType: 'image/png' },
	webp: { format: 'webp', extension: 'webp', contentType: 'image/webp' },
	avif: { format: 'avif', extension: 'avif', contentType: 'image/avif' }
} as const;

export async function storeImage(file: File, id: string, bucket: R2Bucket): Promise<{
	width: number;
	height: number;
	variants: ImageVariant[];
}> {
	if (file.size < 1 || file.size > MAX_BYTES) throw new Error('Image must be between 1 byte and 10 MB');
	const bytes = new Uint8Array(await file.arrayBuffer());
	let dimensions: ReturnType<typeof imageSize>;
	try {
		dimensions = imageSize(bytes);
	} catch {
		throw new Error('Only valid JPEG, PNG, WebP, and AVIF images are accepted');
	}
	const detected = dimensions.type ? FORMATS[dimensions.type as keyof typeof FORMATS] : undefined;
	if (!detected || !dimensions.width || !dimensions.height) {
		throw new Error('Only valid JPEG, PNG, WebP, and AVIF images are accepted');
	}
	if (
		dimensions.width > MAX_DIMENSION ||
		dimensions.height > MAX_DIMENSION ||
		dimensions.width * dimensions.height > MAX_PIXELS
	) {
		throw new Error('Image dimensions exceed 12000px or 40 megapixels');
	}

	const filename = `${id}.${detected.extension}`;
	await bucket.put(filename, bytes, {
		httpMetadata: { contentType: detected.contentType, cacheControl: 'public, max-age=31536000, immutable' },
		customMetadata: { originalName: file.name.slice(0, 200) }
	});
	return {
		width: dimensions.width,
		height: dimensions.height,
		variants: [{ width: dimensions.width, format: detected.format, filename }]
	};
}
