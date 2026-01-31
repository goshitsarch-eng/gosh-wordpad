import { useState } from 'react'
import DialogBase from '@/components/ui/DialogBase'
import Button from '@/components/ui/Button'
import { useDialogStore } from '@/lib/stores/dialogs'
import { editorActions } from '@/lib/stores/editor'

const basicColors = [
  '#FF0000','#FFFF00','#00FF00','#00FFFF','#0000FF','#FF00FF','#FFFFFF','#000000',
  '#800000','#808000','#008000','#008080','#000080','#800080','#C0C0C0','#808080',
  '#FF8080','#FFFF80','#80FF80','#80FFFF','#8080FF','#FF80FF','#FFE0E0','#FFFFE0',
  '#E0FFE0','#E0FFFF','#E0E0FF','#FFE0FF','#FF4040','#FFFF40','#40FF40','#40FFFF',
  '#4040FF','#FF40FF','#FFC0C0','#FFFFC0','#C0FFC0','#C0FFFF','#C0C0FF','#FFC0FF',
  '#C00000','#C0C000','#00C000','#00C0C0','#0000C0','#C000C0','#400000','#404000'
]
const customColors = Array(16).fill('#FFFFFF')

export default function ColorDialog() {
  const [dialogState, dialogDispatch] = useDialogStore()
  const [selectedColor, setSelectedColor] = useState('#000000')

  function applyColor() {
    editorActions.setFontColor(selectedColor)
    dialogDispatch({ type: 'CLOSE', name: 'color' })
    document.getElementById('editor')?.focus()
  }

  return (
    <DialogBase title="Color" visible={dialogState.color} onClose={() => dialogDispatch({ type: 'CLOSE', name: 'color' })} width="450px">
      <fieldset>
        <legend>Basic colors:</legend>
        <div className="color-grid">
          {basicColors.map((color, i) => (
            <button key={i} className={`color-cell ${selectedColor === color ? 'selected' : ''}`} style={{ backgroundColor: color }} onClick={() => setSelectedColor(color)} aria-label={`Select color ${color}`} />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Custom colors:</legend>
        <div className="color-grid">
          {customColors.map((color, i) => (
            <button key={i} className={`color-cell ${selectedColor === color ? 'selected' : ''}`} style={{ backgroundColor: color }} onClick={() => setSelectedColor(color)} aria-label={`Select custom color ${color}`} />
          ))}
        </div>
      </fieldset>
      <div className="dialog-buttons">
        <Button onClick={applyColor}>OK</Button>
        <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'color' })}>Cancel</Button>
      </div>
    </DialogBase>
  )
}
