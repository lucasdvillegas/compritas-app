<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-grey-1 text-dark">
      <q-toolbar class="q-py-sm">
        <q-btn flat dense round icon="menu" aria-label="Abrir menú" @click="toggleLeftDrawer" />

        <q-toolbar-title class="row items-center no-wrap q-gutter-x-sm"> </q-toolbar-title>

        <div class="row items-center q-gutter-x-md">
          <q-btn
            flat
            dense
            round
            icon="notifications"
            :to="{ name: 'notifications' }"
            aria-label="Notificaciones"
          >
            <q-badge v-if="unreadCount > 0" color="negative" floating>
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </q-badge>
          </q-btn>

          <span class="text-body2 text-grey-7 gt-xs">
            {{ authStore.user?.name ?? 'Tu cuenta' }}
          </span>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="286" class="bg-grey-1">
      <div class="column justify-between fit q-pa-md">
        <div>
          <div class="row items-center no-wrap q-gutter-x-sm q-px-sm q-pt-sm q-pb-lg">
            <q-avatar size="28px">
              <img :src="mark" alt="" aria-hidden="true" />
            </q-avatar>
            <div>
              <div class="text-overline text-uppercase text-grey-6">We'll carry on</div>
            </div>
          </div>

          <q-list class="q-gutter-y-xs">
            <q-item
              v-for="link in links"
              :key="link.name"
              :to="{ name: link.name }"
              clickable
              exact
              class="rounded-borders"
              active-class="bg-grey-2 text-primary"
            >
              <q-item-section avatar>
                <q-icon :name="link.icon" size="20px" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">{{ link.label }}</q-item-label>
                <q-item-label caption>{{ link.caption }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <div class="q-pt-md">
          <q-separator />
          <q-list class="q-mt-sm">
            <q-item clickable class="rounded-borders" @click="onLogout">
              <q-item-section avatar>
                <q-icon name="logout" size="20px" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">Salir</q-item-label>
                <q-item-label caption>Cerrar sesión</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="bg-grey-1">
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
import mark from '@/assets/black-parade-mark.svg'

const router = useRouter()
const authStore = useAuthStore()
const listsStore = useListsStore()
const notificationsStore = useNotificationsStore()
const profileStore = useProfileStore()
const { unreadCount } = storeToRefs(notificationsStore)
const leftDrawerOpen = ref(false)

onMounted(refreshUnreadCount)
useRefreshOnFocus(refreshUnreadCount)

function refreshUnreadCount() {
  if (!authStore.isAuthenticated) {
    return
  }

  notificationsStore.fetchUnreadCount().catch(() => {})
}

const links = [
  {
    name: 'my-list',
    label: 'Mi lista',
    caption: 'Tus listas de compras abiertas',
    icon: 'playlist_add_check',
  },
  {
    name: 'products',
    label: 'Productos',
    caption: 'Catálogo de productos',
    icon: 'inventory_2',
  },
  {
    name: 'categories',
    label: 'Categorías',
    caption: 'Organizá tu catálogo',
    icon: 'category',
  },
  {
    name: 'history',
    label: 'Historial',
    caption: 'Listas anteriores',
    icon: 'history',
  },
  {
    name: 'stats',
    label: 'Estadísticas',
    caption: 'Tus gastos y productos',
    icon: 'insights',
  },
  {
    name: 'notifications',
    label: 'Notificaciones',
    caption: 'Invitaciones y avisos',
    icon: 'notifications',
  },
  {
    name: 'profile',
    label: 'Perfil',
    caption: 'Tu PIN y tus datos',
    icon: 'person',
  },
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
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
