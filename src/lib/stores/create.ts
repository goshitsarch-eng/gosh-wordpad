import { useSyncExternalStore } from 'react'

type Listener = () => void

export function create<S, A>(initialState: S, reducer: (state: S, action: A) => S) {
  let state = initialState
  const listeners = new Set<Listener>()

  function getState() {
    return state
  }

  function dispatch(action: A) {
    state = reducer(state, action)
    listeners.forEach(l => l())
  }

  function subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function useStore(): [S, (action: A) => void] {
    const snapshot = useSyncExternalStore(subscribe, getState)
    return [snapshot, dispatch]
  }

  useStore.getState = getState
  useStore.dispatch = dispatch
  useStore.subscribe = subscribe

  return useStore
}
