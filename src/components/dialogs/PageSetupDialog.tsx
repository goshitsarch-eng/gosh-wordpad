import { useState } from 'react'
import DialogBase from '@/components/ui/DialogBase'
import Button from '@/components/ui/Button'
import { useDialogStore } from '@/lib/stores/dialogs'

export default function PageSetupDialog() {
  const [dialogState, dialogDispatch] = useDialogStore()
  const [paperSize, setPaperSize] = useState('letter')
  const [paperSource, setPaperSource] = useState('auto')
  const [orientation, setOrientation] = useState('portrait')
  const [marginLeft, setMarginLeft] = useState('1.25')
  const [marginRight, setMarginRight] = useState('1.25')
  const [marginTop, setMarginTop] = useState('1')
  const [marginBottom, setMarginBottom] = useState('1')

  return (
    <DialogBase title="Page Setup" visible={dialogState.pageSetup} onClose={() => dialogDispatch({ type: 'CLOSE', name: 'pageSetup' })}>
      <fieldset>
        <legend>Paper</legend>
        <div className="dialog-row">
          <label>Size:</label>
          <select className="dialog-select" value={paperSize} onChange={e => setPaperSize(e.target.value)}>
            <option value="letter">Letter 8 1/2 x 11 in</option>
            <option value="legal">Legal 8 1/2 x 14 in</option>
            <option value="a4">A4 210 x 297 mm</option>
          </select>
        </div>
        <div className="dialog-row">
          <label>Source:</label>
          <select className="dialog-select" value={paperSource} onChange={e => setPaperSource(e.target.value)}>
            <option value="auto">Automatically Select</option>
          </select>
        </div>
      </fieldset>
      <fieldset>
        <legend>Orientation</legend>
        <label className="radio-label">
          <input type="radio" name="orientation" value="portrait" checked={orientation === 'portrait'} onChange={e => setOrientation(e.target.value)} /> Portrait
        </label>
        <label className="radio-label">
          <input type="radio" name="orientation" value="landscape" checked={orientation === 'landscape'} onChange={e => setOrientation(e.target.value)} /> Landscape
        </label>
      </fieldset>
      <fieldset>
        <legend>Margins (inches)</legend>
        <div className="margins-grid">
          <div className="margin-input"><label>Left:</label><input type="text" className="dialog-input small-input" value={marginLeft} onChange={e => setMarginLeft(e.target.value)} /></div>
          <div className="margin-input"><label>Right:</label><input type="text" className="dialog-input small-input" value={marginRight} onChange={e => setMarginRight(e.target.value)} /></div>
          <div className="margin-input"><label>Top:</label><input type="text" className="dialog-input small-input" value={marginTop} onChange={e => setMarginTop(e.target.value)} /></div>
          <div className="margin-input"><label>Bottom:</label><input type="text" className="dialog-input small-input" value={marginBottom} onChange={e => setMarginBottom(e.target.value)} /></div>
        </div>
      </fieldset>
      <div className="dialog-buttons">
        <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'pageSetup' })}>OK</Button>
        <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'pageSetup' })}>Cancel</Button>
      </div>
    </DialogBase>
  )
}
