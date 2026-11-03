<template>
  <q-page class="bg-grey-1 q-pa-lg">
    <div class="page-shell">
      <div class="text-overline text-uppercase text-primary">Productos</div>
      <h1 class="font-display text-h4 text-weight-bold text-dark q-mt-xs q-mb-none">
        El catálogo de la banda
      </h1>
      <div class="row q-mt-sm">
        <p class="col-12 col-md-8 text-body2 text-grey-7 q-ma-none">
          Todos los productos disponibles, con su nombre y categoría, y el alta de nuevos ítems.
        </p>
      </div>

      <q-card flat bordered class="q-mt-xl">
        <q-card-section>
          <q-avatar color="grey-2" text-color="primary" icon="inventory_2" />
          <div class="font-display text-h6 text-weight-bold text-dark q-mt-md">Catálogo vacío</div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Acá va a vivir el listado de productos con columnas de nombre y categoría, más el
            formulario para cargar nuevos.
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
