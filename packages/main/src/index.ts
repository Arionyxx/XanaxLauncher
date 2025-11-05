import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { IPC_CHANNELS } from './ipc/channels'
import {
  handleDialogSelectFolder,
  handleSettingsGet,
  handleSettingsSet,
  handleAppVersion,
  handleProviderStartJob,
  handleProviderGetStatus,
  handleProviderCancelJob,
  handleProviderTestConnection,
  handleLogsGetPath,
  handleLogsOpenFolder,
  handleUpdateCheck,
  handleUpdateInstall,
} from './ipc/handlers'

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV !== 'production'

// Declare MAIN_WINDOW_WEBPACK_ENTRY for Forge
declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

log.transports.file.level = 'info'
log.transports.console.level = 'debug'
log.info('Application starting...')
log.info('isDev:', isDev)
log.info('NODE_ENV:', process.env.NODE_ENV)

autoUpdater.logger = log
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

if (process.argv.includes('--safe-mode')) {
  log.info('Running in safe mode')
}

function registerIpcHandlers() {
  ipcMain.handle(IPC_CHANNELS.DIALOG_SELECT_FOLDER, async () => {
    try {
      return await handleDialogSelectFolder()
    } catch (error) {
      console.error('Error in dialog:selectFolder handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async (_event, data) => {
    try {
      return await handleSettingsGet(data)
    } catch (error) {
      console.error('Error in settings:get handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, data) => {
    try {
      return await handleSettingsSet(data)
    } catch (error) {
      console.error('Error in settings:set handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.APP_VERSION, async () => {
    try {
      return await handleAppVersion()
    } catch (error) {
      console.error('Error in app:version handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.PROVIDER_START_JOB, async (_event, data) => {
    try {
      return await handleProviderStartJob(data)
    } catch (error) {
      console.error('Error in provider:start-job handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.PROVIDER_GET_STATUS, async (_event, data) => {
    try {
      return await handleProviderGetStatus(data)
    } catch (error) {
      console.error('Error in provider:get-status handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.PROVIDER_CANCEL_JOB, async (_event, data) => {
    try {
      return await handleProviderCancelJob(data)
    } catch (error) {
      console.error('Error in provider:cancel-job handler:', error)
      throw error
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.PROVIDER_TEST_CONNECTION,
    async (_event, data) => {
      try {
        return await handleProviderTestConnection(data)
      } catch (error) {
        console.error('Error in provider:test-connection handler:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.LOGS_GET_PATH, async () => {
    try {
      return await handleLogsGetPath()
    } catch (error) {
      console.error('Error in logs:getPath handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.LOGS_OPEN_FOLDER, async () => {
    try {
      return await handleLogsOpenFolder()
    } catch (error) {
      console.error('Error in logs:openFolder handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.UPDATE_CHECK, async () => {
    try {
      return await handleUpdateCheck()
    } catch (error) {
      console.error('Error in update:check handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.UPDATE_INSTALL, async () => {
    try {
      return await handleUpdateInstall()
    } catch (error) {
      console.error('Error in update:install handler:', error)
      throw error
    }
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // In dev mode, load Next.js from localhost:3000
  // In production, still load from localhost:3000 (Next.js must be running)
  const url = isDev ? 'http://localhost:3000' : 'http://localhost:3000'

  log.info('Loading URL:', url)
  log.info('Preload path:', MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY)

  mainWindow.loadURL(url)

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
