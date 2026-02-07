import { useDocumentStore } from './stores/document'

export interface FileOpenedData {
  content: string
  filePath: string
}

interface ElectronAPI {
  openFile: () => Promise<FileOpenedData | null>
  saveDialog: (defaultPath?: string) => Promise<string | null>
  askSave: () => Promise<'save' | 'dont-save' | 'cancel'>
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<void>
  setTitle: (title: string) => Promise<void>
  quit: () => Promise<void>
  forceClose: () => Promise<void>
  onCloseRequested: (callback: () => void) => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

// Gracefully handle running in browser (vite dev) vs electron
const api = window.electronAPI

class AppAPI {
  private contentGetter: (() => string) | null = null

  setContentGetter(getter: () => string): void {
    this.contentGetter = getter
  }

  getContent(): string {
    return this.contentGetter ? this.contentGetter() : ''
  }

  async newFile(): Promise<boolean> {
    const { isModified } = useDocumentStore.getState()
    if (isModified) {
      const result = await this.promptSaveChanges()
      if (result === 'cancel') return false
      if (result === 'save') {
        const saved = await this.saveFile()
        if (!saved) return false
      }
    }
    useDocumentStore.dispatch({ type: 'CLEAR' })
    await this.updateWindowTitle()
    return true
  }

  async openFile(): Promise<FileOpenedData | null> {
    const { isModified } = useDocumentStore.getState()
    if (isModified) {
      const result = await this.promptSaveChanges()
      if (result === 'cancel') return null
      if (result === 'save') {
        const saved = await this.saveFile()
        if (!saved) return null
      }
    }

    if (!api) return null
    try {
      const data = await api.openFile()
      if (data) {
        useDocumentStore.dispatch({ type: 'SET_CONTENT', content: data.content, filePath: data.filePath })
        await this.updateWindowTitle()
      }
      return data
    } catch (err) {
      console.error('Could not open file:', err)
      return null
    }
  }

  async saveFile(): Promise<boolean> {
    const { filePath } = useDocumentStore.getState()
    if (!filePath) {
      return await this.saveFileAs()
    }

    if (!api) return false
    try {
      const content = this.getContent()
      await api.writeFile(filePath, content)
      useDocumentStore.dispatch({ type: 'MARK_SAVED' })
      await this.updateWindowTitle()
      return true
    } catch (err) {
      console.error('Could not save file:', err)
      return false
    }
  }

  async saveFileAs(): Promise<boolean> {
    if (!api) return false
    const { filePath } = useDocumentStore.getState()
    const savePath = await api.saveDialog(filePath || 'Document.html')
    if (savePath) {
      useDocumentStore.dispatch({ type: 'SET_FILE_PATH', filePath: savePath })
      return await this.saveFile()
    }
    return false
  }

  async promptSaveChanges(): Promise<'save' | 'dont-save' | 'cancel'> {
    if (!api) return 'dont-save'
    return await api.askSave()
  }

  private getFileName(): string {
    const { filePath } = useDocumentStore.getState()
    if (!filePath) return 'Document'
    const parts = filePath.split(/[/\\]/)
    return parts[parts.length - 1] || 'Document'
  }

  async updateWindowTitle(): Promise<void> {
    const { isModified } = useDocumentStore.getState()
    const fileName = this.getFileName()
    const modified = isModified ? ' *' : ''
    if (api) {
      try {
        await api.setTitle(`${fileName}${modified} - WordPad`)
      } catch (err) {
        console.error('Failed to update window title:', err)
      }
    }
    document.title = `${fileName}${modified} - WordPad`
  }

  print(): void {
    window.print()
  }

  async exitApp(): Promise<void> {
    const { isModified } = useDocumentStore.getState()
    if (isModified) {
      const result = await this.promptSaveChanges()
      if (result === 'cancel') return
      if (result === 'save') {
        const saved = await this.saveFile()
        if (!saved) return
      }
    }
    if (api) {
      await api.forceClose()
    }
  }
}

export const appAPI = new AppAPI()

// Subscribe to store changes to keep the window title in sync
useDocumentStore.subscribe(() => {
  appAPI.updateWindowTitle()
})
