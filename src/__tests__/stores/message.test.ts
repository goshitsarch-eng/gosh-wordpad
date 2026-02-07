import { describe, it, expect, beforeEach } from 'vitest'
import { useMessageStore } from '@/lib/stores/message'

describe('message store', () => {
  beforeEach(() => {
    useMessageStore.dispatch({ type: 'CLOSE' })
  })

  it('starts hidden', () => {
    const state = useMessageStore.getState()
    expect(state.visible).toBe(false)
    expect(state.title).toBe('')
    expect(state.message).toBe('')
  })

  it('SHOW makes the message visible with title and message', () => {
    useMessageStore.dispatch({ type: 'SHOW', title: 'Error', message: 'Something went wrong' })
    const state = useMessageStore.getState()
    expect(state.visible).toBe(true)
    expect(state.title).toBe('Error')
    expect(state.message).toBe('Something went wrong')
  })

  it('CLOSE hides the message and clears content', () => {
    useMessageStore.dispatch({ type: 'SHOW', title: 'Test', message: 'Hello' })
    useMessageStore.dispatch({ type: 'CLOSE' })
    const state = useMessageStore.getState()
    expect(state.visible).toBe(false)
    expect(state.title).toBe('')
    expect(state.message).toBe('')
  })

  it('SHOW replaces previous message', () => {
    useMessageStore.dispatch({ type: 'SHOW', title: 'First', message: 'A' })
    useMessageStore.dispatch({ type: 'SHOW', title: 'Second', message: 'B' })
    const state = useMessageStore.getState()
    expect(state.title).toBe('Second')
    expect(state.message).toBe('B')
  })
})
