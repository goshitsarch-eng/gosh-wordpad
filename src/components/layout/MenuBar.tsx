import { useState, useEffect } from 'react'
import { useViewStore } from '@/lib/stores/view'
import { useDialogStore } from '@/lib/stores/dialogs'
import { useDocumentStore } from '@/lib/stores/document'
import { appAPI } from '@/lib/electron-api'

const menus = [
  {
    id: 'file', label: 'File', items: [
      { action: 'new', label: 'New', shortcut: 'Ctrl+N' },
      { action: 'open', label: 'Open...', shortcut: 'Ctrl+O' },
      { action: 'save', label: 'Save', shortcut: 'Ctrl+S' },
      { action: 'save-as', label: 'Save As...' },
      { separator: true },
      { action: 'print', label: 'Print...', shortcut: 'Ctrl+P' },
      { action: 'print-preview', label: 'Print Preview' },
      { action: 'page-setup', label: 'Page Setup...' },
      { separator: true },
      { label: 'Send...', disabled: true },
      { separator: true },
      { action: 'exit', label: 'Exit', shortcut: 'Alt+F4' }
    ]
  },
  {
    id: 'edit', label: 'Edit', items: [
      { action: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
      { action: 'redo', label: 'Redo', shortcut: 'Ctrl+Y' },
      { separator: true },
      { action: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
      { action: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
      { action: 'paste', label: 'Paste', shortcut: 'Ctrl+V' },
      { action: 'paste-special', label: 'Paste Special...' },
      { action: 'clear', label: 'Clear', shortcut: 'Del' },
      { action: 'select-all', label: 'Select All', shortcut: 'Ctrl+A' },
      { separator: true },
      { action: 'find', label: 'Find...', shortcut: 'Ctrl+F' },
      { action: 'find-next', label: 'Find Next', shortcut: 'F3' },
      { action: 'replace', label: 'Replace...', shortcut: 'Ctrl+H' },
      { separator: true },
      { label: 'Links...', disabled: true },
      { label: 'Object Properties', disabled: true },
      { label: 'Object', disabled: true }
    ]
  },
  {
    id: 'view', label: 'View', items: [
      { action: 'toggle-toolbar', label: 'Toolbar', checkbox: true, checkedKey: 'toolbar' },
      { action: 'toggle-formatbar', label: 'Format Bar', checkbox: true, checkedKey: 'formatBar' },
      { action: 'toggle-ruler', label: 'Ruler', checkbox: true, checkedKey: 'ruler' },
      { action: 'toggle-statusbar', label: 'Status Bar', checkbox: true, checkedKey: 'statusBar' },
      { action: 'toggle-darkmode', label: 'Dark Mode', checkbox: true, checkedKey: 'darkMode' },
      { separator: true },
      { action: 'options', label: 'Options...' }
    ]
  },
  {
    id: 'insert', label: 'Insert', items: [
      { action: 'date-time', label: 'Date and Time...' },
      { action: 'object', label: 'Object...' }
    ]
  },
  {
    id: 'format', label: 'Format', items: [
      { action: 'font', label: 'Font...' },
      { action: 'bullet', label: 'Bullet Style' },
      { action: 'paragraph', label: 'Paragraph...' },
      { action: 'tabs', label: 'Tabs...' }
    ]
  },
  {
    id: 'help', label: 'Help', items: [
      { action: 'help-topics', label: 'Help Topics', shortcut: 'F1' },
      { separator: true },
      { action: 'about', label: 'About WordPad' }
    ]
  }
] as const

type MenuItem = (typeof menus)[number]['items'][number]

export default function MenuBar() {
  const [viewState, viewDispatch] = useViewStore()
  const [, dialogDispatch] = useDialogStore()
  const [, docDispatch] = useDocumentStore()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [menuBarActive, setMenuBarActive] = useState(false)

  function openMenu(menuId: string) {
    setActiveMenu(menuId)
    setMenuBarActive(true)
  }

  function closeAllMenus() {
    setActiveMenu(null)
    setMenuBarActive(false)
  }

  function handleMenuItemClick(menuId: string) {
    if (activeMenu === menuId) closeAllMenus()
    else openMenu(menuId)
  }

  function handleMenuItemHover(menuId: string) {
    if (menuBarActive && activeMenu !== menuId) openMenu(menuId)
  }

  async function handleAction(action: string | undefined) {
    if (!action) return
    switch (action) {
      case 'new': {
        const cleared = await appAPI.newFile()
        if (cleared) {
          const editor = document.getElementById('editor')
          if (editor) editor.innerHTML = ''
          docDispatch({ type: 'CLEAR' })
        }
        break
      }
      case 'open': {
        const data = await appAPI.openFile()
        if (data) {
          const editor = document.getElementById('editor')
          if (editor) editor.innerText = data.content
          docDispatch({ type: 'SET_CONTENT', content: data.content, filePath: data.filePath })
        }
        break
      }
      case 'save': await appAPI.saveFile(); break
      case 'save-as': await appAPI.saveFileAs(); break
      case 'print': appAPI.print(); break
      case 'print-preview': appAPI.printPreview(); break
      case 'page-setup': dialogDispatch({ type: 'OPEN', name: 'pageSetup' }); break
      case 'exit': await appAPI.exitApp(); break
      case 'undo': document.execCommand('undo'); break
      case 'redo': document.execCommand('redo'); break
      case 'cut': document.execCommand('cut'); break
      case 'copy': document.execCommand('copy'); break
      case 'paste': document.execCommand('paste'); break
      case 'paste-special': document.execCommand('paste'); break
      case 'clear': document.execCommand('delete'); break
      case 'select-all': document.execCommand('selectAll'); break
      case 'find': dialogDispatch({ type: 'OPEN', name: 'find' }); break
      case 'find-next': dialogDispatch({ type: 'OPEN', name: 'find' }); break
      case 'replace': dialogDispatch({ type: 'OPEN', name: 'replace' }); break
      case 'toggle-toolbar': viewDispatch({ type: 'TOGGLE_TOOLBAR' }); break
      case 'toggle-formatbar': viewDispatch({ type: 'TOGGLE_FORMAT_BAR' }); break
      case 'toggle-ruler': viewDispatch({ type: 'TOGGLE_RULER' }); break
      case 'toggle-statusbar': viewDispatch({ type: 'TOGGLE_STATUS_BAR' }); break
      case 'toggle-darkmode': viewDispatch({ type: 'TOGGLE_DARK_MODE' }); break
      case 'options': dialogDispatch({ type: 'OPEN', name: 'options' }); break
      case 'date-time': dialogDispatch({ type: 'OPEN', name: 'dateTime' }); break
      case 'object': alert('Object insertion not implemented in this version.'); break
      case 'font': dialogDispatch({ type: 'OPEN', name: 'font' }); break
      case 'bullet': document.execCommand('insertUnorderedList'); break
      case 'paragraph': dialogDispatch({ type: 'OPEN', name: 'paragraph' }); break
      case 'tabs': dialogDispatch({ type: 'OPEN', name: 'tabs' }); break
      case 'help-topics':
        alert('WordPad Help\n\nThis is a clone of Windows 98 WordPad.\n\nUse the File menu to open and save documents.\nUse the Edit menu for copy, paste, and find operations.\nUse the Format menu to change fonts and paragraph settings.')
        break
      case 'about': dialogDispatch({ type: 'OPEN', name: 'about' }); break
    }
    closeAllMenus()
  }

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuBarActive && !(e.target as HTMLElement).closest('.menu-bar')) closeAllMenus()
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && menuBarActive) closeAllMenus()
    }
    document.addEventListener('click', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuBarActive])

  return (
    <div className="menu-bar">
      {menus.map(menu => (
        <div
          key={menu.id}
          className={`menu-item ${activeMenu === menu.id ? 'active' : ''}`}
          onMouseEnter={() => handleMenuItemHover(menu.id)}
        >
          <span
            className="menu-label"
            onMouseDown={e => { e.preventDefault(); handleMenuItemClick(menu.id) }}
          >
            {menu.label}
          </span>
          {activeMenu === menu.id && (
            <div className="menu-dropdown">
              {menu.items.map((item, i) => {
                if ('separator' in item && item.separator) {
                  return <div key={i} className="menu-separator" />
                }
                const mi = item as any
                return (
                  <div
                    key={i}
                    className={`menu-option ${mi.disabled ? 'disabled' : ''} ${mi.checkbox ? 'checkbox' : ''}`}
                    onClick={() => !mi.disabled && handleAction(mi.action)}
                  >
                    {mi.checkbox && (
                      <span className={`menu-check ${(viewState as any)[mi.checkedKey] ? 'visible' : ''}`}>&#10003;</span>
                    )}
                    <span className="menu-text">{mi.label}</span>
                    {mi.shortcut && <span className="menu-shortcut">{mi.shortcut}</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
