import { dialog, app } from 'electron'
import {
  dialogSelectFolderResponseSchema,
  settingsGetRequestSchema,
  settingsGetResponseSchema,
  settingsSetRequestSchema,
  settingsSetResponseSchema,
  appVersionResponseSchema,
  DialogSelectFolderResponse,
  SettingsGetResponse,
  SettingsSetResponse,
  AppVersionResponse,
} from './schemas'

const settings: Map<string, unknown> = new Map()

export async function handleDialogSelectFolder(): Promise<DialogSelectFolderResponse> {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })

  const validatedResult = dialogSelectFolderResponseSchema.parse({
    canceled: result.canceled,
    filePaths: result.filePaths,
  })

  return validatedResult
}

export async function handleSettingsGet(
  data: unknown
): Promise<SettingsGetResponse> {
  const validated = settingsGetRequestSchema.parse(data)
  const value = settings.get(validated.key)

  const response = settingsGetResponseSchema.parse({
    key: validated.key,
    value: value ?? null,
  })

  return response
}

export async function handleSettingsSet(
  data: unknown
): Promise<SettingsSetResponse> {
  const validated = settingsSetRequestSchema.parse(data)
  settings.set(validated.key, validated.value)

  const response = settingsSetResponseSchema.parse({
    success: true,
  })

  return response
}

export async function handleAppVersion(): Promise<AppVersionResponse> {
  const response = appVersionResponseSchema.parse({
    version: app.getVersion(),
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  })

  return response
}
