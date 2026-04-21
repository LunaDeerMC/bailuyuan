<script setup>
defineProps({
  title: {
    type: String,
    default: '暂无内容',
  },
  description: {
    type: String,
    default: '当前没有可展示的数据。',
  },
});
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">◇</div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <div v-if="$slots.default" class="empty-state__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  padding: 34px 24px;
  border-radius: var(--bl-radius-lg);
  background: linear-gradient(180deg, var(--bl-empty-start), var(--bl-empty-end));
  border: 1px dashed var(--bl-border);
  text-align: center;
}

.empty-state__icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: rgba(0, 113, 227, 0.08);
  color: var(--bl-accent);
  display: grid;
  place-items: center;
  font-size: 1.5rem;
}

.empty-state h3,
.empty-state p {
  margin: 0;
}

.empty-state p {
  margin-top: 8px;
  color: var(--bl-text-secondary);
}

.empty-state__actions {
  margin-top: 18px;
}
</style>