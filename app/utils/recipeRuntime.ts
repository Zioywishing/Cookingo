import {
  RecipeRuntimeMode,
  type IRecipeProcessStack,
  type IRecipeSchema,
} from "#shared/types/recipe";

export function resolveRecipeRuntimeMode(
  value: string | string[] | null | undefined,
) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return rawValue === RecipeRuntimeMode.Prepare
    ? RecipeRuntimeMode.Prepare
    : RecipeRuntimeMode.Process;
}

export function getRecipeRuntimeStack(
  recipe: IRecipeSchema | undefined,
  mode: RecipeRuntimeMode,
): IRecipeProcessStack {
  if (!recipe) {
    return [];
  }

  return mode === RecipeRuntimeMode.Prepare
    ? (recipe.prepare ?? [])
    : recipe.process;
}

export function getRecipeRuntimeModeLabel(
  mode: RecipeRuntimeMode,
  hasFinished: boolean,
) {
  if (hasFinished) {
    return "已完成";
  }

  return mode === RecipeRuntimeMode.Prepare ? "准备阶段" : "烹饪阶段";
}
