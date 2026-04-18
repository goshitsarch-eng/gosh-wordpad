import { useState, useEffect } from 'react'
import { useDocumentStore } from '@/lib/stores/document'
import { getEditor } from '@/lib/editor-ref'

function getEditorStats() {
  const editor = getEditor()
  if (!editor) return { line: 1, col: 1, words: 0 }

  const selection = window.getSelection()
  let line = 1
  let col = 1

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const preRange = document.createRange()
    preRange.selectNodeContents(editor)
    preRange.setEnd(range.startContainer, range.startOffset)
    const textBefore = preRange.toString()
    const lines = textBefore.split('\n')
    line = lines.length
    col = (lines[lines.length - 1]?.length ?? 0) + 1
  }

  const text = editor.innerText || ''
  const trimmed = text.trim()
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length

  return { line, col, words }
}

export default function StatusBar() {
  const [docState] = useDocumentStore()
  const [stats, setStats] = useState({ line: 1, col: 1, words: 0 })

  useEffect(() => {
    const editor = getEditor()
    if (!editor) return

    let frame = 0
    function schedule() {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        setStats(getEditorStats())
      })
    }

    editor.addEventListener('input', schedule)
    editor.addEventListener('keyup', schedule)
    editor.addEventListener('mouseup', schedule)
    document.addEventListener('selectionchange', schedule)

    schedule()

    return () => {
      if (frame) cancelAnimationFrame(frame)
      editor.removeEventListener('input', schedule)
      editor.removeEventListener('keyup', schedule)
      editor.removeEventListener('mouseup', schedule)
      document.removeEventListener('selectionchange', schedule)
    }
  }, [])

  return (
    <div className="status-bar">
      <div className="status-section status-help">
        {docState.isModified ? '* Modified' : 'For Help, press F1'}
      </div>
      <div className="status-section" style={{ marginLeft: 'auto', paddingRight: '4px', display: 'flex', gap: '12px' }}>
        <span>Ln {stats.line}</span>
        <span>Col {stats.col}</span>
        <span>{stats.words} word{stats.words !== 1 ? 's' : ''}</span>
      </div>
      <div className="status-grip" />
    </div>
  )
}
