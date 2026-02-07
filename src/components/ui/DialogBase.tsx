import React, { useRef, useState, useEffect, useCallback } from 'react'

interface DialogBaseProps {
  title: string
  visible: boolean
  onClose: () => void
  large?: boolean
  width?: string
  children?: React.ReactNode
}

// Remember last position per dialog title across opens
const savedPositions = new Map<string, { x: number; y: number }>()

export default function DialogBase({ title, visible, onClose, large = false, width = '', children }: DialogBaseProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const initialRef = useRef({ x: 0, y: 0 })
  const positionApplied = useRef(false)

  // Apply saved position when dialog becomes visible
  useEffect(() => {
    if (!visible) {
      positionApplied.current = false
      return
    }
    if (positionApplied.current || !dialogRef.current) return
    positionApplied.current = true

    const saved = savedPositions.get(title)
    if (saved) {
      dialogRef.current.style.transform = 'none'
      dialogRef.current.style.left = saved.x + 'px'
      dialogRef.current.style.top = saved.y + 'px'
    }
  }, [visible, title])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('dialog-close')) return
    setIsDragging(true)
    if (dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect()
      initialRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      dialogRef.current.style.transform = 'none'
      dialogRef.current.style.left = rect.left + 'px'
      dialogRef.current.style.top = rect.top + 'px'
    }
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e: MouseEvent) => {
      if (!dialogRef.current) return
      e.preventDefault()
      const x = e.clientX - initialRef.current.x
      const y = e.clientY - initialRef.current.y
      dialogRef.current.style.left = x + 'px'
      dialogRef.current.style.top = y + 'px'
    }
    const handleMouseUp = () => {
      setIsDragging(false)
      // Save position when drag ends
      if (dialogRef.current) {
        const rect = dialogRef.current.getBoundingClientRect()
        savedPositions.set(title, { x: rect.left, y: rect.top })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, title])

  if (!visible) return null

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className={`dialog ${large ? 'dialog-large' : ''}`}
        style={width ? { width } : undefined}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="dialog-titlebar" onMouseDown={handleMouseDown}>
          <span className="dialog-title">{title}</span>
          <button className="dialog-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="dialog-content">
          {children}
        </div>
      </div>
    </div>
  )
}
