import React from 'react'

interface ButtonProps {
  onClick?: () => void
  title?: string
  active?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export default function Button({ onClick, title = '', active = false, disabled = false, className = '', children }: ButtonProps) {
  return (
    <button
      className={`dialog-button ${active ? 'active' : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}
