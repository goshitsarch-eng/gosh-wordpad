import { appAPI } from './electron-api'
import { sanitizeHTML } from './sanitize'
import { getEditor } from './editor-ref'

export async function handleNewFile(): Promise<void> {
  const cleared = await appAPI.newFile()
  if (cleared) {
    const editor = getEditor()
    if (editor) editor.innerHTML = ''
  }
}

export async function handleOpenFile(): Promise<void> {
  const data = await appAPI.openFile()
  if (data) {
    const editor = getEditor()
    if (editor) editor.innerHTML = sanitizeHTML(data.content)
  }
}
