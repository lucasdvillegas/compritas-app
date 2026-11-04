<template>
  <div class="auth-form">
    <header class="auth-form__header">
      <h1 class="auth-form__title">Iniciá sesión</h1>
      <p class="auth-form__subtitle">Ingresá con tu correo y contraseña.</p>
    </header>

    <q-form @submit="onSubmit" class="q-mt-lg">
      <q-input
        v-model="email"
        v-bind="emailProps"
        label="Correo electrónico"
        type="email"
        autocomplete="email"
        outlined
        dense
        :class="errors.email ? 'q-mb-md' : 'q-mb-sm'"
      />

      <q-input
        v-model="password"
        v-bind="passwordProps"
        label="Contraseña"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
        outlined
        dense
        :class="errors.password ? 'q-mb-md' : 'q-mb-sm'"
      >
        <template #append>
          <q-btn
            flat
            dense
            round
            :icon="showPassword ? 'visibility_off' : 'visibility'"
            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <div class="row items-center">
        <q-checkbox v-model="remember" label="Recordarme" color="primary" class="q-mb-md" dense />
      </div>

      <q-btn
        type="submit"
        label="Ingresar"
        class="full-width auth-form__submit"
        no-caps
        unelevated
        :loading="authStore.loading"
      />
    </q-form>

    <div class="auth-form__footer">
      ¿No tenés cuenta?
      <router-link :to="{ name: 'register' }" class="auth-form__link">Registrate</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import es from 'yup-es'
import { useAuthStore } from '@/stores/authStore'

yup.setLocale(es)

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()

const schema = yup.object({
  email: yup.string().required().email().label('Correo electrónico'),
  password: yup.string().required().label('Contraseña'),
})

const initialValues = ref({
  email: '',
  password: '',
  remember: false,
})

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: schema,
  initialValues: initialValues,
})

const fieldConfig = (state) => ({
  props: {
    error: !!state.errors[0],
    'error-message': state.errors[0],
  },
})

const [email, emailProps] = defineField('email', fieldConfig)
const [password, passwordProps] = defineField('password', fieldConfig)
const [remember] = defineField('remember')

const showPassword = ref(false)

function redirectTarget() {
  const redirect = route.query.redirect

  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : { path: '/' }
}

const onSubmit = handleSubmit((values) => {
  return authStore
    .login({
      email: values.email,
      password: values.password,
      remember: values.remember,
    })
    .then(({ message }) => {
      $q.notify({
        type: 'positive',
        message,
      })

      return router.push(redirectTarget())
    })
    .catch((error) => {
      if (error.response?.data?.message) {
        $q.notify({
          type: 'negative',
          message: error.response.data.message,
        })
      }
    })
})
</script>
