import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from './ipc/channels'
import {
  DialogSelectFolderResponse,
  SettingsGetRequest,
  SettingsGetResponse,
  SettingsSetRequest,
  SettingsSetResponse,
  AppVersionResponse,
} from './ipc/schemas'

const api = {
  selectFolder: async (): Promise<DialogSelectFolderResponse> => {
    return await ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SELECT_FOLDER)
  },

  getSettings: async (key: string): Promise<SettingsGetResponse> => {
    const request: SettingsGetRequest = { key }
    return await ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET, request)
  },

  setSettings: async (
    key: string,
    value: unknown
  ): Promise<SettingsSetResponse> => {
    const request: SettingsSetRequest = { key, value }
    return await ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, request)
  },

  getVersion: async (): Promise<AppVersionResponse> => {
    return await ipcRenderer.invoke(IPC_CHANNELS.APP_VERSION)
  },
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
