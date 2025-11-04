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
