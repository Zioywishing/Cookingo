<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

const props = defineProps<{
  tasks: Array<{
    sourceNodeId: number;
    nextNodeId: number;
    title: string;
    readyAt: number;
  }>;
}>();

const currentTime = ref(Date.now());

const formattedTasks = computed(() =>
  props.tasks.map((task) => {
    const remainingMs = Math.max(task.readyAt - currentTime.value, 0);
    const minutes = Math.floor(remainingMs / 60_000);
    const seconds = Math.floor((remainingMs % 60_000) / 1000);

    return {
      ...task,
      countdown: `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`,
    };
  }),
);

let timer: number | undefined;

onMounted(() => {
  timer = window.setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer);
  }
});
</script>

<template>
  <aside class="recipe-timer-panel">
    <div class="recipe-timer-panel__header">
      <span class="recipe-timer-panel__dot" />
      <strong>异步任务</strong>
      <span>{{ tasks.length }}</span>
    </div>

    <ul
      v-if="formattedTasks.length"
      class="recipe-timer-panel__list"
    >
      <li
        v-for="task in formattedTasks"
        :key="`${task.sourceNodeId}-${task.nextNodeId}`"
      >
        <div>
          <p>{{ task.title }}</p>
          <small>结束后切入下一步</small>
        </div>
        <strong>{{ task.countdown }}</strong>
      </li>
    </ul>

    <p
      v-else
      class="recipe-timer-panel__empty"
    >
      当前没有等待中的任务
    </p>
  </aside>
</template>

<style scoped>
.recipe-timer-panel {
  display: grid;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  border-radius: 1.4rem;
  background: rgba(255, 249, 239, 0.88);
  border: 1px solid rgba(148, 86, 34, 0.12);
  box-shadow: 0 1rem 2rem rgba(93, 50, 17, 0.08);
  backdrop-filter: blur(18px);
}

.recipe-timer-panel__header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: #6f3e1a;
  font-size: 0.92rem;
}

.recipe-timer-panel__dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: #dc6e27;
  box-shadow: 0 0 0 0.35rem rgba(220, 110, 39, 0.12);
}

.recipe-timer-panel__list {
  display: grid;
  gap: 0.7rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.recipe-timer-panel__list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.8rem 0.9rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.76);
}

.recipe-timer-panel__list p,
.recipe-timer-panel__empty {
  margin: 0;
}

.recipe-timer-panel__list p {
  color: #442513;
  font-weight: 600;
}

.recipe-timer-panel__list small,
.recipe-timer-panel__empty {
  color: #8a5d3e;
}

.recipe-timer-panel__list strong {
  font-variant-numeric: tabular-nums;
  color: #b7521d;
  font-size: 1rem;
}

@media (max-width: 479px) {
  .recipe-timer-panel__list li {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
  }
}
</style>
