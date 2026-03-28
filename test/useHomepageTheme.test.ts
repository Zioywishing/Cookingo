import { describe, expect, test } from "bun:test";

import {
  HomepageSegment,
  getCopyIndexForHour,
  getHomepageThemeState,
  resolveHomepageSegment,
} from "../app/composables/useHomepageTheme";
import { EAST_8_TIMEZONE_OFFSET_HOURS } from "../app/utils/timezone";

describe("useHomepageTheme helpers", () => {
  test("resolves the 7 homepage time segments by hour", () => {
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

  test("builds the dusk homepage state with time-linked copy and theme colors", () => {
    const state = getHomepageThemeState(new Date("2026-03-27T09:00:00.000Z"));

    expect(state.segment).toBe(HomepageSegment.Dusk);
    expect(state.label).toBe("傍晚");
    expect(state.copyOptions).toHaveLength(3);
    expect(state.copyOptions).toContain("今晚做点热的。");
    expect(state.headline).toBe(state.copyOptions[state.copyIndex]);
    expect(state.palette.background).toContain("#efd5ca");
    expect(state.palette.button).toBe("#844637");
    expect(state.palette.text).toBe("#332419");
  });

  test("uses fixed east-8 timezone instead of the runtime local timezone", () => {
    const state = getHomepageThemeState(new Date("2026-03-27T18:00:00.000Z"));

    expect(EAST_8_TIMEZONE_OFFSET_HOURS).toBe(8);
    expect(state.segment).toBe(HomepageSegment.Midnight);
    expect(state.label).toBe("凌晨");
    expect(state.timeRange).toBe("00:00 - 04:59");
  });
});
