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
    expect(page).toContain('class="homepage-entry__status flex');
    expect(page).toContain('class="homepage-entry__logo mb-');
    expect(page).toContain('class="homepage-entry__brand m-0');
    expect(page).toContain('class="homepage-entry__welcome m-0');
    expect(page).toContain("{{ themeState.currentTimeLabel }}");
    expect(page).toContain("开启灵感");
    expect(page).toContain('to="/main/select-recipes"');
  });

  test("moves homepage base presentation styles into unocss utility classes", () => {
    const page = readProjectFile("app/pages/index.vue");

    expect(page).toContain('class="homepage-entry h-full min-h-full box-border overflow-hidden');
    expect(page).toContain('class="homepage-entry__content relative flex min-h-full box-border flex-col');
    expect(page).toContain('class="homepage-entry__status flex justify-end');
    expect(page).not.toContain('class="homepage-entry__status flex justify-end opacity-0');
    expect(page).toContain('class="homepage-entry__hero mt-[-8vh] flex flex-1 flex-col items-center justify-center gap-[0.9rem] text-center');
    expect(page).toContain('class="homepage-entry__cta box-border flex min-h-15 w-full items-center justify-center');

    expect(page).not.toMatch(/\n\.homepage-entry\s*\{/);
    expect(page).not.toMatch(/\n\.homepage-entry__content\s*\{/);
    expect(page).not.toMatch(/\n\.homepage-entry__status-pill\s*\{/);
    expect(page).not.toMatch(/\n\.homepage-entry__hero\s*\{/);
    expect(page).not.toMatch(/\n\.homepage-entry__cta\s*\{/);
  });

  test("keeps theme transitions on layout and homepage consumer classes", () => {
    const defaultLayout = readProjectFile("app/layouts/default.vue");
    const page = readProjectFile("app/pages/index.vue");

    expect(defaultLayout).toContain("transition:");
    expect(defaultLayout).toContain("background-color");
    expect(defaultLayout).toContain("box-shadow");
    expect(page).toContain("[transition:color_320ms_ease]");
    expect(page).toContain("[transition:stroke_320ms_ease]");
    expect(page).toContain("[transition:transform_220ms_ease,stroke_320ms_ease]");
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

  test("keeps staggered entry animations visible during delay without relying on opacity utility classes", () => {
    const page = readProjectFile("app/pages/index.vue");

    expect(page).not.toContain('class="homepage-entry__status flex justify-end opacity-0');
    expect(page).toContain(".homepage-entry__status {\n  animation: homepage-fade-up 700ms cubic-bezier(0.16, 1, 0.3, 1) 140ms both;");
    expect(page).toContain(".homepage-entry__logo {\n  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 240ms both;");
    expect(page).toContain(".homepage-entry__eyebrow {\n  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 340ms both;");
    expect(page).toContain(".homepage-entry__brand {\n  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 420ms both;");
    expect(page).toContain(".homepage-entry__welcome {\n  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 500ms both;");
    expect(page).toContain(".homepage-entry__action {\n  animation: homepage-fade-up 800ms cubic-bezier(0.16, 1, 0.3, 1) 620ms both;");
  });

  test("keeps entry and pulse keyframes inside scoped styles with semantic selectors", () => {
    const page = readProjectFile("app/pages/index.vue");

    expect(page).toContain("<style scoped>");
    expect(page).not.toContain("<style>\n@keyframes homepage-fade-up");
    expect(page).toContain(".homepage-entry__status-dot {\n  animation: homepage-pulse 2s infinite;");
    expect(page).toContain("@keyframes homepage-fade-up");
    expect(page).toContain("@keyframes homepage-pulse");
    expect(page).not.toContain("[animation:homepage-fade-up");
    expect(page).not.toContain("[animation:homepage-pulse");
  });
});
