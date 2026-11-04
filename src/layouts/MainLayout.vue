<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-grey-1 text-dark">
      <q-toolbar class="q-py-sm">
        <q-btn flat dense round icon="menu" aria-label="Abrir menú" @click="toggleLeftDrawer" />

        <q-toolbar-title class="row items-center no-wrap q-gutter-x-sm"> </q-toolbar-title>

        <div v-if="authStore.isAuthenticated" class="row items-center q-gutter-x-md">
          <span class="text-body2 text-grey-7 gt-xs">
            {{ authStore.user?.name ?? 'Tu cuenta' }}
          </span>
          <q-btn
            flat
            dense
            no-caps
            label="Salir"
            class="text-primary text-weight-bold text-uppercase"
            @click="onLogout"
          />
        </div>

        <q-btn
          v-else
          flat
          dense
          no-caps
          label="Ingresar"
          class="text-primary text-weight-bold text-uppercase"
          :to="{ name: 'login' }"
        />
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
          <div class="q-px-sm q-pt-md">
            <div class="font-display text-overline text-uppercase text-dark">The Black Parade</div>
            <div class="text-overline text-uppercase text-grey-6">MCR · 2006</div>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useListsStore } from '@/stores/listsStore'
import mark from '@/assets/black-parade-mark.svg'

const router = useRouter()
const authStore = useAuthStore()
const listsStore = useListsStore()
const leftDrawerOpen = ref(false)

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
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function onLogout() {
  authStore.logout().finally(() => {
    listsStore.$reset()
    router.push({ name: 'login' })
  })
}
</script>
