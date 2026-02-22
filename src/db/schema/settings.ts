import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const settings = pgTable('settings', {
    id: text('id').primaryKey().default('main'),

    // Site Info
    siteName: text('site_name').notNull().default('AutoRepara'),
    siteDescriptionEn: text('site_description_en').default('Find trusted auto repair shops near you'),
    siteDescriptionEs: text('site_description_es').default('Encuentra talleres mecánicos de confianza cerca de ti'),

    // Contact Info (Global)
    contactEmail: text('contact_email').default('contact@autorepara.net'),
    contactPhone: text('contact_phone').default('+1 (817) 844-2973'),
    contactAddress: text('contact_address').default('262 Baker Avenue, Fort Worth, TX 76102'),

    // Business Info
    rfc: text('rfc').default('BKRV-2628-FWTX'),
    legalName: text('legal_name').default('AutoRepara LLC'),

    // Social Links
    socialLinks: jsonb('social_links').$type<{
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        youtube?: string;
    }>().default({}),

    // SEO Global
    googleAnalyticsId: text('google_analytics_id'),
    googleSiteVerification: text('google_site_verification'),

    updatedAt: timestamp('updated_at').defaultNow(),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
