<template>
  <div class="stats-carousel">
    <div
      ref="track"
      class="stats-track"
      :class="{ 'stats-track--dragging': dragging }"
      @scroll.passive="onScroll"
      @pointerdown="onPointerDown"
      @dragstart.prevent
    >
      <div v-for="card in cards" :key="card.key" class="stats-slide">
        <q-card
          class="fit"
          :class="{
            'app-primary-card': card.variant === 'primary',
            'app-accent-card': card.variant === 'accent',
          }"
          flat
          :bordered="card.variant === 'plain'"
        >
          <q-card-section class="q-pa-md">
            <q-avatar
              :class="card.variant === 'plain' ? 'app-neutral-avatar' : 'app-primary-avatar'"
              :icon="card.icon"
              size="34px"
            />

            <div class="text-overline text-uppercase app-text-muted q-mt-md">{{ card.label }}</div>
            <div class="font-display text-h5 text-weight-bold app-text q-mt-xs">
              {{ card.value }}
            </div>
            <div class="text-caption app-text-muted q-mt-xs">{{ card.caption }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="stats-dots">
      <button
        v-for="(card, index) in cards"
        :key="card.key"
        type="button"
        class="stats-dot"
        :class="{ 'stats-dot--active': index === activeIndex }"
        :aria-label="`Ir a ${card.label}`"
        :aria-current="index === activeIndex ? 'true' : undefined"
        @click="goTo(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatMoney } from '@/utils/money'
import { pluralize } from '@/utils/pluralize'

const props = defineProps({
  summary: {
    type: Object,
    required: true,
  },
})

const track = ref(null)
const activeIndex = ref(0)
const dragging = ref(false)

let dragStartX = 0
let dragStartScroll = 0
let dragged = false

const coveragePercent = computed(() => Math.round((props.summary.breakdown_coverage ?? 0) * 100))

const cards = computed(() => [
  {
    key: 'total',
    icon: 'payments',
    label: 'Gastos del período',
    value: formatMoney(props.summary.total_spent),
    caption: pluralize(props.summary.lists_count, 'lista completada', 'listas completadas'),
    variant: 'primary',
  },
  {
    key: 'average',
    icon: 'trending_up',
    label: 'Promedio por lista',
    value: formatMoney(props.summary.average_per_list),
    caption: 'Sobre las listas completadas',
    variant: 'plain',
  },
  {
    key: 'breakdown',
    icon: 'receipt_long',
    label: 'Con desglose',
    value: formatMoney(props.summary.breakdown_total),
    caption: `${props.summary.priced_items_count} de ${
      props.summary.priced_items_count + props.summary.unpriced_items_count
    } ítems con precio`,
    variant: 'plain',
  },
  {
    key: 'coverage',
    icon: 'donut_large',
    label: 'Cobertura',
    value: `${coveragePercent.value}%`,
    caption: 'Los importes sin desglose no se reparten',
    variant: 'accent',
  },
])

function onScroll() {
  const el = track.value
  const slide = el?.firstElementChild

  if (!el || !slide) {
    return
  }

  const step = slide.getBoundingClientRect().width + parseFloat(getComputedStyle(el).gap || '0')

  if (step <= 0) {
    return
  }

  activeIndex.value = Math.min(cards.value.length - 1, Math.round(el.scrollLeft / step))
}

function goTo(index) {
  const el = track.value
  const slide = el?.children?.[index]

  if (!el || !slide) {
    return
  }

  const left = slide.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft

  el.scrollTo({ left, behavior: 'smooth' })
}

function onPointerDown(event) {
  if (event.pointerType === 'touch') {
    return
  }

  const el = track.value

  if (!el || el.scrollWidth <= el.clientWidth) {
    return
  }

  dragging.value = true
  dragged = false
  dragStartX = event.clientX
  dragStartScroll = el.scrollLeft
}

function onPointerMove(event) {
  const el = track.value

  if (!dragging.value || !el) {
    return
  }

  const delta = event.clientX - dragStartX

  if (Math.abs(delta) > 4) {
    dragged = true
  }

  if (!dragged) {
    return
  }

  event.preventDefault()
  el.scrollLeft = dragStartScroll - delta
}

function nearestIndex() {
  const el = track.value
  const slide = el?.firstElementChild

  if (!el || !slide) {
    return 0
  }

  const step = slide.getBoundingClientRect().width + parseFloat(getComputedStyle(el).gap || '0')

  if (step <= 0) {
    return 0
  }

  return Math.min(cards.value.length - 1, Math.max(0, Math.round(el.scrollLeft / step)))
}

function onPointerUp() {
  if (!dragging.value) {
    return
  }

  dragging.value = false

  if (dragged) {
    activeIndex.value = nearestIndex()
    goTo(activeIndex.value)
  }
}

onMounted(() => {
  window.addEventListener('pointermove', onPointerMove, { passive: false })
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
})
</script>

<style scoped>
.stats-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: 2px;
  cursor: grab;
}

.stats-track--dragging {
  cursor: grabbing;
  scroll-snap-type: none;
  user-select: none;
}

.stats-track::-webkit-scrollbar {
  display: none;
}

.stats-slide {
  flex: 0 0 86%;
  scroll-snap-align: start;
  min-width: 0;
}

.stats-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
}

.stats-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--app-border);
  cursor: pointer;
  transition:
    width 0.2s ease,
    background 0.2s ease;
}

.stats-dot--active {
  width: 20px;
  background: var(--q-primary);
}

@media (min-width: 600px) {
  .stats-slide {
    flex-basis: calc(50% - 8px);
  }
}

@media (min-width: 1024px) {
  .stats-track {
    overflow: visible;
    cursor: default;
  }

  .stats-slide {
    flex: 1 1 0;
  }

  .stats-dots {
    display: none;
  }
}
</style>
