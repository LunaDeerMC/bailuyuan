<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: '白鹿原组件库',
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  backgroundImage: {
    type: String,
    default: 'https://img.lunadeer.cn/i/2025/11/26/69267755e14e3.png',
  },
  compact: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <section
    :class="['page-hero', { 'page-hero--compact': compact }]"
    :style="{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.34)), url(${backgroundImage})` }"
  >
    <div class="page-hero__inner bl-shell">
      <div class="page-hero__copy">
        <p class="page-hero__eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="page-hero__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.default" class="page-hero__actions">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-hero {
  min-height: 42vh;
  padding-top: calc(var(--bl-topbar-offset) + 40px);
  padding-bottom: 56px;
  display: flex;
  align-items: flex-end;
  background-size: cover;
  background-position: center;
  color: #fff;
}

.page-hero--compact {
  min-height: 34vh;
}

.page-hero__inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
}

.page-hero__copy {
  max-width: 760px;
}

.page-hero__eyebrow {
  margin: 0 0 12px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.78);
}

.page-hero h1 {
  margin: 0;
  font-size: clamp(2.2rem, 5.2vw, 4.4rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
  text-shadow: 0 8px 30px rgba(0, 0, 0, 0.24);
}

.page-hero__subtitle {
  max-width: 720px;
  margin: 14px 0 0;
  font-size: clamp(1rem, 1.8vw, 1.4rem);
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
}

.page-hero__actions {
  display: flex;
  align-items: flex-end;
}

@media (max-width: 840px) {
  .page-hero {
    min-height: 46vh;
    padding-bottom: 32px;
  }

  .page-hero__inner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>