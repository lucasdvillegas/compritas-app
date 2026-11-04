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
}
