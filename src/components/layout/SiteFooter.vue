<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  brand: {
    type: String,
    default: '白鹿原',
  },
});

const siteNav = [
  { label: '首页', href: '/' },
  { label: '文档', href: '/doc' },
  { label: '地图', href: '/map' },
  { label: '设施', href: '/facilities' },
  { label: '城镇', href: '/towns' },
  { label: '公告', href: '/announcements' },
  { label: '相册', href: '/photo' },
  { label: '数据', href: '/stats' },
  { label: '赞助', href: '/sponsor' },
  { label: '加入游戏', href: '/join' },
];

const friendLinks = [
  { label: 'MineBBS', href: 'https://www.minebbs.com/threads/x.25611/' },
  { label: 'MCList', href: 'https://www.mclists.cn/server/7653.html' },
  { label: 'mcgodx', href: 'https://mcgodx.com/servers/212/' },
];
</script>

<template>
  <footer class="site-footer">
    <div class="bl-shell">
      <div class="footer-columns">
       <div class="footer-col">
          <div class="footer-logo">{{ brand }}</div>
          <p>&copy; 2026 {{ brand }} Minecraft 服务器.</p>
          <p class="footer-icp">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">蜀ICP备2025160432号</a>
          </p>
        </div>

        <div class="footer-col">
          <div class="footer-col-title">友情链接</div>
          <ul v-if="friendLinks.length" class="footer-link-list">
            <li v-for="link in friendLinks" :key="link.href">
              <a :href="link.href" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
            </li>
          </ul>
          <p v-else class="footer-empty">暂无</p>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">站内导航</div>
          <ul class="footer-link-list">
            <li v-for="item in siteNav" :key="item.href">
              <RouterLink :to="item.href">{{ item.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--bl-bg, #f5f5f7);
  padding: 40px 0 0px;
  border-top: 1px solid #e5e5e5;
  font-size: 12px;
  color: var(--bl-text-secondary, #6e6e73);
}

.footer-columns {
  display: flex;
  gap: 60px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e5e5e5;
}

.footer-col {
  min-width: 0;
}

.footer-col-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--bl-text, #1d1d1f);
  margin-bottom: 10px;
}

.footer-link-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
}

.footer-link-list a {
  color: var(--bl-text-secondary, #6e6e73);
  text-decoration: none;
  transition: color 0.2s;
  font-size: 12px;
  line-height: 1.8;
}

.footer-link-list a:hover {
  color: var(--bl-text, #1d1d1f);
}

.footer-empty {
  margin: 0;
  color: var(--bl-text-tertiary, #8d8d92);
  font-size: 12px;
}

.footer-bottom {
  text-align: center;
}

.footer-logo {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--bl-text, #1d1d1f);
}

.footer-bottom p {
  margin: 0;
}

.footer-icp {
  margin-top: 6px !important;
}

.footer-icp a {
  color: var(--bl-text-secondary, #6e6e73);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-icp a:hover {
  color: var(--bl-text, #1d1d1f);
}

@media (max-width: 600px) {
  .footer-columns {
    flex-direction: column;
    gap: 24px;
  }
}
</style>