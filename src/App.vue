<template>
  <main class="app-shell">
    <section class="hero-card">
      <p class="eyebrow">Vue Migration Workspace</p>
      <h1>白鹿原官网 Vue 重构基座已就绪</h1>
      <p class="intro">
        这里是新的 Vue 入口。旧版静态站仍保留在 old-html-ver 目录中，已迁入的新工作流会从 public 目录提供数据与静态资源。
      </p>
    </section>

    <section class="status-grid">
      <article>
        <h2>public 资源</h2>
        <p>旧站数据文件、统计 JSON 与 SEO 静态文件会从这里进入 Vite 构建产物。</p>
      </article>
      <article>
        <h2>scripts 任务</h2>
        <p>玩家统计脚本已迁到根目录工作流，可在构建前更新 public/stats。</p>
      </article>
      <article>
        <h2>下一步</h2>
        <p>后续可以在 src 下逐页重建组件、路由和布局，而不需要再改项目基础设施。</p>
      </article>
    </section>
  </main>
</template>