import { useState, useEffect } from 'react'
import DialogBase from '@/components/ui/DialogBase'
import Button from '@/components/ui/Button'
import { useDialogStore } from '@/lib/stores/dialogs'
import { useDocumentStore } from '@/lib/stores/document'

export default function DateTimeDialog() {
  const [dialogState, dialogDispatch] = useDialogStore()
  const [, docDispatch] = useDocumentStore()
  const [formats, setFormats] = useState<string[]>([])
  const [selectedFormat, setSelectedFormat] = useState('')

  useEffect(() => {
    if (dialogState.dateTime) {
      const now = new Date()
      const f = [
        now.toLocaleDateString('en-US'),
        now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        now.toLocaleTimeString('en-US'),
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        now.toLocaleTimeString('en-US', { hour12: false }),
        now.toLocaleString('en-US'),
        now.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      ]
      setFormats(f)
      setSelectedFormat(f[0])
    }
  }, [dialogState.dateTime])

  function insertDateTime() {
    if (selectedFormat) {
      document.execCommand('insertText', false, selectedFormat)
      docDispatch({ type: 'MARK_MODIFIED' })
    }
    dialogDispatch({ type: 'CLOSE', name: 'dateTime' })
  }

  return (
    <DialogBase title="Date and Time" visible={dialogState.dateTime} onClose={() => dialogDispatch({ type: 'CLOSE', name: 'dateTime' })}>
      <label>Available formats:</label>
      <select className="datetime-list" size={10} value={selectedFormat} onChange={e => setSelectedFormat(e.target.value)} onDoubleClick={insertDateTime}>
        {formats.map((f, i) => <option key={i} value={f}>{f}</option>)}
      </select>
      <div className="dialog-buttons">
        <Button onClick={insertDateTime}>OK</Button>
        <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'dateTime' })}>Cancel</Button>
      </div>
    </DialogBase>
  )
}
