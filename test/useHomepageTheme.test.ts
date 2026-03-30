import { describe, expect, test } from "bun:test";

import {
  HomepageSegment,
  getCopyIndexForHour,
  getHomepageThemeState,
  resolveHomepageSegment,
} from "../app/composables/useHomepageTheme";

describe("useHomepageTheme helpers", () => {
  test("resolves the 7 homepage content segments by local hour", () => {
    expect(resolveHomepageSegment(0)).toBe(HomepageSegment.Midnight);
    expect(resolveHomepageSegment(4)).toBe(HomepageSegment.Midnight);
    expect(resolveHomepageSegment(5)).toBe(HomepageSegment.Morning);
    expect(resolveHomepageSegment(8)).toBe(HomepageSegment.Morning);
    expect(resolveHomepageSegment(9)).toBe(HomepageSegment.LateMorning);
    expect(resolveHomepageSegment(11)).toBe(HomepageSegment.LateMorning);
    expect(resolveHomepageSegment(12)).toBe(HomepageSegment.Noon);
    expect(resolveHomepageSegment(13)).toBe(HomepageSegment.Noon);
    expect(resolveHomepageSegment(14)).toBe(HomepageSegment.Afternoon);
    expect(resolveHomepageSegment(16)).toBe(HomepageSegment.Afternoon);
    expect(resolveHomepageSegment(17)).toBe(HomepageSegment.Dusk);
    expect(resolveHomepageSegment(19)).toBe(HomepageSegment.Dusk);
    expect(resolveHomepageSegment(20)).toBe(HomepageSegment.Night);
    expect(resolveHomepageSegment(23)).toBe(HomepageSegment.Night);
  });

  test("returns a stable copy index for the same hour", () => {
    const date = new Date("2026-03-27T17:00:00.000Z");

    expect(getCopyIndexForHour(date)).toBe(getCopyIndexForHour(date));
    expect(getCopyIndexForHour(date)).toBeGreaterThanOrEqual(0);
    expect(getCopyIndexForHour(date)).toBeLessThan(3);
  });

  test("builds homepage content state without exposing palette data", () => {
    const state = getHomepageThemeState(new Date(2026, 2, 27, 17, 0, 0));

    expect(state.segment).toBe(HomepageSegment.Dusk);
    expect(state.label).toBe("傍晚");
    expect(state.currentTimeLabel).toBe("17:00");
    expect(state.copyOptions).toHaveLength(3);
    expect(state.copyOptions).toContain("今晚做点热的。");
    expect(state.headline).toBe(state.copyOptions[state.copyIndex]);
    expect("palette" in state).toBe(false);
  });

  test("uses local runtime time instead of a fixed timezone conversion", () => {
    const state = getHomepageThemeState(new Date(2026, 2, 27, 2, 0, 0));

    expect(state.segment).toBe(HomepageSegment.Midnight);
    expect(state.label).toBe("凌晨");
    expect(state.timeRange).toBe("00:00 - 04:59");
    expect(state.currentTimeLabel).toBe("02:00");
  });
});
