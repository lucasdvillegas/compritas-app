<template>
  <q-dialog ref="dialogRef" persistent :maximized="$q.screen.lt.sm" @hide="onDialogHide">
    <q-card
      class="column no-wrap"
      :style="
        $q.screen.lt.sm
          ? 'width: 100%; height: 100%'
          : 'width: 560px; max-width: 94vw; max-height: 88vh'
      "
    >
      <q-card-section class="row items-start justify-between no-wrap">
        <div style="min-width: 0">
          <div class="font-display text-h6 text-weight-bold app-text">Compartir lista</div>
          <div class="text-caption app-text-muted ellipsis">{{ list.name }}</div>
        </div>

        <q-btn flat dense round icon="close" aria-label="Cerrar" @click="onDialogCancel" />
      </q-card-section>

      <q-separator />

      <q-card-section class="col" style="overflow-y: auto">
        <q-form @submit.prevent="submitInvitation">
          <q-input
            v-model="pin"
            label="PIN del usuario"
            placeholder="12345678"
            maxlength="8"
            outlined
            dense
            inputmode="numeric"
            :error="Boolean(errorMessage)"
            :error-message="errorMessage"
            @update:model-value="onPinInput"
          >
            <template #prepend>
              <q-icon name="pin" />
            </template>
          </q-input>

          <div class="text-caption app-text-muted q-mt-sm">
            Pedile su PIN de 8 dígitos a la persona que querés agregar.
          </div>

          <div class="row justify-end q-mt-md">
            <q-btn
              type="submit"
              color="primary"
              label="Enviar invitación"
              unelevated
              no-caps
              :loading="saving"
              :disable="pin.length !== 8"
            />
          </div>
        </q-form>

        <q-separator class="q-my-lg" />

        <div class="text-overline text-uppercase app-text-muted">Miembros</div>

        <div v-if="loadingMembers" class="column items-center q-pa-lg app-text-muted">
          <q-spinner color="primary" size="28px" />
        </div>

        <q-list v-else separator>
          <q-item v-for="member in members" :key="member.id">
            <q-item-section avatar>
              <q-avatar class="app-avatar" size="36px">
                {{ initials(member.name) }}
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium app-text">
                {{ member.name }}
                <q-badge v-if="member.role === 'owner'" class="app-accent-chip q-ml-xs">
                  Dueño
                </q-badge>
              </q-item-label>
              <q-item-label caption>{{ member.email }}</q-item-label>
            </q-item-section>

            <q-item-section v-if="member.role !== 'owner'" side>
              <q-btn
                flat
                dense
                round
                icon="person_remove"
                color="negative"
                :aria-label="`Quitar a ${member.name}`"
                @click="confirmRemove(member)"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <template v-if="invitations.length > 0">
          <q-separator class="q-my-lg" />

          <div class="text-overline text-uppercase app-text-muted">Invitaciones pendientes</div>

          <q-list separator>
            <q-item v-for="invitation in invitations" :key="invitation.id">
              <q-item-section>
                <q-item-label class="text-weight-medium app-text">
                  {{ invitation.invitee?.name ?? 'Invitado' }}
                </q-item-label>
                <q-item-label caption>Esperando respuesta</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  dense
                  round
                  icon="cancel"
                  color="negative"
                  aria-label="Revocar invitación"
                  @click="confirmRevoke(invitation)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </q-card-section>

      <q-separator />

      <q-card-actions class="q-pa-md">
        <q-space />
        <q-btn flat label="Cerrar" no-caps @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { listsServices } from '@/services/listsServices'

const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
})

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent()

defineEmits(useDialogPluginComponent.emits)

const $q = useQuasar()

const pin = ref('')
const errorMessage = ref('')
const saving = ref(false)
const loadingMembers = ref(false)
const members = ref([])
const invitations = ref([])

onMounted(() => {
  loadMembers()
  loadInvitations()
})

function notifyError(error) {
  if (error.response?.data?.message) {
    $q.notify({
      type: 'negative',
      message: error.response.data.message,
    })
  }
}

function loadMembers() {
  loadingMembers.value = true

  listsServices
    .getMembers(props.list.id)
    .then(({ data }) => {
      members.value = data.data
    })
    .catch(notifyError)
    .finally(() => {
      loadingMembers.value = false
    })
}

function loadInvitations() {
  listsServices
    .getInvitations(props.list.id)
    .then(({ data }) => {
      invitations.value = data.data
    })
    .catch(notifyError)
}

function onPinInput(value) {
  pin.value = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 8)
  errorMessage.value = ''
}

function submitInvitation() {
  errorMessage.value = ''
  saving.value = true

  listsServices
    .inviteByPin(props.list.id, pin.value)
    .then(({ data }) => {
      $q.notify({
        type: 'positive',
        message: data.message,
      })

      pin.value = ''

      return loadInvitations()
    })
    .catch((error) => {
      const validationMessage = error.response?.data?.errors?.pin?.[0]

      if (validationMessage) {
        errorMessage.value = validationMessage

        return
      }

      notifyError(error)
    })
    .finally(() => {
      saving.value = false
    })
}

function confirmRemove(member) {
  $q.dialog({
    title: 'Quitar miembro',
    message: `¿Querés quitar a "${member.name}" de la lista?`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: {
      label: 'Quitar',
      color: 'negative',
      unelevated: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    listsServices
      .removeMember(props.list.id, member.id)
      .then(() => {
        members.value = members.value.filter((current) => current.id !== member.id)

        $q.notify({
          type: 'positive',
          message: 'Miembro quitado correctamente.',
        })
      })
      .catch(notifyError)
  })
}

function confirmRevoke(invitation) {
  $q.dialog({
    title: 'Revocar invitación',
    message: 'La persona ya no va a poder aceptar esta invitación.',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: {
      label: 'Revocar',
      color: 'negative',
      unelevated: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    listsServices
      .revokeInvitation(props.list.id, invitation.id)
      .then(() => {
        invitations.value = invitations.value.filter((current) => current.id !== invitation.id)

        $q.notify({
          type: 'positive',
          message: 'Invitación revocada correctamente.',
        })
      })
      .catch(notifyError)
  })
}

function initials(name) {
  return String(name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
</script>
