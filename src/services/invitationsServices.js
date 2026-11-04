import { api } from '@/boot/axios'

export const invitationsServices = {
  accept(id) {
    return api.post(`/invitations/${id}/accept`)
  },

  decline(id) {
    return api.post(`/invitations/${id}/decline`)
  },
}
