import apiClient from './client'

export const chatApi = {
  sendMessage: (payload: { content: string; conversationId?: string }) =>
    apiClient.post('/chat/messages', payload),

  /**
   * Streaming chat (SSE). Prefer this when OPENAI is configured on the backend.
   * Returns an EventSource-like async generator of token chunks via fetch + ReadableStream.
   */
  streamMessage: async function* (payload: {
    content: string
    conversationId?: string
  }): AsyncGenerator<{ event: string; data: unknown }> {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const token = localStorage.getItem('accessToken')
    const res = await fetch(`${base}/chat/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok || !res.body) {
      throw new Error('Stream failed')
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''
      for (const part of parts) {
        const lines = part.split('\n')
        let event = 'message'
        let data = ''
        for (const line of lines) {
          if (line.startsWith('event:')) event = line.slice(6).trim()
          if (line.startsWith('data:')) data += line.slice(5).trim()
        }
        if (data) {
          try {
            yield { event, data: JSON.parse(data) }
          } catch {
            yield { event, data }
          }
        }
      }
    }
  },

  getConversations: () => apiClient.get('/chat/conversations'),

  getMessages: (conversationId: string) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`),

  createConversation: () => apiClient.post('/chat/conversations'),
}
