import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("C-end layout integration", () => {
  test("mounts pages through NuxtLayout in the app shell", () => {
    const appShell = readProjectFile("app/app.vue");

    expect(appShell).toContain("<NuxtLayout>");
    expect(appShell).toContain("<NuxtPage />");
  });

  test("provides a default layout with viewport sizing and hidden scrollbars", () => {
    const defaultLayout = readProjectFile("app/layouts/default.vue");

    expect(defaultLayout).toContain('class="default-layout"');
    expect(defaultLayout).toContain("width: 100vw");
    expect(defaultLayout).toContain("height: 100vh");
    expect(defaultLayout).toContain("overflow-x: hidden");
    expect(defaultLayout).toContain("overflow-y: auto");
    expect(defaultLayout).toContain("scrollbar-width: none");
    expect(defaultLayout).toContain("::-webkit-scrollbar");
  });

  test("lets non-admin pages use the default layout", () => {
    const cEndPages = [
      "app/pages/index.vue",
      "app/pages/recipes.vue",
      "app/pages/cook/[id].vue",
    ];

    for (const pagePath of cEndPages) {
      expect(readProjectFile(pagePath)).not.toContain("layout: false");
    }

    const adminPage = readProjectFile("app/pages/admin/index.vue");

    expect(adminPage).toContain("layout: 'admin'");
  });
});
