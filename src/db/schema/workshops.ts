import { pgTable, text, uuid, integer, timestamp, boolean, doublePrecision, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { cities } from './cities';
import { services } from './services';
import { user } from './auth';

// Business hours type
export type BusinessHours = {
    monday?: { open: string; close: string } | 'closed';
    tuesday?: { open: string; close: string } | 'closed';
    wednesday?: { open: string; close: string } | 'closed';
    thursday?: { open: string; close: string } | 'closed';
    friday?: { open: string; close: string } | 'closed';
    saturday?: { open: string; close: string } | 'closed';
    sunday?: { open: string; close: string } | 'closed';
};

// FAQ type
export type FAQ = Array<{ question: string; answer: string }>;

export const workshopStatusEnum = ['draft', 'pending', 'active', 'inactive'] as const;
export type WorkshopStatus = typeof workshopStatusEnum[number];

export const workshops = pgTable('workshops', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Basic Info
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    slugEs: text('slug_es'),

    // Location
    cityId: uuid('city_id').references(() => cities.id, { onDelete: 'cascade' }).notNull(),
    address: text('address').notNull(),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),

    // Contact
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    googleMapsUrl: text('google_maps_url'),

    // Description (Bilingual)
    descriptionEn: text('description_en'),
    descriptionEs: text('description_es'),

    // Media
    logoUrl: text('logo_url'),
    images: jsonb('images').$type<string[]>().default([]),

    // Business Hours
    businessHours: jsonb('business_hours').$type<BusinessHours>(),

    // Ratings & Reviews
    rating: doublePrecision('rating').default(0),
    reviewCount: integer('review_count').default(0),

    // SEO
    metaTitleEn: text('meta_title_en'),
    metaTitleEs: text('meta_title_es'),
    metaDescriptionEn: text('meta_description_en'),
    metaDescriptionEs: text('meta_description_es'),

    // FAQ (AI Generated)
    faqEn: jsonb('faq_en').$type<FAQ>(),
    faqEs: jsonb('faq_es').$type<FAQ>(),

    // Status
    status: text('status', { enum: workshopStatusEnum }).default('draft'),
    isVerified: boolean('is_verified').default(false),
    isFeatured: boolean('is_featured').default(false),

    // Tracking
    viewCount: integer('view_count').default(0),
    createdBy: text('created_by').references(() => user.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),

    // AI Enrichment Queue
    enrichmentStatus: text('enrichment_status', {
        enum: ['pending', 'processing', 'completed', 'failed', 'skipped']
    }).default('pending'),
    enrichmentError: text('enrichment_error'),
    enrichedAt: timestamp('enriched_at'),
});

// Junction table for workshop-service many-to-many
export const workshopServices = pgTable('workshop_services', {
    id: uuid('id').primaryKey().defaultRandom(),
    workshopId: uuid('workshop_id').references(() => workshops.id, { onDelete: 'cascade' }).notNull(),
    serviceId: uuid('service_id').references(() => services.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const workshopsRelations = relations(workshops, ({ one, many }) => ({
    city: one(cities, {
        fields: [workshops.cityId],
        references: [cities.id],
    }),
    createdByUser: one(user, {
        fields: [workshops.createdBy],
        references: [user.id],
    }),
    workshopServices: many(workshopServices),
}));

export const workshopServicesRelations = relations(workshopServices, ({ one }) => ({
    workshop: one(workshops, {
        fields: [workshopServices.workshopId],
        references: [workshops.id],
    }),
    service: one(services, {
        fields: [workshopServices.serviceId],
        references: [services.id],
    }),
}));

export type Workshop = typeof workshops.$inferSelect;
export type NewWorkshop = typeof workshops.$inferInsert;
export type WorkshopService = typeof workshopServices.$inferSelect;
