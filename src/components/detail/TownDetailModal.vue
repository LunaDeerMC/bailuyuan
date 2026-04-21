<script setup>
import BaseBadge from '../base/BaseBadge.vue';
import BaseModal from '../base/BaseModal.vue';
import ModalSection from './ModalSection.vue';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  town: {
    type: Object,
    required: true,
  },
});

defineEmits(['update:modelValue']);
</script>

<template>
  <BaseModal :model-value="modelValue" width="820px" @update:model-value="$emit('update:modelValue', $event)">
    <template #header>
      <div class="town-detail__banner" :style="{ backgroundImage: `url(${town.image})` }"></div>
      <div class="town-detail__header">
        <div>
          <h3>{{ town.title }}</h3>
          <p>{{ town.intro }}</p>
        </div>
        <div class="town-detail__badges">
          <BaseBadge tone="accent">{{ town.scale }}</BaseBadge>
          <BaseBadge tone="success">{{ town.recruitment }}</BaseBadge>
        </div>
      </div>
    </template>

    <div class="town-detail__grid">
      <ModalSection title="位置信息">
        <p>{{ town.location }}</p>
      </ModalSection>
      <ModalSection title="创始人">
        <div class="town-detail__list">
          <span v-for="item in town.founders" :key="item">{{ item }}</span>
        </div>
      </ModalSection>
      <ModalSection title="主要成员">
        <div class="town-detail__list">
          <span v-for="item in town.members" :key="item">{{ item }}</span>
        </div>
      </ModalSection>
      <ModalSection title="城镇介绍">
        <p>{{ town.description }}</p>
      </ModalSection>
    </div>
  </BaseModal>
</template>

<style scoped>
.town-detail__banner {
  height: 180px;
  margin: -28px -30px 18px;
  background:
    linear-gradient(to top, rgba(15, 23, 42, 0.3), transparent 55%),
    center/cover no-repeat;
}

.town-detail__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.town-detail__header h3,
.town-detail__header p {
  margin: 0;
}

.town-detail__header p {
  margin-top: 8px;
  color: var(--bl-text-secondary);
}

.town-detail__badges,
.town-detail__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.town-detail__list span {
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--bl-surface-muted);
  border: 1px solid var(--bl-border);
  font-weight: 600;
}

.town-detail__grid {
  display: grid;
  gap: 16px;
}

@media (max-width: 720px) {
  .town-detail__banner {
    margin-left: -18px;
    margin-right: -18px;
  }

  .town-detail__header {
    flex-direction: column;
  }
}
</style>