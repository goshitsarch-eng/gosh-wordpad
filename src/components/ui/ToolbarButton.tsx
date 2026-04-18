import React from 'react'
import Tooltip from '@/components/ui/Tooltip'

interface ToolbarButtonProps {
  onClick?: () => void
  title?: string
  active?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

function ToolbarButton({ onClick, title = '', active = false, disabled = false, children }: ToolbarButtonProps) {
  return (
    <Tooltip text={title}>
      <button
        className={`toolbar-button ${active ? 'active' : ''}`}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    </Tooltip>
  )
}

export default React.memo(ToolbarButton)
