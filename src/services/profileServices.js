import { api } from '@/boot/axios'

export const profileServices = {
  getProfile() {
    return api.get('/profile')
  },

  updateProfile(payload) {
    return api.patch('/profile', payload)
  },

  regeneratePin() {
    return api.post('/profile/pin/regenerate')
  },
}
