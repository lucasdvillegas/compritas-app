<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <q-card class="q-pa-xs" style="width: 420px; max-width: 92vw">
      <q-card-section class="row items-center justify-between">
        <div style="min-width: 0">
          <div class="font-display text-h6 text-weight-bold app-text">Total de la lista</div>
          <div class="text-caption app-text-muted ellipsis">{{ list.name }}</div>
        </div>

        <q-btn flat dense round icon="close" aria-label="Cerrar" @click="onDialogCancel" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="submitForm">
          <q-input
            v-model="total"
            label="Gasto total"
            placeholder="0,00"
            prefix="$"
            outlined
            dense
            autofocus
            inputmode="decimal"
            :error="Boolean(errorMessage)"
            :error-message="errorMessage"
            @update:model-value="errorMessage = ''"
          />

          <div class="text-caption app-text-muted q-mt-sm">
            Si no cargaste los precios de cada producto, podés anotar el gasto total acá.
          </div>

          <div class="row items-center q-gutter-sm q-mt-lg">
            <q-btn
              v-if="hasTotal"
              flat
              color="negative"
              label="Quitar total"
              no-caps
              @click="clearTotal"
            />

            <q-space />

            <q-btn flat label="Cancelar" no-caps @click="onDialogCancel" />

            <q-btn
              type="submit"
              color="primary"
              label="Guardar"
              unelevated
              no-caps
              :disable="Boolean(errorMessage)"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { roundAmount } from '@/utils/money'

const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

defineEmits(useDialogPluginComponent.emits)

const total = ref(
  props.list.manual_total === null || props.list.manual_total === undefined
    ? ''
    : String(props.list.manual_total),
)
const errorMessage = ref('')

const hasTotal = computed(
  () => props.list.manual_total !== null && props.list.manual_total !== undefined,
)
const parsedTotal = computed(() => parseTotal(total.value))

const validationError = computed(() => {
  const raw = String(total.value).trim()

  if (raw === '') {
    return ''
  }

  const amount = parsedTotal.value

  if (amount === null) {
    return 'Ingresá un número válido.'
  }

  if (amount < 0) {
    return 'El total no puede ser negativo.'
  }

  return ''
})

function parseTotal(value) {
  const normalized = String(value).trim().replace(',', '.')

  if (normalized === '' || !/^\d*(\.\d*)?$/.test(normalized)) {
    return null
  }

  const amount = roundAmount(normalized)

  return amount === null ? null : amount
}

function submitForm() {
  errorMessage.value = validationError.value

  if (errorMessage.value) {
    return
  }

  onDialogOK(parsedTotal.value)
}

function clearTotal() {
  onDialogOK(null)
}
</script>
