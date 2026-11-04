<template>
  <q-card flat bordered class="fit">
    <q-card-section>
      <div class="text-overline text-uppercase text-grey-6">Gastos por categoría</div>
      <div class="text-body2 text-grey-7 q-mt-xs">
        Solo se incluyen productos con precio cargado.
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div v-if="categories.length === 0" class="column items-center q-py-lg text-grey-6">
        <q-icon name="category" size="36px" class="text-grey-4" />
        <div class="text-body2 q-mt-sm">Sin gastos con desglose</div>
      </div>

      <template v-else>
        <div v-for="category in categories" :key="category.category_name" class="q-mb-md">
          <div class="row items-center justify-between q-gutter-x-sm no-wrap">
            <div class="ellipsis text-weight-medium text-dark">{{ category.category_name }}</div>
            <div class="text-weight-bold text-no-wrap text-dark">
              {{ formatMoney(category.amount) }}
            </div>
          </div>

          <q-linear-progress
            :value="progressFor(category)"
            color="primary"
            track-color="grey-3"
            rounded
            size="8px"
            class="q-mt-xs"
          />

          <div class="text-caption text-grey-6 q-mt-xs">
            {{ pluralize(category.items_count, 'ítem', 'ítems') }} ·
            {{ pluralize(category.lists_count, 'lista', 'listas') }}
          </div>
        </div>

        <div v-if="coverage < 1" class="row items-start q-gutter-x-sm q-mt-md">
          <q-icon name="info" size="18px" class="text-grey-5 q-mt-xs" />
          <div class="col text-caption text-grey-6">
            El {{ coveragePercent }}% de los ítems tiene precio. El resto son importes globales que
            no se reparten por categoría.
          </div>
        </div>
      </template>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '@/utils/money'
import { pluralize } from '@/utils/pluralize'

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  coverage: {
    type: Number,
    default: 0,
  },
})

const maxAmount = computed(() =>
  props.categories.reduce((max, category) => Math.max(max, Number(category.amount) || 0), 0),
)

const coveragePercent = computed(() => Math.round(props.coverage * 100))

function progressFor(category) {
  if (maxAmount.value <= 0) {
    return 0
  }

  return Number(category.amount) / maxAmount.value
}
</script>
