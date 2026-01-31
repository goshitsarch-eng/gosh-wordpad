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
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

// Gracefully handle running in browser (vite dev) vs electron
const api = window.electronAPI

class AppAPI {
  private currentFilePath: string | null = null
  private isDocumentModified = false
  private contentGetter: (() => string) | null = null

  setContentGetter(getter: () => string): void {
    this.contentGetter = getter
  }

  getContent(): string {
    return this.contentGetter ? this.contentGetter() : ''
  }

  async newFile(): Promise<boolean> {
    if (this.isDocumentModified) {
      const result = await this.promptSaveChanges()
      if (result === 'cancel') return false
      if (result === 'save') {
        const saved = await this.saveFile()
        if (!saved) return false
      }
    }
    this.currentFilePath = null
    this.isDocumentModified = false
    await this.updateWindowTitle()
    return true
  }

  async openFile(): Promise<FileOpenedData | null> {
    if (this.isDocumentModified) {
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
        this.currentFilePath = data.filePath
        this.isDocumentModified = false
        await this.updateWindowTitle()
      }
      return data
    } catch (err) {
      console.error('Could not open file:', err)
      return null
    }
  }

  async saveFile(): Promise<boolean> {
    if (!this.currentFilePath) {
      return await this.saveFileAs()
    }

    if (!api) return false
    try {
      const content = this.getContent()
      await api.writeFile(this.currentFilePath, content)
      this.isDocumentModified = false
      await this.updateWindowTitle()
      return true
    } catch (err) {
      console.error('Could not save file:', err)
      return false
    }
  }

  async saveFileAs(): Promise<boolean> {
    if (!api) return false
    const filePath = await api.saveDialog(this.currentFilePath || 'Document.rtf')
    if (filePath) {
      this.currentFilePath = filePath
      return await this.saveFile()
    }
    return false
  }

  async promptSaveChanges(): Promise<'save' | 'dont-save' | 'cancel'> {
    if (!api) return 'dont-save'
    return await api.askSave()
  }

  private getFileName(): string {
    if (!this.currentFilePath) return 'Document'
    const parts = this.currentFilePath.split(/[/\\]/)
    return parts[parts.length - 1] || 'Document'
  }

  async updateWindowTitle(): Promise<void> {
    const fileName = this.getFileName()
    const modified = this.isDocumentModified ? ' *' : ''
    if (api) {
      try {
        await api.setTitle(`${fileName}${modified} - WordPad`)
      } catch (err) {
        console.error('Failed to update window title:', err)
      }
    }
    document.title = `${fileName}${modified} - WordPad`
  }

  setDocumentModified(modified: boolean): void {
    if (this.isDocumentModified !== modified) {
      this.isDocumentModified = modified
      this.updateWindowTitle()
    }
  }

  getIsModified(): boolean {
    return this.isDocumentModified
  }

  getCurrentFilePath(): string | null {
    return this.currentFilePath
  }

  print(): void {
    window.print()
  }

  printPreview(): void {
    window.print()
  }

  async exitApp(): Promise<void> {
    if (this.isDocumentModified) {
      const result = await this.promptSaveChanges()
      if (result === 'cancel') return
      if (result === 'save') {
        const saved = await this.saveFile()
        if (!saved) return
      }
    }
    if (api) {
      await api.quit()
    }
  }
}

export const appAPI = new AppAPI()
