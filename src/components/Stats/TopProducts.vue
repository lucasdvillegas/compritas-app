<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center q-gutter-x-sm no-wrap">
        <q-avatar class="app-neutral-avatar" icon="leaderboard" size="34px" />

        <div class="col" style="min-width: 0">
          <div class="text-overline text-uppercase app-text-muted">Productos más comprados</div>
          <div class="text-caption app-text-muted q-mt-xs">Ranking por cantidad de compras.</div>
        </div>
      </div>
    </q-card-section>

    <q-card-section v-if="products.length > 0" class="q-pt-none">
      <div
        v-for="(product, index) in products"
        :key="product.product_id ?? product.product_name"
        class="row items-start no-wrap q-gutter-x-sm app-surface-muted rounded-borders q-pa-sm q-mb-sm"
      >
        <q-avatar
          :class="index === 0 ? 'app-accent-avatar' : 'app-surface-avatar'"
          icon="inventory_2"
          size="36px"
        />

        <div class="col" style="min-width: 0">
          <div class="text-weight-medium app-text ellipsis">
            {{ product.product_name }}
          </div>

          <div class="text-caption app-text-muted">
            {{ pluralize(product.times_purchased, 'compra', 'compras') }}
            <template v-if="quantitySummary(product)">
              · {{ quantitySummary(product) }}
            </template>
          </div>

          <div class="text-caption app-text-muted">
            Última compra: {{ formatDate(product.last_purchased_at) }}
            <template v-if="product.average_days_between !== null">
              · cada ~{{ product.average_days_between }} días
            </template>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-section v-else class="column items-center q-py-lg app-text-muted">
      <q-icon name="shopping_bag" size="36px" class="app-text-subtle" />
      <div class="text-body2 q-mt-sm">Todavía no hay productos comprados</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { formatDate } from '@/utils/dates'
import { pluralize } from '@/utils/pluralize'
import { formatQuantity } from '@/utils/units'

defineProps({
  products: {
    type: Array,
    required: true,
  },
})

function quantitySummary(product) {
  return Object.entries(product.quantities ?? {})
    .map(([unit, value]) => formatQuantity(value, unit))
    .join(' · ')
}
</script>
