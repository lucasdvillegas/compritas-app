import { api } from '@/boot/axios'

export const statsServices = {
  getSummary(params = {}) {
    return api.get('/stats/summary', { params })
  },

  getMonthly(params = {}) {
    return api.get('/stats/monthly', { params })
  },

  getCategories(params = {}) {
    return api.get('/stats/categories', { params })
  },

  getProducts(params = {}) {
    return api.get('/stats/products', { params })
  },
}
