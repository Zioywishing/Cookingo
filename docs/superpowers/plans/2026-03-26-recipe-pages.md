# Recipe Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mock-data-backed recipe selection page and a mobile-first cooking runtime page with single-card step transitions and async task timers.

**Architecture:** Keep route pages thin and move runtime scheduling into a dedicated composable. Mock recipe data stays in a front-end composable so the UI can ship now and swap to real data later without reshaping page contracts.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, TypeScript, Bun test

---

### Task 1: Add runtime regression tests

**Files:**
- Create: `test/useRecipeRuntime.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**
  Cover stack-top selection, normal next-step progression, async wait scheduling, and async completion insertion.

- [ ] **Step 2: Run test to verify it fails**
  Run: `bun test test/useRecipeRuntime.test.ts`
  Expected: FAIL because runtime composable does not exist yet.

- [ ] **Step 3: Add test script**
  Add `test` script in `package.json` for consistent verification.

- [ ] **Step 4: Run test to verify it still fails for the right reason**
  Run: `bun test test/useRecipeRuntime.test.ts`
  Expected: FAIL on missing module or missing exported functions.

### Task 2: Implement mock recipes and runtime composable

**Files:**
- Create: `composables/useMockRecipes.ts`
- Create: `composables/useRecipeRuntime.ts`

- [ ] **Step 1: Implement mock recipe provider**
  Return a small mock recipe catalog that exercises normal steps, blocked `prev`, and `async.waitMinutes`.

- [ ] **Step 2: Implement runtime scheduler**
  Support current step selection, completion, async task queueing, async task restoration, and blocked-state derivation.

- [ ] **Step 3: Run runtime tests**
  Run: `bun test test/useRecipeRuntime.test.ts`
  Expected: PASS

### Task 3: Build recipe selection page

**Files:**
- Create: `components/recipe/RecipeSelectCard.vue`
- Create: `pages/recipes/index.vue`

- [ ] **Step 1: Build reusable selection card**
  Show cover, name, description, tags, difficulty, and CTA.

- [ ] **Step 2: Build recipes page**
  Render mock recipes in a mobile-first list/grid and route to cooking page.

- [ ] **Step 3: Smoke-check route structure**
  Ensure page uses Nuxt standard `pages/` routing only.

### Task 4: Build cooking runtime page and motion components

**Files:**
- Create: `components/recipe/RecipeAsyncTimerPanel.vue`
- Create: `components/recipe/RecipeRuntimeCard.vue`
- Create: `pages/cook/[id].vue`

- [ ] **Step 1: Build async timer panel**
  Surface all waiting tasks in the top-right area with countdown display.

- [ ] **Step 2: Build single-card runtime component**
  Show one current step card, blocked state, ingredients, equipment, tips, and completion button.

- [ ] **Step 3: Add card transition choreography**
  Animate step completion with downward exit and next/async-restored cards with top-entry motion while keeping only one persistent card visible.

- [ ] **Step 4: Compose runtime page**
  Load mock recipe by id, show summary header, timer panel, and the single current-step area with portrait-first layout.

### Task 5: Verify feature end-to-end

**Files:**
- Verify only

- [ ] **Step 1: Run unit tests**
  Run: `bun test`
  Expected: PASS

- [ ] **Step 2: Run production build**
  Run: `bun run build`
  Expected: PASS

- [ ] **Step 3: Manually review key requirements**
  Confirm both pages exist, runtime is single-card, async timers render, and layout remains portrait-first.
