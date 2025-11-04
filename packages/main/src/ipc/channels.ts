export const IPC_CHANNELS = {
  DIALOG_SELECT_FOLDER: 'dialog:selectFolder',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  APP_VERSION: 'app:version',
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
