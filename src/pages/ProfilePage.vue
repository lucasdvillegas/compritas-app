<template>
  <q-page class="bg-grey-1 q-pa-lg">
    <div class="page-shell">
      <div class="text-overline text-uppercase text-primary">Perfil</div>
      <h1 class="font-display text-h4 text-weight-bold text-dark q-mt-xs q-mb-none">
        Tu cuenta
      </h1>
      <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
        Gestioná tus datos y compartí tu PIN para que te agreguen a una lista.
      </p>

      <div v-if="loading && !user" class="column items-center q-pa-xl text-grey-6">
        <q-spinner color="primary" size="36px" />
        <div class="text-body2 q-mt-sm">Cargando perfil...</div>
      </div>

      <template v-else>
        <q-card flat bordered class="q-mt-xl">
          <q-card-section>
            <div class="text-overline text-uppercase text-grey-6">Datos</div>
            <div class="font-display text-h6 text-weight-bold text-dark q-mt-xs">
              {{ user?.name }}
            </div>
            <div class="text-body2 text-grey-7 q-mt-xs">{{ user?.email }}</div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mt-lg">
          <q-card-section>
            <div class="text-overline text-uppercase text-grey-6">Tu PIN para compartir</div>

            <div class="row items-center q-gutter-sm q-mt-sm">
              <div class="font-display text-h3 text-weight-bold text-dark pin-display">
                {{ formattedPin }}
              </div>
              <q-btn
                flat
                dense
                round
                icon="content_copy"
                color="primary"
                aria-label="Copiar PIN"
                @click="copyPin"
              />
            </div>

            <div class="text-body2 text-grey-7 q-mt-sm">
              Compartí este PIN con el dueño de una lista para que te agregue. No lo compartas con
              cualquiera.
            </div>

            <q-btn
              class="q-mt-md"
              outline
              color="primary"
              icon="autorenew"
              label="Regenerar PIN"
              no-caps
              @click="confirmRegenerate"
            />
          </q-card-section>
        </q-card>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { copyToClipboard, useQuasar } from 'quasar'
import { useProfileStore } from '@/stores/profileStore'

const $q = useQuasar()
const profileStore = useProfileStore()
const { user, pin, loading } = storeToRefs(profileStore)

const formattedPin = computed(() => (pin.value ? `${pin.value.slice(0, 4)} ${pin.value.slice(4)}` : ''))

onMounted(fetchProfile)

function notifyError(error) {
  if (error.response?.data?.message) {
    $q.notify({
      type: 'negative',
      message: error.response.data.message,
      position: 'top',
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
      position: 'top',
    })
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
          position: 'top',
        })
      })
      .catch(notifyError)
  })
}
</script>

<style scoped>
.pin-display {
  letter-spacing: 0.18em;
}
</style>
