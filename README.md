# 白鹿原 Minecraft 服务器官网

这是白鹿原 Minecraft 服务器的静态官网仓库，使用原生 HTML、CSS 和 JavaScript 构建，无前端框架、无打包流程。

站点主要用于展示服务器介绍、加入指引、共享设施、赞助信息、玩家统计等内容，并通过 GitHub Pages 自动部署。

## 在线预览

- 正式站点：https://bailuyuan.lunadeer.cn/


## 功能概览

- 首页：服务器介绍、运行时长、在线状态、众筹进度、赞助榜
- 加入指引：分步骤展示服务器公约、设备选择、启动教程
- 共享设施：展示全服公共设施，支持搜索、筛选和详情弹窗
- 赞助页：展示赞助名单、累计金额、筛选和赞助弹窗
- 数据中心：展示玩家排行榜、玩家卡片、详细统计弹窗
- 其他页面：文档、地图、相册等导航入口

## 技术栈

- HTML5
- CSS3
- Vanilla JavaScript
- Python 3（用于生成玩家统计数据）
- GitHub Actions + GitHub Pages（自动部署）

## 目录结构

```text
.
├── index.html              # 首页
├── join.html               # 加入游戏指引
├── facilities.html         # 共享设施页
├── sponsor.html            # 赞助页
├── stats.html              # 玩家数据页
├── doc.html                # 文档入口
├── map.html                # 地图入口
├── photo.html              # 相册入口
├── css/
│   ├── style.css           # 全站公共样式
│   └── pages/              # 页面级样式
├── js/
│   ├── components.js       # 导航栏、页脚、移动端菜单
│   ├── data_utils.js       # 文本数据解析工具
│   ├── script.js           # 首页逻辑
│   ├── join_script.js      # 加入指引逻辑
│   ├── facilities_script.js# 设施页逻辑
│   ├── sponsor_script.js   # 赞助页逻辑
│   └── stats_script.js     # 数据页逻辑
├── data/
│   ├── convention.md       # 服务器公约
│   ├── facilities.json     # 公共设施数据
│   ├── fund_progress.txt   # 众筹进度数据
│   └── sponsors.txt        # 赞助数据
├── stats/                  # 玩家统计明细与 summary.json
├── statsprocess.py         # 拉取并生成统计数据
└── .github/workflows/
    └── deploy.yml          # GitHub Pages 自动部署工作流
```

## 页面与脚本对应关系

| 页面 | 入口文件 | 脚本 | 说明 |
| --- | --- | --- | --- |
| 首页 | `index.html` | `js/script.js` | 服务器介绍、在线状态、赞助榜、众筹 |
| 加入指引 | `join.html` | `js/join_script.js` | 加入流程、公约加载、设备指引 |
| 共享设施 | `facilities.html` | `js/facilities_script.js` | 设施检索、筛选、详情弹窗 |
| 赞助页 | `sponsor.html` | `js/sponsor_script.js` | 赞助统计、搜索筛选、赞助弹窗 |
| 数据中心 | `stats.html` | `js/stats_script.js` | 排行榜、玩家搜索、详情数据加载 |

公共导航和页脚由 `js/components.js` 注入到 `#navbar-component` 与 `#footer-component`。

## 本地开发

这个项目没有构建步骤，直接启动静态文件服务即可。

### 1. 启动本地预览

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://localhost:8000/
```

### 2. 开发时的注意事项

- 不要直接双击打开 HTML 文件，部分 `fetch()` 读取本地数据会被浏览器拦截
- 页面资源路径均为相对路径，建议始终从仓库根目录启动静态服务
- 站点是纯静态结构，修改后刷新浏览器即可验证效果

## 数据文件说明

### `data/convention.md`

加入游戏页面会读取这份 Markdown 并渲染为服务器公约内容。

### `data/fund_progress.txt`

首页读取众筹进度数据，按行解析。每行格式为：

```text
项目名称,当前金额,目标金额
```

示例：

```text
新机器升级,1200,3000
```

### `data/sponsors.txt`

首页和赞助页都会读取赞助文本数据，格式为逗号分隔：

```text
赞助者,项目,金额,日期
```

其中日期字段为可选。

### `data/facilities.json`

共享设施页面的数据源，用于渲染设施卡片、筛选项和详情弹窗。

## 玩家统计数据流程

玩家统计不是前端实时计算，而是由 `statsprocess.py` 预生成静态 JSON 文件。

### 数据来源

- 源统计接口：将服务器玩家的存档数据目录通过 HTTP 暴露，路径一般为 `your-server/world/stats`
- 玩家名解析：Ashcon API、Mojang Session API
- 头像展示：Minotar / Crafatar

### 生成结果

脚本会完成以下工作：

1. 拉取远端玩家 JSON 数据
2. 解析玩家名
3. 计算行走距离、游玩时长、挖掘数、放置数、死亡数、击杀数
4. 将单个玩家明细写入 `stats/{uuid}.json`
5. 汇总生成 `stats/summary.json`

### 本地更新统计数据

先安装依赖：

```bash
pip install requests tqdm
```

源接口需要配置认证，再设置环境变量：

```bash
export STATS_USER=your_username
export STATS_PASS=your_password
```

执行更新：

```bash
python3 statsprocess.py
```

## 自动部署

仓库包含 GitHub Pages 自动部署工作流：`.github/workflows/deploy.yml`。

触发条件：

- 推送到 `main`
- 每 2 天自动执行一次（UTC 04:00）
- 手动触发 `workflow_dispatch`

工作流会执行以下步骤：

1. 检出仓库
2. 安装 Python
3. 安装 `requests`、`tqdm`
4. 运行 `statsprocess.py`
5. 上传站点文件到 GitHub Pages

如果统计接口需要认证，需要在 GitHub 仓库 Secrets 中配置：

- `STATS_USER`
- `STATS_PASS`

## 维护建议

- 修改导航结构时，优先更新 `js/components.js`
- 修改公共视觉变量时，优先调整 `css/style.css`
- 新增页面样式时，放到 `css/pages/` 下单独维护
- 前端数据读取依赖固定格式，修改 `data/` 下文本文件时不要破坏既有约定
- `stats/` 目录是生成产物，同时也是站点线上数据的一部分，批量处理前先确认影响

## 许可证

[GPL-3.0 License](LICENSE)