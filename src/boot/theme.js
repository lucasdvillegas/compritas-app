import { boot } from 'quasar/wrappers'
import { Dark } from 'quasar'

export default boot(() => {
  const storedTheme = localStorage.getItem('theme')

  Dark.set(storedTheme === 'dark')
})
