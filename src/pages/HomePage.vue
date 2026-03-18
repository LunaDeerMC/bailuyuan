<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// --- Rotating subtitle ---
const SUBTITLES = ['纯净', '原版', '生存', '养老', '休闲'];
const subtitleText = ref(SUBTITLES[0]);
const subtitleFading = ref(false);
let subtitleIdx = 0;
let subtitleTimer = null;

onMounted(() => {
  subtitleTimer = setInterval(() => {
    subtitleFading.value = true;
    setTimeout(() => {
      subtitleIdx = (subtitleIdx + 1) % SUBTITLES.length;
      subtitleText.value = SUBTITLES[subtitleIdx];
      subtitleFading.value = false;
    }, 500);
  }, 4000);

  startRuntime();
  fetchServerStatus();
  fetchSponsors();
  fetchCrowdfunding();
});

onUnmounted(() => {
  clearInterval(subtitleTimer);
  clearInterval(runtimeTimer);
});

// --- Runtime timer ---
const days = ref(0);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
let runtimeTimer = null;

function startRuntime() {
  const start = new Date('2021-09-14T09:57:59').getTime();
  function update() {
    const diff = Date.now() - start;
    days.value = Math.floor(diff / 86400000);
    hours.value = Math.floor((diff % 86400000) / 3600000);
    minutes.value = Math.floor((diff % 3600000) / 60000);
    seconds.value = Math.floor((diff % 60000) / 1000);
  }
  update();
  runtimeTimer = setInterval(update, 1000);
}

// --- Copy IP ---
const copied = ref(false);
function copyIp() {
  navigator.clipboard.writeText('mcpure.lunadeer.cn').then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  });
}

// --- Server status ---
const onlineText = ref('正在获取状态...');
const isOnline = ref(true);
const playerList = ref([]);
const playersLoading = ref(true);

async function fetchServerStatus() {
  try {
    const res = await fetch('https://api.mcstatus.io/v2/status/java/mcpure.lunadeer.cn');
    const data = await res.json();
    if (data.online) {
      onlineText.value = `在线人数: ${data.players.online} / ${data.players.max}`;
      isOnline.value = true;
      playerList.value = data.players.list || [];
    } else {
      onlineText.value = '服务器离线';
      isOnline.value = false;
    }
  } catch {
    onlineText.value = '无法获取状态';
    isOnline.value = false;
  } finally {
    playersLoading.value = false;
  }
}

// --- Top sponsors ---
const topSponsors = ref([]);

async function fetchSponsors() {
  try {
    const res = await fetch('/data/sponsors.txt');
    const text = await res.text();
    const sponsors = [];
    text.trim().split('\n').forEach(line => {
      const parts = line.split(',');
      if (parts.length < 3) return;
      const name = parts[0].trim();
      const amount = parseFloat(parts[2].trim().replace('￥', ''));
      if (!isNaN(amount)) sponsors.push({ name, amount });
    });

    const totals = {};
    sponsors.forEach(s => { totals[s.name] = (totals[s.name] || 0) + s.amount; });
    const sorted = Object.entries(totals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
    topSponsors.value = sorted.slice(0, 3);
  } catch { /* silent */ }
}

// --- Crowdfunding ---
const funds = ref([]);

async function fetchCrowdfunding() {
  try {
    const res = await fetch('/data/fund_progress.txt');
    const text = await res.text();
    const items = [];
    text.trim().split('\n').forEach(line => {
      const parts = line.replace(/，/g, ',').split(',');
      if (parts.length >= 3) {
        const name = parts[0].trim();
        const current = parseFloat(parts[1].trim());
        const target = parseFloat(parts[2].trim());
        if (name && !isNaN(current) && !isNaN(target)) {
          items.push({ name, current, target, pct: target > 0 ? Math.min(100, (current / target) * 100) : 0 });
        }
      }
    });
    funds.value = items;
  } catch { /* silent */ }
}

// --- Bento features ---
const bentoItems = [
  { key: 'pure', size: 'large', icon: 'fas fa-leaf', title: '纯净原版', desc: '无纷繁复杂的 Mod，无破坏平衡的插件。一切简单的就像是单机模式的共享一般', bg: 'https://img.lunadeer.cn/i/2024/02/21/65d592eb4afad.jpg' },
  { key: 'dev', size: 'medium', icon: 'fas fa-code', title: '深度自研', desc: '全栈自研核心，拒绝卡脖子，保证可持续发展', bg: 'https://img.lunadeer.cn/i/2025/11/26/6926982718ba8.png' },
  { key: 'params', size: 'medium', icon: 'fas fa-sliders-h', title: '原汁原味', desc: '生物生成、红石参数与单机高度一致', bg: 'https://img.lunadeer.cn/i/2025/11/26/6926775006dea.jpg' },
  { key: 'land', size: 'small', icon: 'fas fa-home', title: '免费圈地', desc: '2048*2048 超大领地', bg: 'https://img.lunadeer.cn/i/2024/02/21/65d592ea6faa1.jpg' },
  { key: 'bedrock', size: 'small', icon: 'fas fa-mobile-alt', title: '基岩互通', desc: '手机电脑随时畅玩', bg: 'https://img.lunadeer.cn/i/2025/11/26/692677560db46.png' },
  { key: 'hardware', size: 'small', icon: 'fas fa-server', title: '自有硬件', desc: '物理工作站，永不跑路', bg: 'https://img.lunadeer.cn/i/2024/02/21/65d592e248066.jpg' },
  { key: 'fun', size: 'small', icon: 'fas fa-gamepad', title: '娱乐玩法', desc: '空岛、跑酷、小游戏', bg: 'https://img.lunadeer.cn/i/2025/11/26/692677566b07b.png' },
  { key: 'update', size: 'medium', icon: 'fas fa-sync-alt', title: '紧跟新版', desc: '紧跟 Paper 核心版本更新，始终保持在版本前列。第一时间体验 Minecraft 的最新内容', bg: 'https://img.lunadeer.cn/i/2025/11/26/692697b71431b.png' },
  { key: 'guide', size: 'medium', icon: 'fas fa-book-open', title: '新手指南', desc: '完善的服务器文档与活跃的社区，帮助你快速上手，加入白鹿原大家庭', bg: 'https://img.lunadeer.cn/i/2025/11/26/692697b7376c7.png' },
];

const medals = ['🥇', '🥈', '🥉'];
</script>

<template>
  <!-- Hero -->
  <header class="home-hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1 class="hero-title">白鹿原</h1>
      <div class="hero-subtitle-container">
        <p class="hero-subtitle">
          <span>永不换档的</span>
          <span :class="['subtitle-dynamic', { 'fade-out': subtitleFading }]">{{ subtitleText }}</span>
          <span>Minecraft 服务器</span>
        </p>
      </div>
      <div class="server-runtime">
        已稳定运行 <strong>{{ days }}</strong> 天
        <strong>{{ hours }}</strong> 小时
        <strong>{{ minutes }}</strong> 分
        <strong>{{ seconds }}</strong> 秒
      </div>
      <div class="hero-actions">
        <div class="server-ip-box" @click="copyIp">
          <span>mcpure.lunadeer.cn</span>
          <i :class="copied ? 'fas fa-check' : 'fas fa-copy'"></i>
          <span v-if="copied" class="copy-toast">已复制!</span>
        </div>
        <p class="ip-hint">点击复制服务器地址</p>

        <div class="online-status-box">
          <div class="status-indicator">
            <span :class="['status-dot', { offline: !isOnline }]"></span>
            <span>{{ onlineText }}</span>
          </div>
          <div class="players-tooltip">
            <template v-if="playersLoading">
              <div class="player-item player-item-center">加载中...</div>
            </template>
            <template v-else-if="playerList.length > 0">
              <div v-for="p in playerList" :key="p.uuid" class="player-item">
                <img :src="`https://minotar.net/avatar/${p.name_raw}/16`" class="player-avatar" alt="">
                <span>{{ p.name_raw }}</span>
              </div>
            </template>
            <template v-else>
              <div class="player-item player-item-muted">暂无玩家在线</div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>

  <main>
    <!-- Bento Grid Features -->
    <section class="features-section">
      <div class="bl-container">
        <div class="bento-grid">
          <div
            v-for="item in bentoItems"
            :key="item.key"
            :class="['bento-item', `size-${item.size}`]"
            :style="{ backgroundImage: `url(${item.bg})` }"
          >
            <div class="bento-overlay"></div>
            <div class="bento-content">
              <i :class="item.icon + ' icon'"></i>
              <component :is="item.size === 'small' ? 'h4' : 'h3'">{{ item.title }}</component>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Top Sponsors -->
    <section v-if="topSponsors.length > 0" class="sponsors-section">
      <div class="bl-container">
        <h2 class="section-title">特别鸣谢</h2>
        <div class="top-sponsors-grid">
          <div v-for="(s, i) in topSponsors" :key="s.name" class="sponsor-card">
            <div class="sponsor-rank">{{ medals[i] }}</div>
            <div class="sponsor-name">{{ s.name }}</div>
            <div class="sponsor-amount">¥{{ s.total.toFixed(2) }}</div>
          </div>
        </div>
        <div class="sponsors-action">
          <router-link to="/sponsor" class="view-sponsors-btn">查看赞助列表</router-link>
        </div>
      </div>
    </section>

    <!-- Crowdfunding -->
    <section v-if="funds.length > 0" class="crowdfunding-section">
      <div class="bl-container">
        <h2 class="section-title">众筹进度</h2>
        <div class="crowdfunding-grid">
          <div v-for="fund in funds" :key="fund.name" class="fund-card">
            <div class="fund-header">
              <div class="fund-title">{{ fund.name }}</div>
              <div class="fund-stats">
                <span>¥{{ fund.current }}</span> / ¥{{ fund.target }}
              </div>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: fund.pct + '%' }"></div>
            </div>
            <div class="fund-percentage">{{ fund.pct.toFixed(1) }}%</div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ====== HERO ====== */
.home-hero {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding-top: var(--bl-header-height);
  background: #000 url('https://img.lunadeer.cn/i/2025/11/26/69267755e14e3.png') center/cover;
  position: relative;
  color: #fff;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  letter-spacing: -0.005em;
  margin: 0 0 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 28px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 15px;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.subtitle-dynamic {
  display: inline-block;
  min-width: 40px;
  margin: 0 8px;
  transition: opacity 0.5s ease, transform 0.5s ease;
  opacity: 1;
  transform: translateY(0);
}

.subtitle-dynamic.fade-out {
  opacity: 0;
  transform: translateY(-10px);
}

.server-runtime {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 40px;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.server-runtime strong {
  font-weight: 700;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.server-ip-box {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 12px 24px;
  border-radius: 980px;
  font-size: 17px;
  cursor: pointer;
  transition: var(--bl-transition);
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.server-ip-box:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.02);
}

.copy-toast {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  animation: fadeToast 2s forwards;
}

@keyframes fadeToast {
  0%, 80% { opacity: 1; }
  100% { opacity: 0; }
}

.ip-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Online status */
.online-status-box {
  margin-top: 15px;
  position: relative;
}

.status-indicator {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #34c759;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(52, 199, 89, 0.6);
}

.status-dot.offline {
  background: #ff3b30;
  box-shadow: 0 0 8px rgba(255, 59, 48, 0.6);
}

.players-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.95);
  color: #1d1d1f;
  padding: 10px;
  border-radius: 12px;
  width: 200px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 10;
  text-align: left;
}

.online-status-box:hover .players-tooltip {
  opacity: 1;
  visibility: visible;
  margin-top: 15px;
}

.players-tooltip::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
  border-style: solid;
  border-color: transparent transparent rgba(255, 255, 255, 0.95) transparent;
}

.player-item {
  padding: 6px 8px;
  font-size: 13px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-item:last-child { border-bottom: none; }
.player-item-center { justify-content: center; }
.player-item-muted { justify-content: center; color: #86868b; }

.player-avatar {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

/* ====== FEATURES BENTO ====== */
.features-section {
  padding: 100px 0;
  background: var(--bl-bg);
}

.bl-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 180px;
  gap: 20px;
}

.bento-item {
  border-radius: var(--bl-radius-lg);
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  text-align: left;
  transition: var(--bl-transition);
  overflow: hidden;
  position: relative;
  background-size: cover;
  background-position: center;
  box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.02);
}

.bento-item:hover {
  transform: scale(1.02);
  box-shadow: 2px 8px 24px rgba(0, 0, 0, 0.06);
}

.size-large { grid-column: span 2; grid-row: span 2; }
.size-medium { grid-column: span 2; }
.size-small { grid-column: span 1; }

.bento-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
  z-index: 1;
}

.bento-content {
  position: relative;
  z-index: 2;
  width: 100%;
}

.bento-content .icon {
  color: #fff;
  font-size: 32px;
  margin-bottom: 10px;
}

.bento-content h3 {
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.bento-content h4 {
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  margin: 10px 0 5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.bento-content p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.size-small p { font-size: 13px; }

/* ====== SPONSORS ====== */
.sponsors-section {
  padding: 80px 0;
  background: #fff;
  text-align: center;
}

.section-title {
  font-size: 40px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 60px;
}

.top-sponsors-grid {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.sponsor-card {
  background: var(--bl-bg);
  border-radius: 16px;
  padding: 30px;
  width: 250px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: var(--bl-transition);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sponsor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.sponsor-rank { font-size: 48px; margin-bottom: 10px; }
.sponsor-name { font-size: 20px; font-weight: 600; margin-bottom: 5px; }
.sponsor-amount { font-size: 16px; color: var(--bl-accent); font-weight: 500; }

.sponsors-action { text-align: center; }

.view-sponsors-btn {
  display: inline-block;
  background: #1d1d1f;
  color: #fff;
  padding: 12px 30px;
  border-radius: 980px;
  font-size: 16px;
  text-decoration: none;
  transition: var(--bl-transition);
}

.view-sponsors-btn:hover {
  background: #000;
  transform: scale(1.05);
}

/* ====== CROWDFUNDING ====== */
.crowdfunding-section {
  padding: 80px 0;
  background: var(--bl-bg);
}

.crowdfunding-grid {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.fund-card {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: var(--bl-transition);
}

.fund-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.fund-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 15px;
}

.fund-title { font-size: 20px; font-weight: 600; }
.fund-stats { font-size: 14px; color: var(--bl-text-secondary); }
.fund-stats span { font-weight: 600; color: var(--bl-text); }

.progress-bar-bg {
  width: 100%;
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0071e3, #34c759);
  border-radius: 6px;
  transition: width 1s ease-out;
}

.fund-percentage {
  text-align: right;
  font-size: 12px;
  color: var(--bl-text-secondary);
  margin-top: 8px;
}

/* ====== RESPONSIVE ====== */
@media (max-width: 900px) {
  .bento-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }

  .size-large, .size-medium, .size-small {
    grid-column: span 1;
    grid-row: auto;
    min-height: 250px;
  }

  .hero-title { font-size: 40px; }
  .hero-subtitle { font-size: 22px; }
  .section-title { font-size: 28px; margin-bottom: 40px; }
}
</style>
