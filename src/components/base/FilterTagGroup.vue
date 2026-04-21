<script setup>
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  labelIcon: {
    type: String,
    default: '',
  },
  modelValue: {
    type: String,
    default: 'all',
  },
  options: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="filter-group">
    <div v-if="label" class="filter-group__label">
      <i v-if="labelIcon" :class="labelIcon"></i>
      {{ label }}
    </div>
    <div class="filter-group__tags" role="group" :aria-label="label || '筛选项'">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :class="['filter-tag', { 'is-active': option.value === modelValue }]"
        @click="emit('update:modelValue', option.value)"
      >
        <i v-if="option.iconClass" :class="option.iconClass" class="filter-tag__icon"></i>
        <span v-else-if="option.icon" class="filter-tag__icon">{{ option.icon }}</span>
        <span>{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.filter-group__label {
  min-width: 72px;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--bl-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-group__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--bl-control-bg);
  color: var(--bl-text-secondary);
  border: 1px solid var(--bl-border);
  cursor: pointer;
  transition: var(--bl-transition);
  font-size: 13px;
}

.filter-tag:hover {
  background: var(--bl-control-hover-bg);
  color: var(--bl-text);
  border-color: var(--bl-border-strong);
}

.filter-tag.is-active {
  background: var(--bl-control-active-bg);
  color: var(--bl-control-active-color);
  border-color: var(--bl-control-active-border);
  box-shadow: var(--bl-control-active-shadow);
}

.filter-tag__icon {
  font-size: 14px;
}
</style>