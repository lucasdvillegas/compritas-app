<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <q-card class="q-pa-xs" style="width: 420px; max-width: 92vw">
      <q-card-section class="row items-center justify-between">
        <div style="min-width: 0">
          <div class="font-display text-h6 text-weight-bold text-dark">Peso del producto</div>
          <div class="text-caption text-grey-6 ellipsis">{{ item.product_name }}</div>
        </div>

        <q-btn flat dense round icon="close" aria-label="Cerrar" @click="onDialogCancel" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="submitForm">
          <q-input
            v-model="weight"
            label="Peso en kg"
            placeholder="0,000"
            suffix="kg"
            outlined
            dense
            autofocus
            inputmode="decimal"
            :error="Boolean(errorMessage)"
            :error-message="errorMessage"
            @update:model-value="errorMessage = ''"
          />

          <div class="text-caption text-grey-6 q-mt-sm">
            Ingresá el peso que vas a comprar. Por ejemplo, 0,75 para tres cuartos de kilo.
          </div>

          <div class="row items-center q-gutter-sm q-mt-lg">
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

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

defineEmits(useDialogPluginComponent.emits)

const weight = ref(String(props.item.quantity))
const errorMessage = ref('')

const parsedWeight = computed(() => parseWeight(weight.value))

const validationError = computed(() => {
  const raw = String(weight.value).trim()

  if (raw === '') {
    return 'Ingresá un peso.'
  }

  if (!/^\d*(\.\d{0,3})?$/.test(raw.replace(',', '.'))) {
    return 'Usá hasta tres decimales.'
  }

  const amount = parsedWeight.value

  if (amount === null) {
    return 'Ingresá un número válido.'
  }

  if (amount <= 0) {
    return 'El peso tiene que ser mayor a cero.'
  }

  return ''
})

function parseWeight(value) {
  const normalized = String(value).trim().replace(',', '.')

  if (normalized === '' || !/^\d*(\.\d{0,3})?$/.test(normalized)) {
    return null
  }

  const amount = Number(normalized)

  if (!Number.isFinite(amount)) {
    return null
  }

  return Math.round(amount * 1000) / 1000
}

function submitForm() {
  errorMessage.value = validationError.value

  if (errorMessage.value) {
    return
  }

  onDialogOK(parsedWeight.value)
}
</script>
