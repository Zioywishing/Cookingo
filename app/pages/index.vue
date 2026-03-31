<script setup lang="ts">
import "~/assets/css/homepage-fonts.css";

import { useHomepageTheme } from "../composables/useHomepageTheme";

const HOMEPAGE_LEAVE_DURATION_MS = 560;

defineOptions({
  name: "HomepageEntryPage",
});

useSeoMeta({
  title: "Cookingo",
  description: "一个安静的做饭入口。先进入，再选今天要做的菜。",
});

// todo: 这里做seo适配，放弃随时间段切换文案，实现纯后端SSR
const { themeState } = useHomepageTheme();
const isLeaving = ref(false);

function prefersReducedMotion() {
  if (!import.meta.client) {
    return true;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

onBeforeRouteLeave(async () => {
  if (isLeaving.value || prefersReducedMotion()) {
    return;
  }

  isLeaving.value = true;

  await new Promise((resolve) => {
    window.setTimeout(resolve, HOMEPAGE_LEAVE_DURATION_MS);
  });
});
</script>

<template>
  <main
    class="homepage-entry h-full min-h-full box-border overflow-hidden text-[var(--app-theme-text-primary)] [font-family:'Quicksand','PingFang_SC','Hiragino_Sans_GB','Microsoft_YaHei',sans-serif] [transition:color_320ms_ease]"
    :class="{ 'homepage-entry--leaving pointer-events-none': isLeaving }"
  >
    <div class="homepage-entry__content relative flex min-h-full box-border flex-col pt-[max(1.5rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] md:h-full md:min-h-[min(56rem,calc(100dvh-2rem))] md:p-8">
      <header class="homepage-entry__status flex justify-end">
        <div class="homepage-entry__status-pill inline-flex items-center gap-[0.45rem] rounded-full bg-[color-mix(in_srgb,var(--app-theme-surface-elevated)_88%,transparent)] px-[0.85rem] py-[0.45rem] [backdrop-filter:blur(14px)] [transition:background-color_320ms_ease,box-shadow_320ms_ease]">
          <span class="homepage-entry__status-dot h-[0.4rem] w-[0.4rem] rounded-full bg-[var(--app-theme-accent)] shadow-[0_0_0_0_var(--app-theme-glow)] [transition:background-color_320ms_ease,box-shadow_320ms_ease]" />
          <span class="homepage-entry__status-time text-[0.75rem] font-700 tracking-[0.06em] text-[var(--app-theme-text-primary)] [transition:color_320ms_ease]">{{ themeState.currentTimeLabel }}</span>
        </div>
      </header>

      <section class="homepage-entry__hero mt-[-8vh] flex flex-1 flex-col items-center justify-center gap-[0.9rem] text-center">
        <div class="homepage-entry__logo mb-[0.4rem] inline-flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[color-mix(in_srgb,var(--app-theme-surface-elevated)_92%,transparent)] [transition:background-color_320ms_ease,box-shadow_320ms_ease]" aria-hidden="true">
          <svg class="h-[2.4rem] w-[2.4rem] fill-none stroke-[var(--app-theme-accent)] [stroke-width:2.3] [stroke-linecap:round] [stroke-linejoin:round] [transition:stroke_320ms_ease]" viewBox="0 0 24 24">
            <path d="M4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14" />
            <path d="M12 2V8" />
            <path d="M8 4V8" />
            <path d="M16 4V8" />
            <path d="M2 14H22" />
          </svg>
        </div>

        <p class="homepage-entry__eyebrow m-0 text-[0.9rem] font-600 tracking-[0.04em] text-[var(--app-theme-text-secondary)] [transition:color_320ms_ease]">
          {{ themeState.label }} · {{ themeState.timeRange }}
        </p>
        <h1 class="homepage-entry__brand m-0 text-[clamp(3rem,14vw,4.6rem)] font-700 leading-[1.02] tracking-[-0.06em] text-[var(--app-theme-text-primary)] [transition:color_320ms_ease]">Cookingo<span class="text-[var(--app-theme-accent)] [transition:color_320ms_ease]">.</span></h1>
        <p class="homepage-entry__welcome m-0 max-w-64 text-4 font-500 leading-[1.65] text-[var(--app-theme-text-secondary)] [transition:color_320ms_ease]">{{ themeState.headline }}</p>
      </section>

      <footer class="homepage-entry__action pb-2">
        <NuxtLink
          to="/main/select-recipes"
          class="homepage-entry__cta box-border flex min-h-15 w-full items-center justify-center gap-3 rounded-full bg-[var(--app-theme-action-primary)] px-6 py-4 text-4 font-700 text-[var(--app-theme-action-primary-text)] no-underline shadow-[0_12px_30px_var(--app-theme-glow)] focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-3 [transition:color_320ms_ease,transform_220ms_cubic-bezier(0.16,1,0.3,1),background-color_220ms_ease,box-shadow_220ms_ease]"
        >
          <span>开启灵感</span>
          <svg class="h-[1.2rem] w-[1.2rem] fill-none stroke-current [stroke-width:2.4] [stroke-linecap:round] [stroke-linejoin:round] [transition:transform_220ms_ease,stroke_320ms_ease]" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12H19" />
            <path d="M12 5L19 12L12 19" />
          </svg>
        </NuxtLink>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.homepage-entry__status {
  animation: homepage-fade-up 700ms cubic-bezier(0.16, 1, 0.3, 1) 140ms both;
}

.homepage-entry__status-dot {
  animation: homepage-pulse 2s infinite;
}

.homepage-entry__logo {
  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 240ms both;
}

.homepage-entry__eyebrow {
  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 340ms both;
}

.homepage-entry__brand {
  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 420ms both;
}

.homepage-entry__welcome {
  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 500ms both;
}

.homepage-entry__action {
  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 620ms both;
}

.homepage-entry--leaving .homepage-entry__status,
.homepage-entry--leaving .homepage-entry__logo,
.homepage-entry--leaving .homepage-entry__eyebrow,
.homepage-entry--leaving .homepage-entry__brand,
.homepage-entry--leaving .homepage-entry__welcome,
.homepage-entry--leaving .homepage-entry__action,
.homepage-entry--leaving .homepage-entry__status-dot {
  animation-play-state: paused;
}

.homepage-entry--leaving .homepage-entry__status {
  animation: homepage-leave-up 240ms cubic-bezier(0.4, 0, 0.2, 1) 80ms both;
}

.homepage-entry--leaving .homepage-entry__logo {
  animation: homepage-leave-up 280ms cubic-bezier(0.4, 0, 0.2, 1) 140ms both;
}

.homepage-entry--leaving .homepage-entry__eyebrow {
  animation: homepage-leave-up 260ms cubic-bezier(0.4, 0, 0.2, 1) 190ms both;
}

.homepage-entry--leaving .homepage-entry__brand {
  animation: homepage-leave-up 320ms cubic-bezier(0.4, 0, 0.2, 1) 240ms both;
}

.homepage-entry--leaving .homepage-entry__welcome {
  animation: homepage-leave-up 280ms cubic-bezier(0.4, 0, 0.2, 1) 290ms both;
}

.homepage-entry--leaving .homepage-entry__action {
  animation: homepage-leave-up 240ms cubic-bezier(0.4, 0, 0.2, 1) 340ms both;
}

.homepage-entry--leaving .homepage-entry__cta {
  transform: translateY(-0.3rem) scale(0.985);
  box-shadow: 0 8px 22px color-mix(in srgb, var(--app-theme-glow) 80%, transparent);
}

.homepage-entry--leaving .homepage-entry__cta svg {
  transform: translateX(0.28rem);
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

@keyframes homepage-leave-up {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(-1rem);
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
