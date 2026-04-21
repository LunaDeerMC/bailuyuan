<script setup>
import { ref, computed, defineAsyncComponent, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import FilterPanel from '../components/shared/FilterPanel.vue';
import EmptyState from '../components/base/EmptyState.vue';
import { fetchAnnouncementsData } from '../composables/useAnnouncementsData.js';
import { useSortableList } from '../composables/useEditorHelpers.js';
import {
  ANNOUNCEMENT_CATEGORY_META,
  ANNOUNCEMENT_OPEN_EVENT,
  generateAnnouncementAnchorId,
} from '../utils/announcements.js';

const EditorModal = defineAsyncComponent(() => import('../components/shared/EditorModal.vue'));
const JsonOutputModal = defineAsyncComponent(() => import('../components/shared/JsonOutputModal.vue'));

const route = useRoute();

const announcements = ref([]);
const searchQuery = ref('');
const categoryFilter = ref('all');
const expandedId = ref(null);
const editMode = ref(false);
const sharedId = ref(null);
const editorOpen = ref(false);
const jsonOutputOpen = ref(false);
const jsonOutputText = ref('');

// Editor form state
const edTitle = ref('');
const edIntro = ref('');
const edTime = ref('');
const edCategory = ref('activity');
const edMarquee = ref(false);
const openSelects = ref({});
const content = useSortableList();
const dragState = ref({ listName: null, fromIdx: null });

// Secret "edit" keyboard shortcut
let secretBuffer = '';
function onSecretKey(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
  secretBuffer += e.key.toLowerCase();
  if (secretBuffer.length > 4) secretBuffer = secretBuffer.slice(-4);
  if (secretBuffer === 'edit') {
    editMode.value = !editMode.value;
    secretBuffer = '';
  }
}

onMounted(() => {
  document.addEventListener('keydown', onSecretKey);
  window.addEventListener(ANNOUNCEMENT_OPEN_EVENT, handleMarqueeOpen);
  fetchAnnouncementsData()
    .then(({ announcements: data }) => {
      const sortedAnnouncements = [...data].sort((a, b) => new Date(b.time) - new Date(a.time));
      announcements.value = sortedAnnouncements;
      // Expand first item by default
      if (sortedAnnouncements.length > 0) {
        expandedId.value = getAnnouncementId(sortedAnnouncements[0]);
      }
      nextTick(() => handleHash());
    })
    .catch((error) => {
      console.error('Error loading announcements:', error);
    });
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onSecretKey);
  window.removeEventListener(ANNOUNCEMENT_OPEN_EVENT, handleMarqueeOpen);
});

watch(
  () => route.hash,
  () => {
    nextTick(() => handleHash());
  }
);

// Hash-based deep linking
function handleHash() {
  const hash = route.hash.replace('#', '');
  if (!hash) return;
  openAnnouncementById(hash);
}

function getAnnouncementId(item) {
  return item?.anchorId || generateAnnouncementAnchorId(item);
}

function openAnnouncementById(anchorId) {
  if (!anchorId) return;

  const match = announcements.value.find(item => getAnnouncementId(item) === anchorId);
  if (!match) return;

  expandedId.value = anchorId;
  nextTick(() => {
    const el = document.getElementById(anchorId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function handleMarqueeOpen(event) {
  const anchorId = typeof event?.detail === 'string' ? event.detail : '';
  openAnnouncementById(anchorId);
}

const categoryEntries = Object.entries(ANNOUNCEMENT_CATEGORY_META);

const categoryOptions = [
  { value: 'all', label: '全部' },
  ...categoryEntries.map(([value, meta]) => ({
    value,
    label: meta.label,
    iconClass: meta.iconClass,
  })),
];

const categoryLabelMap = Object.fromEntries(categoryEntries.map(([value, meta]) => [value, meta.label]));
const categoryIconMap = Object.fromEntries(categoryEntries.map(([value, meta]) => [value, meta.iconClass]));

const filtered = computed(() => {
  return announcements.value.filter(item => {
    const matchCat = categoryFilter.value === 'all' || item.category === categoryFilter.value;
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.intro.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
});

function toggleItem(anchorId) {
  expandedId.value = expandedId.value === anchorId ? null : anchorId;
}

function shareItem(item, event) {
  event.stopPropagation();
  const anchorId = getAnnouncementId(item);
  const url = location.origin + location.pathname + '#' + anchorId;
  navigator.clipboard.writeText(url).then(() => {
    sharedId.value = anchorId;
    setTimeout(() => { sharedId.value = null; }, 2000);
  });
}

function parseBV(input) {
  if (!input) return null;
  const m = input.trim().match(/(BV[A-Za-z0-9]{10,})/);
  return m ? m[1] : null;
}

function onFilterChange({ key, value }) {
  if (key === 'category') categoryFilter.value = value;
}

// ========== Editor ==========

const categorySelectOptions = [
  ...categoryEntries.map(([value, meta]) => ({ value, label: meta.label })),
];

function getSelectLabel(options, value) {
  return options.find(o => o.value === value)?.label || value;
}

function toggleSelect(name) {
  openSelects.value[name] = !openSelects.value[name];
}

function selectOption(name, value) {
  if (name === 'category') edCategory.value = value;
  openSelects.value[name] = false;
}

function closeAllSelects() {
  openSelects.value = {};
}

function openEditor(item) {
  edTitle.value = item ? item.title : '';
  edIntro.value = item ? item.intro : '';
  edTime.value = item ? item.time : new Date().toISOString().slice(0, 10);
  edCategory.value = item?.category || 'activity';
  edMarquee.value = Boolean(item?.marquee);
  content.reset(item?.content || []);
  openSelects.value = {};
  editorOpen.value = true;
}

function onDragStart(listName, idx, e) {
  dragState.value = { listName, fromIdx: idx };
  e.target.closest('.sortable-item').classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function onDragEnter(listName, idx, e) {
  if (dragState.value.listName === listName) {
    e.target.closest('.sortable-item')?.classList.add('drag-over');
  }
}

function onDragLeave(e) {
  e.target.closest('.sortable-item')?.classList.remove('drag-over');
}

function onDrop(listName, toIdx, e) {
  e.preventDefault();
  e.target.closest('.sortable-item')?.classList.remove('drag-over');
  if (dragState.value.listName !== listName) return;
  content.moveItem(dragState.value.fromIdx, toIdx);
}

function onDragEnd(e) {
  document.querySelectorAll('.sortable-item').forEach(el => el.classList.remove('dragging', 'drag-over'));
  dragState.value = { listName: null, fromIdx: null };
}

function generateJson() {
  if (!edTitle.value.trim()) {
    alert('请填写公告标题');
    return;
  }
  const obj = {
    title: edTitle.value.trim(),
    intro: edIntro.value.trim(),
    time: edTime.value,
    category: edCategory.value,
    marquee: edMarquee.value,
    content: content.getCleanItems().map(i => i.type === 'video' ? { type: 'video', content: parseBV(i.content) || i.content } : i),
  };
  jsonOutputText.value = JSON.stringify(obj, null, 4);
  jsonOutputOpen.value = true;
}
</script>

<template>
  <!-- Page Hero -->
  <section class="page-hero announcements-hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1 class="hero-title">活动公告</h1>
      <p class="hero-subtitle">了解服务器最新动态、活动安排与维护通知</p>
    </div>
  </section>

  <main class="announcements-container bl-shell">
    <!-- Controls -->
    <FilterPanel
      title="公告列表"
      :search-value="searchQuery"
      search-placeholder="搜索标题或简介..."
      :filters="[
        { key: 'category', label: '分类', labelIcon: 'fas fa-tag', options: categoryOptions, modelValue: categoryFilter },
      ]"
      :action-label="editMode ? '新增公告' : ''"
      @update:search-value="searchQuery = $event"
      @change-filter="onFilterChange"
      @action="openEditor(null)"
    />

    <!-- Timeline -->
    <div v-if="filtered.length" class="timeline">
      <div
        v-for="(item, index) in filtered"
        :key="getAnnouncementId(item)"
        :id="getAnnouncementId(item)"
        :class="['timeline-item', `category-${item.category}`]"
      >
        <div :class="['announcement-card', { expanded: expandedId === getAnnouncementId(item) }]">
          <!-- Summary -->
          <button type="button" class="card-summary" @click="toggleItem(getAnnouncementId(item))">
            <div class="card-summary-main">
              <div class="card-summary-top">
                <span :class="['category-badge', 'badge-' + item.category]">
                  <i :class="categoryIconMap[item.category]"></i>
                  {{ categoryLabelMap[item.category] || item.category }}
                </span>
                <h3 class="announcement-title">{{ item.title }}</h3>
              </div>
              <p class="announcement-intro">{{ item.intro }}</p>
            </div>
            <span class="card-summary-time"><i class="far fa-clock"></i> {{ item.time }}</span>
            <span class="expand-icon">▾</span>
          </button>

          <!-- Detail -->
          <div class="card-detail">
            <div class="detail-content">
              <template v-for="(block, bi) in item.content" :key="bi">
                <p v-if="block.type === 'text'">{{ block.content }}</p>
                <img v-else-if="block.type === 'image'" :src="block.content" loading="lazy" alt="">
                <div v-else-if="block.type === 'video' && parseBV(block.content)" class="video-embed-wrapper">
                  <iframe
                    :src="`https://player.bilibili.com/player.html?bvid=${parseBV(block.content)}&autoplay=0&high_quality=1`"
                    allowfullscreen
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    loading="lazy"
                  ></iframe>
                </div>
              </template>
            </div>
            <div class="detail-action-btn-row">
              <button
                type="button"
                :class="['btn-share', { shared: sharedId === getAnnouncementId(item) }]"
                @click="shareItem(item, $event)"
              >
                <template v-if="sharedId === getAnnouncementId(item)">✓ 已复制链接</template><template v-else><i class="fas fa-share-alt"></i> 分享</template>
              </button>
              <button v-if="editMode" type="button" class="btn-edit" @click.stop="openEditor(item)">
                <i class="fas fa-pen"></i> 编辑
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <EmptyState v-else title="暂无公告" description="当前没有匹配的公告内容。" />

    <!-- Editor Modal -->
    <EditorModal v-model="editorOpen" title="公告编辑器" icon="fas fa-bullhorn">
      <template #preview>
        <div class="preview-card">
          <div class="preview-header">
            <div class="preview-title">{{ edTitle || '未命名公告' }}</div>
            <div class="preview-meta-row">
              <span :class="['category-badge', 'badge-' + edCategory]">
                <i :class="categoryIconMap[edCategory]"></i>
                {{ categoryLabelMap[edCategory] }}
              </span>
              <span v-if="edMarquee" class="preview-marquee-flag"><i class="fas fa-bullhorn"></i> 横幅展示</span>
              <span class="preview-time"><i class="far fa-clock"></i> {{ edTime || '未设置时间' }}</span>
            </div>
          </div>
          <div class="preview-body">
            <p class="preview-intro">{{ edIntro || '暂无简介' }}</p>
            <div class="content-blocks" v-if="content.items.value.length">
              <template v-for="(block, bi) in content.items.value" :key="bi">
                <p v-if="block.type === 'text'">{{ block.content || '空文字' }}</p>
                <img v-else-if="block.type === 'image' && block.content" :src="block.content" loading="lazy" alt="">
                <p v-else-if="block.type === 'image'" class="preview-text-secondary">空图片</p>
                <div v-else-if="block.type === 'video' && parseBV(block.content)" class="video-embed-wrapper">
                  <iframe :src="`https://player.bilibili.com/player.html?bvid=${parseBV(block.content)}&autoplay=0&high_quality=1`" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups" loading="lazy"></iframe>
                </div>
                <p v-else-if="block.type === 'video'" class="preview-text-secondary">请输入有效的 BV 号或 bilibili 视频地址</p>
              </template>
            </div>
            <p v-else>无</p>
          </div>
        </div>
      </template>

      <template #form>
        <div @click="closeAllSelects">
          <div class="form-group">
            <label>公告标题</label>
            <input type="text" v-model="edTitle" placeholder="输入公告标题...">
          </div>
          <div class="form-group">
            <label>简介</label>
            <textarea v-model="edIntro" placeholder="输入简介..." rows="2"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>时间</label>
              <input type="date" v-model="edTime">
            </div>
            <div class="form-group">
              <label>类别</label>
              <div :class="['custom-select', { open: openSelects.category }]" @click.stop>
                <div class="custom-select-trigger" @click="toggleSelect('category')">
                  <span>{{ getSelectLabel(categorySelectOptions, edCategory) }}</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                <div class="custom-select-options">
                  <div v-for="opt in categorySelectOptions" :key="opt.value" :class="['custom-option', { selected: edCategory === opt.value }]" @click="selectOption('category', opt.value)">{{ opt.label }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="marquee-toggle">
              <input type="checkbox" v-model="edMarquee">
              <span>在导航栏下滚动横幅展示此公告</span>
            </label>
          </div>
          <div class="form-group">
            <label>正文内容</label>
            <div class="sortable-list">
              <div v-for="(item, idx) in content.items.value" :key="idx" class="sortable-item" draggable="true" @dragstart="onDragStart('content', idx, $event)" @dragover="onDragOver" @dragenter="onDragEnter('content', idx, $event)" @dragleave="onDragLeave" @drop="onDrop('content', idx, $event)" @dragend="onDragEnd">
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <span :class="['item-type-badge', 'badge-' + item.type]">{{ item.type === 'text' ? '文字' : item.type === 'image' ? '图片' : '视频' }}</span>
                <textarea v-if="item.type === 'text'" class="item-content" rows="2" placeholder="输入文字内容..." :value="item.content" @input="content.updateContent(idx, $event.target.value)"></textarea>
                <input v-else-if="item.type === 'image'" type="text" class="item-content" placeholder="输入图片URL..." :value="item.content" @input="content.updateContent(idx, $event.target.value)">
                <input v-else type="text" class="item-content" placeholder="BV1xxxxxxxxxx 或 bilibili 视频地址" :value="item.content" @input="content.updateContent(idx, $event.target.value)">
                <button type="button" class="remove-item-btn" @click="content.removeItem(idx)"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
            <div class="add-item-row">
              <button type="button" class="add-item-btn" @click="content.addItem('text')"><i class="fas fa-plus"></i> 添加文字</button>
              <button type="button" class="add-item-btn" @click="content.addItem('image')"><i class="fas fa-image"></i> 添加图片</button>
              <button type="button" class="add-item-btn" @click="content.addItem('video')"><i class="fas fa-video"></i> 添加视频</button>
            </div>
          </div>
          <div class="editor-actions">
            <button type="button" class="btn-generate-json" @click="generateJson"><i class="fas fa-save"></i> 生成 JSON</button>
          </div>
        </div>
      </template>
    </EditorModal>

    <JsonOutputModal v-model="jsonOutputOpen" :json-text="jsonOutputText" />
  </main>
</template>

<style scoped>
@import '../styles/editor-form.css';

.announcements-hero {
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
  letter-spacing: -0.005em;
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

.announcements-container {
  max-width: 900px;
  padding: 40px 20px;
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 32px;
  margin-top: 40px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--bl-accent), rgba(0, 113, 227, 0.1));
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -32px;
  top: 28px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bl-surface-strong);
  border: 3px solid var(--bl-accent);
  z-index: 1;
}

.timeline-item.category-activity::before {
  border-color: var(--bl-green);
}

.timeline-item.category-maintenance::before {
  border-color: var(--bl-warning);
}

.timeline-item.category-other::before {
  border-color: var(--bl-purple);
}

/* Announcement Card */
.announcement-card {
  background: var(--bl-surface-strong);
  border-radius: var(--bl-radius-lg);
  box-shadow: var(--bl-shadow-soft);
  border: 1px solid var(--bl-border);
  overflow: hidden;
  transition: var(--bl-transition);
  cursor: pointer;
}

.announcement-card:hover {
  box-shadow: var(--bl-shadow-card);
  transform: translateY(-2px);
}

.announcement-card.expanded {
  cursor: default;
  transform: none;
  box-shadow: var(--bl-shadow-card);
  border-color: var(--bl-border-strong);
}

.card-summary {
  width: 100%;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: transparent;
  border: none;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
}

.announcement-card.expanded .card-summary {
  border-bottom: 1px solid var(--bl-border);
  background: linear-gradient(to bottom, var(--bl-surface-hover), var(--bl-surface-subtle));
}

.card-summary-main {
  flex: 1;
  min-width: 0;
}

.card-summary-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.announcement-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--bl-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.announcement-card.expanded .announcement-title {
  white-space: normal;
  overflow: visible;
}

.announcement-intro {
  font-size: 14px;
  color: var(--bl-text-secondary);
  margin: 4px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.announcement-card.expanded .announcement-intro {
  white-space: normal;
  overflow: visible;
}

.card-summary-time {
  font-size: 13px;
  color: var(--bl-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Category Badge */
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge-activity {
  background: var(--bl-badge-success-bg);
  color: var(--bl-badge-success-text);
}

.badge-maintenance {
  background: var(--bl-badge-warning-bg);
  color: var(--bl-badge-warning-text);
}

.badge-other {
  background: var(--bl-badge-purple-bg);
  color: var(--bl-badge-purple-text);
}

.expand-icon {
  color: var(--bl-text-secondary);
  font-size: 14px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  opacity: 0.4;
}

.announcement-card.expanded .expand-icon {
  transform: rotate(180deg);
  opacity: 0.6;
}

/* Detail */
.card-detail {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.45s cubic-bezier(0.25, 1, 0.5, 1), padding 0.35s ease;
  padding: 0 28px;
}

.announcement-card.expanded .card-detail {
  max-height: 2000px;
  padding: 28px 28px 32px;
}

.detail-content {
  line-height: 1.8;
  font-size: 15px;
  color: var(--bl-text);
}

.detail-content p {
  margin: 0 0 14px;
}

.detail-content p:last-child {
  margin-bottom: 0;
}

.detail-content img {
  max-width: 100%;
  border-radius: 12px;
  margin: 12px 0 16px;
  border: 1px solid var(--bl-border);
  box-shadow: var(--bl-shadow-soft);
}

.video-embed-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  margin: 12px 0 16px;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.video-embed-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.detail-action-btn-row {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--bl-border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-share {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: transparent;
  color: var(--bl-text-secondary);
  border: 1.5px solid var(--bl-border-strong);
  border-radius: 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--bl-transition);
}

.btn-share:hover {
  color: var(--bl-accent);
  border-color: var(--bl-accent);
  background: var(--bl-accent-soft-muted);
}

.btn-share.shared {
  color: var(--bl-badge-success-text);
  border-color: #34c759;
  background: var(--bl-badge-success-bg);
}

.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: transparent;
  color: var(--bl-accent);
  border: 1.5px solid var(--bl-accent);
  border-radius: 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--bl-transition);
}

.btn-edit:hover {
  background: var(--bl-accent);
  color: #fff;
}

.marquee-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bl-text);
  cursor: pointer;
}

.marquee-toggle input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--bl-accent);
}

.preview-marquee-flag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--bl-accent);
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 20px;
  }

  .card-summary {
    flex-wrap: wrap;
    padding: 18px 20px;
  }

  .card-summary-time {
    width: 100%;
    margin-top: 4px;
  }

  .card-detail {
    padding-left: 20px;
    padding-right: 20px;
  }

  .announcement-card.expanded .card-detail {
    padding: 20px;
  }
}

/* Editor-specific */
.preview-meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.preview-time {
  font-size: 13px;
  color: var(--bl-text-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
}

.content-blocks {
  background: var(--bl-surface-subtle);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--bl-border);
}

.content-blocks p {
  font-size: 15px;
  margin: 0 0 12px;
  line-height: 1.7;
}

.content-blocks p:last-child {
  margin-bottom: 0;
}

.content-blocks img {
  max-width: 100%;
  border-radius: 12px;
  margin: 12px 0 16px;
  border: 1px solid var(--bl-border);
}
</style>
