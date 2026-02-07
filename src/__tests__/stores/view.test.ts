import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useViewStore } from '@/lib/stores/view'

describe('view store', () => {
  beforeEach(() => {
    localStorage.clear()
    // Re-initialize to defaults
    useViewStore.dispatch({ type: 'INITIALIZE' })
  })

  it('INITIALIZE returns defaults when no saved state', () => {
    const state = useViewStore.getState()
    expect(state.toolbar).toBe(true)
    expect(state.formatBar).toBe(true)
    expect(state.ruler).toBe(true)
    expect(state.statusBar).toBe(true)
    expect(state.darkMode).toBe(false)
  })

  it('INITIALIZE restores saved view state from localStorage', () => {
    localStorage.setItem('viewState', JSON.stringify({
      toolbar: false,
      formatBar: true,
      ruler: false,
      statusBar: true
    }))
    useViewStore.dispatch({ type: 'INITIALIZE' })
    const state = useViewStore.getState()
    expect(state.toolbar).toBe(false)
    expect(state.ruler).toBe(false)
  })

  it('INITIALIZE restores dark mode from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    useViewStore.dispatch({ type: 'INITIALIZE' })
    expect(useViewStore.getState().darkMode).toBe(true)
  })

  it('TOGGLE_TOOLBAR toggles toolbar state', () => {
    expect(useViewStore.getState().toolbar).toBe(true)
    useViewStore.dispatch({ type: 'TOGGLE_TOOLBAR' })
    expect(useViewStore.getState().toolbar).toBe(false)
    useViewStore.dispatch({ type: 'TOGGLE_TOOLBAR' })
    expect(useViewStore.getState().toolbar).toBe(true)
  })

  it('TOGGLE_FORMAT_BAR toggles formatBar state', () => {
    useViewStore.dispatch({ type: 'TOGGLE_FORMAT_BAR' })
    expect(useViewStore.getState().formatBar).toBe(false)
  })

  it('TOGGLE_RULER toggles ruler state', () => {
    useViewStore.dispatch({ type: 'TOGGLE_RULER' })
    expect(useViewStore.getState().ruler).toBe(false)
  })

  it('TOGGLE_STATUS_BAR toggles statusBar state', () => {
    useViewStore.dispatch({ type: 'TOGGLE_STATUS_BAR' })
    expect(useViewStore.getState().statusBar).toBe(false)
  })

  it('TOGGLE_DARK_MODE toggles dark mode and persists', () => {
    useViewStore.dispatch({ type: 'TOGGLE_DARK_MODE' })
    expect(useViewStore.getState().darkMode).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')

    useViewStore.dispatch({ type: 'TOGGLE_DARK_MODE' })
    expect(useViewStore.getState().darkMode).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('toggle actions persist to localStorage', () => {
    useViewStore.dispatch({ type: 'TOGGLE_TOOLBAR' })
    const saved = JSON.parse(localStorage.getItem('viewState')!)
    expect(saved.toolbar).toBe(false)
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('viewState', 'not-json')
    useViewStore.dispatch({ type: 'INITIALIZE' })
    const state = useViewStore.getState()
    expect(state.toolbar).toBe(true)
    expect(state.formatBar).toBe(true)
  })
})
