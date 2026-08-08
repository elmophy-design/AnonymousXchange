import apiClient from './client'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    apiClient.post('/auth/register', payload),

  logout: () => apiClient.post('/auth/logout'),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
}
