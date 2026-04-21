<script setup>
import BaseModal from '../base/BaseModal.vue';
import ModalSection from './ModalSection.vue';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  player: {
    type: Object,
    required: true,
  },
});

defineEmits(['update:modelValue']);
</script>

<template>
  <BaseModal :model-value="modelValue" width="760px" @update:model-value="$emit('update:modelValue', $event)">
    <template #header>
      <div class="player-detail__identity">
        <img :src="player.avatar" :alt="`${player.name} avatar`">
        <div>
          <h3>{{ player.name }}</h3>
          <p>{{ player.uuid }}</p>
        </div>
      </div>
    </template>

    <div class="player-detail__grid">
      <ModalSection title="核心统计">
        <div class="player-detail__stats">
          <div v-for="stat in player.details" :key="stat.label" class="player-detail__stat-row">
            <span>{{ stat.label }}</span>
            <strong>{{ stat.value }}</strong>
          </div>
        </div>
      </ModalSection>
    </div>
  </BaseModal>
</template>

<style scoped>
.player-detail__identity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.player-detail__identity img {
  width: 84px;
  height: 84px;
  border-radius: 14px;
}

.player-detail__identity h3,
.player-detail__identity p {
  margin: 0;
}

.player-detail__identity p {
  margin-top: 8px;
  color: var(--bl-text-secondary);
  font-family: monospace;
}

.player-detail__stat-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--bl-border);
}

.player-detail__stat-row span {
  color: var(--bl-text-secondary);
}
</style>