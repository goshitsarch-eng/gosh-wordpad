import { useState, useEffect } from 'react'
import DialogBase from '@/components/ui/DialogBase'
import Button from '@/components/ui/Button'
import { useDialogStore } from '@/lib/stores/dialogs'
import { useDocumentStore } from '@/lib/stores/document'
import { useMessageStore } from '@/lib/stores/message'
import { getEditor } from '@/lib/editor-ref'

function selectTextAtPosition(editor: HTMLElement, start: number, length: number) {
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT)
  let currentPos = 0
  let startNode: Text | null = null
  let startOffset = 0
  let endNode: Text | null = null
  let endOffset = 0

  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const nodeLength = node.length
    if (!startNode && currentPos + nodeLength > start) {
      startNode = node
      startOffset = start - currentPos
    }
    if (startNode && currentPos + nodeLength >= start + length) {
      endNode = node
      endOffset = start + length - currentPos
      break
    }
    currentPos += nodeLength
  }

  if (startNode && endNode) {
    const range = document.createRange()
    range.setStart(startNode, startOffset)
    range.setEnd(endNode, endOffset)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    const rect = range.getBoundingClientRect()
    if (rect) {
      editor.scrollTop = editor.scrollTop + rect.top - editor.getBoundingClientRect().top - 50
    }
  }
}

export default function FindDialog() {
  const [dialogState, dialogDispatch] = useDialogStore()
  const [docState, docDispatch] = useDocumentStore()
  const [findInput, setFindInput] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)

  useEffect(() => {
    if (dialogState.find && docState.lastSearchTerm) {
      setFindInput(docState.lastSearchTerm)
    }
  }, [dialogState.find])

  function findText() {
    if (!findInput) return
    docDispatch({ type: 'UPDATE_SEARCH', term: findInput, options: { matchCase, wholeWord } })

    const editor = getEditor()
    if (!editor) return

    const selection = window.getSelection()
    const range = selection?.rangeCount && selection.rangeCount > 0 ? selection.getRangeAt(0) : null

    const content = editor.innerText
    let searchContent = content
    let term = findInput
    if (!matchCase) {
      searchContent = content.toLowerCase()
      term = findInput.toLowerCase()
    }

    let startPos = 0
    if (range) {
      const preSelectionRange = document.createRange()
      preSelectionRange.selectNodeContents(editor)
      preSelectionRange.setEnd(range.endContainer, range.endOffset)
      startPos = preSelectionRange.toString().length
    }

    let foundPos = searchContent.indexOf(term, startPos)
    if (foundPos === -1 && startPos > 0) foundPos = searchContent.indexOf(term)
    if (foundPos === -1) { useMessageStore.dispatch({ type: 'SHOW', title: 'Find', message: 'Cannot find "' + findInput + '"' }); return }

    if (wholeWord) {
      const beforeChar = foundPos > 0 ? searchContent[foundPos - 1] : ' '
      const afterChar = foundPos + term.length < searchContent.length ? searchContent[foundPos + term.length] : ' '
      if (/\w/.test(beforeChar) || /\w/.test(afterChar)) {
        let nextPos = searchContent.indexOf(term, foundPos + 1)
        while (nextPos !== -1) {
          const before = nextPos > 0 ? searchContent[nextPos - 1] : ' '
          const after = nextPos + term.length < searchContent.length ? searchContent[nextPos + term.length] : ' '
          if (!/\w/.test(before) && !/\w/.test(after)) { foundPos = nextPos; break }
          nextPos = searchContent.indexOf(term, nextPos + 1)
        }
      }
    }

    selectTextAtPosition(editor, foundPos, term.length)
  }

  return (
    <DialogBase title="Find" visible={dialogState.find} onClose={() => dialogDispatch({ type: 'CLOSE', name: 'find' })}>
      <div className="dialog-row">
        <label htmlFor="find-input">Find what:</label>
        <input type="text" id="find-input" className="dialog-input" value={findInput} onChange={e => setFindInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && findText()} />
      </div>
      <div className="dialog-options">
        <label className="checkbox-label">
          <input type="checkbox" checked={matchCase} onChange={e => setMatchCase(e.target.checked)} /> Match case
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={wholeWord} onChange={e => setWholeWord(e.target.checked)} /> Match whole word only
        </label>
      </div>
      <div className="dialog-buttons">
        <Button onClick={findText}>Find Next</Button>
        <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'find' })}>Cancel</Button>
      </div>
    </DialogBase>
  )
}
