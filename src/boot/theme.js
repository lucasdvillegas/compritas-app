import { boot } from 'quasar/wrappers'
import { Dark } from 'quasar'

export default boot(() => {
  const storedTheme = localStorage.getItem('theme')
  const storedTypography = localStorage.getItem('typography')

  Dark.set(storedTheme === 'dark')
  document.body.classList.toggle('app-typography-dyslexic', storedTypography === 'dyslexic')
})
