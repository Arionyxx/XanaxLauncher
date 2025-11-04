export const IPC_CHANNELS = {
  DIALOG_SELECT_FOLDER: 'dialog:selectFolder',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  APP_VERSION: 'app:version',
  PROVIDER_START_JOB: 'provider:start-job',
  PROVIDER_GET_STATUS: 'provider:get-status',
  PROVIDER_CANCEL_JOB: 'provider:cancel-job',
  PROVIDER_TEST_CONNECTION: 'provider:test-connection',
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
