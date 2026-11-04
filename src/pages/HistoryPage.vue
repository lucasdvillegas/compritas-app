<template>
  <q-page class="bg-grey-1 q-pa-lg">
    <div class="page-shell">
      <div class="text-overline text-uppercase text-primary">Historial</div>
      <h1 class="font-display text-h4 text-weight-bold text-dark q-mt-xs q-mb-none">
        Todas tus listas
      </h1>
      <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
        Revisá las compras que ya completaste. Las listas cerradas no se pueden modificar.
      </p>

      <div v-if="loading" class="column items-center q-pa-xl text-grey-6">
        <q-spinner color="primary" size="36px" />
        <div class="text-body2 q-mt-sm">Cargando historial...</div>
      </div>

      <q-card v-else-if="lists.length === 0" flat bordered class="q-mt-xl">
        <q-card-section>
          <q-avatar color="grey-2" text-color="primary" icon="history" />
          <div class="font-display text-h6 text-weight-bold text-dark q-mt-md">
            Sin historial por ahora
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Cuando completes una lista va a quedar guardada acá con todos sus productos.
          </div>
          <q-btn
            class="q-mt-lg"
            color="primary"
            icon="playlist_add_check"
            label="Ir a mis listas"
            unelevated
            no-caps
            :to="{ name: 'my-list' }"
          />
        </q-card-section>
      </q-card>

      <template v-else>
        <div class="row items-center justify-between q-mt-xl">
          <div class="text-overline text-uppercase text-grey-6">Listas completadas</div>
          <div class="text-caption text-grey-6">{{ lists.length }} en total</div>
        </div>

        <q-card v-for="list in lists" :key="list.id" flat bordered class="q-mt-sm">
          <q-item clickable class="q-py-md" @click="openDetail(list)">
            <q-item-section avatar>
              <q-avatar color="grey-2" text-color="primary" icon="task_alt" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold text-dark">{{ list.name }}</q-item-label>
              <q-item-label caption>
                {{
                  list.completed_at ? `Completada el ${formatDate(list.completed_at)}` : 'Sin fecha'
                }}
              </q-item-label>
              <q-item-label caption>
                {{ pluralize(list.items_count, 'producto', 'productos') }} ·
                {{ pluralize(list.checked_items_count, 'marcado', 'marcados') }}
              </q-item-label>
              <q-item-label v-if="list.total_amount !== null" caption class="text-primary">
                Total {{ formatMoney(list.total_amount) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row items-center no-wrap q-gutter-x-xs">
                <q-btn
                  v-if="list.role === 'owner'"
                  flat
                  dense
                  round
                  icon="delete_outline"
                  color="negative"
                  :aria-label="`Eliminar ${list.name}`"
                  @click.stop="confirmDelete(list)"
                />
                <q-icon name="chevron_right" class="text-grey-5" />
              </div>
            </q-item-section>
          </q-item>
        </q-card>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { listsServices } from '@/services/listsServices'
import { formatDate } from '@/utils/dates'
import { formatMoney } from '@/utils/money'
import { pluralize } from '@/utils/pluralize'
import ListDetailDialog from '@/components/Lists/ListDetailDialog.vue'

const $q = useQuasar()

const lists = ref([])
const loading = ref(false)

onMounted(fetchHistory)

function fetchHistory() {
  loading.value = true

  listsServices
    .getLists({ status: 'completed' })
    .then(({ data }) => {
      lists.value = [...data.data].sort((first, second) => {
        const firstDate = new Date(first.completed_at ?? first.created_at ?? 0).getTime()
        const secondDate = new Date(second.completed_at ?? second.created_at ?? 0).getTime()

        return secondDate - firstDate
      })
    })
    .catch((error) => {
      if (error.response?.data?.message) {
        $q.notify({
          type: 'negative',
          message: error.response.data.message,
          position: 'top',
        })
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function openDetail(list) {
  $q.dialog({
    component: ListDetailDialog,
    componentProps: { list },
  })
}

function confirmDelete(list) {
  $q.dialog({
    title: 'Eliminar lista',
    message: `¿Querés eliminar "${list.name}" del historial? Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: {
      label: 'Eliminar',
      color: 'negative',
      unelevated: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    listsServices
      .deleteList(list.id)
      .then(() => {
        lists.value = lists.value.filter((current) => current.id !== list.id)

        $q.notify({
          type: 'positive',
          message: 'Lista eliminada correctamente.',
          position: 'top',
        })
      })
      .catch((error) => {
        if (error.response?.data?.message) {
          $q.notify({
            type: 'negative',
            message: error.response.data.message,
            position: 'top',
          })
        }
      })
  })
}
</script>
