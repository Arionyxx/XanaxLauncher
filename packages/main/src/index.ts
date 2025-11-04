import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { IPC_CHANNELS } from './ipc/channels'
import {
  handleDialogSelectFolder,
  handleSettingsGet,
  handleSettingsSet,
  handleAppVersion,
} from './ipc/handlers'

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV !== 'production'

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
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const url = isDev ? 'http://localhost:3000' : 'http://localhost:3000'

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
