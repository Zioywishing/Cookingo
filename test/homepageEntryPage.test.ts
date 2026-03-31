import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("homepage entry page", () => {
  test("keeps homepage content but removes page-owned ambient shell markup", () => {
    const page = readProjectFile("app/pages/index.vue");

    expect(page).not.toContain('class="homepage-entry__ambient"');
    expect(page).toContain('class="homepage-entry__status"');
    expect(page).toContain('class="homepage-entry__logo"');
    expect(page).toContain('class="homepage-entry__brand"');
    expect(page).toContain('class="homepage-entry__welcome"');
    expect(page).toContain("{{ themeState.currentTimeLabel }}");
    expect(page).toContain("开启灵感");
    expect(page).toContain('to="/main/select-recipes"');
  });

  test("keeps theme transitions on layout and homepage consumer classes", () => {
    const defaultLayout = readProjectFile("app/layouts/default.vue");
    const page = readProjectFile("app/pages/index.vue");

    expect(defaultLayout).toContain("transition:");
    expect(defaultLayout).toContain("background-color");
    expect(defaultLayout).toContain("box-shadow");
    expect(page).toContain("transition:");
    expect(page).toContain("color");
    expect(page).toContain("stroke");
  });

  test("adds a staggered route-leave animation for homepage elements", () => {
    const page = readProjectFile("app/pages/index.vue");

    expect(page).toContain("onBeforeRouteLeave");
    expect(page).toContain("homepage-entry--leaving");
    expect(page).toContain("homepage-leave-up");
    expect(page).toContain("animation-play-state: paused");
    expect(page).toContain("both;");
    expect(page).toContain("homepage-entry__status {\n  animation: homepage-leave-up 240ms cubic-bezier(0.4, 0, 0.2, 1) 80ms both;");
    expect(page).toContain("homepage-entry__logo {\n  animation: homepage-leave-up 280ms cubic-bezier(0.4, 0, 0.2, 1) 140ms both;");
    expect(page).toContain("homepage-entry__welcome {\n  animation: homepage-leave-up 280ms cubic-bezier(0.4, 0, 0.2, 1) 290ms both;");
    expect(page).toContain("homepage-entry__action {\n  animation: homepage-leave-up 240ms cubic-bezier(0.4, 0, 0.2, 1) 340ms both;");
    expect(page).toContain("prefers-reduced-motion: reduce");
  });
});
