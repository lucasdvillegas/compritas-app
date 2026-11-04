<template>
  <q-page class="app-page q-pa-lg">
    <div class="page-shell">
      <div class="row items-center justify-between q-gutter-y-md">
        <div>
          <h1 class="font-display text-h4 text-weight-bold app-text q-mt-xs q-mb-none">
            Tus gastos, en perspectiva
          </h1>
          <p class="text-body2 app-text-muted q-mt-sm q-mb-none">
            Mirá cuánto gastaste, en qué categorías y qué productos comprás más seguido.
          </p>
        </div>

        <q-select
          v-model="selectedYear"
          :options="yearOptions"
          label="Año"
          outlined
          dense
          emit-value
          map-options
          :disable="loading"
          style="min-width: 140px"
          @update:model-value="loadStats"
        />
      </div>

      <q-linear-progress
        v-if="loading && summary"
        indeterminate
        color="primary"
        :track-color="$q.dark.isActive ? 'grey-9' : 'grey-3'"
        class="q-mt-lg"
      />

      <div v-if="loading && !summary" class="column items-center q-pa-xl app-text-muted">
        <q-spinner color="primary" size="36px" />
        <div class="text-body2 q-mt-sm">Cargando estadísticas...</div>
      </div>

      <AppEmptyState
        v-else-if="summary && summary.lists_count === 0"
        class="q-mt-xl"
        icon="insights"
        :title="`Todavía no hay datos para ${selectedYear}`"
        description="Completá una lista para ver tus gastos y estadísticas."
        action-label="Ir a mis listas"
        :action-to="{ name: 'my-list' }"
      />

      <template v-else-if="summary">
        <StatsSummaryCards :summary="summary" class="q-mt-xl" />

        <div class="row q-col-gutter-lg q-mt-md">
          <div class="col-12 col-md-7">
            <MonthlyChart :months="months" :year="year" />
          </div>

          <div class="col-12 col-md-5">
            <CategoryBreakdown :categories="categories" :coverage="summary.breakdown_coverage" />
          </div>
        </div>

        <div class="q-mt-lg">
          <TopProducts :products="products" />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useStatsStore } from '@/stores/statsStore'
import StatsSummaryCards from '@/components/Stats/StatsSummaryCards.vue'
import MonthlyChart from '@/components/Stats/MonthlyChart.vue'
import CategoryBreakdown from '@/components/Stats/CategoryBreakdown.vue'
import TopProducts from '@/components/Stats/TopProducts.vue'
import AppEmptyState from '@/components/AppEmptyState.vue'

const $q = useQuasar()
const statsStore = useStatsStore()
const { summary, months, categories, products, year, loading } = storeToRefs(statsStore)

const currentYear = new Date().getFullYear()
const selectedYear = ref(statsStore.year)

const yearOptions = computed(() =>
  Array.from({ length: 5 }, (_, index) => {
    const value = currentYear - index

    return { label: String(value), value }
  }),
)

onMounted(loadStats)

function loadStats(value) {
  const selected = typeof value === 'number' ? value : selectedYear.value

  statsStore.fetchStats({ year: selected }).catch((error) => {
    if (error.response?.data?.message) {
      $q.notify({
        type: 'negative',
        message: error.response.data.message,
        position: 'top',
      })
    }
  })
}
</script>
