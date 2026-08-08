import apiClient from './client'

export const ratesApi = {
  getAll: () => apiClient.get('/rates'),
  getOne: (asset: string) => apiClient.get(`/rates/${asset}`),
}
