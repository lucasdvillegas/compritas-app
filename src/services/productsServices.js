import { api } from '@/boot/axios'

export const productsServices = {
  getProducts(params = {}) {
    return api.get('/products', { params })
  },

  createProduct(payload) {
    return api.post('/products', payload)
  },

  updateProduct(id, payload) {
    return api.put(`/products/${id}`, payload)
  },

  deleteProduct(id) {
    return api.delete(`/products/${id}`)
  },
}
