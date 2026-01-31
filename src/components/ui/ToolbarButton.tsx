import React from 'react'

interface ToolbarButtonProps {
  onClick?: () => void
  title?: string
  active?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

export default function ToolbarButton({ onClick, title = '', active = false, disabled = false, children }: ToolbarButtonProps) {
  return (
    <button
      className={`toolbar-button ${active ? 'active' : ''}`}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}
