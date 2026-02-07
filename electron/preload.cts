import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:open'),
  saveDialog: (defaultPath?: string) => ipcRenderer.invoke('dialog:save', defaultPath),
  askSave: () => ipcRenderer.invoke('dialog:ask-save'),
  readFile: (filePath: string) => ipcRenderer.invoke('fs:read', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:write', filePath, content),
  setTitle: (title: string) => ipcRenderer.invoke('window:set-title', title),
  quit: () => ipcRenderer.invoke('app:quit'),
  forceClose: () => ipcRenderer.invoke('window:force-close'),
  onCloseRequested: (callback: () => void) => {
    ipcRenderer.on('window:close-requested', () => callback())
  }
})
