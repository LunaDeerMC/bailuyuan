<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useTheme } from '../../composables/useTheme.js';

const props = defineProps({
  inline: {
    type: Boolean,
    default: false,
  },
  tone: {
    type: String,
    default: 'default',
  },
});

const rootRef = ref(null);
const menuOpen = ref(false);

const { themeMode, themeOptions, setThemeMode } = useTheme();

const currentOption = computed(() =>
  themeOptions.find((option) => option.value === themeMode.value) ?? themeOptions[0]
);

function closeMenu() {
  menuOpen.value = false;
}

function toggleMenu() {
  if (props.inline) {
    return;
  }

  menuOpen.value = !menuOpen.value;
}

function selectThemeMode(nextThemeMode) {
  setThemeMode(nextThemeMode);
  closeMenu();
}

function removeMenuListeners() {
  if (typeof document === 'undefined') {
    return;
  }

  document.removeEventListener('pointerdown', handleDocumentPointerDown);
  document.removeEventListener('keydown', handleDocumentKeydown);
}

function handleDocumentPointerDown(event) {
  if (!menuOpen.value || !rootRef.value?.contains(event.target)) {
    closeMenu();
  }
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape') {
    closeMenu();
  }
}

watch(menuOpen, (open) => {
  if (typeof document === 'undefined') {
    return;
  }

  if (open) {
    document.addEventListener('pointerdown', handleDocumentPointerDown);
    document.addEventListener('keydown', handleDocumentKeydown);
    return;
  }

  removeMenuListeners();
});

onBeforeUnmount(() => {
  removeMenuListeners();
});
</script>

<template>
  <div
    ref="rootRef"
    :class="[
      'theme-toggle',
      {
        'theme-toggle--inline': inline,
        'theme-toggle--footer': tone === 'footer',
        'is-open': menuOpen,
      },
    ]"
  >
    <template v-if="inline">
      <div class="theme-toggle__inline-head">
        <span class="theme-toggle__inline-title">界面配色</span>
        <span class="theme-toggle__inline-value">{{ currentOption.label }}</span>
      </div>
      <div class="theme-toggle__inline-options" role="group" aria-label="界面配色">
        <button
          v-for="option in themeOptions"
          :key="option.value"
          type="button"
          :class="['theme-toggle__option', { 'is-active': option.value === themeMode }]"
          @click="selectThemeMode(option.value)"
        >
          <i :class="option.iconClass" aria-hidden="true"></i>
          <span>{{ option.label }}</span>
        </button>
      </div>
    </template>

    <template v-else>
      <button
        type="button"
        class="theme-toggle__trigger"
        :aria-expanded="menuOpen ? 'true' : 'false'"
        aria-haspopup="menu"
        :title="`界面配色：${currentOption.label}`"
        @click="toggleMenu"
      >
        <i :class="currentOption.iconClass" aria-hidden="true"></i>
        <span class="theme-toggle__trigger-label">{{ currentOption.shortLabel }}</span>
        <i class="fa-solid fa-chevron-down theme-toggle__trigger-caret" aria-hidden="true"></i>
      </button>

      <transition name="theme-menu">
        <div v-if="menuOpen" class="theme-toggle__menu" role="menu" aria-label="界面配色">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            type="button"
            class="theme-toggle__menu-item"
            :class="{ 'is-active': option.value === themeMode }"
            role="menuitemradio"
            :aria-checked="option.value === themeMode ? 'true' : 'false'"
            @click="selectThemeMode(option.value)"
          >
            <span class="theme-toggle__menu-item-copy">
              <i :class="option.iconClass" aria-hidden="true"></i>
              <span>{{ option.label }}</span>
            </span>
            <i v-if="option.value === themeMode" class="fa-solid fa-check theme-toggle__menu-check" aria-hidden="true"></i>
          </button>
        </div>
      </transition>
    </template>
  </div>
</template>

<style scoped>
.theme-toggle {
  position: relative;
}

.theme-toggle__trigger,
.theme-toggle__option,
.theme-toggle__menu-item {
  border: 0;
}

.theme-toggle__trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--bl-surface);
  border: 1px solid var(--bl-border);
  box-shadow: var(--bl-shadow-soft);
  color: var(--bl-text);
  cursor: pointer;
  backdrop-filter: blur(14px);
  transition: var(--bl-transition);
}

.theme-toggle__trigger:hover {
  background: var(--bl-surface-hover);
  border-color: var(--bl-border-strong);
  transform: translateY(-1px);
}

.theme-toggle__trigger:focus-visible,
.theme-toggle__option:focus-visible,
.theme-toggle__menu-item:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px var(--bl-focus-ring);
}

.theme-toggle__trigger-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.theme-toggle__trigger-caret {
  font-size: 0.68rem;
  color: var(--bl-text-tertiary);
  transition: transform 0.2s ease;
}

.theme-toggle.is-open .theme-toggle__trigger-caret {
  transform: rotate(180deg);
}

.theme-toggle__menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 188px;
  padding: 8px;
  border-radius: 18px;
  background: var(--bl-dropdown-bg);
  border: 1px solid var(--bl-border);
  box-shadow: var(--bl-shadow-card);
  backdrop-filter: blur(22px);
}

.theme-toggle__menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 12px;
  background: transparent;
  color: var(--bl-text);
  cursor: pointer;
  transition: var(--bl-transition);
}

.theme-toggle__menu-item:hover,
.theme-toggle__menu-item.is-active {
  background: var(--bl-surface-frost);
}

.theme-toggle__menu-item-copy {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.86rem;
  font-weight: 600;
}

.theme-toggle__menu-check {
  color: var(--bl-accent);
  font-size: 0.78rem;
}

.theme-toggle__inline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.theme-toggle__inline-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--bl-text-secondary);
}

.theme-toggle__inline-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--bl-text);
}

.theme-toggle__inline-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.theme-toggle__option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--bl-control-bg);
  border: 1px solid var(--bl-border);
  color: var(--bl-text-secondary);
  cursor: pointer;
  transition: var(--bl-transition);
}

.theme-toggle__option:hover {
  background: var(--bl-control-hover-bg);
  color: var(--bl-text);
  border-color: var(--bl-border-strong);
}

.theme-toggle__option.is-active {
  background: var(--bl-control-active-bg);
  border-color: var(--bl-control-active-border);
  color: var(--bl-control-active-color);
  box-shadow: var(--bl-control-active-shadow);
}

.theme-toggle--footer {
  max-width: 100%;
}

.theme-toggle--footer .theme-toggle__inline-head {
  display: none;
}

.theme-toggle--footer .theme-toggle__inline-options {
  margin-top: 0;
  display: inline-flex;
  flex-wrap: nowrap;
  gap: 0;
  padding: 3px;
  border-radius: 999px;
  background: var(--bl-surface-subtle);
  border: 1px solid var(--bl-border);
}

.theme-toggle--footer .theme-toggle__option {
  min-height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--bl-text-secondary);
  box-shadow: none;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.theme-toggle--footer .theme-toggle__option i {
  display: none;
}

.theme-toggle--footer .theme-toggle__option:hover {
  background: var(--bl-accent-soft-muted);
  border-color: transparent;
}

.theme-toggle--footer .theme-toggle__option.is-active {
  background: var(--bl-surface-strong);
  color: var(--bl-text);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.theme-menu-enter-active,
.theme-menu-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.theme-menu-enter-from,
.theme-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1180px) {
  .theme-toggle__trigger-label {
    display: none;
  }
}
</style>