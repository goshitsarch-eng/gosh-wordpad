import { useEffect, useRef, useState, useCallback } from 'react'
import { useDocumentStore } from '@/lib/stores/document'
import { editorActions } from '@/lib/stores/editor'
import ContextMenu from './ContextMenu'

export default function Editor() {
  const editorRef = useRef<HTMLDivElement>(null)
  const [, dispatch] = useDocumentStore()
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 })

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }))
  }, [])

  useEffect(() => {
    if (!editorRef.current) return
    editorRef.current.style.fontFamily = 'Arial, sans-serif'
    editorRef.current.style.fontSize = '10pt'
    editorRef.current.focus()
  }, [])

  function handleInput() {
    dispatch({ type: 'MARK_MODIFIED' })
  }

  function handleKeyUp() {
    editorActions.updateFormatState()
  }

  function handleMouseUp() {
    editorActions.updateFormatState()
  }

  function handleClick() {
    editorActions.updateFormatState()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); editorActions.toggleBold(); break
        case 'i': e.preventDefault(); editorActions.toggleItalic(); break
        case 'u': e.preventDefault(); editorActions.toggleUnderline(); break
        case 'l': e.preventDefault(); editorActions.setAlignment('left'); break
        case 'e': e.preventDefault(); editorActions.setAlignment('center'); break
        case 'r': e.preventDefault(); editorActions.setAlignment('right'); break
      }
    }
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY })
  }

  return (
    <div className="editor-container">
      <div
        id="editor"
        ref={editorRef}
        className="editor"
        contentEditable
        spellCheck
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
        role="textbox"
        aria-multiline="true"
        tabIndex={0}
      />
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={closeContextMenu}
      />
    </div>
  )
}
