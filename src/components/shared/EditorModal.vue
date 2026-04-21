<script setup>
/**
 * Two-panel editor modal: left preview + right form.
 * Used by Facilities, Towns, Announcements editors.
 */
const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '编辑器' },
  icon: { type: String, default: 'fas fa-edit' },
});

const emit = defineEmits(['update:modelValue']);

function close() {
  emit('update:modelValue', false);
}

function onOverlayClick(e) {
  if (e.target === e.currentTarget) close();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="editor-fade">
      <div v-if="modelValue" class="editor-overlay" @click="onOverlayClick">
        <div class="editor-modal-content">
          <button type="button" class="close-editor-modal" @click="close">&times;</button>
          <div class="editor-modal-header">
            <h3><i :class="icon"></i> {{ title }}</h3>
          </div>
          <div class="editor-layout">
            <div class="editor-preview">
              <div class="editor-panel-title"><i class="fas fa-eye"></i> 实时预览</div>
              <div class="editor-preview-content">
                <slot name="preview" />
              </div>
            </div>
            <div class="editor-form">
              <div class="editor-panel-title"><i class="fas fa-edit"></i> 编辑内容</div>
              <div class="editor-form-scroll">
                <slot name="form" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.editor-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: var(--bl-overlay);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-modal-content {
  background: var(--bl-surface-strong);
  margin: 20px auto;
  border-radius: 18px;
  max-width: 1280px;
  width: 95%;
  padding: 0;
  box-shadow: var(--bl-shadow-modal);
  border: 1px solid var(--bl-border);
  position: relative;
  max-height: calc(100vh - 40px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.close-editor-modal {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 24px;
  color: var(--bl-text-secondary);
  cursor: pointer;
  transition: 0.2s;
  z-index: 10;
  background: var(--bl-surface-frost-strong);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  line-height: 1;
}

.close-editor-modal:hover {
  background: var(--bl-surface-muted);
  color: var(--bl-text);
}

.editor-modal-header {
  padding: 20px 28px;
  border-bottom: 1px solid var(--bl-border);
  background: linear-gradient(to bottom, var(--bl-surface-hover), var(--bl-surface-subtle));
  border-radius: 18px 18px 0 0;
  flex-shrink: 0;
}

.editor-modal-header h3 {
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.editor-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.editor-preview {
  flex: 0 0 45%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--bl-border);
  background: var(--bl-surface-muted);
}

.editor-panel-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--bl-text-secondary);
  padding: 14px 24px;
  border-bottom: 1px solid var(--bl-border);
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  flex-shrink: 0;
  background: var(--bl-surface-frost);
}

.editor-preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.editor-form {
  flex: 0 0 55%;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.editor-form-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px 40px;
}

.editor-preview-content::-webkit-scrollbar,
.editor-form-scroll::-webkit-scrollbar {
  width: 5px;
}

.editor-preview-content::-webkit-scrollbar-track,
.editor-form-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.editor-preview-content::-webkit-scrollbar-thumb,
.editor-form-scroll::-webkit-scrollbar-thumb {
  background: var(--bl-scroll-thumb);
  border-radius: 10px;
}

/* Transitions */
.editor-fade-enter-active,
.editor-fade-leave-active {
  transition: opacity 0.3s;
}
.editor-fade-enter-active .editor-modal-content,
.editor-fade-leave-active .editor-modal-content {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.editor-fade-enter-from,
.editor-fade-leave-to {
  opacity: 0;
}
.editor-fade-enter-from .editor-modal-content {
  transform: scale(0.9);
}
.editor-fade-leave-to .editor-modal-content {
  transform: scale(0.9);
}

@media (max-width: 900px) {
  .editor-modal-content {
    margin: 0;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    height: 100%;
    border-radius: 0;
  }

  .editor-layout {
    flex-direction: column;
  }

  .editor-preview {
    flex: none;
    max-height: 35vh;
    border-right: none;
    border-bottom: 1px solid var(--bl-border);
  }

  .editor-form {
    flex: 1;
    min-height: 0;
  }

  .close-editor-modal {
    top: 12px;
    right: 14px;
  }
}

@media (max-width: 768px) {
  .editor-modal-header {
    padding: 16px 20px;
  }

  .editor-form-scroll {
    padding: 20px;
  }
}
</style>
