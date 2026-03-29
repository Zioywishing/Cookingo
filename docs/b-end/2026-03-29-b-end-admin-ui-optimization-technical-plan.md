# B 端后台 UI 优化前端技术方案

**目标：** 基于 `docs/b-end/demo/demo.html` 重构管理后台的视觉与组件体系，统一 `app/layouts/admin.vue`、`app/pages/admin/**`、`app/components/admin/**` 的设计语言，并在 `app/components/admin` 内建立可持续复用的后台通用组件库。

**范围：**

- 管理后台布局与导航框架
- 后台页面模板统一
- `app/components/admin` 通用基础组件层建设
- 用户、角色、日志等后台业务组件样式重构
- 登录页与初始化页风格统一

**非目标：**

- 不调整后台接口、权限模型与业务路由语义
- 不修改后台数据结构与接口返回
- 不进行与本次 UI 收敛无关的目录重构

---

## 一、现状问题

当前后台前端已具备基础可用性，但存在以下问题：

1. 视觉语言不统一
   当前后台主要是深色玻璃风，而设计目标明确要求对齐 `demo.html` 的浅色、出版感、轻边框后台风格。

2. 样式重复且分散
   用户、角色、日志等业务组件各自维护表格、卡片、输入框、弹窗样式，重复度高，后续扩展成本高。

3. 页面模板没有统一抽象
   首页、列表页、详情页、认证页目前都可用，但缺少统一模板约束，导致结构、留白、信息层级不稳定。

4. 组件库能力不足
   `app/components/admin` 已按业务域拆分，但还缺少后台通用基础组件层，无法稳定承接设计语言。

## 二、设计目标

1. 以 `docs/b-end/demo/demo.html` 为唯一视觉基准，建立一致的浅色 B 端后台语言。
2. 在 `app/components/admin` 内新增后台通用基础组件层，沉淀按钮、卡片、表格、表单、弹窗、状态标签等基础能力。
3. 将业务组件重构为“业务映射层”，复用基础组件完成用户、角色、日志等模块的展示。
4. 让后台首页、列表页、详情页、登录页、初始化页统一遵守同一套页面模板。
5. 确保桌面端与移动端都延续同一设计语言，而不是分别维护两套后台风格。

## 三、组件分层方案

后台组件库采用三层结构：

### 1. Shell 层

职责：维护后台框架骨架与全局页面结构。

涉及文件：

- `app/layouts/admin.vue`
- `app/components/admin/shell/AdminSidebar.vue`
- `app/components/admin/shell/AdminSidebarNav.vue`
- `app/components/admin/shell/AdminTopbar.vue`
- `app/components/admin/shell/AdminMobileSidebar.vue`
- `app/components/admin/shell/AdminPageContainer.vue`
- `app/components/admin/shell/AdminPageHeader.vue`

改造目标：

- 与 `demo.html` 的顶部横条、左侧导航、主内容区结构对齐
- 统一品牌区、用户区、导航激活态、内容区留白
- 提供移动端抽屉导航，但保持相同视觉语言

### 2. Base 层

职责：沉淀后台通用 UI primitives，只负责视觉与交互模式，不承载业务语义。

建议新增组件：

- `app/components/admin/base/AdminCard.vue`
- `app/components/admin/base/AdminButton.vue`
- `app/components/admin/base/AdminInput.vue`
- `app/components/admin/base/AdminField.vue`
- `app/components/admin/base/AdminToolbar.vue`
- `app/components/admin/base/AdminTable.vue`
- `app/components/admin/base/AdminDialog.vue`
- `app/components/admin/base/AdminBadge.vue`
- `app/components/admin/base/AdminEmptyState.vue`
- `app/components/admin/base/AdminSection.vue`

统一能力：

- 颜色、边框、圆角、阴影、字体层级
- hover / focus-visible / disabled / loading 状态
- 表格表头、滚动、空态、加载态
- 弹窗头部、内容区、底部动作区
- 工具栏操作位与标题辅助信息

### 3. Business 层

职责：保留 `user`、`role`、`log` 等业务分层，只做业务字段映射和页面组合。

涉及目录：

- `app/components/admin/user`
- `app/components/admin/role`
- `app/components/admin/log`

改造原则：

- 不再在业务组件里自建表格、表单、弹窗、按钮样式体系
- 全部改为基于 Base 层拼装
- 保持现有组件命名，减少页面接入成本

## 四、页面模板映射

### 1. Dashboard 模板

页面：

- `app/pages/admin/index.vue`

结构：

- 页面标题区
- 当前管理员欢迎卡
- 权限概览 / 模块概览
- 可访问模块入口卡片

目标：

- 对齐 `demo.html` 的编辑感标题和轻量数据卡结构
- 强化后台首页的信息导览能力

### 2. List 模板

页面：

- `app/pages/admin/users/index.vue`
- `app/pages/admin/roles/index.vue`
- `app/pages/admin/login-logs.vue`
- `app/pages/admin/audit-logs.vue`

结构：

- 页面标题区
- 右侧主操作工具栏
- 统一表格卡片

目标：

- 统一列表页的标题、操作按钮、表格容器、表头、行 hover 和空态

### 3. Detail 模板

页面：

- `app/pages/admin/users/[id].vue`
- `app/pages/admin/roles/[id].vue`

结构：

- 页面标题区
- 多块信息卡 / 配置卡 / 权限卡
- 危险操作区单独强调

目标：

- 将详情页统一成可扩展的卡片组装模式
- 让信息块层级清晰、表单状态统一

### 4. Auth 模板

页面：

- `app/pages/admin/login.vue`
- `app/pages/admin/init.vue`

结构：

- 聚焦式认证外壳
- 品牌区
- 单卡表单区
- 统一错误提示和主操作按钮

目标：

- 与后台主站保持同一设计语言
- 提高登录与初始化页的一致性和精致度

## 五、实施步骤

### 阶段 1：设计语言落地

- 新增 `ai-coding/rules/b-end-design-language.md`
- 将 `demo.html` 提炼为后台设计规则

### 阶段 2：搭建 Base 层

- 新增后台基础组件目录与关键 primitives
- 在基础组件中统一颜色变量、按钮样式、输入框样式、卡片和表格结构

### 阶段 3：重做 Shell 层

- 改造 `app/layouts/admin.vue` 与 shell 组件
- 统一后台整体布局、导航与顶部信息区

### 阶段 4：迁移 Business 层

- 用户、角色、日志业务组件全部改为基于 Base 层重组
- 收敛重复样式代码

### 阶段 5：页面接入

- 后台首页改为 dashboard 模板
- 列表页改为 list 模板
- 详情页改为 detail 模板
- 登录页与初始化页改为 auth 模板

### 阶段 6：验证

- 执行构建级或类型级检查
- 人工检查桌面端与移动端的导航、列表、详情、弹窗、认证页表现

## 六、风险与控制

### 风险 1：改造范围大，容易引入页面回归

控制：

- 保持页面路由与业务组件命名不变
- 优先替换样式承载方式，不改接口调用逻辑

### 风险 2：通用组件抽象过度

控制：

- 只抽按钮、卡片、表格、表单、弹窗、状态标签、工具栏等稳定模式
- 不抽过早、不做超前业务抽象

### 风险 3：移动端与桌面端风格分裂

控制：

- 由 Shell 层统一管理导航与品牌样式
- 移动端只调整布局，不另起设计语言

## 七、验收标准

- `app/layouts/admin.vue` 与 `app/pages/admin/**` 视觉语言与 `demo.html` 保持一致
- `app/components/admin` 内形成明确的后台通用基础组件层
- 用户、角色、日志模块均复用通用基础组件，不再散落重复样式
- 后台首页、列表页、详情页、登录页、初始化页模板统一
- 桌面端与移动端均可正常浏览与交互
