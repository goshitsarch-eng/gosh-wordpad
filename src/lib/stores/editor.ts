import { create } from './create'

interface EditorState {
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
  isStrikethrough: boolean
  alignment: 'left' | 'center' | 'right'
  isBulletList: boolean
  fontFamily: string
  fontSize: string
  fontColor: string
}

type EditorAction =
  | { type: 'UPDATE_FORMAT_STATE' }
  | { type: 'SET_FONT_FAMILY'; family: string }
  | { type: 'SET_FONT_SIZE'; size: string }
  | { type: 'SET_FONT_COLOR'; color: string }

function queryFormatState(): Partial<EditorState> {
  const isBold = document.queryCommandState('bold')
  const isItalic = document.queryCommandState('italic')
  const isUnderline = document.queryCommandState('underline')
  const isStrikethrough = document.queryCommandState('strikeThrough')
  const isBulletList = document.queryCommandState('insertUnorderedList')

  let alignment: 'left' | 'center' | 'right' = 'left'
  if (document.queryCommandState('justifyCenter')) alignment = 'center'
  else if (document.queryCommandState('justifyRight')) alignment = 'right'

  let fontFamily = 'Arial'
  const fontName = document.queryCommandValue('fontName')
  if (fontName) fontFamily = fontName.replace(/['"]/g, '')

  let fontSize = '10'
  const fontSizeValue = document.queryCommandValue('fontSize')
  if (fontSizeValue) {
    const sizeMap: Record<string, string> = {
      '1': '8', '2': '10', '3': '12', '4': '14', '5': '18', '6': '24', '7': '36'
    }
    if (sizeMap[fontSizeValue]) fontSize = sizeMap[fontSizeValue]
  }

  let fontColor = '#000000'
  const color = document.queryCommandValue('foreColor')
  if (color) fontColor = color

  return { isBold, isItalic, isUnderline, isStrikethrough, isBulletList, alignment, fontFamily, fontSize, fontColor }
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'UPDATE_FORMAT_STATE':
      return { ...state, ...queryFormatState() }
    case 'SET_FONT_FAMILY':
      return { ...state, fontFamily: action.family }
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.size }
    case 'SET_FONT_COLOR':
      return { ...state, fontColor: action.color }
    default:
      return state
  }
}

const initialState: EditorState = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  alignment: 'left',
  isBulletList: false,
  fontFamily: 'Arial',
  fontSize: '10',
  fontColor: '#000000'
}

export const useEditorStore = create(initialState, editorReducer)

// Helper functions that exec commands and update state
export function getFontSizeIndex(size: string): number {
  const sizeNum = parseInt(size)
  if (sizeNum <= 8) return 1
  if (sizeNum <= 10) return 2
  if (sizeNum <= 12) return 3
  if (sizeNum <= 14) return 4
  if (sizeNum <= 18) return 5
  if (sizeNum <= 24) return 6
  return 7
}

export const editorActions = {
  toggleBold() {
    document.execCommand('bold')
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  },
  toggleItalic() {
    document.execCommand('italic')
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  },
  toggleUnderline() {
    document.execCommand('underline')
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  },
  toggleStrikethrough() {
    document.execCommand('strikeThrough')
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  },
  setAlignment(align: 'left' | 'center' | 'right') {
    switch (align) {
      case 'left': document.execCommand('justifyLeft'); break
      case 'center': document.execCommand('justifyCenter'); break
      case 'right': document.execCommand('justifyRight'); break
    }
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  },
  toggleBullets() {
    document.execCommand('insertUnorderedList')
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  },
  setFontFamily(family: string) {
    document.execCommand('fontName', false, family)
    useEditorStore.dispatch({ type: 'SET_FONT_FAMILY', family })
  },
  setFontSize(size: string) {
    const sizeIndex = getFontSizeIndex(size)
    document.execCommand('fontSize', false, sizeIndex.toString())
    useEditorStore.dispatch({ type: 'SET_FONT_SIZE', size })
  },
  setFontColor(color: string) {
    document.execCommand('foreColor', false, color)
    useEditorStore.dispatch({ type: 'SET_FONT_COLOR', color })
  },
  updateFormatState() {
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  }
}
