import { onBeforeUnmount, onMounted } from 'vue'

export function useRefreshOnFocus(callback) {
  function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      callback()
    }
  }

  onMounted(() => {
    window.addEventListener('focus', callback)
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('focus', callback)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })
}
