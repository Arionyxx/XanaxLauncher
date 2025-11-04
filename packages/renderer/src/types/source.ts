import { z } from 'zod'

// Source status types
export type SourceStatus = 'never_synced' | 'syncing' | 'synced' | 'error'

// Source entry schema (individual game/content entry)
export const sourceEntrySchema = z.object({
  title: z.string(),
  links: z.array(z.string().url()),
  meta: z.record(z.string(), z.unknown()).optional(),
})

export type SourceEntry = z.infer<typeof sourceEntrySchema>

// Source data schema (JSON feed structure)
export const sourceDataSchema = z.object({
  name: z.string(),
  updatedAt: z.string(),
  entries: z.array(sourceEntrySchema),
})

export type SourceData = z.infer<typeof sourceDataSchema>

// Source form data (for add/edit dialog)
export const sourceFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  url: z.string().url('Must be a valid URL'),
  autoSync: z.boolean(),
})

export type SourceFormData = z.infer<typeof sourceFormSchema>

// Import/Export format
export const sourcesExportSchema = z.object({
  sources: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      autoSync: z.boolean(),
    })
  ),
})

export type SourcesExport = z.infer<typeof sourcesExportSchema>
