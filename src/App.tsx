import { useEffect } from 'react'
import { useViewStore } from '@/lib/stores/view'
import { appAPI } from '@/lib/electron-api'

import MenuBar from '@/components/layout/MenuBar'
import Toolbar from '@/components/layout/Toolbar'
import FormatBar from '@/components/layout/FormatBar'
import Ruler from '@/components/layout/Ruler'
import Editor from '@/components/editor/Editor'
import StatusBar from '@/components/layout/StatusBar'

import FindDialog from '@/components/dialogs/FindDialog'
import ReplaceDialog from '@/components/dialogs/ReplaceDialog'
import FontDialog from '@/components/dialogs/FontDialog'
import ParagraphDialog from '@/components/dialogs/ParagraphDialog'
import TabsDialog from '@/components/dialogs/TabsDialog'
import DateTimeDialog from '@/components/dialogs/DateTimeDialog'
import ColorDialog from '@/components/dialogs/ColorDialog'
import PageSetupDialog from '@/components/dialogs/PageSetupDialog'
import OptionsDialog from '@/components/dialogs/OptionsDialog'
import AboutDialog from '@/components/dialogs/AboutDialog'
import MessageDialog from '@/components/ui/MessageDialog'

export default function App() {
  const [viewState, viewDispatch] = useViewStore()

  useEffect(() => {
    viewDispatch({ type: 'INITIALIZE' })

    appAPI.setContentGetter(() => {
      const editor = document.getElementById('editor')
      return editor ? editor.innerHTML : ''
    })

    if (window.electronAPI?.onCloseRequested) {
      window.electronAPI.onCloseRequested(() => {
        appAPI.exitApp()
      })
    }
  }, [])

  return (
    <>
      <MenuBar />
      {viewState.toolbar && <Toolbar />}
      {viewState.formatBar && <FormatBar />}
      {viewState.ruler && <Ruler />}
      <Editor />
      {viewState.statusBar && <StatusBar />}

      <FindDialog />
      <ReplaceDialog />
      <FontDialog />
      <ParagraphDialog />
      <TabsDialog />
      <DateTimeDialog />
      <ColorDialog />
      <PageSetupDialog />
      <OptionsDialog />
      <AboutDialog />
      <MessageDialog />
    </>
  )
}
