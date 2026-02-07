import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerEditor, getEditor, focusEditor } from '@/lib/editor-ref'

describe('editor-ref', () => {
  beforeEach(() => {
    registerEditor(null)
  })

  it('getEditor returns null when no editor registered', () => {
    expect(getEditor()).toBeNull()
  })

  it('getEditor returns the registered element', () => {
    const el = document.createElement('div') as HTMLDivElement
    registerEditor(el)
    expect(getEditor()).toBe(el)
  })

  it('registerEditor(null) clears the editor', () => {
    const el = document.createElement('div') as HTMLDivElement
    registerEditor(el)
    registerEditor(null)
    expect(getEditor()).toBeNull()
  })

  it('focusEditor calls focus on the registered element', () => {
    const el = document.createElement('div') as HTMLDivElement
    el.focus = vi.fn()
    registerEditor(el)
    focusEditor()
    expect(el.focus).toHaveBeenCalledTimes(1)
  })

  it('focusEditor does nothing when no editor registered', () => {
    // Should not throw
    expect(() => focusEditor()).not.toThrow()
  })
})
