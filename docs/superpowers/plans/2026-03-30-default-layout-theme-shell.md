# Default Layout Theme Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将前台时间主题统一收口到 `useGlobalTheme`，通过 SSR 输出的前置脚本在 hydration 前按用户本地时间注入 `--app-theme-*`，同时把首页背景壳层迁移到 `default layout` 且保持首页视觉不变。

**Architecture:** 在 `app/app.vue` 承载非视觉入口级主题注入逻辑，只为默认布局页面输出 `useGlobalTheme` 生成的前置脚本；`default layout` 只消费全局主题变量并承接背景 shell、frame、ambient、view 分层。首页保留内容视图与内容动画，首页专属文案状态从现有 `useHomepageTheme` 中剥离颜色职责，改为仅关注本地时间标签与文案。

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Bun test, scoped CSS in `.vue` SFCs

---

## File Map

### Entry-Level Theme Injection

- Modify: `app/app.vue`
- Create: `app/composables/useGlobalTheme.ts`
- Test: `test/cEndLayout.test.ts`
- Test: `test/useGlobalTheme.test.ts`

Responsibilities:

- `app/app.vue` only decides whether the current route should output the front-theme bootstrap script.
- `useGlobalTheme.ts` owns time-segment-to-color mapping, variable serialization, and SSR inline script generation.
- `test/useGlobalTheme.test.ts` verifies the new composable API and generated bootstrap script content.
- `test/cEndLayout.test.ts` verifies the app shell references the new injection path and keeps admin pages out of it.

### Layout Shell

- Modify: `app/layouts/default.vue`
- Test: `test/cEndLayout.test.ts`

Responsibilities:

- `default.vue` becomes the visual shell for C-end pages.
- It consumes `var(--app-theme-*)` only, and does not compute theme data.

### Homepage View Content

- Modify: `app/pages/index.vue`
- Modify: `app/composables/useHomepageTheme.ts`
- Delete: `app/utils/timezone.ts` if no longer referenced after the refactor
- Test: `test/homepageEntryPage.test.ts`
- Test: `test/useHomepageTheme.test.ts`

Responsibilities:

- `index.vue` keeps the homepage content tree and content-specific animations.
- `useHomepageTheme.ts` becomes homepage-content-only state: local-time label, segment label, time range, and headline rotation.
- `timezone.ts` should be removed if it becomes dead code after removing fixed `UTC+8` logic.

## Task 1: Add the global theme composable and bootstrap script API

**Files:**
- Create: `app/composables/useGlobalTheme.ts`
- Create: `test/useGlobalTheme.test.ts`

- [ ] **Step 1: Write the failing global theme tests**

```ts
import { describe, expect, test } from "bun:test"

import {
  GlobalThemeSegment,
  buildGlobalThemeBootstrapScript,
  getGlobalThemeCssVariables,
  resolveGlobalThemeSegment,
} from "../app/composables/useGlobalTheme"

describe("useGlobalTheme helpers", () => {
  test("resolves the 7 front-theme segments by local hour", () => {
    expect(resolveGlobalThemeSegment(0)).toBe(GlobalThemeSegment.Midnight)
    expect(resolveGlobalThemeSegment(5)).toBe(GlobalThemeSegment.Morning)
    expect(resolveGlobalThemeSegment(9)).toBe(GlobalThemeSegment.LateMorning)
    expect(resolveGlobalThemeSegment(12)).toBe(GlobalThemeSegment.Noon)
    expect(resolveGlobalThemeSegment(14)).toBe(GlobalThemeSegment.Afternoon)
    expect(resolveGlobalThemeSegment(17)).toBe(GlobalThemeSegment.Dusk)
    expect(resolveGlobalThemeSegment(21)).toBe(GlobalThemeSegment.Night)
  })

  test("returns app-scoped css variables for a local segment", () => {
    const vars = getGlobalThemeCssVariables(GlobalThemeSegment.Dusk)

    expect(vars["--app-theme-shell-background"]).toBe("#1A0F0A")
    expect(vars["--app-theme-surface-base"]).toBe("#2B160E")
    expect(vars["--app-theme-surface-elevated"]).toBe("#3D2218")
    expect(vars["--app-theme-text-primary"]).toBe("#FFF0E6")
    expect(vars["--app-theme-action-primary"]).toBe("#FF5E33")
  })

  test("builds an inline bootstrap script that computes theme from local time", () => {
    const script = buildGlobalThemeBootstrapScript()

    expect(script).toContain("new Date()")
    expect(script).toContain("getHours()")
    expect(script).toContain("--app-theme-shell-background")
    expect(script).toContain("document.documentElement.style.setProperty")
  })
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/useGlobalTheme.test.ts`
Expected: FAIL because `useGlobalTheme.ts` does not exist yet.

- [ ] **Step 3: Write the minimal global theme implementation**

```ts
export enum GlobalThemeSegment {
  Midnight = "midnight",
  Morning = "morning",
  LateMorning = "late-morning",
  Noon = "noon",
  Afternoon = "afternoon",
  Dusk = "dusk",
  Night = "night",
}

const GLOBAL_THEME_MAP: Record<GlobalThemeSegment, Record<string, string>> = {
  [GlobalThemeSegment.Dusk]: {
    "--app-theme-shell-background": "#1A0F0A",
    "--app-theme-surface-base": "#2B160E",
    "--app-theme-surface-elevated": "#3D2218",
    "--app-theme-text-primary": "#FFF0E6",
    "--app-theme-text-secondary": "rgba(255, 240, 230, 0.6)",
    "--app-theme-accent": "#FF5E33",
    "--app-theme-accent-hover": "#FF7A55",
    "--app-theme-glow": "rgba(255, 94, 51, 0.2)",
    "--app-theme-action-primary": "#FF5E33",
    "--app-theme-action-primary-text": "#2B160E",
  },
}

export function resolveGlobalThemeSegment(hour: number) {
  // same seven ranges as the homepage currently uses
}

export function getGlobalThemeCssVariables(segment: GlobalThemeSegment) {
  return GLOBAL_THEME_MAP[segment]
}

export function buildGlobalThemeBootstrapScript() {
  return `(() => {
    const root = document.documentElement;
    const now = new Date();
    const hour = now.getHours();
    const theme = /* resolve theme from hour */;

    for (const [name, value] of Object.entries(theme)) {
      root.style.setProperty(name, value);
    }
  })();`
}
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/useGlobalTheme.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useGlobalTheme.ts test/useGlobalTheme.test.ts
git commit -m "feat: add global theme bootstrap composable"
```

## Task 2: Inject the front-theme bootstrap script from the app shell only for C-end pages

**Files:**
- Modify: `app/app.vue`
- Modify: `test/cEndLayout.test.ts`

- [ ] **Step 1: Extend the app-shell test to cover the new injection path**

```ts
test("injects the front-theme bootstrap script from the app shell for non-admin routes", () => {
  const appShell = readProjectFile("app/app.vue")

  expect(appShell).toContain("useGlobalTheme")
  expect(appShell).toContain("useRoute()")
  expect(appShell).toContain('startsWith("/admin")')
  expect(appShell).toContain("buildGlobalThemeBootstrapScript")
  expect(appShell).toContain("<NuxtLayout>")
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/cEndLayout.test.ts`
Expected: FAIL because `app/app.vue` does not reference `useGlobalTheme` yet.

- [ ] **Step 3: Implement non-visual theme injection in `app/app.vue`**

```vue
<script setup lang="ts">
import { buildGlobalThemeBootstrapScript } from "./composables/useGlobalTheme"

const route = useRoute()
const shouldInjectFrontTheme = computed(() => !route.path.startsWith("/admin"))

useHead(() => {
  if (!shouldInjectFrontTheme.value) {
    return {}
  }

  return {
    script: [
      {
        key: "front-theme-bootstrap",
        innerHTML: buildGlobalThemeBootstrapScript(),
      },
    ],
  }
})
</script>
```

Implementation notes:

- Keep the `NuxtLayout` / `NuxtPage` structure unchanged.
- Do not move theme logic into `default.vue`.
- Use the same route-based admin exclusion already implied by `layout: "admin"` pages.

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/cEndLayout.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/app.vue test/cEndLayout.test.ts
git commit -m "feat: inject front theme bootstrap from app shell"
```

## Task 3: Move the homepage background shell into the default layout

**Files:**
- Modify: `app/layouts/default.vue`
- Modify: `app/pages/index.vue`
- Modify: `test/cEndLayout.test.ts`
- Modify: `test/homepageEntryPage.test.ts`

- [ ] **Step 1: Update the layout and homepage source tests to reflect the new shell split**

```ts
test("provides a default layout shell with frame, ambient background, and view container", () => {
  const defaultLayout = readProjectFile("app/layouts/default.vue")

  expect(defaultLayout).toContain('class="default-layout"')
  expect(defaultLayout).toContain('class="default-layout__frame"')
  expect(defaultLayout).toContain('class="default-layout__ambient"')
  expect(defaultLayout).toContain('class="default-layout__view"')
  expect(defaultLayout).toContain("var(--app-theme-shell-background)")
  expect(defaultLayout).toContain("var(--app-theme-surface-base)")
})

test("keeps homepage content but removes page-owned ambient shell markup", () => {
  const page = readProjectFile("app/pages/index.vue")

  expect(page).not.toContain('class="homepage-entry__ambient"')
  expect(page).toContain('class="homepage-entry__status"')
  expect(page).toContain('class="homepage-entry__logo"')
  expect(page).toContain('class="homepage-entry__brand"')
  expect(page).toContain('class="homepage-entry__welcome"')
})
```

- [ ] **Step 2: Run the targeted tests to verify they fail**

Run: `bun test test/cEndLayout.test.ts test/homepageEntryPage.test.ts`
Expected: FAIL because the background shell still lives in `app/pages/index.vue`.

- [ ] **Step 3: Implement the layout shell migration**

```vue
<!-- app/layouts/default.vue -->
<template>
  <div class="default-layout">
    <div class="default-layout__frame">
      <div class="default-layout__ambient" aria-hidden="true">
        <span class="default-layout__orb default-layout__orb--primary" />
        <span class="default-layout__orb default-layout__orb--secondary" />
      </div>

      <div class="default-layout__view">
        <slot />
      </div>
    </div>
  </div>
</template>
```

```vue
<!-- app/pages/index.vue -->
<template>
  <main class="homepage-entry">
    <div class="homepage-entry__content">
      <!-- existing status / hero / CTA content only -->
    </div>
  </main>
</template>
```

Implementation notes:

- Keep the existing frame size, shadow, radius, safe-area padding, orb positions, and hero alignment values.
- Replace page-level `--homepage-*` usage with `--app-theme-*`.
- Keep the dedicated `default-layout__view` wrapper ready for future route transitions.

- [ ] **Step 4: Run the targeted tests to verify they pass**

Run: `bun test test/cEndLayout.test.ts test/homepageEntryPage.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/layouts/default.vue app/pages/index.vue test/cEndLayout.test.ts test/homepageEntryPage.test.ts
git commit -m "feat: move homepage background shell to default layout"
```

## Task 4: Split homepage content state from global theme colors and switch it to local time

**Files:**
- Modify: `app/composables/useHomepageTheme.ts`
- Delete: `app/utils/timezone.ts` if unused
- Modify: `test/useHomepageTheme.test.ts`
- Modify: `app/pages/index.vue`

- [ ] **Step 1: Rewrite the homepage-state tests around local time and content-only data**

```ts
import { describe, expect, test } from "bun:test"

import {
  HomepageSegment,
  getCopyIndexForHour,
  getHomepageThemeState,
  resolveHomepageSegment,
} from "../app/composables/useHomepageTheme"

describe("useHomepageTheme helpers", () => {
  test("resolves the 7 homepage content segments by local hour", () => {
    expect(resolveHomepageSegment(0)).toBe(HomepageSegment.Midnight)
    expect(resolveHomepageSegment(17)).toBe(HomepageSegment.Dusk)
    expect(resolveHomepageSegment(21)).toBe(HomepageSegment.Night)
  })

  test("builds homepage content state without exposing palette data", () => {
    const state = getHomepageThemeState(new Date(2026, 2, 27, 17, 0, 0))

    expect(state.label).toBe("傍晚")
    expect(state.currentTimeLabel).toBe("17:00")
    expect(state.copyOptions).toContain("今晚做点热的。")
    expect("palette" in state).toBe(false)
  })
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `bun test test/useHomepageTheme.test.ts`
Expected: FAIL because `useHomepageTheme.ts` still exposes palette data and fixed `UTC+8` behavior.

- [ ] **Step 3: Refactor homepage state to local-time content only**

```ts
export interface IHomepageThemeState {
  label: string
  timeRange: string
  copyOptions: [string, string, string]
  segment: HomepageSegment
  copyIndex: number
  headline: string
  currentTimeLabel: string
}

export function getHomepageThemeState(date: Date): IHomepageThemeState {
  const segment = resolveHomepageSegment(date.getHours())
  const definition = HOMEPAGE_THEME_MAP[segment]
  const currentTimeLabel = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`

  return {
    ...definition,
    segment,
    copyIndex,
    headline: definition.copyOptions[copyIndex] ?? definition.copyOptions[0],
    currentTimeLabel,
  }
}
```

Implementation notes:

- Remove palette fields and `heroStyle` from `useHomepageTheme.ts`.
- Remove the fixed-timezone utility import.
- Delete `app/utils/timezone.ts` if `rg -n "utils/timezone" app test` returns no remaining references.
- Update `app/pages/index.vue` to stop expecting `heroStyle`.

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `bun test test/useHomepageTheme.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/composables/useHomepageTheme.ts app/pages/index.vue test/useHomepageTheme.test.ts
git add -A app/utils/timezone.ts
git commit -m "refactor: separate homepage content state from global theme"
```

## Task 5: Add color-transition classes to the actual theme consumers and verify the full front shell

**Files:**
- Modify: `app/layouts/default.vue`
- Modify: `app/pages/index.vue`
- Modify: `test/cEndLayout.test.ts`
- Modify: `test/homepageEntryPage.test.ts`

- [ ] **Step 1: Add failing source assertions for consumer-owned transitions**

```ts
test("keeps theme transitions on layout and homepage consumer classes", () => {
  const defaultLayout = readProjectFile("app/layouts/default.vue")
  const page = readProjectFile("app/pages/index.vue")

  expect(defaultLayout).toContain("transition:")
  expect(defaultLayout).toContain("background-color")
  expect(defaultLayout).toContain("box-shadow")
  expect(page).toContain("transition:")
  expect(page).toContain("color")
  expect(page).toContain("stroke")
})
```

- [ ] **Step 2: Run the targeted tests to verify they fail**

Run: `bun test test/cEndLayout.test.ts test/homepageEntryPage.test.ts`
Expected: FAIL until the consumer classes declare the new transitions.

- [ ] **Step 3: Add transitions where the variables are consumed**

```css
.default-layout,
.default-layout__frame,
.default-layout__orb {
  transition:
    background-color 320ms ease,
    box-shadow 320ms ease,
    color 320ms ease;
}

.homepage-entry__status-pill,
.homepage-entry__logo,
.homepage-entry__brand,
.homepage-entry__welcome,
.homepage-entry__cta,
.homepage-entry__cta svg {
  transition:
    color 320ms ease,
    background-color 320ms ease,
    border-color 320ms ease,
    box-shadow 320ms ease,
    stroke 320ms ease;
}
```

Implementation notes:

- Only add transitions to classes that actually consume `--app-theme-*`.
- Do not move these transitions back into `useGlobalTheme`.
- Preserve the existing homepage entrance animations and hover states.

- [ ] **Step 4: Run the targeted tests to verify they pass**

Run: `bun test test/cEndLayout.test.ts test/homepageEntryPage.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/layouts/default.vue app/pages/index.vue test/cEndLayout.test.ts test/homepageEntryPage.test.ts
git commit -m "feat: add consumer-side theme transitions"
```

## Task 6: Run focused verification, then the required quality gate

**Files:**
- Verify only: `app/app.vue`
- Verify only: `app/composables/useGlobalTheme.ts`
- Verify only: `app/composables/useHomepageTheme.ts`
- Verify only: `app/layouts/default.vue`
- Verify only: `app/pages/index.vue`
- Verify only: `test/cEndLayout.test.ts`
- Verify only: `test/homepageEntryPage.test.ts`
- Verify only: `test/useGlobalTheme.test.ts`
- Verify only: `test/useHomepageTheme.test.ts`

- [ ] **Step 1: Run the focused feature tests**

Run: `bun test test/useGlobalTheme.test.ts test/useHomepageTheme.test.ts test/cEndLayout.test.ts test/homepageEntryPage.test.ts`
Expected: PASS

- [ ] **Step 2: Run the repository quality check**

Run: `bun quality-check`
Expected: PASS with no TypeScript or oxlint errors.

- [ ] **Step 3: Sanity-check the final file graph**

Run: `rg -n "useHomepageTheme|useGlobalTheme|utils/timezone|--homepage-|--app-theme-" app test`
Expected:
- `useGlobalTheme` appears in `app/app.vue` and its own test file.
- `useHomepageTheme` no longer exposes `heroStyle`.
- `--homepage-*` no longer appears in `default.vue` or `index.vue`.
- `app/utils/timezone.ts` is either deleted or has no remaining references.

- [ ] **Step 4: Commit the integrated feature**

```bash
git add app/app.vue app/composables/useGlobalTheme.ts app/composables/useHomepageTheme.ts app/layouts/default.vue app/pages/index.vue test/cEndLayout.test.ts test/homepageEntryPage.test.ts test/useGlobalTheme.test.ts test/useHomepageTheme.test.ts
git add -A app/utils/timezone.ts
git commit -m "feat: add global front theme shell"
```
