<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SiteNavbar from './components/layout/SiteNavbar.vue';
import AnnouncementMarquee from './components/layout/AnnouncementMarquee.vue';
import SiteFooter from './components/layout/SiteFooter.vue';
import { fetchAnnouncementsData } from './composables/useAnnouncementsData.js';
import { getAnnouncementMarqueeHeight, groupAnnouncementMarquees } from './utils/announcements.js';
import { useRouteSeo } from './utils/seo';

useRouteSeo();

const route = useRoute();
const announcements = ref([]);

const navItems = [
  { label: '文档', href: '/doc' },
  { label: '地图', href: '/map' },
  { label: '设施', href: '/facilities' },
  { label: '城镇', href: '/towns' },
  { label: '公告', href: '/announcements' },
  { label: '相册', href: '/photo' },
  { label: '数据', href: '/stats' },
  { label: '备份', href: '/backup' },
  { label: '赞助', href: '/sponsor' },
  { label: '群聊', href: 'https://qm.qq.com/q/9izlHDoef6', external: true },
];

const activePath = computed(() => route.path);
const marqueeGroups = computed(() => groupAnnouncementMarquees(announcements.value));
const hasMarqueeAnnouncements = computed(() => marqueeGroups.value.length > 0);
const appShellStyle = computed(() => ({
  '--bl-banner-height': getAnnouncementMarqueeHeight(marqueeGroups.value.length),
}));

// iframe pages don't show footer; they fill the viewport
const isIframePage = computed(() =>
  ['/doc', '/map', '/photo'].includes(route.path)
);

onMounted(() => {
  fetchAnnouncementsData()
    .then(({ announcements: data }) => {
      announcements.value = data;
    })
    .catch((error) => {
      console.error('Failed to load announcements:', error);
    });
});

</script>

<template>
  <div class="app-shell" :style="appShellStyle">
    <SiteNavbar :items="navItems" :active-path="activePath" />
    <AnnouncementMarquee v-if="hasMarqueeAnnouncements" :groups="marqueeGroups" />
    <router-view />
    <SiteFooter v-if="!isIframePage" />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}
</style>