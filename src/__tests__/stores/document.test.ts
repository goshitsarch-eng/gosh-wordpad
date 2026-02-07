import { describe, it, expect, beforeEach } from 'vitest'
import { useDocumentStore } from '@/lib/stores/document'

describe('document store', () => {
  beforeEach(() => {
    // Reset to clean state
    useDocumentStore.dispatch({ type: 'CLEAR' })
  })

  it('has correct initial state after CLEAR', () => {
    const state = useDocumentStore.getState()
    expect(state.content).toBe('')
    expect(state.filePath).toBeNull()
    expect(state.isModified).toBe(false)
    expect(state.lastSearchTerm).toBe('')
  })

  it('MARK_MODIFIED sets isModified to true', () => {
    useDocumentStore.dispatch({ type: 'MARK_MODIFIED' })
    expect(useDocumentStore.getState().isModified).toBe(true)
  })

  it('MARK_SAVED sets isModified to false', () => {
    useDocumentStore.dispatch({ type: 'MARK_MODIFIED' })
    useDocumentStore.dispatch({ type: 'MARK_SAVED' })
    expect(useDocumentStore.getState().isModified).toBe(false)
  })

  it('CLEAR resets content, filePath, and isModified', () => {
    useDocumentStore.dispatch({ type: 'SET_CONTENT', content: 'hello', filePath: '/tmp/test.html' })
    useDocumentStore.dispatch({ type: 'MARK_MODIFIED' })
    useDocumentStore.dispatch({ type: 'CLEAR' })
    const state = useDocumentStore.getState()
    expect(state.content).toBe('')
    expect(state.filePath).toBeNull()
    expect(state.isModified).toBe(false)
  })

  it('SET_CONTENT updates content and filePath', () => {
    useDocumentStore.dispatch({ type: 'SET_CONTENT', content: '<p>Hello</p>', filePath: '/tmp/file.html' })
    const state = useDocumentStore.getState()
    expect(state.content).toBe('<p>Hello</p>')
    expect(state.filePath).toBe('/tmp/file.html')
    expect(state.isModified).toBe(false)
  })

  it('SET_CONTENT without filePath preserves existing filePath', () => {
    useDocumentStore.dispatch({ type: 'SET_FILE_PATH', filePath: '/tmp/existing.html' })
    useDocumentStore.dispatch({ type: 'SET_CONTENT', content: 'new content' })
    const state = useDocumentStore.getState()
    expect(state.content).toBe('new content')
    expect(state.filePath).toBe('/tmp/existing.html')
  })

  it('SET_FILE_PATH updates filePath', () => {
    useDocumentStore.dispatch({ type: 'SET_FILE_PATH', filePath: '/home/user/doc.html' })
    expect(useDocumentStore.getState().filePath).toBe('/home/user/doc.html')
  })

  it('UPDATE_SEARCH stores search term and options', () => {
    useDocumentStore.dispatch({
      type: 'UPDATE_SEARCH',
      term: 'hello',
      options: { matchCase: true, wholeWord: false }
    })
    const state = useDocumentStore.getState()
    expect(state.lastSearchTerm).toBe('hello')
    expect(state.lastSearchOptions).toEqual({ matchCase: true, wholeWord: false })
  })

  it('UPDATE_SEARCH with wholeWord option', () => {
    useDocumentStore.dispatch({
      type: 'UPDATE_SEARCH',
      term: 'world',
      options: { matchCase: false, wholeWord: true }
    })
    const state = useDocumentStore.getState()
    expect(state.lastSearchTerm).toBe('world')
    expect(state.lastSearchOptions.wholeWord).toBe(true)
  })
})
