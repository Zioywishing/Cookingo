<script setup lang="ts">
type FilterOption = {
  value: string;
  label: string;
};

const props = defineProps<{
  searchKeyword: string;
  isOpen: boolean;
  difficultyOptions: FilterOption[];
  tagOptions: FilterOption[];
  equipmentOptions: FilterOption[];
  activeDifficulty: string | null;
  activeTag: string | null;
  activeEquipment: string | null;
}>();

const emit = defineEmits<{
  "update:searchKeyword": [value: string];
  "toggle-panel": [];
  "toggle-difficulty": [value: string];
  "toggle-tag": [value: string];
  "toggle-equipment": [value: string];
}>();

function updateSearchKeyword(event: Event) {
  const input = event.target as HTMLInputElement;

  emit("update:searchKeyword", input.value);
}
</script>

<template>
  <section class="select-recipes-filter">
    <header class="select-recipes-filter__header">
      <button
        type="button"
        class="select-recipes-filter__icon-button"
        aria-label="展开筛选"
        @click="emit('toggle-panel')"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      </button>

      <h1 class="select-recipes-filter__title">
        选择菜谱
      </h1>

      <button
        type="button"
        class="select-recipes-filter__icon-button"
        aria-label="最近浏览"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>
    </header>

    <label class="select-recipes-filter__search">
      <span class="select-recipes-filter__search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        :value="props.searchKeyword"
        type="text"
        placeholder="搜索菜谱、食材或标签"
        @input="updateSearchKeyword"
      >
    </label>

    <div
      class="select-recipes-filter__panel"
      :class="{ 'select-recipes-filter__panel--open': props.isOpen }"
    >
      <section class="select-recipes-filter__group">
        <h2>烹饪难度</h2>
        <div class="select-recipes-filter__chips">
          <button
            v-for="option in props.difficultyOptions"
            :key="option.value"
            type="button"
            class="select-recipes-filter__chip"
            :class="{ 'select-recipes-filter__chip--active': props.activeDifficulty === option.value }"
            @click="emit('toggle-difficulty', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section class="select-recipes-filter__group">
        <h2>菜谱标签</h2>
        <div class="select-recipes-filter__chips">
          <button
            v-for="option in props.tagOptions"
            :key="option.value"
            type="button"
            class="select-recipes-filter__chip"
            :class="{ 'select-recipes-filter__chip--active': props.activeTag === option.value }"
            @click="emit('toggle-tag', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section class="select-recipes-filter__group">
        <h2>所需厨具</h2>
        <div class="select-recipes-filter__chips">
          <button
            v-for="option in props.equipmentOptions"
            :key="option.value"
            type="button"
            class="select-recipes-filter__chip"
            :class="{ 'select-recipes-filter__chip--active': props.activeEquipment === option.value }"
            @click="emit('toggle-equipment', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.select-recipes-filter {
  display: grid;
  gap: 1rem;
}

.select-recipes-filter__header {
  display: grid;
  grid-template-columns: 3rem 1fr 3rem;
  align-items: center;
  gap: 0.875rem;
}

.select-recipes-filter__title {
  margin: 0;
  text-align: center;
  color: var(--app-theme-text-primary);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  transition: color 320ms ease;
}

.select-recipes-filter__icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  padding: 0;
  border: none;
  border-radius: 1.1rem;
  background: color-mix(in srgb, var(--app-theme-surface-elevated) 92%, transparent);
  color: var(--app-theme-text-primary);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--app-theme-text-primary) 7%, transparent);
  transition:
    transform 180ms ease,
    background-color 320ms ease,
    color 320ms ease;
}

.select-recipes-filter__icon-button:active {
  transform: scale(0.96);
}

.select-recipes-filter__icon-button svg,
.select-recipes-filter__search-icon svg {
  width: 1.35rem;
  height: 1.35rem;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.select-recipes-filter__search {
  position: relative;
  display: block;
}

.select-recipes-filter__search input {
  width: 100%;
  box-sizing: border-box;
  padding: 1rem 1.2rem 1rem 3rem;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-theme-surface-elevated) 92%, transparent);
  color: var(--app-theme-text-primary);
  font-size: 0.96rem;
  font-weight: 500;
  outline: none;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--app-theme-text-primary) 7%, transparent);
  transition:
    background-color 320ms ease,
    color 320ms ease,
    box-shadow 320ms ease;
}

.select-recipes-filter__search input::placeholder {
  color: var(--app-theme-text-secondary);
}

.select-recipes-filter__search-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  display: inline-flex;
  color: var(--app-theme-text-secondary);
  transform: translateY(-50%);
  transition: color 320ms ease;
}

.select-recipes-filter__panel {
  display: grid;
  gap: 1.25rem;
  max-height: 0;
  padding: 0 1.25rem;
  overflow: hidden;
  border-radius: 1.6rem;
  background: color-mix(in srgb, var(--app-theme-surface-elevated) 94%, transparent);
  opacity: 0;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--app-theme-text-primary) 6%, transparent);
  transition:
    max-height 260ms ease,
    opacity 220ms ease,
    padding 220ms ease,
    background-color 320ms ease;
}

.select-recipes-filter__panel--open {
  max-height: 22rem;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  opacity: 1;
}

.select-recipes-filter__group {
  display: grid;
  gap: 0.75rem;
}

.select-recipes-filter__group h2 {
  margin: 0;
  color: var(--app-theme-text-primary);
  font-size: 0.82rem;
  font-weight: 700;
  transition: color 320ms ease;
}

.select-recipes-filter__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.select-recipes-filter__chip {
  padding: 0.65rem 0.95rem;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-theme-surface-base) 88%, transparent);
  color: var(--app-theme-text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--app-theme-text-primary) 7%, transparent);
  transition:
    transform 180ms ease,
    background-color 320ms ease,
    color 320ms ease,
    box-shadow 320ms ease;
}

.select-recipes-filter__chip:active {
  transform: scale(0.97);
}

.select-recipes-filter__chip--active {
  background: var(--app-theme-action-primary);
  color: var(--app-theme-action-primary-text);
  box-shadow: 0 0.65rem 1.4rem color-mix(in srgb, var(--app-theme-glow) 88%, transparent);
}
</style>
