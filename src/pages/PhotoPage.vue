<template>
  <iframe
    class="iframe-fullpage"
    src="https://mcphoto.lunadeer.cn/"
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
