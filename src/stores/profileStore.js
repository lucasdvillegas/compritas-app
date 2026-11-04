import { acceptHMRUpdate, defineStore } from 'pinia'
import { profileServices } from '@/services/profileServices'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    user: null,
    pin: null,
    loading: false,
  }),

  actions: {
    fetchProfile() {
      this.loading = true

      return profileServices
        .getProfile()
        .then(({ data }) => {
          this.user = data.data.user
          this.pin = data.data.pin

          return data.data
        })
        .finally(() => {
          this.loading = false
        })
    },

    regeneratePin() {
      return profileServices.regeneratePin().then(({ data }) => {
        this.pin = data.data.pin

        return this.pin
      })
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProfileStore, import.meta.hot))
}
