<script setup>
import AnnouncementCard from './AnnouncementCard.vue';

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div class="announcement-timeline">
    <article v-for="item in items" :key="item.id" class="announcement-timeline__item">
      <AnnouncementCard :announcement="item" />
    </article>
  </div>
</template>

<style scoped>
.announcement-timeline {
  position: relative;
  display: grid;
  gap: 22px;
  padding-left: 32px;
}

.announcement-timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 7px;
  width: 2px;
  background: linear-gradient(to bottom, var(--bl-accent), rgba(0, 113, 227, 0.08));
}

.announcement-timeline__item {
  position: relative;
}

.announcement-timeline__item::before {
  content: '';
  position: absolute;
  left: -32px;
  top: 24px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bl-surface-strong);
  border: 3px solid var(--bl-accent);
}
</style>