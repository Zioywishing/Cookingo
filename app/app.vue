<script setup lang="ts">
import { useGlobalTheme } from "./composables/useGlobalTheme";

const route = useRoute();
const { buildGlobalThemeBootstrapScript } = useGlobalTheme();
const shouldInjectFrontTheme = computed(() => !route.path.startsWith("/admin"));

useHead(() => {
  if (!shouldInjectFrontTheme.value) {
    return {};
  }

  return {
    script: [
      {
        key: "front-theme-bootstrap",
        innerHTML: buildGlobalThemeBootstrapScript(),
        tagPosition: "head",
      },
    ],
    __dangerouslyDisableSanitizersByTagID: {
      "front-theme-bootstrap": ["innerHTML"],
    },
  };
});
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
html,
body,
#__nuxt {
  margin: 0;
  height: 100%;
}

body {
  overflow: hidden;
}
</style>
