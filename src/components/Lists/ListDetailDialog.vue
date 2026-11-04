<template>
  <q-dialog ref="dialogRef" :maximized="$q.screen.lt.sm" @hide="onDialogHide">
    <q-card
      class="column no-wrap"
      :style="
        $q.screen.lt.sm
          ? 'width: 100%; height: 100%'
          : 'width: 560px; max-width: 94vw; max-height: 88vh'
      "
    >
      <q-card-section class="row items-start justify-between no-wrap">
        <div style="min-width: 0">
          <div class="text-overline text-uppercase text-primary">Lista completada</div>
          <div class="font-display text-h6 text-weight-bold app-text q-mt-xs ellipsis">
            {{ detail?.name ?? list.name }}
          </div>
          <div class="text-caption app-text-muted q-mt-xs">
            <template v-if="completedAt">Completada el {{ completedAt }}</template>
            <template v-else>Sin fecha de finalización</template>
          </div>
        </div>

        <q-btn flat dense round icon="close" aria-label="Cerrar" @click="onDialogCancel" />
      </q-card-section>

      <q-card-section class="q-pt-none q-pb-sm">
        <div class="text-body2 app-text-muted">
          {{ checkedCount }} de
          {{ pluralize(items.length, 'producto marcado', 'productos marcados') }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="col q-pa-none" style="overflow-y: auto">
        <div v-if="loading" class="column items-center q-pa-xl app-text-muted">
          <q-spinner color="primary" size="32px" />
          <div class="text-body2 q-mt-sm">Cargando lista...</div>
        </div>

        <div v-else-if="items.length === 0" class="q-pa-xl text-center">
          <q-icon name="shopping_basket" size="40px" class="app-text-subtle" />
          <div class="text-body1 text-weight-medium app-text q-mt-sm">
            Esta lista no tiene productos
          </div>
        </div>

        <q-list v-else separator>
          <q-item v-for="item in items" :key="item.id" class="q-py-md">
            <q-item-section side top>
              <q-icon
                :name="item.checked ? 'check_circle' : 'radio_button_unchecked'"
                :color="item.checked ? 'positive' : 'grey-5'"
                size="22px"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label
                class="text-weight-medium"
                :class="{ 'app-text-subtle': item.checked }"
                :style="item.checked ? 'text-decoration: line-through' : ''"
              >
                {{ item.product_name }}
              </q-item-label>

              <q-item-label caption>
                {{ item.category_name || 'Sin categoría' }}
              </q-item-label>

              <q-item-label v-if="item.unit_price !== null" caption>
                {{ formatMoney(item.unit_price) }} {{ isWeightUnit(item.unit) ? '/kg' : 'c/u' }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="column items-end q-gutter-y-xs">
                <span
                  v-if="item.line_total !== null"
                  class="text-body2 text-weight-bold text-no-wrap app-text"
                >
                  {{ formatMoney(item.line_total) }}
                </span>

                <q-badge v-if="showQuantity(item)" class="app-chip">
                  {{ quantityLabel(item) }}
                </q-badge>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-separator />

      <q-card-actions class="row items-center q-pa-md">
        <div class="col">
          <div class="text-overline text-uppercase app-text-muted">Total</div>
          <div class="text-h6 text-weight-bold app-text">
            {{
              detail?.total_amount === null || detail?.total_amount === undefined
                ? 'Sin precios'
                : formatMoney(detail.total_amount)
            }}
          </div>
          <div v-if="detail?.manual_total !== null && detail?.manual_total !== undefined" class="text-caption app-text-muted">
            Total ingresado a mano
          </div>
        </div>

        <q-btn flat label="Cerrar" no-caps @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { listsServices } from '@/services/listsServices'
import { formatDateTime } from '@/utils/dates'
import { formatMoney } from '@/utils/money'
import { pluralize } from '@/utils/pluralize'
import { formatQuantity, isWeightUnit } from '@/utils/units'

const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
})

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent()

defineEmits(useDialogPluginComponent.emits)

const $q = useQuasar()

const detail = ref(null)
const loading = ref(false)

const items = computed(() => detail.value?.items ?? [])
const checkedCount = computed(() => items.value.filter((item) => item.checked).length)
const completedAt = computed(() =>
  formatDateTime(detail.value?.completed_at ?? props.list.completed_at),
)

function showQuantity(item) {
  if (isWeightUnit(item.unit)) {
    return true
  }

  return Number(item.quantity) !== 1
}

function quantityLabel(item) {
  return isWeightUnit(item.unit)
    ? formatQuantity(item.quantity, item.unit)
    : `x${item.quantity}`
}

onMounted(() => {
  loading.value = true

  listsServices
    .getList(props.list.id)
    .then(({ data }) => {
      detail.value = data.data
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
})
</script>
