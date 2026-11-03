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
          @click="openCreateDialog"
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
        <template #body-cell-name="props">
          <q-td :props="props">
            <span class="text-body2 text-weight-medium text-dark">{{ props.row.name }}</span>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              :aria-label="`Editar ${props.row.name}`"
              @click="openEditDialog(props.row)"
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

    <q-dialog v-model="dialogOpen" persistent>
      <q-card class="q-pa-xs" style="width: 420px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="font-display text-h6 text-weight-bold text-dark">
            {{ isEditing ? 'Editar categoría' : 'Nueva categoría' }}
          </div>

          <q-btn flat dense round icon="close" aria-label="Cerrar" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="submitForm">
            <q-input
              v-model="form.name"
              label="Nombre"
              outlined
              dense
              autofocus
              :rules="nameRules"
              :error="Boolean(serverError)"
              :error-message="serverError"
              @update:model-value="serverError = ''"
            />

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn flat label="Cancelar" no-caps v-close-popup />

              <q-btn
                type="submit"
                color="primary"
                :label="isEditing ? 'Guardar' : 'Crear'"
                unelevated
                no-caps
                :loading="saving"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'

const $q = useQuasar()

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' },
]

const nameRules = [
  (value) => Boolean(value?.trim()) || 'El nombre es obligatorio.',
  (value) => (value?.trim().length ?? 0) <= 255 || 'El nombre no puede superar los 255 caracteres.',
]

const dialogOpen = ref(false)
const editingId = ref(null)
const form = ref({ name: '' })
const serverError = ref('')
const categories = ref([])
const loading = ref(false)
const saving = ref(false)

const isEditing = computed(() => editingId.value !== null)

function errorMessage(error, fallback) {
  if (error.response?.status === 401) {
    return 'Iniciá sesión para administrar tus categorías.'
  }

  return error.response?.data?.errors?.name?.[0] ?? error.response?.data?.message ?? fallback
}

function loadCategories() {
  loading.value = true

  api
    .get('/categories')
    .then(({ data }) => {
      categories.value = data.data
    })
    .catch((error) => {
      $q.notify({
        type: 'negative',
        message: errorMessage(error, 'No pudimos cargar las categorías.'),
        position: 'top',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

function openCreateDialog() {
  editingId.value = null
  form.value = { name: '' }
  serverError.value = ''
  dialogOpen.value = true
}

function openEditDialog(category) {
  editingId.value = category.id
  form.value = { name: category.name }
  serverError.value = ''
  dialogOpen.value = true
}

function submitForm() {
  const wasEditing = isEditing.value
  const payload = { name: form.value.name.trim() }

  saving.value = true

  const request = wasEditing
    ? api.put(`/categories/${editingId.value}`, payload)
    : api.post('/categories', payload)

  request
    .then(() => api.get('/categories'))
    .then(({ data }) => {
      categories.value = data.data
      dialogOpen.value = false

      $q.notify({
        type: 'positive',
        message: wasEditing ? 'Categoría actualizada.' : 'Categoría creada.',
        position: 'top',
      })
    })
    .catch((error) => {
      serverError.value = errorMessage(error, 'No pudimos guardar la categoría.')
    })
    .finally(() => {
      saving.value = false
    })
}

function confirmDelete(category) {
  $q.dialog({
    title: 'Eliminar categoría',
    message: `¿Querés eliminar "${category.name}"? Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true, noCaps: true },
    persistent: true,
  }).onOk(() => {
    api
      .delete(`/categories/${category.id}`)
      .then(() => {
        categories.value = categories.value.filter((item) => item.id !== category.id)

        $q.notify({
          type: 'positive',
          message: 'Categoría eliminada.',
          position: 'top',
        })
      })
      .catch((error) => {
        $q.notify({
          type: 'negative',
          message: errorMessage(error, 'No pudimos eliminar la categoría.'),
          position: 'top',
        })
      })
  })
}

onMounted(loadCategories)
</script>
