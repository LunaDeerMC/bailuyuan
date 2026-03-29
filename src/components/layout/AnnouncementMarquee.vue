<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const messages = computed(() =>
  props.items
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
);

const animationDuration = computed(() => {
  const totalCharacters = messages.value.reduce((sum, item) => sum + item.length, 0);
  return `${Math.max(totalCharacters * 0.45, 22)}s`;
});
</script>

<template>
  <section v-if="messages.length" class="announcement-marquee" aria-label="重要通知滚动横幅">
    <div class="announcement-marquee__inner bl-shell">
      <div class="announcement-marquee__label">
        <i class="fas fa-bullhorn" aria-hidden="true"></i>
        <span>重要通知</span>
      </div>

      <div class="announcement-marquee__viewport">
        <div class="announcement-marquee__track" :style="{ '--bl-marquee-duration': animationDuration }">
          <div class="announcement-marquee__group">
            <span v-for="(item, index) in messages" :key="`primary-${index}`" class="announcement-marquee__item">
              {{ item }}
            </span>
          </div>
          <div class="announcement-marquee__group" aria-hidden="true">
            <span v-for="(item, index) in messages" :key="`secondary-${index}`" class="announcement-marquee__item">
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.announcement-marquee {
  position: fixed;
  top: var(--bl-header-height);
  left: 0;
  right: 0;
  z-index: 1090;
  height: var(--bl-banner-height);
  color: #fff;
  background: linear-gradient(90deg, #ff3c00 0%, #ff1f1f 45%, #ff3c00 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 20px rgba(255, 106, 0, 0.22);
}

.announcement-marquee__inner {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  height: 100%;
}

.announcement-marquee__label {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-right: 14px;
  border-right: 1px solid rgba(255, 255, 255, 0.22);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-shadow: 0 1px 8px rgba(128, 31, 0, 0.35);
}

.announcement-marquee__viewport {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
}

.announcement-marquee__track {
  display: flex;
  width: max-content;
  min-width: 100%;
  animation: marquee-scroll var(--bl-marquee-duration) linear infinite;
  will-change: transform;
}

.announcement-marquee__group {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.announcement-marquee__item {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  text-shadow: 0 1px 8px rgba(128, 31, 0, 0.32);
}

.announcement-marquee__item::after {
  content: '';
  width: 18px;
  height: 1px;
  margin: 0 18px;
  background: rgba(255, 255, 255, 0.48);
}

.announcement-marquee:hover .announcement-marquee__track {
  animation-play-state: paused;
}

@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 860px) {
  .announcement-marquee__inner {
    gap: 10px;
    padding: 0 14px;
  }

  .announcement-marquee__label {
    padding-right: 10px;
  }

  .announcement-marquee__label span {
    display: none;
  }

  .announcement-marquee__item {
    font-size: 12px;
  }

  .announcement-marquee__item::after {
    width: 14px;
    margin: 0 14px;
  }
}
</style>