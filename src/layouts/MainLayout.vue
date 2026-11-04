<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="app-page app-text">
      <q-toolbar class="q-py-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          color="primary"
          aria-label="Abrir menú"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="row items-center no-wrap q-gutter-x-sm"> </q-toolbar-title>

        <div class="row items-center q-gutter-x-md">
          <q-btn
            flat
            dense
            round
            icon="notifications"
            color="primary"
            aria-label="Notificaciones"
            @click="toggleRightDrawer"
          >
            <q-badge v-if="unreadCount > 0" color="negative" floating>
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </q-badge>
          </q-btn>

          <span class="text-body2 app-text-muted gt-xs">
            {{ authStore.user?.name ?? 'Tu cuenta' }}
          </span>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="286" class="app-page">
      <div class="column justify-between fit q-pa-md">
        <div>
          <div class="row items-center no-wrap q-gutter-x-sm q-px-sm q-pt-sm q-pb-lg">
            <q-avatar size="28px">
              <img :src="mark" alt="" aria-hidden="true" />
            </q-avatar>
            <div>
              <div class="text-overline text-uppercase app-text-muted">Compritapp</div>
            </div>
          </div>

          <q-list class="q-gutter-y-xs">
            <q-item
              v-for="link in links"
              :key="link.name"
              :to="{ name: link.name }"
              clickable
              exact
              class="rounded-borders q-py-sm"
              active-class="app-surface-muted text-primary"
            >
              <q-item-section avatar>
                <q-icon :name="link.icon" size="20px" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">{{ link.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <div class="q-pt-md">
          <q-separator />
          <q-list class="q-mt-sm">
            <q-item clickable class="rounded-borders q-py-sm" @click="onLogout">
              <q-item-section avatar>
                <q-icon name="logout" size="20px" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">Salir</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-drawer>

    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      overlay
      :width="360"
      class="app-page"
    >
      <div class="column fit">
        <div class="row items-center justify-between q-pa-md">
          <div>
            <div class="text-overline text-uppercase app-text-muted">Notificaciones</div>
            <div class="text-body2 app-text-muted q-mt-xs">
              {{ unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día' }}
            </div>
          </div>

          <q-btn
            flat
            dense
            round
            icon="close"
            aria-label="Cerrar notificaciones"
            @click="rightDrawerOpen = false"
          />
        </div>

        <q-separator />

        <div class="col" style="overflow-y: auto">
          <div
            v-if="loading && notifications.length === 0"
            class="column items-center q-pa-xl app-text-muted"
          >
            <q-spinner color="primary" size="28px" />
          </div>

          <div
            v-else-if="notifications.length === 0"
            class="column items-center q-pa-xl text-center app-text-muted"
          >
            <q-icon name="notifications_none" size="40px" class="app-text-subtle" />
            <div class="text-body2 q-mt-sm">No tenés notificaciones</div>
          </div>

          <q-list v-else separator>
            <q-item
              v-for="notification in notifications"
              :key="notification.id"
              :class="{ 'app-surface-muted': !notification.read_at }"
            >
              <q-item-section avatar top>
                <q-avatar
                  :class="{ 'app-avatar': notification.read_at }"
                  :color="notification.read_at ? undefined : 'primary'"
                  :text-color="notification.read_at ? undefined : 'white'"
                  :icon="iconFor(notification)"
                  size="32px"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label :class="{ 'text-weight-medium': !notification.read_at }">
                  {{ notification.message }}
                </q-item-label>
                <q-item-label caption>
                  {{ formatDateTime(notification.created_at) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <q-separator />

        <div class="q-pa-md">
          <q-btn
            color="primary"
            icon="history"
            label="Ver historial de notificaciones"
            unelevated
            no-caps
            class="full-width"
            :to="{ name: 'notifications' }"
            @click="rightDrawerOpen = false"
          />
        </div>
      </div>
    </q-drawer>

    <q-page-container class="app-page">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useListsStore } from '@/stores/listsStore'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { useProfileStore } from '@/stores/profileStore'
import { useRefreshOnFocus } from '@/composables/useRefreshOnFocus'
import { formatDateTime } from '@/utils/dates'
import mark from '@/assets/black-parade-mark.svg'

const router = useRouter()
const authStore = useAuthStore()
const listsStore = useListsStore()
const notificationsStore = useNotificationsStore()
const profileStore = useProfileStore()
const { unreadCount, notifications, loading } = storeToRefs(notificationsStore)
const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)

onMounted(refreshUnreadCount)
useRefreshOnFocus(refreshOnFocus)

function refreshOnFocus() {
  if (rightDrawerOpen.value) {
    loadNotificationsPreview()

    return
  }

  refreshUnreadCount()
}

function refreshUnreadCount() {
  if (!authStore.isAuthenticated) {
    return
  }

  notificationsStore.fetchUnreadCount().catch(() => {})
}

function loadNotificationsPreview() {
  notificationsStore.fetchNotifications().catch(() => {})
  notificationsStore.fetchUnreadCount().catch(() => {})
}

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value

  if (rightDrawerOpen.value) {
    leftDrawerOpen.value = false
    loadNotificationsPreview()
  }
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

const links = [
  {
    name: 'my-list',
    label: 'Mi lista',
    icon: 'playlist_add_check',
  },
  {
    name: 'products',
    label: 'Productos',
    icon: 'inventory_2',
  },
  {
    name: 'categories',
    label: 'Categorías',
    icon: 'category',
  },
  {
    name: 'history',
    label: 'Historial',
    icon: 'history',
  },
  {
    name: 'stats',
    label: 'Estadísticas',
    icon: 'insights',
  },
  {
    name: 'profile',
    label: 'Perfil',
    icon: 'person',
  },
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value

  if (leftDrawerOpen.value) {
    rightDrawerOpen.value = false
  }
}

function onLogout() {
  authStore.logout().finally(() => {
    listsStore.$reset()
    notificationsStore.$reset()
    profileStore.$reset()
    router.push({ name: 'login' })
  })
}
</script>
