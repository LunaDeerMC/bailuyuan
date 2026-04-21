<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '搜索内容...',
  },
  ariaLabel: {
    type: String,
    default: '搜索',
  },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <label class="search-box">
    <span class="search-box__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
        <path d="M16 16L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </span>
    <input
      :value="props.modelValue"
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      @input="emit('update:modelValue', $event.target.value)"
    >
  </label>
</template>

<style scoped>
.search-box {
  position: relative;
  display: block;
  width: 100%;
}

.search-box__icon {
  position: absolute;
  top: 50%;
  left: 16px;
  width: 18px;
  height: 18px;
  color: var(--bl-text-tertiary);
  transform: translateY(-50%);
}

.search-box__icon svg {
  width: 100%;
  height: 100%;
}

.search-box input {
  width: 100%;
  min-height: 46px;
  padding: 0 16px 0 46px;
  border: 1px solid var(--bl-border);
  border-radius: 14px;
  background: var(--bl-input-bg);
  color: var(--bl-text);
  transition: var(--bl-transition);
}

.search-box input:focus {
  outline: none;
  background: var(--bl-input-focus-bg);
  border-color: var(--bl-accent);
  box-shadow: 0 0 0 4px var(--bl-focus-ring);
}
</style>