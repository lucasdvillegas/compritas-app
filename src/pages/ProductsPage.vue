<template>
  <q-page class="app-page q-pa-lg">
    <div class="page-shell">
      <div class="row items-center justify-between q-gutter-y-md">
        <div>
          <h1 class="font-display text-h4 text-weight-bold app-text q-mt-xs q-mb-none">
            El catálogo de la banda
          </h1>

          <p class="text-body2 app-text-muted q-mt-sm q-mb-none">
            Cargá y organizá los productos que después vas a sumar a tu lista.
          </p>
        </div>

        <q-btn
          color="primary"
          icon="add"
          label="Nuevo producto"
          unelevated
          no-caps
          @click="openProductDialog()"
        />
      </div>

      <div v-if="loading" class="column items-center q-pa-xl app-text-muted">
        <q-spinner color="primary" size="32px" />
        <div class="text-body2 q-mt-sm">Cargando productos...</div>
      </div>

      <AppEmptyState
        v-else-if="products.length === 0"
        class="q-mt-xl"
        icon="inventory_2"
        title="Todavía no hay productos"
        description="Creá tu primer producto para sumarlo a tus listas."
        action-label="Nuevo producto"
        action-icon="add"
        @action="openProductDialog()"
      />

      <div v-else class="q-mt-xl">
        <q-card
          v-for="product in products"
          :key="product.id"
          flat
          bordered
          class="app-surface q-mb-sm"
        >
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
                flat
                dense
                round
                icon="edit"
                color="primary"
                :aria-label="`Editar ${product.name}`"
                @click="openProductDialog(product)"
              />

              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                :aria-label="`Eliminar ${product.name}`"
                @click="confirmDelete(product)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { productsServices } from '@/services/productsServices'
import { unitSaleLabel } from '@/utils/units'
import ProductDialog from '@/components/Products/ProductDialog.vue'
import AppEmptyState from '@/components/AppEmptyState.vue'

const $q = useQuasar()

const products = ref([])
const loading = ref(false)

function fetchProducts() {
  loading.value = true

  productsServices
    .getProducts()
    .then(({ data }) => {
      products.value = data.data
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
}

function openProductDialog(product = null) {
  $q.dialog({
    component: ProductDialog,
    componentProps: { product },
  }).onOk(() => fetchProducts())
}

function confirmDelete(product) {
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

onMounted(fetchProducts)
</script>
