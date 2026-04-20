import { routeSeo } from './utils/seo';

const pageLoaders = {
  home: () => import('./pages/HomePage.vue'),
  announcements: () => import('./pages/AnnouncementsPage.vue'),
  facilities: () => import('./pages/FacilitiesPage.vue'),
  towns: () => import('./pages/TownsPage.vue'),
  stats: () => import('./pages/StatsPage.vue'),
  sponsor: () => import('./pages/SponsorPage.vue'),
  join: () => import('./pages/JoinPage.vue'),
  doc: () => import('./pages/DocPage.vue'),
  map: () => import('./pages/MapPage.vue'),
  photo: () => import('./pages/PhotoPage.vue'),
  backup: () => import('./pages/BackupPage.vue'),
};

function createRoute(path, alias, name, seo) {
  return {
    path,
    alias,
    name,
    component: pageLoaders[name],
    meta: { seo },
  };
}

function normalizeRoutePath(path = '') {
  if (typeof path !== 'string' || path.length === 0) {
    return '/';
  }

  const [withoutHash] = path.split('#');
  const [withoutQuery] = withoutHash.split('?');

  if (!withoutQuery || withoutQuery === '/index.html') {
    return '/';
  }

  if (withoutQuery.endsWith('.html')) {
    return withoutQuery.slice(0, -5) || '/';
  }

  return withoutQuery;
}

export const routes = [
  createRoute('/', ['/index.html'], 'home', routeSeo.home),
  createRoute('/announcements', ['/announcements.html'], 'announcements', routeSeo.announcements),
  createRoute('/facilities', ['/facilities.html'], 'facilities', routeSeo.facilities),
  createRoute('/towns', ['/towns.html'], 'towns', routeSeo.towns),
  createRoute('/stats', ['/stats.html'], 'stats', routeSeo.stats),
  createRoute('/sponsor', ['/sponsor.html'], 'sponsor', routeSeo.sponsor),
  createRoute('/join', ['/join.html'], 'join', routeSeo.join),
  createRoute('/doc', ['/doc.html'], 'doc', routeSeo.doc),
  createRoute('/map', ['/map.html'], 'map', routeSeo.map),
  createRoute('/photo', ['/photo.html'], 'photo', routeSeo.photo),
  createRoute('/backup', ['/backup.html'], 'backup', routeSeo.backup),
];

const routeLoadersByPath = new Map(
  routes.flatMap((route) => {
    const aliases = Array.isArray(route.alias)
      ? route.alias
      : route.alias
        ? [route.alias]
        : [];

    return [route.path, ...aliases].map((path) => [normalizeRoutePath(path), pageLoaders[route.name]]);
  })
);

export function preloadRouteComponent(path) {
  const loader = routeLoadersByPath.get(normalizeRoutePath(path));

  if (!loader) {
    return Promise.resolve(null);
  }

  return loader();
}

export function preloadRouteComponents(paths = []) {
  const uniquePaths = [...new Set(paths.map((path) => normalizeRoutePath(path)).filter(Boolean))];
  return Promise.allSettled(uniquePaths.map((path) => preloadRouteComponent(path)));
}
