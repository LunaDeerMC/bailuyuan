<script setup>
import BaseBadge from '../base/BaseBadge.vue';
import BaseCard from '../base/BaseCard.vue';

defineProps({
  town: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <BaseCard class="town-card" padding="sm" interactive>
    <div class="town-card__cover" :style="{ backgroundImage: town.image ? `url(${town.image})` : '' }">
      <div class="town-card__overlay"></div>
      <div class="town-card__badges">
        <span v-for="pill in town.quickBadges" :key="pill" class="town-card__icon-pill">{{ pill }}</span>
      </div>
    </div>

    <div class="town-card__body">
      <div class="town-card__top">
        <h3>{{ town.title }}</h3>
        <BaseBadge tone="accent">{{ town.scale }}</BaseBadge>
      </div>
      <p>{{ town.intro }}</p>
      <div class="town-card__meta">
        <span v-for="meta in town.meta" :key="meta">{{ meta }}</span>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.town-card {
  padding: 0;
  overflow: hidden;
}

.town-card__cover {
  position: relative;
  min-height: 148px;
  background:
    linear-gradient(135deg, rgba(102, 126, 234, 0.88), rgba(118, 75, 162, 0.9)),
    center/cover no-repeat;
}

.town-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.32), transparent 55%);
}

.town-card__badges {
  position: absolute;
  bottom: 14px;
  left: 16px;
  display: flex;
  gap: 8px;
  z-index: 1;
}

.town-card__icon-pill {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--bl-surface-frost-strong);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.14);
  font-size: 0.72rem;
  font-weight: 700;
}

.town-card__body {
  padding: 24px 20px 20px;
  display: grid;
  gap: 12px;
}

.town-card__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.town-card__top h3,
.town-card__body p {
  margin: 0;
}

.town-card__body p {
  color: var(--bl-text-secondary);
}

.town-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
  padding-top: 14px;
  border-top: 1px solid var(--bl-border);
}

.town-card__meta span {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--bl-surface-muted);
  font-size: 0.75rem;
  color: var(--bl-text-secondary);
}
</style>