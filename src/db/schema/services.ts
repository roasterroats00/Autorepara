import { pgTable, text, uuid, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const services = pgTable('services', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    nameEs: text('name_es'),
    slug: text('slug').unique().notNull(),
    icon: text('icon'),
    image: text('image'),
    description: text('description'),
    descriptionEs: text('description_es'),
    workshopCount: integer('workshop_count').default(0),
    displayOrder: integer('display_order').default(0),
    isPopular: boolean('is_popular').default(false),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
