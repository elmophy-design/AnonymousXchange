import apiClient from './client'

export interface LoginPayload {
  email: string
  password: string
  totpCode?: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export const authApi = {
  login: (payload: LoginPayload) => apiClient.post('/auth/login', payload),
  register: (payload: RegisterPayload) => apiClient.post('/auth/register', payload),
  google: (idToken: string) => apiClient.post('/auth/google', { idToken }),
  verify2FA: (userId: string, totpCode: string) =>
    apiClient.post('/auth/2fa/verify', { userId, totpCode }),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { token, newPassword }),
  setup2FA: () => apiClient.post('/auth/2fa/setup'),
  enable2FA: (totpCode: string) => apiClient.post('/auth/2fa/enable', { totpCode }),
  disable2FA: (totpCode: string) => apiClient.post('/auth/2fa/disable', { totpCode }),
  logout: () => apiClient.post('/auth/logout'),
  refresh: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
}
