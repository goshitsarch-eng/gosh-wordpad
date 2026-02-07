import { create } from './create'
import { editorCommands } from '../editor-commands'

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
  const isBold = editorCommands.queryState('bold')
  const isItalic = editorCommands.queryState('italic')
  const isUnderline = editorCommands.queryState('underline')
  const isStrikethrough = editorCommands.queryState('strikeThrough')
  const isBulletList = editorCommands.queryState('insertUnorderedList')

  let alignment: 'left' | 'center' | 'right' = 'left'
  if (editorCommands.queryState('justifyCenter')) alignment = 'center'
  else if (editorCommands.queryState('justifyRight')) alignment = 'right'

  let fontFamily = 'Arial'
  const fontName = editorCommands.queryValue('fontName')
  if (fontName) fontFamily = fontName.replace(/['"]/g, '')

  let fontSize = '10'
  const fontSizeValue = editorCommands.queryValue('fontSize')
  if (fontSizeValue) {
    const sizeMap: Record<string, string> = {
      '1': '8', '2': '10', '3': '12', '4': '14', '5': '18', '6': '24', '7': '36'
    }
    if (sizeMap[fontSizeValue]) fontSize = sizeMap[fontSizeValue]
  }

  let fontColor = '#000000'
  const color = editorCommands.queryValue('foreColor')
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
    editorCommands.bold()
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  },
  toggleItalic() {
    editorCommands.italic()
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  },
  toggleUnderline() {
    editorCommands.underline()
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  },
  toggleStrikethrough() {
    editorCommands.strikeThrough()
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  },
  setAlignment(align: 'left' | 'center' | 'right') {
    switch (align) {
      case 'left': editorCommands.justifyLeft(); break
      case 'center': editorCommands.justifyCenter(); break
      case 'right': editorCommands.justifyRight(); break
    }
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  },
  toggleBullets() {
    editorCommands.insertUnorderedList()
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  },
  setFontFamily(family: string) {
    editorCommands.fontName(family)
    useEditorStore.dispatch({ type: 'SET_FONT_FAMILY', family })
  },
  setFontSize(size: string) {
    const sizeIndex = getFontSizeIndex(size)
    editorCommands.fontSize(sizeIndex.toString())
    useEditorStore.dispatch({ type: 'SET_FONT_SIZE', size })
  },
  setFontColor(color: string) {
    editorCommands.foreColor(color)
    useEditorStore.dispatch({ type: 'SET_FONT_COLOR', color })
  },
  updateFormatState() {
    useEditorStore.dispatch({ type: 'UPDATE_FORMAT_STATE' })
  }
}
