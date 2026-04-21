<script setup>
import { computed, ref } from 'vue';
import BaseButton from '../base/BaseButton.vue';
import BaseCard from '../base/BaseCard.vue';
import DeviceCard from './DeviceCard.vue';
import PlaystyleCard from './PlaystyleCard.vue';

const props = defineProps({
  devices: {
    type: Array,
    default: () => [],
  },
  playstyles: {
    type: Array,
    default: () => [],
  },
});

const step = ref(0);
const selectedDevice = ref(props.devices[0]?.id ?? null);
const selectedStyle = ref(props.playstyles[0]?.id ?? null);

const steps = [
  { label: '选择设备', subtitle: '确认你的游玩平台' },
  { label: '安装与登录', subtitle: '跟随图文教程进入服务器' },
  { label: '偏好路线', subtitle: '选择你的玩法方向' },
];

const canNext = computed(() => {
  if (step.value === 0) {
    return Boolean(selectedDevice.value);
  }

  if (step.value === 2) {
    return Boolean(selectedStyle.value);
  }

  return true;
});
</script>

<template>
  <BaseCard class="join-wizard" padding="sm">
    <aside class="join-wizard__sidebar">
      <div class="join-wizard__steps">
        <div
          v-for="(item, index) in steps"
          :key="item.label"
          :class="['join-wizard__step', { 'is-active': index === step, 'is-complete': index < step }]"
        >
          <strong>{{ item.label }}</strong>
          <small>{{ item.subtitle }}</small>
        </div>
      </div>
    </aside>

    <section class="join-wizard__content">
      <div v-if="step === 0" class="join-wizard__panel">
        <header>
          <h3>你准备用什么设备加入？</h3>
          <p>映射自旧站 Join Wizard 的第一步卡片选择模式。</p>
        </header>
        <div class="join-wizard__device-grid">
          <DeviceCard
            v-for="device in devices"
            :key="device.id"
            :device="device"
            :selected="selectedDevice === device.id"
            @click="selectedDevice = device.id"
          />
        </div>
      </div>

      <div v-else-if="step === 1" class="join-wizard__panel join-wizard__panel--guide">
        <header>
          <h3>安装与登录</h3>
          <p>这里保留了旧站教程页的大卡片叙事结构，但已整理为可组合步骤。</p>
        </header>
        <div class="join-wizard__guide-card">
          <span class="bl-demo-chip">基岩 / Java 双端</span>
          <strong>下载版本匹配的客户端后，复制服务器地址并登录白名单账户。</strong>
          <p>页面迁移阶段可继续拆分成安装步骤卡、FAQ 卡和注意事项卡。</p>
        </div>
      </div>

      <div v-else class="join-wizard__panel">
        <header>
          <h3>你更偏向哪种玩法？</h3>
          <p>映射自旧站 Join 页面里的 playstyle-card 选择区。</p>
        </header>
        <div class="join-wizard__style-grid">
          <PlaystyleCard
            v-for="style in playstyles"
            :key="style.id"
            :option="style"
            :selected="selectedStyle === style.id"
            @click="selectedStyle = style.id"
          />
        </div>
      </div>

      <footer class="join-wizard__footer">
        <BaseButton variant="ghost" :disabled="step === 0" @click="step -= 1">
          上一步
        </BaseButton>
        <div class="join-wizard__footer-actions">
          <BaseButton v-if="step < steps.length - 1" :disabled="!canNext" @click="step += 1">
            下一步
          </BaseButton>
          <BaseButton v-else variant="secondary">查看完整加入流程</BaseButton>
        </div>
      </footer>
    </section>
  </BaseCard>
</template>

<style scoped>
.join-wizard {
  padding: 0;
  display: flex;
  overflow: hidden;
  min-height: 620px;
}

.join-wizard__sidebar {
  width: 280px;
  padding: 54px 38px;
  background: var(--bl-surface-muted);
  border-right: 1px solid var(--bl-border);
}

.join-wizard__steps {
  display: flex;
  flex-direction: column;
  gap: 34px;
}

.join-wizard__step {
  position: relative;
  padding-left: 18px;
  display: grid;
  gap: 4px;
  color: var(--bl-text-tertiary);
  opacity: 0.7;
}

.join-wizard__step::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: var(--bl-border-strong);
}

.join-wizard__step.is-active,
.join-wizard__step.is-complete {
  color: var(--bl-text);
  opacity: 1;
}

.join-wizard__step.is-active::before {
  height: 24px;
  border-radius: 999px;
  background: var(--bl-accent);
}

.join-wizard__step.is-complete::before {
  background: var(--bl-green);
}

.join-wizard__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 56px;
}

.join-wizard__panel {
  display: grid;
  gap: 26px;
  flex: 1;
}

.join-wizard__panel header h3,
.join-wizard__panel header p,
.join-wizard__guide-card strong,
.join-wizard__guide-card p {
  margin: 0;
}

.join-wizard__panel header p,
.join-wizard__guide-card p {
  margin-top: 8px;
  color: var(--bl-text-secondary);
}

.join-wizard__device-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.join-wizard__guide-card {
  display: grid;
  gap: 14px;
  padding: 28px;
  border-radius: 24px;
  background: linear-gradient(180deg, var(--bl-surface-hover), var(--bl-surface-subtle));
  box-shadow: var(--bl-shadow-soft);
}

.join-wizard__style-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.join-wizard__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 32px;
  margin-top: auto;
  border-top: 1px solid var(--bl-border);
}

.join-wizard__footer-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 1000px) {
  .join-wizard {
    flex-direction: column;
  }

  .join-wizard__sidebar {
    width: auto;
    padding: 28px 24px 12px;
    border-right: 0;
    border-bottom: 1px solid var(--bl-border);
  }

  .join-wizard__steps {
    gap: 18px;
  }

  .join-wizard__content {
    padding: 28px 24px;
  }

  .join-wizard__device-grid,
  .join-wizard__style-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .join-wizard__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .join-wizard__footer-actions {
    justify-content: stretch;
  }

  .join-wizard__footer-actions :deep(.base-button) {
    width: 100%;
  }
}
</style>