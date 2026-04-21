<script setup>
import { onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '760px',
  },
});

const emit = defineEmits(['update:modelValue', 'close']);

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.modelValue) {
    close();
  }
};

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('bl-modal-open', open);
    if (open) {
      window.addEventListener('keydown', handleKeydown);
    } else {
      window.removeEventListener('keydown', handleKeydown);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.body.classList.remove('bl-modal-open');
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="base-modal" @click="close">
        <div class="base-modal__dialog" :style="{ maxWidth: width }" @click.stop>
          <button type="button" class="base-modal__close" aria-label="关闭弹窗" @click="close">×</button>
          <header v-if="title || subtitle || $slots.header" class="base-modal__header">
            <slot name="header">
              <h3 v-if="title">{{ title }}</h3>
              <p v-if="subtitle">{{ subtitle }}</p>
            </slot>
          </header>
          <section class="base-modal__body">
            <slot />
          </section>
          <footer v-if="$slots.footer" class="base-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.base-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  padding: 40px 16px;
  display: grid;
  place-items: center;
  background: var(--bl-overlay);
  backdrop-filter: blur(10px);
}

.base-modal__dialog {
  position: relative;
  width: min(100%, var(--bl-content-width));
  max-height: min(90vh, 980px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: var(--bl-radius-xl);
  background: linear-gradient(180deg, var(--bl-surface-hover), var(--bl-surface-strong));
  border: 1px solid var(--bl-border);
  box-shadow: var(--bl-shadow-modal);
}

.base-modal__dialog::-webkit-scrollbar {
  width: 6px;
}

.base-modal__dialog::-webkit-scrollbar-track {
  background: transparent;
  margin: 10px 0;
}

.base-modal__dialog::-webkit-scrollbar-thumb {
  background: var(--bl-scroll-thumb);
  border-radius: 10px;
}

.base-modal__dialog::-webkit-scrollbar-thumb:hover {
  background: var(--bl-scroll-thumb-hover);
}

.base-modal__close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bl-surface-frost-strong);
  color: var(--bl-text-secondary);
  font-size: 1.3rem;
  cursor: pointer;
  transition: 0.2s;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.base-modal__close:hover {
  background: var(--bl-surface-muted);
  color: var(--bl-text);
}

.base-modal__header {
  padding: 28px 30px 0;
}

.base-modal__header h3,
.base-modal__header p {
  margin: 0;
}

.base-modal__header h3 {
  font-size: 1.55rem;
  font-weight: 700;
}

.base-modal__header p {
  margin-top: 8px;
  color: var(--bl-text-secondary);
}

.base-modal__body {
  padding: 24px 30px 30px;
}

.base-modal__footer {
  padding: 0 30px 30px;
}

@media (max-width: 720px) {
  .base-modal {
    padding: 18px 10px;
  }

  .base-modal__header,
  .base-modal__body,
  .base-modal__footer {
    padding-left: 18px;
    padding-right: 18px;
  }
}
</style>