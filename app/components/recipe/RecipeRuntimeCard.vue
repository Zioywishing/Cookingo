<script setup lang="ts">
import type { IRecipeProcessNode } from "#shared/types/recipe";

defineProps<{
  step?: IRecipeProcessNode;
  blocked: boolean;
  finished: boolean;
  hasAsyncTasks: boolean;
}>();

const emit = defineEmits<{
  complete: [];
}>();
</script>

<template>
  <article
    v-if="step"
    class="runtime-card"
    :class="{ 'runtime-card--blocked': blocked }"
  >
    <div class="runtime-card__eyebrow">
      <span>{{ blocked ? "等待前置步骤完成" : "当前步骤" }}</span>
      <span v-if="step.durationMinutes">{{ step.durationMinutes }} 分钟动作时间</span>
    </div>

    <div class="runtime-card__hero">
      <h2>{{ step.title ?? "继续做菜" }}</h2>
      <p>{{ step.description }}</p>
    </div>

    <section
      v-if="step.ingredients?.length"
      class="runtime-card__section"
    >
      <h3>这一步会用到</h3>
      <ul>
        <li
          v-for="ingredient in step.ingredients"
          :key="ingredient.name"
        >
          <span>{{ ingredient.name }}</span>
          <strong>{{ ingredient.count.value }}{{ ingredient.count.unit }}</strong>
        </li>
      </ul>
    </section>

    <section
      v-if="step.equipment?.length"
      class="runtime-card__section"
    >
      <h3>准备厨具</h3>
      <ul class="runtime-card__chips">
        <li
          v-for="equipment in step.equipment"
          :key="equipment.name"
        >
          {{ equipment.name }}
        </li>
      </ul>
    </section>

    <section
      v-if="step.tips?.length"
      class="runtime-card__section"
    >
      <h3>提醒</h3>
      <ul class="runtime-card__tips">
        <li
          v-for="tip in step.tips"
          :key="tip"
        >
          {{ tip }}
        </li>
      </ul>
    </section>

    <button
      class="runtime-card__action"
      :disabled="blocked"
      @click="emit('complete')"
    >
      {{ step.async ? "开始等待并继续下一件事" : "完成这一步" }}
    </button>
  </article>

  <article
    v-else-if="hasAsyncTasks"
    class="runtime-card runtime-card--resting"
  >
    <div class="runtime-card__eyebrow">
      <span>正在等待异步任务</span>
    </div>
    <div class="runtime-card__hero">
      <h2>先让时间往前走</h2>
      <p>当前没有可执行步骤。右上角的计时器归零后，新的步骤卡片会从上方落入。</p>
    </div>
  </article>

  <article
    v-else-if="finished"
    class="runtime-card runtime-card--finished"
  >
    <div class="runtime-card__eyebrow">
      <span>本次做菜完成</span>
    </div>
    <div class="runtime-card__hero">
      <h2>出锅吧</h2>
      <p>当前 mock runtime 已经走到终点。你可以返回选菜谱页，再跑一遍不同的菜。</p>
    </div>

    <NuxtLink
      to="/"
      class="runtime-card__action runtime-card__action--link"
    >
      回到选菜谱
    </NuxtLink>
  </article>

  <article
    v-else
    class="runtime-card runtime-card--resting"
  >
    <div class="runtime-card__eyebrow">
      <span>暂时没有可执行步骤</span>
    </div>
    <div class="runtime-card__hero">
      <h2>等待 runtime 状态恢复</h2>
      <p>当前流程里没有卡片可渲染。通常这意味着 mock 数据需要再补一条可执行链。</p>
    </div>
  </article>
</template>

<style scoped>
.runtime-card {
  display: grid;
  gap: 1.3rem;
  width: min(100%, 42rem);
  min-height: min(72vh, 38rem);
  padding: 1.35rem 1.15rem 1.15rem;
  border-radius: 2rem;
  background:
    linear-gradient(180deg, rgba(255, 254, 251, 0.98), rgba(255, 244, 231, 0.98));
  border: 1px solid rgba(150, 84, 31, 0.12);
  box-shadow: 0 1.8rem 3.8rem rgba(79, 42, 16, 0.12);
}

.runtime-card--blocked {
  background:
    linear-gradient(180deg, rgba(255, 251, 246, 0.98), rgba(251, 232, 220, 0.98));
}

.runtime-card--resting,
.runtime-card--finished {
  align-content: center;
}

.runtime-card__eyebrow {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  color: #9b5927;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.runtime-card__hero h2 {
  margin: 0;
  font-size: clamp(2rem, 7vw, 3.15rem);
  line-height: 1.02;
  color: #3e220f;
}

.runtime-card__hero p {
  margin: 0.75rem 0 0;
  color: #70482b;
  line-height: 1.75;
  font-size: clamp(1rem, 3.8vw, 1.12rem);
}

.runtime-card__section {
  display: grid;
  gap: 0.85rem;
}

.runtime-card__section h3 {
  margin: 0;
  color: #5b3114;
  font-size: 0.95rem;
}

.runtime-card__section ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.runtime-card__section li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0.95rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.72);
  color: #60381d;
}

.runtime-card__chips,
.runtime-card__tips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.runtime-card__chips li,
.runtime-card__tips li {
  justify-content: flex-start;
}

.runtime-card__action {
  margin-top: auto;
  width: 100%;
  min-height: 3.4rem;
  border: none;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, #de7029, #ba4c14);
  color: #fffdf9;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 1rem 2rem rgba(186, 76, 20, 0.24);
}

.runtime-card__action:disabled {
  background: linear-gradient(135deg, #d9b69c, #bd9276);
  cursor: not-allowed;
  box-shadow: none;
}

.runtime-card__action--link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

@media (min-width: 768px) {
  .runtime-card {
    min-height: 32rem;
    padding: 1.7rem;
  }
}
</style>
