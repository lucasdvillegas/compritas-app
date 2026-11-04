import { acceptHMRUpdate, defineStore } from 'pinia'
import { listsServices } from '@/services/listsServices'

function summaryFrom(list) {
  return {
    id: list.id,
    name: list.name,
    status: list.status,
    items_count: list.items_count ?? 0,
    checked_items_count: list.checked_items_count ?? 0,
    completed_at: list.completed_at ?? null,
    total_amount: list.total_amount ?? null,
    manual_total: list.manual_total ?? null,
    created_at: list.created_at,
    updated_at: list.updated_at,
  }
}

export const useListsStore = defineStore('lists', {
  state: () => ({
    lists: [],
    activeList: null,
    loading: false,
    loadingList: false,
    savingList: false,
    savingItemId: null,
  }),

  getters: {
    activeListId: (state) => state.activeList?.id ?? null,
    activeItems: (state) => state.activeList?.items ?? [],
    activeCheckedCount: (state) =>
      state.activeList?.items?.filter((item) => item.checked).length ?? 0,
    activeTotal: (state) => {
      const list = state.activeList

      if (list?.manual_total !== null && list?.manual_total !== undefined) {
        return Number(list.manual_total)
      }

      const items = list?.items ?? []

      return (
        Math.round(items.reduce((total, item) => total + (Number(item.line_total) || 0), 0) * 100) /
        100
      )
    },
    activeManualTotal: (state) =>
      state.activeList?.manual_total === null || state.activeList?.manual_total === undefined
        ? null
        : Number(state.activeList.manual_total),
    activeUnpricedCount: (state) =>
      state.activeList?.items?.filter(
        (item) => item.line_total === null || item.line_total === undefined,
      ).length ?? 0,
    activeIsCompleted: (state) => state.activeList?.status === 'completed',
  },

  actions: {
    fetchOpenLists() {
      this.loading = true

      return listsServices
        .getLists({ status: 'open' })
        .then(({ data }) => {
          this.lists = data.data

          const activeStillOpen = this.activeList
            ? this.lists.some((list) => list.id === this.activeList.id)
            : false

          if (activeStillOpen) {
            this.syncActiveCountsFromSummary()

            return this.lists
          }

          this.activeList = null

          if (this.lists.length === 0) {
            return this.lists
          }

          return this.selectList(this.lists[0].id).then(() => this.lists)
        })
        .finally(() => {
          this.loading = false
        })
    },

    selectList(id) {
      if (this.activeList?.id === id && Array.isArray(this.activeList.items)) {
        return Promise.resolve(this.activeList)
      }

      this.loadingList = true

      return listsServices
        .getList(id)
        .then(({ data }) => {
          this.activeList = data.data
          this.syncSummary(this.activeList)

          return this.activeList
        })
        .finally(() => {
          this.loadingList = false
        })
    },

    createList(name) {
      this.savingList = true

      return listsServices
        .createList({ name })
        .then(({ data }) => {
          this.applySavedList(data.data)

          return this.selectList(data.data.id).then(() => data.data)
        })
        .finally(() => {
          this.savingList = false
        })
    },

    updateList(id, name) {
      this.savingList = true

      return listsServices
        .updateList(id, { name })
        .then(({ data }) => {
          this.applySavedList(data.data)

          return data.data
        })
        .finally(() => {
          this.savingList = false
        })
    },

    setManualTotal(id, manualTotal) {
      this.savingList = true

      return listsServices
        .updateList(id, { manual_total: manualTotal })
        .then(({ data }) => {
          this.applySavedList(data.data)

          return data.data
        })
        .finally(() => {
          this.savingList = false
        })
    },

    deleteList(id) {
      this.savingList = true

      return listsServices
        .deleteList(id)
        .then(() => {
          this.lists = this.lists.filter((list) => list.id !== id)

          if (this.activeList?.id !== id) {
            return
          }

          this.activeList = null

          if (this.lists.length === 0) {
            return
          }

          return this.selectList(this.lists[0].id)
        })
        .finally(() => {
          this.savingList = false
        })
    },

    completeList(id) {
      this.savingList = true

      return listsServices
        .completeList(id)
        .then(({ data }) => {
          this.lists = this.lists.filter((list) => list.id !== id)

          if (this.activeList?.id !== id) {
            return data.data
          }

          this.activeList = null

          if (this.lists.length === 0) {
            return data.data
          }

          return this.selectList(this.lists[0].id).then(() => data.data)
        })
        .finally(() => {
          this.savingList = false
        })
    },

    addItem(productId, { quantity = 1, checked = false } = {}) {
      const list = this.requireActiveList()

      return listsServices
        .addItem(list.id, {
          product_id: productId,
          quantity,
          checked,
        })
        .then(({ data }) => {
          this.upsertItem(data.data)

          return data.data
        })
    },

    updateItem(itemId, payload) {
      const list = this.requireActiveList()
      this.savingItemId = itemId

      return listsServices
        .updateItem(list.id, itemId, payload)
        .then(({ data }) => {
          this.upsertItem(data.data)

          return data.data
        })
        .finally(() => {
          this.savingItemId = null
        })
    },

    removeItem(itemId) {
      const list = this.requireActiveList()
      this.savingItemId = itemId

      return listsServices
        .removeItem(list.id, itemId)
        .then(() => {
          list.items = list.items.filter((item) => item.id !== itemId)
          this.syncCounts()
        })
        .finally(() => {
          this.savingItemId = null
        })
    },

    applySavedList(list) {
      const index = this.lists.findIndex((item) => item.id === list.id)

      if (index === -1) {
        this.lists.unshift(summaryFrom(list))
      } else {
        this.lists.splice(index, 1, { ...this.lists[index], ...summaryFrom(list) })
      }

      if (this.activeList?.id === list.id) {
        this.activeList.name = list.name
        this.activeList.manual_total = list.manual_total ?? null
        this.syncCounts()
      }
    },

    syncSummary(list) {
      const index = this.lists.findIndex((item) => item.id === list.id)

      if (index !== -1) {
        this.lists.splice(index, 1, { ...this.lists[index], ...summaryFrom(list) })
      }
    },

    syncActiveCountsFromSummary() {
      const summary = this.lists.find((list) => list.id === this.activeList?.id)

      if (!summary || !this.activeList) {
        return
      }

      this.activeList.items_count = summary.items_count
      this.activeList.checked_items_count = summary.checked_items_count
    },

    upsertItem(item) {
      const list = this.requireActiveList()
      const index = list.items.findIndex((current) => current.id === item.id)

      if (index === -1) {
        list.items.push(item)
      } else {
        list.items.splice(index, 1, item)
      }

      this.syncCounts()
    },

    syncCounts() {
      if (!this.activeList) {
        return
      }

      const items = this.activeList.items ?? []
      const counts = {
        items_count: items.length,
        checked_items_count: items.filter((item) => item.checked).length,
      }

      this.activeList.items_count = counts.items_count
      this.activeList.checked_items_count = counts.checked_items_count

      const summary = this.lists.find((list) => list.id === this.activeList.id)

      if (summary) {
        summary.items_count = counts.items_count
        summary.checked_items_count = counts.checked_items_count
      }
    },

    requireActiveList() {
      if (!this.activeList || !Array.isArray(this.activeList.items)) {
        throw new Error('No hay una lista activa.')
      }

      return this.activeList
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useListsStore, import.meta.hot))
}
