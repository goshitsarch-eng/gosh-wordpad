import { useState, useEffect, useRef, useCallback } from 'react'
import { useViewStore } from '@/lib/stores/view'
import { useDialogStore } from '@/lib/stores/dialogs'
import { useMessageStore } from '@/lib/stores/message'
import { appAPI } from '@/lib/electron-api'
import { editorCommands } from '@/lib/editor-commands'
import { handleNewFile, handleOpenFile } from '@/lib/actions'
import { platformShortcut } from '@/lib/platform'

type SeparatorItem = { separator: true }
type ActionItem = { label: string; action?: string; shortcut?: string; disabled?: boolean }
type CheckboxItem = { action: string; label: string; checkbox: true; checkedKey: 'toolbar' | 'formatBar' | 'ruler' | 'statusBar' | 'darkMode' }
type MenuItem = SeparatorItem | ActionItem | CheckboxItem

interface Menu {
  id: string
  label: string
  items: MenuItem[]
}

const menus: Menu[] = [
  {
    id: 'file', label: 'File', items: [
      { action: 'new', label: 'New', shortcut: 'Ctrl+N' },
      { action: 'open', label: 'Open...', shortcut: 'Ctrl+O' },
      { action: 'save', label: 'Save', shortcut: 'Ctrl+S' },
      { action: 'save-as', label: 'Save As...' },
      { separator: true },
      { action: 'print', label: 'Print...', shortcut: 'Ctrl+P' },
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
]

function getActionableItems(items: MenuItem[]): (ActionItem | CheckboxItem)[] {
  return items.filter((item): item is ActionItem | CheckboxItem => !('separator' in item))
}

export default function MenuBar() {
  const [viewState, viewDispatch] = useViewStore()
  const [, dialogDispatch] = useDialogStore()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [menuBarActive, setMenuBarActive] = useState(false)
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(-1)
  const [focusedItemIndex, setFocusedItemIndex] = useState(-1)
  const menuLabelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const menuItemRefs = useRef<(HTMLDivElement | null)[]>([])

  function openMenu(menuId: string) {
    setActiveMenu(menuId)
    setMenuBarActive(true)
    setFocusedItemIndex(-1)
  }

  function closeAllMenus() {
    setActiveMenu(null)
    setMenuBarActive(false)
    setFocusedMenuIndex(-1)
    setFocusedItemIndex(-1)
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
      case 'new': await handleNewFile(); break
      case 'open': await handleOpenFile(); break
      case 'save': await appAPI.saveFile(); break
      case 'save-as': await appAPI.saveFileAs(); break
      case 'print': appAPI.print(); break
      case 'page-setup': dialogDispatch({ type: 'OPEN', name: 'pageSetup' }); break
      case 'exit': await appAPI.exitApp(); break
      case 'undo': editorCommands.undo(); break
      case 'redo': editorCommands.redo(); break
      case 'cut': editorCommands.cut(); break
      case 'copy': editorCommands.copy(); break
      case 'paste': editorCommands.paste(); break
      case 'paste-special': editorCommands.paste(); break
      case 'clear': editorCommands.delete(); break
      case 'select-all': editorCommands.selectAll(); break
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
      case 'object': useMessageStore.dispatch({ type: 'SHOW', title: 'Insert Object', message: 'Object insertion is not implemented in this version.' }); break
      case 'font': dialogDispatch({ type: 'OPEN', name: 'font' }); break
      case 'bullet': editorCommands.insertUnorderedList(); break
      case 'paragraph': dialogDispatch({ type: 'OPEN', name: 'paragraph' }); break
      case 'tabs': dialogDispatch({ type: 'OPEN', name: 'tabs' }); break
      case 'help-topics':
        useMessageStore.dispatch({ type: 'SHOW', title: 'WordPad Help', message: 'This is a clone of Windows 98 WordPad.\n\nUse the File menu to open and save documents.\nUse the Edit menu for copy, paste, and find operations.\nUse the Format menu to change fonts and paragraph settings.' })
        break
      case 'about': dialogDispatch({ type: 'OPEN', name: 'about' }); break
    }
    closeAllMenus()
  }

  // Focus the correct menu label when focusedMenuIndex changes
  useEffect(() => {
    if (focusedMenuIndex >= 0 && menuLabelRefs.current[focusedMenuIndex]) {
      menuLabelRefs.current[focusedMenuIndex]?.focus()
    }
  }, [focusedMenuIndex])

  // Focus the correct dropdown item when focusedItemIndex changes
  useEffect(() => {
    if (focusedItemIndex >= 0 && menuItemRefs.current[focusedItemIndex]) {
      menuItemRefs.current[focusedItemIndex]?.focus()
    }
  }, [focusedItemIndex])

  const handleMenuBarKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentMenuIdx = menus.findIndex(m => m.id === activeMenu)

    switch (e.key) {
      case 'ArrowRight': {
        e.preventDefault()
        const nextIdx = activeMenu !== null
          ? (currentMenuIdx + 1) % menus.length
          : focusedMenuIndex >= 0 ? (focusedMenuIndex + 1) % menus.length : 0
        setFocusedMenuIndex(nextIdx)
        if (menuBarActive) openMenu(menus[nextIdx].id)
        break
      }
      case 'ArrowLeft': {
        e.preventDefault()
        const prevIdx = activeMenu !== null
          ? (currentMenuIdx - 1 + menus.length) % menus.length
          : focusedMenuIndex >= 0 ? (focusedMenuIndex - 1 + menus.length) % menus.length : menus.length - 1
        setFocusedMenuIndex(prevIdx)
        if (menuBarActive) openMenu(menus[prevIdx].id)
        break
      }
      case 'ArrowDown': {
        e.preventDefault()
        if (!menuBarActive && focusedMenuIndex >= 0) {
          openMenu(menus[focusedMenuIndex].id)
          setFocusedItemIndex(0)
        } else if (activeMenu) {
          const actionable = getActionableItems(menus[currentMenuIdx].items)
          const nextItem = focusedItemIndex < actionable.length - 1 ? focusedItemIndex + 1 : 0
          setFocusedItemIndex(nextItem)
        }
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        if (activeMenu) {
          const actionable = getActionableItems(menus[currentMenuIdx].items)
          const prevItem = focusedItemIndex > 0 ? focusedItemIndex - 1 : actionable.length - 1
          setFocusedItemIndex(prevItem)
        }
        break
      }
      case 'Home': {
        e.preventDefault()
        if (activeMenu) {
          setFocusedItemIndex(0)
        } else {
          setFocusedMenuIndex(0)
        }
        break
      }
      case 'End': {
        e.preventDefault()
        if (activeMenu) {
          const actionable = getActionableItems(menus[currentMenuIdx].items)
          setFocusedItemIndex(actionable.length - 1)
        } else {
          setFocusedMenuIndex(menus.length - 1)
        }
        break
      }
      case 'Enter':
      case ' ': {
        e.preventDefault()
        if (activeMenu && focusedItemIndex >= 0) {
          const actionable = getActionableItems(menus[currentMenuIdx].items)
          const item = actionable[focusedItemIndex]
          if (item && !('disabled' in item && item.disabled)) {
            handleAction('checkbox' in item ? item.action : item.action)
          }
        } else if (focusedMenuIndex >= 0 && !menuBarActive) {
          openMenu(menus[focusedMenuIndex].id)
          setFocusedItemIndex(0)
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        if (menuBarActive) {
          closeAllMenus()
          if (focusedMenuIndex >= 0) {
            menuLabelRefs.current[focusedMenuIndex]?.focus()
          }
        }
        break
      }
    }
  }, [activeMenu, menuBarActive, focusedMenuIndex, focusedItemIndex])

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
    <div className="menu-bar" role="menubar" onKeyDown={handleMenuBarKeyDown}>
      {menus.map((menu, menuIdx) => {
        return (
          <div
            key={menu.id}
            className={`menu-item ${activeMenu === menu.id ? 'active' : ''}`}
            onMouseEnter={() => handleMenuItemHover(menu.id)}
          >
            <span
              ref={el => { menuLabelRefs.current[menuIdx] = el }}
              className="menu-label"
              role="menuitem"
              tabIndex={menuIdx === 0 ? 0 : -1}
              aria-haspopup="true"
              aria-expanded={activeMenu === menu.id}
              onMouseDown={e => { e.preventDefault(); handleMenuItemClick(menu.id); setFocusedMenuIndex(menuIdx) }}
              onFocus={() => setFocusedMenuIndex(menuIdx)}
            >
              {menu.label}
            </span>
            {activeMenu === menu.id && (
              <div className="menu-dropdown" role="menu" aria-label={menu.label}>
                {(() => {
                  // Reset item refs for this dropdown
                  menuItemRefs.current = []
                  let actionIdx = -1
                  return menu.items.map((item, i) => {
                    if ('separator' in item) {
                      return <div key={i} className="menu-separator" role="separator" />
                    }
                    actionIdx++
                    const currentActionIdx = actionIdx
                    if ('checkbox' in item) {
                      return (
                        <div
                          key={i}
                          ref={el => { menuItemRefs.current[currentActionIdx] = el }}
                          className={`menu-option checkbox ${focusedItemIndex === currentActionIdx ? 'focused' : ''}`}
                          role="menuitemcheckbox"
                          aria-checked={viewState[item.checkedKey]}
                          tabIndex={-1}
                          onClick={() => handleAction(item.action)}
                        >
                          <span className={`menu-check ${viewState[item.checkedKey] ? 'visible' : ''}`}>&#10003;</span>
                          <span className="menu-text">{item.label}</span>
                        </div>
                      )
                    }
                    return (
                      <div
                        key={i}
                        ref={el => { menuItemRefs.current[currentActionIdx] = el }}
                        className={`menu-option ${item.disabled ? 'disabled' : ''} ${focusedItemIndex === currentActionIdx ? 'focused' : ''}`}
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => !item.disabled && handleAction(item.action)}
                      >
                        <span className="menu-text">{item.label}</span>
                        {item.shortcut && <span className="menu-shortcut">{platformShortcut(item.shortcut)}</span>}
                      </div>
                    )
                  })
                })()}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
