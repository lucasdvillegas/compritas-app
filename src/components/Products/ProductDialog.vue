<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <q-card class="q-pa-xs" style="width: 460px; max-width: 92vw">
      <q-card-section class="row items-center justify-between">
        <div class="font-display text-h6 text-weight-bold text-dark">
          {{ isEditing ? 'Editar producto' : 'Nuevo producto' }}
        </div>

        <q-btn flat dense round icon="close" aria-label="Cerrar" @click="onDialogCancel" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="submitForm">
          <q-input
            v-model="form.name"
            label="Nombre"
            outlined
            dense
            autofocus
            class="q-mb-md"
            :rules="nameRules"
            :error="Boolean(serverError.name)"
            :error-message="serverError.name"
            @update:model-value="serverError.name = ''"
          />

          <q-select
            v-if="!loadingCategories"
            v-model="form.category_id"
            :options="categories"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            label="Categoría"
            outlined
            dense
            :rules="categoryRules"
            :error="Boolean(serverError.category_id)"
            :error-message="serverError.category_id"
            @update:model-value="serverError.category_id = ''"
          />

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn flat label="Cancelar" no-caps @click="onDialogCancel" />

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
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { api } from '@/boot/axios'

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

defineEmits(useDialogPluginComponent.emits)

const $q = useQuasar()

const form = ref({
  name: props.product?.name ?? '',
  category_id: props.product?.category_id ?? null,
})
const serverError = ref({ name: '', category_id: '' })
const categories = ref([])
const loadingCategories = ref(false)
const saving = ref(false)

const isEditing = computed(() => Boolean(props.product?.id))

const nameRules = [
  (value) => Boolean(value?.trim()) || 'El nombre es obligatorio.',
  (value) => (value?.trim().length ?? 0) <= 255 || 'El nombre no puede superar los 255 caracteres.',
]

const categoryRules = [(value) => Boolean(value) || 'La categoría es obligatoria.']

loadingCategories.value = true

api
  .get('/categories')
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
    loadingCategories.value = false
  })

function submitForm() {
  const wasEditing = isEditing.value
  const payload = {
    name: form.value.name.trim(),
    category_id: form.value.category_id,
  }

  saving.value = true

  const request = wasEditing
    ? api.put(`/products/${props.product.id}`, payload)
    : api.post('/products', payload)

  request
    .then(({ data }) => {
      $q.notify({
        type: 'positive',
        message: data.message,
        position: 'top',
      })

      onDialogOK(data.data)
    })
    .catch((error) => {
      const errors = error.response?.data?.errors ?? {}

      serverError.value = {
        name: errors.name?.[0] ?? '',
        category_id: errors.category_id?.[0] ?? '',
      }

      if (
        !serverError.value.name &&
        !serverError.value.category_id &&
        error.response?.data?.message
      ) {
        $q.notify({
          type: 'negative',
          message: error.response.data.message,
          position: 'top',
        })
      }
    })
    .finally(() => {
      saving.value = false
    })
}
</script>
