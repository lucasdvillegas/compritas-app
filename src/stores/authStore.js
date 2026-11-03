import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from '@/boot/axios'

const hasStorage = typeof window !== 'undefined'

let rememberSession = false

/**
 * Storage para pinia-plugin-persistedstate.
 * Si el usuario marcó "Recordarme" se guarda en localStorage;
 * si no, la sesión vive solo en sessionStorage.
 */
const persistentStorage = {
  getItem(key) {
    if (!hasStorage) {
      return null
    }

    return localStorage.getItem(key) ?? sessionStorage.getItem(key)
  },

  setItem(key, value) {
    if (!hasStorage) {
      return
    }

    localStorage.removeItem(key)
    sessionStorage.removeItem(key)

    const storage = rememberSession ? localStorage : sessionStorage
    storage.setItem(key, value)
  },

  removeItem(key) {
    if (!hasStorage) {
      return
    }

    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    login({ email, password, remember = false }) {
      this.loading = true
      rememberSession = remember

      return api
        .post('/auth/login', { email, password })
        .then(({ data }) => {
          this.token = data.data.token
          this.user = data.data.user

          return data
        })
        .finally(() => {
          this.loading = false
        })
    },

    register({ name, email, password, passwordConfirmation }) {
      this.loading = true
      rememberSession = true

      return api
        .post('/auth/register', {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        })
        .then(({ data }) => {
          this.token = data.data.token
          this.user = data.data.user

          return data
        })
        .finally(() => {
          this.loading = false
        })
    },

    logout() {
      return api
        .post('/auth/logout')
        .catch(() => {
          // Si el token ya no es válido, igual cerramos la sesión local.
        })
        .finally(() => {
          this.token = null
          this.user = null
        })
    },
  },

  persist: {
    key: 'auth',
    storage: persistentStorage,
    pick: ['token', 'user'],
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
