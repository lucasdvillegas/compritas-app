<template>
  <q-page class="bg-grey-1 q-pa-lg">
    <div class="page-shell">
      <div class="text-overline text-uppercase text-primary">Mi lista</div>
      <h1 class="font-display text-h4 text-weight-bold text-dark q-mt-xs q-mb-none">
        Tu compra, sin vueltas
      </h1>
      <div class="row q-mt-sm">
        <p class="col-12 col-md-8 text-body2 text-grey-7 q-ma-none">
          Acá vas a encontrar la última lista que creaste, lista para sumar productos desde el
          modal.
        </p>
      </div>

      <q-card flat bordered class="q-mt-xl">
        <q-card-section>
          <q-avatar color="grey-2" text-color="primary" icon="playlist_add_check" />
          <div class="font-display text-h6 text-weight-bold text-dark q-mt-md">
            Todavía no armaste una lista
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Tu última lista va a aparecer en esta sección. Desde el modal de productos vas a poder
            agregar nuevos ítems.
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
