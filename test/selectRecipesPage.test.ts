import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("select recipes page", () => {
  test("implements the page with page-private components and local interaction state", () => {
    const page = readProjectFile("app/pages/main/select-recipes.vue");

    expect(page).toContain('import SelectRecipesFilterPanel from "~/components/main/select-recipes/SelectRecipesFilterPanel.vue"');
    expect(page).toContain('import SelectRecipesCard from "~/components/main/select-recipes/SelectRecipesCard.vue"');
    expect(page).toContain("SelectRecipesFilterPanel");
    expect(page).toContain("SelectRecipesCard");
    expect(page).toContain("searchKeyword");
    expect(page).toContain("selectedRecipeIds");
    expect(page).toContain("filteredRecipes");
    expect(page).toContain("toggleRecipeSelection");
    expect(page).toContain("开启烹饪之旅");
    expect(page).toContain("recipe-fab");
    expect(page).not.toContain("ambient-layer");
    expect(page).not.toContain("device-frame");
  });

  test("keeps the filter panel and card as page-private components", () => {
    const filterPanel = readProjectFile("app/components/main/select-recipes/SelectRecipesFilterPanel.vue");
    const card = readProjectFile("app/components/main/select-recipes/SelectRecipesCard.vue");

    expect(filterPanel).toContain("搜索菜谱、食材或标签");
    expect(filterPanel).toContain("defineEmits");
    expect(filterPanel).toContain("isOpen");
    expect(card).toContain("recipe-card");
    expect(card).toContain("selected");
    expect(card).toContain("animationDelayMs");
    expect(card).not.toContain('from "#shared/types/recipe"');
    expect(card).not.toContain('from "~/components/recipe/');
  });
});
