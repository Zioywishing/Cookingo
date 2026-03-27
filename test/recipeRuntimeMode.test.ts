import { describe, expect, test } from "bun:test";

import {
  getRecipeRuntimeModeLabel,
  getRecipeRuntimeStack,
  resolveRecipeRuntimeMode,
} from "../app/utils/recipeRuntime";
import {
  RecipeDifficulty,
  RecipeRuntimeMode,
  type IRecipeSchema,
} from "../shared/types/recipe";

const recipe: IRecipeSchema = {
  meta: {
    id: "mode-test-recipe",
    name: "模式测试菜谱",
    description: "用于验证 runtime mode 选择",
    ingredients: [],
    tags: ["测试"],
    coverImageUrl: "/mock.jpg",
    difficulty: RecipeDifficulty.Easy,
    createdAt: "2026-03-27T00:00:00.000Z",
    updatedAt: "2026-03-27T00:00:00.000Z",
  },
  prepare: [
    {
      id: 1,
      description: "提前腌制",
    },
  ],
  process: [
    {
      id: 2,
      description: "正式开炒",
    },
  ],
};

describe("recipeRuntime mode helpers", () => {
  test("defaults to process mode for unknown query values", () => {
    expect(resolveRecipeRuntimeMode(undefined)).toBe(RecipeRuntimeMode.Process);
    expect(resolveRecipeRuntimeMode("unexpected")).toBe(RecipeRuntimeMode.Process);
  });

  test("resolves prepare mode from query", () => {
    expect(resolveRecipeRuntimeMode("prepare")).toBe(RecipeRuntimeMode.Prepare);
    expect(resolveRecipeRuntimeMode(["prepare", "process"])).toBe(RecipeRuntimeMode.Prepare);
  });

  test("returns the stack that matches the selected runtime mode", () => {
    expect(getRecipeRuntimeStack(recipe, RecipeRuntimeMode.Prepare)).toBe(recipe.prepare);
    expect(getRecipeRuntimeStack(recipe, RecipeRuntimeMode.Process)).toBe(recipe.process);
    expect(getRecipeRuntimeStack(undefined, RecipeRuntimeMode.Process)).toEqual([]);
  });

  test("returns the page label for the selected runtime mode", () => {
    expect(getRecipeRuntimeModeLabel(RecipeRuntimeMode.Prepare, false)).toBe("准备阶段");
    expect(getRecipeRuntimeModeLabel(RecipeRuntimeMode.Process, false)).toBe("烹饪阶段");
    expect(getRecipeRuntimeModeLabel(RecipeRuntimeMode.Process, true)).toBe("已完成");
  });
});
