import { dialog, app, shell } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import {
  dialogSelectFolderResponseSchema,
  settingsGetRequestSchema,
  settingsGetResponseSchema,
  settingsSetRequestSchema,
  settingsSetResponseSchema,
  appVersionResponseSchema,
  providerStartJobRequestSchema,
  providerStartJobResponseSchema,
  providerGetStatusRequestSchema,
  providerGetStatusResponseSchema,
  providerCancelJobRequestSchema,
  providerCancelJobResponseSchema,
  providerTestConnectionRequestSchema,
  providerTestConnectionResponseSchema,
  logsGetPathResponseSchema,
  logsOpenFolderResponseSchema,
  updateCheckResponseSchema,
  updateInstallResponseSchema,
  DialogSelectFolderResponse,
  SettingsGetResponse,
  SettingsSetResponse,
  AppVersionResponse,
  ProviderStartJobResponse,
  ProviderGetStatusResponse,
  ProviderCancelJobResponse,
  ProviderTestConnectionResponse,
  LogsGetPathResponse,
  LogsOpenFolderResponse,
  UpdateCheckResponse,
  UpdateInstallResponse,
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

export async function handleProviderStartJob(
  data: unknown
): Promise<ProviderStartJobResponse> {
  const validated = providerStartJobRequestSchema.parse(data)

  const response = providerStartJobResponseSchema.parse({
    jobId: validated.provider,
    status: 'QUEUED',
  })

  return response
}

export async function handleProviderGetStatus(
  data: unknown
): Promise<ProviderGetStatusResponse> {
  const validated = providerGetStatusRequestSchema.parse(data)

  const response = providerGetStatusResponseSchema.parse({
    id: validated.jobId,
    status: 'QUEUED',
    progress: 0,
    files: [],
    metadata: {},
  })

  return response
}

export async function handleProviderCancelJob(
  data: unknown
): Promise<ProviderCancelJobResponse> {
  const validated = providerCancelJobRequestSchema.parse(data)

  const response = providerCancelJobResponseSchema.parse({
    success: true,
    message: `Job ${validated.jobId} cancelled`,
  })

  return response
}

export async function handleProviderTestConnection(
  data: unknown
): Promise<ProviderTestConnectionResponse> {
  const validated = providerTestConnectionRequestSchema.parse(data)

  const response = providerTestConnectionResponseSchema.parse({
    success: true,
    message: `Connected to ${validated.provider}`,
  })

  return response
}

export async function handleLogsGetPath(): Promise<LogsGetPathResponse> {
  const logPath = log.transports.file.getFile().path

  const response = logsGetPathResponseSchema.parse({
    path: logPath,
  })

  return response
}

export async function handleLogsOpenFolder(): Promise<LogsOpenFolderResponse> {
  const logPath = log.transports.file.getFile().path
  const logDir = logPath.substring(0, logPath.lastIndexOf('/'))

  await shell.openPath(logDir)

  const response = logsOpenFolderResponseSchema.parse({
    success: true,
  })

  return response
}

export async function handleUpdateCheck(): Promise<UpdateCheckResponse> {
  try {
    const updateCheckResult = await autoUpdater.checkForUpdates()

    const response = updateCheckResponseSchema.parse({
      available: updateCheckResult !== null,
      version: updateCheckResult?.updateInfo.version ?? null,
      releaseDate: updateCheckResult?.updateInfo.releaseDate ?? null,
      releaseNotes: updateCheckResult?.updateInfo.releaseNotes as
        | string
        | null
        | undefined,
    })

    return response
  } catch (error) {
    log.error('Update check failed:', error)

    return updateCheckResponseSchema.parse({
      available: false,
      version: null,
      releaseDate: null,
      releaseNotes: null,
    })
  }
}

export async function handleUpdateInstall(): Promise<UpdateInstallResponse> {
  try {
    autoUpdater.quitAndInstall()

    const response = updateInstallResponseSchema.parse({
      success: true,
    })

    return response
  } catch (error) {
    log.error('Update install failed:', error)

    const response = updateInstallResponseSchema.parse({
      success: false,
    })

    return response
  }
}
