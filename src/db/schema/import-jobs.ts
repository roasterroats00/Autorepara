import { pgTable, text, uuid, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';

export const importStatusEnum = ['pending', 'processing', 'completed', 'failed'] as const;
export type ImportStatus = typeof importStatusEnum[number];

export type ColumnMapping = Record<string, string>;

export type EnrichmentOptions = {
    generateDescriptions: boolean;
    generateSeo: boolean;
    generateFaq: boolean;
    translateToSpanish: boolean;
    geocodeAddresses: boolean;
};

export type ImportError = {
    row: number;
    field: string;
    message: string;
};

export const importJobs = pgTable('import_jobs', {
    id: uuid('id').primaryKey().defaultRandom(),

    // File Info
    filename: text('filename').notNull(),
    originalName: text('original_name').notNull(),

    // Status
    status: text('status', { enum: importStatusEnum }).default('pending'),

    // Progress
    totalRows: integer('total_rows').default(0),
    processedRows: integer('processed_rows').default(0),
    successRows: integer('success_rows').default(0),
    errorRows: integer('error_rows').default(0),

    // Column Mapping
    columnMapping: jsonb('column_mapping').$type<ColumnMapping>(),

    // AI Enrichment Options
    enrichmentOptions: jsonb('enrichment_options').$type<EnrichmentOptions>(),

    // AI Enrichment Tracking
    aiEnrichmentStatus: text('ai_enrichment_status', {
        enum: ['pending', 'processing', 'completed', 'failed', 'skipped', 'paused'] as const
    }).default('pending'),
    aiEnrichmentStats: jsonb('ai_enrichment_stats').$type<{
        totalEnriched: number;
        totalFailed: number;
        averageProcessingTime: number;
        lastProcessedAt?: string;
    }>(),

    // CSV Data Storage (for background processing)
    csvData: jsonb('csv_data').$type<Array<Record<string, string>>>(),

    // Current processing position
    currentRowIndex: integer('current_row_index').default(0),

    // Processing results (successful and failed rows)
    processingResults: jsonb('processing_results').$type<{
        successful: Array<{ rowIndex: number; workshopId: string }>;
        failed: Array<{ rowIndex: number; error: string }>;
    }>(),

    // Errors
    errors: jsonb('errors').$type<ImportError[]>(),

    // User
    createdBy: text('created_by').references(() => user.id),
    createdAt: timestamp('created_at').defaultNow(),
    completedAt: timestamp('completed_at'),
});

export const importJobsRelations = relations(importJobs, ({ one }) => ({
    creator: one(user, {
        fields: [importJobs.createdBy],
        references: [user.id],
    }),
}));

export type ImportJob = typeof importJobs.$inferSelect;
export type NewImportJob = typeof importJobs.$inferInsert;
