import { fail, redirect } from '@sveltejs/kit';
import { eq, desc, inArray } from 'drizzle-orm';
import { images, pageRevisions, pages } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/authorization';
import { imageAltSchema, imageDeleteSchema, pageDocumentSchema, pageFormSchema } from '$lib/server/validation';
import { normalizePageDocument } from '$lib/server/page-document';
import { imageAltFromFilename, storeImage } from '$lib/server/images';
import { applySetCookies } from '$lib/server/cookies';
import type { Actions, PageServerLoad } from './$types';

async function parsePageForm(request: Request) {
	const form = Object.fromEntries(await request.formData());
	const fields = pageFormSchema.safeParse(form);
	if (!fields.success) return { error: fields.error.issues[0]?.message ?? 'Invalid content' } as const;
	let rawDocument: unknown;
	try { rawDocument = JSON.parse(fields.data.documentJson); }
	catch { return { error: 'The page document is invalid.' } as const; }
	const document = pageDocumentSchema.safeParse(rawDocument);
	if (!document.success) return { error: document.error.issues[0]?.message ?? 'Invalid page document' } as const;
	const title = document.data.fields['site.title']?.trim();
	if (!title || title.length > 120) return { error: 'Website title must be between 1 and 120 characters.' } as const;
	return { pageId: fields.data.pageId, title, document: document.data } as const;
}

function referencedImageIds(document: unknown) {
	if (!document || typeof document !== 'object' || !('images' in document)) return [];
	const imageMap = document.images;
	if (!imageMap || typeof imageMap !== 'object' || Array.isArray(imageMap)) return [];
	return Object.values(imageMap).filter((value): value is string => typeof value === 'string' && value.length > 0);
}

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);
	const db = event.locals.db;
	const requestedSlug = event.url.searchParams.get('page') ?? 'home';
	const page = await db.query.pages.findFirst({ where: eq(pages.slug, requestedSlug) });
	if (!page) throw new Error('Run npm run db:seed before opening the editor');
	const draftContent = normalizePageDocument(page.draftContent, page.title);
	const publishedContent = page.publishedContent ? normalizePageDocument(page.publishedContent, page.title) : null;
	return {
		page: { ...page, draftContent, publishedContent },
		pages: await db.select({ id: pages.id, slug: pages.slug, title: pages.title }).from(pages).orderBy(pages.title),
		images: await db.select().from(images).orderBy(desc(images.createdAt)),
		user: event.locals.user
	};
};

export const actions: Actions = {
	save: async (event) => {
		const admin = requireAdmin(event);
		const db = event.locals.db;
		const parsed = await parsePageForm(event.request);
		if ('error' in parsed) return fail(400, { saveError: parsed.error });
		await db.update(pages).set({ title: parsed.title, draftContent: parsed.document, draftUpdatedAt: new Date(), updatedBy: admin.id }).where(eq(pages.id, parsed.pageId));
		return { saved: true };
	},
	publish: async (event) => {
		const admin = requireAdmin(event);
		const db = event.locals.db;
		const parsed = await parsePageForm(event.request);
		if ('error' in parsed) return fail(400, { publishError: parsed.error });
		try {
			const page = await db.select({ id: pages.id }).from(pages).where(eq(pages.id, parsed.pageId)).get();
			if (!page) throw new Error('Page not found');
			const now = new Date();
			await db.batch([
				db.insert(pageRevisions).values({ id: crypto.randomUUID(), pageId: page.id, content: parsed.document, publishedAt: now, publishedBy: admin.id }),
				db.update(pages).set({ title: parsed.title, draftContent: parsed.document, publishedContent: parsed.document, draftUpdatedAt: now, publishedAt: now, updatedBy: admin.id }).where(eq(pages.id, page.id))
			]);
			return { published: true };
		} catch (cause) { return fail(400, { publishError: cause instanceof Error ? cause.message : 'Publishing failed' }); }
	},
	upload: async (event) => {
		const admin = requireAdmin(event);
		const db = event.locals.db;
		const bucket = event.platform?.env.MEDIA_STORE;
		if (!bucket) return fail(503, { uploadError: 'Media storage is unavailable' });
		const form = await event.request.formData();
		const file = form.get('image');
		const alt = imageAltSchema.safeParse(file instanceof File ? imageAltFromFilename(file.name) : '');
		if (!(file instanceof File) || !alt.success) return fail(400, { uploadError: alt.error?.issues[0]?.message ?? 'Choose an image' });
		const id = crypto.randomUUID();
		try {
			const stored = await storeImage(file, id, bucket);
			try { await db.insert(images).values({ id, alt: alt.data, ...stored, createdAt: new Date(), uploadedBy: admin.id }); }
			catch (cause) {
				await Promise.allSettled(stored.variants.map((variant) => bucket.delete(variant.filename)));
				throw cause;
			}
			return { uploaded: true, imageId: id, imageAlt: alt.data };
		} catch (cause) { return fail(400, { uploadError: cause instanceof Error ? cause.message : 'Upload failed' }); }
	},
	deleteImages: async (event) => {
		requireAdmin(event);
		const bucket = event.platform?.env.MEDIA_STORE;
		if (!bucket) return fail(503, { deleteError: 'Media storage is unavailable' });
		const form = await event.request.formData();
		let requestedIds: unknown;
		try { requestedIds = JSON.parse(String(form.get('imageIds') ?? '[]')); }
		catch { return fail(400, { deleteError: 'Invalid image selection' }); }
		const selected = imageDeleteSchema.safeParse(requestedIds);
		if (!selected.success) return fail(400, { deleteError: 'Select at least one valid image' });

		const db = event.locals.db;
		const pageDocuments = await db.select({
			draftContent: pages.draftContent,
			publishedContent: pages.publishedContent
		}).from(pages);
		const inUse = new Set(pageDocuments.flatMap((page) => [
			...referencedImageIds(page.draftContent),
			...referencedImageIds(page.publishedContent)
		]));
		const protectedCount = selected.data.filter((id) => inUse.has(id)).length;
		if (protectedCount) {
			return fail(409, { deleteError: `${protectedCount} selected image${protectedCount === 1 ? ' is' : 's are'} currently used on a page. Replace it before deleting.` });
		}

		const stored = await db.select().from(images).where(inArray(images.id, selected.data));
		if (!stored.length) return { deleted: 0 };
		await db.delete(images).where(inArray(images.id, stored.map((image) => image.id)));
		const cleanup = await Promise.allSettled(
			stored.flatMap((image) => image.variants.map((variant) => bucket.delete(variant.filename)))
		);
		const cleanupFailures = cleanup.filter((result) => result.status === 'rejected').length;
		if (cleanupFailures) console.error(JSON.stringify({ event: 'r2_image_cleanup_failed', count: cleanupFailures }));
		return { deleted: stored.length };
	},
	logout: async (event) => {
		requireAdmin(event);
		const response = await event.locals.auth.api.signOut({ headers: event.request.headers, asResponse: true });
		applySetCookies(response.headers, event.cookies);
		redirect(303, '/admin/login');
	}
};
