<template>
  <q-page class="bg-grey-1 q-pa-lg">
    <div class="page-shell">
      <div class="row items-center justify-between q-gutter-y-md">
        <div>
          <h1 class="font-display text-h4 text-weight-bold text-dark q-mt-xs q-mb-none">
            El catálogo de la banda
          </h1>

          <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
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

      <q-table
        :rows="products"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 0 }"
        :rows-per-page-options="[0]"
        hide-pagination
        flat
        bordered
        class="q-mt-xl"
        no-data-label="Todavía no hay productos"
        loading-label="Cargando productos..."
      >
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              :aria-label="`Editar ${props.row.name}`"
              @click="openProductDialog(props.row)"
            />

            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              :aria-label="`Eliminar ${props.row.name}`"
              @click="confirmDelete(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { productsServices } from '@/services/productsServices'
import { unitSaleLabel } from '@/utils/units'
import ProductDialog from '@/components/Products/ProductDialog.vue'

const $q = useQuasar()

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  {
    name: 'category',
    label: 'Categoría',
    field: (row) => row.category?.name ?? '',
    align: 'left',
    sortable: true,
  },
  {
    name: 'unit',
    label: 'Se vende',
    field: (row) => unitSaleLabel(row.unit),
    align: 'left',
    sortable: true,
  },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' },
]

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
