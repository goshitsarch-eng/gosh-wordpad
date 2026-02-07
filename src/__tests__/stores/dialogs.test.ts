import { describe, it, expect, beforeEach } from 'vitest'
import { useDialogStore } from '@/lib/stores/dialogs'

describe('dialog store', () => {
  beforeEach(() => {
    useDialogStore.dispatch({ type: 'CLOSE_ALL' })
  })

  it('starts with all dialogs closed', () => {
    const state = useDialogStore.getState()
    expect(state.find).toBe(false)
    expect(state.replace).toBe(false)
    expect(state.font).toBe(false)
    expect(state.about).toBe(false)
  })

  it('OPEN opens the specified dialog', () => {
    useDialogStore.dispatch({ type: 'OPEN', name: 'find' })
    expect(useDialogStore.getState().find).toBe(true)
  })

  it('OPEN closes all other dialogs', () => {
    useDialogStore.dispatch({ type: 'OPEN', name: 'find' })
    useDialogStore.dispatch({ type: 'OPEN', name: 'replace' })
    const state = useDialogStore.getState()
    expect(state.find).toBe(false)
    expect(state.replace).toBe(true)
  })

  it('CLOSE closes only the specified dialog', () => {
    useDialogStore.dispatch({ type: 'OPEN', name: 'font' })
    useDialogStore.dispatch({ type: 'CLOSE', name: 'font' })
    expect(useDialogStore.getState().font).toBe(false)
  })

  it('CLOSE_ALL closes all dialogs', () => {
    useDialogStore.dispatch({ type: 'OPEN', name: 'about' })
    useDialogStore.dispatch({ type: 'CLOSE_ALL' })
    const state = useDialogStore.getState()
    const allClosed = Object.values(state).every(v => v === false)
    expect(allClosed).toBe(true)
  })

  it('opens each dialog type correctly', () => {
    const dialogTypes = ['find', 'replace', 'font', 'paragraph', 'tabs', 'dateTime', 'color', 'pageSetup', 'options', 'about'] as const
    for (const name of dialogTypes) {
      useDialogStore.dispatch({ type: 'OPEN', name })
      expect(useDialogStore.getState()[name]).toBe(true)
    }
  })
})
