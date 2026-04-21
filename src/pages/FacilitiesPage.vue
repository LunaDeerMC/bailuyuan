<script setup>
import { ref, computed, defineAsyncComponent, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import FilterPanel from '../components/shared/FilterPanel.vue';
import BaseModal from '../components/base/BaseModal.vue';
import ModalSection from '../components/detail/ModalSection.vue';
import EmptyState from '../components/base/EmptyState.vue';
import { useSortableList, useTagsInput } from '../composables/useEditorHelpers.js';

const EditorModal = defineAsyncComponent(() => import('../components/shared/EditorModal.vue'));
const JsonOutputModal = defineAsyncComponent(() => import('../components/shared/JsonOutputModal.vue'));

const route = useRoute();

const facilities = ref([]);
const searchQuery = ref('');
const typeFilter = ref('all');
const dimensionFilter = ref('all');
const modalOpen = ref(false);
const selectedFacility = ref(null);
const sharedId = ref(null);
const editorOpen = ref(false);
const jsonOutputOpen = ref(false);
const jsonOutputText = ref('');

// Editor form state
const edTitle = ref('');
const edIntro = ref('');
const edType = ref('resource');
const edStatus = ref('online');
const edDimension = ref('overworld');
const edX = ref('');
const edY = ref('');
const edZ = ref('');
const openSelects = ref({});
const contributors = useTagsInput();
const instructions = useSortableList();
const notes = useSortableList();

// Drag state for sortable lists
const dragState = ref({ listName: null, fromIdx: null });

onMounted(() => {
  fetch('/data/facilities.json')
    .then(r => r.json())
    .then(data => {
      facilities.value = data;
      nextTick(() => handleHash());
    });
});

function handleHash() {
  const hash = route.hash.replace('#', '');
  if (!hash) return;
  const match = facilities.value.find(item => generateId(item) === hash);
  if (match) openModal(match);
}

function generateId(item) {
  const raw = item.title || '';
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = ((h << 5) - h) + raw.charCodeAt(i);
    h |= 0;
  }
  return 'f' + Math.abs(h).toString(36);
}

const typeOptions = [
  { value: 'all', label: '全部' },
  { value: 'resource', label: '资源', iconClass: 'fas fa-cube' },
  { value: 'xp', label: '经验', iconClass: 'fas fa-star' },
  { value: 'infrastructure', label: '基建', iconClass: 'fas fa-road' },
];

const dimensionOptions = [
  { value: 'all', label: '全部' },
  { value: 'overworld', label: '主世界', iconClass: 'fas fa-sun' },
  { value: 'nether', label: '下界', iconClass: 'fas fa-fire' },
  { value: 'end', label: '末地', iconClass: 'fas fa-dragon' },
];

const typeTextMap = { resource: '资源', xp: '经验', infrastructure: '基建' };
const dimensionTextMap = { overworld: '主世界', nether: '下界', end: '末地' };
const statusTextMap = { online: '运行中', maintenance: '维护中', offline: '已停用' };
const statusToneMap = { online: 'success', maintenance: 'warning', offline: 'danger' };
const statusIconMap = { online: 'fa-check-circle', maintenance: 'fa-wrench', offline: 'fa-times-circle' };
const typeIconMap = { resource: 'fa-cube', xp: 'fa-star', infrastructure: 'fa-road' };

const filtered = computed(() => {
  return facilities.value.filter(item => {
    const matchType = typeFilter.value === 'all' || item.type === typeFilter.value;
    const matchDim = dimensionFilter.value === 'all' || item.dimension === dimensionFilter.value;
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.intro.toLowerCase().includes(q);
    return matchType && matchDim && matchSearch;
  });
});

function openModal(item) {
  selectedFacility.value = item;
  modalOpen.value = true;
  history.replaceState(null, '', location.pathname + '#' + generateId(item));
}

function closeModal() {
  modalOpen.value = false;
  selectedFacility.value = null;
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
  const world = item.dimension === 'nether' ? 'world_nether' : item.dimension === 'end' ? 'world_the_end' : 'world';
  return `https://bailuyuan.lunadeer.cn/map/#${world}:${c.x}:${c.y}:${c.z}:500:0:0:0:1:flat`;
}

function parseBV(input) {
  if (!input) return null;
  const m = input.trim().match(/(BV[A-Za-z0-9]{10,})/);
  return m ? m[1] : null;
}

function onFilterChange({ key, value }) {
  if (key === 'type') typeFilter.value = value;
  if (key === 'dimension') dimensionFilter.value = value;
}

// ========== Editor ==========

const typeSelectOptions = [
  { value: 'resource', label: '资源类' },
  { value: 'xp', label: '经验类' },
  { value: 'infrastructure', label: '基础设施' },
];
const statusSelectOptions = [
  { value: 'online', label: '正常运行' },
  { value: 'maintenance', label: '维护中' },
  { value: 'offline', label: '暂时失效' },
];
const dimensionSelectOptions = [
  { value: 'overworld', label: '主世界' },
  { value: 'nether', label: '下界' },
  { value: 'end', label: '末地' },
];

function getSelectLabel(options, value) {
  return options.find(o => o.value === value)?.label || value;
}

function toggleSelect(name) {
  openSelects.value[name] = !openSelects.value[name];
}

function selectOption(name, value) {
  if (name === 'type') edType.value = value;
  else if (name === 'status') edStatus.value = value;
  else if (name === 'dimension') edDimension.value = value;
  openSelects.value[name] = false;
}

function closeAllSelects() {
  openSelects.value = {};
}

function openEditor(item) {
  edTitle.value = item ? item.title : '';
  edIntro.value = item ? item.intro : '';
  edType.value = item ? item.type : 'resource';
  edStatus.value = item ? item.status : 'online';
  edDimension.value = item ? item.dimension : 'overworld';
  edX.value = item?.coordinates ? String(item.coordinates.x) : '';
  edY.value = item?.coordinates ? String(item.coordinates.y) : '';
  edZ.value = item?.coordinates ? String(item.coordinates.z) : '';
  contributors.reset(item?.contributors || []);
  instructions.reset(item?.instructions || []);
  notes.reset(item?.notes || []);
  openSelects.value = {};
  editorOpen.value = true;
}

function openEditorFromModal(item) {
  modalOpen.value = false;
  selectedFacility.value = null;
  nextTick(() => openEditor(item));
}

function onContributorKeydown(e) {
  if (e.isComposing) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    commitContributorInput(e.target);
  }
}

function commitContributorInput(input) {
  const val = input.value.trim();
  if (val) {
    contributors.addTag(val);
    input.value = '';
  }
}

// Drag-and-drop for sortable lists
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
  const list = listName === 'instructions' ? instructions : notes;
  list.moveItem(dragState.value.fromIdx, toIdx);
}

function onDragEnd(e) {
  document.querySelectorAll('.sortable-item').forEach(el => el.classList.remove('dragging', 'drag-over'));
  dragState.value = { listName: null, fromIdx: null };
}

function generateJson() {
  if (!edTitle.value.trim()) {
    alert('请填写设施名称');
    return;
  }
  const obj = {
    title: edTitle.value.trim(),
    intro: edIntro.value.trim(),
    type: edType.value,
    dimension: edDimension.value,
    status: edStatus.value,
    coordinates: {
      x: parseInt(edX.value) || 0,
      y: parseInt(edY.value) || 64,
      z: parseInt(edZ.value) || 0,
    },
    contributors: [...contributors.tags.value],
    instructions: instructions.getCleanItems().map(i => i.type === 'video' ? { type: 'video', content: parseBV(i.content) || i.content } : i),
    notes: notes.getCleanItems().map(n => n.type === 'video' ? { type: 'video', content: parseBV(n.content) || n.content } : n),
  };
  jsonOutputText.value = JSON.stringify(obj, null, 4);
  jsonOutputOpen.value = true;
}
</script>

<template>
  <!-- Hero -->
  <section class="page-hero facilities-hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1 class="hero-title">全服共享资源</h1>
      <p class="hero-subtitle">共同建设，共同分享，让生存更轻松</p>
    </div>
  </section>

  <main class="facilities-container bl-shell">
    <!-- Controls -->
    <FilterPanel
      title="设施列表"
      :search-value="searchQuery"
      search-placeholder="搜索设施名称或简介..."
      :filters="[
        { key: 'type', label: '类型', labelIcon: 'fas fa-layer-group', options: typeOptions, modelValue: typeFilter },
        { key: 'dimension', label: '维度', labelIcon: 'fas fa-globe', options: dimensionOptions, modelValue: dimensionFilter },
      ]"
      action-label="新增设施"
      @update:search-value="searchQuery = $event"
      @change-filter="onFilterChange"
      @action="openEditor(null)"
    />

    <!-- Grid -->
    <div v-if="filtered.length" class="facilities-grid">
      <article
        v-for="item in filtered"
        :key="generateId(item)"
        class="facility-card"
        @click="openModal(item)"
      >
        <div class="card-header">
          <h3 class="card-title">{{ item.title }}</h3>
          <div :class="['status-indicator-badge', 'status-' + item.status]">
            <div class="status-dot"></div>
            <span>{{ statusTextMap[item.status] || item.status }}</span>
          </div>
        </div>
        <p class="card-intro">{{ item.intro }}</p>
        <div class="card-meta">
          <span class="meta-tag">{{ typeTextMap[item.type] || item.type }}</span>
          <span class="meta-tag">{{ dimensionTextMap[item.dimension] || item.dimension }}</span>
        </div>
      </article>
    </div>

    <EmptyState v-else title="暂无设施" description="当前没有匹配的设施信息。" />

    <!-- Detail Modal -->
    <BaseModal :model-value="modalOpen" width="720px" @update:model-value="closeModal">
      <template v-if="selectedFacility" #header>
        <div class="modal-header-inner">
          <h3>{{ selectedFacility.title }}</h3>
          <p class="modal-intro">{{ selectedFacility.intro }}</p>
          <div class="modal-badges-row">
            <div class="modal-badges">
              <span :class="['badge', 'large-badge', 'badge-status-' + selectedFacility.status]">
                <i class="fas" :class="statusIconMap[selectedFacility.status]"></i>
                {{ statusTextMap[selectedFacility.status] }}
              </span>
              <span class="badge large-badge badge-type">
                <i class="fas" :class="typeIconMap[selectedFacility.type]"></i>
                {{ typeTextMap[selectedFacility.type] }}
              </span>
            </div>
            <div class="modal-actions">
              <button
                type="button"
                :class="['btn-share', { shared: sharedId === generateId(selectedFacility) }]"
                @click="shareItem(selectedFacility)"
              >
                <template v-if="sharedId === generateId(selectedFacility)">✓ 已复制</template><template v-else><i class="fas fa-share-alt"></i> 分享</template>
              </button>
              <button type="button" class="btn-edit" @click="openEditorFromModal(selectedFacility)">
                <i class="fas fa-pen"></i> 编辑
              </button>
            </div>
          </div>
        </div>
      </template>

      <template v-if="selectedFacility">
        <ModalSection title="位置信息" icon="fas fa-map-marker-alt">
          <p>
            {{ dimensionTextMap[selectedFacility.dimension] }}
            <template v-if="selectedFacility.coordinates">
              · X: {{ selectedFacility.coordinates.x }}, Y: {{ selectedFacility.coordinates.y }}, Z: {{ selectedFacility.coordinates.z }}
            </template>
            <a
              v-if="selectedFacility.coordinates"
              :href="getMapUrl(selectedFacility)"
              target="_blank"
              rel="noopener"
              class="map-link"
            >
              <i class="fas fa-map-marked-alt"></i> 在地图中查看
            </a>
          </p>
        </ModalSection>

        <ModalSection v-if="selectedFacility.contributors?.length" title="贡献 / 维护人员" icon="fas fa-users-cog">
          <div class="contributors-list">
            <span v-for="name in selectedFacility.contributors" :key="name" class="contributor-tag">
              <img :src="`https://minotar.net/avatar/${name}/20`" :alt="name" loading="lazy">
              {{ name }}
            </span>
          </div>
        </ModalSection>

        <ModalSection v-if="selectedFacility.instructions?.length" title="使用说明" icon="fas fa-book-open">
          <div class="content-blocks">
            <template v-for="(block, bi) in selectedFacility.instructions" :key="bi">
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

        <ModalSection v-if="selectedFacility.notes?.length" title="注意事项" icon="fas fa-exclamation-triangle">
          <div class="content-blocks">
            <template v-for="(block, bi) in selectedFacility.notes" :key="bi">
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
    <EditorModal v-model="editorOpen" title="设施编辑器" icon="fas fa-tools">
      <template #preview>
        <div class="preview-card">
          <div class="preview-header">
            <div class="preview-title">{{ edTitle || '未命名设施' }}</div>
            <div class="modal-badges">
              <span :class="['badge', 'large-badge', 'badge-status-' + edStatus]"><i class="fas" :class="statusIconMap[edStatus]"></i> {{ statusTextMap[edStatus] }}</span>
              <span class="badge large-badge badge-type"><i class="fas" :class="typeIconMap[edType]"></i> {{ typeTextMap[edType] }}</span>
            </div>
          </div>
          <div class="preview-body">
            <p class="preview-intro">{{ edIntro || '暂无简介' }}</p>
            <div class="preview-section">
              <div class="preview-section-title"><i class="fas fa-map-marker-alt"></i> 位置信息</div>
              <p>{{ dimensionTextMap[edDimension] }}: X: {{ edX || '0' }}, Y: {{ edY || '64' }}, Z: {{ edZ || '0' }}</p>
            </div>
            <div class="preview-section">
              <div class="preview-section-title"><i class="fas fa-users-cog"></i> 贡献/维护人员</div>
              <div v-if="contributors.tags.value.length" class="contributors-list">
                <span v-for="name in contributors.tags.value" :key="name" class="contributor-tag">
                  <img :src="`https://minotar.net/avatar/${encodeURIComponent(name)}/20`" :alt="name" loading="lazy">
                  {{ name }}
                </span>
              </div>
              <span v-else class="preview-text-secondary">暂无记录</span>
            </div>
            <div class="preview-section">
              <div class="preview-section-title"><i class="fas fa-book-open"></i> 使用说明</div>
              <div class="content-blocks" v-if="instructions.items.value.length">
                <template v-for="(block, bi) in instructions.items.value" :key="bi">
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
            <div class="preview-section">
              <div class="preview-section-title"><i class="fas fa-exclamation-triangle"></i> 注意事项</div>
              <div class="content-blocks" v-if="notes.items.value.length">
                <template v-for="(block, bi) in notes.items.value" :key="bi">
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
            <label>设施名称</label>
            <input type="text" v-model="edTitle" placeholder="输入设施名称...">
          </div>
          <div class="form-group">
            <label>设施简介</label>
            <textarea v-model="edIntro" placeholder="输入设施简介..." rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>类型</label>
              <div :class="['custom-select', { open: openSelects.type }]" @click.stop>
                <div class="custom-select-trigger" @click="toggleSelect('type')">
                  <span>{{ getSelectLabel(typeSelectOptions, edType) }}</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                <div class="custom-select-options">
                  <div v-for="opt in typeSelectOptions" :key="opt.value" :class="['custom-option', { selected: edType === opt.value }]" @click="selectOption('type', opt.value)">{{ opt.label }}</div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>状态</label>
              <div :class="['custom-select', { open: openSelects.status }]" @click.stop>
                <div class="custom-select-trigger" @click="toggleSelect('status')">
                  <span>{{ getSelectLabel(statusSelectOptions, edStatus) }}</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                <div class="custom-select-options">
                  <div v-for="opt in statusSelectOptions" :key="opt.value" :class="['custom-option', { selected: edStatus === opt.value }]" @click="selectOption('status', opt.value)">{{ opt.label }}</div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>维度</label>
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
          <div class="form-group">
            <label>贡献/维护人员</label>
            <div class="tags-input-wrapper" @click="$refs.contributorInput.focus()">
              <div class="tags-list">
                <span v-for="(tag, ti) in contributors.tags.value" :key="ti" class="editor-tag">
                  {{ tag }}
                  <span class="editor-tag-remove" @click="contributors.removeTag(ti)"><i class="fas fa-times"></i></span>
                </span>
              </div>
              <input ref="contributorInput" type="text" placeholder="输入名称后按回车或空格添加..." @keydown="onContributorKeydown" @blur="commitContributorInput($event.target)">
            </div>
          </div>
          <div class="form-group">
            <label>使用说明</label>
            <div class="sortable-list">
              <div v-for="(item, idx) in instructions.items.value" :key="idx" class="sortable-item" draggable="true" @dragstart="onDragStart('instructions', idx, $event)" @dragover="onDragOver" @dragenter="onDragEnter('instructions', idx, $event)" @dragleave="onDragLeave" @drop="onDrop('instructions', idx, $event)" @dragend="onDragEnd">
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <span :class="['item-type-badge', 'badge-' + item.type]">{{ item.type === 'text' ? '文字' : item.type === 'image' ? '图片' : '视频' }}</span>
                <textarea v-if="item.type === 'text'" class="item-content" rows="2" placeholder="输入文字内容..." :value="item.content" @input="instructions.updateContent(idx, $event.target.value)"></textarea>
                <input v-else-if="item.type === 'image'" type="text" class="item-content" placeholder="输入图片URL..." :value="item.content" @input="instructions.updateContent(idx, $event.target.value)">
                <input v-else type="text" class="item-content" placeholder="BV1xxxxxxxxxx 或 bilibili 视频地址" :value="item.content" @input="instructions.updateContent(idx, $event.target.value)">
                <button type="button" class="remove-item-btn" @click="instructions.removeItem(idx)"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
            <div class="add-item-row">
              <button type="button" class="add-item-btn" @click="instructions.addItem('text')"><i class="fas fa-plus"></i> 添加文字</button>
              <button type="button" class="add-item-btn" @click="instructions.addItem('image')"><i class="fas fa-image"></i> 添加图片</button>
              <button type="button" class="add-item-btn" @click="instructions.addItem('video')"><i class="fas fa-video"></i> 添加视频</button>
            </div>
          </div>
          <div class="form-group">
            <label>注意事项</label>
            <div class="sortable-list">
              <div v-for="(item, idx) in notes.items.value" :key="idx" class="sortable-item" draggable="true" @dragstart="onDragStart('notes', idx, $event)" @dragover="onDragOver" @dragenter="onDragEnter('notes', idx, $event)" @dragleave="onDragLeave" @drop="onDrop('notes', idx, $event)" @dragend="onDragEnd">
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <span :class="['item-type-badge', 'badge-' + item.type]">{{ item.type === 'text' ? '文字' : item.type === 'image' ? '图片' : '视频' }}</span>
                <textarea v-if="item.type === 'text'" class="item-content" rows="2" placeholder="输入文字内容..." :value="item.content" @input="notes.updateContent(idx, $event.target.value)"></textarea>
                <input v-else-if="item.type === 'image'" type="text" class="item-content" placeholder="输入图片URL..." :value="item.content" @input="notes.updateContent(idx, $event.target.value)">
                <input v-else type="text" class="item-content" placeholder="BV1xxxxxxxxxx 或 bilibili 视频地址" :value="item.content" @input="notes.updateContent(idx, $event.target.value)">
                <button type="button" class="remove-item-btn" @click="notes.removeItem(idx)"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
            <div class="add-item-row">
              <button type="button" class="add-item-btn" @click="notes.addItem('text')"><i class="fas fa-plus"></i> 添加文字</button>
              <button type="button" class="add-item-btn" @click="notes.addItem('image')"><i class="fas fa-image"></i> 添加图片</button>
              <button type="button" class="add-item-btn" @click="notes.addItem('video')"><i class="fas fa-video"></i> 添加视频</button>
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

.facilities-hero {
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

.facilities-container {
  padding: 40px 20px;
}

/* Grid */
.facilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.facility-card {
  background: var(--bl-surface-strong);
  border-radius: var(--bl-radius-lg);
  padding: 24px;
  box-shadow: var(--bl-shadow-soft);
  transition: var(--bl-transition);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid var(--bl-border);
}

.facility-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--bl-shadow-card);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  margin-right: 10px;
  line-height: 1.3;
}

.status-indicator-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  white-space: nowrap;
}
.status-indicator-badge.status-online { background-color: var(--bl-badge-success-bg); color: var(--bl-badge-success-text); }
.status-indicator-badge.status-maintenance { background-color: var(--bl-badge-warning-bg); color: var(--bl-badge-warning-text); }
.status-indicator-badge.status-offline { background-color: var(--bl-badge-danger-bg); color: var(--bl-badge-danger-text); }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.status-online .status-dot { background-color: #22c55e; }
.status-maintenance .status-dot { background-color: #f59e0b; }
.status-offline .status-dot { background-color: #ef4444; }

.card-intro {
  font-size: 14px;
  color: var(--bl-text-secondary);
  margin: 0 0 24px;
  line-height: 1.5;
  flex-grow: 1;
}

.card-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-top: 1px solid var(--bl-border);
  padding-top: 16px;
}

.meta-tag {
  font-size: 11px;
  background: var(--bl-surface-muted);
  padding: 4px 10px;
  border-radius: 6px;
  color: var(--bl-text-secondary);
  font-weight: 500;
}

/* Modal Content */
.modal-header-inner h3 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px;
  line-height: 1.2;
}

.modal-intro {
  font-size: 18px;
  line-height: 1.6;
  color: var(--bl-text);
  margin: 0 0 20px;
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

/* Modal badges */
.badge.large-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.badge-status-online {
  background: var(--bl-badge-success-bg);
  color: var(--bl-badge-success-text);
}

.badge-status-maintenance {
  background: var(--bl-badge-warning-bg);
  color: var(--bl-badge-warning-text);
}

.badge-status-offline {
  background: var(--bl-badge-danger-bg);
  color: var(--bl-badge-danger-text);
}

.badge-type {
  background: var(--bl-badge-info-bg);
  color: var(--bl-badge-info-text);
}

.modal-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.contributor-tag img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 10px;
  background: var(--bl-surface-muted);
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
  .facilities-grid { grid-template-columns: 1fr; }
  .modal-header-inner h3 { font-size: 24px; }
}
</style>
