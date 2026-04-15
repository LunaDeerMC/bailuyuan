<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ANNOUNCEMENT_CATEGORY_META,
  ANNOUNCEMENT_OPEN_EVENT,
  ANNOUNCEMENTS_ROUTE_PATH,
} from '../../utils/announcements.js';

const props = defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close']);

const route = useRoute();
const router = useRouter();
const MARQUEE_REPEAT_COUNT = 12;

function getEstimatedDuration(items) {
  const totalCharacters = items.reduce((sum, item) => sum + item.title.length + 14, 0);
  return `${Math.max(totalCharacters * 0.5, 24)}s`;
}

function getTrackStyle(group) {
  return {
    '--bl-marquee-duration': group.duration,
    '--bl-marquee-repeat-count': String(MARQUEE_REPEAT_COUNT),
  };
}

const marqueeGroups = computed(() =>
  props.groups
    .filter((group) => Array.isArray(group?.items) && group.items.length > 0)
    .map((group) => {
      const meta = ANNOUNCEMENT_CATEGORY_META[group.category] || ANNOUNCEMENT_CATEGORY_META.other;
      const items = group.items
        .filter((item) => typeof item?.title === 'string' && item.title.trim())
        .map((item) => ({
          ...item,
          title: item.title.trim(),
        }));

      return {
        ...group,
        items,
        label: `${meta.label}公告`,
        iconClass: meta.iconClass,
        duration: getEstimatedDuration(items),
      };
    })
    .filter((group) => group.items.length > 0)
);

function openAnnouncement(anchorId) {
  if (!anchorId) {
    return;
  }

  const hash = `#${anchorId}`;

  if (route.path === ANNOUNCEMENTS_ROUTE_PATH && route.hash === hash) {
    window.dispatchEvent(new CustomEvent(ANNOUNCEMENT_OPEN_EVENT, { detail: anchorId }));
    return;
  }

  router.push({ path: ANNOUNCEMENTS_ROUTE_PATH, hash }).catch(() => {});
}
</script>

<template>
  <div v-if="marqueeGroups.length" class="announcement-marquees" aria-label="公告滚动横幅">
    <section
      v-for="(group, groupIndex) in marqueeGroups"
      :key="group.category"
      :class="['announcement-marquee', `announcement-marquee--${group.category}`]"
      :aria-label="`${group.label}滚动横幅`"
    >
      <div class="announcement-marquee__inner bl-shell">
        <div class="announcement-marquee__label">
          <i :class="group.iconClass" aria-hidden="true"></i>
          <span>{{ group.label }}</span>
        </div>

        <div class="announcement-marquee__viewport">
          <div class="announcement-marquee__track" :style="getTrackStyle(group)">
            <div
              v-for="duplicateIndex in MARQUEE_REPEAT_COUNT"
              :key="`${group.category}-${duplicateIndex}`"
              :class="['announcement-marquee__group', { 'is-duplicate': duplicateIndex > 1 }]"
              :aria-hidden="duplicateIndex > 1 ? 'true' : undefined"
            >
              <button
                v-for="(item, index) in group.items"
                :key="`${group.category}-${duplicateIndex}-${item.anchorId}-${index}`"
                type="button"
                class="announcement-marquee__item"
                :tabindex="duplicateIndex > 1 ? -1 : null"
                @click="openAnnouncement(item.anchorId)"
              >
                <span class="announcement-marquee__title">{{ item.title }}</span>
                <span class="announcement-marquee__hint">点击查看详情</span>
              </button>
            </div>
          </div>
        </div>

        <button
          v-if="groupIndex === 0"
          type="button"
          class="announcement-marquee__dismiss"
          aria-label="关闭公告横幅"
          @click="emit('close')"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.announcement-marquees {
  position: fixed;
  top: var(--bl-header-height);
  left: 0;
  right: 0;
  z-index: 1090;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.announcement-marquee {
  --row-bg: linear-gradient(90deg, #f3f4f6 0%, #ffffff 50%, #f3f4f6 100%);
  --row-text: #374151;
  --row-border: rgba(55, 65, 81, 0.14);
  --row-shadow: rgba(31, 41, 55, 0.12);
  --row-divider: rgba(55, 65, 81, 0.16);
  --row-pill-bg: rgba(255, 255, 255, 0.72);
  --row-pill-border: rgba(55, 65, 81, 0.12);
  --row-pill-text: var(--row-text);
  height: 38px;
  color: var(--row-text);
  background: var(--row-bg);
  border-bottom: 1px solid var(--row-border);
  box-shadow: none;
}

.announcement-marquee--activity {
  --row-bg: linear-gradient(90deg, #e8fceb 0%, #f8fff9 50%, #e8fceb 100%);
  --row-text: #166534;
  --row-border: rgba(21, 128, 61, 0.18);
  --row-shadow: rgba(52, 199, 89, 0.16);
  --row-divider: rgba(21, 128, 61, 0.18);
  --row-pill-bg: rgba(255, 255, 255, 0.78);
  --row-pill-border: rgba(21, 128, 61, 0.14);
  --row-pill-text: #15803d;
}

.announcement-marquee--maintenance {
  --row-bg: linear-gradient(90deg, #fff8d6 0%, #fffdf2 50%, #fff8d6 100%);
  --row-text: #92400e;
  --row-border: rgba(180, 83, 9, 0.18);
  --row-shadow: rgba(245, 158, 11, 0.16);
  --row-divider: rgba(180, 83, 9, 0.18);
  --row-pill-bg: rgba(255, 255, 255, 0.84);
  --row-pill-border: rgba(180, 83, 9, 0.14);
  --row-pill-text: #b45309;
}

.announcement-marquee--other {
  --row-bg: linear-gradient(90deg, #f3e8ff 0%, #fbf7ff 50%, #f3e8ff 100%);
  --row-text: #6d28d9;
  --row-border: rgba(124, 58, 237, 0.18);
  --row-shadow: rgba(139, 92, 246, 0.16);
  --row-divider: rgba(124, 58, 237, 0.18);
  --row-pill-bg: rgba(255, 255, 255, 0.82);
  --row-pill-border: rgba(124, 58, 237, 0.14);
  --row-pill-text: #7c3aed;
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
  border-right: 1px solid var(--row-divider);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.announcement-marquee__viewport {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
}

.announcement-marquee__dismiss {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  padding: 0;
  border: none;
  background: transparent;
  color: rgba(55, 65, 81, 0.72);
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
}

.announcement-marquee__dismiss:hover,
.announcement-marquee__dismiss:focus-visible {
  color: inherit;
  transform: scale(1.06);
}

.announcement-marquee__dismiss:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.45);
  outline-offset: 2px;
}

.announcement-marquee__track {
  display: flex;
  width: max-content;
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
  gap: 10px;
  flex-shrink: 0;
  padding: 0;
  background: transparent;
  border: none;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

.announcement-marquee__title {
  color: inherit;
}

.announcement-marquee__hint {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--row-pill-border);
  background: var(--row-pill-bg);
  color: var(--row-pill-text);
  font-size: 12px;
  font-weight: 700;
}

.announcement-marquee__item::after {
  content: '';
  width: 18px;
  height: 1px;
  margin: 0 18px;
  background: var(--row-divider);
}

.announcement-marquee__item:hover .announcement-marquee__hint,
.announcement-marquee__item:focus-visible .announcement-marquee__hint {
  background: rgba(255, 255, 255, 0.98);
}

.announcement-marquee__item:focus-visible {
  outline: none;
}

.announcement-marquee:hover .announcement-marquee__track {
  animation-play-state: paused;
}

@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(calc(-100% / var(--bl-marquee-repeat-count)));
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

  .announcement-marquee__hint {
    min-height: 20px;
    padding: 0 8px;
    font-size: 11px;
  }

  .announcement-marquee__item::after {
    width: 14px;
    margin: 0 14px;
  }
}
</style>