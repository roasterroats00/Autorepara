import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';

export const pageTypeEnum = ['page', 'blog'] as const;
export const pageStatusEnum = ['draft', 'published', 'scheduled'] as const;

export type PageType = typeof pageTypeEnum[number];
export type PageStatus = typeof pageStatusEnum[number];

export const pages = pgTable('pages', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Content
    title: text('title').notNull(),
    titleEs: text('title_es'),
    slug: text('slug').unique().notNull(),
    content: text('content'),
    contentEs: text('content_es'),
    excerpt: text('excerpt'),
    excerptEs: text('excerpt_es'),

    // Type & Status
    type: text('type', { enum: pageTypeEnum }).default('page'),
    status: text('status', { enum: pageStatusEnum }).default('draft'),

    // Featured Image
    featuredImage: text('featured_image'),

    // SEO
    metaTitle: text('meta_title'),
    metaTitleEs: text('meta_title_es'),
    metaDescription: text('meta_description'),
    metaDescriptionEs: text('meta_description_es'),

    // Author
    authorId: text('author_id').references(() => user.id),

    // Scheduling
    publishedAt: timestamp('published_at'),
    scheduledAt: timestamp('scheduled_at'),

    // Tracking
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const pagesRelations = relations(pages, ({ one }) => ({
    author: one(user, {
        fields: [pages.authorId],
        references: [user.id],
    }),
}));

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
