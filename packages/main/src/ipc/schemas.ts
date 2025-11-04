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

export type DialogSelectFolderResponse = z.infer<
  typeof dialogSelectFolderResponseSchema
>
export type SettingsGetRequest = z.infer<typeof settingsGetRequestSchema>
export type SettingsGetResponse = z.infer<typeof settingsGetResponseSchema>
export type SettingsSetRequest = z.infer<typeof settingsSetRequestSchema>
export type SettingsSetResponse = z.infer<typeof settingsSetResponseSchema>
export type AppVersionResponse = z.infer<typeof appVersionResponseSchema>
