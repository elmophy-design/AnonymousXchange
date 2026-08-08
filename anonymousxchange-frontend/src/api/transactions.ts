import apiClient from './client'

export const transactionsApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/transactions', { params }),

  getOne: (id: string) => apiClient.get(`/transactions/${id}`),

  create: (payload: {
    type: string
    asset: string
    amount?: number
    details?: Record<string, unknown>
  }) => apiClient.post('/transactions', payload),
}
