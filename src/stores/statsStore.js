import { acceptHMRUpdate, defineStore } from 'pinia'
import { statsServices } from '@/services/statsServices'

function pad(value) {
  return String(value).padStart(2, '0')
}

function todayString() {
  const now = new Date()

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function rangeFor(year, month = null) {
  if (month !== null && month !== undefined) {
    return {
      from: `${year}-${pad(month)}-01`,
      to: `${year}-${pad(month)}-${pad(lastDayOfMonth(year, month))}`,
    }
  }

  const currentYear = new Date().getFullYear()

  return {
    from: `${year}-01-01`,
    to: year === currentYear ? todayString() : `${year}-12-31`,
  }
}

export const useStatsStore = defineStore('stats', {
  state: () => ({
    summary: null,
    months: [],
    categories: [],
    products: [],
    year: new Date().getFullYear(),
    loading: false,
  }),

  getters: {
    hasData: (state) => Boolean(state.summary && state.summary.lists_count > 0),
    breakdownCoverage: (state) => state.summary?.breakdown_coverage ?? 0,
  },

  actions: {
    fetchStats({ year = null, month = null } = {}) {
      this.loading = true

      const selectedYear = year ?? this.year
      const range = rangeFor(selectedYear, month)

      return Promise.all([
        statsServices.getSummary(range),
        statsServices.getMonthly({ year: selectedYear }),
        statsServices.getCategories(range),
        statsServices.getProducts({ ...range, limit: 10 }),
      ])
        .then(([summary, monthly, categories, products]) => {
          this.summary = summary.data.data
          this.months = monthly.data.data.months
          this.year = monthly.data.data.year
          this.categories = categories.data.data.categories
          this.products = products.data.data.products

          return this.summary
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatsStore, import.meta.hot))
}
