import { useState } from 'react'
import DialogBase from '@/components/ui/DialogBase'
import Button from '@/components/ui/Button'
import { useDialogStore } from '@/lib/stores/dialogs'

const tabs = [
  { id: 'options-tab1', label: 'Options' },
  { id: 'options-tab2', label: 'Text' },
  { id: 'options-tab3', label: 'Rich Text' },
  { id: 'options-tab4', label: 'Word' },
  { id: 'options-tab5', label: 'Write' },
  { id: 'options-tab6', label: 'Embedded' }
]

export default function OptionsDialog() {
  const [dialogState, dialogDispatch] = useDialogStore()
  const [activeTab, setActiveTab] = useState('options-tab1')
  const [measurementUnits, setMeasurementUnits] = useState('inches')
  const [autoWordSelect, setAutoWordSelect] = useState(true)
  const [textWrap, setTextWrap] = useState('window')
  const [rtfWrap, setRtfWrap] = useState('ruler')

  return (
    <DialogBase title="Options" visible={dialogState.options} onClose={() => dialogDispatch({ type: 'CLOSE', name: 'options' })}>
      <div className="options-tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`options-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
        ))}
      </div>
      <div className="options-tab-content">
        {activeTab === 'options-tab1' && (
          <>
            <fieldset>
              <legend>Measurement units</legend>
              <select className="dialog-select" value={measurementUnits} onChange={e => setMeasurementUnits(e.target.value)}>
                <option value="inches">Inches</option><option value="cm">Centimeters</option><option value="points">Points</option><option value="picas">Picas</option>
              </select>
            </fieldset>
            <label className="checkbox-label"><input type="checkbox" checked={autoWordSelect} onChange={e => setAutoWordSelect(e.target.checked)} /> Automatic word selection</label>
          </>
        )}
        {activeTab === 'options-tab2' && (
          <fieldset>
            <legend>Word wrap</legend>
            <label className="radio-label"><input type="radio" name="text-wrap" value="none" checked={textWrap === 'none'} onChange={e => setTextWrap(e.target.value)} /> No wrap</label>
            <label className="radio-label"><input type="radio" name="text-wrap" value="window" checked={textWrap === 'window'} onChange={e => setTextWrap(e.target.value)} /> Wrap to window</label>
            <label className="radio-label"><input type="radio" name="text-wrap" value="ruler" checked={textWrap === 'ruler'} onChange={e => setTextWrap(e.target.value)} /> Wrap to ruler</label>
          </fieldset>
        )}
        {activeTab === 'options-tab3' && (
          <fieldset>
            <legend>Word wrap</legend>
            <label className="radio-label"><input type="radio" name="rtf-wrap" value="none" checked={rtfWrap === 'none'} onChange={e => setRtfWrap(e.target.value)} /> No wrap</label>
            <label className="radio-label"><input type="radio" name="rtf-wrap" value="window" checked={rtfWrap === 'window'} onChange={e => setRtfWrap(e.target.value)} /> Wrap to window</label>
            <label className="radio-label"><input type="radio" name="rtf-wrap" value="ruler" checked={rtfWrap === 'ruler'} onChange={e => setRtfWrap(e.target.value)} /> Wrap to ruler</label>
          </fieldset>
        )}
        {(activeTab === 'options-tab4' || activeTab === 'options-tab5' || activeTab === 'options-tab6') && (
          <fieldset>
            <legend>Word wrap</legend>
            <label className="radio-label"><input type="radio" name="other-wrap" value="none" /> No wrap</label>
            <label className="radio-label"><input type="radio" name="other-wrap" value="window" /> Wrap to window</label>
            <label className="radio-label"><input type="radio" name="other-wrap" value="ruler" defaultChecked /> Wrap to ruler</label>
          </fieldset>
        )}
      </div>
      <div className="dialog-buttons">
        <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'options' })}>OK</Button>
        <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'options' })}>Cancel</Button>
      </div>
    </DialogBase>
  )
}
