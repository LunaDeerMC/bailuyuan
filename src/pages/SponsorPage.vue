<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import BaseModal from '../components/base/BaseModal.vue';
import EmptyState from '../components/base/EmptyState.vue';

const sponsors = ref([]);
const grandTotal = ref(0);
const animatedTotal = ref(0);
const searchQuery = ref('');
const projectFilter = ref('all');
const modalOpen = ref(false);

const isMobile = ref(false);
const qrLoaded = ref(false);
const activePaymentChannel = ref('alipay');

const alipayQrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fqr.alipay.com%2F2cz0344fnaulnbybhp04';
const alipayLink = 'https://qr.alipay.com/2cz0344fnaulnbybhp04';
const wechatQrImageUrl = 'https://img.lunadeer.cn/i/2026/03/25/69c3ef5fa7c36.jpg';

function detectMobileSponsorView() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || '';
  const matchesMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const matchesMobileViewport = window.matchMedia('(max-width: 767.98px)').matches || window.innerWidth < 768;

  return matchesMobileUserAgent || matchesMobileViewport;
}

function updateMobileState() {
  isMobile.value = detectMobileSponsorView();
}

onMounted(() => {
  updateMobileState();
  window.addEventListener('resize', updateMobileState);
  window.addEventListener('orientationchange', updateMobileState);

  fetch('/data/sponsors.txt')
    .then(r => r.text())
    .then(text => {
      const parsed = parseSponsors(text);
      let total = 0;
      parsed.forEach(item => { total += item.amount; });
      grandTotal.value = total;
      sponsors.value = [...parsed].reverse(); // newest first
      animateTotal(total);
    });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMobileState);
  window.removeEventListener('orientationchange', updateMobileState);
});

watch(modalOpen, (open) => {
  if (open) {
    activePaymentChannel.value = 'alipay';
    updateMobileState();
    return;
  }

  qrLoaded.value = false;
});

function setPaymentChannel(channel) {
  if (channel === activePaymentChannel.value) {
    return;
  }

  activePaymentChannel.value = channel;

  if (channel === 'alipay') {
    qrLoaded.value = false;
  }
}

function parseSponsors(text) {
  if (!text) return [];
  const result = [];
  text.trim().split('\n').forEach(line => {
    const parts = line.split(',');
    if (parts.length < 3) return;
    const name = parts[0].trim();
    const project = parts[1].trim();
    const amount = parseFloat(parts[2].trim().replace('￥', ''));
    const date = parts[3] ? parts[3].trim() : '';
    if (!isNaN(amount)) result.push({ name, project, amount, date });
  });
  return result;
}

function animateTotal(end) {
  const duration = 2000;
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart
    animatedTotal.value = Math.floor(ease * end);
    if (progress < 1) requestAnimationFrame(step);
    else animatedTotal.value = end;
  }
  requestAnimationFrame(step);
}

// Unique projects for filters
const projectOptions = computed(() => {
  const set = new Set();
  sponsors.value.forEach(s => { if (s.project) set.add(s.project); });
  return Array.from(set);
});

const filtered = computed(() => {
  return sponsors.value.filter(item => {
    const matchProject = projectFilter.value === 'all' || item.project === projectFilter.value;
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch = !q || item.name.toLowerCase().includes(q);
    return matchProject && matchSearch;
  });
});

function formatAmount(n) {
  return '¥' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function setProject(p) {
  projectFilter.value = p;
}
</script>

<template>
  <!-- Hero -->
  <section class="sponsor-hero">
    <h1>感谢每一位支持者</h1>
    <div class="total-donations">
      <span class="counter-label">累计获得赞助</span>
      <span class="counter-value">¥{{ animatedTotal.toLocaleString('en-US') }}</span>
    </div>
    <p class="hero-subtitle">因为有你们，白鹿原才能走得更远。</p>
  </section>

  <main class="sponsor-container">
    <!-- Controls -->
    <div class="controls-section">
      <h2 class="section-title sponsor-list-title">❤️ 赞助列表</h2>
      <div class="controls-header">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索赞助者姓名..."
          >
        </div>
        <button class="cta-button outline" @click="modalOpen = true">
          <i class="fas fa-heart"></i> 我要支持
        </button>
      </div>
      <div class="filter-tags">
        <button
          :class="['filter-tag', { active: projectFilter === 'all' }]"
          @click="setProject('all')"
        >全部</button>
        <button
          v-for="proj in projectOptions"
          :key="proj"
          :class="['filter-tag', { active: projectFilter === proj }]"
          @click="setProject(proj)"
        >{{ proj }}</button>
      </div>
    </div>

    <!-- Donation Grid -->
    <div v-if="filtered.length" class="donation-grid">
      <div
        v-for="(item, idx) in filtered"
        :key="idx"
        class="donation-card"
        :style="{ animationDelay: Math.min(idx * 0.05, 1) + 's' }"
      >
        <div class="donation-header">
          <div class="donor-info">
            <img
              :src="`https://minotar.net/helm/${item.name}/64.png`"
              class="mini-avatar"
              :alt="item.name"
              loading="lazy"
              @error="($event.target).src = 'https://minotar.net/helm/MHF_Steve/64.png'"
            >
            <div class="donor-name">{{ item.name }}</div>
          </div>
          <div class="donation-amount">¥{{ item.amount }}</div>
        </div>
        <div class="donation-card-body">
          <div class="donation-purpose">{{ item.project }}</div>
          <div class="donation-date">
            <i class="far fa-clock donation-date-icon"></i>{{ item.date }}
          </div>
        </div>
      </div>
    </div>

    <EmptyState v-else title="暂无记录" description="没有找到匹配的赞助记录。" />

    <!-- Sponsor Modal -->
    <BaseModal :model-value="modalOpen" width="480px" @update:model-value="modalOpen = $event">
      <template #header>
        <div class="modal-gift-icon">
          <i class="fas fa-gift"></i>
        </div>
        <h3 class="modal-title">支持白鹿原服务器</h3>
        <p class="modal-subtitle">您的每一次支持，都将帮助我们提升服务器性能，维持更长久的运营。</p>

        <div class="payment-switcher-wrap">
          <div class="payment-switcher" role="tablist" aria-label="选择赞助方式">
            <button
              type="button"
              :class="['payment-switcher-btn', 'payment-switcher-btn-alipay', { active: activePaymentChannel === 'alipay' }]"
              :aria-selected="activePaymentChannel === 'alipay'"
              @click="setPaymentChannel('alipay')"
            >支付宝</button>
            <button
              type="button"
              :class="['payment-switcher-btn', 'payment-switcher-btn-wechat', { active: activePaymentChannel === 'wechat' }]"
              :aria-selected="activePaymentChannel === 'wechat'"
              @click="setPaymentChannel('wechat')"
            >微信</button>
          </div>
        </div>
      </template>

      <!-- Desktop QR -->
      <div v-if="!isMobile" class="desktop-qr-view">
        <section v-if="activePaymentChannel === 'alipay'" class="payment-channel-card">
          <!-- <h4 class="payment-channel-title">支付宝</h4> -->
          <div class="qr-placeholder">
            <div v-if="!qrLoaded" class="qr-loading">
              <i class="fas fa-spinner fa-spin"></i>
              <span>加载中…</span>
            </div>
            <img
              :src="alipayQrUrl"
              alt="支付宝二维码"
              class="qr-img"
              :style="{ display: qrLoaded ? 'block' : 'none' }"
              @load="qrLoaded = true"
            >
          </div>
          <p class="desktop-qr-hint">推荐使用支付宝扫码</p>
        </section>

        <section v-else class="payment-channel-card">
          <!-- <h4 class="payment-channel-title">微信</h4> -->
          <div class="qr-placeholder">
            <img
              :src="wechatQrImageUrl"
              alt="微信赞助二维码"
              class="qr-img"
            >
          </div>
          <p class="desktop-qr-hint">使用微信扫码赞助</p>
        </section>
      </div>

      <!-- Mobile Button -->
      <div v-else class="mobile-btn-view">
        <template v-if="activePaymentChannel === 'alipay'">
          <a
            :href="alipayLink"
            class="alipay-btn"
            target="_blank"
            rel="noopener"
          >
            <i class="fab fa-alipay"></i> 打开支付宝赞助
          </a>
          <p class="mobile-pay-hint">点击按钮将直接跳转至支付宝转账页面</p>
        </template>

        <section v-else class="mobile-wechat-channel">
          <div class="qr-placeholder wechat-qr-placeholder">
            <img
              :src="wechatQrImageUrl"
              alt="微信赞助二维码"
              class="qr-img"
            >
          </div>
          <p class="mobile-pay-hint">截图前往微信扫一扫，选择相册中的二维码进行赞助</p>
        </section>
      </div>
    </BaseModal>
  </main>
</template>

<style scoped>
/* Hero */
.sponsor-hero {
  padding: calc(var(--bl-topbar-offset) + 60px) 20px 50px;
  text-align: center;
  background: radial-gradient(circle at center, rgba(0,113,227,0.08) 0%, rgba(255,255,255,0) 70%);
  position: relative;
  overflow: hidden;
}

.sponsor-hero h1 {
  font-size: 56px;
  font-weight: 800;
  margin: 0px;
  background: linear-gradient(135deg, #1d1d1f 0%, #434344 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

.total-donations {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  padding: 20px 40px;
  border-radius: var(--bl-radius-lg);
  box-shadow: 0 10px 40px rgba(0,0,0,0.06);
  border: 1px solid rgba(255,255,255,0.6);
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.total-donations:hover {
  transform: translateY(-5px);
}

.counter-label {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bl-text-secondary);
  margin-bottom: 8px;
  font-weight: 600;
}

.counter-value {
  font-size: 42px;
  font-weight: 800;
  color: #34c759;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--bl-text-secondary);
  margin-top: 16px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Container */
.sponsor-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Controls */
.controls-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 30px;
  text-align: center;
}

.sponsor-list-title {
  margin-bottom: 10px;
}

.controls-header {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  flex-grow: 0;
  width: 100%;
  max-width: 320px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--bl-text-secondary);
}

.search-box input {
  width: 100%;
  height: 48px;
  padding: 0 20px 0 44px;
  border-radius: 99px;
  border: 1px solid var(--bl-border-strong);
  background: var(--bl-surface-strong);
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
  color: var(--bl-text);
  font-family: inherit;
  box-sizing: border-box;
}

.search-box input:focus {
  border-color: var(--bl-accent);
  box-shadow: 0 0 0 3px var(--bl-focus-ring);
}

.cta-button {
  height: 48px;
  padding: 0 24px;
  background-color: var(--bl-text);
  color: white;
  border-radius: 99px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  box-sizing: border-box;
  font-family: inherit;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.cta-button.outline {
  background-color: var(--bl-surface-frost);
  color: var(--bl-text);
  border: 1px solid var(--bl-border-strong);
}

.cta-button.outline:hover {
  border-color: var(--bl-accent);
  background-color: var(--bl-accent-soft);
  color: var(--bl-accent-strong);
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.filter-tag {
  padding: 8px 16px;
  border-radius: 99px;
  border: 1px solid var(--bl-border);
  background: var(--bl-control-bg);
  color: var(--bl-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  font-family: inherit;
}

.filter-tag:hover {
  transform: translateY(-1px);
  background: var(--bl-control-hover-bg);
  border-color: var(--bl-border-strong);
}

.filter-tag.active {
  background: var(--bl-control-active-bg);
  color: var(--bl-control-active-color);
  border-color: var(--bl-control-active-border);
  box-shadow: var(--bl-control-active-shadow);
}

/* Donation Grid */
.donation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.donation-card {
  background: var(--bl-surface-strong);
  padding: 24px;
  border-radius: var(--bl-radius-lg);
  transition: var(--bl-transition);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--bl-border);
  animation: fadeInUp 0.5s ease both;
}

.donation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border-color: transparent;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.donation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.donor-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bl-surface-muted);
}

.donor-name {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}

.donation-amount {
  color: #34c759;
  font-weight: 800;
  font-size: 18px;
  background: rgba(52, 199, 89, 0.1);
  padding: 4px 10px;
  border-radius: 8px;
}

.donation-card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.donation-purpose {
  font-size: 13px;
  color: var(--bl-text);
  background: var(--bl-surface-strong);
  padding: 6px 12px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 12px;
  align-self: flex-start;
}

.donation-date {
  font-size: 12px;
  color: var(--bl-text-tertiary);
  text-align: right;
  margin-top: auto;
  border-top: 1px solid var(--bl-border);
  padding-top: 12px;
}

.donation-date-icon {
  margin-right: 4px;
}

/* Modal */
.modal-gift-icon {
  width: 50px;
  height: 50px;
  background: rgba(52, 199, 89, 0.1);
  border-radius: 50%;
  color: #34c759;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 20px;
}

.modal-gift-icon i {
  font-size: 24px;
  color: #34c759;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 8px;
}

.modal-subtitle {
  font-size: 15px;
  color: var(--bl-text-secondary);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.payment-switcher-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 24px;
}

.payment-switcher {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  min-width: 236px;
  padding: 5px;
  gap: 6px;
  background: linear-gradient(180deg, rgba(247, 247, 249, 0.98) 0%, rgba(239, 240, 244, 0.98) 100%);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 10px 24px rgba(15, 23, 42, 0.08);
}

.payment-switcher-btn {
  border: none;
  background: transparent;
  color: var(--bl-text-secondary);
  min-width: 108px;
  padding: 11px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease;
  font-family: inherit;
  justify-content: center;
  display: inline-flex;
  align-items: center;
}

.payment-switcher-btn.active {
  transform: translateY(-1px);
  color: #fff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
}

.payment-switcher-btn-alipay.active {
  background: linear-gradient(135deg, #1d8cff 0%, #1677ff 100%);
}

.payment-switcher-btn-wechat.active {
  background: linear-gradient(135deg, #4fd36a 0%, #2dbb49 100%);
}

.payment-switcher-btn:not(.active):hover {
  color: var(--bl-text);
  background: rgba(255, 255, 255, 0.72);
}

.desktop-qr-view,
.mobile-btn-view {
  text-align: center;
}

.payment-channel-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.payment-channel-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
  color: var(--bl-text);
}

.qr-placeholder {
  display: inline-block;
  padding: 16px;
  background: var(--bl-surface-strong);
  border-radius: 16px;
  border: 1px solid var(--bl-border);
  min-width: 232px;
  min-height: 232px;
}

.qr-loading {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--bl-text-secondary);
  font-size: 14px;
}

.qr-loading i {
  font-size: 24px;
  color: var(--bl-accent);
}

.qr-img {
  width: 200px;
  height: 200px;
  display: block;
}

.desktop-qr-hint {
  font-size: 13px;
  color: var(--bl-text-secondary);
  margin-top: 12px;
}

.alipay-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  background: #1677ff;
  color: #fff;
  border-radius: 14px;
  text-decoration: none;
  font-size: 17px;
  font-weight: 700;
  transition: var(--bl-transition);
}

.alipay-btn:hover {
  background: #0958d9;
  transform: translateY(-2px);
}

.mobile-pay-hint {
  font-size: 13px;
  color: var(--bl-text-secondary);
  margin-top: 12px;
}

.mobile-wechat-channel {
  margin-top: 8px;
}

.wechat-qr-placeholder {
  margin-top: 4px;
}

@media (max-width: 768px) {
  .sponsor-hero h1 { font-size: 32px; }
  .counter-value { font-size: 32px; }
  .donation-grid { grid-template-columns: 1fr; }
  .controls-header { flex-direction: column; }
  .payment-switcher-wrap { margin-top: 20px; }
}
</style>
