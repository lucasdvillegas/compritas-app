<template>
  <q-page class="bg-grey-1 q-pa-lg">
    <div class="page-shell">
      <div class="text-overline text-uppercase text-primary">Historial</div>
      <h1 class="font-display text-h4 text-weight-bold text-dark q-mt-xs q-mb-none">
        Todas tus listas
      </h1>
      <div class="row q-mt-sm">
        <p class="col-12 col-md-8 text-body2 text-grey-7 q-ma-none">
          Revisá las listas que ya creaste y reutilizá una como base para armar una nueva.
        </p>
      </div>

      <q-card flat bordered class="q-mt-xl">
        <q-card-section>
          <q-avatar color="grey-2" text-color="primary" icon="history" />
          <div class="font-display text-h6 text-weight-bold text-dark q-mt-md">
            Sin historial por ahora
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Cuando crees listas van a quedar guardadas acá. Vas a poder clonarlas con los mismos
            productos y sumar más.
          </div>
          <q-badge class="q-mt-lg text-uppercase" color="grey-3" text-color="grey-8">
            Próximamente
          </q-badge>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
//
</script>
