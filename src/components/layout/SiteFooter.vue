<script setup>
defineProps({
  brand: {
    type: String,
    default: '白鹿原',
  },
});
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="footer-content">
        <div class="footer-logo">{{ brand }}</div>
        <p>&copy; 2026 {{ brand }} Minecraft 服务器.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--bl-bg, #f5f5f7);
  padding: 40px 0;
  border-top: 1px solid #e5e5e5;
  font-size: 12px;
  color: var(--bl-text-secondary);
}

.site-footer__inner {
  max-width: var(--bl-content-width, 1200px);
  margin: 0 auto;
  padding: 0 16px;
}

.footer-content {
  text-align: center;
}

.footer-logo {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--bl-text);
}

.footer-content p {
  margin: 0;
}
</style>