import { describe, expect, test } from "bun:test";

import { createRecipeRuntime } from "../app/composables/useRecipeRuntime";
import type { IRecipeProcessStack } from "../shared/types/recipe";

const simpleStack: IRecipeProcessStack = [
  {
    id: 1,
    title: "切蒜",
    description: "把蒜切末",
  },
];

const dependencyStack: IRecipeProcessStack = [
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
];

describe("createRecipeRuntime api", () => {
  test("starts from the provided stack head", () => {
    const runtime = createRecipeRuntime(simpleStack, {
      now: () => 0,
      autoTick: false,
    });

    expect(runtime.currentStep.value?.id).toBe(1);
    expect(runtime.hasFinished.value).toBe(false);
  });

  test("treats an empty stack as finished", () => {
    const runtime = createRecipeRuntime([], {
      now: () => 0,
      autoTick: false,
    });

    expect(runtime.currentStep.value).toBeUndefined();
    expect(runtime.hasFinished.value).toBe(true);
  });
});

describe("createRecipeRuntime scheduling", () => {
  test("keeps an unresolved prev node at the stack top as blocked", () => {
    const runtime = createRecipeRuntime(
      [
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
      {
        now: () => 0,
        autoTick: false,
      },
    );

    expect(runtime.currentStep.value?.id).toBe(100);
    expect(runtime.isCurrentStepBlocked.value).toBe(true);
    expect(runtime.stack.value).toEqual([100, 101]);
  });

  test("does not mark an async step as completed until the wait finishes", () => {
    const currentTime = { value: 0 };
    const runtime = createRecipeRuntime(
      [
        {
          id: 10,
          title: "提前腌制",
          description: "先把鸡丁抓匀后静置",
          async: {
            waitMinutes: 1,
          },
        },
      ],
      {
        now: () => currentTime.value,
        autoTick: false,
      },
    );

    runtime.completeCurrentStep();

    expect(runtime.currentStep.value).toBeUndefined();
    expect(runtime.asyncTasks.value).toHaveLength(1);
    expect(runtime.completedStepIds.value).toEqual([]);
    expect(runtime.lastTransition.value).toBe("async-start");

    currentTime.value = 60_000;
    runtime.tick();

    expect(runtime.completedStepIds.value).toEqual([10]);
    expect(runtime.hasFinished.value).toBe(true);
  });

  test("restores an async successor only after the wait ends and remaining prev dependencies complete", () => {
    const currentTime = { value: 0 };
    const runtime = createRecipeRuntime(dependencyStack, {
      now: () => currentTime.value,
      autoTick: false,
    });

    runtime.completeCurrentStep();
    runtime.completeCurrentStep();

    expect(runtime.currentStep.value?.id).toBe(4);
    expect(runtime.completedStepIds.value).toEqual([1]);
    expect(runtime.asyncTasks.value).toHaveLength(1);

    currentTime.value = 60_000;
    runtime.tick();

    expect(runtime.currentStep.value?.id).toBe(4);
    expect(runtime.asyncTasks.value).toHaveLength(0);
    expect(runtime.completedStepIds.value).toEqual([1, 2]);

    runtime.completeCurrentStep();

    expect(runtime.currentStep.value?.id).toBe(3);
    expect(runtime.lastTransition.value).toBe("async-ready");
  });

  test("keeps async steps without next in waiting state until the timer completes", () => {
    const currentTime = { value: 0 };
    const runtime = createRecipeRuntime(
      [
        {
          id: 200,
          title: "焖 1 分钟",
          description: "等待结束后这一链才算完成",
          async: {
            waitMinutes: 1,
          },
        },
      ],
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
