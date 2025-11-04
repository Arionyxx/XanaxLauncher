export interface DialogSelectFolderResponse {
  canceled: boolean
  filePaths: string[]
}

export interface SettingsGetResponse {
  key: string
  value: unknown
}

export interface SettingsSetResponse {
  success: boolean
}

export interface AppVersionResponse {
  version: string
  electron: string
  chrome: string
  node: string
}

export interface ProviderStartJobRequest {
  provider: string
  payload: {
    url?: string
    magnet?: string
    files?: string[]
  }
}

export interface ProviderStartJobResponse {
  jobId: string
  status: string
}

export interface ProviderGetStatusRequest {
  provider: string
  jobId: string
}

export interface ProviderGetStatusResponse {
  id: string
  status: string
  progress: number
  files: any[]
  metadata: Record<string, unknown>
}

export interface ProviderCancelJobRequest {
  provider: string
  jobId: string
}

export interface ProviderCancelJobResponse {
  success: boolean
  message?: string
}

export interface ProviderTestConnectionRequest {
  provider: string
}

export interface ProviderTestConnectionResponse {
  success: boolean
  message?: string
  user?: {
    username?: string
    email?: string
    premium?: boolean
    expiresAt?: number
  }
}

export interface ElectronAPI {
  selectFolder: () => Promise<DialogSelectFolderResponse>
  getSettings: (key: string) => Promise<SettingsGetResponse>
  setSettings: (key: string, value: unknown) => Promise<SettingsSetResponse>
  getVersion: () => Promise<AppVersionResponse>
  providerStartJob: (
    request: ProviderStartJobRequest
  ) => Promise<ProviderStartJobResponse>
  providerGetStatus: (
    request: ProviderGetStatusRequest
  ) => Promise<ProviderGetStatusResponse>
  providerCancelJob: (
    request: ProviderCancelJobRequest
  ) => Promise<ProviderCancelJobResponse>
  providerTestConnection: (
    request: ProviderTestConnectionRequest
  ) => Promise<ProviderTestConnectionResponse>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
