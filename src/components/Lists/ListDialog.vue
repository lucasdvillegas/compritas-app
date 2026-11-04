<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <q-card class="q-pa-xs" style="width: 420px; max-width: 92vw">
      <q-card-section class="row items-center justify-between">
        <div class="font-display text-h6 text-weight-bold app-text">
          {{ isEditing ? 'Renombrar lista' : 'Nueva lista' }}
        </div>

        <q-btn flat dense round icon="close" aria-label="Cerrar" @click="onDialogCancel" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="submitForm">
          <q-input
            v-model="form.name"
            label="Nombre de la lista"
            placeholder="Ej.: Compra semanal"
            outlined
            dense
            autofocus
            :rules="nameRules"
            :error="Boolean(serverError.name)"
            :error-message="serverError.name"
            @update:model-value="serverError.name = ''"
          />

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn flat label="Cancelar" no-caps @click="onDialogCancel" />

            <q-btn
              type="submit"
              color="primary"
              :label="isEditing ? 'Guardar' : 'Crear lista'"
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
import { useListsStore } from '@/stores/listsStore'

const props = defineProps({
  list: {
    type: Object,
    default: null,
  },
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

defineEmits(useDialogPluginComponent.emits)

const $q = useQuasar()
const listsStore = useListsStore()

const form = ref({
  name: props.list?.name ?? '',
})
const serverError = ref({ name: '' })
const saving = ref(false)

const isEditing = computed(() => Boolean(props.list?.id))

const nameRules = [
  (value) => Boolean(value?.trim()) || 'El nombre es obligatorio.',
  (value) => (value?.trim().length ?? 0) <= 255 || 'El nombre no puede superar los 255 caracteres.',
]

function submitForm() {
  const name = form.value.name.trim()

  saving.value = true

  const request = isEditing.value
    ? listsStore.updateList(props.list.id, name)
    : listsStore.createList(name)

  request
    .then((savedList) => {
      $q.notify({
        type: 'positive',
        message: isEditing.value
          ? 'Lista actualizada correctamente.'
          : 'Lista creada correctamente.',
      })

      onDialogOK(savedList)
    })
    .catch((error) => {
      serverError.value.name = error.response?.data?.errors?.name?.[0] ?? ''

      if (!serverError.value.name && error.response?.data?.message) {
        $q.notify({
          type: 'negative',
          message: error.response.data.message,
        })
      }
    })
    .finally(() => {
      saving.value = false
    })
}
</script>
