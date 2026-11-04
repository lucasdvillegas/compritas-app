import { acceptHMRUpdate, defineStore } from 'pinia'
import { notificationsServices } from '@/services/notificationsServices'
import { invitationsServices } from '@/services/invitationsServices'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
  }),

  getters: {
    hasUnread: (state) => state.unreadCount > 0,
  },

  actions: {
    fetchNotifications({ unreadOnly = false } = {}) {
      this.loading = true

      return notificationsServices
        .getNotifications(unreadOnly ? { unread: 1 } : {})
        .then(({ data }) => {
          this.notifications = data.data

          return this.notifications
        })
        .finally(() => {
          this.loading = false
        })
    },

    fetchUnreadCount() {
      return notificationsServices.getUnreadCount().then(({ data }) => {
        this.unreadCount = data.data.count

        return this.unreadCount
      })
    },

    markAsRead(notification) {
      if (notification.read_at) {
        return Promise.resolve(notification)
      }

      return notificationsServices.markAsRead(notification.id).then(() => {
        notification.read_at = new Date().toISOString()
        this.unreadCount = Math.max(0, this.unreadCount - 1)

        return notification
      })
    },

    markAllAsRead() {
      return notificationsServices.markAllAsRead().then(() => {
        const now = new Date().toISOString()

        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          read_at: notification.read_at ?? now,
        }))
        this.unreadCount = 0
      })
    },

    acceptInvitation(notification) {
      return invitationsServices.accept(notification.data.invitation_id).then(({ data }) => {
        this.applyInvitationResponse(notification, 'accepted')

        return data.data
      })
    },

    declineInvitation(notification) {
      return invitationsServices.decline(notification.data.invitation_id).then(({ data }) => {
        this.applyInvitationResponse(notification, 'declined')

        return data
      })
    },

    applyInvitationResponse(notification, status) {
      notification.data = {
        ...notification.data,
        invitation_status: status,
      }

      if (!notification.read_at) {
        notification.read_at = new Date().toISOString()
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotificationsStore, import.meta.hot))
}
