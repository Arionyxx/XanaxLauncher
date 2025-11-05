import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from './ipc/channels'
import {
  DialogSelectFolderResponse,
  SettingsGetRequest,
  SettingsGetResponse,
  SettingsSetRequest,
  SettingsSetResponse,
  AppVersionResponse,
  ProviderStartJobRequest,
  ProviderStartJobResponse,
  ProviderGetStatusRequest,
  ProviderGetStatusResponse,
  ProviderCancelJobRequest,
  ProviderCancelJobResponse,
  ProviderTestConnectionRequest,
  ProviderTestConnectionResponse,
  LogsGetPathResponse,
  LogsOpenFolderResponse,
  UpdateCheckResponse,
  UpdateInstallResponse,
  LibraryScanResponse,
  LibraryLaunchRequest,
  LibraryLaunchResponse,
  LibraryOpenFolderRequest,
  LibraryOpenFolderResponse,
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

  providerStartJob: async (
    request: ProviderStartJobRequest
  ): Promise<ProviderStartJobResponse> => {
    return await ipcRenderer.invoke(IPC_CHANNELS.PROVIDER_START_JOB, request)
  },

  providerGetStatus: async (
    request: ProviderGetStatusRequest
  ): Promise<ProviderGetStatusResponse> => {
    return await ipcRenderer.invoke(IPC_CHANNELS.PROVIDER_GET_STATUS, request)
  },

  providerCancelJob: async (
    request: ProviderCancelJobRequest
  ): Promise<ProviderCancelJobResponse> => {
    return await ipcRenderer.invoke(IPC_CHANNELS.PROVIDER_CANCEL_JOB, request)
  },

  providerTestConnection: async (
    request: ProviderTestConnectionRequest
  ): Promise<ProviderTestConnectionResponse> => {
    return await ipcRenderer.invoke(
      IPC_CHANNELS.PROVIDER_TEST_CONNECTION,
      request
    )
  },

  logs: {
    getPath: async (): Promise<LogsGetPathResponse> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.LOGS_GET_PATH)
    },

    openFolder: async (): Promise<LogsOpenFolderResponse> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.LOGS_OPEN_FOLDER)
    },
  },

  updates: {
    check: async (): Promise<UpdateCheckResponse> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.UPDATE_CHECK)
    },

    install: async (): Promise<UpdateInstallResponse> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.UPDATE_INSTALL)
    },
  },

  library: {
    scan: async (
      request?: { paths?: string[] }
    ): Promise<LibraryScanResponse> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.LIBRARY_SCAN, request ?? {})
    },

    launch: async (
      request: LibraryLaunchRequest
    ): Promise<LibraryLaunchResponse> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.LIBRARY_LAUNCH, request)
    },

    openFolder: async (
      request: LibraryOpenFolderRequest
    ): Promise<LibraryOpenFolderResponse> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.LIBRARY_OPEN_FOLDER, request)
    },
  },
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
