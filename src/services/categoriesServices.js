import { api } from '@/boot/axios'

export const categoriesServices = {
  getCategories() {
    return api.get('/categories')
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
