<script setup lang="ts">
import { useHomepageTheme } from "../composables/useHomepageTheme";

defineOptions({
  name: "HomepageEntryPage",
});

definePageMeta({
  layout: false,
});

useSeoMeta({
  title: "Cookingo",
  description: "一个安静的做饭入口。先进入，再选今天要做的菜。",
});

const { themeState, heroStyle } = useHomepageTheme();
</script>

<template>
  <main
    class="homepage-entry"
    :style="heroStyle"
  >
    <div class="homepage-entry__frame">
      <header class="homepage-entry__header">
        <p>Cookingo</p>
        <span>{{ themeState.timeRange }}</span>
      </header>

      <section class="homepage-entry__hero">
        <p class="homepage-entry__segment">{{ themeState.label }}</p>
        <h1>{{ themeState.headline }}</h1>
        <NuxtLink
          to="/recipes"
          class="homepage-entry__cta"
        >
          开始选菜
        </NuxtLink>
      </section>
    </div>
  </main>
</template>

<style scoped>
.homepage-entry {
  height: 100vh;
  height: 100svh;
  height: 100dvh;
  box-sizing: border-box;
  background: var(--homepage-background);
  color: var(--homepage-text);
  overflow: hidden;
}

.homepage-entry__frame {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding:
    max(1rem, env(safe-area-inset-top))
    max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
  box-sizing: border-box;
}

.homepage-entry__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--homepage-accent);
}

.homepage-entry__header p,
.homepage-entry__header span,
.homepage-entry__segment {
  margin: 0;
}

.homepage-entry__hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.homepage-entry__segment {
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--homepage-accent);
}

.homepage-entry__hero h1 {
  margin: 1.2rem 0 0;
  max-width: 6em;
  font-family: "Georgia", "Times New Roman", serif;
  font-size: clamp(3.6rem, 13vw, 5.8rem);
  line-height: 1.04;
  letter-spacing: -0.05em;
  font-weight: 600;
}

.homepage-entry__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.8rem;
  padding: 0.95rem 1.4rem;
  border-radius: 999px;
  background: var(--homepage-button);
  color: var(--homepage-button-text);
  text-decoration: none;
  font-weight: 600;
  box-shadow: var(--homepage-shadow);
  transition:
    background-color 200ms ease,
    color 200ms ease,
    opacity 200ms ease;
}

.homepage-entry__cta:hover,
.homepage-entry__cta:focus-visible {
  opacity: 0.92;
}

.homepage-entry__cta:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

@media (min-width: 768px) {
  .homepage-entry__frame {
    padding: 2rem;
  }

  .homepage-entry__hero h1 {
    max-width: 7em;
  }
}
</style>
