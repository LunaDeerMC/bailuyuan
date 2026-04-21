<script setup>
import BaseBadge from '../base/BaseBadge.vue';
import BaseCard from '../base/BaseCard.vue';

defineProps({
  donation: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <BaseCard class="donation-card" padding="md" interactive>
    <div class="donation-card__top">
      <div>
        <h3>{{ donation.name }}</h3>
        <p>{{ donation.message }}</p>
      </div>
      <BaseBadge tone="success">{{ donation.project }}</BaseBadge>
    </div>
    <div class="donation-card__footer">
      <strong>{{ donation.amount }}</strong>
      <span>{{ donation.time }}</span>
    </div>
  </BaseCard>
</template>

<style scoped>
.donation-card {
  display: grid;
  gap: 18px;
}

.donation-card__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.donation-card__top h3,
.donation-card__top p,
.donation-card__footer strong,
.donation-card__footer span {
  margin: 0;
}

.donation-card__top p {
  margin-top: 6px;
  color: var(--bl-text-secondary);
}

.donation-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 14px;
  border-top: 1px solid var(--bl-border);
}

.donation-card__footer strong {
  font-size: 1.35rem;
  color: var(--bl-green);
}

.donation-card__footer span {
  color: var(--bl-text-tertiary);
  font-size: 0.85rem;
}
</style>