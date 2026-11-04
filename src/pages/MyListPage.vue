<template>
  <q-page class="bg-grey-1 q-pa-lg">
    <div class="page-shell">
      <div class="row items-center justify-between q-gutter-y-md">
        <div>
          <h1 class="font-display text-h4 text-weight-bold text-dark q-mt-xs q-mb-none">
            Tu compra, sin vueltas
          </h1>
          <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
            Organizá tus compras en listas separadas y sumá productos desde tu catálogo.
          </p>
        </div>

        <q-btn
          color="primary"
          icon="add"
          label="Nueva lista"
          unelevated
          no-caps
          :disable="savingList"
          @click="openCreateDialog"
        />
      </div>

      <div v-if="loading && lists.length === 0" class="column items-center q-pa-xl text-grey-6">
        <q-spinner color="primary" size="36px" />
        <div class="text-body2 q-mt-sm">Cargando tus listas...</div>
      </div>

      <q-card v-else-if="lists.length === 0" flat bordered class="q-mt-xl">
        <q-card-section>
          <q-avatar color="grey-2" text-color="primary" icon="playlist_add_check" />
          <div class="font-display text-h6 text-weight-bold text-dark q-mt-md">
            Todavía no tenés listas abiertas
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Creá tu primera lista y empezá a agregar productos. Podés tener varias listas abiertas
            al mismo tiempo.
          </div>
          <q-btn
            class="q-mt-lg"
            color="primary"
            icon="add"
            label="Crear lista"
            unelevated
            no-caps
            :loading="savingList"
            @click="openCreateDialog"
          />
        </q-card-section>
      </q-card>

      <template v-else>
        <div class="row items-center justify-between q-mt-xl">
          <div class="text-overline text-uppercase text-grey-6">Listas abiertas</div>
          <div class="text-caption text-grey-6">{{ lists.length }} en curso</div>
        </div>

        <div class="row no-wrap q-gutter-x-sm q-mt-sm list-switcher">
          <q-btn
            v-for="list in lists"
            :key="list.id"
            no-caps
            rounded
            unelevated
            :outline="!isActive(list)"
            :color="isActive(list) ? 'primary' : 'grey-8'"
            :disable="loadingList"
            class="list-switcher__button"
            @click="selectList(list)"
          >
            <span class="ellipsis" style="max-width: 170px">{{ list.name }}</span>
            <q-badge
              class="q-ml-sm"
              :color="isActive(list) ? 'white' : 'grey-3'"
              :text-color="isActive(list) ? 'primary' : 'grey-8'"
            >
              {{ list.checked_items_count }}/{{ list.items_count }}
            </q-badge>
          </q-btn>
        </div>

        <q-card v-if="loadingList && !activeList" flat bordered class="q-mt-md">
          <q-card-section class="column items-center q-pa-xl text-grey-6">
            <q-spinner color="primary" size="32px" />
            <div class="text-body2 q-mt-sm">Cargando lista...</div>
          </q-card-section>
        </q-card>

        <q-card v-else-if="!activeList" flat bordered class="q-mt-md">
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="touch_app" size="40px" class="text-grey-4" />
            <div class="text-body1 text-weight-medium text-dark q-mt-sm">Elegí una lista</div>
            <div class="text-body2 text-grey-6 q-mt-xs">
              Seleccioná una de las listas abiertas para ver sus productos.
            </div>
          </q-card-section>
        </q-card>

        <q-card v-else flat bordered class="q-mt-md">
          <q-card-section>
            <div class="row items-start justify-between no-wrap q-gutter-x-md">
              <div class="col">
                <div class="text-overline text-uppercase text-grey-6">Lista activa</div>
                <div class="font-display text-h5 text-weight-bold text-dark q-mt-xs">
                  {{ activeList?.name }}
                </div>
                <div class="text-body2 text-grey-7 q-mt-xs">
                  {{ activeCheckedCount }} de
                  {{ pluralize(activeItems.length, 'producto marcado', 'productos marcados') }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  Deslizá a la derecha para marcar y a la izquierda para desmarcar.
                </div>

                <div v-if="activeList?.members_count > 0" class="text-caption text-grey-6 q-mt-xs">
                  {{ pluralize(activeList.members_count, 'miembro', 'miembros') }}
                </div>

                <div
                  v-if="activeItems.length > 0 || activeManualTotal !== null"
                  class="row items-center q-gutter-x-sm q-mt-sm"
                >
                  <q-icon
                    name="payments"
                    size="20px"
                    :color="activeTotal > 0 ? 'primary' : 'grey-5'"
                  />
                  <div class="text-body1 text-weight-bold text-dark">
                    {{ formatMoney(activeTotal) }}
                  </div>

                  <template v-if="activeManualTotal !== null">
                    <q-badge color="grey-3" text-color="grey-8">Total manual</q-badge>
                    <q-btn
                      flat
                      dense
                      round
                      size="sm"
                      color="primary"
                      icon="edit"
                      aria-label="Editar total"
                      @click="openTotalDialog"
                    />
                  </template>

                  <template v-else>
                    <div v-if="activeUnpricedCount > 0" class="text-caption text-grey-6">
                      · {{ activeUnpricedCount }} sin precio
                    </div>

                    <q-btn
                      flat
                      dense
                      no-caps
                      size="sm"
                      color="primary"
                      icon="edit_note"
                      label="Ingresar total"
                      @click="openTotalDialog"
                    />
                  </template>
                </div>
              </div>

              <q-btn flat dense round icon="more_vert" aria-label="Acciones de la lista">
                <q-menu auto-close>
                  <q-list style="min-width: 220px">
                    <q-item
                      v-if="activeIsOwner"
                      v-close-popup
                      clickable
                      @click="openRenameDialog"
                    >
                      <q-item-section avatar>
                        <q-icon name="edit" />
                      </q-item-section>
                      <q-item-section>Renombrar lista</q-item-section>
                    </q-item>

                    <q-item v-close-popup clickable @click="confirmComplete">
                      <q-item-section avatar>
                        <q-icon name="task_alt" />
                      </q-item-section>
                      <q-item-section>Completar lista</q-item-section>
                    </q-item>

                    <q-item
                      v-if="!activeIsOwner"
                      v-close-popup
                      clickable
                      class="text-negative"
                      @click="confirmLeave"
                    >
                      <q-item-section avatar>
                        <q-icon name="logout" />
                      </q-item-section>
                      <q-item-section>Salir de la lista</q-item-section>
                    </q-item>

                    <q-item
                      v-if="activeIsOwner"
                      v-close-popup
                      clickable
                      class="text-negative"
                      @click="confirmDelete"
                    >
                      <q-item-section avatar>
                        <q-icon name="delete_outline" />
                      </q-item-section>
                      <q-item-section>Eliminar lista</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <q-linear-progress
              :value="progress"
              rounded
              size="8px"
              color="primary"
              track-color="grey-3"
              class="q-mt-md"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn
                v-if="activeIsOwner"
                outline
                color="primary"
                icon="group_add"
                label="Compartir"
                no-caps
                :disable="loadingList"
                @click="openShareDialog"
              />

              <q-btn
                color="primary"
                icon="add"
                label="Agregar productos"
                unelevated
                no-caps
                :disable="loadingList"
                @click="openProductPicker"
              />
            </div>
          </q-card-section>

          <q-separator />

          <div v-if="loadingList" class="column items-center q-pa-xl text-grey-6">
            <q-spinner color="primary" size="32px" />
            <div class="text-body2 q-mt-sm">Cargando lista...</div>
          </div>

          <q-card-section v-else-if="activeItems.length === 0" class="text-center q-pa-xl">
            <q-icon name="shopping_basket" size="44px" class="text-grey-4" />
            <div class="text-body1 text-weight-medium text-dark q-mt-sm">Esta lista está vacía</div>
            <div class="text-body2 text-grey-6 q-mt-xs">
              Sumá productos desde tu catálogo. Después podés marcarlos desde la lista.
            </div>
            <q-btn
              class="q-mt-lg"
              color="primary"
              icon="add"
              label="Agregar productos"
              unelevated
              no-caps
              @click="openProductPicker"
            />
          </q-card-section>

          <q-list v-else separator>
            <q-slide-item
              v-for="item in activeItems"
              :key="item.id"
              left-color="positive"
              right-color="grey-7"
              @left="({ reset }) => markItem(item, reset)"
              @right="({ reset }) => unmarkItem(item, reset)"
            >
              <template #left>
                <div class="row items-center q-gutter-xs q-px-md">
                  <q-icon name="check_circle" />
                  <span class="text-weight-medium">Marcar</span>
                </div>
              </template>

              <template #right>
                <div class="row items-center q-gutter-xs q-px-md">
                  <q-icon name="remove_circle_outline" />
                  <span class="text-weight-medium">Desmarcar</span>
                </div>
              </template>

              <ListItemRow
                :item="item"
                :saving="savingItemId === item.id"
                @quantity="changeQuantity"
                @weight="openQuantityDialog"
                @price="openPriceDialog"
                @remove="confirmRemoveItem"
              />
            </q-slide-item>
          </q-list>
        </q-card>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useListsStore } from '@/stores/listsStore'
import { pluralize } from '@/utils/pluralize'
import { formatMoney } from '@/utils/money'
import ListDialog from '@/components/Lists/ListDialog.vue'
import ListItemRow from '@/components/Lists/ListItemRow.vue'
import ItemPriceDialog from '@/components/Lists/ItemPriceDialog.vue'
import ItemQuantityDialog from '@/components/Lists/ItemQuantityDialog.vue'
import ListTotalDialog from '@/components/Lists/ListTotalDialog.vue'
import ProductPickerDialog from '@/components/Lists/ProductPickerDialog.vue'
import ShareListDialog from '@/components/Lists/ShareListDialog.vue'

const $q = useQuasar()
const listsStore = useListsStore()
const {
  lists,
  activeList,
  activeItems,
  activeCheckedCount,
  activeTotal,
  activeManualTotal,
  activeUnpricedCount,
  activeIsOwner,
  loading,
  loadingList,
  savingList,
  savingItemId,
} = storeToRefs(listsStore)

const progress = computed(() =>
  activeItems.value.length === 0 ? 0 : activeCheckedCount.value / activeItems.value.length,
)

onMounted(loadLists)

function loadLists() {
  listsStore.fetchOpenLists().catch((error) => {
    if (error.response?.data?.message) {
      $q.notify({
        type: 'negative',
        message: error.response.data.message,
        position: 'top',
      })
    }
  })
}

function selectList(list) {
  if (isActive(list) || loadingList.value) {
    return
  }

  listsStore.selectList(list.id).catch((error) => {
    if (error.response?.data?.message) {
      $q.notify({
        type: 'negative',
        message: error.response.data.message,
        position: 'top',
      })
    }
  })
}

function isActive(list) {
  return activeList.value?.id === list.id
}

function openCreateDialog() {
  $q.dialog({
    component: ListDialog,
  })
}

function openRenameDialog() {
  if (!activeList.value || !activeIsOwner.value) {
    return
  }

  $q.dialog({
    component: ListDialog,
    componentProps: { list: activeList.value },
  })
}

function confirmComplete() {
  const list = activeList.value

  if (!list) {
    return
  }

  $q.dialog({
    title: 'Completar lista',
    message: `Vas a cerrar "${list.name}" con ${pluralize(
      list.items?.length ?? 0,
      'producto',
      'productos',
    )}${activeTotal.value > 0 ? ` por ${formatMoney(activeTotal.value)}` : ''}. Después no vas a poder modificar sus productos.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: {
      label: 'Completar',
      color: 'primary',
      unelevated: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    listsStore
      .completeList(list.id)
      .then(() => {
        $q.notify({
          type: 'positive',
          message: 'Lista completada. Ya podés consultarla en el historial.',
          position: 'top',
        })
      })
      .catch((error) => {
        if (error.response?.data?.message) {
          $q.notify({
            type: 'negative',
            message: error.response.data.message,
            position: 'top',
          })
        }
      })
  })
}

function confirmDelete() {
  const list = activeList.value

  if (!list || !activeIsOwner.value) {
    return
  }

  $q.dialog({
    title: 'Eliminar lista',
    message: `¿Querés eliminar "${list.name}"? Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: {
      label: 'Eliminar',
      color: 'negative',
      unelevated: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    listsStore
      .deleteList(list.id)
      .then(() => {
        $q.notify({
          type: 'positive',
          message: 'Lista eliminada correctamente.',
          position: 'top',
        })
      })
      .catch((error) => {
        if (error.response?.data?.message) {
          $q.notify({
            type: 'negative',
            message: error.response.data.message,
            position: 'top',
          })
        }
      })
  })
}

function openProductPicker() {
  if (!activeList.value) {
    return
  }

  $q.dialog({
    component: ProductPickerDialog,
    componentProps: { list: activeList.value },
  })
}

function openShareDialog() {
  if (!activeList.value || !activeIsOwner.value) {
    return
  }

  $q.dialog({
    component: ShareListDialog,
    componentProps: { list: activeList.value },
  })
}

function confirmLeave() {
  const list = activeList.value

  if (!list || activeIsOwner.value) {
    return
  }

  $q.dialog({
    title: 'Salir de la lista',
    message: `¿Querés dejar de participar en "${list.name}"? La lista sigue existiendo para el resto de los miembros.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: {
      label: 'Salir',
      color: 'negative',
      unelevated: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    listsStore
      .leaveList(list.id)
      .then(() => {
        $q.notify({
          type: 'positive',
          message: 'Saliste de la lista.',
          position: 'top',
        })
      })
      .catch((error) => {
        if (error.response?.data?.message) {
          $q.notify({
            type: 'negative',
            message: error.response.data.message,
            position: 'top',
          })
        }
      })
  })
}

function toggleItem(item, checked) {
  listsStore.updateItem(item.id, { checked }).catch((error) => {
    if (error.response?.data?.message) {
      $q.notify({
        type: 'negative',
        message: error.response.data.message,
        position: 'top',
      })
    }
  })
}

function markItem(item, reset) {
  reset()

  if (savingItemId.value !== null || item.checked) {
    return
  }

  toggleItem(item, true)
}

function unmarkItem(item, reset) {
  reset()

  if (savingItemId.value !== null || !item.checked) {
    return
  }

  toggleItem(item, false)
}

function changeQuantity(item, quantity) {
  if (quantity < 1 || quantity === item.quantity) {
    return
  }

  listsStore.updateItem(item.id, { quantity }).catch((error) => {
    if (error.response?.data?.message) {
      $q.notify({
        type: 'negative',
        message: error.response.data.message,
        position: 'top',
      })
    }
  })
}

function openPriceDialog(item) {
  $q.dialog({
    component: ItemPriceDialog,
    componentProps: { item },
  }).onOk((unitPrice) => {
    const currentPrice =
      item.unit_price === null || item.unit_price === undefined ? null : Number(item.unit_price)
    const nextPrice = unitPrice === undefined ? null : unitPrice

    if (currentPrice === nextPrice) {
      return
    }

    listsStore.updateItem(item.id, { unit_price: nextPrice }).catch((error) => {
      if (error.response?.data?.message) {
        $q.notify({
          type: 'negative',
          message: error.response.data.message,
          position: 'top',
        })
      }
    })
  })
}

function openQuantityDialog(item) {
  $q.dialog({
    component: ItemQuantityDialog,
    componentProps: { item },
  }).onOk((quantity) => {
    if (Number(item.quantity) === quantity) {
      return
    }

    listsStore.updateItem(item.id, { quantity }).catch((error) => {
      if (error.response?.data?.message) {
        $q.notify({
          type: 'negative',
          message: error.response.data.message,
          position: 'top',
        })
      }
    })
  })
}

function openTotalDialog() {
  const list = activeList.value

  if (!list) {
    return
  }

  $q.dialog({
    component: ListTotalDialog,
    componentProps: { list },
  }).onOk((amount) => {
    const currentTotal =
      list.manual_total === null || list.manual_total === undefined ? null : Number(list.manual_total)
    const nextTotal = amount === undefined ? null : amount

    if (currentTotal === nextTotal) {
      return
    }

    listsStore
      .setManualTotal(list.id, nextTotal)
      .then(() => {
        $q.notify({
          type: 'positive',
          message: nextTotal === null ? 'Total manual quitado.' : 'Total de la lista actualizado.',
          position: 'top',
        })
      })
      .catch((error) => {
        if (error.response?.data?.message) {
          $q.notify({
            type: 'negative',
            message: error.response.data.message,
            position: 'top',
          })
        }
      })
  })
}

function confirmRemoveItem(item) {
  $q.dialog({
    title: 'Quitar producto',
    message: `¿Querés quitar "${item.product_name}" de la lista? El producto sigue en tu catálogo.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: {
      label: 'Quitar',
      color: 'negative',
      unelevated: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    listsStore.removeItem(item.id).catch((error) => {
      if (error.response?.data?.message) {
        $q.notify({
          type: 'negative',
          message: error.response.data.message,
          position: 'top',
        })
      }
    })
  })
}
</script>

<style scoped>
.list-switcher {
  overflow-x: auto;
  padding-bottom: 4px;
}

.list-switcher__button {
  flex: 0 0 auto;
}
</style>
