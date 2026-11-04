<template>
  <q-page class="bg-grey-1 q-pa-lg">
    <div class="page-shell">
      <div class="row items-center justify-between q-gutter-y-md">
        <div>
          <div class="text-overline text-uppercase text-primary">Notificaciones</div>
          <h1 class="font-display text-h4 text-weight-bold text-dark q-mt-xs q-mb-none">
            Lo que pasó en tus listas
          </h1>
          <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
            Invitaciones para compartir listas y compras completadas.
          </p>
        </div>

        <q-btn
          flat
          no-caps
          color="primary"
          icon="done_all"
          label="Marcar todas como leídas"
          :disable="unreadCount === 0"
          @click="markAllAsRead"
        />
      </div>

      <div class="row items-center q-gutter-sm q-mt-lg">
        <q-btn-toggle
          v-model="filter"
          :options="filterOptions"
          unelevated
          no-caps
          color="grey-2"
          text-color="grey-8"
          toggle-color="primary"
          @update:model-value="loadNotifications"
        />

        <q-badge v-if="unreadCount > 0" color="negative">
          {{ unreadCount }} sin leer
        </q-badge>
      </div>

      <div v-if="loading && notifications.length === 0" class="column items-center q-pa-xl text-grey-6">
        <q-spinner color="primary" size="36px" />
        <div class="text-body2 q-mt-sm">Cargando notificaciones...</div>
      </div>

      <q-card v-else-if="notifications.length === 0" flat bordered class="q-mt-lg">
        <q-card-section class="column items-center text-center q-pa-xl">
          <q-icon name="notifications_none" size="44px" class="text-grey-4" />
          <div class="font-display text-h6 text-weight-bold text-dark q-mt-md">
            No tenés notificaciones
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Cuando te inviten a una lista o se complete una compra, vas a verlo acá.
          </div>
        </q-card-section>
      </q-card>

      <q-list v-else separator class="q-mt-lg">
        <q-item
          v-for="notification in notifications"
          :key="notification.id"
          :class="{ 'bg-grey-2': !notification.read_at }"
        >
          <q-item-section avatar top>
            <q-avatar
              :color="notification.read_at ? 'grey-2' : 'primary'"
              :text-color="notification.read_at ? 'grey-7' : 'white'"
              :icon="iconFor(notification)"
              size="36px"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label :class="{ 'text-weight-medium': !notification.read_at }">
              {{ notification.message }}
            </q-item-label>

            <q-item-label caption>{{ formatDateTime(notification.created_at) }}</q-item-label>

            <div
              v-if="notification.type === 'list_invitation'"
              class="row items-center q-gutter-sm q-mt-sm"
            >
              <template v-if="notification.data.invitation_status === 'pending'">
                <q-btn
                  size="sm"
                  color="primary"
                  label="Aceptar"
                  unelevated
                  no-caps
                  :loading="actingId === notification.id"
                  @click="accept(notification)"
                />

                <q-btn
                  size="sm"
                  flat
                  color="negative"
                  label="Rechazar"
                  no-caps
                  :disable="actingId === notification.id"
                  @click="decline(notification)"
                />
              </template>

              <q-badge v-else color="grey-3" text-color="grey-8">
                {{ invitationStatusLabel(notification.data.invitation_status) }}
              </q-badge>
            </div>
          </q-item-section>

          <q-item-section side top>
            <q-btn
              v-if="!notification.read_at"
              flat
              dense
              round
              icon="mark_email_read"
              aria-label="Marcar como leída"
              @click="markAsRead(notification)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { useListsStore } from '@/stores/listsStore'
import { formatDateTime } from '@/utils/dates'
import { useRefreshOnFocus } from '@/composables/useRefreshOnFocus'

const $q = useQuasar()
const notificationsStore = useNotificationsStore()
const listsStore = useListsStore()
const { notifications, unreadCount, loading } = storeToRefs(notificationsStore)

const filter = ref('all')
const actingId = ref(null)

const filterOptions = [
  { label: 'Todas', value: 'all' },
  { label: 'No leídas', value: 'unread' },
]

onMounted(loadNotifications)
useRefreshOnFocus(loadNotifications)

function notifyError(error) {
  if (error.response?.data?.message) {
    $q.notify({
      type: 'negative',
      message: error.response.data.message,
      position: 'top',
    })
  }
}

function loadNotifications() {
  const unreadOnly = filter.value === 'unread'

  notificationsStore.fetchNotifications({ unreadOnly }).catch(notifyError)
  notificationsStore.fetchUnreadCount().catch(() => {})
}

function markAsRead(notification) {
  notificationsStore
    .markAsRead(notification)
    .then(() => {
      if (filter.value === 'unread') {
        loadNotifications()
      }
    })
    .catch(notifyError)
}

function markAllAsRead() {
  notificationsStore
    .markAllAsRead()
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Notificaciones marcadas como leídas.',
        position: 'top',
      })

      if (filter.value === 'unread') {
        loadNotifications()
      }
    })
    .catch(notifyError)
}

function accept(notification) {
  actingId.value = notification.id

  notificationsStore
    .acceptInvitation(notification)
    .then((result) => {
      $q.notify({
        type: 'positive',
        message: `Te uniste a "${result.list_name}".`,
        position: 'top',
      })

      listsStore.fetchOpenLists().catch(() => {})
      loadNotifications()
    })
    .catch(notifyError)
    .finally(() => {
      actingId.value = null
    })
}

function decline(notification) {
  actingId.value = notification.id

  notificationsStore
    .declineInvitation(notification)
    .then(() => {
      $q.notify({
        type: 'info',
        message: 'Invitación rechazada.',
        position: 'top',
      })

      loadNotifications()
    })
    .catch(notifyError)
    .finally(() => {
      actingId.value = null
    })
}

function iconFor(notification) {
  if (notification.type === 'list_invitation') {
    return 'group_add'
  }

  if (notification.type === 'list_completed') {
    return 'task_alt'
  }

  return 'notifications'
}

function invitationStatusLabel(status) {
  if (status === 'accepted') {
    return 'Invitación aceptada'
  }

  if (status === 'declined') {
    return 'Invitación rechazada'
  }

  return 'Pendiente'
}
</script>
