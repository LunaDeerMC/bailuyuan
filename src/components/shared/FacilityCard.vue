<script setup>
import BaseBadge from '../base/BaseBadge.vue';
import BaseCard from '../base/BaseCard.vue';

defineProps({
  facility: {
    type: Object,
    required: true,
  },
});

const toneMap = {
  online: 'success',
  maintenance: 'warning',
  offline: 'danger',
};
</script>

<template>
  <BaseCard class="facility-card" padding="md" interactive>
    <div class="facility-card__header">
      <h3>{{ facility.title }}</h3>
      <BaseBadge :tone="toneMap[facility.status] || 'neutral'">
        {{ facility.statusLabel }}
      </BaseBadge>
    </div>

    <p class="facility-card__intro">{{ facility.intro }}</p>

    <div class="facility-card__meta">
      <span v-for="meta in facility.meta" :key="meta" class="facility-card__tag">{{ meta }}</span>
    </div>
  </BaseCard>
</template>

<style scoped>
.facility-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 230px;
}

.facility-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.facility-card__header h3 {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.35;
}

.facility-card__intro {
  margin: 0;
  color: var(--bl-text-secondary);
  flex: 1;
}

.facility-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--bl-border);
}

.facility-card__tag {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--bl-surface-muted);
  color: var(--bl-text-secondary);
  font-size: 0.76rem;
  font-weight: 600;
}
</style>