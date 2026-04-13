<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  fetchOverview,
  fetchDisasterRecovery,
  fetchCurrentTask,
  fetchPolicies,
  fetchBackups,
  fetchUpcomingTasks,
} from '../composables/useBackupData.js';

const loading = ref(true);
const error = ref('');

const overview = ref(null);
const drScore = ref(null);
const currentTask = ref(null);
const policies = ref([]);
const backups = ref([]);
const backupTotal = ref(0);
const backupTotalPages = ref(0);
const backupPage = ref(1);
const upcomingTasks = ref([]);

// Map policy id -> latest backup from backups list
const policyLatestBackup = computed(() => {
  const map = {};
  for (const b of backups.value) {
    if (!map[b.policy_id] || new Date(b.created_at) > new Date(map[b.policy_id].created_at)) {
      map[b.policy_id] = b;
    }
  }
  return map;
});

const stats = computed(() => overview.value?.stats || null);

onMounted(async () => {
  try {
    const [ov, dr, ct, pol, bk, ut] = await Promise.all([
      fetchOverview(),
      fetchDisasterRecovery(),
      fetchCurrentTask(),
      fetchPolicies(),
      fetchBackups(1, 100),
      fetchUpcomingTasks(168),
    ]);
    overview.value = ov;
    drScore.value = dr;
    currentTask.value = ct.task;
    policies.value = pol.items || [];
    backups.value = bk.items || [];
    backupTotal.value = bk.total || 0;
    backupTotalPages.value = bk.total_pages || 0;
    upcomingTasks.value = ut.items || [];
  } catch (e) {
    error.value = e.message || '数据加载失败';
  } finally {
    loading.value = false;
  }
});

async function loadBackupPage(page) {
  if (page < 1 || page > backupTotalPages.value) return;
  backupPage.value = page;
  try {
    const bk = await fetchBackups(page, 100);
    backups.value = bk.items || [];
    backupTotal.value = bk.total || 0;
    backupTotalPages.value = bk.total_pages || 0;
  } catch (_) { /* keep existing data */ }
}

// Helpers
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
}

function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(d);
}

function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '-';
  if (seconds < 60) return seconds + ' 秒';
  if (seconds < 3600) return Math.floor(seconds / 60) + ' 分 ' + (seconds % 60) + ' 秒';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h + ' 小时 ' + m + ' 分';
}

function statusLabel(status) {
  const map = {
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    pending: '等待中',
    idle: '空闲',
    success: '成功',
    skipped: '已跳过',
  };
  return map[status] || status;
}

function statusClass(status) {
  if (['completed', 'success'].includes(status)) return 'status-success';
  if (['failed', 'error'].includes(status)) return 'status-danger';
  if (['running', 'pending'].includes(status)) return 'status-running';
  return 'status-default';
}

function typeLabel(type) {
  const map = {
    full: '全量备份',
    incremental: '增量备份',
    cold: '冷备份',
    rolling: '滚动备份',
    backup: '备份',
    restore: '恢复',
  };
  return map[type] || type;
}

function typeClass(type) {
  const map = {
    cold: 'type-cold',
    rolling: 'type-rolling',
  };
  return map[type] || '';
}

function typeIcon(type) {
  const map = {
    cold: 'fa-snowflake',
    rolling: 'fa-sync-alt',
  };
  return map[type] || 'fa-copy';
}

function scheduleLabel(type, value) {
  if (type === 'cron') return `Cron: ${value}`;
  if (type === 'interval') return `每 ${value}`;
  return `${type}: ${value}`;
}

function retentionLabel(type, value) {
  if (type === 'count') return `保留 ${value} 份`;
  if (type === 'days') return `保留 ${value} 天`;
  return `${type}: ${value}`;
}

function drLevelLabel(level) {
  const map = {
    excellent: '优秀',
    good: '良好',
    fair: '一般',
    poor: '较差',
    critical: '危险',
  };
  return map[level] || level;
}

function drLevelColor(level) {
  const map = {
    excellent: '#34c759',
    good: '#30d158',
    fair: '#f59e0b',
    poor: '#ff9500',
    critical: '#ef4444',
  };
  return map[level] || '#0071e3';
}

function scoreBarColor(score) {
  if (score >= 80) return '#34c759';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

const ARCHIVE_URL = 'https://pan.baidu.com/s/1-0Ixkjty-oI5IcLzx8h9nw';
</script>

<template>
  <!-- Hero -->
  <section class="backup-hero">
    <div class="hero-content">
      <h1 class="hero-title">备份与容灾</h1>
      <p class="hero-subtitle">数据安全是白鹿原的首要承诺</p>
    </div>
  </section>

  <main class="backup-container bl-shell">
    <div v-if="loading" class="loading-text">正在加载备份数据...</div>
    <div v-else-if="error" class="loading-text">{{ error }}</div>

    <template v-else>
      <!-- Row 1: Overview Card -->
      <section class="backup-section">
        <div class="overview-card">
          <div class="overview-left">
            <div class="ov-intro">
              <h2><i class="fas fa-shield-alt"></i> 3-2-1 备份策略</h2>
              <p>
                白鹿原服务器严格遵循 <strong>3-2-1 备份原则</strong>：至少保留
                <em>3</em> 份数据副本，存储在 <em>2</em> 种不同介质上，其中
                <em>1</em> 份存放于异地。配合自动化定时备份与容灾评分监控，
                全方位保障每一位玩家的数据安全。
              </p>
              <p class="ov-powered">
                <i class="fas fa-server"></i> 备份服务由
                <a href="https://github.com/LunaDeerTech/RsyncBackupService" target="_blank" rel="noopener">RsyncBackupService</a>
                提供支持
              </p>
            </div>

            <!-- Current task -->
            <div v-if="currentTask" class="current-task-bar">
              <div class="task-bar-header">
                <span class="task-bar-badge" :class="statusClass(currentTask.status)">
                  <i class="fas fa-sync-alt fa-spin" v-if="currentTask.status === 'running'"></i>
                  {{ statusLabel(currentTask.status) }}
                </span>
                <span class="task-bar-type">{{ typeLabel(currentTask.type) }}</span>
              </div>
              <div v-if="currentTask.progress !== undefined" class="task-progress-wrap">
                <div class="task-progress-bar">
                  <div class="task-progress-fill" :style="{ width: currentTask.progress + '%' }"></div>
                </div>
                <span class="task-progress-label">{{ currentTask.progress }}%</span>
              </div>
              <div class="task-bar-meta">
                <span v-if="currentTask.current_step">步骤：{{ currentTask.current_step }}</span>
                <span v-if="currentTask.started_at">开始于 {{ formatDate(currentTask.started_at) }}</span>
              </div>
            </div>
            <div v-else class="current-task-bar idle-bar">
              <i class="fas fa-check-circle"></i> 当前无正在执行的任务，系统空闲中
            </div>
          </div>

          <!-- DR score -->
          <div v-if="drScore" class="overview-right">
            <div class="dr-score-ring" :style="{ '--dr-color': drLevelColor(drScore.level) }">
              <svg viewBox="0 0 120 120" class="ring-svg">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f0f0f2" stroke-width="10" />
                <circle cx="60" cy="60" r="52" fill="none"
                  :stroke="drLevelColor(drScore.level)" stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="2 * Math.PI * 52"
                  :stroke-dashoffset="2 * Math.PI * 52 * (1 - drScore.total / 100)"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div class="ring-label">
                <span class="ring-score">{{ Math.round(drScore.total) }}</span>
                <span class="ring-text">{{ drLevelLabel(drScore.level) }}</span>
              </div>
            </div>
            <div class="dr-details">
              <div class="dr-detail-item">
                <span class="dr-detail-name">备份新鲜度</span>
                <div class="dr-detail-bar"><div :style="{ width: drScore.freshness + '%', background: scoreBarColor(drScore.freshness) }"></div></div>
                <span class="dr-detail-val">{{ drScore.freshness }}</span>
              </div>
              <div class="dr-detail-item">
                <span class="dr-detail-name">恢复点</span>
                <div class="dr-detail-bar"><div :style="{ width: drScore.recovery_points + '%', background: scoreBarColor(drScore.recovery_points) }"></div></div>
                <span class="dr-detail-val">{{ drScore.recovery_points }}</span>
              </div>
              <div class="dr-detail-item">
                <span class="dr-detail-name">冗余性</span>
                <div class="dr-detail-bar"><div :style="{ width: drScore.redundancy + '%', background: scoreBarColor(drScore.redundancy) }"></div></div>
                <span class="dr-detail-val">{{ drScore.redundancy }}</span>
              </div>
              <div class="dr-detail-item">
                <span class="dr-detail-name">稳定性</span>
                <div class="dr-detail-bar"><div :style="{ width: drScore.stability + '%', background: scoreBarColor(drScore.stability) }"></div></div>
                <span class="dr-detail-val">{{ drScore.stability }}</span>
              </div>
            </div>
            <div v-if="drScore.deductions && drScore.deductions.length" class="dr-deductions">
              <p v-for="(d, i) in drScore.deductions" :key="i" class="deduction-item">
                <i class="fas fa-exclamation-triangle"></i> {{ d }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Row 2: Policies -->
      <section class="backup-section">
        <div class="policies-grid">
          <div v-for="policy in policies" :key="policy.id" class="policy-card">
            <div class="policy-card-top">
              <div class="policy-icon-wrap" :class="[policy.enabled ? 'icon-active' : 'icon-disabled', 'icon-' + (policy.type || 'default')]">
                <i class="fas" :class="typeIcon(policy.type)"></i>
              </div>
              <div class="policy-title-area">
                <span class="policy-name">{{ policy.name }}</span>
                <span class="policy-type-tag">{{ typeLabel(policy.type) }}</span>
              </div>
              <span class="policy-badge" :class="policy.enabled ? 'badge-on' : 'badge-off'">
                <i class="fas" :class="policy.enabled ? 'fa-check-circle' : 'fa-pause-circle'"></i>
                {{ policy.enabled ? '启用' : '停用' }}
              </span>
            </div>
            <div class="policy-body">
              <div class="policy-kv-list">
                <div class="policy-kv"><span class="kv-icon"><i class="fas fa-clock"></i></span><span class="kv-label">执行计划</span><span class="kv-val">{{ scheduleLabel(policy.schedule_type, policy.schedule_value) }}</span></div>
                <div class="policy-kv"><span class="kv-icon"><i class="fas fa-archive"></i></span><span class="kv-label">保留策略</span><span class="kv-val">{{ retentionLabel(policy.retention_type, policy.retention_value) }}</span></div>
                <div class="policy-kv"><span class="kv-icon"><i class="fas fa-compress-arrows-alt"></i></span><span class="kv-label">压缩</span><span class="kv-val">{{ policy.compression ? '已启用' : '未启用' }}</span></div>
                <div class="policy-kv"><span class="kv-icon"><i class="fas fa-lock"></i></span><span class="kv-label">加密</span><span class="kv-val">{{ policy.encryption ? '已启用' : '未启用' }}</span></div>
              </div>
              <div v-if="policy.last_execution_status" class="policy-last-exec">
                <span class="last-exec-label">最近执行</span>
                <span class="status-dot" :class="statusClass(policy.last_execution_status)">{{ statusLabel(policy.last_execution_status) }}</span>
                <span v-if="policy.last_execution_time" class="last-exec-time">{{ formatDate(policy.last_execution_time) }}</span>
              </div>
            </div>
            <div v-if="policyLatestBackup[policy.id]" class="policy-latest">
              <div class="latest-badge"><i class="fas fa-database"></i> 最新备份</div>
              <div class="latest-detail-grid">
                <div class="latest-detail">
                  <span class="ld-val">{{ formatDate(policyLatestBackup[policy.id].completed_at || policyLatestBackup[policy.id].created_at) }}</span>
                  <span class="ld-label">完成时间</span>
                </div>
                <div class="latest-detail">
                  <span class="ld-val">{{ formatBytes(policyLatestBackup[policy.id].backup_size_bytes) }}</span>
                  <span class="ld-label">备份大小</span>
                </div>
                <div class="latest-detail">
                  <span class="ld-val">{{ formatDuration(policyLatestBackup[policy.id].duration_seconds) }}</span>
                  <span class="ld-label">耗时</span>
                </div>
                <div class="latest-detail">
                  <span class="ld-val status-dot" :class="statusClass(policyLatestBackup[policy.id].status)">{{ statusLabel(policyLatestBackup[policy.id].status) }}</span>
                  <span class="ld-label">状态</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Row 3: Storage & Upcoming Tasks -->
      <section class="backup-section row-two-col">
        <div class="storage-card">
          <h3><i class="fas fa-hdd"></i> 存储容量</h3>
          <div v-if="stats" class="storage-metrics">
            <div class="storage-metric">
              <span class="storage-number">{{ formatBytes(stats.total_backup_size_bytes) }}</span>
              <span class="storage-label">累计备份数据量</span>
            </div>
            <div class="storage-metric">
              <span class="storage-number">{{ formatBytes(stats.total_backup_disk_bytes) }}</span>
              <span class="storage-label">实际占用存储</span>
            </div>
            <div v-if="stats.total_backup_size_bytes && stats.total_backup_disk_bytes" class="storage-metric">
              <span class="storage-number">
                {{ ((1 - stats.total_backup_disk_bytes / stats.total_backup_size_bytes) * 100).toFixed(1) }}%
              </span>
              <span class="storage-label">压缩/去重节省</span>
            </div>
          </div>
        </div>

        <div class="upcoming-card">
          <h3><i class="fas fa-calendar-alt"></i> 计划任务</h3>
          <div v-if="upcomingTasks.length" class="upcoming-list">
            <div v-for="task in upcomingTasks" :key="task.policy_id + task.next_run_at" class="upcoming-item">
              <div class="upcoming-main">
                <span class="upcoming-name">{{ task.policy_name }}</span>
                <span class="upcoming-type-tag" :class="typeClass(task.type)"><i class="fas" :class="typeIcon(task.type)"></i> {{ typeLabel(task.type) }}</span>
              </div>
              <span class="upcoming-time">{{ formatDate(task.next_run_at) }}</span>
            </div>
          </div>
          <div v-else class="empty-hint">暂无计划任务</div>
        </div>
      </section>

      <!-- Row 4: Backups List -->
      <section class="backup-section">
        <div class="backups-list-card">
          <div class="backups-header-v2">
            <div class="bkh-left">
              <h3 class="bkh-title">
                <i class="fas fa-history"></i> 备份记录
                <span class="bkh-chips">
                  <span class="bkh-chip"><i class="fas fa-box"></i> {{ backupTotal }} 份可用</span>
                  <span v-if="stats" class="bkh-chip chip-success"><i class="fas fa-check"></i> {{ stats.success_backup_count }} 成功</span>
                  <span v-if="stats && stats.failure_backup_count" class="bkh-chip chip-fail"><i class="fas fa-times"></i> {{ stats.failure_backup_count }} 失败</span>
                </span>
              </h3>
            </div>
            <a class="archive-btn" :href="ARCHIVE_URL" target="_blank" rel="noopener">
              <i class="fas fa-cloud-download-alt"></i> 存档下载
            </a>
          </div>

          <div class="backups-table-wrapper">
            <table class="backups-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>类型</th>
                  <th>状态</th>
                  <th>备份大小</th>
                  <th>实际大小</th>
                  <th>耗时</th>
                  <th>完成时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in backups" :key="b.id">
                  <td class="td-id">#{{ b.id }}</td>
                  <td><span class="type-badge" :class="typeClass(b.type)"><i class="fas" :class="typeIcon(b.type)"></i> {{ typeLabel(b.type) }}</span></td>
                  <td><span class="status-dot" :class="statusClass(b.status)">{{ statusLabel(b.status) }}</span></td>
                  <td>{{ formatBytes(b.backup_size_bytes) }}</td>
                  <td>{{ formatBytes(b.actual_size_bytes) }}</td>
                  <td>{{ formatDuration(b.duration_seconds) }}</td>
                  <td>{{ formatDate(b.completed_at || b.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="backupTotalPages > 1" class="backups-pagination">
            <button :disabled="backupPage <= 1" @click="loadBackupPage(backupPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span>{{ backupPage }} / {{ backupTotalPages }}</span>
            <button :disabled="backupPage >= backupTotalPages" @click="loadBackupPage(backupPage + 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
/* Hero */
.backup-hero {
  padding: calc(var(--bl-topbar-offset) + 60px) 20px 50px;
  text-align: center;
  background: radial-gradient(circle at center, rgba(52, 199, 89, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
  position: relative;
  overflow: hidden;
}

.hero-content { position: relative; z-index: 2; }

.hero-title {
  font-size: 56px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #1d1d1f 0%, #434344 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--bl-text-secondary);
  margin-top: 12px;
}

/* Container */
.backup-container {
  padding: 40px 20px 60px;
}

.loading-text {
  text-align: center;
  padding: 60px 0;
  font-size: 16px;
  color: var(--bl-text-secondary);
}

.backup-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 24px;
}

/* Row 1 Overview Card */
.overview-card {
  display: flex;
  gap: 32px;
  background: var(--bl-surface-strong);
  border-radius: var(--bl-radius-lg);
  box-shadow: var(--bl-shadow-soft);
  border: 1px solid var(--bl-border);
  padding: 32px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--bl-shadow-card);
}

.overview-left {
  flex: 1;
  min-width: 0;
}

.ov-intro h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ov-intro h2 i { color: var(--bl-green); }

.ov-intro p {
  font-size: 15px;
  line-height: 1.7;
  color: var(--bl-text-secondary);
  margin: 0 0 12px;
}

.ov-powered {
  font-size: 13px;
  color: var(--bl-text-tertiary);
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 20px;
}

.ov-powered a {
  color: var(--bl-accent);
  text-decoration: none;
  font-weight: 600;
}

.ov-powered a:hover { text-decoration: underline; }

.ov-intro strong { color: var(--bl-text); }
.ov-intro em { font-style: normal; color: var(--bl-accent); font-weight: 700; }

/* Current task */
.current-task-bar {
  background: var(--bl-surface-muted);
  border-radius: var(--bl-radius-sm);
  padding: 16px 20px;
}

.idle-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--bl-green);
  font-weight: 600;
  font-size: 14px;
}

.task-bar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.task-bar-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;
}

.task-bar-type {
  font-size: 14px;
  color: var(--bl-text-secondary);
}

.task-progress-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.task-progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 99px;
  overflow: hidden;
}

.task-progress-fill {
  height: 100%;
  background: var(--bl-accent);
  border-radius: 99px;
  transition: width 0.5s ease;
}

.task-progress-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--bl-accent);
  min-width: 36px;
  text-align: right;
}

.task-bar-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--bl-text-tertiary);
}

/* DR Score */
.overview-right {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dr-score-ring {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

.ring-svg {
  width: 100%;
  height: 100%;
}

.ring-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-score {
  font-size: 32px;
  font-weight: 800;
  color: var(--dr-color);
  line-height: 1;
}

.ring-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--bl-text-secondary);
  margin-top: 2px;
}

.dr-details {
  width: 100%;
}

.dr-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.dr-detail-name {
  font-size: 13px;
  color: var(--bl-text-secondary);
  width: 72px;
  flex-shrink: 0;
}

.dr-detail-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f2;
  border-radius: 99px;
  overflow: hidden;
}

.dr-detail-bar > div {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s ease;
}

.dr-detail-val {
  font-size: 13px;
  font-weight: 600;
  width: 28px;
  text-align: right;
}

.dr-deductions {
  margin-top: 12px;
  width: 100%;
}

.deduction-item {
  font-size: 12px;
  color: var(--bl-warning);
  margin: 4px 0;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.deduction-item i {
  flex-shrink: 0;
  margin-top: 2px;
}

/* Row 2 Policies */
.policies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.policy-card {
  background: var(--bl-surface-strong);
  border-radius: var(--bl-radius-lg);
  box-shadow: var(--bl-shadow-soft);
  border: 1px solid var(--bl-border);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.policy-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--bl-shadow-card);
}

.policy-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
}

.policy-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--bl-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.policy-icon-wrap.icon-active {
  background: rgba(0, 113, 227, 0.1);
  color: var(--bl-accent);
}

.policy-icon-wrap.icon-active.icon-cold {
  background: rgba(88, 86, 214, 0.1);
  color: #5856d6;
}

.policy-icon-wrap.icon-active.icon-rolling {
  background: rgba(50, 173, 230, 0.1);
  color: #32ade6;
}

.policy-icon-wrap.icon-disabled {
  background: rgba(142, 142, 147, 0.1);
  color: #8e8e93;
}

.policy-title-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.policy-name {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.policy-type-tag {
  font-size: 12px;
  color: var(--bl-text-tertiary);
  font-weight: 500;
}

.policy-badge {
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.badge-on { background: rgba(52, 199, 89, 0.12); color: #34c759; }
.badge-off { background: rgba(142, 142, 147, 0.12); color: #8e8e93; }

.policy-body {
  padding: 0 20px 16px;
  flex: 1;
}

.policy-kv-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.policy-kv {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kv-icon {
  width: 24px;
  text-align: center;
  color: var(--bl-text-tertiary);
  font-size: 12px;
  flex-shrink: 0;
}

.kv-label {
  font-size: 13px;
  color: var(--bl-text-secondary);
  width: 64px;
  flex-shrink: 0;
}

.kv-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--bl-text);
}

.policy-last-exec {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--bl-border);
  font-size: 13px;
}

.last-exec-label {
  color: var(--bl-text-secondary);
}

.last-exec-time {
  color: var(--bl-text-tertiary);
  margin-left: auto;
}

.policy-latest {
  padding: 16px 20px;
  background: var(--bl-surface-muted);
  border-top: 1px solid var(--bl-border);
}

.latest-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--bl-text-secondary);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.latest-badge i { color: var(--bl-accent); }

.latest-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.latest-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ld-val {
  font-size: 13px;
  font-weight: 600;
}

.ld-label {
  font-size: 11px;
  color: var(--bl-text-tertiary);
}

/* Row 3 Storage & Upcoming */
.row-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.storage-card, .upcoming-card {
  background: var(--bl-surface-strong);
  border-radius: var(--bl-radius-lg);
  box-shadow: var(--bl-shadow-soft);
  border: 1px solid var(--bl-border);
  padding: 24px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.storage-card:hover, .upcoming-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--bl-shadow-card);
}

.storage-card h3, .upcoming-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.storage-card h3 i { color: var(--bl-accent); }
.upcoming-card h3 i { color: var(--bl-purple); }

.storage-metrics {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.storage-metric {
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 16px;
  background: var(--bl-surface-muted);
  border-radius: var(--bl-radius-sm);
}

.storage-number {
  font-size: 22px;
  font-weight: 800;
  color: var(--bl-text);
  margin-bottom: 4px;
}

.storage-label {
  font-size: 13px;
  color: var(--bl-text-secondary);
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.upcoming-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--bl-border);
}

.upcoming-item:last-child {
  border-bottom: none;
}

.upcoming-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upcoming-name {
  font-size: 14px;
  font-weight: 600;
}

.upcoming-type-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(0, 113, 227, 0.08);
  color: var(--bl-accent);
}

.upcoming-type-tag.type-cold {
  background: rgba(88, 86, 214, 0.08);
  color: #5856d6;
}

.upcoming-type-tag.type-rolling {
  background: rgba(50, 173, 230, 0.08);
  color: #32ade6;
}

.upcoming-type-tag i { font-size: 10px; }

.upcoming-time {
  font-size: 13px;
  color: var(--bl-text-secondary);
}

.empty-hint {
  text-align: center;
  color: var(--bl-text-tertiary);
  font-size: 14px;
  padding: 24px 0;
}

/* Row 4 Backups List */
.backups-list-card {
  background: var(--bl-surface-strong);
  border-radius: var(--bl-radius-lg);
  box-shadow: var(--bl-shadow-soft);
  border: 1px solid var(--bl-border);
  overflow: hidden;
}

.backups-header-v2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.bkh-left {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.bkh-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bkh-title i { color: var(--bl-accent); }

.bkh-chips {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-left: 6px;
}

.bkh-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  background: rgba(0, 113, 227, 0.08);
  color: #0071e3;
  border: 1px solid rgba(0, 113, 227, 0.15);
  line-height: 1.6;
  white-space: nowrap;
}

.bkh-chip i { font-size: 10px; }

.bkh-chip.chip-success {
  background: rgba(52, 199, 89, 0.08);
  color: #2da44e;
  border-color: rgba(52, 199, 89, 0.15);
}

.bkh-chip.chip-success i { color: #2da44e; }

.bkh-chip.chip-fail {
  background: rgba(239, 68, 68, 0.08);
  color: #dc3545;
  border-color: rgba(239, 68, 68, 0.15);
}

.bkh-chip.chip-fail i { color: #dc3545; }

.archive-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--bl-text);
  color: white;
  border-radius: 99px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.archive-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.backups-table-wrapper {
  overflow-x: auto;
}

.backups-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.backups-table th {
  text-align: left;
  padding: 12px 16px 12px 24px;
  font-size: 12px;
  font-weight: 600;
  color: var(--bl-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--bl-border);
  white-space: nowrap;
}

.backups-table td {
  padding: 12px 16px 12px 24px;
  border-bottom: 1px solid var(--bl-border);
  white-space: nowrap;
}

.backups-table tbody tr:last-child td {
  border-bottom: none;
  padding-bottom: 20px;
}

.backups-table tbody tr:hover {
  background: var(--bl-surface-muted);
}

.td-id {
  font-weight: 600;
  color: var(--bl-text-secondary);
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.6;
  vertical-align: middle;
  background: var(--bl-surface-muted);
  color: var(--bl-text-secondary);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.type-badge i {
  font-size: 10px;
  line-height: 1;
}

.type-badge.type-cold {
  background: rgba(88, 86, 214, 0.08);
  color: #5856d6;
  border-color: rgba(88, 86, 214, 0.15);
}

.type-badge.type-rolling {
  background: rgba(50, 173, 230, 0.08);
  color: #32ade6;
  border-color: rgba(50, 173, 230, 0.15);
}

/* Status */
.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;
}

.status-success { background: rgba(52, 199, 89, 0.12); color: #34c759; }
.status-danger { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
.status-running { background: rgba(0, 113, 227, 0.12); color: #0071e3; }
.status-default { background: rgba(142, 142, 147, 0.12); color: #8e8e93; }

/* Pagination */
.backups-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
}

.backups-pagination button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bl-surface-muted);
  color: var(--bl-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
}

.backups-pagination button:hover:not(:disabled) {
  background: var(--bl-accent);
  color: white;
}

.backups-pagination button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.backups-pagination span {
  font-size: 14px;
  font-weight: 600;
  color: var(--bl-text-secondary);
}

/* Responsive */
@media (max-width: 900px) {
  .overview-card { flex-direction: column; }
  .overview-right { width: 100%; }
  .row-two-col { grid-template-columns: 1fr; }
  .policies-grid { grid-template-columns: 1fr; }
  .bkh-left { width: 100%; }
}

@media (max-width: 600px) {
  .hero-title { font-size: 36px; }
  .storage-metrics { flex-direction: column; }
  .latest-detail-grid { grid-template-columns: 1fr; }
}
</style>
