import { api } from '@/boot/axios'

export const categoriesServices = {
  getCategories(params = {}) {
    return api.get('/categories', { params })
  },

  createCategory(payload) {
    return api.post('/categories', payload)
  },

  updateCategory(id, payload) {
    return api.put(`/categories/${id}`, payload)
  },

  deleteCategory(id) {
    return api.delete(`/categories/${id}`)
  },
}
