<script setup>
import BaseBadge from '../base/BaseBadge.vue';
import BaseModal from '../base/BaseModal.vue';
import ModalSection from './ModalSection.vue';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  facility: {
    type: Object,
    required: true,
  },
});

defineEmits(['update:modelValue']);
</script>

<template>
  <BaseModal :model-value="modelValue" width="780px" @update:model-value="$emit('update:modelValue', $event)">
    <template #header>
      <div class="detail-header">
        <div>
          <h3>{{ facility.title }}</h3>
          <p>{{ facility.intro }}</p>
        </div>
        <div class="detail-header__badges">
          <BaseBadge tone="accent">{{ facility.type }}</BaseBadge>
          <BaseBadge tone="success">{{ facility.dimension }}</BaseBadge>
        </div>
      </div>
    </template>

    <div class="detail-grid">
      <ModalSection title="位置信息">
        <p>{{ facility.location }}</p>
      </ModalSection>
      <ModalSection title="贡献 / 维护人员">
        <div class="detail-pills">
          <span v-for="person in facility.contributors" :key="person">{{ person }}</span>
        </div>
      </ModalSection>
      <ModalSection title="使用说明">
        <p>{{ facility.instructions }}</p>
      </ModalSection>
      <ModalSection title="注意事项">
        <p>{{ facility.notes }}</p>
      </ModalSection>
    </div>
  </BaseModal>
</template>

<style scoped>
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.detail-header h3,
.detail-header p {
  margin: 0;
}

.detail-header p {
  margin-top: 8px;
  color: var(--bl-text-secondary);
}

.detail-header__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-grid {
  display: grid;
  gap: 16px;
}

.detail-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-pills span {
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--bl-surface-muted);
  border: 1px solid var(--bl-border);
  font-weight: 600;
}

@media (max-width: 720px) {
  .detail-header {
    flex-direction: column;
  }
}
</style>