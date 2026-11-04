<template>
  <q-card flat bordered class="fit">
    <q-card-section>
      <div class="text-overline text-uppercase app-text-muted">Evolución mensual</div>
      <div class="text-body2 app-text-muted q-mt-xs">Gastos por mes en {{ year }}</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div style="height: 260px">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { formatMoney, formatMoneyCompact } from '@/utils/money'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const $q = useQuasar()

const props = defineProps({
  months: {
    type: Array,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  selectedMonth: {
    type: Number,
    default: null,
  },
})

const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'short' })

function monthLabel(value) {
  const [year, month] = value.split('-').map(Number)

  return monthFormatter.format(new Date(year, month - 1, 1))
}

const chartColors = computed(() =>
  $q.dark.isActive
    ? {
        bar: 'rgba(165, 40, 53, 0.9)',
        barMuted: 'rgba(255, 255, 255, 0.16)',
        barHover: 'rgba(165, 40, 53, 1)',
        text: '#e8eaed',
        grid: 'rgba(255, 255, 255, 0.08)',
      }
    : {
        bar: 'rgba(165, 40, 53, 0.75)',
        barMuted: 'rgba(165, 40, 53, 0.25)',
        barHover: 'rgba(165, 40, 53, 0.95)',
        text: '#5f6368',
        grid: 'rgba(0, 0, 0, 0.06)',
      },
)

const barColors = computed(() =>
  props.months.map((month, index) =>
    props.selectedMonth === null || props.selectedMonth === index + 1
      ? chartColors.value.bar
      : chartColors.value.barMuted,
  ),
)

const chartData = computed(() => ({
  labels: props.months.map((month) => monthLabel(month.month)),
  datasets: [
    {
      data: props.months.map((month) => month.total_spent),
      backgroundColor: barColors.value,
      hoverBackgroundColor: chartColors.value.barHover,
      borderRadius: 4,
      maxBarThickness: 36,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => formatMoney(context.parsed.y),
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: chartColors.value.grid,
      },
      ticks: {
        color: chartColors.value.text,
        callback: (value) => formatMoneyCompact(value),
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: chartColors.value.text,
      },
    },
  },
}))
</script>
