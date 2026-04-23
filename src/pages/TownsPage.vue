<script setup>
import { ref, computed, defineAsyncComponent, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import FilterPanel from '../components/shared/FilterPanel.vue';
import BaseBadge from '../components/base/BaseBadge.vue';
import BaseModal from '../components/base/BaseModal.vue';
import ModalSection from '../components/detail/ModalSection.vue';
import EmptyState from '../components/base/EmptyState.vue';
import { useSortableList, useTagsInput } from '../composables/useEditorHelpers.js';

const EditorModal = defineAsyncComponent(() => import('../components/shared/EditorModal.vue'));
const JsonOutputModal = defineAsyncComponent(() => import('../components/shared/JsonOutputModal.vue'));

const route = useRoute();

const DEFAULT_GRADIENT = { from: '#667eea', to: '#764ba2' };

const towns = ref([]);
const searchQuery = ref('');
const scaleFilter = ref('all');
const typeFilter = ref('all');
const recruitFilter = ref('all');
const modalOpen = ref(false);
const selectedTown = ref(null);
const sharedId = ref(null);
const editorOpen = ref(false);
const jsonOutputOpen = ref(false);
const jsonOutputText = ref('');

// Editor form state
const edTitle = ref('');
const edLogo = ref('');
const edGradientFrom = ref('#667eea');
const edGradientTo = ref('#764ba2');
const edScale = ref('small');
const edTownType = ref('building');
const edRecruitment = ref('welcome');
const edDimension = ref('overworld');
const edSecret = ref(false);
const edX = ref('');
const edY = ref('');
const edZ = ref('');
const openSelects = ref({});
const founders = useTagsInput();
const members = useTagsInput();
const introduction = useSortableList();
const dragState = ref({ listName: null, fromIdx: null });

onMounted(() => {
  fetch('/data/towns.json')
    .then(r => r.json())
    .then(data => {
      towns.value = data;
      nextTick(() => handleHash());
    });
});

function handleHash() {
  const hash = route.hash.replace('#', '');
  if (!hash) return;
  const match = towns.value.find(item => generateId(item) === hash);
  if (match) openModal(match);
}

function generateId(item) {
  const raw = item.title || '';
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = ((h << 5) - h) + raw.charCodeAt(i);
    h |= 0;
  }
  return 't' + Math.abs(h).toString(36);
}

// Filter options
const scaleOptions = [
  { value: 'all', label: '全部' },
  { value: 'small', label: '小型', iconClass: 'fas fa-user' },
  { value: 'medium', label: '中型', iconClass: 'fas fa-users' },
  { value: 'large', label: '大型', iconClass: 'fas fa-city' },
];

const typeOptions = [
  { value: 'all', label: '全部' },
  { value: 'building', label: '建筑', iconClass: 'fas fa-building' },
  { value: 'adventure', label: '冒险', iconClass: 'fas fa-dragon' },
  { value: 'industry', label: '工业', iconClass: 'fas fa-industry' },
];

const recruitOptions = [
  { value: 'all', label: '全部' },
  { value: 'welcome', label: '欢迎加入', iconClass: 'fas fa-door-open' },
  { value: 'maybe', label: '可以考虑', iconClass: 'fas fa-question-circle' },
  { value: 'closed', label: '暂不招人', iconClass: 'fas fa-door-closed' },
];

// Maps
const scaleTextMap = { small: '小型（5人以下）', medium: '中型（2-10人）', large: '大型（10人以上）' };
const scaleIconMap = { small: 'fa-user', medium: 'fa-users', large: 'fa-city' };
const typeTextMap = { building: '建筑', adventure: '冒险', industry: '工业' };
const typeIconMap = { building: 'fa-building', adventure: 'fa-dragon', industry: 'fa-industry' };
const recruitTextMap = { welcome: '欢迎加入', closed: '暂不招人', maybe: '可以考虑' };
const recruitIconMap = { welcome: 'fa-door-open', closed: 'fa-door-closed', maybe: 'fa-question-circle' };
const dimensionTextMap = { overworld: '主世界', nether: '下界', the_end: '末地' };

function getGradient(item) {
  const g = item?.gradient || {};
  const from = /^#[0-9a-fA-F]{6}$/.test((g.from || '').trim()) ? g.from.trim() : DEFAULT_GRADIENT.from;
  const to = /^#[0-9a-fA-F]{6}$/.test((g.to || '').trim()) ? g.to.trim() : DEFAULT_GRADIENT.to;
  return { from, to };
}

function gradientStyle(item) {
  const g = getGradient(item);
  return `linear-gradient(135deg, ${g.from} 0%, ${g.to} 100%)`;
}

const filtered = computed(() => {
  return towns.value.filter(item => {
    const matchScale = scaleFilter.value === 'all' || item.scale === scaleFilter.value;
    const matchType = typeFilter.value === 'all' || item.townType === typeFilter.value;
    const matchRecruit = recruitFilter.value === 'all' || item.recruitment === recruitFilter.value;
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch = !q || item.title.toLowerCase().includes(q);
    return matchScale && matchType && matchRecruit && matchSearch;
  });
});

function openModal(item) {
  selectedTown.value = item;
  modalOpen.value = true;
  history.replaceState(null, '', location.pathname + '#' + generateId(item));
}

function closeModal() {
  modalOpen.value = false;
  selectedTown.value = null;
  history.replaceState(null, '', location.pathname + location.search);
}

function shareItem(item) {
  const id = generateId(item);
  const url = location.origin + location.pathname + '#' + id;
  navigator.clipboard.writeText(url).then(() => {
    sharedId.value = id;
    setTimeout(() => { sharedId.value = null; }, 2000);
  });
}

function getMapUrl(item) {
  if (!item.coordinates) return '#';
  const c = item.coordinates;
  const d = item.dimension || 'overworld';
  const world = d === 'nether' ? 'world_nether' : d === 'the_end' ? 'world_the_end' : 'world';
  return `https://bailuyuan.lunadeer.cn/map/#${world}:${c.x}:${c.y}:${c.z}:500:0:0:0:1:flat`;
}

function parseBV(input) {
  if (!input) return null;
  const m = input.trim().match(/(BV[A-Za-z0-9]{10,})/);
  return m ? m[1] : null;
}

function onFilterChange({ key, value }) {
  if (key === 'scale') scaleFilter.value = value;
  if (key === 'type') typeFilter.value = value;
  if (key === 'recruit') recruitFilter.value = value;
}

function hasLogo(item) {
  return item.logo && item.logo.trim() !== '';
}

// ========== Editor ==========

const scaleSelectOptions = [
  { value: 'small', label: '小型（5人以下）' },
  { value: 'medium', label: '中型（2-10人）' },
  { value: 'large', label: '大型（10人以上）' },
];
const typeSelectOptions = [
  { value: 'building', label: '建筑' },
  { value: 'adventure', label: '冒险' },
  { value: 'industry', label: '工业' },
];
const recruitSelectOptions = [
  { value: 'welcome', label: '欢迎加入' },
  { value: 'closed', label: '暂不招人' },
  { value: 'maybe', label: '可以考虑' },
];
const dimensionSelectOptions = [
  { value: 'overworld', label: '主世界' },
  { value: 'nether', label: '下界' },
  { value: 'the_end', label: '末地' },
];

function getSelectLabel(options, value) {
  return options.find(o => o.value === value)?.label || value;
}

function toggleSelect(name) {
  openSelects.value[name] = !openSelects.value[name];
}

function selectOption(name, value) {
  if (name === 'scale') edScale.value = value;
  else if (name === 'townType') edTownType.value = value;
  else if (name === 'recruitment') edRecruitment.value = value;
  else if (name === 'dimension') edDimension.value = value;
  openSelects.value[name] = false;
}

function closeAllSelects() {
  openSelects.value = {};
}

function normalizeHex(val) {
  return /^#[0-9a-fA-F]{6}$/.test((val || '').trim()) ? val.trim() : null;
}

function openEditor(item) {
  const g = item ? getGradient(item) : DEFAULT_GRADIENT;
  edTitle.value = item ? item.title : '';
  edLogo.value = item?.logo || '';
  edGradientFrom.value = g.from;
  edGradientTo.value = g.to;
  edScale.value = item?.scale || 'small';
  edTownType.value = item?.townType || 'building';
  edRecruitment.value = item?.recruitment || 'welcome';
  edDimension.value = item?.dimension || 'overworld';
  edSecret.value = item?.coordinatesSecret || false;
  edX.value = item?.coordinates ? String(item.coordinates.x) : '';
  edY.value = item?.coordinates ? String(item.coordinates.y) : '';
  edZ.value = item?.coordinates ? String(item.coordinates.z) : '';
  founders.reset(item?.founders || []);
  members.reset(item?.members || []);
  introduction.reset(item?.introduction || []);
  openSelects.value = {};
  editorOpen.value = true;
}

function openEditorFromModal(item) {
  modalOpen.value = false;
  selectedTown.value = null;
  nextTick(() => openEditor(item));
}

function onTagKeydown(tagsObj, e) {
  if (e.isComposing) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    commitTagInput(tagsObj, e.target);
  }
}

function commitTagInput(tagsObj, input) {
  const val = input.value.trim();
  if (val) {
    tagsObj.addTag(val);
    input.value = '';
  }
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
  introduction.moveItem(dragState.value.fromIdx, toIdx);
}

function onDragEnd(e) {
  document.querySelectorAll('.sortable-item').forEach(el => el.classList.remove('dragging', 'drag-over'));
  dragState.value = { listName: null, fromIdx: null };
}

function generateJson() {
  if (!edTitle.value.trim()) {
    alert('请填写城镇名称');
    return;
  }
  const obj = {
    title: edTitle.value.trim(),
    logo: edLogo.value.trim(),
    gradient: {
      from: normalizeHex(edGradientFrom.value) || DEFAULT_GRADIENT.from,
      to: normalizeHex(edGradientTo.value) || DEFAULT_GRADIENT.to,
    },
    dimension: edDimension.value,
    coordinatesSecret: edSecret.value,
    scale: edScale.value,
    townType: edTownType.value,
    recruitment: edRecruitment.value,
    founders: [...founders.tags.value],
    members: [...members.tags.value],
    introduction: introduction.getCleanItems().map(i => i.type === 'video' ? { type: 'video', content: parseBV(i.content) || i.content } : i),
  };
  if (!edSecret.value) {
    obj.coordinates = {
      x: parseInt(edX.value) || 0,
      y: parseInt(edY.value) || 0,
      z: parseInt(edZ.value) || 0,
    };
  }
  jsonOutputText.value = JSON.stringify(obj, null, 4);
  jsonOutputOpen.value = true;
}
</script>

<template>
  <!-- Hero -->
  <section class="page-hero towns-hero bl-default-page-hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1 class="hero-title">聚落与城镇</h1>
      <p class="hero-subtitle">探索服务器中的社区据点</p>
    </div>
  </section>

  <main class="towns-container bl-shell">
    <!-- Controls -->
    <FilterPanel
      title="城镇列表"
      :search-value="searchQuery"
      search-placeholder="搜索城镇名称..."
      :filters="[
        { key: 'scale', label: '规模', labelIcon: 'fas fa-users', options: scaleOptions, modelValue: scaleFilter },
        { key: 'type', label: '类型', labelIcon: 'fas fa-tag', options: typeOptions, modelValue: typeFilter },
        { key: 'recruit', label: '招募', labelIcon: 'fas fa-door-open', options: recruitOptions, modelValue: recruitFilter },
      ]"
      action-label="新增城镇"
      @update:search-value="searchQuery = $event"
      @change-filter="onFilterChange"
      @action="openEditor(null)"
    />

    <!-- Grid -->
    <div v-if="filtered.length" class="towns-grid">
      <article
        v-for="item in filtered"
        :key="generateId(item)"
        class="town-card"
        @click="openModal(item)"
      >
        <div
          class="town-card-bg"
          :class="{ 'no-logo': !hasLogo(item) }"
          :style="hasLogo(item)
            ? { backgroundImage: `url('${item.logo}')` }
            : { background: gradientStyle(item) }"
        >
          <i v-if="!hasLogo(item)" class="fas fa-city town-logo-placeholder"></i>
          <div class="town-card-icons">
            <span class="town-icon-badge" :class="'icon-scale-' + item.scale" :title="scaleTextMap[item.scale]">
              <i class="fas" :class="scaleIconMap[item.scale]"></i>
            </span>
            <span class="town-icon-badge" :class="'icon-type-' + item.townType" :title="typeTextMap[item.townType]">
              <i class="fas" :class="typeIconMap[item.townType]"></i>
            </span>
            <span class="town-icon-badge" :class="'icon-recruit-' + item.recruitment" :title="recruitTextMap[item.recruitment]">
              <i class="fas" :class="recruitIconMap[item.recruitment]"></i>
            </span>
          </div>
        </div>
        <div class="town-card-body">
          <h3 class="town-card-title">{{ item.title }}</h3>
          <div class="town-card-meta">
            <span class="town-meta-tag"><i class="fas" :class="scaleIconMap[item.scale]"></i> {{ scaleTextMap[item.scale] }}</span>
            <span class="town-meta-tag"><i class="fas" :class="typeIconMap[item.townType]"></i> {{ typeTextMap[item.townType] }}</span>
            <span class="town-meta-tag"><i class="fas" :class="recruitIconMap[item.recruitment]"></i> {{ recruitTextMap[item.recruitment] }}</span>
          </div>
        </div>
      </article>
    </div>

    <EmptyState v-else title="暂无城镇" description="当前没有匹配的城镇信息。" />

    <!-- Detail Modal -->
    <BaseModal :model-value="modalOpen" width="720px" @update:model-value="closeModal">
      <template v-if="selectedTown" #header>
        <!-- Banner -->
        <div
          class="town-modal-banner"
          :class="{ 'no-logo': !hasLogo(selectedTown) }"
          :style="hasLogo(selectedTown)
            ? { backgroundImage: `url('${selectedTown.logo}')` }
            : { background: gradientStyle(selectedTown) }"
        >
          <i v-if="!hasLogo(selectedTown)" class="fas fa-city town-banner-placeholder"></i>
        </div>
        <div class="modal-header-inner">
          <h3>{{ selectedTown.title }}</h3>
          <div class="modal-badges-row">
            <div class="modal-badges">
              <span class="town-badge" :class="'badge-scale-' + selectedTown.scale">
                <i class="fas" :class="scaleIconMap[selectedTown.scale]"></i>
                {{ scaleTextMap[selectedTown.scale] }}
              </span>
              <span class="town-badge" :class="'badge-type-' + selectedTown.townType">
                <i class="fas" :class="typeIconMap[selectedTown.townType]"></i>
                {{ typeTextMap[selectedTown.townType] }}
              </span>
              <span class="town-badge" :class="'badge-recruit-' + selectedTown.recruitment">
                <i class="fas" :class="recruitIconMap[selectedTown.recruitment]"></i>
                {{ recruitTextMap[selectedTown.recruitment] }}
              </span>
            </div>
            <div class="modal-actions">
              <button
                type="button"
                :class="['btn-share', { shared: sharedId === generateId(selectedTown) }]"
                @click="shareItem(selectedTown)"
              >
                <template v-if="sharedId === generateId(selectedTown)">✓ 已复制</template><template v-else><i class="fas fa-share-alt"></i> 分享</template>
              </button>
              <button type="button" class="btn-edit" @click="openEditorFromModal(selectedTown)">
                <i class="fas fa-pen"></i> 编辑
              </button>
            </div>
          </div>
        </div>
      </template>

      <template v-if="selectedTown">
        <!-- Location -->
        <ModalSection title="位置信息" icon="fas fa-map-marker-alt">
          <p v-if="selectedTown.coordinatesSecret">保密</p>
          <p v-else>
            {{ dimensionTextMap[selectedTown.dimension] || '主世界' }}
            <template v-if="selectedTown.coordinates">
              · X: {{ selectedTown.coordinates.x }}, Y: {{ selectedTown.coordinates.y }}, Z: {{ selectedTown.coordinates.z }}
            </template>
            <a
              v-if="selectedTown.coordinates"
              :href="getMapUrl(selectedTown)"
              target="_blank"
              rel="noopener"
              class="map-link"
            >
              <i class="fas fa-map-marked-alt"></i> 在地图中查看
            </a>
          </p>
        </ModalSection>

        <!-- Founders -->
        <ModalSection title="创始人" icon="fas fa-crown">
          <div v-if="selectedTown.founders?.length" class="contributors-list">
            <span v-for="name in selectedTown.founders" :key="name" class="contributor-tag">
              <img :src="`https://minotar.net/avatar/${encodeURIComponent(name)}/20`" :alt="name" loading="lazy">
              {{ name }}
            </span>
          </div>
          <span v-else class="text-secondary">暂无记录</span>
        </ModalSection>

        <!-- Members -->
        <ModalSection title="成员" icon="fas fa-users">
          <div v-if="selectedTown.members?.length" class="contributors-list">
            <span v-for="name in selectedTown.members" :key="name" class="contributor-tag">
              <img :src="`https://minotar.net/avatar/${encodeURIComponent(name)}/20`" :alt="name" loading="lazy">
              {{ name }}
            </span>
          </div>
          <span v-else class="text-secondary">暂无记录</span>
        </ModalSection>

        <!-- Introduction -->
        <ModalSection v-if="selectedTown.introduction?.length" title="城镇介绍" icon="fas fa-scroll">
          <div class="content-blocks">
            <template v-for="(block, bi) in selectedTown.introduction" :key="bi">
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
        </ModalSection>
      </template>
    </BaseModal>

    <!-- Editor Modal -->
    <EditorModal v-model="editorOpen" title="城镇编辑器" icon="fas fa-city">
      <template #preview>
        <div class="preview-card">
          <div class="preview-banner" :style="edLogo ? { backgroundImage: `url('${edLogo}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: `linear-gradient(135deg, ${edGradientFrom} 0%, ${edGradientTo} 100%)` }">
            <i v-if="!edLogo" class="fas fa-city preview-banner-icon"></i>
          </div>
          <div class="preview-header">
            <div class="preview-title">{{ edTitle || '未命名城镇' }}</div>
            <div class="modal-badges">
              <span :class="['town-badge', 'badge-scale-' + edScale]"><i class="fas" :class="scaleIconMap[edScale]"></i> {{ scaleTextMap[edScale] }}</span>
              <span :class="['town-badge', 'badge-type-' + edTownType]"><i class="fas" :class="typeIconMap[edTownType]"></i> {{ typeTextMap[edTownType] }}</span>
              <span :class="['town-badge', 'badge-recruit-' + edRecruitment]"><i class="fas" :class="recruitIconMap[edRecruitment]"></i> {{ recruitTextMap[edRecruitment] }}</span>
            </div>
          </div>
          <div class="preview-body">
            <div class="preview-section">
              <div class="preview-section-title"><i class="fas fa-map-marker-alt"></i> 位置信息</div>
              <p v-if="edSecret">坐标保密</p>
              <p v-else>{{ getSelectLabel(dimensionSelectOptions, edDimension) }}: X: {{ edX || '0' }}, Y: {{ edY || '64' }}, Z: {{ edZ || '0' }}</p>
            </div>
            <div class="preview-section">
              <div class="preview-section-title"><i class="fas fa-crown"></i> 创始人</div>
              <div v-if="founders.tags.value.length" class="contributors-list">
                <span v-for="name in founders.tags.value" :key="name" class="contributor-tag">
                  <img :src="`https://minotar.net/avatar/${encodeURIComponent(name)}/20`" :alt="name" loading="lazy">{{ name }}
                </span>
              </div>
              <span v-else class="preview-text-secondary">暂无记录</span>
            </div>
            <div class="preview-section">
              <div class="preview-section-title"><i class="fas fa-users"></i> 主要成员</div>
              <div v-if="members.tags.value.length" class="contributors-list">
                <span v-for="name in members.tags.value" :key="name" class="contributor-tag">
                  <img :src="`https://minotar.net/avatar/${encodeURIComponent(name)}/20`" :alt="name" loading="lazy">{{ name }}
                </span>
              </div>
              <span v-else class="preview-text-secondary">暂无记录</span>
            </div>
            <div class="preview-section">
              <div class="preview-section-title"><i class="fas fa-scroll"></i> 城镇介绍</div>
              <div class="content-blocks" v-if="introduction.items.value.length">
                <template v-for="(block, bi) in introduction.items.value" :key="bi">
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
        </div>
      </template>

      <template #form>
        <div @click="closeAllSelects">
          <div class="form-group">
            <label>城镇名称</label>
            <input type="text" v-model="edTitle" placeholder="输入城镇名称...">
          </div>
          <div class="form-group">
            <label>头图/Logo 图片地址</label>
            <input type="text" v-model="edLogo" placeholder="输入图片URL（留空则使用渐变色）...">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>卡片渐变起始色</label>
              <input type="color" v-model="edGradientFrom">
            </div>
            <div class="form-group">
              <label>卡片渐变结束色</label>
              <input type="color" v-model="edGradientTo">
            </div>
          </div>
          <p class="form-hint">当未设置头图时，将使用这组渐变色作为卡片和详情头图背景。</p>
          <div class="form-row">
            <div class="form-group">
              <label>规模</label>
              <div :class="['custom-select', { open: openSelects.scale }]" @click.stop>
                <div class="custom-select-trigger" @click="toggleSelect('scale')">
                  <span>{{ getSelectLabel(scaleSelectOptions, edScale) }}</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                <div class="custom-select-options">
                  <div v-for="opt in scaleSelectOptions" :key="opt.value" :class="['custom-option', { selected: edScale === opt.value }]" @click="selectOption('scale', opt.value)">{{ opt.label }}</div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>类型</label>
              <div :class="['custom-select', { open: openSelects.townType }]" @click.stop>
                <div class="custom-select-trigger" @click="toggleSelect('townType')">
                  <span>{{ getSelectLabel(typeSelectOptions, edTownType) }}</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                <div class="custom-select-options">
                  <div v-for="opt in typeSelectOptions" :key="opt.value" :class="['custom-option', { selected: edTownType === opt.value }]" @click="selectOption('townType', opt.value)">{{ opt.label }}</div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>招募状态</label>
              <div :class="['custom-select', { open: openSelects.recruitment }]" @click.stop>
                <div class="custom-select-trigger" @click="toggleSelect('recruitment')">
                  <span>{{ getSelectLabel(recruitSelectOptions, edRecruitment) }}</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                <div class="custom-select-options">
                  <div v-for="opt in recruitSelectOptions" :key="opt.value" :class="['custom-option', { selected: edRecruitment === opt.value }]" @click="selectOption('recruitment', opt.value)">{{ opt.label }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="toggle-label">
              <span>坐标保密</span>
              <div class="toggle-switch">
                <input type="checkbox" v-model="edSecret">
                <span class="toggle-slider"></span>
              </div>
            </label>
            <p class="field-hint">开启后将隐藏坐标信息，适用于不希望公开位置的城镇。</p>
          </div>
          <template v-if="!edSecret">
            <div class="form-group">
              <label>所在世界</label>
              <div :class="['custom-select', { open: openSelects.dimension }]" @click.stop>
                <div class="custom-select-trigger" @click="toggleSelect('dimension')">
                  <span>{{ getSelectLabel(dimensionSelectOptions, edDimension) }}</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                <div class="custom-select-options">
                  <div v-for="opt in dimensionSelectOptions" :key="opt.value" :class="['custom-option', { selected: edDimension === opt.value }]" @click="selectOption('dimension', opt.value)">{{ opt.label }}</div>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>X 坐标</label>
                <input type="number" v-model="edX" placeholder="0">
              </div>
              <div class="form-group">
                <label>Y 坐标</label>
                <input type="number" v-model="edY" placeholder="64">
              </div>
              <div class="form-group">
                <label>Z 坐标</label>
                <input type="number" v-model="edZ" placeholder="0">
              </div>
            </div>
          </template>
          <div class="form-group">
            <label>创始人</label>
            <div class="tags-input-wrapper" @click="$refs.founderInput.focus()">
              <div class="tags-list">
                <span v-for="(tag, ti) in founders.tags.value" :key="ti" class="editor-tag">
                  {{ tag }}
                  <span class="editor-tag-remove" @click="founders.removeTag(ti)"><i class="fas fa-times"></i></span>
                </span>
              </div>
              <input ref="founderInput" type="text" placeholder="输入名称后按回车或空格添加..." @keydown="onTagKeydown(founders, $event)" @blur="commitTagInput(founders, $event.target)">
            </div>
          </div>
          <div class="form-group">
            <label>主要成员</label>
            <div class="tags-input-wrapper" @click="$refs.memberInput.focus()">
              <div class="tags-list">
                <span v-for="(tag, ti) in members.tags.value" :key="ti" class="editor-tag">
                  {{ tag }}
                  <span class="editor-tag-remove" @click="members.removeTag(ti)"><i class="fas fa-times"></i></span>
                </span>
              </div>
              <input ref="memberInput" type="text" placeholder="输入名称后按回车或空格添加..." @keydown="onTagKeydown(members, $event)" @blur="commitTagInput(members, $event.target)">
            </div>
          </div>
          <div class="form-group">
            <label>城镇介绍</label>
            <div class="sortable-list">
              <div v-for="(item, idx) in introduction.items.value" :key="idx" class="sortable-item" draggable="true" @dragstart="onDragStart('introduction', idx, $event)" @dragover="onDragOver" @dragenter="onDragEnter('introduction', idx, $event)" @dragleave="onDragLeave" @drop="onDrop('introduction', idx, $event)" @dragend="onDragEnd">
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <span :class="['item-type-badge', 'badge-' + item.type]">{{ item.type === 'text' ? '文字' : item.type === 'image' ? '图片' : '视频' }}</span>
                <textarea v-if="item.type === 'text'" class="item-content" rows="2" placeholder="输入文字内容..." :value="item.content" @input="introduction.updateContent(idx, $event.target.value)"></textarea>
                <input v-else-if="item.type === 'image'" type="text" class="item-content" placeholder="输入图片URL..." :value="item.content" @input="introduction.updateContent(idx, $event.target.value)">
                <input v-else type="text" class="item-content" placeholder="BV1xxxxxxxxxx 或 bilibili 视频地址" :value="item.content" @input="introduction.updateContent(idx, $event.target.value)">
                <button type="button" class="remove-item-btn" @click="introduction.removeItem(idx)"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
            <div class="add-item-row">
              <button type="button" class="add-item-btn" @click="introduction.addItem('text')"><i class="fas fa-plus"></i> 添加文字</button>
              <button type="button" class="add-item-btn" @click="introduction.addItem('image')"><i class="fas fa-image"></i> 添加图片</button>
              <button type="button" class="add-item-btn" @click="introduction.addItem('video')"><i class="fas fa-video"></i> 添加视频</button>
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

.towns-container {
  padding: 40px 20px;
}

/* Grid */
.towns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

/* Card */
.town-card {
  border-radius: var(--bl-radius-lg);
  overflow: hidden;
  background: var(--bl-surface-strong);
  box-shadow: var(--bl-shadow-soft);
  cursor: pointer;
  transition: var(--bl-transition);
  border: 1px solid var(--bl-border);
}

.town-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--bl-shadow-card);
}

.town-card-bg {
  height: 140px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bl-surface-muted);
}

.town-card-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.28), transparent 55%);
  pointer-events: none;
}

.town-card-bg.no-logo {
  background-size: unset;
}

.town-logo-placeholder {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.4);
}

.town-card-icons {
  position: absolute;
  bottom: -14px;
  left: 16px;
  display: flex;
  gap: 8px;
  z-index: 2;
}

.town-icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  border: 2px solid var(--bl-surface-strong);
}

.icon-scale-small { background: #60a5fa; }
.icon-scale-medium { background: #f59e0b; }
.icon-scale-large { background: #ef4444; }

.icon-type-building { background: #8b5cf6; }
.icon-type-adventure { background: #10b981; }
.icon-type-industry { background: #f97316; }

.icon-recruit-welcome { background: #22c55e; }
.icon-recruit-closed { background: #ef4444; }
.icon-recruit-maybe { background: #eab308; }

.town-card-body {
  padding: 24px 20px 20px;
}

.town-card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px;
}

.town-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--bl-border);
}

.town-meta-tag {
  font-size: 11px;
  background: var(--bl-surface-muted);
  padding: 4px 10px;
  border-radius: 6px;
  color: var(--bl-text-secondary);
  font-weight: 500;
}

.town-meta-tag i {
  margin-right: 4px;
}

/* Modal banner */
.town-modal-banner {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  border-radius: var(--bl-radius-lg) var(--bl-radius-lg) 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -32px -32px 20px;
  width: calc(100% + 64px);
}

.town-modal-banner.no-logo {
  background-size: unset;
}

.town-banner-placeholder {
  font-size: 64px;
  color: rgba(255, 255, 255, 0.35);
}

.modal-header-inner h3 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px;
  line-height: 1.2;
}

.modal-badges-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.modal-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.modal-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* Town badges */
.town-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.town-badge i {
  font-size: 12px;
}

.badge-scale-small { background: var(--bl-badge-info-bg); color: var(--bl-badge-info-text); }
.badge-scale-medium { background: var(--bl-badge-warning-bg); color: var(--bl-badge-warning-text); }
.badge-scale-large { background: var(--bl-badge-danger-bg); color: var(--bl-badge-danger-text); }

.badge-type-building { background: var(--bl-badge-purple-bg); color: var(--bl-badge-purple-text); }
.badge-type-adventure { background: var(--bl-badge-success-bg); color: var(--bl-badge-success-text); }
.badge-type-industry { background: var(--bl-badge-warning-bg); color: var(--bl-badge-warning-text); }

.badge-recruit-welcome { background: var(--bl-badge-success-bg); color: var(--bl-badge-success-text); }
.badge-recruit-closed { background: var(--bl-badge-danger-bg); color: var(--bl-badge-danger-text); }
.badge-recruit-maybe { background: var(--bl-badge-warning-bg); color: var(--bl-badge-warning-text); }

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
}

.btn-share.shared {
  color: var(--bl-badge-success-text);
  border-color: var(--bl-green);
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

.map-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  background: var(--bl-accent);
  padding: 6px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  margin-left: 12px;
  transition: 0.2s;
}

.map-link:hover {
  background: var(--bl-accent-strong);
  transform: translateY(-1px);
}

.contributors-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.contributor-tag {
  display: flex;
  align-items: center;
  background: var(--bl-surface-strong);
  border: 1px solid var(--bl-border);
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 14px;
  color: var(--bl-text);
  box-shadow: var(--bl-shadow-soft);
}

.contributor-tag img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 10px;
  background: var(--bl-surface-muted);
}

.text-secondary {
  color: var(--bl-text-secondary);
  font-size: 14px;
}

.content-blocks {
  background: var(--bl-surface-subtle);
  padding: 24px;
  border-radius: 16px;
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
  margin: 12px 0 20px;
  border: 1px solid var(--bl-border);
}

.video-embed-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  margin: 12px 0 20px;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.video-embed-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

@media (max-width: 768px) {
  .hero-title { font-size: 36px; }
  .hero-subtitle { font-size: 20px; }
  .towns-grid { grid-template-columns: 1fr; }
  .modal-header-inner h3 { font-size: 24px; }
  .town-modal-banner { height: 140px; }
}

/* Editor-specific */
.preview-banner {
  height: 160px;
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-banner-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.4);
}

.form-hint {
  font-size: 12px;
  color: var(--bl-text-secondary);
  margin: -14px 0 18px;
  line-height: 1.5;
}

.form-group input[type="color"] {
  width: 100%;
  height: 44px;
  padding: 4px;
  border: 1.5px solid var(--bl-border-strong);
  border-radius: 12px;
  background: var(--bl-surface-subtle);
  cursor: pointer;
  box-sizing: border-box;
}

.form-group .toggle-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 14px;
  color: var(--bl-text);
  cursor: pointer;
  text-transform: none;
  letter-spacing: normal;
  margin-bottom: 0;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: var(--bl-toggle-off-bg);
  border-radius: 24px;
  transition: 0.25s;
  cursor: pointer;
}

.toggle-slider::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  bottom: 3px;
  background: var(--bl-toggle-knob-bg);
  border-radius: 50%;
  transition: 0.25s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background: var(--bl-accent);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.field-hint {
  font-size: 12px;
  color: var(--bl-text-secondary);
  margin-top: 6px;
  line-height: 1.4;
}
</style>
