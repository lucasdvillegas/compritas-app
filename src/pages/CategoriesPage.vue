<template>
  <q-page class="app-page q-pa-lg">
    <div class="page-shell">
      <div>
        <h1 class="font-display text-h4 text-weight-bold app-text q-mt-xs q-mb-none">
          Ordená el caos
        </h1>

        <p class="text-body2 app-text-muted q-mt-sm q-mb-none">
          Creá y agrupá las categorías que después vas a asignar a tus productos.
        </p>
      </div>

      <div class="row items-center justify-between q-gutter-sm q-mt-lg">
        <q-btn
          color="primary"
          icon="add"
          label="Nueva categoría"
          unelevated
          no-caps
          @click="openCategoryDialog()"
        />

        <q-input
          v-model="search"
          dense
          outlined
          clearable
          debounce="400"
          placeholder="Buscar categoría..."
          aria-label="Buscar categoría"
          class="col-12 col-sm-auto search-field"
          @update:model-value="onSearch"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="q-mt-md">
        <div v-if="loading && categories.length === 0" class="row justify-center q-pa-xl">
          <q-spinner color="primary" size="32px" />
        </div>

        <AppEmptyState
          v-else-if="categories.length === 0"
          class="q-mt-md"
          icon="category"
          :title="search ? 'No encontramos categorías' : 'Todavía no hay categorías'"
          :description="
            search
              ? 'Probá con otro nombre.'
              : 'Creá tu primera categoría para ordenar tus productos.'
          "
          :action-label="search ? '' : 'Nueva categoría'"
          action-icon="add"
          @action="openCategoryDialog()"
        />

        <template v-else>
          <q-slide-item
            v-for="category in categories"
            :key="category.id"
            right-color="negative"
            class="app-slide-card q-mb-sm"
            @right="({ reset }) => confirmDelete(category, reset)"
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
import { categoriesServices } from '@/services/categoriesServices'
import CategoryDialog from '@/components/Categories/CategoryDialog.vue'
import AppEmptyState from '@/components/AppEmptyState.vue'

const $q = useQuasar()

const categories = ref([])
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

  categoriesServices
    .getCategories({
      page: pageNumber,
      per_page: 10,
      search: search.value || undefined,
    })
    .then(({ data }) => {
      categories.value = pageNumber === 1 ? data.data : [...categories.value, ...data.data]
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
  categories.value = []
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

function openCategoryDialog(category = null) {
  $q.dialog({
    component: CategoryDialog,
    componentProps: { category },
  }).onOk(() => resetList())
}

function confirmDelete(category, reset) {
  reset?.()

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
