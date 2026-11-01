<template>
  <div class="auth-form">
    <header class="auth-form__header">
      <div class="auth-form__eyebrow">Acceso</div>
      <h1 class="auth-form__title">Volvé al show</h1>
      <p class="auth-form__subtitle">El mundo puede esperar. Tu carrito, no.</p>
    </header>

    <q-form @submit="onSubmit" class="q-mt-lg q-gutter-y-md">
      <q-input
        v-model="email"
        v-bind="emailProps"
        label="Correo electrónico"
        type="email"
        autocomplete="email"
        outlined
        dense
      />

      <q-input
        v-model="password"
        v-bind="passwordProps"
        label="Contraseña"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
        outlined
        dense
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
        <q-checkbox v-model="remember" label="Recordarme" color="primary" dense />
      </div>

      <q-btn
        type="submit"
        label="Entrar al show"
        class="full-width auth-form__submit"
        no-caps
        unelevated
      />
    </q-form>

    <div class="auth-form__footer">
      ¿Aún no estás en la banda?
      <router-link :to="{ name: 'register' }" class="auth-form__link">Sumate</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import es from 'yup-es'

yup.setLocale(es)

const schema = yup.object({
  email: yup.string().required().email().label('Correo electrónico'),
  password: yup.string().required().label('Contraseña'),
})

const initialValues = ref({
  email: '',
  password: '',
  remember: false,
})

const { defineField, handleSubmit } = useForm({
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

const onSubmit = handleSubmit(() => {
  // TODO: conectar con el servicio de autenticación.
})
</script>
