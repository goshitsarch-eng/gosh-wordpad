import { useState } from 'react'
import DialogBase from '@/components/ui/DialogBase'
import Button from '@/components/ui/Button'
import { useDialogStore } from '@/lib/stores/dialogs'

export default function TabsDialog() {
  const [dialogState, dialogDispatch] = useDialogStore()
  const [tabPosition, setTabPosition] = useState('')
  const [tabsList, setTabsList] = useState<string[]>([])
  const [selectedTab, setSelectedTab] = useState('')
  const [defaultTabs, setDefaultTabs] = useState('0.5')

  function setTab() {
    if (tabPosition && !tabsList.includes(tabPosition)) {
      setTabsList([...tabsList, tabPosition].sort((a, b) => parseFloat(a) - parseFloat(b)))
      setTabPosition('')
    }
  }

  function clearTab() {
    if (selectedTab) {
      setTabsList(tabsList.filter(t => t !== selectedTab))
      setSelectedTab('')
    }
  }

  return (
    <DialogBase title="Tabs" visible={dialogState.tabs} onClose={() => dialogDispatch({ type: 'CLOSE', name: 'tabs' })}>
      <div className="dialog-row">
        <label>Tab stop position:</label>
        <input type="text" className="dialog-input" value={tabPosition} onChange={e => setTabPosition(e.target.value)} />
      </div>
      <div className="tabs-list-container">
        <select className="tabs-list" size={5} value={selectedTab} onChange={e => setSelectedTab(e.target.value)}>
          {tabsList.map(tab => <option key={tab} value={tab}>{tab}"</option>)}
        </select>
      </div>
      <div className="dialog-row">
        <label>Default tab stops:</label>
        <input type="text" className="dialog-input small-input" value={defaultTabs} onChange={e => setDefaultTabs(e.target.value)} />
        <span className="unit">in</span>
      </div>
      <div className="dialog-buttons">
        <Button onClick={setTab}>Set</Button>
        <Button onClick={clearTab}>Clear</Button>
        <Button onClick={() => { setTabsList([]); setSelectedTab('') }}>Clear All</Button>
        <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'tabs' })}>OK</Button>
        <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'tabs' })}>Cancel</Button>
      </div>
    </DialogBase>
  )
}
