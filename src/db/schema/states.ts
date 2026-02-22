import { pgTable, text, uuid, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const states = pgTable('states', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    code: text('code').unique().notNull(),
    slug: text('slug').unique().notNull(),
    descriptionEn: text('description_en'),
    descriptionEs: text('description_es'),
    metaTitleEn: text('meta_title_en'),
    metaTitleEs: text('meta_title_es'),
    metaDescriptionEn: text('meta_description_en'),
    metaDescriptionEs: text('meta_description_es'),
    workshopCount: integer('workshop_count').default(0),
    cityCount: integer('city_count').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type State = typeof states.$inferSelect;
export type NewState = typeof states.$inferInsert;
