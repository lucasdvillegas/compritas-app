<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <q-card class="q-pa-xs" style="width: 420px; max-width: 90vw">
      <q-card-section class="row items-center justify-between">
        <div class="font-display text-h6 text-weight-bold text-dark">
          {{ isEditing ? 'Editar categoría' : 'Nueva categoría' }}
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
            :rules="nameRules"
            :error="Boolean(serverError)"
            :error-message="serverError"
            @update:model-value="serverError = ''"
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
import { categoriesServices } from '@/services/categoriesServices'

const props = defineProps({
  category: {
    type: Object,
    default: null,
  },
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

defineEmits(useDialogPluginComponent.emits)

const $q = useQuasar()

const form = ref({ name: props.category?.name ?? '' })
const serverError = ref('')
const saving = ref(false)

const isEditing = computed(() => Boolean(props.category?.id))

const nameRules = [
  (value) => Boolean(value?.trim()) || 'El nombre es obligatorio.',
  (value) => (value?.trim().length ?? 0) <= 255 || 'El nombre no puede superar los 255 caracteres.',
]

function submitForm() {
  const wasEditing = isEditing.value
  const payload = { name: form.value.name.trim() }

  saving.value = true

  const request = wasEditing
    ? categoriesServices.updateCategory(props.category.id, payload)
    : categoriesServices.createCategory(payload)

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
      serverError.value =
        error.response?.data?.errors?.name?.[0] ?? error.response?.data?.message ?? ''
    })
    .finally(() => {
      saving.value = false
    })
}
</script>
