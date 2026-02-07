import { create } from './create'

interface MessageState {
  visible: boolean
  title: string
  message: string
}

type MessageAction =
  | { type: 'SHOW'; title: string; message: string }
  | { type: 'CLOSE' }

function messageReducer(state: MessageState, action: MessageAction): MessageState {
  switch (action.type) {
    case 'SHOW': return { visible: true, title: action.title, message: action.message }
    case 'CLOSE': return { visible: false, title: '', message: '' }
    default: return state
  }
}

export const useMessageStore = create<MessageState, MessageAction>(
  { visible: false, title: '', message: '' },
  messageReducer
)
