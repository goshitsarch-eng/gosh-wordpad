import { create } from './create'
import type { SearchOptions } from '../types'
import { appAPI } from '../electron-api'

interface DocumentState {
  content: string
  filePath: string | null
  isModified: boolean
  lastSearchTerm: string
  lastSearchOptions: SearchOptions
}

type DocumentAction =
  | { type: 'MARK_MODIFIED' }
  | { type: 'CLEAR' }
  | { type: 'SET_CONTENT'; content: string; filePath?: string }
  | { type: 'UPDATE_SEARCH'; term: string; options: SearchOptions }

function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'MARK_MODIFIED':
      if (!state.isModified) {
        appAPI.setDocumentModified(true)
      }
      return { ...state, isModified: true }
    case 'CLEAR':
      appAPI.setDocumentModified(false)
      return { ...state, content: '', filePath: null, isModified: false }
    case 'SET_CONTENT':
      appAPI.setDocumentModified(false)
      return {
        ...state,
        content: action.content,
        filePath: action.filePath !== undefined ? action.filePath : state.filePath,
        isModified: false
      }
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
