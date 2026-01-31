import { create } from './create'
import type { DialogType } from '../types'

interface DialogState {
  find: boolean
  replace: boolean
  font: boolean
  paragraph: boolean
  tabs: boolean
  dateTime: boolean
  color: boolean
  pageSetup: boolean
  options: boolean
  about: boolean
}

type DialogAction =
  | { type: 'OPEN'; name: DialogType }
  | { type: 'CLOSE'; name: DialogType }
  | { type: 'CLOSE_ALL' }

const allClosed: DialogState = {
  find: false, replace: false, font: false, paragraph: false,
  tabs: false, dateTime: false, color: false, pageSetup: false,
  options: false, about: false
}

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case 'OPEN':
      return { ...allClosed, [action.name]: true }
    case 'CLOSE':
      return { ...state, [action.name]: false }
    case 'CLOSE_ALL':
      return { ...allClosed }
    default:
      return state
  }
}

export const useDialogStore = create({ ...allClosed }, dialogReducer)
