import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(), image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
});
export const session = sqliteTable('session', {
	id: text('id').primaryKey(), expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(), token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(), updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
	ipAddress: text('ip_address'), userAgent: text('user_agent'), userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
}, (t) => [index('session_user_id_idx').on(t.userId)]);
export const account = sqliteTable('account', {
	id: text('id').primaryKey(), accountId: text('account_id').notNull(), providerId: text('provider_id').notNull(), userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'), refreshToken: text('refresh_token'), idToken: text('id_token'), accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }), refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }), scope: text('scope'), password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(), updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
}, (t) => [index('account_user_id_idx').on(t.userId)]);
export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(), expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(), updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
}, (t) => [index('verification_identifier_idx').on(t.identifier)]);

export type LegacyPageContent = {
	eyebrow: string;
	headline: string;
	intro: string;
	navigation: { work: string; about: string; admin: string };
	primaryButton: string;
	sectionLabel: string;
	footer: { brand: string; note: string };
	styles: {
		header: { background: string; text: string };
		hero: { background: string; text: string };
		work: { background: string; text: string };
		footer: { background: string; text: string };
		button: { background: string; text: string };
		accent: string;
	};
	sections: Array<{ heading: string; body: string }>;
	imageId?: string;
};
export type SurfaceColors = { background: string; text: string };
export type PageDocument = {
	version: 1;
	fields: Record<string, string>;
	images: Record<string, string>;
	surfaces: Record<string, SurfaceColors>;
	collections: Record<string, Array<Record<string, string>>>;
	accent: string;
};
export type PageContent = LegacyPageContent | PageDocument;
export type ImageVariant = { width: number; format: 'webp' | 'avif'; filename: string };

export const pages = sqliteTable('pages', {
	id: text('id').primaryKey(), slug: text('slug').notNull(), title: text('title').notNull(), draftContent: text('draft_content', { mode: 'json' }).$type<PageContent>().notNull(), publishedContent: text('published_content', { mode: 'json' }).$type<PageContent>(),
	draftUpdatedAt: integer('draft_updated_at', { mode: 'timestamp' }).notNull(), publishedAt: integer('published_at', { mode: 'timestamp' }), updatedBy: text('updated_by').references(() => user.id)
}, (t) => [uniqueIndex('pages_slug_unique').on(t.slug)]);
export const pageRevisions = sqliteTable('page_revisions', {
	id: text('id').primaryKey(), pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }), content: text('content', { mode: 'json' }).$type<PageContent>().notNull(),
	publishedAt: integer('published_at', { mode: 'timestamp' }).notNull(), publishedBy: text('published_by').notNull().references(() => user.id)
}, (t) => [index('revisions_page_idx').on(t.pageId)]);
export const images = sqliteTable('images', {
	id: text('id').primaryKey(), alt: text('alt').notNull(), width: integer('width').notNull(), height: integer('height').notNull(), variants: text('variants', { mode: 'json' }).$type<ImageVariant[]>().notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(), uploadedBy: text('uploaded_by').notNull().references(() => user.id)
});
export const userRelations = relations(user, ({ many }) => ({ sessions: many(session), accounts: many(account) }));
export const sessionRelations = relations(session, ({ one }) => ({ user: one(user, { fields: [session.userId], references: [user.id] }) }));
export const accountRelations = relations(account, ({ one }) => ({ user: one(user, { fields: [account.userId], references: [user.id] }) }));
export const schema = { user, session, account, verification, pages, pageRevisions, images, userRelations, sessionRelations, accountRelations };
