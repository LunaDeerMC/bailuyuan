<script setup>
import BaseCard from '../base/BaseCard.vue';

defineProps({
  player: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <BaseCard class="player-card" padding="md" interactive>
    <img :src="player.avatar" :alt="`${player.name} avatar`">
    <h3>{{ player.name }}</h3>
    <p class="player-card__uuid">{{ player.uuid }}</p>
    <div class="player-card__stats">
      <span v-for="stat in player.highlights" :key="stat.label">
        <strong>{{ stat.value }}</strong>
        <small>{{ stat.label }}</small>
      </span>
    </div>
  </BaseCard>
</template>

<style scoped>
.player-card {
  text-align: center;
}

.player-card img {
  width: 80px;
  height: 80px;
  margin: 0 auto 14px;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.player-card h3,
.player-card__uuid {
  margin: 0;
}

.player-card__uuid {
  margin-top: 6px;
  color: var(--bl-text-secondary);
  font-family: monospace;
  font-size: 0.78rem;
}

.player-card__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--bl-border);
}

.player-card__stats span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.player-card__stats small {
  color: var(--bl-text-secondary);
}
</style>