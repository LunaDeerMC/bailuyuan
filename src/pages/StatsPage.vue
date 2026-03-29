<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseModal from '../components/base/BaseModal.vue';
import EmptyState from '../components/base/EmptyState.vue';

const allPlayers = ref([]);
const updatedAt = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 24;
const loading = ref(true);

// Modal
const modalOpen = ref(false);
const selectedPlayer = ref(null);
const detailStats = ref(null);
const detailLoading = ref(false);

// Accordion state: tracks which sections are open
const openSections = ref(new Set());
// Per-section search queries
const sectionSearches = ref({});

function parseTimestamp(value) {
  if (!value || typeof value !== 'string') return null;

  const hasExplicitTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  if (!hasExplicitTimezone) return null;

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const retry = new Date(normalized);
  if (!Number.isNaN(retry.getTime())) return retry;

  return null;
}

const localizedUpdatedAt = computed(() => {
  if (!updatedAt.value) return '';

  const parsed = parseTimestamp(updatedAt.value);
  if (!parsed) return updatedAt.value;

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(parsed);
});

onMounted(() => {
  fetch('/stats/summary.json')
    .then(r => r.json())
    .then(data => {
      allPlayers.value = data.players;
      if (data.updated_at) updatedAt.value = data.updated_at;
      loading.value = false;
    })
    .catch(() => { loading.value = false; });
});

const displayedPlayers = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return allPlayers.value;
  return allPlayers.value.filter(p =>
    p.name.toLowerCase().includes(q) || p.uuid.toLowerCase().includes(q)
  );
});

const visiblePlayers = computed(() => {
  return displayedPlayers.value.slice(0, currentPage.value * pageSize);
});

const hasMore = computed(() => {
  return visiblePlayers.value.length < displayedPlayers.value.length;
});

function loadMore() {
  currentPage.value++;
}

// Reset page on search change
function onSearch(e) {
  searchQuery.value = e.target.value;
  currentPage.value = 1;
}

// Leaderboards
const leaderboards = computed(() => {
  const players = allPlayers.value;
  if (!players.length) return [];

  function getTop(sortKey, formatFn) {
    return [...players]
      .sort((a, b) => {
        const va = a.stats[sortKey] ?? 0;
        const vb = b.stats[sortKey] ?? 0;
        return vb - va;
      })
      .slice(0, 4)
      .map(p => ({ ...p, displayValue: formatFn(p) }));
  }

  return [
    { title: '旅行者', icon: 'fa-walking', color: '#22c55e', top: getTop('walk_raw', p => p.stats.walk_fmt) },
    { title: '搬石大师', icon: 'fa-cube', color: '#3b82f6', top: getTop('placed', p => p.stats.placed.toLocaleString()) },
    { title: '挖挖机', icon: 'fa-hammer', color: '#f59e0b', top: getTop('mined', p => p.stats.mined.toLocaleString()) },
    { title: '亡灵', icon: 'fa-skull-crossbones', color: '#ef4444', top: getTop('deaths', p => p.stats.deaths.toLocaleString()) },
    { title: '尊者', icon: 'fa-clock', color: '#8b5cf6', top: getTop('play_time_raw', p => p.stats.play_time_fmt) },
    { title: '屠夫', icon: 'fa-crosshairs', color: '#ec4899', top: getTop('kills', p => p.stats.kills.toLocaleString()) },
  ];
});

// Modal
function openPlayerModal(player) {
  selectedPlayer.value = player;
  detailStats.value = null;
  detailLoading.value = true;
  modalOpen.value = true;
  openSections.value = new Set();
  sectionSearches.value = {};

  fetch(`/stats/${player.uuid}.json`)
    .then(r => r.json())
    .then(data => {
      detailStats.value = data.stats || null;
      detailLoading.value = false;
    })
    .catch(() => { detailLoading.value = false; });
}

function closeModal() {
  modalOpen.value = false;
  selectedPlayer.value = null;
}

function toggleSection(key) {
  const s = new Set(openSections.value);
  if (s.has(key)) s.delete(key);
  else s.add(key);
  openSections.value = s;
}

// Category display
const categoryMap = {
  'minecraft:custom': { name: '通用统计', icon: 'fa-chart-bar' },
  'minecraft:mined': { name: '挖掘统计', icon: 'fa-hammer' },
  'minecraft:used': { name: '使用统计', icon: 'fa-hand-paper' },
  'minecraft:crafted': { name: '合成统计', icon: 'fa-tools' },
  'minecraft:broken': { name: '破坏统计', icon: 'fa-heart-broken' },
  'minecraft:picked_up': { name: '拾取统计', icon: 'fa-box-open' },
  'minecraft:dropped': { name: '丢弃统计', icon: 'fa-trash' },
  'minecraft:killed': { name: '击杀统计', icon: 'fa-crosshairs' },
  'minecraft:killed_by': { name: '死亡统计', icon: 'fa-skull' },
};

function getCategoryInfo(key) {
  return categoryMap[key] || { name: formatKey(key), icon: 'fa-folder' };
}

function formatKey(key) {
  if (key.includes(':')) key = key.split(':')[1];
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatStatValue(catKey, key, value) {
  if (catKey === 'minecraft:custom') {
    if (key.includes('time') || key.includes('minute')) {
      if (key.includes('play_time') || key.includes('time_since')) {
        const sec = value / 20;
        if (sec > 3600) return (sec / 3600).toFixed(1) + ' h';
        if (sec > 60) return (sec / 60).toFixed(1) + ' m';
        return sec.toFixed(0) + ' s';
      }
    }
    if (key.includes('cmt') || key.includes('one_cm')) {
      const m = value / 100;
      if (m > 1000) return (m / 1000).toFixed(2) + ' km';
      return m.toFixed(1) + ' m';
    }
  }
  return value.toLocaleString();
}

const sortedCategories = computed(() => {
  if (!detailStats.value) return [];
  return Object.keys(detailStats.value)
    .filter(k => Object.keys(detailStats.value[k]).length > 0)
    .sort((a, b) => {
      if (a === 'minecraft:custom') return -1;
      if (b === 'minecraft:custom') return 1;
      return a.localeCompare(b);
    });
});

function getSortedItems(catKey) {
  const sub = detailStats.value[catKey];
  if (!sub) return [];
  return Object.entries(sub)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v], i) => ({
      key: k,
      label: formatKey(k),
      value: formatStatValue(catKey, k, v),
      rank: i,
    }));
}

function filteredItems(catKey) {
  const items = getSortedItems(catKey);
  const q = (sectionSearches.value[catKey] || '').toLowerCase().trim();
  if (!q) return items;
  return items.filter(item => item.label.toLowerCase().includes(q));
}
</script>

<template>
  <!-- Hero -->
  <section class="page-hero stats-hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1 class="hero-title">玩家统计</h1>
      <p class="hero-subtitle">探索白鹿原的冒险记录</p>
      <p v-if="localizedUpdatedAt" class="hero-updated">数据更新于 {{ localizedUpdatedAt }}</p>
    </div>
  </section>

  <main class="stats-container bl-shell">
    <div v-if="loading" class="loading-text">正在加载数据...</div>

    <template v-else>
      <!-- Leaderboards -->
      <section class="leaderboards-section">
        <h2 class="section-title">排行榜</h2>
        <div class="leaderboards-grid">
          <div
            v-for="board in leaderboards"
            :key="board.title"
            class="lb-card"
          >
            <div class="lb-card-header" :style="{ borderColor: board.color }">
              <i class="fas" :class="board.icon" :style="{ color: board.color }"></i>
              <span>{{ board.title }}</span>
            </div>
            <template v-if="board.top.length">
              <!-- Top 1 -->
              <div class="lb-top-player" @click="openPlayerModal(board.top[0])">
                <img
                  :src="board.top[0].avatar"
                  :alt="board.top[0].name"
                  loading="lazy"
                  @error="($event.target).src = `https://crafatar.com/avatars/${board.top[0].uuid}?size=64&overlay`"
                >
                <div class="lb-top-name">{{ board.top[0].name }}</div>
                <div class="lb-top-data">{{ board.top[0].displayValue }}</div>
              </div>
              <!-- Runners up -->
              <div class="lb-list">
                <div
                  v-for="(p, i) in board.top.slice(1)"
                  :key="p.uuid"
                  class="lb-item"
                  @click="openPlayerModal(p)"
                >
                  <div class="lb-item-main">
                    <span class="lb-rank">{{ i + 2 }}</span>
                    <span class="lb-item-name">{{ p.name }}</span>
                  </div>
                  <span>{{ p.displayValue }}</span>
                </div>
              </div>
            </template>
            <div v-else class="lb-top-player">暂无数据</div>
          </div>
        </div>
      </section>

      <!-- Player Grid -->
      <section class="players-section">
        <h2 class="section-title">全部玩家</h2>
        <div class="player-search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            :value="searchQuery"
            placeholder="搜索玩家名或UUID..."
            @input="onSearch"
          >
        </div>

        <div v-if="visiblePlayers.length" class="players-grid">
          <div
            v-for="p in visiblePlayers"
            :key="p.uuid"
            class="player-card"
            @click="openPlayerModal(p)"
          >
            <img
              :src="p.avatar"
              :alt="p.name"
              loading="lazy"
              @error="($event.target).src = `https://crafatar.com/avatars/${p.uuid}?size=64&overlay`"
            >
            <h3>{{ p.name }}</h3>
          </div>
        </div>

        <EmptyState v-else title="暂无玩家" description="没有找到匹配的玩家。" />

        <div v-if="hasMore" class="load-more-wrapper">
          <button class="load-more-btn" @click="loadMore">加载更多</button>
        </div>
      </section>
    </template>

    <!-- Player Detail Modal -->
    <BaseModal :model-value="modalOpen" width="800px" @update:model-value="closeModal">
      <template v-if="selectedPlayer" #header>
        <div class="modal-player-header">
          <img
            :src="selectedPlayer.avatar"
            class="modal-avatar"
            :alt="selectedPlayer.name"
            @error="($event.target).src = `https://crafatar.com/avatars/${selectedPlayer.uuid}?size=64&overlay`"
          >
          <div>
            <h3>{{ selectedPlayer.name }}</h3>
            <p class="modal-uuid">{{ selectedPlayer.uuid }}</p>
          </div>
        </div>
      </template>

      <template v-if="selectedPlayer">
        <!-- Summary Stats -->
        <div class="summary-stats-grid">
          <div class="summary-stat-item">
            <span class="summary-stat-label">行走距离</span>
            <span class="summary-stat-value">{{ selectedPlayer.stats.walk_fmt }}</span>
          </div>
          <div class="summary-stat-item">
            <span class="summary-stat-label">放置方块</span>
            <span class="summary-stat-value">{{ selectedPlayer.stats.placed.toLocaleString() }}</span>
          </div>
          <div class="summary-stat-item">
            <span class="summary-stat-label">挖掘方块</span>
            <span class="summary-stat-value">{{ selectedPlayer.stats.mined.toLocaleString() }}</span>
          </div>
          <div class="summary-stat-item">
            <span class="summary-stat-label">死亡</span>
            <span class="summary-stat-value">{{ selectedPlayer.stats.deaths }}</span>
          </div>
          <div class="summary-stat-item">
            <span class="summary-stat-label">击杀</span>
            <span class="summary-stat-value">{{ selectedPlayer.stats.kills }}</span>
          </div>
          <div class="summary-stat-item">
            <span class="summary-stat-label">在线时长</span>
            <span class="summary-stat-value">{{ selectedPlayer.stats.play_time_fmt }}</span>
          </div>
        </div>

        <!-- Detail Accordion -->
        <div v-if="detailLoading" class="detail-loading">正在加载详细数据...</div>
        <div v-else-if="!detailStats" class="detail-loading">暂无详细统计数据。</div>
        <div v-else class="stats-accordion">
          <div
            v-for="catKey in sortedCategories"
            :key="catKey"
            class="accordion-item"
          >
            <div
              class="accordion-header"
              :class="{ active: openSections.has(catKey) }"
              @click="toggleSection(catKey)"
            >
              <span>
                <i class="fas" :class="getCategoryInfo(catKey).icon" style="margin-right: 8px;"></i>
                {{ getCategoryInfo(catKey).name }}
                <span class="item-count">{{ Object.keys(detailStats[catKey]).length }}</span>
              </span>
              <i class="fas fa-chevron-down arrow"></i>
            </div>
            <div v-if="openSections.has(catKey)" class="accordion-content show">
              <!-- Search for large categories -->
              <div v-if="Object.keys(detailStats[catKey]).length >= 20" class="detail-search-wrapper">
                <i class="fas fa-search"></i>
                <input
                  type="text"
                  class="detail-search"
                  placeholder="搜索条目..."
                  :value="sectionSearches[catKey] || ''"
                  @input="sectionSearches[catKey] = ($event.target).value"
                >
              </div>
              <div class="detail-stats-grid">
                <div
                  v-for="item in filteredItems(catKey)"
                  :key="item.key"
                  class="detail-stat-item"
                  :class="{ 'rank-1': item.rank === 0, 'rank-2': item.rank === 1, 'rank-3': item.rank === 2 }"
                >
                  <span class="detail-stat-value">{{ item.value }}</span>
                  <span class="detail-stat-label" :title="item.label">{{ item.label }}</span>
                </div>
              </div>
              <div v-if="filteredItems(catKey).length === 0" class="detail-no-results">
                没有匹配的条目
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseModal>
  </main>
</template>

<style scoped>
.stats-hero {
  height: 35vh;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding-top: var(--bl-topbar-offset);
  background: url('https://img.lunadeer.cn/i/2025/11/26/69267755e14e3.png') center/cover no-repeat;
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
  margin: 0 0 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 28px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.hero-updated {
  font-size: 14px;
  opacity: 0.7;
  margin-top: 8px;
}

.stats-container {
  padding: 40px 20px;
}

.loading-text {
  text-align: center;
  padding: 60px 0;
  font-size: 16px;
  color: var(--bl-text-secondary);
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 34px;
}

/* Leaderboards */
.leaderboards-section {
  margin-bottom: 60px;
  text-align: center;
}

.leaderboards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  justify-content: center;
}

.lb-card {
  background: var(--bl-surface-strong);
  border-radius: var(--bl-radius-lg);
  overflow: hidden;
  box-shadow: var(--bl-shadow-soft);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.lb-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 700;
  border-bottom: 3px solid;
}

.lb-card-header i {
  font-size: 18px;
}

.lb-top-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px 16px;
  cursor: pointer;
}

.lb-top-player img {
  width: 56px;
  height: 56px;
  border-radius: 12%;
  margin-bottom: 10px;
  background: #eee;
}

.lb-top-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.lb-top-data {
  font-size: 14px;
  color: var(--bl-text-secondary);
  font-weight: 600;
}

.lb-list {
  padding: 0 20px 16px;
}

.lb-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 14px;
  cursor: pointer;
}

.lb-item:hover {
  color: var(--bl-accent);
}

.lb-item-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lb-rank {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f0f0f2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--bl-text-secondary);
}

.lb-item-name {
  font-weight: 500;
}

/* Player Grid */
.players-section {
  margin-bottom: 40px;
  text-align: center;
}

.player-search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bl-surface-strong);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 10px 16px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto 24px;
}

.player-search-box i {
  color: var(--bl-text-secondary);
  font-size: 14px;
}

.player-search-box input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  width: 100%;
  color: var(--bl-text);
  font-family: inherit;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 16px;
}

.player-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 12px;
  background: var(--bl-surface-strong);
  border-radius: var(--bl-radius-lg);
  cursor: pointer;
  transition: var(--bl-transition);
  box-shadow: var(--bl-shadow-soft);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.player-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--bl-shadow-card);
}

.player-card img {
  width: 56px;
  height: 56px;
  border-radius: 12%;
  margin-bottom: 10px;
  background: #eee;
}

.player-card h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  text-align: center;
  word-break: break-all;
}

.load-more-wrapper {
  text-align: center;
  margin-top: 32px;
}

.load-more-btn {
  padding: 10px 32px;
  border-radius: 12px;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  background: transparent;
  color: var(--bl-text);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--bl-transition);
  font-family: inherit;
}

.load-more-btn:hover {
  background: var(--bl-accent);
  color: #fff;
  border-color: var(--bl-accent);
}

/* Modal */
.modal-player-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-avatar {
  width: 56px;
  height: 56px;
  border-radius: 12%;
  background: #eee;
}

.modal-player-header h3 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
}

.modal-uuid {
  font-size: 12px;
  font-family: monospace;
  color: var(--bl-text-secondary);
  margin: 0;
}

.summary-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.summary-stat-item {
  background: #f9f9fa;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.summary-stat-label {
  display: block;
  font-size: 12px;
  color: var(--bl-text-secondary);
  margin-bottom: 6px;
  font-weight: 500;
}

.summary-stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
}

.detail-loading {
  text-align: center;
  padding: 24px;
  color: var(--bl-text-secondary);
}

/* Accordion */
.stats-accordion {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #f5f5f7;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: var(--bl-transition);
  user-select: none;
}

.accordion-header:hover {
  background: #ebebed;
}

.accordion-header .arrow {
  font-size: 12px;
  transition: transform 0.3s;
  color: var(--bl-text-secondary);
}

.accordion-header.active .arrow {
  transform: rotate(180deg);
}

.item-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
  padding: 0 6px;
}

.accordion-content {
  padding: 16px 18px;
}

.detail-search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 8px 14px;
  margin-bottom: 16px;
}

.detail-search-wrapper i {
  color: var(--bl-text-secondary);
  font-size: 12px;
}

.detail-search {
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  width: 100%;
  color: var(--bl-text);
  font-family: inherit;
}

.detail-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.detail-stat-item {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}

.detail-stat-item.rank-1 { border-color: #ffd700; background: #fffef5; }
.detail-stat-item.rank-2 { border-color: #c0c0c0; background: #fafafa; }
.detail-stat-item.rank-3 { border-color: #cd7f32; background: #fefaf5; }

.detail-stat-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  margin-bottom: 4px;
}

.detail-stat-label {
  display: block;
  font-size: 11px;
  color: var(--bl-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-no-results {
  text-align: center;
  padding: 16px;
  color: var(--bl-text-secondary);
  font-size: 14px;
}

@media (max-width: 768px) {
  .hero-title { font-size: 36px; }
  .hero-subtitle { font-size: 20px; }
  .leaderboards-grid { grid-template-columns: 1fr; }
  .summary-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .players-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
}
</style>
