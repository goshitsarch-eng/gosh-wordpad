import { useEffect, useRef } from 'react'

interface ContextMenuProps {
  x: number
  y: number
  visible: boolean
  onClose: () => void
}

interface MenuItem {
  label: string
  shortcut?: string
  action: () => void
  separator?: false
}

interface SeparatorItem {
  separator: true
}

type MenuEntry = MenuItem | SeparatorItem

export default function ContextMenu({ x, y, visible, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) return

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    function handleScroll() {
      onClose()
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('scroll', handleScroll, true)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('scroll', handleScroll, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [visible, onClose])

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!visible || !menuRef.current) return
    const menu = menuRef.current
    const rect = menu.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    if (rect.right > vw) {
      menu.style.left = `${x - rect.width}px`
    }
    if (rect.bottom > vh) {
      menu.style.top = `${y - rect.height}px`
    }
  }, [visible, x, y])

  if (!visible) return null

  const items: MenuEntry[] = [
    {
      label: 'Undo',
      shortcut: 'Ctrl+Z',
      action: () => { document.execCommand('undo'); onClose() },
    },
    { separator: true },
    {
      label: 'Cut',
      shortcut: 'Ctrl+X',
      action: () => { document.execCommand('cut'); onClose() },
    },
    {
      label: 'Copy',
      shortcut: 'Ctrl+C',
      action: () => { document.execCommand('copy'); onClose() },
    },
    {
      label: 'Paste',
      shortcut: 'Ctrl+V',
      action: () => {
        navigator.clipboard.readText().then(text => {
          document.execCommand('insertText', false, text)
        }).catch(() => {
          document.execCommand('paste')
        })
        onClose()
      },
    },
    {
      label: 'Delete',
      shortcut: 'Del',
      action: () => {
        const selection = window.getSelection()
        if (selection && !selection.isCollapsed) {
          document.execCommand('delete')
        }
        onClose()
      },
    },
    { separator: true },
    {
      label: 'Select All',
      shortcut: 'Ctrl+A',
      action: () => { document.execCommand('selectAll'); onClose() },
    },
  ]

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) =>
        'separator' in item && item.separator ? (
          <div key={i} className="context-menu-separator" />
        ) : (
          <div
            key={i}
            className="context-menu-item"
            onMouseDown={(e) => {
              e.preventDefault()
              ;(item as MenuItem).action()
            }}
          >
            <span className="context-menu-label">{(item as MenuItem).label}</span>
            {(item as MenuItem).shortcut && (
              <span className="context-menu-shortcut">{(item as MenuItem).shortcut}</span>
            )}
          </div>
        )
      )}
    </div>
  )
}
