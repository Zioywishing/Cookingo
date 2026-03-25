import { computed } from "vue";

import type { ApiResponse } from "#shared/types/api";
import type { IRecipeSchema } from "#shared/types/recipe";

export function resolveRecipesResponse(
  response: ApiResponse<IRecipeSchema[]> | null | undefined,
) {
  return response?.data ?? [];
}

export function findRecipeById(recipes: IRecipeSchema[], id: string) {
  return recipes.find((recipe) => recipe.meta.id === id);
}

export function useRecipes() {
  const { data, pending, error } = useFetch<ApiResponse<IRecipeSchema[]>>(
    "/api/get/recipeList",
    {
      default: () => null,
    },
  );

  const recipes = computed(() => resolveRecipesResponse(data.value));

  function getRecipeById(id: string) {
    return findRecipeById(recipes.value, id);
  }

  return {
    data,
    pending,
    error,
    recipes,
    getRecipeById,
  };
}
