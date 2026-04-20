<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileNavDrawer from './MobileNavDrawer.vue';
import { preloadRouteComponent } from '../../router';

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

const isActive = (href) => href === props.activePath;

function prefetchHref(href) {
  if (!href || href.startsWith('http')) {
    return;
  }

  preloadRouteComponent(href);
}

function prefetchItemTree(item) {
  prefetchHref(item?.href);

  if (Array.isArray(item?.children)) {
    item.children.forEach((child) => prefetchHref(child.href));
  }
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

      <RouterLink class="site-navbar__logo" to="/">
        <img :src="logoSrc" :alt="logoAlt">
      </RouterLink>

      <nav class="site-navbar__links" aria-label="主导航">
        <template v-for="item in items" :key="item.href">
          <div
            v-if="item.children"
            class="site-navbar__dropdown"
            @mouseenter="openDropdown = item.href; prefetchItemTree(item)"
            @mouseleave="openDropdown = null"
          >
            <RouterLink
              :to="item.href"
              :class="['site-navbar__link', { 'is-active': isActive(item.href) }]"
              @focus="prefetchHref(item.href)"
              @touchstart.passive="prefetchHref(item.href)"
            >{{ item.label }}</RouterLink>
            <div v-show="openDropdown === item.href" class="site-navbar__dropdown-menu">
              <RouterLink
                v-for="child in item.children"
                :key="child.href"
                :to="child.href"
                class="site-navbar__dropdown-item"
                @mouseenter="prefetchHref(child.href)"
                @focus="prefetchHref(child.href)"
                @touchstart.passive="prefetchHref(child.href)"
              >{{ child.label }}</RouterLink>
            </div>
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
            @mouseenter="prefetchHref(item.href)"
            @focus="prefetchHref(item.href)"
            @touchstart.passive="prefetchHref(item.href)"
          >{{ item.label }}</RouterLink>
        </template>
      </nav>

      <RouterLink
        class="site-navbar__cta"
        :to="ctaHref"
        @mouseenter="prefetchHref(ctaHref)"
        @focus="prefetchHref(ctaHref)"
        @touchstart.passive="prefetchHref(ctaHref)"
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

.site-navbar__logo img {
  width: auto;
  height: 32px;
}

.site-navbar__links {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-left: auto;
  margin-right: 8px;
}

.site-navbar__link {
  position: relative;
  font-size: 0.82rem;
  color: rgba(29, 29, 31, 0.82);
  text-decoration: none;
  transition: color 0.2s ease;
}

.site-navbar__link:hover,
.site-navbar__link.is-active {
  color: var(--bl-text);
}

.site-navbar__link.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -12px;
  height: 2px;
  border-radius: 999px;
  background: var(--bl-text);
}

.site-navbar__dropdown {
  position: relative;
  display: flex;
  align-items: center;
}

.site-navbar__dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 120px;
  padding: 6px 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.site-navbar__dropdown-menu::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 0;
  right: 0;
  height: 12px;
}

.site-navbar__dropdown-item {
  display: block;
  padding: 8px 16px;
  font-size: 0.8rem;
  color: rgba(29, 29, 31, 0.82);
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.site-navbar__dropdown-item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--bl-text);
}

.site-navbar__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--bl-accent);
  color: #fff;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 600;
  transition: var(--bl-transition);
}

.site-navbar__cta:hover {
  background: var(--bl-accent-strong);
  transform: translateY(-1px);
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