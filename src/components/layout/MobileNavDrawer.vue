<script setup>
import { RouterLink, useRouter } from 'vue-router';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  items: {
    type: Array,
    default: () => [],
  },
  ctaLabel: {
    type: String,
    default: '加入游戏',
  },
  ctaHref: {
    type: String,
    default: '/join',
  },
});

const emit = defineEmits(['close']);
</script>

<template>
  <div :class="['mobile-menu', { active: open }]">
    <nav class="mobile-menu-links" aria-label="移动端导航">
      <template v-for="item in items" :key="item.href">
        <a
          v-if="item.external"
          :href="item.href"
          target="_blank"
          rel="noopener noreferrer"
          @click="emit('close')"
        >{{ item.label }}</a>
        <RouterLink
          v-else
          :to="item.href"
          @click="emit('close')"
        >{{ item.label }}</RouterLink>
      </template>
      <RouterLink :to="ctaHref" @click="emit('close')">{{ ctaLabel }}</RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.mobile-menu {
  position: fixed;
  top: var(--bl-topbar-offset);
  left: 0;
  width: 100%;
  height: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  transition: height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
  opacity: 0;
  visibility: hidden;
  z-index: 998;
}

.mobile-menu.active {
  height: calc(100vh - var(--bl-topbar-offset));
  opacity: 1;
  visibility: visible;
}

.mobile-menu-links {
  padding: 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 600px;
  margin: 0 auto;
}

.mobile-menu-links a {
  display: block;
  font-size: 24px;
  font-weight: 600;
  text-decoration: none;
  color: var(--bl-text);
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.4s ease;
}

.mobile-menu.active .mobile-menu-links a {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger animation */
.mobile-menu.active .mobile-menu-links a:nth-child(1) { transition-delay: 0.1s; }
.mobile-menu.active .mobile-menu-links a:nth-child(2) { transition-delay: 0.15s; }
.mobile-menu.active .mobile-menu-links a:nth-child(3) { transition-delay: 0.2s; }
.mobile-menu.active .mobile-menu-links a:nth-child(4) { transition-delay: 0.25s; }
.mobile-menu.active .mobile-menu-links a:nth-child(5) { transition-delay: 0.3s; }
.mobile-menu.active .mobile-menu-links a:nth-child(6) { transition-delay: 0.35s; }
.mobile-menu.active .mobile-menu-links a:nth-child(7) { transition-delay: 0.4s; }
</style>