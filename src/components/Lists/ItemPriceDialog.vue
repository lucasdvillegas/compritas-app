<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <q-card class="q-pa-xs" style="width: 420px; max-width: 92vw">
      <q-card-section class="row items-center justify-between">
        <div style="min-width: 0">
          <div class="font-display text-h6 text-weight-bold text-dark">{{ priceTitle }}</div>
          <div class="text-caption text-grey-6 ellipsis">{{ item.product_name }}</div>
        </div>

        <q-btn flat dense round icon="close" aria-label="Cerrar" @click="onDialogCancel" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="submitForm">
          <q-input
            v-model="price"
            :label="priceFieldLabel"
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

          <div class="text-caption text-grey-6 q-mt-sm">
            {{ calculationHint }}
          </div>

          <div class="row items-center q-gutter-sm q-mt-lg">
            <q-btn
              v-if="hasPrice"
              flat
              color="negative"
              label="Quitar precio"
              no-caps
              @click="clearPrice"
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
import { formatQuantity, isWeightUnit } from '@/utils/units'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

defineEmits(useDialogPluginComponent.emits)

const price = ref(props.item.unit_price === null ? '' : String(props.item.unit_price))
const errorMessage = ref('')

const hasPrice = computed(() => props.item.unit_price !== null)
const parsedPrice = computed(() => parsePrice(price.value))
const isWeighted = computed(() => isWeightUnit(props.item.unit))
const priceTitle = computed(() => (isWeighted.value ? 'Precio por kilo' : 'Precio unitario'))
const priceFieldLabel = computed(() =>
  isWeighted.value ? 'Precio por kilo' : 'Precio por unidad',
)
const calculationHint = computed(() =>
  isWeighted.value
    ? `El total se calcula multiplicando el precio por el peso (${formatQuantity(props.item.quantity, props.item.unit)}).`
    : `El total se calcula multiplicando el precio por la cantidad (${props.item.quantity}).`,
)

const validationError = computed(() => {
  const raw = String(price.value).trim()

  if (raw === '') {
    return ''
  }

  const amount = parsedPrice.value

  if (amount === null) {
    return 'Ingresá un número válido.'
  }

  if (amount < 0) {
    return 'El precio no puede ser negativo.'
  }

  return ''
})

function parsePrice(value) {
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

  onDialogOK(parsedPrice.value)
}

function clearPrice() {
  onDialogOK(null)
}
</script>
