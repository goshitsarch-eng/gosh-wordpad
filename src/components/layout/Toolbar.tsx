import ToolbarButton from '@/components/ui/ToolbarButton'
import { useDialogStore } from '@/lib/stores/dialogs'
import { useDocumentStore } from '@/lib/stores/document'
import { appAPI } from '@/lib/electron-api'

export default function Toolbar() {
  const [, dialogDispatch] = useDialogStore()
  const [, docDispatch] = useDocumentStore()

  async function handleNew() {
    const cleared = await appAPI.newFile()
    if (cleared) {
      const editor = document.getElementById('editor')
      if (editor) editor.innerHTML = ''
      docDispatch({ type: 'CLEAR' })
    }
  }

  async function handleOpen() {
    const data = await appAPI.openFile()
    if (data) {
      const editor = document.getElementById('editor')
      if (editor) editor.innerText = data.content
      docDispatch({ type: 'SET_CONTENT', content: data.content, filePath: data.filePath })
    }
  }

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <ToolbarButton title="New (Ctrl+N)" onClick={handleNew}>
          <div className="icon icon-new" />
        </ToolbarButton>
        <ToolbarButton title="Open (Ctrl+O)" onClick={handleOpen}>
          <div className="icon icon-open" />
        </ToolbarButton>
        <ToolbarButton title="Save (Ctrl+S)" onClick={() => appAPI.saveFile()}>
          <div className="icon icon-save" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="toolbar-group">
        <ToolbarButton title="Print (Ctrl+P)" onClick={() => appAPI.print()}>
          <div className="icon icon-print" />
        </ToolbarButton>
        <ToolbarButton title="Print Preview" onClick={() => appAPI.printPreview()}>
          <div className="icon icon-print-preview" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="toolbar-group">
        <ToolbarButton title="Find (Ctrl+F)" onClick={() => dialogDispatch({ type: 'OPEN', name: 'find' })}>
          <div className="icon icon-find" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="toolbar-group">
        <ToolbarButton title="Cut (Ctrl+X)" onClick={() => document.execCommand('cut')}>
          <div className="icon icon-cut" />
        </ToolbarButton>
        <ToolbarButton title="Copy (Ctrl+C)" onClick={() => document.execCommand('copy')}>
          <div className="icon icon-copy" />
        </ToolbarButton>
        <ToolbarButton title="Paste (Ctrl+V)" onClick={() => document.execCommand('paste')}>
          <div className="icon icon-paste" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="toolbar-group">
        <ToolbarButton title="Undo (Ctrl+Z)" onClick={() => document.execCommand('undo')}>
          <div className="icon icon-undo" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="toolbar-group">
        <ToolbarButton title="Date/Time" onClick={() => dialogDispatch({ type: 'OPEN', name: 'dateTime' })}>
          <div className="icon icon-date-time" />
        </ToolbarButton>
      </div>
    </div>
  )
}
