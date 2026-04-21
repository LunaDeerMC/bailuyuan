<script setup>
import { RouterLink } from 'vue-router';
import ThemeToggle from './ThemeToggle.vue';

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
  { label: '小红书', href: 'https://xhslink.com/m/7pG6axuqPT0' },
  { label: 'BiliBili', href: 'https://space.bilibili.com/691690967' },
];

const anoutThisSite = [
  { label: 'GitHub', href: 'https://github.com/LunaDeerMC/bailuyuan' },
  { label: 'SiteMap', href: '/sitemap.xml' },
  { label: 'LunaDeerMC', href: 'https://mc.lunadeer.cn/' },
];
</script>

<template>
  <footer class="site-footer">
    <div class="bl-shell site-footer__shell">
      <div class="footer-columns">
        <div class="footer-col footer-col--brand">
          <div class="footer-logo">{{ brand }}</div>
          <p class="footer-brand-copy">白鹿原 Minecraft 服务器站点导览与资料索引。</p>
          <p class="footer-icp">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">蜀ICP备2025160432号</a>
          </p>
          <p class="footer-copyright">&copy; 2026 {{ brand }} Minecraft 服务器</p>
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
        <div class="footer-col footer-col--site">
          <div class="footer-col-title">本站信息</div>
          <ul class="footer-link-list">
            <li v-for="item in anoutThisSite" :key="item.href">
              <a :href="item.href" target="_blank" rel="noopener noreferrer">{{ item.label }}</a>
            </li>
          </ul>

          <div class="footer-theme-inline">
            <div class="footer-subtitle">界面配色</div>
            <ThemeToggle inline tone="footer" />
          </div>
        </div>
      </div>

    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--bl-bg, #f5f5f7);
  padding: 40px 0 24px;
  border-top: 1px solid var(--bl-border);
  font-size: 12px;
  color: var(--bl-text-secondary, #6e6e73);
}

.site-footer__shell {
  display: block;
}

.footer-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) repeat(3, minmax(0, 1fr));
  gap: 28px 48px;
}

.footer-col {
  min-width: 0;
}

.footer-col--brand,
.footer-col--site {
  display: flex;
  flex-direction: column;
}

.footer-col--brand {
  max-width: 320px;
}

.footer-col-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--bl-text, #1d1d1f);
  margin-bottom: 10px;
}

.footer-subtitle {
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--bl-text-secondary);
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

.footer-logo {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--bl-text, #1d1d1f);
}

.footer-brand-copy {
  margin: 0;
  line-height: 1.8;
}

.footer-icp {
  margin-top: 6px !important;
  margin-bottom: 0;
}

.footer-icp a {
  color: var(--bl-text-secondary, #6e6e73);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-icp a:hover {
  color: var(--bl-text, #1d1d1f);
}

.footer-copyright {
  margin: auto 0 0;
  padding-top: 16px;
  color: var(--bl-text-secondary);
  font-size: 0.86rem;
  line-height: 1.7;
}

.footer-theme-inline {
  margin-top: auto;
  padding-top: 16px;
}

@media (max-width: 900px) {
  .footer-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .footer-columns {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .site-footer {
    padding-bottom: 20px;
  }
}
</style>