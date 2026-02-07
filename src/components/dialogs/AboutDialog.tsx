import DialogBase from '@/components/ui/DialogBase'
import Button from '@/components/ui/Button'
import { useDialogStore } from '@/lib/stores/dialogs'

export default function AboutDialog() {
  const [dialogState, dialogDispatch] = useDialogStore()

  return (
    <DialogBase title="About WordPad" visible={dialogState.about} onClose={() => dialogDispatch({ type: 'CLOSE', name: 'about' })} width="400px">
      <div className="about-content">
        <div className="about-header">
          <div className="about-icon" />
          <div className="about-text">
            <div className="about-title">WordPad Clone</div>
            <div className="about-version">Version {__APP_VERSION__}</div>
          </div>
        </div>
        <div className="about-info">
          <p><strong>Built by Goshitsarch</strong></p>
          <p>A faithful recreation of Windows 98 WordPad</p>
          <p><a href="https://github.com/goshitsarch-eng/gosh-wordpad" target="_blank" rel="noopener noreferrer">github.com/goshitsarch-eng/gosh-wordpad</a></p>
          <p className="about-warning">This is an open source project for educational purposes. Not affiliated with Microsoft Corporation.</p>
        </div>
        <div className="dialog-buttons about-buttons">
          <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'about' })}>OK</Button>
        </div>
      </div>
    </DialogBase>
  )
}
