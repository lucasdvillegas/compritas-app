<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-overline text-uppercase text-grey-6">Productos más comprados</div>
      <div class="text-body2 text-grey-7 q-mt-xs">Ranking por cantidad de compras.</div>
    </q-card-section>

    <q-list v-if="products.length > 0" separator>
      <q-item v-for="product in products" :key="product.product_id ?? product.product_name">
        <q-item-section avatar top>
          <q-avatar color="grey-2" text-color="primary" icon="inventory_2" size="36px" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-medium text-dark ellipsis">
            {{ product.product_name }}
          </q-item-label>

          <q-item-label caption>
            {{ pluralize(product.times_purchased, 'compra', 'compras') }}
            <template v-if="quantitySummary(product)">
              · {{ quantitySummary(product) }}
            </template>
          </q-item-label>

          <q-item-label caption>
            Última compra: {{ formatDate(product.last_purchased_at) }}
            <template v-if="product.average_days_between !== null">
              · cada ~{{ product.average_days_between }} días
            </template>
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <q-card-section v-else class="column items-center q-py-lg text-grey-6">
      <q-icon name="shopping_bag" size="36px" class="text-grey-4" />
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
