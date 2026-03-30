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

<style scoped>
.default-layout {
  width: 100vw;
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding:
    max(0px, env(safe-area-inset-top))
    max(0px, env(safe-area-inset-right))
    max(0px, env(safe-area-inset-bottom))
    max(0px, env(safe-area-inset-left));
  background: var(--app-theme-shell-background);
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.default-layout__frame {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--app-theme-surface-base);
}

.default-layout__ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.default-layout__orb {
  position: absolute;
  border-radius: 999px;
  background: radial-gradient(circle, var(--app-theme-glow) 0%, rgba(0, 0, 0, 0) 70%);
  filter: blur(56px);
  animation: default-layout-breathe 12s ease-in-out infinite alternate;
}

.default-layout__orb--primary {
  top: -18%;
  left: -12%;
  width: 120vw;
  height: 120vw;
}

.default-layout__orb--secondary {
  right: -25%;
  bottom: -30%;
  width: 140vw;
  height: 140vw;
  animation-duration: 18s;
  animation-delay: -6s;
}

.default-layout__view {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
}

.default-layout::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .default-layout {
    padding: 1rem;
  }

  .default-layout__frame {
    width: min(100%, 25rem);
    min-height: min(56rem, calc(100dvh - 2rem));
    border-radius: 2rem;
    box-shadow:
      0 32px 70px rgba(16, 10, 7, 0.24),
      inset 0 0 0 1px color-mix(in srgb, var(--app-theme-text-primary) 6%, transparent);
  }

  .default-layout__view {
    min-height: min(56rem, calc(100dvh - 2rem));
  }
}

@media (prefers-reduced-motion: reduce) {
  .default-layout__orb {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

@keyframes default-layout-breathe {
  from {
    transform: scale(1) translate3d(0, 0, 0);
    opacity: 0.68;
  }

  to {
    transform: scale(1.08) translate3d(4%, 5%, 0);
    opacity: 1;
  }
}
</style>
