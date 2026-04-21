<script setup>
import { ref } from 'vue';
import BaseBadge from '../base/BaseBadge.vue';
import BaseCard from '../base/BaseCard.vue';

const props = defineProps({
  announcement: {
    type: Object,
    required: true,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
});

const open = ref(props.expanded);

const toneMap = {
  activity: 'success',
  maintenance: 'warning',
  other: 'purple',
};
</script>

<template>
  <BaseCard :class="['announcement-card', { 'is-expanded': open }]" padding="sm">
    <button type="button" class="announcement-card__summary" @click="open = !open">
      <div class="announcement-card__main">
        <div class="announcement-card__top">
          <BaseBadge :tone="toneMap[announcement.category] || 'neutral'">
            {{ announcement.categoryLabel }}
          </BaseBadge>
          <span class="announcement-card__time">{{ announcement.time }}</span>
        </div>
        <h3>{{ announcement.title }}</h3>
        <p>{{ announcement.intro }}</p>
      </div>
      <span class="announcement-card__caret" :class="{ 'is-open': open }">⌄</span>
    </button>

    <div v-if="open" class="announcement-card__content">
      <div v-for="block in announcement.content" :key="block.title" class="announcement-card__block">
        <h4>{{ block.title }}</h4>
        <p>{{ block.body }}</p>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.announcement-card {
  overflow: hidden;
}

.announcement-card__summary {
  width: 100%;
  padding: 18px 22px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.announcement-card.is-expanded .announcement-card__summary {
  border-bottom: 1px solid var(--bl-border);
  background: linear-gradient(to bottom, var(--bl-surface-hover), var(--bl-surface-subtle));
}

.announcement-card__main {
  flex: 1;
  min-width: 0;
}

.announcement-card__top {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.announcement-card__time {
  font-size: 0.82rem;
  color: var(--bl-text-tertiary);
}

.announcement-card h3,
.announcement-card p,
.announcement-card h4 {
  margin: 0;
}

.announcement-card h3 {
  font-size: 1.08rem;
}

.announcement-card p {
  color: var(--bl-text-secondary);
}

.announcement-card__caret {
  color: var(--bl-text-secondary);
  transition: transform 0.2s ease;
}

.announcement-card__caret.is-open {
  transform: rotate(180deg);
}

.announcement-card__content {
  display: grid;
  gap: 14px;
  padding: 18px 22px 22px;
}

.announcement-card__block {
  padding: 14px 16px;
  border-radius: var(--bl-radius-md);
  background: var(--bl-surface-frost);
}

.announcement-card__block h4 {
  margin-bottom: 6px;
  font-size: 0.94rem;
}
</style>