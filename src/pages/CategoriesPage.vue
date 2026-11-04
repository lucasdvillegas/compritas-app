<template>
  <q-page class="bg-grey-1 q-pa-lg">
    <div class="page-shell">
      <div class="text-overline text-uppercase text-primary">Categorías</div>

      <div class="row items-center justify-between q-gutter-y-md">
        <div>
          <h1 class="font-display text-h4 text-weight-bold text-dark q-mt-xs q-mb-none">
            Ordená el caos
          </h1>

          <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
            Creá y agrupá las categorías que después vas a asignar a tus productos.
          </p>
        </div>

        <q-btn
          color="primary"
          icon="add"
          label="Nueva categoría"
          unelevated
          no-caps
          @click="openCategoryDialog()"
        />
      </div>

      <q-table
        :rows="categories"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 0 }"
        :rows-per-page-options="[0]"
        hide-pagination
        flat
        bordered
        class="q-mt-xl"
        no-data-label="Todavía no hay categorías"
        loading-label="Cargando categorías..."
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
              @click="openCategoryDialog(props.row)"
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
import { categoriesServices } from '@/services/categoriesServices'
import CategoryDialog from '@/components/Categories/CategoryDialog.vue'

const $q = useQuasar()

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' },
]

const categories = ref([])
const loading = ref(false)

function fetchCategory() {
  loading.value = true

  categoriesServices
    .getCategories()
    .then(({ data }) => {
      categories.value = data.data
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

function openCategoryDialog(category = null) {
  $q.dialog({
    component: CategoryDialog,
    componentProps: { category },
  }).onOk(() => fetchCategory())
}

function confirmDelete(category) {
  $q.dialog({
    title: 'Eliminar categoría',
    message: `¿Querés eliminar "${category.name}"? Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: {
      label: 'Eliminar',
      color: 'negative',
      unelevated: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    categoriesServices
      .deleteCategory(category.id)
      .then(({ data }) => {
        categories.value = categories.value.filter((item) => item.id !== category.id)

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

onMounted(fetchCategory)
</script>
