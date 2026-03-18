<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <section class="modal-section">
    <h4 class="modal-section-title">
      <i v-if="icon" :class="icon"></i>
      {{ title }}
    </h4>
    <div class="modal-section__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.modal-section {
  margin-top: 32px;
}

.modal-section-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--bl-text);
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: 4px solid var(--bl-accent, #0071e3);
  padding-left: 12px;
}

.modal-section-title i {
  color: var(--bl-accent, #0071e3);
  width: 20px;
  text-align: center;
}

.modal-section__body {
  margin-top: 0;
}
</style>