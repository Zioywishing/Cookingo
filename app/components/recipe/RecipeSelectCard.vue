<script setup lang="ts">
import { computed } from "vue";

import { RecipeDifficulty } from "#shared/types/recipe";
import type { IRecipeSchema } from "#shared/types/recipe";

const props = defineProps<{
  recipe: IRecipeSchema;
}>();

const difficultyText = computed(() => {
  switch (props.recipe.meta.difficulty) {
    case RecipeDifficulty.Easy:
      return "轻松上手";
    case RecipeDifficulty.Medium:
      return "需要一点节奏";
    case RecipeDifficulty.Hard:
      return "讲究火候";
    default:
      return "难度未标注";
  }
});
</script>

<template>
  <article class="recipe-select-card">
    <div class="recipe-select-card__visual">
      <img
        :src="recipe.meta.coverImageUrl"
        :alt="recipe.meta.name"
        class="recipe-select-card__image"
      >
    </div>

    <div class="recipe-select-card__body">
      <div class="recipe-select-card__eyebrow">
        <span>{{ difficultyText }}</span>
        <span>{{ recipe.meta.servings ?? 1 }} 人份</span>
      </div>

      <div class="recipe-select-card__copy">
        <h2>{{ recipe.meta.name }}</h2>
        <p>{{ recipe.meta.description }}</p>
      </div>

      <ul class="recipe-select-card__tags">
        <li
          v-for="tag in recipe.meta.tags"
          :key="tag"
        >
          {{ tag }}
        </li>
      </ul>

      <div class="recipe-select-card__footer">
        <div class="recipe-select-card__meta">
          <span>{{ recipe.meta.ingredients.length }} 种主要食材</span>
          <span>{{ recipe.meta.equipment?.length ?? 0 }} 个厨具</span>
        </div>

        <NuxtLink
          :to="`/cook/${recipe.meta.id}`"
          class="recipe-select-card__cta"
        >
          开始准备
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.recipe-select-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.75rem;
  background:
    linear-gradient(145deg, rgba(255, 252, 247, 0.96), rgba(255, 243, 226, 0.96));
  border: 1px solid rgba(145, 84, 34, 0.12);
  box-shadow: 0 1.2rem 2.8rem rgba(80, 41, 15, 0.08);
}

.recipe-select-card__visual {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 1.25rem;
}

.recipe-select-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.recipe-select-card__body {
  display: grid;
  gap: 0.9rem;
}

.recipe-select-card__eyebrow,
.recipe-select-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: #8a5227;
  font-size: 0.85rem;
}

.recipe-select-card__copy h2 {
  margin: 0;
  font-size: clamp(1.4rem, 4vw, 1.8rem);
  color: #40220f;
}

.recipe-select-card__copy p {
  margin: 0.45rem 0 0;
  color: #744c2c;
  line-height: 1.65;
}

.recipe-select-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.recipe-select-card__tags li {
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 235, 210, 0.82);
  color: #9d5824;
  font-size: 0.85rem;
}

.recipe-select-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.recipe-select-card__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 6.75rem;
  padding: 0.8rem 1.1rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #d96e2c, #bc4c15);
  color: #fffdf9;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 0.8rem 1.8rem rgba(188, 76, 21, 0.22);
}

@media (min-width: 800px) {
  .recipe-select-card {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    align-items: stretch;
  }

  .recipe-select-card__visual {
    aspect-ratio: auto;
    min-height: 100%;
  }
}
</style>
