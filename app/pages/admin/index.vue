<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <section class="panel">
    <div class="intro">
      <h1>管理后台占位页</h1>
      <p class="description">
        这里是内部管理区域，后续会逐步接入菜谱管理、分类管理、内容审核和系统设置。
      </p>
    </div>

    <div class="modules">
      <article>
        <h2>菜谱管理</h2>
        <p>新增、编辑、发布和下线菜谱内容。</p>
      </article>
      <article>
        <h2>分类管理</h2>
        <p>维护食材、菜系、场景与标签体系。</p>
      </article>
      <article>
        <h2>运营设置</h2>
        <p>后续放置推荐位、审核流与系统配置。</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.panel {
  padding: 32px;
  border: 1px solid rgba(191, 219, 254, 0.2);
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.52);
  box-shadow: 0 20px 60px rgba(2, 6, 23, 0.35);
}

.intro {
  max-width: 720px;
}

h1 {
  margin: 0;
  font-size: clamp(1.8rem, 5vw, 3rem);
}

.description {
  margin: 18px 0 0;
  line-height: 1.8;
  color: #cbd5e1;
}

.modules {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 32px;
}

article {
  padding: 20px;
  border-radius: 22px;
  background: rgba(30, 41, 59, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

h2 {
  margin: 0 0 10px;
  font-size: 1.02rem;
}

article p {
  margin: 0;
  line-height: 1.7;
  color: #cbd5e1;
}

@media (max-width: 820px) {
  .modules {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .panel {
    padding: 22px 18px;
    border-radius: 22px;
  }
}
</style>
