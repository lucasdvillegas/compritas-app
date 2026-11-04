import { api } from '@/boot/axios'

export const profileServices = {
  getProfile() {
    return api.get('/profile')
  },

  regeneratePin() {
    return api.post('/profile/pin/regenerate')
  },
}
