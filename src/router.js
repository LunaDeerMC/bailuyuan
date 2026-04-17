import { routeSeo } from './utils/seo';

const pages = [
  { path: '/', name: 'home', loader: () => import('./pages/HomePage.vue'), seo: routeSeo.home },
  { path: '/announcements', name: 'announcements', loader: () => import('./pages/AnnouncementsPage.vue'), seo: routeSeo.announcements },
  { path: '/facilities', name: 'facilities', loader: () => import('./pages/FacilitiesPage.vue'), seo: routeSeo.facilities },
  { path: '/towns', name: 'towns', loader: () => import('./pages/TownsPage.vue'), seo: routeSeo.towns },
  { path: '/stats', name: 'stats', loader: () => import('./pages/StatsPage.vue'), seo: routeSeo.stats },
  { path: '/sponsor', name: 'sponsor', loader: () => import('./pages/SponsorPage.vue'), seo: routeSeo.sponsor },
  { path: '/join', name: 'join', loader: () => import('./pages/JoinPage.vue'), seo: routeSeo.join },
  { path: '/doc', name: 'doc', loader: () => import('./pages/DocPage.vue'), seo: routeSeo.doc },
  { path: '/map', name: 'map', loader: () => import('./pages/MapPage.vue'), seo: routeSeo.map },
  { path: '/photo', name: 'photo', loader: () => import('./pages/PhotoPage.vue'), seo: routeSeo.photo },
  { path: '/backup', name: 'backup', loader: () => import('./pages/BackupPage.vue'), seo: routeSeo.backup },
];

export const routes = pages.map((p) => ({
  path: p.path,
  alias: [p.path === '/' ? '/index.html' : `${p.path}.html`],
  name: p.name,
  component: p.loader,
  meta: { seo: p.seo },
}));

const prefetched = new Set();

export function prefetchRoute(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return;
  if (/^https?:/i.test(rawPath)) return;
  const path = rawPath.split(/[?#]/)[0].replace(/\.html$/, '') || '/';
  if (prefetched.has(path)) return;
  const page = pages.find((p) => p.path === path);
  if (!page) return;
  prefetched.add(path);
  page.loader();
}
