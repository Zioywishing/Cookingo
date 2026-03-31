<script setup lang="ts">
type SelectRecipeCardItem = {
  id: string;
  name: string;
  description: string;
  difficultyLabel: string;
  durationLabel: string;
  tags: string[];
  equipment: string[];
  imageUrl: string | null;
};

const props = defineProps<{
  recipe: SelectRecipeCardItem;
  selected: boolean;
  animationDelayMs: number;
}>();

defineEmits<{
  select: [];
}>();
</script>

<template>
  <article
    class="recipe-card"
    :class="{ 'recipe-card--selected': props.selected }"
    :style="{ '--recipe-card-delay': `${props.animationDelayMs}ms` }"
  >
    <button
      type="button"
      class="recipe-card__button"
      @click="$emit('select')"
    >
      <div class="recipe-card__copy">
        <div class="recipe-card__headline">
          <h2>{{ props.recipe.name }}</h2>
          <p>{{ props.recipe.description }}</p>
        </div>

        <div class="recipe-card__meta">
          <span class="recipe-card__meta-pill recipe-card__meta-pill--accent">
            {{ props.recipe.difficultyLabel }}
          </span>
          <span class="recipe-card__meta-pill">
            {{ props.recipe.durationLabel }}
          </span>
          <span
            v-for="item in props.recipe.tags"
            :key="item"
            class="recipe-card__meta-pill"
          >
            {{ item }}
          </span>
          <span
            v-for="item in props.recipe.equipment"
            :key="item"
            class="recipe-card__meta-pill"
          >
            {{ item }}
          </span>
        </div>
      </div>

      <div class="recipe-card__visual">
        <img
          v-if="props.recipe.imageUrl"
          :src="props.recipe.imageUrl"
          :alt="props.recipe.name"
          class="recipe-card__image"
        >
        <div v-else class="recipe-card__placeholder" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14" />
            <path d="M12 2L12 8" />
            <path d="M8 4L8 8" />
            <path d="M16 4L16 8" />
            <path d="M2 14H22" />
          </svg>
        </div>

        <span class="recipe-card__check">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </div>
    </button>
  </article>
</template>

<style scoped>
.recipe-card {
  opacity: 0;
  transform: translate3d(0, 1rem, 0);
  animation: recipe-card-enter 520ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--recipe-card-delay, 0ms);
}

.recipe-card__button {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 5.75rem;
  gap: 1rem;
  padding: 1rem;
  border: none;
  border-radius: 1.7rem;
  background: color-mix(in srgb, var(--app-theme-surface-elevated) 94%, transparent);
  text-align: left;
  box-shadow:
    inset 0 0 0 1px transparent,
    0 1rem 2.25rem rgba(18, 12, 8, 0.12);
  transition:
    transform 180ms ease,
    background-color 320ms ease,
    box-shadow 320ms ease;
}

.recipe-card__button:active {
  transform: scale(0.985);
}

.recipe-card--selected .recipe-card__button {
  background: color-mix(in srgb, var(--app-theme-surface-base) 92%, transparent);
  box-shadow:
    inset 0 0 0 2px var(--app-theme-accent),
    0 1rem 2.5rem color-mix(in srgb, var(--app-theme-glow) 88%, transparent);
}

.recipe-card__copy {
  display: grid;
  align-content: space-between;
  gap: 1rem;
  min-width: 0;
}

.recipe-card__headline h2 {
  margin: 0 0 0.35rem;
  color: var(--app-theme-text-primary);
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.25;
  transition: color 320ms ease;
}

.recipe-card__headline p {
  margin: 0;
  color: var(--app-theme-text-secondary);
  font-size: 0.84rem;
  line-height: 1.5;
  transition: color 320ms ease;
}

.recipe-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.recipe-card__meta-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.36rem 0.62rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--app-theme-surface-base) 88%, transparent);
  color: var(--app-theme-text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  transition:
    background-color 320ms ease,
    color 320ms ease;
}

.recipe-card__meta-pill--accent {
  color: var(--app-theme-accent);
}

.recipe-card__visual {
  position: relative;
  width: 5.75rem;
  height: 5.75rem;
}

.recipe-card__image,
.recipe-card__placeholder {
  width: 100%;
  height: 100%;
  border-radius: 1.2rem;
}

.recipe-card__image {
  display: block;
  object-fit: cover;
}

.recipe-card__placeholder {
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--app-theme-surface-base) 88%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--app-theme-text-primary) 7%, transparent);
}

.recipe-card__placeholder svg,
.recipe-card__check svg {
  stroke: currentColor;
  stroke-width: 2.1;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.recipe-card__placeholder svg {
  width: 2rem;
  height: 2rem;
  color: var(--app-theme-text-secondary);
}

.recipe-card__check {
  position: absolute;
  top: -0.35rem;
  right: -0.35rem;
  display: grid;
  place-items: center;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 999px;
  background: var(--app-theme-action-primary);
  color: var(--app-theme-action-primary-text);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--app-theme-surface-elevated) 96%, transparent);
  opacity: 0;
  transform: scale(0.6);
  transition:
    opacity 180ms ease,
    transform 180ms ease,
    background-color 320ms ease,
    color 320ms ease;
}

.recipe-card--selected .recipe-card__check {
  opacity: 1;
  transform: scale(1);
}

.recipe-card__check svg {
  width: 1rem;
  height: 1rem;
}

@keyframes recipe-card-enter {
  from {
    opacity: 0;
    transform: translate3d(0, 1rem, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
</style>
