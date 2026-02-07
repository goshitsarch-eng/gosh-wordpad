import { describe, it, expect, vi, beforeEach } from 'vitest'
import { editorCommands } from '@/lib/editor-commands'

// jsdom doesn't implement execCommand/queryCommandState/queryCommandValue
// Define them so we can spy on them
document.execCommand = vi.fn(() => true)
document.queryCommandState = vi.fn(() => false)
document.queryCommandValue = vi.fn(() => '')

describe('editorCommands', () => {
  beforeEach(() => {
    vi.mocked(document.execCommand).mockClear()
    vi.mocked(document.queryCommandState).mockClear()
    vi.mocked(document.queryCommandValue).mockClear()
  })

  it('bold calls execCommand with "bold"', () => {
    editorCommands.bold()
    expect(document.execCommand).toHaveBeenCalledWith('bold')
  })

  it('italic calls execCommand with "italic"', () => {
    editorCommands.italic()
    expect(document.execCommand).toHaveBeenCalledWith('italic')
  })

  it('underline calls execCommand with "underline"', () => {
    editorCommands.underline()
    expect(document.execCommand).toHaveBeenCalledWith('underline')
  })

  it('strikeThrough calls execCommand with "strikeThrough"', () => {
    editorCommands.strikeThrough()
    expect(document.execCommand).toHaveBeenCalledWith('strikeThrough')
  })

  it('justifyLeft calls execCommand with "justifyLeft"', () => {
    editorCommands.justifyLeft()
    expect(document.execCommand).toHaveBeenCalledWith('justifyLeft')
  })

  it('justifyCenter calls execCommand', () => {
    editorCommands.justifyCenter()
    expect(document.execCommand).toHaveBeenCalledWith('justifyCenter')
  })

  it('justifyRight calls execCommand', () => {
    editorCommands.justifyRight()
    expect(document.execCommand).toHaveBeenCalledWith('justifyRight')
  })

  it('undo calls execCommand with "undo"', () => {
    editorCommands.undo()
    expect(document.execCommand).toHaveBeenCalledWith('undo')
  })

  it('redo calls execCommand with "redo"', () => {
    editorCommands.redo()
    expect(document.execCommand).toHaveBeenCalledWith('redo')
  })

  it('fontName passes the value to execCommand', () => {
    editorCommands.fontName('Arial')
    expect(document.execCommand).toHaveBeenCalledWith('fontName', false, 'Arial')
  })

  it('fontSize passes the value to execCommand', () => {
    editorCommands.fontSize('3')
    expect(document.execCommand).toHaveBeenCalledWith('fontSize', false, '3')
  })

  it('foreColor passes the value to execCommand', () => {
    editorCommands.foreColor('#ff0000')
    expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000')
  })

  it('insertText passes the value to execCommand', () => {
    editorCommands.insertText('Hello')
    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, 'Hello')
  })

  it('queryState delegates to document.queryCommandState', () => {
    vi.mocked(document.queryCommandState).mockReturnValue(true)
    expect(editorCommands.queryState('bold')).toBe(true)
    expect(document.queryCommandState).toHaveBeenCalledWith('bold')
  })

  it('queryValue delegates to document.queryCommandValue', () => {
    vi.mocked(document.queryCommandValue).mockReturnValue('Arial')
    expect(editorCommands.queryValue('fontName')).toBe('Arial')
    expect(document.queryCommandValue).toHaveBeenCalledWith('fontName')
  })

  it('cut calls execCommand with "cut"', () => {
    editorCommands.cut()
    expect(document.execCommand).toHaveBeenCalledWith('cut')
  })

  it('copy calls execCommand with "copy"', () => {
    editorCommands.copy()
    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })

  it('selectAll calls execCommand with "selectAll"', () => {
    editorCommands.selectAll()
    expect(document.execCommand).toHaveBeenCalledWith('selectAll')
  })

  it('delete calls execCommand with "delete"', () => {
    editorCommands.delete()
    expect(document.execCommand).toHaveBeenCalledWith('delete')
  })
})
