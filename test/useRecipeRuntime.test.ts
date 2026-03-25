import { describe, expect, test } from "bun:test";

import { createRecipeRuntime } from "../app/composables/useRecipeRuntime";
import type { IRecipeSchema } from "../shared/types/recipe";

const phaseRecipe: IRecipeSchema = {
  meta: {
    id: "phase-runtime-test",
    name: "阶段测试菜谱",
    description: "用于验证 prepare 和 process 的切换行为",
    ingredients: [
      {
        name: "鸡丁",
        count: {
          value: 200,
          unit: "克",
        },
      },
    ],
    tags: ["测试"],
    coverImageUrl: "https://example.com/recipe.jpg",
    createdAt: "2026-03-26T00:00:00.000Z",
    updatedAt: "2026-03-26T00:00:00.000Z",
  },
  prepare: [
    {
      id: 10,
      title: "提前腌制",
      description: "先把鸡丁抓匀后静置",
      async: {
        waitMinutes: 1,
      },
    },
  ],
  process: [
    {
      id: 1,
      title: "切葱",
      description: "切好葱花",
      next: {
        id: 2,
        title: "腌鸡丁",
        description: "抓匀后静置",
        async: {
          waitMinutes: 1,
        },
        next: {
          id: 3,
          title: "热锅",
          description: "开始正式烹饪",
          prev: [2, 4],
        },
      },
    },
    {
      id: 4,
      title: "调汁",
      description: "把酱汁调匀",
    },
  ],
};

const blockedTopRecipe: IRecipeSchema = {
  meta: {
    id: "blocked-top-runtime-test",
    name: "阻塞栈顶测试菜谱",
    description: "用于验证 prev 在栈顶阻塞当前流程",
    ingredients: [],
    tags: ["测试"],
    coverImageUrl: "https://example.com/blocked.jpg",
    createdAt: "2026-03-26T00:00:00.000Z",
    updatedAt: "2026-03-26T00:00:00.000Z",
  },
  process: [
    {
      id: 100,
      title: "等待别人先完成",
      description: "这个节点应该直接阻塞在栈顶",
      prev: [999],
    },
    {
      id: 101,
      title: "排在下面的步骤",
      description: "这个节点不应该被偷偷提前到前面",
    },
  ],
};

describe("createRecipeRuntime", () => {
  test("starts from the prepare phase stack when prepare exists", () => {
    const runtime = createRecipeRuntime(phaseRecipe, {
      now: () => 0,
      autoTick: false,
    });

    expect(runtime.activePhase.value).toBe("prepare");
    expect(runtime.currentStep.value?.id).toBe(10);
    expect(runtime.isCurrentStepBlocked.value).toBe(false);
  });

  test("keeps an unresolved prev node at the stack top as blocked", () => {
    const runtime = createRecipeRuntime(blockedTopRecipe, {
      now: () => 0,
      autoTick: false,
    });

    expect(runtime.currentStep.value?.id).toBe(100);
    expect(runtime.isCurrentStepBlocked.value).toBe(true);
    expect(runtime.stack.value).toEqual([100, 101]);
  });

  test("does not mark an async step as completed until the wait finishes", () => {
    const currentTime = { value: 0 };
    const runtime = createRecipeRuntime(phaseRecipe, {
      now: () => currentTime.value,
      autoTick: false,
    });

    runtime.completeCurrentStep();

    expect(runtime.currentStep.value).toBeUndefined();
    expect(runtime.asyncTasks.value).toHaveLength(1);
    expect(runtime.completedStepIds.value).toEqual([]);
    expect(runtime.lastTransition.value).toBe("async-start");

    currentTime.value = 60_000;
    runtime.tick();

    expect(runtime.completedStepIds.value).toEqual([10]);
    expect(runtime.activePhase.value).toBe("process");
    expect(runtime.currentStep.value?.id).toBe(1);
  });

  test("keeps process phase inactive until prepare waits are fully finished", () => {
    const currentTime = { value: 0 };
    const runtime = createRecipeRuntime(phaseRecipe, {
      now: () => currentTime.value,
      autoTick: false,
    });

    runtime.completeCurrentStep();

    expect(runtime.activePhase.value).toBe("prepare");
    expect(runtime.currentStep.value).toBeUndefined();

    currentTime.value = 59_000;
    runtime.tick();

    expect(runtime.activePhase.value).toBe("prepare");
    expect(runtime.currentStep.value).toBeUndefined();
  });

  test("restores an async successor only after the wait ends and remaining prev dependencies complete", () => {
    const currentTime = { value: 0 };
    const runtime = createRecipeRuntime(phaseRecipe, {
      now: () => currentTime.value,
      autoTick: false,
    });

    runtime.completeCurrentStep();
    currentTime.value = 60_000;
    runtime.tick();
    runtime.completeCurrentStep();
    runtime.completeCurrentStep();

    expect(runtime.currentStep.value?.id).toBe(4);
    expect(runtime.completedStepIds.value).toEqual([10, 1]);
    expect(runtime.asyncTasks.value).toHaveLength(1);

    currentTime.value = 120_000;
    runtime.tick();

    expect(runtime.currentStep.value?.id).toBe(4);
    expect(runtime.asyncTasks.value).toHaveLength(0);
    expect(runtime.completedStepIds.value).toEqual([10, 1, 2]);

    runtime.completeCurrentStep();

    expect(runtime.currentStep.value?.id).toBe(3);
    expect(runtime.lastTransition.value).toBe("async-ready");
  });

  test("keeps async steps without next in waiting state until the timer completes", () => {
    const currentTime = { value: 0 };
    const runtime = createRecipeRuntime(
      {
        meta: {
          id: "async-tail-runtime-test",
          name: "尾部等待菜谱",
          description: "用于验证无 next 的 async 节点",
          ingredients: [],
          tags: ["测试"],
          coverImageUrl: "https://example.com/async-tail.jpg",
          createdAt: "2026-03-26T00:00:00.000Z",
          updatedAt: "2026-03-26T00:00:00.000Z",
        },
        process: [
          {
            id: 200,
            title: "焖 1 分钟",
            description: "等待结束后这一链才算完成",
            async: {
              waitMinutes: 1,
            },
          },
        ],
      },
      {
        now: () => currentTime.value,
        autoTick: false,
      },
    );

    runtime.completeCurrentStep();

    expect(runtime.hasFinished.value).toBe(false);
    expect(runtime.completedStepIds.value).toEqual([]);
    expect(runtime.asyncTasks.value).toHaveLength(1);

    currentTime.value = 60_000;
    runtime.tick();

    expect(runtime.completedStepIds.value).toEqual([200]);
    expect(runtime.hasFinished.value).toBe(true);
  });
});
