import ToolbarButton from '@/components/ui/ToolbarButton'
import { useEditorStore, editorActions } from '@/lib/stores/editor'
import { useDialogStore } from '@/lib/stores/dialogs'

const fonts = [
  'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
  'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Palatino Linotype',
  'Lucida Console', 'Tahoma', 'MS Sans Serif'
]
const sizes = ['8','9','10','11','12','14','16','18','20','22','24','26','28','36','48','72']

export default function FormatBar() {
  const [state] = useEditorStore()
  const [, dialogDispatch] = useDialogStore()

  function handleFontChange(e: React.ChangeEvent<HTMLSelectElement>) {
    editorActions.setFontFamily(e.target.value)
    document.getElementById('editor')?.focus()
  }

  function handleSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    editorActions.setFontSize(e.target.value)
    document.getElementById('editor')?.focus()
  }

  return (
    <div className="format-bar">
      <div className="format-group">
        <select className="format-select font-select" title="Font" value={state.fontFamily} onChange={handleFontChange}>
          {fonts.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="format-select size-select" title="Font Size" value={state.fontSize} onChange={handleSizeChange}>
          {sizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="toolbar-separator" />
      <div className="format-group">
        <ToolbarButton title="Bold (Ctrl+B)" active={state.isBold} onClick={() => { editorActions.toggleBold(); document.getElementById('editor')?.focus() }}>
          <span className="format-icon bold">B</span>
        </ToolbarButton>
        <ToolbarButton title="Italic (Ctrl+I)" active={state.isItalic} onClick={() => { editorActions.toggleItalic(); document.getElementById('editor')?.focus() }}>
          <span className="format-icon italic">I</span>
        </ToolbarButton>
        <ToolbarButton title="Underline (Ctrl+U)" active={state.isUnderline} onClick={() => { editorActions.toggleUnderline(); document.getElementById('editor')?.focus() }}>
          <span className="format-icon underline">U</span>
        </ToolbarButton>
        <ToolbarButton title="Font Color" onClick={() => dialogDispatch({ type: 'OPEN', name: 'color' })}>
          <div className="icon icon-font-color" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="format-group">
        <ToolbarButton title="Align Left (Ctrl+L)" active={state.alignment === 'left'} onClick={() => { editorActions.setAlignment('left'); document.getElementById('editor')?.focus() }}>
          <div className="icon icon-align-left" />
        </ToolbarButton>
        <ToolbarButton title="Center (Ctrl+E)" active={state.alignment === 'center'} onClick={() => { editorActions.setAlignment('center'); document.getElementById('editor')?.focus() }}>
          <div className="icon icon-align-center" />
        </ToolbarButton>
        <ToolbarButton title="Align Right (Ctrl+R)" active={state.alignment === 'right'} onClick={() => { editorActions.setAlignment('right'); document.getElementById('editor')?.focus() }}>
          <div className="icon icon-align-right" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="format-group">
        <ToolbarButton title="Bullets" active={state.isBulletList} onClick={() => { editorActions.toggleBullets(); document.getElementById('editor')?.focus() }}>
          <div className="icon icon-bullets" />
        </ToolbarButton>
      </div>
    </div>
  )
}
