import apiClient from './client'

export const chatApi = {
  sendMessage: (payload: { content: string; conversationId?: string }) =>
    apiClient.post('/chat/messages', payload),

  getConversations: () => apiClient.get('/chat/conversations'),

  getMessages: (conversationId: string) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`),

  createConversation: () => apiClient.post('/chat/conversations'),
}
