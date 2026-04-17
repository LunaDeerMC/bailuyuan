# 白鹿原官网前端

白鹿原官网的 Vue 版本前端仓库。

该项目使用 Vite + Vue 3 重建白鹿原 Minecraft 服务器官网，在保留旧站页面结构、可分享直达链接、SEO 元信息与静态托管兼容性的前提下，提供更易维护的前端实现。

线上站点：<https://bailuyuan.lunadeer.cn>

## 项目内容

当前站点包含以下页面：

- 首页 `/`
- 活动公告 `/announcements`
- 共享资源 `/facilities`
- 城镇介绍 `/towns`
- 玩家数据统计 `/stats`
- 赞助榜 `/sponsor`
- 加入游戏指引 `/join`
- 文档 `/doc`
- 在线地图 `/map`
- 服务器相册 `/photo`
- 存档备份 `/backup`

路由同时兼容旧站的 `.html` 入口，例如 `/announcements.html`、`/stats.html`，便于静态托管环境中的旧链接继续访问。

## 技术栈

- Vue 3
- Vue Router 4
- Vite 5
- vite-ssg（生产构建使用静态站点生成）
- @unhead/vue（页面级 SEO / meta 管理）
- marked（Markdown 渲染）
- Python 脚本用于生成玩家统计摘要

## 目录结构

```text
.
├─ src/                    # Vue 应用源码
│  ├─ components/          # 复用组件
│  │  ├─ layout/           # 站点布局（导航、侧边抽屉等）
│  │  ├─ shared/           # 跨页面共享组件（筛选、编辑器等）
│  │  └─ base/             # 基础原子组件
│  ├─ pages/               # 页面级组件
│  ├─ composables/         # 组合式工具（数据获取、编辑器状态等）
│  ├─ styles/              # 共享样式
│  ├─ utils/               # 工具函数（SEO、公告、数据解析等）
│  ├─ router.js            # 路由与旧 .html 兼容别名
│  └─ main.js              # 应用入口
├─ public/                 # 站点运行期静态资源与数据
│  ├─ data/                # 公告、设施、城镇、赞助、公约等数据
│  └─ stats/               # 玩家统计数据与 summary.json
├─ scripts/                # 数据处理脚本
│  └─ statsprocess.py      # 拉取并生成玩家统计摘要
├─ old-html-ver/           # 旧版静态 HTML 实现，作为迁移对照基线
├─ index.html              # 站点 HTML 入口与基础 SEO 标签
└─ vite.config.js          # Vite 配置
```

## 本地开发

项目依赖管理兼容 `npm` 与 `bun`，以下示例均使用 npm。

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

生产构建基于 `vite-ssg`，会在构建时静态渲染各路由页面，以保留首屏与 SEO。

### 4. 本地预览构建结果

```bash
npm run preview
```

默认构建输出位于 `dist/`。

## 数据来源与内容维护

站点内容主要来自 `public/` 下的静态数据文件：

- `public/data/announcements.json`：公告数据
- `public/data/facilities.json`：共享设施数据
- `public/data/towns.json`：城镇数据
- `public/data/convention.md`：入服公约
- `public/data/sponsors.txt`：赞助记录
- `public/data/fund_progress.txt`：众筹进度
- `public/stats/summary.json` 与 `public/stats/*.json`：玩家统计数据

维护这些内容时，优先保持现有数据格式不变。页面逻辑依赖这些文件的既有字段结构与解析约定。

其中 `public/data/announcements.json` 当前直接使用顶层 JSON 数组结构，每条公告对象支持 `marquee: true | false` 来控制是否出现在导航栏下方的滚动横幅中。

## 玩家统计更新

仓库提供了一个 Python 脚本，用于批量抓取玩家统计 JSON，并生成 `public/stats/summary.json`：

```bash
npm run update:stats
```

该命令实际执行：

```bash
python scripts/statsprocess.py
```

脚本依赖以下环境变量：

- `STATS_BASE_URL`：远程统计文件列表与 JSON 文件的基础地址，必填
- `STATS_USER`：可选，基础认证用户名
- `STATS_PASS`：可选，基础认证密码
- `STATS_MAX_WORKERS`：可选，并发 worker 数量

脚本行为说明：

- 从远程目录抓取所有玩家 JSON 文件
- 尝试从 Mojang/Ashcon API 补全玩家名
- 回写每个玩家 JSON 的 `extra` 字段
- 重新生成 `public/stats/summary.json`

如果你要运行该脚本，请先确保本地 Python 环境已安装依赖：

- `requests`
- `tqdm`

不要手工修改生成后的玩家统计 JSON，优先通过脚本重新拉取与生成。

## SEO 与静态托管

项目面向静态站点部署，当前实现包含以下约束：

- 主域名为 `https://bailuyuan.lunadeer.cn`
- `index.html` 中保留基础 meta、Open Graph、Twitter Card 与结构化数据
- `src/utils/seo.js` 负责路由切换后的页面级 SEO 更新
- 路由兼容旧 `.html` 访问路径
- 根目录与 `public/` 中保留 `CNAME`、`robots.txt`、`sitemap.xml` 等静态站点文件
- `index.html` 内包含 GitHub Pages 风格的 SPA 路由恢复逻辑

如果要调整部署方式或路由策略，先确认旧链接、直达访问和搜索引擎索引行为不会被破坏。

## 常用命令

```bash
npm run dev
npm run build
npm run preview
npm run update:stats
```

## 许可协议

本项目使用仓库根目录中的 `LICENSE`。