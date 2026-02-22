import { pgTable, text, uuid, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';

export const media = pgTable('media', {
    id: uuid('id').primaryKey().defaultRandom(),
    filename: text('filename').notNull(),
    originalName: text('original_name').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    url: text('url').notNull(),
    altText: text('alt_text'),
    uploadedBy: text('uploaded_by').references(() => user.id),
    createdAt: timestamp('created_at').defaultNow(),
});

export const mediaRelations = relations(media, ({ one }) => ({
    uploader: one(user, {
        fields: [media.uploadedBy],
        references: [user.id],
    }),
}));

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
