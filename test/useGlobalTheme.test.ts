import { describe, expect, test } from "bun:test";

import {
  GlobalThemeSegment,
  buildGlobalThemeBootstrapScript,
  getGlobalThemeCssVariables,
  resolveGlobalThemeSegment,
} from "../app/composables/useGlobalTheme";

describe("useGlobalTheme helpers", () => {
  test("resolves the 7 front-theme segments by local hour", () => {
    expect(resolveGlobalThemeSegment(0)).toBe(GlobalThemeSegment.Midnight);
    expect(resolveGlobalThemeSegment(5)).toBe(GlobalThemeSegment.Morning);
    expect(resolveGlobalThemeSegment(9)).toBe(GlobalThemeSegment.LateMorning);
    expect(resolveGlobalThemeSegment(12)).toBe(GlobalThemeSegment.Noon);
    expect(resolveGlobalThemeSegment(14)).toBe(GlobalThemeSegment.Afternoon);
    expect(resolveGlobalThemeSegment(17)).toBe(GlobalThemeSegment.Dusk);
    expect(resolveGlobalThemeSegment(21)).toBe(GlobalThemeSegment.Night);
  });

  test("returns app-scoped css variables for a local segment", () => {
    const vars = getGlobalThemeCssVariables(GlobalThemeSegment.Dusk);

    expect(vars["--app-theme-shell-background"]).toBe("#1A0F0A");
    expect(vars["--app-theme-surface-base"]).toBe("#2B160E");
    expect(vars["--app-theme-surface-elevated"]).toBe("#3D2218");
    expect(vars["--app-theme-text-primary"]).toBe("#FFF0E6");
    expect(vars["--app-theme-action-primary"]).toBe("#FF5E33");
  });

  test("builds an inline bootstrap script that computes theme from local time", () => {
    const script = buildGlobalThemeBootstrapScript();

    expect(script).toContain("new Date()");
    expect(script).toContain("getHours()");
    expect(script).toContain("--app-theme-shell-background");
    expect(script).toContain("document.documentElement.style.setProperty");
  });
});
