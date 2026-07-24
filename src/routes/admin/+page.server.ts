import { fail, redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { db } from '$lib/server/db';
import { images, pageRevisions, pages } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/authorization';
import { imageAltSchema, pageDocumentSchema, pageFormSchema } from '$lib/server/validation';
import { normalizePageDocument } from '$lib/server/page-document';
import { optimizeImage } from '$lib/server/images';
import { uploadDir } from '$lib/server/config';
import { auth } from '$lib/server/auth';
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

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);
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
		const parsed = await parsePageForm(event.request);
		if ('error' in parsed) return fail(400, { saveError: parsed.error });
		await db.update(pages).set({ title: parsed.title, draftContent: parsed.document, draftUpdatedAt: new Date(), updatedBy: admin.id }).where(eq(pages.id, parsed.pageId));
		return { saved: true };
	},
	publish: async (event) => {
		const admin = requireAdmin(event);
		const parsed = await parsePageForm(event.request);
		if ('error' in parsed) return fail(400, { publishError: parsed.error });
		try {
			db.transaction((tx) => {
				const page = tx.select().from(pages).where(eq(pages.id, parsed.pageId)).get();
				if (!page) throw new Error('Page not found');
				const now = new Date();
				tx.insert(pageRevisions).values({ id: crypto.randomUUID(), pageId: page.id, content: parsed.document, publishedAt: now, publishedBy: admin.id }).run();
				tx.update(pages).set({ title: parsed.title, draftContent: parsed.document, publishedContent: parsed.document, draftUpdatedAt: now, publishedAt: now, updatedBy: admin.id }).where(eq(pages.id, page.id)).run();
			});
			return { published: true };
		} catch (cause) { return fail(400, { publishError: cause instanceof Error ? cause.message : 'Publishing failed' }); }
	},
	upload: async (event) => {
		const admin = requireAdmin(event);
		const form = await event.request.formData();
		const file = form.get('image');
		const alt = imageAltSchema.safeParse(form.get('alt'));
		if (!(file instanceof File) || !alt.success) return fail(400, { uploadError: alt.error?.issues[0]?.message ?? 'Choose an image' });
		const id = crypto.randomUUID();
		try {
			const optimized = await optimizeImage(file, id);
			try { await db.insert(images).values({ id, alt: alt.data, ...optimized, createdAt: new Date(), uploadedBy: admin.id }); }
			catch (cause) { await Promise.allSettled(optimized.variants.map((variant) => rm(path.join(uploadDir, variant.filename), { force: true }))); throw cause; }
			return { uploaded: true };
		} catch (cause) { return fail(400, { uploadError: cause instanceof Error ? cause.message : 'Upload failed' }); }
	},
	logout: async (event) => {
		requireAdmin(event);
		const response = await auth.api.signOut({ headers: event.request.headers, asResponse: true });
		applySetCookies(response.headers, event.cookies);
		redirect(303, '/admin/login');
	}
};
