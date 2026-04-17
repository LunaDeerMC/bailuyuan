<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const trackRef = ref(null);
const thumbRef = ref(null);

const thumbTop = ref(0);
const thumbHeight = ref(40);
const visible = ref(false);
const active = ref(false);
const dragging = ref(false);

let hideTimer = null;
let rafId = 0;
let dragStartY = 0;
let dragStartScroll = 0;
let pointerFineMedia = null;

function isScrollable() {
  const doc = document.documentElement;
  return doc.scrollHeight > doc.clientHeight + 1;
}

function computeMetrics() {
  const doc = document.documentElement;
  const viewport = doc.clientHeight;
  const content = doc.scrollHeight;
  const scrolled = window.scrollY || doc.scrollTop || 0;

  if (content <= viewport + 1) {
    thumbHeight.value = 0;
    thumbTop.value = 0;
    return;
  }

  const trackH = trackRef.value ? trackRef.value.clientHeight : viewport;
  const minThumb = 36;
  const ratio = viewport / content;
  const h = Math.max(minThumb, Math.round(trackH * ratio));
  const maxTop = trackH - h;
  const scrollRatio = scrolled / (content - viewport);
  thumbHeight.value = h;
  thumbTop.value = Math.max(0, Math.min(maxTop, Math.round(maxTop * scrollRatio)));
}

function scheduleUpdate() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    computeMetrics();
  });
}

function flashVisible() {
  if (!isScrollable()) {
    visible.value = false;
    return;
  }
  visible.value = true;
  if (hideTimer) clearTimeout(hideTimer);
  if (dragging.value) return;
  hideTimer = setTimeout(() => {
    if (!dragging.value && !active.value) visible.value = false;
  }, 900);
}

function onScroll() {
  scheduleUpdate();
  flashVisible();
}

function onResize() {
  scheduleUpdate();
  flashVisible();
}

function onTrackEnter() {
  active.value = true;
  flashVisible();
}

function onTrackLeave() {
  active.value = false;
  if (!dragging.value) flashVisible();
}

function onTrackClick(e) {
  if (e.target === thumbRef.value || thumbRef.value?.contains?.(e.target)) return;
  const track = trackRef.value;
  if (!track) return;
  const rect = track.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const doc = document.documentElement;
  const viewport = doc.clientHeight;
  const content = doc.scrollHeight;
  const trackH = rect.height;
  const h = thumbHeight.value;
  const ratio = Math.max(0, Math.min(1, (y - h / 2) / (trackH - h)));
  const target = ratio * (content - viewport);
  window.scrollTo({ top: target, behavior: 'smooth' });
}

function onThumbPointerDown(e) {
  if (e.button !== undefined && e.button !== 0) return;
  e.preventDefault();
  dragging.value = true;
  active.value = true;
  dragStartY = e.clientY;
  dragStartScroll = window.scrollY || document.documentElement.scrollTop || 0;
  thumbRef.value?.setPointerCapture?.(e.pointerId);
  window.addEventListener('pointermove', onDragMove);
  window.addEventListener('pointerup', onDragEnd);
  window.addEventListener('pointercancel', onDragEnd);
  document.body.style.userSelect = 'none';
}

function onDragMove(e) {
  if (!dragging.value) return;
  const track = trackRef.value;
  if (!track) return;
  const dy = e.clientY - dragStartY;
  const trackH = track.clientHeight;
  const h = thumbHeight.value;
  const doc = document.documentElement;
  const content = doc.scrollHeight;
  const viewport = doc.clientHeight;
  const scrollable = content - viewport;
  const trackTravel = trackH - h;
  if (trackTravel <= 0) return;
  const delta = (dy / trackTravel) * scrollable;
  window.scrollTo({ top: dragStartScroll + delta });
}

function onDragEnd() {
  if (!dragging.value) return;
  dragging.value = false;
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragEnd);
  window.removeEventListener('pointercancel', onDragEnd);
  document.body.style.userSelect = '';
  flashVisible();
}

let resizeObserver = null;
let mutationObserver = null;

onMounted(() => {
  pointerFineMedia = window.matchMedia('(pointer: fine)');
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  resizeObserver = new ResizeObserver(() => scheduleUpdate());
  resizeObserver.observe(document.documentElement);
  resizeObserver.observe(document.body);
  mutationObserver = new MutationObserver(() => scheduleUpdate());
  mutationObserver.observe(document.body, { childList: true, subtree: true });
  scheduleUpdate();
  setTimeout(flashVisible, 300);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragEnd);
  window.removeEventListener('pointercancel', onDragEnd);
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
  if (hideTimer) clearTimeout(hideTimer);
  if (rafId) cancelAnimationFrame(rafId);
});

const showBar = computed(() => visible.value && thumbHeight.value > 0);

const thumbStyle = computed(() => ({
  height: `${thumbHeight.value}px`,
  transform: `translateY(${thumbTop.value}px)`,
}));
</script>

<template>
  <div
    ref="trackRef"
    :class="['bl-scrollbar', { 'is-visible': showBar, 'is-active': active || dragging }]"
    @pointerenter="onTrackEnter"
    @pointerleave="onTrackLeave"
    @click="onTrackClick"
    aria-hidden="true"
  >
    <div
      ref="thumbRef"
      class="bl-scrollbar__thumb"
      :style="thumbStyle"
      @pointerdown="onThumbPointerDown"
    ></div>
  </div>
</template>

<style scoped>
.bl-scrollbar {
  position: fixed;
  top: 0;
  right: 2px;
  bottom: 0;
  width: 10px;
  z-index: 2147483000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease, width 0.18s ease;
}

.bl-scrollbar.is-visible {
  opacity: 1;
  pointer-events: auto;
}

.bl-scrollbar.is-active {
  width: 14px;
}

.bl-scrollbar__thumb {
  position: absolute;
  top: 0;
  right: 2px;
  width: 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.28);
  transition: background 0.18s ease, width 0.18s ease, right 0.18s ease;
  cursor: grab;
}

.bl-scrollbar.is-active .bl-scrollbar__thumb {
  width: 10px;
  right: 2px;
  background: rgba(0, 0, 0, 0.45);
}

.bl-scrollbar__thumb:active {
  cursor: grabbing;
  background: rgba(0, 0, 0, 0.6);
}

@media (hover: none) and (pointer: coarse) {
  .bl-scrollbar {
    display: none;
  }
}
</style>
