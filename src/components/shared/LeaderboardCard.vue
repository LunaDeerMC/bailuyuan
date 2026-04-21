<script setup>
import BaseCard from '../base/BaseCard.vue';

defineProps({
  board: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <BaseCard class="leaderboard-card" padding="md">
    <div class="leaderboard-card__header" :style="{ borderTopColor: board.color }">
      <div class="leaderboard-card__icon">{{ board.icon }}</div>
      <div>
        <h3>{{ board.title }}</h3>
        <p>{{ board.subtitle }}</p>
      </div>
    </div>

    <div class="leaderboard-card__champion">
      <strong>{{ board.top.name }}</strong>
      <span>{{ board.top.value }}</span>
    </div>

    <ol class="leaderboard-card__list">
      <li v-for="entry in board.entries" :key="entry.rank">
        <span class="leaderboard-card__rank">{{ entry.rank }}</span>
        <span class="leaderboard-card__name">{{ entry.name }}</span>
        <strong>{{ entry.value }}</strong>
      </li>
    </ol>
  </BaseCard>
</template>

<style scoped>
.leaderboard-card {
  padding-top: 0;
  overflow: hidden;
}

.leaderboard-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 -24px 20px;
  padding: 20px 24px 0;
  border-top: 4px solid var(--bl-gold);
}

.leaderboard-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--bl-bg);
  font-size: 1.2rem;
}

.leaderboard-card__header h3,
.leaderboard-card__header p {
  margin: 0;
}

.leaderboard-card__header p {
  color: var(--bl-text-secondary);
  font-size: 0.88rem;
}

.leaderboard-card__champion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--bl-border);
}

.leaderboard-card__champion strong {
  font-size: 1.05rem;
}

.leaderboard-card__champion span {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--bl-accent);
}

.leaderboard-card__list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.leaderboard-card__list li {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 10px;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--bl-border);
}

.leaderboard-card__rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bl-surface-muted);
  display: grid;
  place-items: center;
  font-size: 0.78rem;
  font-weight: 800;
}

.leaderboard-card__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>