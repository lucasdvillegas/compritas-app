<template>
  <q-card flat bordered class="fit">
    <q-card-section>
      <div class="text-overline text-uppercase app-text-muted">Gastos por categoría</div>
      <div class="text-body2 app-text-muted q-mt-xs">
        Solo se incluyen productos con precio cargado.
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div v-if="categories.length === 0" class="column items-center q-py-lg app-text-muted">
        <q-icon name="category" size="36px" class="app-text-subtle" />
        <div class="text-body2 q-mt-sm">Sin gastos con desglose</div>
      </div>

      <template v-else>
        <div v-for="category in categories" :key="category.category_name" class="q-mb-md">
          <div class="row items-center justify-between q-gutter-x-sm no-wrap">
            <div class="ellipsis text-weight-medium app-text">{{ category.category_name }}</div>
            <div class="text-weight-bold text-no-wrap app-text">
              {{ formatMoney(category.amount) }}
            </div>
          </div>

          <q-linear-progress
            :value="progressFor(category)"
            color="primary"
            :track-color="$q.dark.isActive ? 'grey-9' : 'grey-3'"
            rounded
            size="8px"
            class="q-mt-xs"
          />

          <div class="text-caption app-text-muted q-mt-xs">
            {{ pluralize(category.items_count, 'ítem', 'ítems') }} ·
            {{ pluralize(category.lists_count, 'lista', 'listas') }}
          </div>
        </div>

        <div v-if="coverage < 1" class="row items-start q-gutter-x-sm q-mt-md">
          <q-icon name="info" size="18px" class="app-text-subtle q-mt-xs" />
          <div class="col text-caption app-text-muted">
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
import { useQuasar } from 'quasar'
import { formatMoney } from '@/utils/money'
import { pluralize } from '@/utils/pluralize'

const $q = useQuasar()

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
