<template>
  <q-page class="app-page q-pa-lg">
    <div class="page-shell">
      <div>
        <h1 class="font-display text-h4 text-weight-bold app-text q-mt-xs q-mb-none">
          El catálogo de productos
        </h1>

        <p class="text-body2 app-text-muted q-mt-sm q-mb-none">
          Cargá y organizá los productos que después vas a sumar a tu lista.
        </p>
      </div>

      <div class="row items-center justify-between q-gutter-sm q-mt-lg">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo producto"
          unelevated
          no-caps
          @click="openProductDialog()"
        />

        <q-input
          v-model="search"
          dense
          outlined
          clearable
          debounce="400"
          placeholder="Buscar producto..."
          aria-label="Buscar producto"
          class="col-12 col-sm-auto search-field"
          @update:model-value="onSearch"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="q-mt-md">
        <div v-if="loading && products.length === 0" class="row justify-center q-pa-xl">
          <q-spinner color="primary" size="32px" />
        </div>

        <AppEmptyState
          v-else-if="products.length === 0"
          class="q-mt-md"
          icon="inventory_2"
          :title="search ? 'No encontramos productos' : 'Todavía no hay productos'"
          :description="
            search
              ? 'Probá con otro nombre.'
              : 'Creá tu primer producto para sumarlo a tus listas.'
          "
          :action-label="search ? '' : 'Nuevo producto'"
          action-icon="add"
          @action="openProductDialog()"
        />

        <template v-else>
          <q-slide-item
            v-for="product in products"
            :key="product.id"
            right-color="negative"
            class="app-slide-card q-mb-sm"
            @right="({ reset }) => confirmDelete(product, reset)"
          >
            <template #right>
              <div class="row items-center q-gutter-xs q-px-md">
                <q-icon name="delete_outline" />
                <span class="text-weight-medium">Eliminar</span>
              </div>
            </template>

            <q-card flat bordered class="app-surface">
              <q-card-section class="row items-center no-wrap q-py-sm">
                <div class="col" style="min-width: 0">
                  <div class="text-weight-medium app-text ellipsis">{{ product.name }}</div>
                  <div class="text-caption app-text-muted ellipsis">
                    {{ product.category?.name || 'Sin categoría' }} ·
                    {{ unitSaleLabel(product.unit) }}
                  </div>
                </div>

                <div class="row items-center no-wrap q-gutter-x-xs">
                  <q-btn
                    class="app-accent-text"
                    flat
                    dense
                    round
                    icon="edit"
                    :aria-label="`Editar ${product.name}`"
                    @click="openProductDialog(product)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </q-slide-item>
        </template>

        <div v-if="loadingMore" class="row justify-center q-my-md">
          <q-spinner color="primary" size="28px" />
        </div>

        <div ref="loadMoreSentinel" style="height: 1px" aria-hidden="true" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { productsServices } from '@/services/productsServices'
import { unitSaleLabel } from '@/utils/units'
import ProductDialog from '@/components/Products/ProductDialog.vue'
import AppEmptyState from '@/components/AppEmptyState.vue'

const $q = useQuasar()

const products = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const search = ref('')
const loadMoreSentinel = ref(null)
let observer = null

onMounted(() => {
  loadPage(1)

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadNextPage()
      }
    },
    { rootMargin: '0px' },
  )

  if (loadMoreSentinel.value) {
    observer.observe(loadMoreSentinel.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

function loadNextPage() {
  if (!hasMore.value || loading.value || loadingMore.value) {
    return
  }

  loadPage(page.value + 1)
}

function maybeLoadMore() {
  const sentinel = loadMoreSentinel.value

  if (!sentinel || !hasMore.value || loading.value || loadingMore.value) {
    return
  }

  const rect = sentinel.getBoundingClientRect()

  if (rect.top <= window.innerHeight) {
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
    })
  }
}

function openProductDialog(product = null) {
  $q.dialog({
    component: ProductDialog,
    componentProps: { product },
  }).onOk(() => resetList())
}

function confirmDelete(product, reset) {
  reset?.()

  $q.dialog({
    title: 'Eliminar producto',
    message: `¿Querés eliminar "${product.name}"? Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: {
      label: 'Eliminar',
      color: 'negative',
      unelevated: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    productsServices
      .deleteProduct(product.id)
      .then(({ data }) => {
        products.value = products.value.filter((item) => item.id !== product.id)

        $q.notify({
          type: 'positive',
          message: data.message,
        })
      })
      .catch(notifyError)
  })
}
</script>

<style scoped>
.search-field {
  min-width: 240px;
  max-width: 320px;
}
</style>
