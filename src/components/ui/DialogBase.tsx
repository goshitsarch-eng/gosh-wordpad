import React, { useRef, useState, useEffect, useCallback } from 'react'

interface DialogBaseProps {
  title: string
  visible: boolean
  onClose: () => void
  large?: boolean
  width?: string
  children?: React.ReactNode
}

export default function DialogBase({ title, visible, onClose, large = false, width = '', children }: DialogBaseProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const initialRef = useRef({ x: 0, y: 0 })

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
      dialogRef.current.style.left = (e.clientX - initialRef.current.x) + 'px'
      dialogRef.current.style.top = (e.clientY - initialRef.current.y) + 'px'
    }
    const handleMouseUp = () => setIsDragging(false)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  if (!visible) return null

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className={`dialog ${large ? 'dialog-large' : ''}`}
        style={width ? { width } : undefined}
        onClick={e => e.stopPropagation()}
      >
        <div className="dialog-titlebar" onMouseDown={handleMouseDown}>
          <span className="dialog-title">{title}</span>
          <button className="dialog-close" onClick={onClose}>&times;</button>
        </div>
        <div className="dialog-content">
          {children}
        </div>
      </div>
    </div>
  )
}
