<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileNavDrawer from './MobileNavDrawer.vue';
import { prefetchRoute } from '../../router.js';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  activePath: {
    type: String,
    default: '/',
  },
  logoSrc: {
    type: String,
    default: 'https://img.lunadeer.cn/i/2024/04/22/6625ce6c8ddc1.png',
  },
  logoAlt: {
    type: String,
    default: '白鹿原 Minecraft 服务器 Logo',
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

const mobileOpen = ref(false);
const openDropdown = ref(null);
let closeTimer = null;

const isActive = (href) => href === props.activePath;

function handleEnter(item) {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  if (item.children) openDropdown.value = item.href;
  prefetchRoute(item.href);
}

function handleLeave() {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    openDropdown.value = null;
  }, 120);
}

function prefetch(href) {
  prefetchRoute(href);
}
</script>

<template>
  <header class="site-navbar">
    <div class="site-navbar__inner bl-shell">
      <button
        type="button"
        class="site-navbar__toggle"
        :aria-label="mobileOpen ? '关闭菜单' : '打开菜单'"
        @click="mobileOpen = !mobileOpen"
      >
        <i :class="mobileOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
      </button>

      <RouterLink class="site-navbar__logo" to="/" @pointerenter="prefetch('/')" @focus="prefetch('/')">
        <img :src="logoSrc" :alt="logoAlt">
        <span class="site-navbar__brand">白鹿原</span>
      </RouterLink>

      <nav class="site-navbar__links" aria-label="主导航">
        <template v-for="item in items" :key="item.href">
          <div
            v-if="item.children"
            class="site-navbar__dropdown"
            @pointerenter="handleEnter(item)"
            @pointerleave="handleLeave"
          >
            <RouterLink
              :to="item.href"
              :class="['site-navbar__link', 'site-navbar__link--has-menu', { 'is-active': isActive(item.href) }]"
              @focus="handleEnter(item)"
            >
              {{ item.label }}
              <i class="fas fa-chevron-down site-navbar__chevron" :class="{ 'is-open': openDropdown === item.href }"></i>
            </RouterLink>
            <transition name="dropdown">
              <div v-show="openDropdown === item.href" class="site-navbar__dropdown-menu">
                <RouterLink
                  v-for="child in item.children"
                  :key="child.href"
                  :to="child.href"
                  class="site-navbar__dropdown-item"
                  @pointerenter="prefetch(child.href)"
                >{{ child.label }}</RouterLink>
              </div>
            </transition>
          </div>
          <a
            v-else-if="item.external"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
            class="site-navbar__link"
          >{{ item.label }}</a>
          <RouterLink
            v-else
            :to="item.href"
            :class="['site-navbar__link', { 'is-active': isActive(item.href) }]"
            @pointerenter="prefetch(item.href)"
            @focus="prefetch(item.href)"
          >{{ item.label }}</RouterLink>
        </template>
      </nav>

      <RouterLink
        class="site-navbar__cta"
        :to="ctaHref"
        @pointerenter="prefetch(ctaHref)"
        @focus="prefetch(ctaHref)"
      >{{ ctaLabel }}</RouterLink>
    </div>
  </header>

  <MobileNavDrawer
    :open="mobileOpen"
    :items="items"
    :cta-label="ctaLabel"
    :cta-href="ctaHref"
    @close="mobileOpen = false"
  />
</template>

<style scoped>
.site-navbar {
  position: fixed;
  inset: 0 0 auto;
  z-index: 1100;
  height: var(--bl-header-height);
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.site-navbar__inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.site-navbar__toggle {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: var(--bl-text);
  padding: 0;
  transition: background 0.2s;
}

.site-navbar__toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.site-navbar__logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.site-navbar__logo img {
  width: auto;
  height: 34px;
  display: block;
}

.site-navbar__brand {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--bl-text);
}

.site-navbar__links {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  margin-right: 16px;
}

.site-navbar__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(29, 29, 31, 0.72);
  text-decoration: none;
  transition: color 0.2s ease, background 0.2s ease;
}

.site-navbar__link:hover {
  color: var(--bl-text);
  background: rgba(0, 0, 0, 0.04);
}

.site-navbar__link.is-active {
  color: var(--bl-accent);
}

.site-navbar__link.is-active::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 4px;
  width: 18px;
  height: 2px;
  border-radius: 999px;
  background: var(--bl-accent);
}

.site-navbar__chevron {
  font-size: 10px;
  opacity: 0.5;
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.site-navbar__chevron.is-open {
  transform: rotate(180deg);
  opacity: 0.9;
}

.site-navbar__dropdown {
  position: relative;
  display: flex;
  align-items: center;
}

.site-navbar__dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 160px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.site-navbar__dropdown-menu::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  height: 8px;
}

.site-navbar__dropdown-item {
  display: block;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: rgba(29, 29, 31, 0.78);
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.site-navbar__dropdown-item:hover {
  background: rgba(0, 113, 227, 0.08);
  color: var(--bl-accent);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.site-navbar__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.1);
  color: var(--bl-accent);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s ease, color 0.2s ease;
}

.site-navbar__cta:hover {
  background: var(--bl-accent);
  color: #fff;
}

@media (max-width: 860px) {
  .site-navbar__toggle {
    display: inline-flex;
    order: 1;
  }

  .site-navbar__links {
    display: none;
  }

  .site-navbar__logo {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    order: 2;
    margin: 0;
  }

  .site-navbar__cta {
    order: 3;
    margin: 0;
    padding: 0 12px;
    font-size: 11px;
  }

  .site-navbar__inner {
    justify-content: space-between;
    padding: 0 15px;
  }
}
</style>
