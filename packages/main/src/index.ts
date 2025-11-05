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
  handleLibraryScan,
  handleLibraryLaunch,
  handleLibraryOpenFolder,
} from './ipc/handlers'

let mainWindow: BrowserWindow | null = null

const isDev = !app.isPackaged

log.transports.file.level = 'info'
log.transports.console.level = 'debug'
log.info('Application starting...')
log.info('isDev:', isDev)
log.info('isPackaged:', app.isPackaged)
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
      log.error('Error in dialog:selectFolder handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async (_event, data) => {
    try {
      return await handleSettingsGet(data)
    } catch (error) {
      log.error('Error in settings:get handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, data) => {
    try {
      return await handleSettingsSet(data)
    } catch (error) {
      log.error('Error in settings:set handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.APP_VERSION, async () => {
    try {
      return await handleAppVersion()
    } catch (error) {
      log.error('Error in app:version handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.PROVIDER_START_JOB, async (_event, data) => {
    try {
      return await handleProviderStartJob(data)
    } catch (error) {
      log.error('Error in provider:start-job handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.PROVIDER_GET_STATUS, async (_event, data) => {
    try {
      return await handleProviderGetStatus(data)
    } catch (error) {
      log.error('Error in provider:get-status handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.PROVIDER_CANCEL_JOB, async (_event, data) => {
    try {
      return await handleProviderCancelJob(data)
    } catch (error) {
      log.error('Error in provider:cancel-job handler:', error)
      throw error
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.PROVIDER_TEST_CONNECTION,
    async (_event, data) => {
      try {
        return await handleProviderTestConnection(data)
      } catch (error) {
        log.error('Error in provider:test-connection handler:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.LOGS_GET_PATH, async () => {
    try {
      return await handleLogsGetPath()
    } catch (error) {
      log.error('Error in logs:getPath handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.LOGS_OPEN_FOLDER, async () => {
    try {
      return await handleLogsOpenFolder()
    } catch (error) {
      log.error('Error in logs:openFolder handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.UPDATE_CHECK, async () => {
    try {
      return await handleUpdateCheck()
    } catch (error) {
      log.error('Error in update:check handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.UPDATE_INSTALL, async () => {
    try {
      return await handleUpdateInstall()
    } catch (error) {
      log.error('Error in update:install handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.LIBRARY_SCAN, async (_event, data) => {
    try {
      return await handleLibraryScan(data)
    } catch (error) {
      log.error('Error in library:scan handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.LIBRARY_LAUNCH, async (_event, data) => {
    try {
      return await handleLibraryLaunch(data)
    } catch (error) {
      log.error('Error in library:launch handler:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.LIBRARY_OPEN_FOLDER, async (_event, data) => {
    try {
      return await handleLibraryOpenFolder(data)
    } catch (error) {
      log.error('Error in library:openFolder handler:', error)
      throw error
    }
  })
}

function createWindow() {
  const preloadPath = isDev
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, 'preload.js')

  log.info('Preload path:', preloadPath)

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: '#1f2937',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  })

  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../../renderer/out/index.html')}`

  log.info('Loading URL:', url)
  log.info('__dirname:', __dirname)

  mainWindow.loadURL(url)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

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
