<template>
  <div class="auth-form">
    <header class="auth-form__header">
      <div class="auth-form__eyebrow">Registro</div>
      <h1 class="auth-form__title">Entrá al desfile</h1>
      <p class="auth-form__subtitle">El mundo puede esperar. Tu carrito, no.</p>
    </header>

    <q-form @submit="onSubmit" class="q-mt-lg">
      <q-input
        v-model="name"
        v-bind="nameProps"
        label="Nombre completo"
        autocomplete="name"
        outlined
        dense
        :class="errors.name ? 'q-mb-md' : 'q-mb-sm'"
      />

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
        autocomplete="new-password"
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

      <q-input
        v-model="confirmPassword"
        v-bind="confirmPasswordProps"
        label="Repetir contraseña"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="new-password"
        outlined
        dense
        :class="errors.confirmPassword ? 'q-mb-md' : 'q-mb-sm'"
      />

      <q-field v-bind="acceptTermsProps" borderless dense class="auth-form__terms">
        <template #control>
          <q-checkbox
            v-model="acceptTerms"
            color="primary"
            label="Acepto los términos y condiciones y la política de privacidad"
            dense
            :class="errors.acceptTerms ? 'q-mb-md' : 'q-mb-sm'"
          />
        </template>
      </q-field>

      <q-btn
        type="submit"
        label="Crear cuenta"
        class="full-width auth-form__submit"
        no-caps
        unelevated
      />
    </q-form>

    <div class="auth-form__footer">
      ¿Ya conocés la banda?
      <router-link :to="{ name: 'login' }" class="auth-form__link">Volver al show</router-link>
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
  name: yup.string().required().min(3).label('Nombre completo'),
  email: yup.string().required().email().label('Correo electrónico'),
  password: yup.string().required().min(8).label('Contraseña'),
  confirmPassword: yup
    .string()
    .required()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .label('Repetir contraseña'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Debés aceptar los términos y condiciones')
    .label('Términos y condiciones'),
})

const initialValues = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
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

const [name, nameProps] = defineField('name', fieldConfig)
const [email, emailProps] = defineField('email', fieldConfig)
const [password, passwordProps] = defineField('password', fieldConfig)
const [confirmPassword, confirmPasswordProps] = defineField('confirmPassword', fieldConfig)
const [acceptTerms, acceptTermsProps] = defineField('acceptTerms', fieldConfig)

const showPassword = ref(false)

const onSubmit = handleSubmit(() => {
  // TODO: conectar con el servicio de registro.
})
</script>
