<template>
  <q-card flat bordered class="fit">
    <q-card-section>
      <div class="text-overline text-uppercase text-grey-6">Evolución mensual</div>
      <div class="text-body2 text-grey-7 q-mt-xs">Gastos por mes en {{ year }}</div>
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

const props = defineProps({
  months: {
    type: Array,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
})

const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'short' })

function monthLabel(value) {
  const [year, month] = value.split('-').map(Number)

  return monthFormatter.format(new Date(year, month - 1, 1))
}

const chartData = computed(() => ({
  labels: props.months.map((month) => monthLabel(month.month)),
  datasets: [
    {
      data: props.months.map((month) => month.total_spent),
      backgroundColor: 'rgba(165, 40, 53, 0.75)',
      hoverBackgroundColor: 'rgba(165, 40, 53, 0.95)',
      borderRadius: 4,
      maxBarThickness: 36,
    },
  ],
}))

const chartOptions = {
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
        color: 'rgba(0, 0, 0, 0.06)',
      },
      ticks: {
        callback: (value) => formatMoneyCompact(value),
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}
</script>
