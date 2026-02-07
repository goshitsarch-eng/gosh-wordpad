import ToolbarButton from '@/components/ui/ToolbarButton'
import { useDialogStore } from '@/lib/stores/dialogs'
import { appAPI } from '@/lib/electron-api'
import { editorCommands } from '@/lib/editor-commands'
import { handleNewFile, handleOpenFile } from '@/lib/actions'
import { platformShortcut } from '@/lib/platform'

export default function Toolbar() {
  const [, dialogDispatch] = useDialogStore()

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <ToolbarButton title={platformShortcut("New (Ctrl+N)")} onClick={handleNewFile}>
          <div className="icon icon-new" />
        </ToolbarButton>
        <ToolbarButton title={platformShortcut("Open (Ctrl+O)")} onClick={handleOpenFile}>
          <div className="icon icon-open" />
        </ToolbarButton>
        <ToolbarButton title={platformShortcut("Save (Ctrl+S)")} onClick={() => appAPI.saveFile()}>
          <div className="icon icon-save" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="toolbar-group">
        <ToolbarButton title={platformShortcut("Print (Ctrl+P)")} onClick={() => appAPI.print()}>
          <div className="icon icon-print" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="toolbar-group">
        <ToolbarButton title={platformShortcut("Find (Ctrl+F)")} onClick={() => dialogDispatch({ type: 'OPEN', name: 'find' })}>
          <div className="icon icon-find" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="toolbar-group">
        <ToolbarButton title={platformShortcut("Cut (Ctrl+X)")} onClick={() => editorCommands.cut()}>
          <div className="icon icon-cut" />
        </ToolbarButton>
        <ToolbarButton title={platformShortcut("Copy (Ctrl+C)")} onClick={() => editorCommands.copy()}>
          <div className="icon icon-copy" />
        </ToolbarButton>
        <ToolbarButton title={platformShortcut("Paste (Ctrl+V)")} onClick={() => editorCommands.paste()}>
          <div className="icon icon-paste" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="toolbar-group">
        <ToolbarButton title={platformShortcut("Undo (Ctrl+Z)")} onClick={() => editorCommands.undo()}>
          <div className="icon icon-undo" />
        </ToolbarButton>
        <ToolbarButton title={platformShortcut("Redo (Ctrl+Y)")} onClick={() => editorCommands.redo()}>
          <div className="icon icon-redo" />
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
