import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("homepage entry page", () => {
  test("adopts the demo-inspired hero structure and time pill", () => {
    const page = readProjectFile("app/pages/index.vue");

    expect(page).toContain('class="homepage-entry__ambient"');
    expect(page).toContain('class="homepage-entry__status"');
    expect(page).toContain('class="homepage-entry__logo"');
    expect(page).toContain('class="homepage-entry__brand"');
    expect(page).toContain('class="homepage-entry__welcome"');
    expect(page).toContain("{{ themeState.currentTimeLabel }}");
    expect(page).toContain("开启灵感");
    expect(page).toContain('to="/recipes"');
  });
});
