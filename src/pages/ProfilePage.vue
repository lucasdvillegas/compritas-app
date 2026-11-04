<template>
  <q-page class="app-page q-pa-lg">
    <div class="page-shell">
      <h1 class="font-display text-h4 text-weight-bold app-text q-mt-xs q-mb-none">
        Configuración
      </h1>
      <p class="text-body2 app-text-muted q-mt-sm q-mb-none">
        Gestioná tus datos, tu PIN y las preferencias de la app.
      </p>

      <div v-if="loading && !user" class="column items-center q-pa-xl app-text-muted">
        <q-spinner color="primary" size="36px" />
        <div class="text-body2 q-mt-sm">Cargando perfil...</div>
      </div>

      <template v-else>
        <q-card class="q-mt-xl app-primary-card">
          <q-card-section>
            <div class="row items-center q-gutter-x-sm">
              <q-avatar class="app-primary-avatar" icon="person" />
              <div class="text-overline text-uppercase app-text-muted">Datos</div>
            </div>

            <div class="font-display text-h5 text-weight-bold app-text q-mt-sm">
              {{ user?.name }}
            </div>
            <div class="text-body2 app-text-muted q-mt-xs">{{ user?.email }}</div>

            <q-btn
              class="q-mt-md"
              outline
              color="white"
              icon="edit"
              label="Cambiar nombre"
              no-caps
              @click="openNameDialog"
            />
          </q-card-section>
        </q-card>

        <q-card class="q-mt-lg app-primary-card">
          <q-card-section>
            <div class="row items-center q-gutter-x-sm">
              <q-avatar class="app-primary-avatar" icon="pin" />
              <div class="text-overline text-uppercase app-text-muted">Tu PIN para compartir</div>
            </div>

            <div class="row items-center q-gutter-sm q-mt-sm">
              <div class="text-h3 text-weight-bold app-text pin-display">
                {{ formattedPin }}
              </div>
              <q-btn
                flat
                dense
                round
                icon="content_copy"
                color="white"
                aria-label="Copiar PIN"
                @click="copyPin"
              />
            </div>

            <div class="text-body2 app-text-muted q-mt-sm">
              Compartí este PIN con el dueño de una lista para que te agregue. No lo compartas con
              cualquiera.
            </div>

            <q-btn
              class="q-mt-md"
              outline
              color="white"
              icon="autorenew"
              label="Regenerar PIN"
              no-caps
              @click="confirmRegenerate"
            />
          </q-card-section>
        </q-card>

        <q-card class="q-mt-lg app-accent-card">
          <q-card-section class="row items-center q-gutter-x-md">
            <q-avatar class="app-primary-avatar" icon="palette" />

            <div class="col">
              <div class="text-overline text-uppercase app-text-muted">Apariencia</div>
              <div class="text-body1 text-weight-medium app-text q-mt-xs">Modo oscuro</div>
              <div class="text-body2 app-text-muted q-mt-xs">
                Invierte la paleta de colores de la app.
              </div>
            </div>

            <q-toggle v-model="isDark" color="white" aria-label="Modo oscuro" />
          </q-card-section>
        </q-card>

        <q-card class="q-mt-lg app-primary-card">
          <q-card-section>
            <div class="row items-center q-gutter-x-sm">
              <q-avatar class="app-primary-avatar" icon="text_fields" />
              <div class="text-overline text-uppercase app-text-muted">Tipografía</div>
            </div>

            <div class="text-body2 app-text-muted q-mt-sm">
              Elegí una combinación pensada para que leer sea más cómodo.
            </div>

            <div class="row q-gutter-sm q-mt-md">
              <q-btn
                v-for="option in typographyOptions"
                :key="option.value"
                :label="option.label"
                no-caps
                color="white"
                :text-color="typography === option.value ? 'primary' : 'white'"
                :unelevated="typography === option.value"
                :outline="typography !== option.value"
                @click="setTypography(option.value)"
              />
            </div>

            <div class="text-caption app-text-muted q-mt-sm">{{ typographyHint }}</div>
          </q-card-section>
        </q-card>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { copyToClipboard, useQuasar } from 'quasar'
import { useProfileStore } from '@/stores/profileStore'

const $q = useQuasar()
const profileStore = useProfileStore()
const { user, pin, loading } = storeToRefs(profileStore)

const formattedPin = computed(() => (pin.value ? `${pin.value.slice(0, 4)} ${pin.value.slice(4)}` : ''))

const typographyOptions = [
  { label: 'Por defecto', value: 'default' },
  { label: 'Lectura fácil', value: 'dyslexic' },
]

const typography = ref(readTypography())

const typographyHint = computed(() =>
  typography.value === 'dyslexic'
    ? 'Lexend · Atkinson Hyperlegible · Andika'
    : 'Fraunces · DM Sans · JetBrains Mono',
)

function readTypography() {
  return localStorage.getItem('typography') === 'dyslexic' ? 'dyslexic' : 'default'
}

function setTypography(value) {
  typography.value = value
  localStorage.setItem('typography', value)
  document.body.classList.toggle('app-typography-dyslexic', value === 'dyslexic')
}

const isDark = computed({
  get: () => $q.dark.isActive,
  set: (value) => {
    $q.dark.set(value)
    localStorage.setItem('theme', value ? 'dark' : 'light')
  },
})

onMounted(() => {
  setTypography(typography.value)
  fetchProfile()
})

function notifyError(error) {
  if (error.response?.data?.message) {
    $q.notify({
      type: 'negative',
      message: error.response.data.message,
    })
  }
}

function fetchProfile() {
  profileStore.fetchProfile().catch(notifyError)
}

function copyPin() {
  Promise.resolve(copyToClipboard(pin.value)).then(() => {
    $q.notify({
      type: 'positive',
      message: 'PIN copiado.',
    })
  })
}

function openNameDialog() {
  $q.dialog({
    title: 'Cambiar nombre',
    message: 'Este nombre se va a mostrar en el menú y en las listas compartidas.',
    prompt: {
      model: user.value?.name ?? '',
      type: 'text',
      label: 'Nombre',
      outlined: true,
      dense: true,
    },
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Guardar', color: 'primary', unelevated: true, noCaps: true },
    persistent: true,
  }).onOk((name) => {
    const nextName = name.trim()

    if (!nextName) {
      $q.notify({
        type: 'negative',
        message: 'El nombre no puede estar vacío.',
      })

      return
    }

    if (nextName === user.value?.name) {
      return
    }

    profileStore
      .updateName(nextName)
      .then(() => {
        $q.notify({
          type: 'positive',
          message: 'Nombre actualizado.',
        })
      })
      .catch(notifyError)
  })
}

function confirmRegenerate() {
  $q.dialog({
    title: 'Regenerar PIN',
    message: 'Se va a generar un PIN nuevo y el anterior va a dejar de funcionar para futuras invitaciones.',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: {
      label: 'Regenerar',
      color: 'primary',
      unelevated: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    profileStore
      .regeneratePin()
      .then(() => {
        $q.notify({
          type: 'positive',
          message: 'PIN regenerado correctamente.',
        })
      })
      .catch(notifyError)
  })
}
</script>

<style scoped>
.pin-display {
  font-family: var(--app-font-mono);
  font-size: clamp(1.5rem, 5vw, 2.1rem);
  letter-spacing: 0.1em;
  line-height: 1.15;
  white-space: nowrap;
}
</style>
