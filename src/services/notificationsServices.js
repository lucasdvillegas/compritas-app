import { api } from '@/boot/axios'

export const notificationsServices = {
  getNotifications(params = {}) {
    return api.get('/notifications', { params })
  },

  getUnreadCount() {
    return api.get('/notifications/unread-count')
  },

  markAsRead(id) {
    return api.patch(`/notifications/${id}/read`)
  },

  markAllAsRead() {
    return api.post('/notifications/read-all')
  },
}
