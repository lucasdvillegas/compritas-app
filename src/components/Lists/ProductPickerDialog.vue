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
          debounce="400"
          placeholder="Buscar producto..."
          aria-label="Buscar producto"
          @update:model-value="onSearch"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <div class="row items-center justify-between q-mt-sm">
          <div class="text-caption app-text-muted">
            {{ inListCount }} en la lista · {{ totalProducts }}
            {{ totalProducts === 1 ? 'producto' : 'productos' }}
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

      <q-card-section ref="listContainer" class="col q-pa-none" style="overflow-y: auto">
        <div v-if="loading && products.length === 0" class="row justify-center q-pa-xl">
          <q-spinner color="primary" size="32px" />
        </div>

        <AppEmptyState
          v-else-if="products.length === 0"
          variant="plain"
          :icon="search ? 'search_off' : 'inventory_2'"
          icon-size="40px"
          :title="search ? 'No encontramos productos' : 'Tu catálogo está vacío'"
          :description="
            search
              ? 'Probá con otro nombre.'
              : 'Creá tu primer producto para sumarlo a la lista.'
          "
        />

        <q-list v-else separator>
          <q-slide-item
            v-for="product in products"
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
                  {{ product.category?.name || 'Sin categoría' }} ·
                  {{ unitSaleLabel(product.unit) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-slide-item>
        </q-list>

        <div v-if="loadingMore" class="row justify-center q-my-md">
          <q-spinner color="primary" size="28px" />
        </div>

        <div ref="loadMoreSentinel" style="height: 1px" aria-hidden="true" />
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const search = ref('')
const totalProducts = ref(0)
const savingProductId = ref(null)
const listContainer = ref(null)
const loadMoreSentinel = ref(null)
let observer = null

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

function loadNextPage() {
  if (!hasMore.value || loading.value || loadingMore.value) {
    return
  }

  loadPage(page.value + 1)
}

function maybeLoadMore() {
  const sentinel = loadMoreSentinel.value
  const root = listContainer.value?.$el ?? listContainer.value

  if (!sentinel || !root || !hasMore.value || loading.value || loadingMore.value) {
    return
  }

  const rect = sentinel.getBoundingClientRect()
  const rootRect = root.getBoundingClientRect()

  if (rect.top <= rootRect.bottom) {
    loadNextPage()
  }
}

function loadPage(pageNumber) {
  if (pageNumber === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  productsServices
    .getProducts({
      page: pageNumber,
      per_page: 10,
      search: search.value || undefined,
    })
    .then(({ data }) => {
      products.value = pageNumber === 1 ? data.data : [...products.value, ...data.data]
      hasMore.value = Boolean(data.meta?.has_more)
      totalProducts.value = data.meta?.total ?? products.value.length
      page.value = pageNumber
    })
    .catch((error) => {
      hasMore.value = false
      notifyError(error)
    })
    .finally(() => {
      loading.value = false
      loadingMore.value = false
      nextTick(() => maybeLoadMore())
    })
}

function onSearch() {
  resetList()
}

function resetList() {
  products.value = []
  page.value = 1
  hasMore.value = true
  loading.value = true
  loadPage(1)
}

function notifyError(error) {
  if (error.response?.data?.message) {
    $q.notify({
      type: 'negative',
      message: error.response.data.message,
      position: 'top',
    })
  }
}

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
    products.value = [product, ...products.value]
    totalProducts.value += 1
  })
}

onMounted(() => {
  loadPage(1)

  if (listsStore.activeList?.id !== props.list.id) {
    listsStore.selectList(props.list.id).catch(notifyError)
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadNextPage()
      }
    },
    {
      root: listContainer.value?.$el ?? listContainer.value,
      rootMargin: '0px',
    },
  )

  if (loadMoreSentinel.value) {
    observer.observe(loadMoreSentinel.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.status-slot {
  display: inline-block;
  width: 22px;
  height: 22px;
}
</style>
