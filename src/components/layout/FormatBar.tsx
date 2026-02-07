import ToolbarButton from '@/components/ui/ToolbarButton'
import { useEditorStore, editorActions } from '@/lib/stores/editor'
import { useDialogStore } from '@/lib/stores/dialogs'
import { focusEditor } from '@/lib/editor-ref'
import { platformShortcut } from '@/lib/platform'
import { getAvailableFonts, FONT_SIZES } from '@/lib/fonts'

const fonts = getAvailableFonts()
const sizes = FONT_SIZES

export default function FormatBar() {
  const [state] = useEditorStore()
  const [, dialogDispatch] = useDialogStore()

  function handleFontChange(e: React.ChangeEvent<HTMLSelectElement>) {
    editorActions.setFontFamily(e.target.value)
    focusEditor()
  }

  function handleSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    editorActions.setFontSize(e.target.value)
    focusEditor()
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
        <ToolbarButton title={platformShortcut("Bold (Ctrl+B)")} active={state.isBold} onClick={() => { editorActions.toggleBold(); focusEditor() }}>
          <span className="format-icon bold">B</span>
        </ToolbarButton>
        <ToolbarButton title={platformShortcut("Italic (Ctrl+I)")} active={state.isItalic} onClick={() => { editorActions.toggleItalic(); focusEditor() }}>
          <span className="format-icon italic">I</span>
        </ToolbarButton>
        <ToolbarButton title={platformShortcut("Underline (Ctrl+U)")} active={state.isUnderline} onClick={() => { editorActions.toggleUnderline(); focusEditor() }}>
          <span className="format-icon underline">U</span>
        </ToolbarButton>
        <ToolbarButton title="Font Color" onClick={() => dialogDispatch({ type: 'OPEN', name: 'color' })}>
          <div className="icon icon-font-color" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="format-group">
        <ToolbarButton title={platformShortcut("Align Left (Ctrl+L)")} active={state.alignment === 'left'} onClick={() => { editorActions.setAlignment('left'); focusEditor() }}>
          <div className="icon icon-align-left" />
        </ToolbarButton>
        <ToolbarButton title={platformShortcut("Center (Ctrl+E)")} active={state.alignment === 'center'} onClick={() => { editorActions.setAlignment('center'); focusEditor() }}>
          <div className="icon icon-align-center" />
        </ToolbarButton>
        <ToolbarButton title={platformShortcut("Align Right (Ctrl+R)")} active={state.alignment === 'right'} onClick={() => { editorActions.setAlignment('right'); focusEditor() }}>
          <div className="icon icon-align-right" />
        </ToolbarButton>
      </div>
      <div className="toolbar-separator" />
      <div className="format-group">
        <ToolbarButton title="Bullets" active={state.isBulletList} onClick={() => { editorActions.toggleBullets(); focusEditor() }}>
          <div className="icon icon-bullets" />
        </ToolbarButton>
      </div>
    </div>
  )
}
