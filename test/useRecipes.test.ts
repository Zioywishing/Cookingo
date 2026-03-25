import { describe, expect, test } from "bun:test";

import {
  findRecipeById,
  resolveRecipesResponse,
} from "../app/composables/useRecipes";
import { RecipeDifficulty, type IRecipeSchema } from "../shared/types/recipe";
import type { ApiResponse } from "../shared/types/api";

const recipes: IRecipeSchema[] = [
  {
    meta: {
      id: "mapo-tofu",
      name: "麻婆豆腐",
      description: "测试菜谱",
      ingredients: [
        {
          name: "豆腐",
          count: {
            value: 1,
            unit: "块",
          },
        },
      ],
      tags: ["下饭"],
      coverImageUrl: "https://example.com/mapo-tofu.jpg",
      difficulty: RecipeDifficulty.Medium,
      createdAt: "2026-03-26T00:00:00.000Z",
      updatedAt: "2026-03-26T00:00:00.000Z",
    },
    process: [
      {
        id: 1,
        title: "备料",
        description: "把材料准备好",
      },
    ],
  },
];

describe("useRecipes helpers", () => {
  test("resolves recipe list from api response data", () => {
    const response: ApiResponse<IRecipeSchema[]> = {
      code: 0,
      data: recipes,
      msg: "success",
    };

    expect(resolveRecipesResponse(response)).toEqual(recipes);
  });

  test("finds recipe by meta id", () => {
    expect(findRecipeById(recipes, "mapo-tofu")).toEqual(recipes[0]);
    expect(findRecipeById(recipes, "missing-recipe")).toBeUndefined();
  });
});
