<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const defaultHash = '#world:2710:0:-1575:2531:0:0:0:1:flat';

const iframeSrc = computed(() => {
  const hash = route.hash || defaultHash;
  return `https://mcmap.lunadeer.cn/${hash}`;
});
</script>

<template>
  <iframe
    class="iframe-fullpage"
    :src="iframeSrc"
    frameborder="0"
    allowfullscreen
  ></iframe>
</template>

<style scoped>
.iframe-fullpage {
  position: fixed;
  top: var(--bl-topbar-offset);
  left: 0;
  width: 100%;
  height: calc(100vh - var(--bl-topbar-offset));
  border: none;
}
</style>
