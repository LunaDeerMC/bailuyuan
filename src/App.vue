<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import SiteNavbar from './components/layout/SiteNavbar.vue';
import AnnouncementMarquee from './components/layout/AnnouncementMarquee.vue';
import SiteFooter from './components/layout/SiteFooter.vue';
import { fetchAnnouncementsData } from './composables/useAnnouncementsData.js';

const route = useRoute();
const importantAnnouncements = ref([]);

const navItems = [
  { label: '文档', href: '/doc' },
  { label: '地图', href: '/map' },
  { label: '设施', href: '/facilities' },
  { label: '城镇', href: '/towns' },
  { label: '公告', href: '/announcements' },
  { label: '相册', href: '/photo' },
  { label: '数据', href: '/stats' },
  { label: '赞助', href: '/sponsor' },
  { label: '群聊', href: 'https://qm.qq.com/q/9izlHDoef6', external: true },
];

const activePath = computed(() => route.path);
const hasImportantAnnouncements = computed(() => importantAnnouncements.value.length > 0);
const appShellStyle = computed(() => ({
  '--bl-banner-height': hasImportantAnnouncements.value ? '34px' : '0px',
}));

// iframe pages don't show footer; they fill the viewport
const isIframePage = computed(() =>
  ['/doc', '/map', '/photo'].includes(route.path)
);

fetchAnnouncementsData()
  .then(({ important }) => {
    importantAnnouncements.value = important;
  })
  .catch((error) => {
    console.error('Failed to load important announcements:', error);
  });

</script>

<template>
  <div class="app-shell" :style="appShellStyle">
    <SiteNavbar :items="navItems" :active-path="activePath" />
    <AnnouncementMarquee v-if="hasImportantAnnouncements" :items="importantAnnouncements" />
    <router-view />
    <SiteFooter v-if="!isIframePage" />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}
</style>