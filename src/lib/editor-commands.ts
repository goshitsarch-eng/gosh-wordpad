// Centralized wrapper for document.execCommand.
// Swapping this module for a Tiptap/ProseMirror adapter replaces
// every execCommand call site in the application at once.

export const editorCommands = {
  bold: () => document.execCommand('bold'),
  italic: () => document.execCommand('italic'),
  underline: () => document.execCommand('underline'),
  strikeThrough: () => document.execCommand('strikeThrough'),
  justifyLeft: () => document.execCommand('justifyLeft'),
  justifyCenter: () => document.execCommand('justifyCenter'),
  justifyRight: () => document.execCommand('justifyRight'),
  insertUnorderedList: () => document.execCommand('insertUnorderedList'),
  fontName: (value: string) => document.execCommand('fontName', false, value),
  fontSize: (value: string) => document.execCommand('fontSize', false, value),
  foreColor: (value: string) => document.execCommand('foreColor', false, value),
  undo: () => document.execCommand('undo'),
  redo: () => document.execCommand('redo'),
  cut: () => document.execCommand('cut'),
  copy: () => document.execCommand('copy'),
  paste: () => document.execCommand('paste'),
  delete: () => document.execCommand('delete'),
  selectAll: () => document.execCommand('selectAll'),
  insertText: (value: string) => document.execCommand('insertText', false, value),
  queryState: (command: string) => document.queryCommandState(command),
  queryValue: (command: string) => document.queryCommandValue(command),
}
