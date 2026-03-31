# Cookingo 选择菜谱页前端实现方案

## 1. 文档目标

本文档用于定义 `app/pages/main/select-recipes.vue` 的全新前端实现方案。

本次方案聚焦以下目标：

- 参考 `docs/b-end/demo/demo-select-recipes.html` 还原页面布局与核心交互
- 页面仅实现前端展示与本地交互，不接真实接口、不接真实跳转
- 不复用现有 recipe 业务组件与现有页面逻辑
- 不重复实现默认布局已经提供的背景壳层与 ambient 氛围层
- 保持目录归属符合 Nuxt 4 与项目前端规则

## 2. 当前现状

当前 `app/pages/main/select-recipes.vue` 仍是占位内容，尚未承接任何正式 UI 结构。

当前项目的 `app/layouts/default.vue` 已经负责：

- 整体背景 shell
- 内层 frame
- ambient 光晕层
- 内容视图滚动容器

因此本页不能再次实现整页背景、ambient 层或覆盖 layout 背景，否则会与当前布局职责冲突。

## 3. 已确认约束

本次方案基于以下已确认结论：

- 这是一次全新实现，不复用现有 recipe 组件或现有 recipe 页面逻辑
- 只做布局与交互，不接真实接口
- 搜索、筛选、多选、底部按钮数量变化都只基于本地 mock 数据
- 页面视觉只作用于内容层，不额外设置新的整页背景壳
- 后续页面还会继续调整，因此当前应优先保留修改空间
- 页面采用方案 B：页面组装 + 页面私有组件

## 4. 结构设计

### 4.1 页面职责

`app/pages/main/select-recipes.vue` 负责：

- 定义本地 mock 菜谱数据
- 定义筛选项配置
- 管理搜索词、筛选面板开关、激活筛选项、选中菜谱集合
- 基于搜索与筛选派生可展示列表
- 组装顶部区、列表区、底部悬浮按钮

页面不负责：

- 具体卡片展示细节
- 搜索框与筛选面板内部模板细节
- 全局背景和主题壳层

### 4.2 页面私有组件

本次新增目录：

- `app/components/main/select-recipes/`

目录下包含两个仅服务当前页面的组件：

- `SelectRecipesFilterPanel.vue`
- `SelectRecipesCard.vue`

#### `SelectRecipesFilterPanel.vue`

负责：

- 顶部标题栏中的筛选按钮与右侧占位按钮
- 搜索输入框
- 可展开筛选面板
- 难度、标签、厨具三组筛选 chip 的渲染和激活态

通过 props 接收当前状态，通过 emits 抛出：

- 搜索词更新
- 面板展开/收起
- 各分组筛选切换

#### `SelectRecipesCard.vue`

负责：

- 单张菜谱卡片的视觉结构
- 标题、描述、标签、厨具/时长等摘要信息展示
- 封面图或无图占位
- 选中态边框、阴影、勾选角标
- 点击卡片切换选中

卡片只做展示与点击发射，不持有业务状态。

## 5. 数据与交互设计

### 5.1 本地 mock 数据

页面内维护一组本地菜谱数据，每项包含：

- `id`
- `name`
- `description`
- `difficulty`
- `durationLabel`
- `tags`
- `equipment`
- `imageUrl`

这些数据仅服务当前前端演示，不进入共享类型层。

原因是：

- 本次明确为纯前端 demo 交互
- 后续数据结构还会调整
- 当前不应把临时展示模型过早抽到共享类型

### 5.2 页面状态

页面内维护以下状态：

- `searchKeyword`
- `isFilterPanelOpen`
- `activeDifficulty`
- `activeTag`
- `activeEquipment`
- `selectedRecipeIds`

其中筛选项采用单选切换：

- 再次点击当前已激活项时取消激活
- 未激活项点击后替换当前值

### 5.3 列表派生逻辑

展示列表由本地 mock 数据派生，过滤条件包括：

- 名称匹配
- 描述匹配
- 标签匹配
- 厨具匹配
- 难度匹配

过滤逻辑仅运行在前端本地 computed 中，不做防抖、不请求后端。

### 5.4 选中交互

卡片支持多选。

点击卡片后：

- 若当前未选中，则加入 `selectedRecipeIds`
- 若当前已选中，则从 `selectedRecipeIds` 移除

底部悬浮按钮文案根据当前选中数量实时变化，例如：

- `开启烹饪之旅 (1)`
- `开启烹饪之旅 (3)`

当数量为 0 时，底部按钮隐藏但保留布局安全间距。

## 6. 视觉设计

### 6.1 视觉边界

本页只实现内容层视觉，明确禁止：

- 新增整页背景色覆盖 layout
- 新增新的 ambient 光晕层
- 新增独立 device frame

本页允许实现的视觉元素包括：

- 表层卡片
- 搜索框
- chip
- 悬浮按钮
- 内容区入场动效

### 6.2 主题变量消费

页面与私有组件统一消费已有 `--app-theme-*` 变量，例如：

- `--app-theme-surface-elevated`
- `--app-theme-text-primary`
- `--app-theme-text-secondary`
- `--app-theme-accent`
- `--app-theme-accent-hover`
- `--app-theme-glow`
- `--app-theme-action-primary`
- `--app-theme-action-primary-text`

这样可以保证：

- 内容层视觉随现有主题自动切换
- 不复制 demo 中基于 `body` 的主题实现
- 不和当前 layout 的主题职责冲突

### 6.3 布局分层

页面内容结构分为三层：

1. 顶部操作区
2. 中部滚动列表区
3. 底部悬浮操作区

列表区使用页面自身内容容器滚动，不应破坏 default layout 提供的整体滚动结构。

### 6.4 动效

本次保留轻量动效：

- 筛选面板展开收起
- 卡片点击缩放与选中态过渡
- 底部按钮出现/隐藏过渡
- 列表初始进入时的轻量上移淡入

动效仅使用内容层样式过渡，不引入额外动画系统。

## 7. 测试与风险

### 7.1 验证范围

实现完成后需要至少验证：

- 页面可正常渲染
- 搜索能即时过滤结果
- 筛选面板可展开和收起
- 三组筛选 chip 可切换
- 卡片可多选
- 底部按钮数量与显示状态正确
- `bun quality-check` 无报错

### 7.2 已知边界

本次不处理：

- 真实接口数据接入
- 真实路由跳转
- 空状态插画资源
- 与其他 recipe 页面或组件的复用收敛

这些能力待后续需求明确后再演进。
