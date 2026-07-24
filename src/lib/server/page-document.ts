import type { LegacyPageContent, PageDocument } from '$lib/server/db/schema';
import { pageContentSchema, pageDocumentSchema } from '$lib/server/validation';

export function normalizePageDocument(input: unknown, title: string): PageDocument {
	const current = pageDocumentSchema.safeParse(input);
	if (current.success) return current.data;

	const legacy = pageContentSchema.parse(input) as LegacyPageContent;
	return {
		version: 1,
		fields: {
			'site.title': title,
			'nav.work': legacy.navigation.work,
			'nav.about': legacy.navigation.about,
			'hero.eyebrow': legacy.eyebrow,
			'hero.headline': legacy.headline,
			'hero.intro': legacy.intro,
			'hero.cta': legacy.primaryButton,
			'work.label': legacy.sectionLabel,
			'footer.brand': legacy.footer.brand,
			'footer.note': legacy.footer.note
		},
		images: { 'hero.image': legacy.imageId ?? '' },
		surfaces: {
			header: legacy.styles.header,
			hero: legacy.styles.hero,
			work: legacy.styles.work,
			footer: legacy.styles.footer,
			'button.primary': legacy.styles.button
		},
		collections: { beliefs: legacy.sections.map((section) => ({ ...section })) },
		accent: legacy.styles.accent
	};
}

export function createPageDocument(overrides?: Partial<PageDocument>): PageDocument {
	return pageDocumentSchema.parse({
		version: 1,
		fields: {}, images: {}, surfaces: {}, collections: {}, accent: '#b64b2b',
		...overrides
	});
}
