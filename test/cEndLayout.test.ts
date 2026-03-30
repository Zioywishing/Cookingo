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

  test("injects the front-theme bootstrap script from the app shell for non-admin routes", () => {
    const appShell = readProjectFile("app/app.vue");

    expect(appShell).toContain("useGlobalTheme");
    expect(appShell).toContain("useRoute()");
    expect(appShell).toContain('startsWith("/admin")');
    expect(appShell).toContain("buildGlobalThemeBootstrapScript");
    expect(appShell).toContain("<NuxtLayout>");
  });

  test("provides a default layout shell with frame, ambient background, and view container", () => {
    const defaultLayout = readProjectFile("app/layouts/default.vue");

    expect(defaultLayout).toContain('class="default-layout"');
    expect(defaultLayout).toContain('class="default-layout__frame"');
    expect(defaultLayout).toContain('class="default-layout__ambient"');
    expect(defaultLayout).toContain('class="default-layout__view"');
    expect(defaultLayout).toContain("var(--app-theme-shell-background)");
    expect(defaultLayout).toContain("var(--app-theme-surface-base)");
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
