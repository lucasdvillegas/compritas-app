<template>
  <q-item class="q-py-md">
    <q-item-section side top>
      <q-icon
        v-if="item.checked"
        name="check_circle"
        color="positive"
        size="22px"
        :aria-label="`${item.product_name} marcado`"
      />
      <span v-else class="status-slot" aria-hidden="true" />
    </q-item-section>

    <q-item-section>
      <q-item-label
        class="text-weight-medium"
        :class="{ 'text-grey-5': item.checked }"
        :style="item.checked ? 'text-decoration: line-through' : ''"
      >
        {{ item.product_name }}
      </q-item-label>

      <q-item-label caption>
        {{ item.category_name || 'Sin categoría' }}
      </q-item-label>

      <div class="row items-center q-gutter-x-sm q-mt-xs">
        <div v-if="!isWeighted" class="row items-center">
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="remove"
            aria-label="Reducir cantidad"
            :disable="readonly || saving || item.quantity <= 1"
            @click="emit('quantity', item, item.quantity - 1)"
          />

          <span class="text-body2 text-weight-bold" style="min-width: 24px; text-align: center">
            {{ item.quantity }}
          </span>

          <q-btn
            flat
            dense
            round
            size="sm"
            icon="add"
            aria-label="Aumentar cantidad"
            :disable="readonly || saving"
            @click="emit('quantity', item, item.quantity + 1)"
          />
        </div>

        <q-btn
          v-else-if="!readonly"
          flat
          dense
          no-caps
          size="sm"
          color="primary"
          icon="scale"
          :label="formatQuantity(item.quantity, item.unit)"
          :disable="saving"
          @click="emit('weight', item)"
        />

        <span v-else class="text-body2 text-weight-bold text-dark">
          {{ formatQuantity(item.quantity, item.unit) }}
        </span>

        <q-btn
          v-if="!readonly"
          flat
          dense
          no-caps
          size="sm"
          icon="sell"
          :color="hasPrice ? 'primary' : 'grey-7'"
          :label="priceLabel"
          :disable="saving"
          @click="emit('price', item)"
        />

        <span v-else class="text-caption text-grey-7">{{ priceLabel }}</span>
      </div>
    </q-item-section>

    <q-item-section v-if="!readonly" side top>
      <div class="column items-end q-gutter-y-xs">
        <span
          v-if="lineTotal !== null"
          class="text-body2 text-weight-bold text-no-wrap"
          :class="item.checked ? 'text-grey-5' : 'text-dark'"
        >
          {{ formatMoney(lineTotal) }}
        </span>

        <q-btn
          flat
          dense
          round
          icon="delete_outline"
          color="negative"
          aria-label="Quitar producto"
          :disable="saving"
          @click="emit('remove', item)"
        />
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '@/utils/money'
import { formatQuantity, isWeightUnit, unitPriceSuffix } from '@/utils/units'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['quantity', 'weight', 'remove', 'price'])

const isWeighted = computed(() => isWeightUnit(props.item.unit))

const hasPrice = computed(
  () => props.item.unit_price !== null && props.item.unit_price !== undefined,
)

const priceLabel = computed(() => {
  if (!hasPrice.value) {
    return 'Agregar precio'
  }

  return `${formatMoney(props.item.unit_price)} ${unitPriceSuffix(props.item.unit)}`
})

const lineTotal = computed(() => {
  if (!hasPrice.value) {
    return null
  }

  return Math.round(Number(props.item.unit_price) * Number(props.item.quantity) * 100) / 100
})
</script>

<style scoped>
.status-slot {
  display: inline-block;
  width: 22px;
  height: 22px;
}
</style>
