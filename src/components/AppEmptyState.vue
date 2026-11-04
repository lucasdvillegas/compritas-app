<template>
  <div>
    <q-card v-if="variant === 'primary'" class="app-primary-card">
      <q-card-section class="column items-center text-center q-pa-xl">
        <q-avatar class="app-primary-avatar" :icon="icon" />

        <div class="font-display text-h6 text-weight-bold q-mt-md">{{ title }}</div>

        <div v-if="description" class="text-body2 app-text-muted q-mt-xs">
          {{ description }}
        </div>

        <q-btn
          v-if="actionLabel"
          class="q-mt-lg"
          color="white"
          text-color="primary"
          :icon="actionIcon"
          :label="actionLabel"
          unelevated
          no-caps
          :to="actionTo || undefined"
          :loading="actionLoading"
          @click="emit('action')"
        />
      </q-card-section>
    </q-card>

    <div v-else class="column items-center text-center q-pa-xl">
      <q-icon :name="icon" :size="iconSize" class="app-text-subtle" />

      <div class="font-display text-h6 text-weight-bold app-text q-mt-md">{{ title }}</div>

      <div v-if="description" class="text-body2 app-text-muted q-mt-xs">
        {{ description }}
      </div>

      <q-btn
        v-if="actionLabel"
        class="q-mt-lg"
        color="primary"
        :icon="actionIcon"
        :label="actionLabel"
        unelevated
        no-caps
        :to="actionTo || undefined"
        :loading="actionLoading"
        @click="emit('action')"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'info',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  actionLabel: {
    type: String,
    default: '',
  },
  actionIcon: {
    type: String,
    default: '',
  },
  actionTo: {
    type: [String, Object],
    default: null,
  },
  actionLoading: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'primary',
  },
  iconSize: {
    type: String,
    default: '44px',
  },
})

const emit = defineEmits(['action'])
</script>
