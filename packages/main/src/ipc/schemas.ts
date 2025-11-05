import { z } from 'zod'

export const dialogSelectFolderResponseSchema = z.object({
  canceled: z.boolean(),
  filePaths: z.array(z.string()),
})

export const settingsGetRequestSchema = z.object({
  key: z.string().min(1),
})

export const settingsGetResponseSchema = z.object({
  key: z.string(),
  value: z.unknown(),
})

export const settingsSetRequestSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
})

export const settingsSetResponseSchema = z.object({
  success: z.boolean(),
})

export const appVersionResponseSchema = z.object({
  version: z.string(),
  electron: z.string(),
  chrome: z.string(),
  node: z.string(),
})

export const providerStartJobRequestSchema = z.object({
  provider: z.string().min(1),
  payload: z.object({
    url: z.string().optional(),
    magnet: z.string().optional(),
    files: z.array(z.string()).optional(),
  }),
})

export const providerStartJobResponseSchema = z.object({
  jobId: z.string(),
  status: z.string(),
})

export const providerGetStatusRequestSchema = z.object({
  provider: z.string().min(1),
  jobId: z.string().min(1),
})

export const providerGetStatusResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  progress: z.number(),
  files: z.array(z.any()),
  metadata: z.record(z.string(), z.unknown()),
})

export const providerCancelJobRequestSchema = z.object({
  provider: z.string().min(1),
  jobId: z.string().min(1),
})

export const providerCancelJobResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
})

export const providerTestConnectionRequestSchema = z.object({
  provider: z.string().min(1),
})

export const providerTestConnectionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  user: z
    .object({
      username: z.string().optional(),
      email: z.string().optional(),
      premium: z.boolean().optional(),
      expiresAt: z.number().optional(),
    })
    .optional(),
})

export const logsGetPathResponseSchema = z.object({
  path: z.string(),
})

export const logsOpenFolderResponseSchema = z.object({
  success: z.boolean(),
})

export const updateCheckResponseSchema = z.object({
  available: z.boolean(),
  version: z.string().nullable(),
  releaseDate: z.string().nullable(),
  releaseNotes: z.union([z.string(), z.any()]).nullable().optional(),
})

export const updateInstallResponseSchema = z.object({
  success: z.boolean(),
})

export const libraryScanRequestSchema = z.object({
  paths: z.array(z.string().min(1)).optional(),
})

export const libraryScanEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  installPath: z.string(),
  installDate: z.number(),
  size: z.number(),
  coverUrl: z.string().url().nullable().optional(),
  lastPlayed: z.number().nullable().optional(),
  executablePath: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
})

export const libraryScanResponseSchema = z.object({
  entries: z.array(libraryScanEntrySchema),
  scannedPaths: z.array(z.string()),
  errors: z.array(z.string()).optional(),
  duration: z.number(),
  found: z.number(),
})

export const libraryLaunchRequestSchema = z.object({
  id: z.string().min(1),
  executablePath: z.string().min(1),
  cwd: z.string().optional(),
})

export const libraryLaunchResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
})

export const libraryOpenFolderRequestSchema = z.object({
  path: z.string().min(1),
})

export const libraryOpenFolderResponseSchema = z.object({
  success: z.boolean(),
})

export type DialogSelectFolderResponse = z.infer<
  typeof dialogSelectFolderResponseSchema
>
export type SettingsGetRequest = z.infer<typeof settingsGetRequestSchema>
export type SettingsGetResponse = z.infer<typeof settingsGetResponseSchema>
export type SettingsSetRequest = z.infer<typeof settingsSetRequestSchema>
export type SettingsSetResponse = z.infer<typeof settingsSetResponseSchema>
export type AppVersionResponse = z.infer<typeof appVersionResponseSchema>
export type ProviderStartJobRequest = z.infer<
  typeof providerStartJobRequestSchema
>
export type ProviderStartJobResponse = z.infer<
  typeof providerStartJobResponseSchema
>
export type ProviderGetStatusRequest = z.infer<
  typeof providerGetStatusRequestSchema
>
export type ProviderGetStatusResponse = z.infer<
  typeof providerGetStatusResponseSchema
>
export type ProviderCancelJobRequest = z.infer<
  typeof providerCancelJobRequestSchema
>
export type ProviderCancelJobResponse = z.infer<
  typeof providerCancelJobResponseSchema
>
export type ProviderTestConnectionRequest = z.infer<
  typeof providerTestConnectionRequestSchema
>
export type ProviderTestConnectionResponse = z.infer<
  typeof providerTestConnectionResponseSchema
>
export type LogsGetPathResponse = z.infer<typeof logsGetPathResponseSchema>
export type LogsOpenFolderResponse = z.infer<
  typeof logsOpenFolderResponseSchema
>
export type UpdateCheckResponse = z.infer<typeof updateCheckResponseSchema>
export type UpdateInstallResponse = z.infer<typeof updateInstallResponseSchema>
export type LibraryScanEntry = z.infer<typeof libraryScanEntrySchema>
export type LibraryScanRequest = z.infer<typeof libraryScanRequestSchema>
export type LibraryScanResponse = z.infer<typeof libraryScanResponseSchema>
export type LibraryLaunchRequest = z.infer<typeof libraryLaunchRequestSchema>
export type LibraryLaunchResponse = z.infer<typeof libraryLaunchResponseSchema>
export type LibraryOpenFolderRequest = z.infer<
  typeof libraryOpenFolderRequestSchema
>
export type LibraryOpenFolderResponse = z.infer<
  typeof libraryOpenFolderResponseSchema
>
