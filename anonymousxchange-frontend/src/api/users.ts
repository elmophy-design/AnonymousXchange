import apiClient from './client'

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  preferredChannel?: string
  currentPassword?: string
  newPassword?: string
}

export const usersApi = {
  getMe: () => apiClient.get('/users/me'),
  updateMe: (payload: UpdateProfilePayload) => apiClient.patch('/users/me', payload),
}
