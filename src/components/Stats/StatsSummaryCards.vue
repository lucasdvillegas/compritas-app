<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-sm-6 col-md-3">
      <q-card flat bordered class="fit">
        <q-card-section>
          <div class="text-overline text-uppercase text-grey-6">Gastos del período</div>
          <div class="font-display text-h5 text-weight-bold text-dark q-mt-xs">
            {{ formatMoney(summary.total_spent) }}
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">
            {{ pluralize(summary.lists_count, 'lista completada', 'listas completadas') }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card flat bordered class="fit">
        <q-card-section>
          <div class="text-overline text-uppercase text-grey-6">Promedio por lista</div>
          <div class="font-display text-h5 text-weight-bold text-dark q-mt-xs">
            {{ formatMoney(summary.average_per_list) }}
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">Sobre las listas completadas</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card flat bordered class="fit">
        <q-card-section>
          <div class="text-overline text-uppercase text-grey-6">Con desglose</div>
          <div class="font-display text-h5 text-weight-bold text-dark q-mt-xs">
            {{ formatMoney(summary.breakdown_total) }}
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">
            {{ summary.priced_items_count }} de
            {{ summary.priced_items_count + summary.unpriced_items_count }} ítems con precio
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card flat bordered class="fit">
        <q-card-section>
          <div class="text-overline text-uppercase text-grey-6">Cobertura</div>
          <div class="font-display text-h5 text-weight-bold text-dark q-mt-xs">
            {{ coveragePercent }}%
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">
            Los importes sin desglose no se reparten
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '@/utils/money'
import { pluralize } from '@/utils/pluralize'

const props = defineProps({
  summary: {
    type: Object,
    required: true,
  },
})

const coveragePercent = computed(() => Math.round((props.summary.breakdown_coverage ?? 0) * 100))
</script>
