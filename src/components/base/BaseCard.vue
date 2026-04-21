<script setup>
defineProps({
  tag: {
    type: String,
    default: 'article',
  },
  padding: {
    type: String,
    default: 'md',
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  muted: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <component :is="tag" :class="['base-card', `base-card--${padding}`, { 'is-interactive': interactive, 'is-muted': muted }]">
    <slot />
  </component>
</template>

<style scoped>
.base-card {
  border-radius: var(--bl-radius-lg);
  background: var(--bl-surface);
  border: 1px solid var(--bl-border);
  box-shadow: var(--bl-shadow-soft);
  backdrop-filter: blur(18px);
}

.base-card--sm {
  padding: 18px;
}

.base-card--md {
  padding: 24px;
}

.base-card--lg {
  padding: 30px;
}

.base-card.is-interactive {
  cursor: pointer;
  transition: var(--bl-transition);
}

.base-card.is-interactive:hover {
  transform: translateY(-4px);
  box-shadow: var(--bl-shadow-card);
}

.base-card.is-muted {
  background: var(--bl-surface-frost);
}
</style>