<script setup lang="ts">
import "~/assets/css/homepage-fonts.css";

import { useHomepageTheme } from "../composables/useHomepageTheme";

defineOptions({
  name: "HomepageEntryPage",
});

useSeoMeta({
  title: "Cookingo",
  description: "一个安静的做饭入口。先进入，再选今天要做的菜。",
});

// todo: 这里做seo适配，放弃随时间段切换文案，实现纯后端SSR
const { themeState } = useHomepageTheme();
</script>

<template>
  <main class="homepage-entry">
    <div class="homepage-entry__content">
      <header class="homepage-entry__status">
        <div class="homepage-entry__status-pill">
          <span class="homepage-entry__status-dot" />
          <span class="homepage-entry__status-time">{{ themeState.currentTimeLabel }}</span>
        </div>
      </header>

      <section class="homepage-entry__hero">
        <div class="homepage-entry__logo" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14" />
            <path d="M12 2V8" />
            <path d="M8 4V8" />
            <path d="M16 4V8" />
            <path d="M2 14H22" />
          </svg>
        </div>

        <p class="homepage-entry__eyebrow">
          {{ themeState.label }} · {{ themeState.timeRange }}
        </p>
        <h1 class="homepage-entry__brand">Cookingo<span>.</span></h1>
        <p class="homepage-entry__welcome">{{ themeState.headline }}</p>
      </section>

      <footer class="homepage-entry__action">
        <NuxtLink
          to="/recipes"
          class="homepage-entry__cta"
        >
          <span>开启灵感</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12H19" />
            <path d="M12 5L19 12L12 19" />
          </svg>
        </NuxtLink>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.homepage-entry {
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
  color: var(--app-theme-text-primary);
  overflow: hidden;
  font-family: "Quicksand", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  transition: color 320ms ease;
}

.homepage-entry__content {
  position: relative;
  display: flex;
  min-height: 100%;
  box-sizing: border-box;
  flex-direction: column;
  padding:
    max(1.5rem, env(safe-area-inset-top))
    max(1.25rem, env(safe-area-inset-right))
    max(1.25rem, env(safe-area-inset-bottom))
    max(1.25rem, env(safe-area-inset-left));
}

.homepage-entry__status {
  display: flex;
  justify-content: flex-end;
  opacity: 0;
  animation: homepage-fade-up 700ms cubic-bezier(0.16, 1, 0.3, 1) 140ms forwards;
}

.homepage-entry__status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-theme-surface-elevated) 88%, transparent);
  backdrop-filter: blur(14px);
  transition:
    background-color 320ms ease,
    box-shadow 320ms ease;
}

.homepage-entry__status-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: var(--app-theme-accent);
  box-shadow: 0 0 0 0 var(--app-theme-glow);
  animation: homepage-pulse 2s infinite;
  transition:
    background-color 320ms ease,
    box-shadow 320ms ease;
}

.homepage-entry__status-time {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--app-theme-text-primary);
  letter-spacing: 0.06em;
  transition: color 320ms ease;
}

.homepage-entry__hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 0.9rem;
  margin-top: -8vh;
}

.homepage-entry__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  margin-bottom: 0.4rem;
  border-radius: 1.8rem;
  background: color-mix(in srgb, var(--app-theme-surface-elevated) 92%, transparent);
  opacity: 0;
  transform: translateY(1rem);
  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 240ms forwards;
  transition:
    background-color 320ms ease,
    box-shadow 320ms ease;
}

.homepage-entry__logo svg {
  width: 2.4rem;
  height: 2.4rem;
  fill: none;
  stroke: var(--app-theme-accent);
  stroke-width: 2.3;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke 320ms ease;
}

.homepage-entry__eyebrow,
.homepage-entry__welcome {
  margin: 0;
}

.homepage-entry__eyebrow {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--app-theme-text-secondary);
  letter-spacing: 0.04em;
  opacity: 0;
  transform: translateY(1rem);
  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 340ms forwards;
  transition: color 320ms ease;
}

.homepage-entry__brand {
  margin: 0;
  font-size: clamp(3rem, 14vw, 4.6rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.06em;
  color: var(--app-theme-text-primary);
  opacity: 0;
  transform: translateY(1rem);
  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 420ms forwards;
  transition: color 320ms ease;
}

.homepage-entry__brand span {
  color: var(--app-theme-accent);
  transition: color 320ms ease;
}

.homepage-entry__welcome {
  max-width: 16rem;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.65;
  color: var(--app-theme-text-secondary);
  opacity: 0;
  transform: translateY(1rem);
  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 500ms forwards;
  transition: color 320ms ease;
}

.homepage-entry__action {
  padding-bottom: 0.5rem;
  opacity: 0;
  transform: translateY(1rem);
  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 620ms forwards;
}

.homepage-entry__cta {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 3.75rem;
  padding: 1rem 1.5rem;
  border-radius: 999px;
  background: var(--app-theme-action-primary);
  color: var(--app-theme-action-primary-text);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 12px 30px var(--app-theme-glow);
  transition:
    color 320ms ease,
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
    background-color 220ms ease,
    box-shadow 220ms ease;
}

.homepage-entry__cta svg {
  width: 1.2rem;
  height: 1.2rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition:
    transform 220ms ease,
    stroke 320ms ease;
}

.homepage-entry__cta:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

@media (hover: hover) {
  .homepage-entry__cta:hover {
    transform: translateY(-2px);
    background: var(--app-theme-accent-hover);
    box-shadow: 0 16px 38px var(--app-theme-glow);
  }

  .homepage-entry__cta:hover svg {
    transform: translateX(0.2rem);
  }
}

@media (min-width: 768px) {
  .homepage-entry__content {
    min-height: min(56rem, calc(100dvh - 2rem));
    height: 100%;
    padding: 2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .homepage-entry__status,
  .homepage-entry__logo,
  .homepage-entry__eyebrow,
  .homepage-entry__brand,
  .homepage-entry__welcome,
  .homepage-entry__action,
  .homepage-entry__status-dot {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .homepage-entry__cta,
  .homepage-entry__cta svg {
    transition: none;
  }
}

@keyframes homepage-fade-up {
  from {
    opacity: 0;
    transform: translateY(1.2rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes homepage-breathe {
  from {
    transform: scale(1) translate3d(0, 0, 0);
    opacity: 0.68;
  }

  to {
    transform: scale(1.08) translate3d(4%, 5%, 0);
    opacity: 1;
  }
}

@keyframes homepage-pulse {
  0% {
    box-shadow: 0 0 0 0 var(--app-theme-glow);
  }

  70% {
    box-shadow: 0 0 0 0.45rem rgba(0, 0, 0, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>
