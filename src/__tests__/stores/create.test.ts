import { describe, it, expect, vi } from 'vitest'
import { create } from '@/lib/stores/create'

interface TestState {
  count: number
}

type TestAction = { type: 'INCREMENT' } | { type: 'DECREMENT' } | { type: 'SET'; value: number }

function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 }
    case 'DECREMENT':
      return { count: state.count - 1 }
    case 'SET':
      return { count: action.value }
    default:
      return state
  }
}

describe('create store factory', () => {
  it('returns initial state via getState', () => {
    const store = create({ count: 0 }, testReducer)
    expect(store.getState()).toEqual({ count: 0 })
  })

  it('updates state via dispatch', () => {
    const store = create({ count: 0 }, testReducer)
    store.dispatch({ type: 'INCREMENT' })
    expect(store.getState()).toEqual({ count: 1 })
  })

  it('handles multiple dispatches', () => {
    const store = create({ count: 0 }, testReducer)
    store.dispatch({ type: 'INCREMENT' })
    store.dispatch({ type: 'INCREMENT' })
    store.dispatch({ type: 'DECREMENT' })
    expect(store.getState()).toEqual({ count: 1 })
  })

  it('supports SET action with payload', () => {
    const store = create({ count: 0 }, testReducer)
    store.dispatch({ type: 'SET', value: 42 })
    expect(store.getState()).toEqual({ count: 42 })
  })

  it('notifies subscribers on dispatch', () => {
    const store = create({ count: 0 }, testReducer)
    const listener = vi.fn()
    store.subscribe(listener)
    store.dispatch({ type: 'INCREMENT' })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('unsubscribes correctly', () => {
    const store = create({ count: 0 }, testReducer)
    const listener = vi.fn()
    const unsub = store.subscribe(listener)
    unsub()
    store.dispatch({ type: 'INCREMENT' })
    expect(listener).not.toHaveBeenCalled()
  })

  it('supports multiple subscribers', () => {
    const store = create({ count: 0 }, testReducer)
    const listener1 = vi.fn()
    const listener2 = vi.fn()
    store.subscribe(listener1)
    store.subscribe(listener2)
    store.dispatch({ type: 'INCREMENT' })
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
  })

  it('does not mutate previous state', () => {
    const store = create({ count: 0 }, testReducer)
    const before = store.getState()
    store.dispatch({ type: 'INCREMENT' })
    const after = store.getState()
    expect(before).not.toBe(after)
    expect(before.count).toBe(0)
    expect(after.count).toBe(1)
  })
})
