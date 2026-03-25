import { computed, onScopeDispose, ref } from "vue";

import type { IRecipeProcessNode, IRecipeSchema } from "#shared/types/recipe";

type RuntimeTransition =
  | "idle"
  | "advance"
  | "async-start"
  | "async-ready";

type RuntimePhase = "prepare" | "process" | "finished";

interface RuntimeOptions {
  now?: () => number;
  autoTick?: boolean;
}

interface RuntimeAsyncTask {
  sourceNodeId: number;
  nextNodeId: number;
  title: string;
  readyAt: number;
}

interface DeferredRuntimeNode {
  nodeId: number;
  transition: RuntimeTransition;
}

function collectNodes(
  heads: IRecipeProcessNode[] | undefined,
  registry: Map<number, IRecipeProcessNode>,
) {
  const visit = (node: IRecipeProcessNode | undefined) => {
    if (!node || registry.has(node.id)) {
      return;
    }

    registry.set(node.id, node);
    visit(node.next);
  };

  heads?.forEach(visit);
}

function formatTaskTitle(node: IRecipeProcessNode) {
  return node.title ?? node.description;
}

export function createRecipeRuntime(
  recipe: IRecipeSchema,
  options: RuntimeOptions = {},
) {
  const now = options.now ?? (() => Date.now());
  const nodeRegistry = new Map<number, IRecipeProcessNode>();

  collectNodes(recipe.prepare, nodeRegistry);
  collectNodes(recipe.process, nodeRegistry);

  const initialPhase: RuntimePhase = recipe.prepare?.length
    ? "prepare"
    : recipe.process.length
      ? "process"
      : "finished";

  const activePhase = ref<RuntimePhase>(initialPhase);
  const stack = ref<number[]>(getPhaseHeadIds(initialPhase));
  const completedStepIds = ref<number[]>([]);
  const deferredNodes = ref<DeferredRuntimeNode[]>([]);
  const asyncTasks = ref<RuntimeAsyncTask[]>([]);
  const lastTransition = ref<RuntimeTransition>("idle");
  const transitionKey = ref(0);
  const completedSet = computed(() => new Set(completedStepIds.value));

  let timer: number | undefined;

  function getPhaseHeadIds(phase: RuntimePhase) {
    if (phase === "prepare") {
      return (recipe.prepare ?? []).map((node) => node.id);
    }

    if (phase === "process") {
      return recipe.process.map((node) => node.id);
    }

    return [];
  }

  function resolveNode(nodeId?: number) {
    return typeof nodeId === "number" ? nodeRegistry.get(nodeId) : undefined;
  }

  function canRunNode(node: IRecipeProcessNode | undefined) {
    if (!node?.prev?.length) {
      return true;
    }

    return node.prev.every((dependencyId) =>
      completedSet.value.has(dependencyId),
    );
  }

  function pushTransition(transition: RuntimeTransition) {
    lastTransition.value = transition;
    transitionKey.value += 1;
  }

  function markStepCompleted(stepId: number) {
    if (completedSet.value.has(stepId)) {
      return;
    }

    completedStepIds.value = [...completedStepIds.value, stepId];
  }

  function isNodeTracked(nodeId: number) {
    return (
      stack.value.includes(nodeId) ||
      deferredNodes.value.some((entry) => entry.nodeId === nodeId)
    );
  }

  function queueNode(
    node: IRecipeProcessNode | undefined,
    mode: RuntimeTransition,
  ) {
    if (!node || isNodeTracked(node.id)) {
      return false;
    }

    if (canRunNode(node)) {
      stack.value.unshift(node.id);
      pushTransition(mode);
      return true;
    }

    deferredNodes.value = [
      ...deferredNodes.value,
      {
        nodeId: node.id,
        transition: mode,
      },
    ];
    return false;
  }

  function releaseDeferredNodes() {
    const readyNodes = deferredNodes.value.filter((entry) =>
      canRunNode(resolveNode(entry.nodeId)),
    );

    if (!readyNodes.length) {
      return false;
    }

    deferredNodes.value = deferredNodes.value.filter(
      (entry) => !readyNodes.some((readyNode) => readyNode.nodeId === entry.nodeId),
    );

    readyNodes
      .slice()
      .reverse()
      .forEach((entry) => {
        stack.value.unshift(entry.nodeId);
      });

    pushTransition(readyNodes.at(-1)?.transition ?? "advance");
    return true;
  }

  function advancePhaseIfIdle() {
    if (stack.value.length || deferredNodes.value.length || asyncTasks.value.length) {
      return false;
    }

    if (activePhase.value === "prepare") {
      if (recipe.process.length) {
        activePhase.value = "process";
        stack.value = getPhaseHeadIds("process");
        pushTransition("advance");
        return true;
      }

      activePhase.value = "finished";
      return true;
    }

    if (activePhase.value === "process") {
      activePhase.value = "finished";
      return true;
    }

    return false;
  }

  const currentStep = computed(() => resolveNode(stack.value[0]));
  const isCurrentStepBlocked = computed(() => !canRunNode(currentStep.value));
  const hasFinished = computed(
    () =>
      activePhase.value === "finished" &&
      !stack.value.length &&
      !asyncTasks.value.length &&
      !deferredNodes.value.length,
  );
  const sortedAsyncTasks = computed(() =>
    [...asyncTasks.value].sort((left, right) => left.readyAt - right.readyAt),
  );

  function completeCurrentStep() {
    const step = currentStep.value;

    if (!step || isCurrentStepBlocked.value) {
      return;
    }

    stack.value.shift();

    if (step.async?.waitMinutes) {
      asyncTasks.value = [
        ...asyncTasks.value,
        {
          sourceNodeId: step.id,
          nextNodeId: step.next?.id ?? step.id,
          title: formatTaskTitle(step),
          readyAt: now() + step.async.waitMinutes * 60_000,
        },
      ];

      releaseDeferredNodes();
      pushTransition("async-start");
      return;
    }

    markStepCompleted(step.id);

    let didQueueNext = false;

    if (step.next) {
      didQueueNext = queueNode(step.next, "advance");
    }

    const releasedDeferredNodes = releaseDeferredNodes();
    advancePhaseIfIdle();

    if (!didQueueNext && !releasedDeferredNodes && currentStep.value) {
      pushTransition("advance");
    }
  }

  function tick() {
    const currentTime = now();
    const readyTasks = asyncTasks.value.filter((task) => task.readyAt <= currentTime);

    if (!readyTasks.length) {
      return;
    }

    asyncTasks.value = asyncTasks.value.filter((task) => task.readyAt > currentTime);

    readyTasks.forEach((task) => {
      markStepCompleted(task.sourceNodeId);
      const sourceNode = resolveNode(task.sourceNodeId);

      if (sourceNode?.next) {
        queueNode(sourceNode.next, "async-ready");
      }
    });

    releaseDeferredNodes();
    advancePhaseIfIdle();
  }

  function dispose() {
    if (typeof timer === "number") {
      window.clearInterval(timer);
      timer = undefined;
    }
  }

  if (options.autoTick !== false && import.meta.client) {
    timer = window.setInterval(() => {
      tick();
    }, 1000);

    onScopeDispose(() => {
      dispose();
    });
  }

  return {
    activePhase,
    stack,
    currentStep,
    completedStepIds,
    deferredNodeIds: computed(() => deferredNodes.value.map((entry) => entry.nodeId)),
    asyncTasks: sortedAsyncTasks,
    hasFinished,
    isCurrentStepBlocked,
    lastTransition,
    transitionKey,
    completeCurrentStep,
    tick,
    dispose,
  };
}

export function useRecipeRuntime(recipe: IRecipeSchema) {
  return createRecipeRuntime(recipe);
}
