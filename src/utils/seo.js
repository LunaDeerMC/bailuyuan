const SITE_URL = 'https://bailuyuan.lunadeer.cn';
const SITE_NAME = '白鹿原 Minecraft 服务器';
const SITE_DESCRIPTION = '白鹿原是一个永不换档的纯净原版生存 Minecraft 服务器，支持 Java 版与基岩版互通。提供免费圈地保护、自研管理插件，紧跟最新游戏版本更新。';
const DEFAULT_OG_IMAGE = 'https://img.lunadeer.cn/i/2024/04/22/6625ce6c8ddc1.png';
const HOME_OG_IMAGE = 'https://img.lunadeer.cn/i/2025/11/26/69267755e14e3.png';
const ROBOTS_CONTENT = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

const siteNavigation = [
  { name: '首页', path: '/' },
  { name: '活动公告', path: '/announcements' },
  { name: '共享资源', path: '/facilities' },
  { name: '城镇介绍', path: '/towns' },
  { name: '玩家数据统计', path: '/stats' },
  { name: '赞助榜', path: '/sponsor' },
  { name: '加入游戏指引', path: '/join' },
  { name: '文档', path: '/doc' },
  { name: '在线地图', path: '/map' },
  { name: '服务器相册', path: '/photo' },
];

function toAbsoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}

function createBreadcrumbList(name, path) {
  if (path === '/') {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name,
        item: toAbsoluteUrl(path),
      },
    ],
  };
}

function createWebPageSchema(type, name, description, path) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    url: toAbsoluteUrl(path),
    inLanguage: 'zh-CN',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    primaryImageOfPage: DEFAULT_OG_IMAGE,
  };
}

function createCollectionPageSchema(name, description, path) {
  return createWebPageSchema('CollectionPage', name, description, path);
}

function createFaqSchema(faqItems) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

function createBaseStructuredData() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: DEFAULT_OG_IMAGE,
      image: DEFAULT_OG_IMAGE,
      description: SITE_DESCRIPTION,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'zh-CN',
      description: SITE_DESCRIPTION,
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/stats?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    ...siteNavigation.map((item) => ({
      '@context': 'https://schema.org',
      '@type': 'SiteNavigationElement',
      name: item.name,
      url: toAbsoluteUrl(item.path),
    })),
  ];
}

export const routeSeo = {
  home: {
    path: '/',
    title: '白鹿原 Minecraft 服务器 - 永不换档的纯净原版生存Minecraft服务器',
    description: '白鹿原是一个永不换档的纯净原版生存Minecraft我的世界服务器，支持Java版与基岩版互通。提供免费圈地保护、自研管理插件，紧跟最新游戏版本更新。物理工作站保障7×24小时稳定运行，实时查看服务器在线状态与众筹进展。立即加入白鹿原，开启纯净原版生存冒险之旅！服务器地址：mcpure.lunadeer.cn',
    keywords: '白鹿原Minecraft,白鹿原我的世界,白鹿原mc,Minecraft服务器,我的世界,我的世界服务器,纯净服务器,原版服务器,纯净生存,基岩互通,白鹿原,MC服务器,永不换档,免费圈地,Minecraft中国',
    ogImage: HOME_OG_IMAGE,
    ogImageAlt: '白鹿原 Minecraft 服务器主页视觉图',
    twitterCard: 'summary_large_image',
    type: 'website',
    structuredData: () => [
      createWebPageSchema('WebPage', SITE_NAME, '白鹿原 Minecraft 服务器首页，展示服务器特色、实时状态、赞助名单与众筹进度。', '/'),
      {
        '@context': 'https://schema.org',
        '@type': 'GameServer',
        name: SITE_NAME,
        description: '永不换档的纯净原版生存 Minecraft 服务器，支持 Java 版和基岩版互通。',
        url: SITE_URL,
        logo: DEFAULT_OG_IMAGE,
        image: HOME_OG_IMAGE,
        serverStatus: 'Online',
        game: {
          '@type': 'VideoGame',
          name: 'Minecraft',
          gamePlatform: ['Java Edition', 'Bedrock Edition'],
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY',
          availability: 'https://schema.org/InStock',
        },
      },
      createFaqSchema([
        { q: '白鹿原Minecraft服务器是什么？', a: '白鹿原是一个永不换档的纯净原版生存 Minecraft 服务器，自 2021 年 9 月 14 日开服至今从未重置存档。支持 Java 版与基岩版互通，提供免费圈地保护和自研管理插件，紧跟最新游戏版本更新。物理工作站保障 7×24 小时稳定运行，所有玩家均可免费加入。服务器地址为 mcpure.lunadeer.cn。' },
        { q: '白鹿原服务器地址是多少？', a: '白鹿原 Minecraft 服务器地址为 mcpure.lunadeer.cn。Java 版使用默认端口 25565，基岩版使用端口 19132。官方网站为 https://bailuyuan.lunadeer.cn。' },
        { q: '白鹿原服务器支持哪些版本和平台？', a: '白鹿原同时支持 Minecraft Java Edition 和 Bedrock Edition（基岩版），包括 Windows、macOS、Linux 电脑端，以及 iOS、Android 手机和平板设备。Java 版和基岩版玩家可在同一服务器中共同游玩，实现真正的跨平台互通。' },
        { q: '白鹿原服务器是免费的吗？', a: '是的，白鹿原服务器完全免费加入，没有任何付费门槛。服务器运营费用由玩家自愿众筹支持，所有游戏功能和公共设施对全体玩家免费开放。' },
      ]),
    ],
  },
  announcements: {
    path: '/announcements',
    title: '活动公告 - 白鹿原 Minecraft 服务器',
    description: '白鹿原Minecraft服务器活动公告，了解最新的服务器活动、维护通知和重要公告信息。',
    keywords: 'Minecraft公告,MC活动,白鹿原公告,服务器活动,维护通知',
    ogImageAlt: '白鹿原 Minecraft 服务器活动公告页面',
    type: 'website',
    structuredData: () => {
      const name = '活动公告';
      const description = '白鹿原Minecraft服务器活动公告，了解最新的服务器活动、维护通知和重要公告信息。';
      return [
        createCollectionPageSchema(name, description, '/announcements'),
        createBreadcrumbList(name, '/announcements'),
      ].filter(Boolean);
    },
  },
  facilities: {
    path: '/facilities',
    title: '共享资源 - 白鹿原 Minecraft 服务器',
    description: '白鹿原Minecraft服务器全服共享公共设施资源一览，包含各类自动化农场、刷怪塔、交易所等实用设施。支持按类型筛选和关键词搜索，查看设施坐标位置、详细使用说明与视频教程。共同建设共同分享，让纯净原版生存更加便捷轻松。',
    keywords: 'Minecraft共享资源,MC公共设施,白鹿原设施,Minecraft农场,服务器公共资源',
    ogImageAlt: '白鹿原 Minecraft 服务器共享资源页面',
    type: 'website',
    structuredData: () => {
      const name = '全服共享资源';
      const description = '白鹿原Minecraft服务器全服共享资源一览，包含各类自动化农场、刷怪塔、交易所等公共设施。';
      return [
        createCollectionPageSchema(name, description, '/facilities'),
        createBreadcrumbList(name, '/facilities'),
        createFaqSchema([
          { q: '白鹿原服务器有哪些公共设施？', a: '白鹿原服务器拥有丰富的全服共享公共设施，由玩家共同建设、共同分享。包含各类自动化农场（刷冰机、铁轨机、甘蔗机等）、刷怪塔、交易所、公共仓库等实用设施。每个设施都提供详细的坐标位置和使用说明，所有玩家均可免费使用。' },
          { q: '如何查看白鹿原服务器设施的坐标和使用方法？', a: '访问白鹿原官网的「共享资源」页面即可查看所有公共设施的详细信息，包括坐标位置（支持跳转在线地图）、使用说明、贡献者名单和视频教程。支持按设施类型和所在维度筛选，也可通过关键词搜索快速找到目标设施。' },
        ]),
      ].filter(Boolean);
    },
  },
  towns: {
    path: '/towns',
    title: '城镇介绍 - 白鹿原 Minecraft 服务器',
    description: '白鹿原Minecraft服务器城镇一览，查看各个城镇的坐标位置、规模类型、招募状态、创始人与成员信息，以及城镇详细介绍与风貌展示。加入一个城镇，开启你的冒险之旅。',
    keywords: 'Minecraft城镇,MC城镇介绍,白鹿原城镇,Minecraft社区,服务器城镇',
    ogImageAlt: '白鹿原 Minecraft 服务器城镇介绍页面',
    type: 'website',
    structuredData: () => {
      const name = '城镇介绍';
      const description = '白鹿原Minecraft服务器城镇一览，查看规模类型、招募状态与详细介绍。';
      return [
        createCollectionPageSchema(name, description, '/towns'),
        createBreadcrumbList(name, '/towns'),
      ].filter(Boolean);
    },
  },
  stats: {
    path: '/stats',
    title: '玩家数据统计 - 白鹿原 Minecraft 服务器',
    description: '查看白鹿原Minecraft服务器全面的玩家数据统计与排行榜，包括总游戏时长、方块放置与破坏数、击杀数、死亡数等多项数据指标。搜索玩家名称查看个人详细统计信息，实时了解服务器玩家活跃度与数据榜单，发现白鹿原最活跃的冒险家们。',
    keywords: 'Minecraft玩家数据,服务器统计,玩家排行榜,白鹿原数据,MC统计,游戏时长排行',
    ogImageAlt: '白鹿原 Minecraft 服务器玩家数据统计页面',
    type: 'website',
    structuredData: () => {
      const name = '玩家数据统计';
      const description = '白鹿原Minecraft服务器玩家数据统计与排行榜页面。';
      return [
        createCollectionPageSchema(name, description, '/stats'),
        createBreadcrumbList(name, '/stats'),
        createFaqSchema([
          { q: '白鹿原服务器有哪些玩家排行榜？', a: '白鹿原提供六大排行榜：旅行者（行走距离最远）、搬石大师（放置方块最多）、挖挖机（破坏方块最多）、亡灵（死亡次数最多）、尊者（游戏时长最长）、屠夫（击杀生物最多）。每个排行榜展示前四名玩家。' },
          { q: '如何查看白鹿原服务器的个人游戏数据？', a: '访问白鹿原官网的「玩家数据统计」页面，通过搜索框输入玩家名进行搜索，点击玩家卡片即可查看详细统计信息，包括总游戏时长、方块操作数、击杀与死亡数据、合成与使用物品记录等多个分类的完整数据。' },
        ]),
      ].filter(Boolean);
    },
  },
  sponsor: {
    path: '/sponsor',
    title: '赞助榜 - 白鹿原 Minecraft 服务器',
    description: '查看白鹿原Minecraft服务器赞助者列表与众筹进度，感谢每一位赞助者的慷慨支持！了解服务器年度运营费用与当前筹集情况，支持搜索和筛选赞助记录。如果您也热爱白鹿原，欢迎通过赞助帮助服务器持续稳定运营，共同守护这片纯净的Minecraft世界。',
    keywords: '白鹿原赞助,Minecraft服务器赞助,MC服务器支持,白鹿原捐赠,服务器众筹',
    ogImageAlt: '白鹿原 Minecraft 服务器赞助榜页面',
    type: 'website',
    structuredData: () => {
      const name = '赞助榜';
      const description = '白鹿原Minecraft服务器赞助者列表与众筹进度页面。';
      return [
        createCollectionPageSchema(name, description, '/sponsor'),
        createBreadcrumbList(name, '/sponsor'),
      ].filter(Boolean);
    },
  },
  join: {
    path: '/join',
    title: '加入游戏指引 - 白鹿原 Minecraft 服务器',
    description: '白鹿原Minecraft服务器新手加入指南，支持Java版与基岩版互通，四步轻松入服：阅读服务器公约、同意规则条款、选择游戏设备、跟随配置教程完成设置。无论您使用电脑还是手机平板，都能快速加入白鹿原开启纯净原版生存冒险之旅。',
    keywords: 'Minecraft加入服务器,MC怎么进服,白鹿原加入,Minecraft教程,基岩版加入,Java版加入',
    ogImageAlt: '白鹿原 Minecraft 服务器加入游戏指引页面',
    type: 'website',
    structuredData: () => {
      const name = '加入游戏指引';
      return [
        createBreadcrumbList(name, '/join'),
        {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: '加入白鹿原Minecraft服务器',
          description: '白鹿原Minecraft服务器加入指南，支持Java版与基岩版互通。',
          url: toAbsoluteUrl('/join'),
          inLanguage: 'zh-CN',
          step: [
            {
              '@type': 'HowToStep',
              position: 1,
              name: '服务器公约',
              text: '阅读并同意服务器公约。',
            },
            {
              '@type': 'HowToStep',
              position: 2,
              name: '选择设备',
              text: '选择您所使用的设备和版本。',
            },
            {
              '@type': 'HowToStep',
              position: 3,
              name: '配置启动',
              text: '配置服务器地址并启动游戏。',
            },
            {
              '@type': 'HowToStep',
              position: 4,
              name: '开始冒险',
              text: '选择适合您的玩法并开始冒险。',
            },
          ],
          isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
          },
        },
        createFaqSchema([
          { q: '如何加入白鹿原Minecraft服务器？', a: '加入白鹿原只需四步：1. 阅读并同意服务器公约；2. 选择你的设备（电脑、手机或平板）；3. 在游戏中添加服务器地址 mcpure.lunadeer.cn（Java 版端口 25565，基岩版端口 19132）；4. 连接服务器开始冒险。详细图文教程请访问官网「加入游戏」页面。' },
          { q: '白鹿原服务器支持手机和平板加入吗？', a: '是的，白鹿原支持基岩版（Bedrock Edition），包括 iOS 和 Android 设备。手机和平板用户可通过 Minecraft 基岩版添加服务器地址 mcpure.lunadeer.cn、端口 19132 加入游戏，与电脑端 Java 版玩家在同一世界中共同游玩。' },
          { q: '白鹿原服务器有哪些规则？', a: '白鹿原要求玩家遵守服务器公约，核心规则包括：禁止使用外挂作弊、禁止恶意破坏他人建筑、禁止偷窃盗取他人物品、尊重其他玩家。违规将根据情节轻重处以警告、临时禁入或永久封禁。完整公约内容可在加入游戏页面查看。' },
        ]),
      ].filter(Boolean);
    },
  },
  doc: {
    path: '/doc',
    title: '文档 - 白鹿原 Minecraft 服务器',
    description: '白鹿原Minecraft服务器文档中心，提供全面的服务器使用指南与参考资料。包含服务器规则详解、特色玩法说明、自研插件使用教程等详细文档，帮助新老玩家快速了解服务器功能与机制，轻松上手白鹿原纯净原版Minecraft生存体验。',
    keywords: '白鹿原文档,Minecraft服务器文档,MC服务器规则,白鹿原指南,服务器帮助',
    ogImageAlt: '白鹿原 Minecraft 服务器文档中心页面',
    type: 'website',
    structuredData: () => {
      const name = '文档';
      const description = '白鹿原Minecraft服务器文档中心，包含服务器规则、玩法说明和插件使用指南。';
      return [
        createWebPageSchema('WebPage', '白鹿原服务器文档中心', description, '/doc'),
        createBreadcrumbList(name, '/doc'),
      ].filter(Boolean);
    },
  },
  map: {
    path: '/map',
    title: '在线地图 - 白鹿原 Minecraft 服务器',
    description: '白鹿原Minecraft服务器在线实时3D动态地图，全方位俯瞰服务器世界全貌。探索玩家精心建造的建筑作品，浏览多样化的自然地形地貌，实时查看服务器世界的最新变化。通过交互式地图发现白鹿原中的精彩角落，感受玩家们的创造力与冒险足迹。',
    keywords: 'Minecraft在线地图,MC服务器地图,白鹿原地图,Minecraft 3D地图,服务器世界',
    ogImageAlt: '白鹿原 Minecraft 服务器在线地图页面',
    type: 'website',
    structuredData: () => {
      const name = '在线地图';
      const description = '白鹿原Minecraft服务器在线实时3D地图页面。';
      return [
        createWebPageSchema('WebPage', '白鹿原服务器在线地图', description, '/map'),
        createBreadcrumbList(name, '/map'),
      ].filter(Boolean);
    },
  },
  photo: {
    path: '/photo',
    title: '服务器相册 - 白鹿原 Minecraft 服务器',
    description: '白鹿原Minecraft服务器精美截图相册，记录服务器中玩家精心建造的建筑作品、壮丽的自然风景与难忘的游戏精彩瞬间。浏览白鹿原最美的光影截图，感受纯净原版Minecraft世界中玩家们的无限创造力与冒险故事，一起欣赏这片美丽的虚拟世界。',
    keywords: 'Minecraft截图,MC服务器相册,白鹿原截图,Minecraft建筑,服务器风景',
    ogImageAlt: '白鹿原 Minecraft 服务器相册页面',
    type: 'website',
    structuredData: () => {
      const name = '服务器相册';
      const description = '白鹿原Minecraft服务器精美截图相册，记录玩家建筑和服务器精彩瞬间。';
      return [
        {
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: '白鹿原Minecraft服务器相册',
          description,
          url: toAbsoluteUrl('/photo'),
          inLanguage: 'zh-CN',
          isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
          },
        },
        createBreadcrumbList(name, '/photo'),
      ].filter(Boolean);
    },
  },
};

function getActiveSeo(route) {
  return route?.meta?.seo || routeSeo.home;
}

function ensureMeta(definition, content) {
  const key = definition.name ? 'name' : 'property';
  const value = definition[key];
  const selector = `meta[${key}="${value}"]`;
  let node = document.head.querySelector(selector);

  if (!node) {
    node = document.createElement('meta');
    node.setAttribute(key, value);
    node.setAttribute('data-route-seo', 'true');
    document.head.appendChild(node);
  }

  node.setAttribute('content', content);
}

function ensureLink(definition, href) {
  const selector = `link[rel="${definition.rel}"]`;
  let node = document.head.querySelector(selector);

  if (!node) {
    node = document.createElement('link');
    node.setAttribute('rel', definition.rel);
    node.setAttribute('data-route-seo', 'true');
    document.head.appendChild(node);
  }

  if (definition.type) {
    node.setAttribute('type', definition.type);
  }

  node.setAttribute('href', href);
}

function replaceJsonLdScripts(structuredData) {
  document.head.querySelectorAll('script[data-route-seo="json-ld"]').forEach((node) => node.remove());

  structuredData.forEach((entry) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-route-seo', 'json-ld');
    script.textContent = JSON.stringify(entry);
    document.head.appendChild(script);
  });
}

export function applyRouteSeo(route) {
  if (typeof document === 'undefined') {
    return;
  }

  const seo = getActiveSeo(route);
  const canonicalUrl = toAbsoluteUrl(seo.path);
  const ogImage = seo.ogImage || DEFAULT_OG_IMAGE;
  const ogImageAlt = seo.ogImageAlt || `${SITE_NAME} 页面预览图`;

  document.documentElement.lang = 'zh-CN';
  document.title = seo.title;

  ensureMeta({ name: 'description' }, seo.description);
  ensureMeta({ name: 'keywords' }, seo.keywords);
  ensureMeta({ name: 'author' }, SITE_NAME);
  ensureMeta({ name: 'robots' }, ROBOTS_CONTENT);
  ensureMeta({ name: 'application-name' }, SITE_NAME);
  ensureMeta({ name: 'apple-mobile-web-app-title' }, SITE_NAME);
  ensureMeta({ property: 'og:type' }, seo.type || 'website');
  ensureMeta({ property: 'og:url' }, canonicalUrl);
  ensureMeta({ property: 'og:title' }, seo.title);
  ensureMeta({ property: 'og:description' }, seo.description);
  ensureMeta({ property: 'og:image' }, ogImage);
  ensureMeta({ property: 'og:image:alt' }, ogImageAlt);
  ensureMeta({ property: 'og:site_name' }, SITE_NAME);
  ensureMeta({ property: 'og:locale' }, 'zh_CN');
  ensureMeta({ property: 'twitter:card' }, seo.twitterCard || 'summary');
  ensureMeta({ property: 'twitter:url' }, canonicalUrl);
  ensureMeta({ property: 'twitter:title' }, seo.title);
  ensureMeta({ property: 'twitter:description' }, seo.description);
  ensureMeta({ property: 'twitter:image' }, ogImage);
  ensureMeta({ property: 'twitter:image:alt' }, ogImageAlt);
  ensureLink({ rel: 'canonical' }, canonicalUrl);

  const structuredData = [
    ...createBaseStructuredData(),
    ...(typeof seo.structuredData === 'function' ? seo.structuredData() : []),
  ].filter(Boolean);
  replaceJsonLdScripts(structuredData);
}
