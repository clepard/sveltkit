import { z } from 'zod';

const text = (max: number) => z.string().trim().min(1).max(max);
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a six-digit hex color');
const blockColors = (background: string, foreground: string) => z.object({
	background: color.default(background),
	text: color.default(foreground)
}).strict().default({ background, text: foreground });
const stylesSchema = z.object({
	header: blockColors('#f4f1e9', '#17211b'),
	hero: blockColors('#f4f1e9', '#17211b'),
	work: blockColors('#f4f1e9', '#17211b'),
	footer: blockColors('#173b2c', '#ffffff'),
	button: blockColors('#173b2c', '#ffffff'),
	accent: color.default('#b64b2b')
}).strict().default({
	header: { background: '#f4f1e9', text: '#17211b' },
	hero: { background: '#f4f1e9', text: '#17211b' },
	work: { background: '#f4f1e9', text: '#17211b' },
	footer: { background: '#173b2c', text: '#ffffff' },
	button: { background: '#173b2c', text: '#ffffff' },
	accent: '#b64b2b'
});
const navigationSchema = z.object({
	work: text(40).default('Work'),
	about: text(40).default('About'),
	admin: text(40).default('Editor')
}).strict().default({ work: 'Work', about: 'About', admin: 'Editor' });
const footerSchema = z.object({
	brand: text(80).default('Northwind Studio'),
	note: text(160).default('Independent digital practice · Vilnius')
}).strict().default({ brand: 'Northwind Studio', note: 'Independent digital practice · Vilnius' });

export const pageContentSchema = z.object({
	eyebrow: text(80),
	headline: text(140),
	intro: text(800),
	navigation: navigationSchema,
	primaryButton: text(60).default('Explore our work'),
	sectionLabel: text(80).default('What we believe'),
	footer: footerSchema,
	styles: stylesSchema,
	sections: z.array(z.object({ heading: text(120), body: text(2000) })).min(1).max(8),
	imageId: z.string().uuid().optional().or(z.literal(''))
}).strict();

const contentKey = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/, 'Invalid content key');
const limitedRecord = <T extends z.ZodType>(value: T, maximum: number) =>
	z.record(contentKey, value).refine((record) => Object.keys(record).length <= maximum, `Maximum ${maximum} entries`);

export const pageDocumentSchema = z.object({
	version: z.literal(1),
	fields: limitedRecord(z.string().max(5_000), 300),
	images: limitedRecord(z.string().uuid().or(z.literal('')), 100),
	surfaces: limitedRecord(z.object({ background: color, text: color }).strict(), 100),
	collections: limitedRecord(z.array(limitedRecord(z.string().max(5_000), 30)).max(50), 30),
	accent: color
}).strict();

export const pageFormSchema = z.object({
	pageId: z.string().uuid(),
	documentJson: z.string().max(250_000)
});

export const loginSchema = z.object({ id: z.string().trim().min(1).max(64), password: z.string().min(1).max(128) });
export const imageAltSchema = z.string().trim().min(1, 'Alt text is required').max(240);
