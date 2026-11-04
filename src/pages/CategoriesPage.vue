<template>
  <q-page class="app-page q-pa-lg">
    <div class="page-shell">
      <div class="row items-center justify-between q-gutter-y-md">
        <div>
          <h1 class="font-display text-h4 text-weight-bold app-text q-mt-xs q-mb-none">
            Ordená el caos
          </h1>

          <p class="text-body2 app-text-muted q-mt-sm q-mb-none">
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

      <div v-if="loading" class="column items-center q-pa-xl app-text-muted">
        <q-spinner color="primary" size="32px" />
        <div class="text-body2 q-mt-sm">Cargando categorías...</div>
      </div>

      <AppEmptyState
        v-else-if="categories.length === 0"
        class="q-mt-xl"
        icon="category"
        title="Todavía no hay categorías"
        description="Creá tu primera categoría para ordenar tus productos."
        action-label="Nueva categoría"
        action-icon="add"
        @action="openCategoryDialog()"
      />

      <div v-else class="q-mt-xl">
        <q-card
          v-for="category in categories"
          :key="category.id"
          flat
          bordered
          class="app-surface q-mb-sm"
        >
          <q-card-section class="row items-center no-wrap q-py-sm">
            <div class="col" style="min-width: 0">
              <div class="text-weight-medium app-text ellipsis">{{ category.name }}</div>
            </div>

            <div class="row items-center no-wrap q-gutter-x-xs">
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="primary"
                :aria-label="`Editar ${category.name}`"
                @click="openCategoryDialog(category)"
              />

              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                :aria-label="`Eliminar ${category.name}`"
                @click="confirmDelete(category)"
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
import { categoriesServices } from '@/services/categoriesServices'
import CategoryDialog from '@/components/Categories/CategoryDialog.vue'
import AppEmptyState from '@/components/AppEmptyState.vue'

const $q = useQuasar()

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
