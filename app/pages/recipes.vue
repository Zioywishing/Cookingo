<script setup lang="ts">
import { useRecipes } from "../composables/useRecipes";

defineOptions({
  name: "RecipesPage",
});

useSeoMeta({
  title: "选菜谱 | Cookingo",
  description: "选择今天想做的菜，再进入单卡片 cooking runtime。",
});

const { recipes } = useRecipes();
</script>

<template>
  <main class="recipes-page">
    <section class="recipes-page__hero">
      <p>Cookingo</p>
      <h1>今天想做哪一道</h1>
      <p class="recipes-page__description">
        先选菜，再进入单卡片 cooking runtime。
      </p>
    </section>

    <section class="recipes-page__list">
      <RecipeSelectCard
        v-for="recipe in recipes"
        :key="recipe.meta.id"
        :recipe="recipe"
      />
    </section>
  </main>
</template>

<style scoped>
.recipes-page {
  min-height: 100vh;
  padding: 1.25rem 1rem 2.5rem;
  background:
    radial-gradient(circle at top, rgba(255, 200, 120, 0.28), transparent 24%),
    linear-gradient(180deg, #fffaf4 0%, #fff1e1 45%, #fff7ee 100%);
}

.recipes-page__hero {
  width: min(100%, 46rem);
  margin: 0 auto 1.5rem;
}

.recipes-page__hero > p:first-child {
  margin: 0;
  color: #bc5a1f;
  font-size: 0.85rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.recipes-page__hero h1 {
  margin: 0.55rem 0 0;
  color: #3f220e;
  font-size: clamp(2.3rem, 10vw, 4.7rem);
  line-height: 0.95;
}

.recipes-page__description {
  margin: 1rem 0 0;
  max-width: 32rem;
  color: #70492a;
  line-height: 1.75;
  font-size: 1rem;
}

.recipes-page__list {
  display: grid;
  gap: 1rem;
  width: min(100%, 72rem);
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .recipes-page {
    padding: 2rem 1.5rem 3rem;
  }

  .recipes-page__list {
    gap: 1.35rem;
  }
}
</style>
