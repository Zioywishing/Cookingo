<script setup lang="ts">
import { computed, shallowRef, watch } from "vue";

import { useRecipes } from "../../composables/useRecipes";
import { useRecipeRuntime } from "../../composables/useRecipeRuntime";
import { RecipeDifficulty } from "#shared/types/recipe";

type IRecipeProcessNode = import("#shared/types/recipe").IRecipeProcessNode;
type IRecipeSchema = import("#shared/types/recipe").IRecipeSchema;

defineOptions({
  name: "CookRecipePage",
});

definePageMeta({
  layout: false,
});

const route = useRoute();
const { getRecipeById, pending } = useRecipes();

const recipe = computed(() => getRecipeById(route.params.id as string));
const runtime = shallowRef<ReturnType<typeof useRecipeRuntime>>();

watch(
  recipe,
  (currentRecipe, _previousRecipe, onCleanup) => {
    runtime.value?.dispose?.();
    const currentRuntime = currentRecipe
      ? useRecipeRuntime(currentRecipe)
      : undefined;
    runtime.value = currentRuntime;
    onCleanup(() => {
      currentRuntime?.dispose?.();
    });
  },
  {
    immediate: true,
  },
);

function walkNodes(
  heads: IRecipeProcessNode[] | undefined,
  callback: (node: IRecipeProcessNode) => void,
) {
  const visit = (node: IRecipeProcessNode | undefined) => {
    if (!node) {
      return;
    }

    callback(node);
    visit(node.next);
  };

  heads?.forEach(visit);
}

function estimateMinutes(targetRecipe: IRecipeSchema) {
  let total = 0;

  walkNodes(targetRecipe.prepare, (node) => {
    total += node.durationMinutes ?? 0;
    total += node.async?.waitMinutes ?? 0;
  });

  walkNodes(targetRecipe.process, (node) => {
    total += node.durationMinutes ?? 0;
    total += node.async?.waitMinutes ?? 0;
  });

  return total;
}

const difficultyText = computed(() => {
  switch (recipe.value?.meta.difficulty) {
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

const totalMinutes = computed(() =>
  recipe.value ? estimateMinutes(recipe.value) : 0,
);

const activePhaseLabel = computed(() => {
  switch (runtime.value?.activePhase.value) {
    case "prepare":
      return "准备阶段";
    case "process":
      return "烹饪阶段";
    case "finished":
      return "已完成";
    default:
      return "进行中";
  }
});

const transitionName = computed(() => {
  if (runtime.value?.lastTransition.value === "async-ready") {
    return "runtime-card-async";
  }

  return "runtime-card-advance";
});

const transitionKey = computed(() => {
  if (!runtime.value) {
    return "recipe-not-found";
  }

  return [
    runtime.value.activePhase.value,
    runtime.value.currentStep.value?.id ?? "resting",
    runtime.value.lastTransition.value,
    runtime.value.transitionKey.value,
    runtime.value.hasFinished.value ? "finished" : "running",
  ].join("-");
});

useSeoMeta({
  title: () =>
    recipe.value
      ? `开始做菜：${recipe.value.meta.name} | Cookingo`
      : "开始做菜 | Cookingo",
  description: () =>
    recipe.value
      ? `单卡片 cooking runtime：${recipe.value.meta.name}`
      : "单卡片 cooking runtime",
});
</script>

<template>
  <main class="cook-page">
    <section
      v-if="recipe && runtime"
      class="cook-page__shell"
    >
      <header class="cook-page__header">
        <div class="cook-page__intro">
          <NuxtLink
            to="/"
            class="cook-page__back"
          >
            返回选菜谱
          </NuxtLink>

          <p class="cook-page__kicker">Cookingo Runtime</p>
          <h1>{{ recipe.meta.name }}</h1>
          <p class="cook-page__description">
            {{ recipe.meta.description }}
          </p>

          <div class="cook-page__meta">
            <span>{{ activePhaseLabel }}</span>
            <span>{{ difficultyText }}</span>
            <span>预计 {{ totalMinutes }} 分钟</span>
            <span>{{ recipe.meta.ingredients.length }} 种食材</span>
          </div>
        </div>

        <div class="cook-page__timers">
          <RecipeAsyncTimerPanel :tasks="runtime.asyncTasks.value" />
        </div>
      </header>

      <section class="cook-page__stage">
        <Transition
          mode="out-in"
          :name="transitionName"
        >
          <RecipeRuntimeCard
            :key="transitionKey"
            :step="runtime.currentStep.value"
            :blocked="runtime.isCurrentStepBlocked.value"
            :finished="runtime.hasFinished.value"
            :has-async-tasks="runtime.asyncTasks.value.length > 0"
            @complete="runtime.completeCurrentStep"
          />
        </Transition>
      </section>
    </section>

    <section
      v-else-if="pending"
      class="cook-page__empty"
    >
      <p>正在加载菜谱...</p>
    </section>

    <section
      v-else
      class="cook-page__empty"
    >
      <p>没有找到对应的菜谱。</p>
      <NuxtLink to="/">
        回到选菜谱
      </NuxtLink>
    </section>
  </main>
</template>

<style scoped>
.cook-page {
  min-height: 100vh;
  padding: 0.9rem 0.9rem 1.4rem;
  background:
    radial-gradient(circle at top, rgba(255, 182, 101, 0.26), transparent 22%),
    linear-gradient(180deg, #fff9f1 0%, #fff2df 46%, #fff7ef 100%);
}

.cook-page__shell {
  display: grid;
  gap: 1rem;
  width: min(100%, 72rem);
  margin: 0 auto;
}

.cook-page__header {
  display: grid;
  gap: 0.9rem;
}

.cook-page__intro {
  display: grid;
  gap: 0.65rem;
}

.cook-page__back {
  display: inline-flex;
  width: fit-content;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 248, 236, 0.92);
  color: #8d5026;
  text-decoration: none;
}

.cook-page__kicker {
  margin: 0.2rem 0 0;
  color: #c05c1e;
  font-size: 0.85rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.cook-page__intro h1 {
  margin: 0;
  color: #3d200d;
  font-size: clamp(2.3rem, 9vw, 4.4rem);
  line-height: 0.94;
}

.cook-page__description {
  margin: 0;
  color: #734a2d;
  line-height: 1.7;
}

.cook-page__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.cook-page__meta span {
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 243, 228, 0.82);
  color: #9a5827;
  font-size: 0.88rem;
}

.cook-page__timers {
  justify-self: stretch;
}

.cook-page__stage {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 18rem);
  padding: 0.25rem 0 1rem;
}

.cook-page__empty {
  display: grid;
  place-items: center;
  gap: 0.8rem;
  min-height: 100vh;
  color: #5c3015;
}

.cook-page__empty a {
  color: #bc4d16;
}

.runtime-card-advance-enter-active,
.runtime-card-advance-leave-active,
.runtime-card-async-enter-active,
.runtime-card-async-leave-active {
  transition:
    transform 0.36s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s ease,
    filter 0.32s ease;
}

.runtime-card-advance-enter-from {
  opacity: 0;
  transform: translateY(-2.2rem) scale(0.97);
  filter: blur(10px);
}

.runtime-card-advance-leave-to {
  opacity: 0;
  transform: translateY(2.6rem) scale(0.95);
  filter: blur(12px);
}

.runtime-card-async-enter-from {
  opacity: 0;
  transform: translateY(-4rem) scale(0.95);
  filter: blur(12px);
}

.runtime-card-async-leave-to {
  opacity: 0;
  transform: translateY(2.6rem) scale(0.95);
  filter: blur(12px);
}

@media (min-width: 900px) and (orientation: landscape) {
  .cook-page {
    padding: 1.2rem;
  }

  .cook-page__header {
    grid-template-columns: minmax(0, 1.2fr) minmax(20rem, 0.8fr);
    align-items: start;
  }

  .cook-page__timers {
    justify-self: end;
    width: min(100%, 23rem);
  }

  .cook-page__stage {
    min-height: calc(100vh - 15rem);
  }
}
</style>
