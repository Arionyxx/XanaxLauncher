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

export interface ElectronAPI {
  selectFolder: () => Promise<DialogSelectFolderResponse>
  getSettings: (key: string) => Promise<SettingsGetResponse>
  setSettings: (key: string, value: unknown) => Promise<SettingsSetResponse>
  getVersion: () => Promise<AppVersionResponse>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
