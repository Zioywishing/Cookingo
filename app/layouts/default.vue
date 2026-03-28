<template>
  <div class="default-layout">
    <slot />
  </div>
</template>

<style scoped>
.default-layout {
  width: 100vw;
  height: 100vh;
  height: 100svh;
  height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.default-layout::-webkit-scrollbar {
  display: none;
}
</style>
