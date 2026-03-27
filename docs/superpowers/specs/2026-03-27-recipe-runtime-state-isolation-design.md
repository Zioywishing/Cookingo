# Recipe Runtime State Isolation Design

## Goal

将菜谱调度 runtime 重构为一个只关注单个 `IRecipeProcessStack` 的纯调度器，使其与 `prepare`、`process` 等业务概念彻底解耦。

## Background

当前实现将 `prepare` 和 `process` 建模为 runtime 内部的阶段状态：

- runtime 直接接收 `IRecipeSchema`
- runtime 内部维护 `activePhase`
- 当 `prepare` 清空后，runtime 自动切换到 `process`

这与目标语义不一致。

本次设计确认的语义是：

- runtime 只调度单个 `IRecipeProcessStack`
- `prepare` 和 `process` 是上层业务概念，不属于 runtime
- runtime 不得因为当前运行的是 `prepare` 还是 `process` 而做任何功能分支
- 若未来产品需要在 `prepare` 和 `process` 之间切换，必须由上层显式创建不同的 runtime 实例或显式切换输入 stack

## Non-Goals

- 本次不重新设计 `IRecipeProcessNode` 的 `prev`、`next`、`async` 语义
- 本次不改变现有页面的视觉表现
- 本次不引入新的全局状态管理方案
- 本次不扩展为同时运行多个 stack 的多 runtime 编排器

## Current Problems

### 1. Runtime 对业务阶段有内建认知

当前 runtime 通过 `IRecipeSchema.prepare` 和 `IRecipeSchema.process` 决定初始化行为，并在内部持有 `activePhase`。这导致 runtime 不是一个通用调度器，而是一个带业务流程假设的阶段机。

### 2. Runtime 会自动跨阶段推进

当前 `prepare` 为空后会自动进入 `process`。这意味着 runtime 自己决定了业务状态迁移，调用方无法把 `prepare` 和 `process` 作为两份独立工作栈来使用。

### 3. 测试锁定了错误的抽象

现有测试验证的是“prepare 结束后 process 自动开始”这类阶段行为，而不是单个 `IRecipeProcessStack` 的调度行为。这会阻碍后续修正。

## Design Principles

### 1. Runtime 只处理调度，不处理业务命名

runtime 只知道：

- 当前工作栈
- 哪个节点在栈顶
- 哪些节点已完成
- 哪些节点因 `prev` 暂缓
- 哪些异步任务正在等待

runtime 不知道：

- 当前是 `prepare` 还是 `process`
- 是否存在下一阶段
- 何时应该切换到另一套业务流程

### 2. 单次运行只对应一个 stack

一次 runtime 实例的生命周期只对应一次 `IRecipeProcessStack` 调度。该 stack 跑完后，该 runtime 结束，不自动接力任何其他 stack。

### 3. 上层负责业务编排

页面、容器 composable 或未来更高层的 orchestration 模块负责选择：

- 当前传给 runtime 的是哪一个 stack
- 何时销毁当前 runtime
- 何时创建下一次 runtime

## Proposed API

### Types

```ts
import type { IRecipeProcessStack } from "#shared/types/recipe";

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
```

### Factory

```ts
export function createRecipeRuntime(
  initialStack: IRecipeProcessStack,
  options: RuntimeOptions = {},
)
```

```ts
export function useRecipeRuntime(stack: IRecipeProcessStack) {
  return createRecipeRuntime(stack);
}
```

### Returned Runtime Shape

保留这些通用字段：

- `stack`
- `currentStep`
- `completedStepIds`
- `deferredNodeIds`
- `asyncTasks`
- `hasFinished`
- `isCurrentStepBlocked`
- `lastTransition`
- `transitionKey`
- `completeCurrentStep()`
- `tick()`
- `dispose()`

删除这些阶段性字段或逻辑：

- `activePhase`
- 基于 phase 选择初始头节点的逻辑
- 任意形式的 `prepare -> process` 自动切换

## Runtime Behavior

### Initialization

- 入参 `initialStack` 直接作为 runtime 的初始工作栈来源
- runtime 从该数组中递归收集所有链上的节点，建立 node registry
- `stack` 初始值为 `initialStack.map((node) => node.id)`
- 若 `initialStack` 为空，则 runtime 立即处于完成态

### Current Step

- `currentStep` 永远取当前 `stack[0]`
- 用户界面任意时刻只展示一个当前节点，即栈顶节点

### Completion

当当前节点完成时：

1. 先从 `stack` 顶部移除当前节点
2. 若该节点带 `async.waitMinutes`，则登记等待任务，并立即让出栈顶
3. 若该节点不带 `async`，则立刻标记完成
4. 若该节点有 `next`，尝试把 `next` 入栈或放入 deferred
5. 检查此前 deferred 的节点中是否有新的可释放节点
6. 若此时 `stack`、`asyncTasks`、`deferredNodes` 都为空，则该 runtime 完成

### Prev Dependencies

- `prev` 一律按 AND 依赖处理
- 若节点依赖未满足，则不能执行
- 当一个节点因依赖未满足而无法入栈时，进入 deferred 集合
- 当任意节点完成后，runtime 重新检查 deferred 集合，把已经满足依赖的节点压回栈顶

### Async Tasks

- `async` 节点在用户完成手头动作时，不立即记入 `completedStepIds`
- runtime 只记录一个等待任务，直到 `tick()` 发现到时
- 到时后，runtime 才将该源节点标记完成
- 若源节点存在 `next`，则按统一规则尝试将 `next` 放入运行栈
- `async` 恢复逻辑不区分该 stack 在业务上是 `prepare` 还是 `process`

### Finished State

`hasFinished` 的定义改为：

- 当前 runtime 对应的这一个 stack 已经没有可执行节点
- 且没有等待中的异步任务
- 且没有待释放的 deferred 节点

`hasFinished` 不再意味着“应该切换到别的阶段”，只意味着“这一个 stack 跑完了”。

## UI Integration

`/cook/[id]` 页面不再把整份 `recipe` 直接交给 runtime。

页面层需要显式决定当前运行哪份 stack，例如：

- 运行 `recipe.prepare ?? []`
- 或运行 `recipe.process`

本次设计不强制页面立刻支持 prepare/process 双模式切换 UI，但明确要求：

- runtime 不承担该选择职责
- 任何“切换到另一份 stack”的行为都必须由页面或上层业务代码触发

## Migration Plan

### Runtime File

修改 [app/composables/useRecipeRuntime.ts](/root/code/Cookingo/app/composables/useRecipeRuntime.ts)：

- 将入参从 `IRecipeSchema` 改为 `IRecipeProcessStack`
- 删除 `RuntimePhase`
- 删除 `activePhase`
- 删除 `getPhaseHeadIds()`
- 删除 `advancePhaseIfIdle()` 中的跨阶段逻辑
- 将完成态判断改为单 stack 结束判断

### Page File

修改 [app/pages/cook/[id].vue](/root/code/Cookingo/app/pages/cook/[id].vue)：

- 页面自己选择传入的 stack
- 去掉对 `runtime.activePhase` 的依赖
- 任何阶段标签、模式标签都由页面自身业务状态决定，而不是由 runtime 输出

### Tests

修改 [test/useRecipeRuntime.test.ts](/root/code/Cookingo/test/useRecipeRuntime.test.ts)：

删除或重写这些测试方向：

- prepare 优先于 process
- prepare 未结束时 process 不能开始
- 任意基于 `activePhase` 的断言

保留并强化这些测试方向：

- 初始栈顶选择
- 栈顶阻塞
- 普通 next 推进
- async 延迟完成
- async 恢复后 next 入栈
- deferred 节点在依赖满足后释放
- 空 stack 立即 finished
- 无 next 的 async 尾节点在等待完成后 finished

## Risks

### 1. 页面短期会失去“阶段标签”来源

去掉 `activePhase` 后，页面若仍需展示“准备阶段/烹饪阶段”，必须自己维护当前业务模式。这是正确的职责回归，但会带来页面侧的小范围调整。

### 2. 现有测试需要整体改写

现有测试与错误抽象强绑定，迁移时需要主动删除旧断言，而不是机械修补。

### 3. 文档语义要同步

如果项目内还有把 runtime 描述为“prepare/process 阶段机”的文档，也需要同步更新，避免新实现与旧文档继续冲突。

## Acceptance Criteria

- `createRecipeRuntime` 只接收单个 `IRecipeProcessStack`
- runtime 返回值中不再暴露 `activePhase`
- runtime 内部不存在 `prepare`、`process`、`finished` 的阶段迁移逻辑
- 单 stack 的 `prev`、`next`、`async` 行为保持正确
- 页面可以通过外部传入不同 stack 来复用同一套 runtime
- 测试覆盖单 stack 调度语义，而不是跨阶段切换语义

## Open Decisions Resolved

### Runtime 是否保留对 `prepare/process` 的 mode 参数

不保留。runtime 必须完全不知道这两个概念。

### Runtime 是否在一个 stack 结束后自动加载另一份 stack

不自动加载。任何跨 stack 切换都属于上层编排职责。

### Runtime 是否需要支持多 stack 并行

本次不支持，也不为此预留复杂接口。保持单 runtime 对应单 stack。
