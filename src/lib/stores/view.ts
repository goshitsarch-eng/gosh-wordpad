import { create } from './create'

interface ViewState {
  toolbar: boolean
  formatBar: boolean
  ruler: boolean
  statusBar: boolean
  darkMode: boolean
}

type ViewAction =
  | { type: 'INITIALIZE' }
  | { type: 'TOGGLE_TOOLBAR' }
  | { type: 'TOGGLE_FORMAT_BAR' }
  | { type: 'TOGGLE_RULER' }
  | { type: 'TOGGLE_STATUS_BAR' }
  | { type: 'TOGGLE_DARK_MODE' }

function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

function saveViewState(state: ViewState) {
  localStorage.setItem('viewState', JSON.stringify({
    toolbar: state.toolbar,
    formatBar: state.formatBar,
    ruler: state.ruler,
    statusBar: state.statusBar
  }))
}

function viewReducer(state: ViewState, action: ViewAction): ViewState {
  let next: ViewState
  switch (action.type) {
    case 'INITIALIZE': {
      const savedTheme = localStorage.getItem('theme')
      const darkMode = savedTheme === 'dark'
      let toolbar = true, formatBar = true, ruler = true, statusBar = true
      const saved = localStorage.getItem('viewState')
      if (saved) {
        try {
          const p = JSON.parse(saved)
          toolbar = p.toolbar ?? true
          formatBar = p.formatBar ?? true
          ruler = p.ruler ?? true
          statusBar = p.statusBar ?? true
        } catch { /* defaults */ }
      }
      applyTheme(darkMode)
      return { toolbar, formatBar, ruler, statusBar, darkMode }
    }
    case 'TOGGLE_TOOLBAR':
      next = { ...state, toolbar: !state.toolbar }
      saveViewState(next)
      return next
    case 'TOGGLE_FORMAT_BAR':
      next = { ...state, formatBar: !state.formatBar }
      saveViewState(next)
      return next
    case 'TOGGLE_RULER':
      next = { ...state, ruler: !state.ruler }
      saveViewState(next)
      return next
    case 'TOGGLE_STATUS_BAR':
      next = { ...state, statusBar: !state.statusBar }
      saveViewState(next)
      return next
    case 'TOGGLE_DARK_MODE':
      next = { ...state, darkMode: !state.darkMode }
      localStorage.setItem('theme', next.darkMode ? 'dark' : 'light')
      applyTheme(next.darkMode)
      return next
    default:
      return state
  }
}

const initialState: ViewState = {
  toolbar: true,
  formatBar: true,
  ruler: true,
  statusBar: true,
  darkMode: false
}

export const useViewStore = create(initialState, viewReducer)
