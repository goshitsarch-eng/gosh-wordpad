export interface FileOpenedData {
  content: string
  filePath: string
}

export interface SearchOptions {
  matchCase: boolean
  wholeWord: boolean
}

export type DialogType =
  | 'find'
  | 'replace'
  | 'font'
  | 'paragraph'
  | 'tabs'
  | 'dateTime'
  | 'color'
  | 'pageSetup'
  | 'options'
  | 'about'
