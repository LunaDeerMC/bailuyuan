<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'md',
  },
  block: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['base-button', `base-button--${variant}`, `base-button--${size}`, { 'base-button--block': block }]"
  >
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--bl-transition);
  white-space: nowrap;
}

.base-button--sm {
  min-height: 34px;
  padding: 0 14px;
  font-size: 0.84rem;
}

.base-button--md {
  min-height: 44px;
  padding: 0 22px;
  font-size: 0.94rem;
}

.base-button--lg {
  min-height: 52px;
  padding: 0 28px;
  font-size: 1rem;
}

.base-button--primary {
  background: var(--bl-accent);
  color: #fff;
}

.base-button--primary:hover:not(:disabled) {
  background: var(--bl-accent-strong);
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(0, 113, 227, 0.22);
}

.base-button--secondary {
  background: var(--bl-text);
  color: #fff;
}

.base-button--secondary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(29, 29, 31, 0.18);
}

.base-button--ghost {
  background: transparent;
  color: var(--bl-text);
  border: 1px solid var(--bl-border);
}

.base-button--ghost:hover:not(:disabled) {
  border-color: var(--bl-border-strong);
  background: var(--bl-surface-frost);
}

.base-button--soft {
  background: var(--bl-surface-frost);
  color: var(--bl-text);
  border: 1px solid var(--bl-border);
  backdrop-filter: blur(12px);
}

.base-button--soft:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--bl-shadow-soft);
}

.base-button--block {
  width: 100%;
}

.base-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>