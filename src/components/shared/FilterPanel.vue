<script setup>
import BaseButton from '../base/BaseButton.vue';
import BaseCard from '../base/BaseCard.vue';
import FilterTagGroup from '../base/FilterTagGroup.vue';
import SearchBox from '../base/SearchBox.vue';

defineProps({
  title: {
    type: String,
    default: '筛选内容',
  },
  searchValue: {
    type: String,
    default: '',
  },
  searchPlaceholder: {
    type: String,
    default: '搜索标题或简介...',
  },
  filters: {
    type: Array,
    default: () => [],
  },
  actionLabel: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:searchValue', 'change-filter', 'action']);
</script>

<template>
  <BaseCard class="filter-panel" padding="lg">
    <div class="filter-panel__head">
      <div class="filter-panel__title">
        <h3>{{ title }}</h3>
      </div>

      <div class="filter-panel__tools">
        <BaseButton v-if="actionLabel" variant="primary" size="sm" @click="emit('action')">
          {{ actionLabel }}
        </BaseButton>
        <SearchBox
          :model-value="searchValue"
          :placeholder="searchPlaceholder"
          @update:model-value="emit('update:searchValue', $event)"
        />
      </div>
    </div>

    <div class="filter-panel__body">
      <FilterTagGroup
        v-for="filter in filters"
        :key="filter.key"
        :label="filter.label"
        :label-icon="filter.labelIcon"
        :options="filter.options"
        :model-value="filter.modelValue"
        @update:model-value="emit('change-filter', { key: filter.key, value: $event })"
      />
    </div>
  </BaseCard>
</template>

<style scoped>
.filter-panel {
  display: grid;
  gap: 24px;
}

.filter-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-panel__title h3 {
  margin: 0;
  font-size: 1.5rem;
}

.filter-panel__tools {
  display: flex;
  align-items: center;
  gap: 12px;
  width: min(520px, 100%);
}

.filter-panel__tools :deep(.search-box) {
  flex: 1;
}

.filter-panel__body {
  display: grid;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--bl-border);
}

@media (max-width: 720px) {
  .filter-panel__tools {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>