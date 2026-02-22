import { pgTable, text, uuid, integer, timestamp, boolean, doublePrecision } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { states } from './states';

export const cities = pgTable('cities', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    stateId: uuid('state_id').references(() => states.id, { onDelete: 'cascade' }).notNull(),
    description: text('description'),
    descriptionEs: text('description_es'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    workshopCount: integer('workshop_count').default(0),
    avgRating: doublePrecision('avg_rating').default(0),
    metaTitleEn: text('meta_title_en'),
    metaTitleEs: text('meta_title_es'),
    metaDescriptionEn: text('meta_description_en'),
    metaDescriptionEs: text('meta_description_es'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const citiesRelations = relations(cities, ({ one }) => ({
    state: one(states, {
        fields: [cities.stateId],
        references: [states.id],
    }),
}));

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
