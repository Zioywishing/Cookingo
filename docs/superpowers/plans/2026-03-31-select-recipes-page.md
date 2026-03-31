# Select Recipes Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/main/select-recipes` page as a new content-layer-only front-end implementation that matches the demo layout and interactions without reusing existing recipe page code.

**Architecture:** Keep page-level state in `app/pages/main/select-recipes.vue`, and split the view into two page-private components under `app/components/main/select-recipes/` for the filter panel and recipe card. Use local mock data plus computed filtering and selection state, while consuming the existing `--app-theme-*` variables and avoiding any page-owned background shell.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, TypeScript, UnoCSS utility classes, scoped CSS, Bun test

---

### Task 1: Lock in the page contract with failing tests

**Files:**
- Create: `test/selectRecipesPage.test.ts`
- Modify: `app/pages/main/select-recipes.vue`
- Create: `app/components/main/select-recipes/SelectRecipesFilterPanel.vue`
- Create: `app/components/main/select-recipes/SelectRecipesCard.vue`

- [ ] **Step 1: Write the failing test**

```ts
test("implements the select recipes page with page-private components and local interaction state", () => {
  const page = readProjectFile("app/pages/main/select-recipes.vue");

  expect(page).toContain("SelectRecipesFilterPanel");
  expect(page).toContain("SelectRecipesCard");
  expect(page).toContain("searchKeyword");
  expect(page).toContain("selectedRecipeIds");
  expect(page).toContain("filteredRecipes");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test test/selectRecipesPage.test.ts`
Expected: FAIL because the page is still placeholder content.

- [ ] **Step 3: Expand the failing test to cover the main visual contract**

```ts
expect(page).not.toContain("ambient-layer");
expect(page).not.toContain("device-frame");
expect(page).toContain("开启烹饪之旅");
expect(page).toContain("recipe-fab");
expect(filterPanel).toContain("搜索菜谱、食材或标签");
expect(card).toContain("recipe-card");
```

- [ ] **Step 4: Run test again to verify the full contract still fails**

Run: `bun test test/selectRecipesPage.test.ts`
Expected: FAIL with missing expected strings from the new implementation contract.

### Task 2: Implement the page-private components

**Files:**
- Create: `app/components/main/select-recipes/SelectRecipesFilterPanel.vue`
- Create: `app/components/main/select-recipes/SelectRecipesCard.vue`
- Test: `test/selectRecipesPage.test.ts`

- [ ] **Step 1: Implement `SelectRecipesFilterPanel.vue` with props and emits matching the page state**

```vue
<script setup lang="ts">
const props = defineProps<{ ... }>();
const emit = defineEmits<{ ... }>();
</script>
```

- [ ] **Step 2: Implement `SelectRecipesCard.vue` with display-only props and selected-state styling**

```vue
<script setup lang="ts">
const props = defineProps<{ recipe: SelectRecipeItem; selected: boolean; animationDelayMs: number }>();
</script>
```

- [ ] **Step 3: Keep both components page-private in responsibility**

Do not import `app/components/recipe/*` or `shared/types/recipe.ts`.

- [ ] **Step 4: Run `bun test test/selectRecipesPage.test.ts`**

Expected: still FAIL, because the page container has not yet wired state and rendering.

### Task 3: Implement page state, rendering, and interactions

**Files:**
- Modify: `app/pages/main/select-recipes.vue`
- Test: `test/selectRecipesPage.test.ts`

- [ ] **Step 1: Add local mock recipe data and page-private TypeScript types**

```ts
type SelectRecipesDifficulty = "easy" | "medium" | "hard";
interface SelectRecipeItem { ... }
```

- [ ] **Step 2: Add reactive state for search, filter panel, active chips, and selected ids**

```ts
const searchKeyword = ref("");
const isFilterPanelOpen = ref(false);
const activeDifficulty = ref<string | null>(null);
const selectedRecipeIds = ref<string[]>([]);
```

- [ ] **Step 3: Add computed filtering, count text, and selection toggles**

```ts
const filteredRecipes = computed(() => ...);
function toggleRecipeSelection(recipeId: string) { ... }
```

- [ ] **Step 4: Render the page with top controls, results list, empty state, and floating CTA**

Run: `bun test test/selectRecipesPage.test.ts`
Expected: PASS

### Task 4: Refine styles to respect the existing layout shell

**Files:**
- Modify: `app/pages/main/select-recipes.vue`
- Modify: `app/components/main/select-recipes/SelectRecipesFilterPanel.vue`
- Modify: `app/components/main/select-recipes/SelectRecipesCard.vue`
- Test: `test/selectRecipesPage.test.ts`

- [ ] **Step 1: Use only content-layer styles built on `--app-theme-*` variables**

Do not introduce full-page background wrappers or ambient shells.

- [ ] **Step 2: Add motion for card reveal, filter panel expansion, and floating CTA visibility**

Keep transitions lightweight and local to the content layer.

- [ ] **Step 3: Re-run `bun test test/selectRecipesPage.test.ts`**

Expected: PASS

### Task 5: Verify project quality gates

**Files:**
- Verify only

- [ ] **Step 1: Run targeted tests**

Run: `bun test test/selectRecipesPage.test.ts`
Expected: PASS

- [ ] **Step 2: Run the required quality check**

Run: `bun quality-check`
Expected: exit code 0 with no typecheck or oxlint errors

- [ ] **Step 3: Review changed files**

Run: `git diff -- app/pages/main/select-recipes.vue app/components/main/select-recipes/SelectRecipesFilterPanel.vue app/components/main/select-recipes/SelectRecipesCard.vue test/selectRecipesPage.test.ts docs/superpowers/specs/2026-03-31-select-recipes-page-design.md docs/superpowers/plans/2026-03-31-select-recipes-page.md`
Expected: only current-task files are changed
