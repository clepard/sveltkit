import { eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { images, pages } from '$lib/server/db/schema';
import { normalizePageDocument } from '$lib/server/page-document';

export async function loadPublishedPage(slug: string) {
	const page = await db.query.pages.findFirst({ where: eq(pages.slug, slug) });
	if (!page?.publishedContent) return { title: page?.title ?? 'Northwind Studio', document: null, images: [] };
	const document = normalizePageDocument(page.publishedContent, page.title);
	const imageIds = [...new Set(Object.values(document.images).filter(Boolean))];
	const referencedImages = imageIds.length ? await db.select().from(images).where(inArray(images.id, imageIds)) : [];
	return { title: document.fields['site.title'] ?? page.title, document, images: referencedImages };
}
