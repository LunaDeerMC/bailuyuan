<script setup>
defineProps({
  tone: {
    type: String,
    default: 'neutral',
  },
  size: {
    type: String,
    default: 'md',
  },
});
</script>

<template>
  <span :class="['base-badge', `base-badge--${tone}`, `base-badge--${size}`]">
    <slot />
  </span>
</template>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  font-weight: 700;
  white-space: nowrap;
}

.base-badge--sm {
  min-height: 22px;
  padding: 0 9px;
  font-size: 0.7rem;
}

.base-badge--md {
  min-height: 26px;
  padding: 0 11px;
  font-size: 0.76rem;
}

.base-badge--neutral {
  background: var(--bl-badge-neutral-bg);
  color: var(--bl-text-secondary);
}

.base-badge--accent {
  background: var(--bl-badge-accent-bg);
  color: var(--bl-badge-accent-text);
}

.base-badge--success {
  background: var(--bl-badge-success-bg);
  color: var(--bl-badge-success-text);
}

.base-badge--warning {
  background: var(--bl-badge-warning-bg);
  color: var(--bl-badge-warning-text);
}

.base-badge--danger {
  background: var(--bl-badge-danger-bg);
  color: var(--bl-badge-danger-text);
}

.base-badge--purple {
  background: var(--bl-badge-purple-bg);
  color: var(--bl-badge-purple-text);
}
</style>