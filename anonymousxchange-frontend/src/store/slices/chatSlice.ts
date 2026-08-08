import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
  imageUrl?: string
}

interface ChatState {
  messages: Message[]
  conversationId: string | null
  isTyping: boolean
  loading: boolean
}

const initialState: ChatState = {
  messages: [],
  conversationId: null,
  isTyping: false,
  loading: false,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload
    },
    setConversationId: (state, action: PayloadAction<string | null>) => {
      state.conversationId = action.payload
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload
    },
    clearChat: (state) => {
      state.messages = []
      state.conversationId = null
      state.isTyping = false
    },
  },
})

export const { addMessage, setMessages, setConversationId, setIsTyping, clearChat } =
  chatSlice.actions
export default chatSlice.reducer
