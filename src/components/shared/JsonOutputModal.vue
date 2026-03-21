<script setup>
/**
 * JSON output modal — shows generated JSON and provides copy button.
 */
import { ref } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  jsonText: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);
const copied = ref(false);

function close() {
  emit('update:modelValue', false);
}

function onOverlayClick(e) {
  if (e.target === e.currentTarget) close();
}

function copyJson() {
  navigator.clipboard.writeText(props.jsonText).then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  });
}
</script>

<template>
  <Teleport to="body">
    <Transition name="json-fade">
      <div v-if="modelValue" class="json-overlay" @click="onOverlayClick">
        <div class="json-output-content">
          <button type="button" class="close-json-modal" @click="close">&times;</button>
          <h3><i class="fas fa-code"></i> 生成完成</h3>
          <p class="json-output-hint">请复制以下 JSON 内容，发送给服主以更新到网站上。</p>
          <textarea class="json-output-textarea" readonly :value="jsonText"></textarea>
          <button type="button" class="btn-copy-json" :style="copied ? { background: '#34c759' } : {}" @click="copyJson">
            <template v-if="copied"><i class="fas fa-check"></i> 已复制！</template>
            <template v-else><i class="fas fa-copy"></i> 复制到剪贴板</template>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.json-overlay {
  position: fixed;
  inset: 0;
  z-index: 2100;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.json-output-content {
  background: #fff;
  margin: 60px auto;
  border-radius: 24px;
  max-width: 640px;
  width: 90%;
  padding: 36px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.3);
  position: relative;
}

.close-json-modal {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 24px;
  color: var(--bl-text-secondary);
  cursor: pointer;
  transition: 0.2s;
  z-index: 10;
  background: rgba(255,255,255,0.9);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  line-height: 1;
}

.close-json-modal:hover {
  background: #f0f0f0;
  color: var(--bl-text);
}

.json-output-content h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.json-output-hint {
  font-size: 14px;
  color: var(--bl-text-secondary);
  margin: 0 0 20px;
  line-height: 1.5;
}

.json-output-textarea {
  width: 100%;
  height: 300px;
  padding: 16px;
  border: 1.5px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  background: #f5f5f7;
  color: var(--bl-text);
  resize: vertical;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.json-output-textarea:focus {
  outline: none;
  border-color: var(--bl-accent);
}

.btn-copy-json {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--bl-accent);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  width: 100%;
  justify-content: center;
  font-family: inherit;
}

.btn-copy-json:hover {
  opacity: 0.9;
}

.json-fade-enter-active,
.json-fade-leave-active {
  transition: opacity 0.3s;
}
.json-fade-enter-from,
.json-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .json-output-content {
    margin: 0;
    width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
    display: flex;
    flex-direction: column;
  }

  .json-output-textarea {
    flex: 1;
  }
}
</style>
