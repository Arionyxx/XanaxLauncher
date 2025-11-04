import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('api', {
  version: 'v1',
})
