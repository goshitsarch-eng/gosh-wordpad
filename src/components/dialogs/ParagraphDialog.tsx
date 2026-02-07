import { useState } from 'react'
import DialogBase from '@/components/ui/DialogBase'
import Button from '@/components/ui/Button'
import { useDialogStore } from '@/lib/stores/dialogs'
import { editorActions } from '@/lib/stores/editor'

export default function ParagraphDialog() {
  const [dialogState, dialogDispatch] = useDialogStore()
  const [leftIndent, setLeftIndent] = useState('0')
  const [rightIndent, setRightIndent] = useState('0')
  const [firstLine, setFirstLine] = useState('0')
  const [alignment, setAlignment] = useState('left')

  function applySettings() {
    editorActions.setAlignment(alignment as 'left' | 'center' | 'right')
    dialogDispatch({ type: 'CLOSE', name: 'paragraph' })
    document.getElementById('editor')?.focus()
  }

  return (
    <DialogBase title="Paragraph" visible={dialogState.paragraph} onClose={() => dialogDispatch({ type: 'CLOSE', name: 'paragraph' })}>
      <fieldset>
        <legend>Indentation</legend>
        <div style={{ padding: '2px 0', color: '#808080', fontSize: '11px', fontStyle: 'italic' }}>Indentation is not yet implemented.</div>
        <div className="paragraph-row"><label>Left:</label><input type="text" className="dialog-input small-input" value={leftIndent} onChange={e => setLeftIndent(e.target.value)} disabled /><span className="unit">in</span></div>
        <div className="paragraph-row"><label>Right:</label><input type="text" className="dialog-input small-input" value={rightIndent} onChange={e => setRightIndent(e.target.value)} disabled /><span className="unit">in</span></div>
        <div className="paragraph-row"><label>First line:</label><input type="text" className="dialog-input small-input" value={firstLine} onChange={e => setFirstLine(e.target.value)} disabled /><span className="unit">in</span></div>
      </fieldset>
      <fieldset>
        <legend>Alignment</legend>
        <select className="dialog-select" value={alignment} onChange={e => setAlignment(e.target.value)}>
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="center">Center</option>
        </select>
      </fieldset>
      <div className="dialog-buttons">
        <Button onClick={applySettings}>OK</Button>
        <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'paragraph' })}>Cancel</Button>
      </div>
    </DialogBase>
  )
}
