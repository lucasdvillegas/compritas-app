import { api } from '@/boot/axios'

export const listsServices = {
  getLists(params = {}) {
    return api.get('/lists', { params })
  },

  getList(id) {
    return api.get(`/lists/${id}`)
  },

  createList(payload) {
    return api.post('/lists', payload)
  },

  updateList(id, payload) {
    return api.patch(`/lists/${id}`, payload)
  },

  deleteList(id) {
    return api.delete(`/lists/${id}`)
  },

  completeList(id) {
    return api.patch(`/lists/${id}/complete`)
  },

  addItem(listId, payload) {
    return api.post(`/lists/${listId}/items`, payload)
  },

  addItems(listId, items) {
    return api.post(`/lists/${listId}/items/bulk`, { items })
  },

  updateItem(listId, itemId, payload) {
    return api.patch(`/lists/${listId}/items/${itemId}`, payload)
  },

  removeItem(listId, itemId) {
    return api.delete(`/lists/${listId}/items/${itemId}`)
  },

  getMembers(listId) {
    return api.get(`/lists/${listId}/members`)
  },

  inviteByPin(listId, pin) {
    return api.post(`/lists/${listId}/invitations`, { pin })
  },

  getInvitations(listId) {
    return api.get(`/lists/${listId}/invitations`)
  },

  revokeInvitation(listId, invitationId) {
    return api.delete(`/lists/${listId}/invitations/${invitationId}`)
  },

  removeMember(listId, userId) {
    return api.delete(`/lists/${listId}/members/${userId}`)
  },

  leaveList(listId) {
    return api.delete(`/lists/${listId}/members/me`)
  },
}
