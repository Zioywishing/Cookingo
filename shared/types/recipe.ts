/**
 * 菜谱支持的难度等级。
 */
export enum RecipeDifficulty {
  /** 适合新手，或整体操作强度较低。 */
  Easy = "easy",
  /** 需要一定基础下厨经验。 */
  Medium = "medium",
  /** 对火候、时机或技巧要求更高。 */
  Hard = "hard",
}

/**
 * 菜谱元信息中的食材摘要，便于开做前快速总览。
 */
export interface IRecipeIngredientMeta extends IRecipeIngredient {
  /** 可选的分组标签，例如“酱汁”“装饰”。 */
  group?: string;
  /** 标记该食材是否为可选。 */
  optional?: boolean;
}

export interface IRecipeIngredient {
  /** 食材展示名称。 */
  name: string;
  /** 食材用量。 */
  count: {
    /** 数值 */
    value: number;
    /** 单位 */
    unit: string;
  };
}

/**
 * 菜谱的顶层摘要信息，用于列表展示、筛选，以及开做前的信息确认。
 */
export interface IRecipeMeta {
  /** 菜谱的稳定唯一标识。 */
  id: string;
  /** 菜谱名称。 */
  name: string;
  /** 对菜品特点的简要描述。 */
  description: string;
  /** 开始烹饪前需要确认的完整食材总览。 */
  ingredients: IRecipeIngredientMeta[];
  /** 用于搜索和分类的标签。 */
  tags: string[];
  /** 列表页或详情页使用的封面图地址。 */
  coverImageUrl: string;
  /** 份数。默认为 1 */
  servings?: number;
  /** 菜谱整体难度估计。 */
  difficulty?: RecipeDifficulty;
  /** 菜谱作者或维护者。 */
  author?: string;
  /** 原始来源链接或引用说明。 */
  source?: string;

  /** 创建时间，建议使用 ISO 8601 格式。 */
  createdAt: string;
  /** 最后更新时间，建议使用 ISO 8601 格式。 */
  updatedAt: string;
}

/**
 * 烹饪流程中的单个可执行步骤。
 */
export interface IRecipeProcessNode {
  /** 步骤标题，可选。 */
  title?: string;
  /** 步骤的主要操作说明。 */
  description: string;
  /** 需要的前置节点 */
  prev?: IRecipeProcessNode[];
  /** 下一环节 */
  next?: IRecipeProcessNode;
  /** 
   * 异步环节
   * 异步环节在完整后，不会立即进入下一个环节，而是在等待时间结束后才会进入下一个环节。
   * 在异步环节等待时，当前node暂时移出 IRecipeProcessStack ，等待时间结束后将next节点重新入 IRecipeProcessStack 顶以继续流程。
   **/
  async?: {
    /** 中间等待时间 */
    waitMinutes: number;
  }
  /** 当前步骤的预计耗时，单位为分钟。 */
  durationMinutes?: number;
  /** 当前步骤会使用到的食材名称列表。 */
  ingredients?: IRecipeIngredient[];
  /** 当前步骤得到的中间食材名称列表。 */
  intermediateIngredients?: IRecipeIngredient[];
  /** 帮助避免常见失误的补充提示。 */
  tips?: string[];
}

export type IRecipeProcessStack = IRecipeProcessNode[];

/**
 * 完整菜谱结构，包含摘要信息与流程步骤。
 */
export interface IRecipeSchema {
  /** 菜谱摘要与食材总览。 */
  meta: IRecipeMeta;
  /** 按顺序排列的准备流程。如提前腌制等长时间准备流程在这里实现。存储所有流程链表的头节点 */
  prepare?: IRecipeProcessStack;
  /** 按顺序排列的烹饪流程。存储所有流程链表的头节点 */
  process: IRecipeProcessStack;
}
