import { useState, useEffect } from 'react'
import DialogBase from '@/components/ui/DialogBase'
import Button from '@/components/ui/Button'
import { useDialogStore } from '@/lib/stores/dialogs'
import { useDocumentStore } from '@/lib/stores/document'
import { useMessageStore } from '@/lib/stores/message'
import { editorCommands } from '@/lib/editor-commands'
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
    if (!startNode && currentPos + nodeLength > start) { startNode = node; startOffset = start - currentPos }
    if (startNode && currentPos + nodeLength >= start + length) { endNode = node; endOffset = start + length - currentPos; break }
    currentPos += nodeLength
  }
  if (startNode && endNode) {
    const range = document.createRange()
    range.setStart(startNode, startOffset)
    range.setEnd(endNode, endOffset)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default function ReplaceDialog() {
  const [dialogState, dialogDispatch] = useDialogStore()
  const [docState, docDispatch] = useDocumentStore()
  const [findInput, setFindInput] = useState('')

  useEffect(() => {
    if (dialogState.replace && docState.lastSearchTerm) {
      setFindInput(docState.lastSearchTerm)
    }
  }, [dialogState.replace])
  const [replaceInput, setReplaceInput] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)

  function findText() {
    if (!findInput) return
    docDispatch({ type: 'UPDATE_SEARCH', term: findInput, options: { matchCase, wholeWord } })
    const editor = getEditor()
    if (!editor) return
    const selection = window.getSelection()
    const range = selection?.rangeCount && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
    const content = editor.innerText
    let searchContent = content, term = findInput
    if (!matchCase) { searchContent = content.toLowerCase(); term = findInput.toLowerCase() }
    let startPos = 0
    if (range) {
      const pre = document.createRange(); pre.selectNodeContents(editor); pre.setEnd(range.endContainer, range.endOffset)
      startPos = pre.toString().length
    }
    let foundPos = searchContent.indexOf(term, startPos)
    if (foundPos === -1 && startPos > 0) foundPos = searchContent.indexOf(term)
    if (foundPos === -1) { useMessageStore.dispatch({ type: 'SHOW', title: 'Replace', message: 'Cannot find "' + findInput + '"' }); return }
    selectTextAtPosition(editor, foundPos, term.length)
  }

  function replaceSelected() {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && selection.toString().length > 0) {
      editorCommands.insertText(replaceInput)
      docDispatch({ type: 'MARK_MODIFIED' })
    }
  }

  function replaceAll() {
    if (!findInput) return
    const editor = getEditor()
    if (!editor) return
    let flags = 'g'
    if (!matchCase) flags += 'i'
    const escapedFind = escapeRegExp(findInput)
    const pattern = wholeWord ? `\\b${escapedFind}\\b` : escapedFind
    const regex = new RegExp(pattern, flags)
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT)
    let count = 0
    while (walker.nextNode()) {
      const node = walker.currentNode as Text
      const original = node.textContent ?? ''
      const matches = original.match(regex)
      if (matches) {
        count += matches.length
        node.textContent = original.replace(regex, replaceInput)
      }
    }
    if (count > 0) {
      docDispatch({ type: 'MARK_MODIFIED' })
    }
    useMessageStore.dispatch({ type: 'SHOW', title: 'Replace', message: count > 0 ? `Replaced ${count} occurrence${count !== 1 ? 's' : ''}.` : 'No matches found.' })
  }

  return (
    <DialogBase title="Replace" visible={dialogState.replace} onClose={() => dialogDispatch({ type: 'CLOSE', name: 'replace' })}>
      <div className="dialog-row">
        <label htmlFor="replace-find-input">Find what:</label>
        <input type="text" id="replace-find-input" className="dialog-input" value={findInput} onChange={e => setFindInput(e.target.value)} />
      </div>
      <div className="dialog-row">
        <label htmlFor="replace-with-input">Replace with:</label>
        <input type="text" id="replace-with-input" className="dialog-input" value={replaceInput} onChange={e => setReplaceInput(e.target.value)} />
      </div>
      <div className="dialog-options">
        <label className="checkbox-label"><input type="checkbox" checked={matchCase} onChange={e => setMatchCase(e.target.checked)} /> Match case</label>
        <label className="checkbox-label"><input type="checkbox" checked={wholeWord} onChange={e => setWholeWord(e.target.checked)} /> Match whole word only</label>
      </div>
      <div className="dialog-buttons">
        <Button onClick={findText}>Find Next</Button>
        <Button onClick={replaceSelected}>Replace</Button>
        <Button onClick={replaceAll}>Replace All</Button>
        <Button onClick={() => dialogDispatch({ type: 'CLOSE', name: 'replace' })}>Cancel</Button>
      </div>
    </DialogBase>
  )
}
