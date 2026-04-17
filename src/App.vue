<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import SiteNavbar from './components/layout/SiteNavbar.vue';
import AnnouncementMarquee from './components/layout/AnnouncementMarquee.vue';
import SiteFooter from './components/layout/SiteFooter.vue';
import CustomScrollbar from './components/layout/CustomScrollbar.vue';
import { fetchAnnouncementsData } from './composables/useAnnouncementsData.js';
import { getAnnouncementMarqueeHeight, groupAnnouncementMarquees } from './utils/announcements.js';
import { useRouteSeo } from './utils/seo';

useRouteSeo();

const route = useRoute();
const announcements = ref([]);
const isMarqueeDismissed = ref(false);

const navItems = [
  { label: '文档', href: '/doc' },
  {
    label: '地图',
    href: '/map',
    children: [
      { label: '旧出生点', href: '/map#world:2710:0:-1575:2531:0:0:0:1:flat' },
      { label: '新出生点', href: '/map#world:500000:0:500000:2531:0:0:0:1:flat' },
    ],
  },
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
const isMarqueeVisible = computed(() => hasMarqueeAnnouncements.value && !isMarqueeDismissed.value);
const bannerHeight = computed(() =>
  getAnnouncementMarqueeHeight(isMarqueeVisible.value ? marqueeGroups.value.length : 0)
);

// iframe pages don't show footer; they fill the viewport
const isIframePage = computed(() =>
  ['/doc', '/map', '/photo'].includes(route.path)
);

function dismissMarquee() {
  isMarqueeDismissed.value = true;
}

function applyBannerHeight(value) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--bl-banner-height', value);
  }
}

watch(bannerHeight, applyBannerHeight, { immediate: true });

watch(
  () => route.path,
  () => {
    isMarqueeDismissed.value = false;
  }
);

onMounted(() => {
  applyBannerHeight(bannerHeight.value);
  fetchAnnouncementsData()
    .then(({ announcements: data }) => {
      announcements.value = data;
    })
    .catch((error) => {
      console.error('Failed to load announcements:', error);
    });
});

onUnmounted(() => {
  applyBannerHeight('0px');
});

</script>

<template>
  <div class="app-shell">
    <SiteNavbar :items="navItems" :active-path="activePath" />
    <AnnouncementMarquee v-if="isMarqueeVisible" :groups="marqueeGroups" @close="dismissMarquee" />
    <router-view />
    <SiteFooter v-if="!isIframePage" />
    <CustomScrollbar />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}
</style>