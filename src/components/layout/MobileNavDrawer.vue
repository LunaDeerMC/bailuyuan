<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import ThemeToggle from './ThemeToggle.vue';
import { preloadRouteComponent } from '../../router';

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
const expandedGroup = ref(null);

function toggleGroup(href) {
  expandedGroup.value = expandedGroup.value === href ? null : href;
}

function prefetchHref(href) {
  if (!href || href.startsWith('http')) {
    return;
  }

  preloadRouteComponent(href);
}
</script>

<template>
  <div :class="['mobile-menu', { active: open }]">
    <nav class="mobile-menu-links" aria-label="移动端导航">
      <div class="mobile-menu__theme">
        <ThemeToggle inline />
      </div>

      <template v-for="item in items" :key="item.href">
        <a
          v-if="item.external"
          :href="item.href"
          target="_blank"
          rel="noopener noreferrer"
          @click="emit('close')"
        >{{ item.label }}</a>
        <div v-else-if="item.children" class="mobile-menu-group">
          <button class="mobile-menu-group__toggle" @click="toggleGroup(item.href)">
            {{ item.label }}
            <i :class="expandedGroup === item.href ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="mobile-menu-group__icon"></i>
          </button>
          <div v-show="expandedGroup === item.href" class="mobile-menu-group__items">
            <RouterLink
              v-for="child in item.children"
              :key="child.href"
              :to="child.href"
              @mouseenter="prefetchHref(child.href)"
              @focus="prefetchHref(child.href)"
              @touchstart.passive="prefetchHref(child.href)"
              @click="emit('close')"
            >{{ child.label }}</RouterLink>
          </div>
        </div>
        <RouterLink
          v-else
          :to="item.href"
          @mouseenter="prefetchHref(item.href)"
          @focus="prefetchHref(item.href)"
          @touchstart.passive="prefetchHref(item.href)"
          @click="emit('close')"
        >{{ item.label }}</RouterLink>
      </template>
      <RouterLink
        :to="ctaHref"
        @mouseenter="prefetchHref(ctaHref)"
        @focus="prefetchHref(ctaHref)"
        @touchstart.passive="prefetchHref(ctaHref)"
        @click="emit('close')"
      >{{ ctaLabel }}</RouterLink>
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
  background: var(--bl-dropdown-bg);
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

.mobile-menu__theme {
  padding: 0 0 18px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--bl-border);
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.4s ease;
}

.mobile-menu.active .mobile-menu__theme {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.08s;
}

.mobile-menu-links a {
  display: block;
  font-size: 24px;
  font-weight: 600;
  text-decoration: none;
  color: var(--bl-text);
  padding: 16px 0;
  border-bottom: 1px solid var(--bl-border);
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

.mobile-menu-group {
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.4s ease;
}

.mobile-menu.active .mobile-menu-group {
  opacity: 1;
  transform: translateY(0);
}

.mobile-menu-group__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  font-size: 24px;
  font-weight: 600;
  color: var(--bl-text);
  padding: 16px 0;
  border-bottom: 1px solid var(--bl-border);
  cursor: pointer;
}

.mobile-menu-group__icon {
  font-size: 14px;
  opacity: 0.4;
  transition: transform 0.2s;
}

.mobile-menu-group__items {
  padding-left: 20px;
}

.mobile-menu-group__items a {
  display: block;
  font-size: 20px;
  font-weight: 500;
  text-decoration: none;
  color: var(--bl-text-secondary);
  padding: 12px 0;
  border-bottom: 1px solid var(--bl-border);
}

.mobile-menu-group__items a:hover {
  color: var(--bl-text);
}
</style>