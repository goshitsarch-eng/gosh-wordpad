import { create } from './create'
import type { SearchOptions } from '../types'

export interface DocumentState {
  content: string
  filePath: string | null
  isModified: boolean
  lastSearchTerm: string
  lastSearchOptions: SearchOptions
}

type DocumentAction =
  | { type: 'MARK_MODIFIED' }
  | { type: 'MARK_SAVED' }
  | { type: 'CLEAR' }
  | { type: 'SET_CONTENT'; content: string; filePath?: string }
  | { type: 'SET_FILE_PATH'; filePath: string }
  | { type: 'UPDATE_SEARCH'; term: string; options: SearchOptions }

function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'MARK_MODIFIED':
      return { ...state, isModified: true }
    case 'MARK_SAVED':
      return { ...state, isModified: false }
    case 'CLEAR':
      return { ...state, content: '', filePath: null, isModified: false }
    case 'SET_CONTENT':
      return {
        ...state,
        content: action.content,
        filePath: action.filePath !== undefined ? action.filePath : state.filePath,
        isModified: false
      }
    case 'SET_FILE_PATH':
      return { ...state, filePath: action.filePath }
    case 'UPDATE_SEARCH':
      return { ...state, lastSearchTerm: action.term, lastSearchOptions: action.options }
    default:
      return state
  }
}

const initialState: DocumentState = {
  content: '',
  filePath: null,
  isModified: false,
  lastSearchTerm: '',
  lastSearchOptions: { matchCase: false, wholeWord: false }
}

export const useDocumentStore = create(initialState, documentReducer)
