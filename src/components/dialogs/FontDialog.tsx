import { useState, useMemo } from 'react'
import DialogBase from '@/components/ui/DialogBase'
import Button from '@/components/ui/Button'
import { useDialogStore } from '@/lib/stores/dialogs'
import { editorActions, getFontSizeIndex } from '@/lib/stores/editor'

const fonts = ['Arial','Times New Roman','Courier New','Georgia','Verdana','Comic Sans MS','Impact','Trebuchet MS','Tahoma','MS Sans Serif']
const sizes = ['8','9','10','11','12','14','16','18','20','22','24','26','28','36','48','72']
const colors = [
  { value: '#000000', label: 'Black' }, { value: '#800000', label: 'Maroon' },
  { value: '#008000', label: 'Green' }, { value: '#808000', label: 'Olive' },
  { value: '#000080', label: 'Navy' }, { value: '#800080', label: 'Purple' },
  { value: '#008080', label: 'Teal' }, { value: '#C0C0C0', label: 'Silver' },
  { value: '#808080', label: 'Gray' }, { value: '#FF0000', label: 'Red' },
  { value: '#00FF00', label: 'Lime' }, { value: '#FFFF00', label: 'Yellow' },
  { value: '#0000FF', label: 'Blue' }, { value: '#FF00FF', label: 'Fuchsia' },
  { value: '#00FFFF', label: 'Aqua' }, { value: '#FFFFFF', label: 'White' }
]

export default function FontDialog() {
  const [dialogState, dialogDispatch] = useDialogStore()
  const [fontFamily, setFontFamily] = useState('MS Sans Serif')
  const [fontStyle, setFontStyle] = useState('normal')
  const [fontSize, setFontSize] = useState('10')
  const [fontColor, setFontColor] = useState('#000000')
  const [strikeout, setStrikeout] = useState(false)
  const [underline, setUnderline] = useState(false)

  const sampleStyle = useMemo(() => ({
    fontFamily,
    fontWeight: fontStyle.includes('bold') ? 'bold' as const : 'normal' as const,
    fontStyle: fontStyle.includes('italic') ? 'italic' as const : 'normal' as const,
    fontSize: fontSize + 'pt',
    color: fontColor,
    textDecoration: underline ? 'underline' : (strikeout ? 'line-through' : 'none')
  }), [fontFamily, fontStyle, fontSize, fontColor, strikeout, underline])

  function applyFontSettings() {
    document.execCommand('fontName', false, fontFamily)
    const sizeIndex = getFontSizeIndex(fontSize)
    document.execCommand('fontSize', false, sizeIndex.toString())
    document.execCommand('foreColor', false, fontColor)
    const isBold = document.queryCommandState('bold')
    if (fontStyle.includes('bold') !== isBold) document.execCommand('bold')
    const isItalic = document.queryCommandState('italic')
    if (fontStyle.includes('italic') !== isItalic) document.execCommand('italic')
    const isUnderline = document.queryCommandState('underline')
    if (underline !== isUnderline) document.execCommand('underline')
    const isStrike = document.queryCommandState('strikeThrough')
    if (strikeout !== isStrike) document.execCommand('strikeThrough')
    editorActions.updateFormatState()
    dialogDispatch({ type: 'CLOSE', name: 'font' })
    document.getElementById('editor')?.focus()
  }

  const styleLabel = fontStyle === 'normal' ? 'Regular' : fontStyle === 'italic' ? 'Italic' : fontStyle === 'bold' ? 'Bold' : 'Bold Italic'

  return (
    <DialogBase title="Font" visible={dialogState.font} onClose={() => dialogDispatch({ type: 'CLOSE', name: 'font' })} large>
      <div className="font-dialog-grid">
        <div className="font-column">
          <label>Font:</label>
          <input type="text" className="dialog-input" value={fontFamily} onChange={e => setFontFamily(e.target.value)} />
          <select className="font-dialog-list" size={8} value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
            {fonts.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="font-column font-style-column">
          <label>Font style:</label>
          <input type="text" className="dialog-input" value={styleLabel} readOnly />
          <select className="font-dialog-list" size={8} value={fontStyle} onChange={e => setFontStyle(e.target.value)}>
            <option value="normal">Regular</option>
            <option value="italic">Italic</option>
            <option value="bold">Bold</option>
            <option value="bold-italic">Bold Italic</option>
          </select>
        </div>
        <div className="font-column font-size-column">
          <label>Size:</label>
          <input type="text" className="dialog-input" value={fontSize} onChange={e => setFontSize(e.target.value)} />
          <select className="font-dialog-list" size={8} value={fontSize} onChange={e => setFontSize(e.target.value)}>
            {sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="font-dialog-row">
        <fieldset className="font-effects">
          <legend>Effects</legend>
          <label className="checkbox-label"><input type="checkbox" checked={strikeout} onChange={e => setStrikeout(e.target.checked)} /> Strikeout</label>
          <label className="checkbox-label"><input type="checkbox" checked={underline} onChange={e => setUnderline(e.target.checked)} /> Underline</label>
        </fieldset>
        <div className="font-color-section">
          <label>Color:</label>
          <select className="color-select" value={fontColor} onChange={e => setFontColor(e.target.value)}>
            {colors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <fieldset className="font-sample">
        <legend>Sample</legend>
        <div className="font-sample-text" style={sampleStyle}>AaBbYyZz</div>
      </fieldset>
      <div className="font-script-row">
        <label>Script:</label>
        <select className="script-dropdown"><option value="Western">Western</option></select>
      </div>
      <div className="dialog-buttons font-dialog-buttons">
        <Button onClick={applyFontSettings}>OK</Button>
        <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'font' })}>Cancel</Button>
      </div>
    </DialogBase>
  )
}
