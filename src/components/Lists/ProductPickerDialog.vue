<template>
  <q-dialog ref="dialogRef" persistent :maximized="$q.screen.lt.sm" @hide="onDialogHide">
    <q-card
      class="column no-wrap"
      :style="
        $q.screen.lt.sm
          ? 'width: 100%; height: 100%'
          : 'width: 640px; max-width: 96vw; max-height: 90vh'
      "
    >
      <q-card-section class="row items-start justify-between no-wrap">
        <div style="min-width: 0">
          <div class="font-display text-h6 text-weight-bold app-text">Agregar productos</div>
          <div class="text-caption app-text-muted ellipsis">{{ list.name }}</div>
        </div>

        <q-btn flat dense round icon="close" aria-label="Cerrar" @click="onDialogCancel" />
      </q-card-section>

      <q-card-section class="q-pt-none q-pb-sm">
        <q-input
          v-model="search"
          dense
          outlined
          clearable
          placeholder="Buscar producto..."
          aria-label="Buscar producto"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <div class="row items-center justify-between q-mt-sm">
          <div class="text-caption app-text-muted">
            {{ inListCount }} en la lista · {{ products.length }} productos
          </div>

          <q-btn
            flat
            dense
            no-caps
            icon="add"
            label="Nuevo producto"
            color="primary"
            @click="openNewProduct"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="col q-pa-none" style="overflow-y: auto">
        <div v-if="loading" class="column items-center q-pa-xl app-text-muted">
          <q-spinner color="primary" size="32px" />
          <div class="text-body2 q-mt-sm">Cargando productos...</div>
        </div>

        <AppEmptyState
          v-else-if="filteredProducts.length === 0"
          variant="plain"
          :icon="products.length === 0 ? 'inventory_2' : 'search_off'"
          icon-size="40px"
          :title="products.length === 0 ? 'Tu catálogo está vacío' : 'No encontramos productos'"
          :description="
            products.length === 0
              ? 'Creá tu primer producto para sumarlo a la lista.'
              : 'Probá con otro nombre.'
          "
        />

        <q-list v-else separator>
          <q-slide-item
            v-for="product in filteredProducts"
            :key="product.id"
            left-color="positive"
            :right-color="$q.dark.isActive ? 'grey-9' : 'grey-7'"
            @left="({ reset }) => addProduct(product, reset)"
            @right="({ reset }) => removeProduct(product, reset)"
          >
            <template #left>
              <div class="row items-center q-gutter-xs q-px-md">
                <q-icon name="add_circle" />
                <span class="text-weight-medium">Agregar</span>
              </div>
            </template>

            <template #right>
              <div class="row items-center q-gutter-xs q-px-md">
                <q-icon name="remove_circle_outline" />
                <span class="text-weight-medium">Quitar</span>
              </div>
            </template>

            <q-item class="q-py-sm">
              <q-item-section side top>
                <q-icon
                  v-if="isInList(product)"
                  name="check_circle"
                  color="positive"
                  size="22px"
                  :aria-label="`${product.name} en la lista`"
                />
                <span v-else class="status-slot" aria-hidden="true" />
              </q-item-section>

              <q-item-section>
                <q-item-label :class="{ 'text-weight-medium': isInList(product) }">
                  {{ product.name }}
                </q-item-label>
                <q-item-label caption>
                  {{ product.category?.name || 'Sin categoría' }} · {{ unitSaleLabel(product.unit) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-slide-item>
        </q-list>
      </q-card-section>

      <q-separator />

      <q-card-actions class="q-pa-md row items-center no-wrap">
        <div class="col text-caption app-text-muted ellipsis gt-xs" style="min-width: 0">
          Deslizá a la derecha para agregar y a la izquierda para quitar.
        </div>

        <q-btn
          color="primary"
          label="Listo"
          unelevated
          no-caps
          :class="$q.screen.lt.sm ? 'full-width' : ''"
          @click="onDialogOK()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { productsServices } from '@/services/productsServices'
import { unitSaleLabel } from '@/utils/units'
import { useListsStore } from '@/stores/listsStore'
import ProductDialog from '@/components/Products/ProductDialog.vue'
import AppEmptyState from '@/components/AppEmptyState.vue'

const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

defineEmits(useDialogPluginComponent.emits)

const $q = useQuasar()
const listsStore = useListsStore()

const products = ref([])
const loading = ref(false)
const search = ref('')
const savingProductId = ref(null)

const itemsByProductId = computed(() => {
  const map = new Map()

  for (const item of listsStore.activeList?.items ?? []) {
    if (item.product_id !== null) {
      map.set(item.product_id, item)
    }
  }

  return map
})

const inListCount = computed(() => itemsByProductId.value.size)

const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) {
    return products.value
  }

  return products.value.filter((product) => {
    const category = product.category?.name ?? ''

    return product.name.toLowerCase().includes(term) || category.toLowerCase().includes(term)
  })
})

function itemFor(product) {
  return itemsByProductId.value.get(product.id)
}

function isInList(product) {
  return Boolean(itemFor(product))
}

function toggleProduct(product, shouldBeInList) {
  if (savingProductId.value !== null) {
    return
  }

  const item = itemFor(product)

  if (shouldBeInList === Boolean(item)) {
    return
  }

  savingProductId.value = product.id

  const request = shouldBeInList
    ? listsStore.addItem(product.id, { checked: false })
    : listsStore.removeItem(item.id)

  request
    .then(() => {
      $q.notify({
        type: 'positive',
        message: shouldBeInList
          ? `${product.name} agregado a la lista.`
          : `${product.name} quitado de la lista.`,
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
    .finally(() => {
      savingProductId.value = null
    })
}

function addProduct(product, reset) {
  reset()
  toggleProduct(product, true)
}

function removeProduct(product, reset) {
  reset()
  toggleProduct(product, false)
}

function openNewProduct() {
  $q.dialog({
    component: ProductDialog,
  }).onOk((product) => {
    products.value = [...products.value, product].sort((first, second) =>
      first.name.localeCompare(second.name, 'es'),
    )
  })
}

onMounted(() => {
  loading.value = true

  const requests = [productsServices.getProducts()]

  if (listsStore.activeList?.id !== props.list.id) {
    requests.push(listsStore.selectList(props.list.id))
  }

  Promise.all(requests)
    .then(([productsResponse]) => {
      products.value = productsResponse.data.data
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
    .finally(() => {
      loading.value = false
    })
})
</script>

<style scoped>
.status-slot {
  display: inline-block;
  width: 22px;
  height: 22px;
}
</style>
