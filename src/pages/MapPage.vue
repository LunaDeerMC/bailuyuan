<template>
  <iframe
    class="iframe-fullpage"
    src="https://mcmap.lunadeer.cn/#world:2710:0:-1575:2531:0:0:0:1:flat"
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
