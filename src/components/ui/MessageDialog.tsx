import DialogBase from './DialogBase'
import Button from './Button'
import { useMessageStore } from '@/lib/stores/message'

export default function MessageDialog() {
  const [state, dispatch] = useMessageStore()

  return (
    <DialogBase title={state.title} visible={state.visible} onClose={() => dispatch({ type: 'CLOSE' })} width="350px">
      <div style={{ padding: '12px 8px', whiteSpace: 'pre-wrap' }}>{state.message}</div>
      <div className="dialog-buttons">
        <Button onClick={() => dispatch({ type: 'CLOSE' })}>OK</Button>
      </div>
    </DialogBase>
  )
}
