<script setup lang="ts">
import { computed, ref } from "vue";
import SelectRecipesCard from "~/components/main/select-recipes/SelectRecipesCard.vue";
import SelectRecipesFilterPanel from "~/components/main/select-recipes/SelectRecipesFilterPanel.vue";

type SelectRecipesDifficulty = "easy" | "medium" | "hard";

type SelectRecipeItem = {
  id: string;
  name: string;
  description: string;
  difficulty: SelectRecipesDifficulty;
  difficultyLabel: string;
  durationLabel: string;
  tags: string[];
  equipment: string[];
  imageUrl: string | null;
};

type SelectRecipesFilterOption = {
  value: string;
  label: string;
};

const difficultyOptions: SelectRecipesFilterOption[] = [
  { value: "easy", label: "新手友好" },
  { value: "medium", label: "进阶挑战" },
  { value: "hard", label: "大厨级别" },
];

const tagOptions: SelectRecipesFilterOption[] = [
  { value: "快手菜", label: "快手菜" },
  { value: "减脂", label: "减脂" },
  { value: "高蛋白", label: "高蛋白" },
  { value: "汤羹", label: "汤羹" },
];

const equipmentOptions: SelectRecipesFilterOption[] = [
  { value: "平底锅", label: "平底锅" },
  { value: "烤箱", label: "烤箱" },
  { value: "空气炸锅", label: "空气炸锅" },
  { value: "炖锅", label: "炖锅" },
];

const mockRecipes: SelectRecipeItem[] = [
  {
    id: "rosemary-steak",
    name: "迷迭香煎牛排",
    description: "外焦里嫩，肉汁饱满的经典西餐。",
    difficulty: "medium",
    difficultyLabel: "进阶",
    durationLabel: "18分钟",
    tags: ["牛排", "快手菜"],
    equipment: ["平底锅"],
    imageUrl: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&q=80&w=320&h=320",
  },
  {
    id: "stir-fried-vegetables",
    name: "清炒时蔬",
    description: "低脂清爽，工作日也能快速完成的一盘绿意。",
    difficulty: "easy",
    difficultyLabel: "轻松",
    durationLabel: "5分钟",
    tags: ["减脂", "快手菜"],
    equipment: ["平底锅"],
    imageUrl: null,
  },
  {
    id: "roast-chicken",
    name: "法式烤春鸡",
    description: "香草腌制后慢烤，表皮酥脆，内部多汁。",
    difficulty: "hard",
    difficultyLabel: "大厨",
    durationLabel: "70分钟",
    tags: ["高蛋白"],
    equipment: ["烤箱"],
    imageUrl: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=320&h=320",
  },
  {
    id: "shrimp-avocado-salad",
    name: "鲜虾牛油果沙拉",
    description: "清爽解腻，适合晚餐和周末轻食。",
    difficulty: "easy",
    difficultyLabel: "轻松",
    durationLabel: "10分钟",
    tags: ["高蛋白", "减脂"],
    equipment: ["空气炸锅"],
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=320&h=320",
  },
  {
    id: "beef-stew",
    name: "番茄土豆炖牛腩",
    description: "酸香浓郁，适合慢慢炖出层次感的家常硬菜。",
    difficulty: "medium",
    difficultyLabel: "进阶",
    durationLabel: "60分钟",
    tags: ["汤羹"],
    equipment: ["炖锅"],
    imageUrl: "https://images.unsplash.com/photo-1548943487-a2e4f43b4850?auto=format&fit=crop&q=80&w=320&h=320",
  },
];

const searchKeyword = ref("");
const isFilterPanelOpen = ref(false);
const activeDifficulty = ref<string | null>(null);
const activeTag = ref<string | null>(null);
const activeEquipment = ref<string | null>(null);
const selectedRecipeIds = ref<string[]>([]);

const normalizedSearchKeyword = computed(() => searchKeyword.value.trim().toLowerCase());

const filteredRecipes = computed(() => {
  return mockRecipes.filter((recipe) => {
    const matchesSearch =
      normalizedSearchKeyword.value.length === 0 ||
      [recipe.name, recipe.description, ...recipe.tags, ...recipe.equipment]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearchKeyword.value);

    const matchesDifficulty =
      activeDifficulty.value === null || recipe.difficulty === activeDifficulty.value;
    const matchesTag = activeTag.value === null || recipe.tags.includes(activeTag.value);
    const matchesEquipment =
      activeEquipment.value === null || recipe.equipment.includes(activeEquipment.value);

    return matchesSearch && matchesDifficulty && matchesTag && matchesEquipment;
  });
});

const selectedCount = computed(() => selectedRecipeIds.value.length);
const selectedCountLabel = computed(() => `开启烹饪之旅 (${selectedCount.value})`);

function toggleFilterPanel() {
  isFilterPanelOpen.value = !isFilterPanelOpen.value;
}

function toggleSingleFilter(
  state: typeof activeDifficulty | typeof activeTag | typeof activeEquipment,
  value: string,
) {
  state.value = state.value === value ? null : value;
}

function toggleDifficultyFilter(value: string) {
  toggleSingleFilter(activeDifficulty, value);
}

function toggleTagFilter(value: string) {
  toggleSingleFilter(activeTag, value);
}

function toggleEquipmentFilter(value: string) {
  toggleSingleFilter(activeEquipment, value);
}

function toggleRecipeSelection(recipeId: string) {
  if (selectedRecipeIds.value.includes(recipeId)) {
    selectedRecipeIds.value = selectedRecipeIds.value.filter((item) => item !== recipeId);
    return;
  }

  selectedRecipeIds.value = [...selectedRecipeIds.value, recipeId];
}
</script>

<template>
  <section class="select-recipes-page">
    <div class="select-recipes-page__top">
      <SelectRecipesFilterPanel
        v-model:search-keyword="searchKeyword"
        :is-open="isFilterPanelOpen"
        :difficulty-options="difficultyOptions"
        :tag-options="tagOptions"
        :equipment-options="equipmentOptions"
        :active-difficulty="activeDifficulty"
        :active-tag="activeTag"
        :active-equipment="activeEquipment"
        @toggle-panel="toggleFilterPanel"
        @toggle-difficulty="toggleDifficultyFilter"
        @toggle-tag="toggleTagFilter"
        @toggle-equipment="toggleEquipmentFilter"
      />
    </div>

    <div class="select-recipes-page__list">
      <SelectRecipesCard
        v-for="(recipe, index) in filteredRecipes"
        :key="recipe.id"
        :recipe="recipe"
        :selected="selectedRecipeIds.includes(recipe.id)"
        :animation-delay-ms="120 + index * 80"
        @select="toggleRecipeSelection(recipe.id)"
      />

      <div v-if="filteredRecipes.length === 0" class="select-recipes-page__empty">
        <h2>没有找到匹配的菜谱</h2>
        <p>可以换个关键词，或者先清掉筛选标签再看看。</p>
      </div>
    </div>

    <div class="recipe-fab" :class="{ 'recipe-fab--visible': selectedCount > 0 }">
      <button type="button" class="recipe-fab__button">
        <span>{{ selectedCountLabel }}</span>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12H19" />
          <path d="M19 12L12 5" />
          <path d="M19 12L12 19" />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.select-recipes-page {
  min-height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 3.75rem 1.5rem calc(2rem + env(safe-area-inset-bottom, 0px));
}

.select-recipes-page__top {
  display: grid;
  gap: 1rem;
}

.select-recipes-page__list {
  display: grid;
  gap: 0.95rem;
  padding-bottom: 5.75rem;
}

.select-recipes-page__empty {
  display: grid;
  gap: 0.55rem;
  padding: 1.6rem;
  border-radius: 1.7rem;
  background: color-mix(in srgb, var(--app-theme-surface-elevated) 94%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--app-theme-text-primary) 7%, transparent);
  text-align: center;
}

.select-recipes-page__empty h2 {
  margin: 0;
  color: var(--app-theme-text-primary);
  font-size: 1.1rem;
}

.select-recipes-page__empty p {
  margin: 0;
  color: var(--app-theme-text-secondary);
  line-height: 1.5;
}

.recipe-fab {
  position: sticky;
  bottom: calc(3rem + env(safe-area-inset-bottom, 0px));
  z-index: 2;
  margin-top: auto;
  pointer-events: none;
  transform: translate3d(0, 6rem, 0);
  opacity: 0;
  transition:
    transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 220ms ease;
}

.recipe-fab--visible {
  transform: translate3d(0, 0, 0);
  opacity: 1;
}

.recipe-fab__button {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 3.9rem;
  padding: 0 1.5rem;
  border: none;
  border-radius: 999px;
  background: var(--app-theme-action-primary);
  color: var(--app-theme-action-primary-text);
  font-size: 1rem;
  font-weight: 700;
  pointer-events: auto;
  box-shadow: 0 1rem 2.2rem color-mix(in srgb, var(--app-theme-glow) 90%, transparent);
  transition:
    transform 180ms ease,
    background-color 320ms ease,
    color 320ms ease,
    box-shadow 320ms ease;
}

.recipe-fab__button:active {
  transform: scale(0.98);
}

.recipe-fab__button svg {
  width: 1.2rem;
  height: 1.2rem;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (min-width: 768px) {
  .select-recipes-page {
    padding-top: 3.25rem;
  }
}
</style>
