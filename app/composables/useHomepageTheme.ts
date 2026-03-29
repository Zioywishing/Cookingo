import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import {
  EAST_8_TIMEZONE_OFFSET_HOURS,
  getDateInFixedTimezone,
} from "../utils/timezone";

export enum HomepageSegment {
  Midnight = "midnight",
  Morning = "morning",
  LateMorning = "late-morning",
  Noon = "noon",
  Afternoon = "afternoon",
  Dusk = "dusk",
  Night = "night",
}

interface IHomepagePalette {
  shellBackground: string;
  base: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentHover: string;
  glow: string;
  button: string;
  buttonText: string;
}

interface IHomepageThemeDefinition {
  label: string;
  timeRange: string;
  palette: IHomepagePalette;
  copyOptions: [string, string, string];
}

export interface IHomepageThemeState extends IHomepageThemeDefinition {
  segment: HomepageSegment;
  copyIndex: number;
  headline: string;
  currentTimeLabel: string;
}

const HOMEPAGE_THEME_MAP: Record<HomepageSegment, IHomepageThemeDefinition> = {
  [HomepageSegment.Midnight]: {
    label: "凌晨",
    timeRange: "00:00 - 04:59",
    palette: {
      shellBackground: "#050403",
      base: "#0D0907",
      surface: "#18110D",
      text: "#F7EFE8",
      muted: "rgba(247, 239, 232, 0.42)",
      accent: "#FF9A3D",
      accentHover: "#FFAE5C",
      glow: "rgba(255, 154, 61, 0.18)",
      button: "#FF9A3D",
      buttonText: "#120C08",
    },
    copyOptions: [
      "现在做一顿，也不晚。",
      "夜里也能慢慢做饭。",
      "这个时间，简单做点热的。",
    ],
  },
  [HomepageSegment.Morning]: {
    label: "早上",
    timeRange: "05:00 - 08:59",
    palette: {
      shellBackground: "#F8E9E1",
      base: "#FFF5F0",
      surface: "#FFE7D9",
      text: "#3D2012",
      muted: "rgba(61, 32, 18, 0.5)",
      accent: "#FF8260",
      accentHover: "#FF6A42",
      glow: "rgba(255, 130, 96, 0.4)",
      button: "#FF8260",
      buttonText: "#FFFFFF",
    },
    copyOptions: [
      "早上也可以慢一点。",
      "今天先好好吃饭。",
      "从一顿热的开始。",
    ],
  },
  [HomepageSegment.LateMorning]: {
    label: "上午",
    timeRange: "09:00 - 11:59",
    palette: {
      shellBackground: "#F5EEE6",
      base: "#FBF6EF",
      surface: "#F4EBDD",
      text: "#332419",
      muted: "rgba(51, 36, 25, 0.5)",
      accent: "#E07B47",
      accentHover: "#CC6A37",
      glow: "rgba(224, 123, 71, 0.26)",
      button: "#E07B47",
      buttonText: "#FFFFFF",
    },
    copyOptions: [
      "从一顿热的开始。",
      "今天做点简单的。",
      "先把这顿饭做好。",
    ],
  },
  [HomepageSegment.Noon]: {
    label: "中午",
    timeRange: "12:00 - 13:59",
    palette: {
      shellBackground: "#F3EEE7",
      base: "#FDFBF7",
      surface: "#F2EBE1",
      text: "#271E15",
      muted: "rgba(39, 30, 21, 0.5)",
      accent: "#DD6A2A",
      accentHover: "#C55C22",
      glow: "rgba(221, 106, 42, 0.3)",
      button: "#DD6A2A",
      buttonText: "#FFFFFF",
    },
    copyOptions: [
      "中午给自己做点吃的。",
      "先把这顿饭解决好。",
      "这个时间，适合做顿简单的。",
    ],
  },
  [HomepageSegment.Afternoon]: {
    label: "下午",
    timeRange: "14:00 - 16:59",
    palette: {
      shellBackground: "#E9DDD1",
      base: "#F2E6D9",
      surface: "#E7D4C4",
      text: "#3B281B",
      muted: "rgba(59, 40, 27, 0.52)",
      accent: "#C96A3A",
      accentHover: "#B95E31",
      glow: "rgba(201, 106, 58, 0.24)",
      button: "#C96A3A",
      buttonText: "#FFFFFF",
    },
    copyOptions: [
      "下午适合做顿简单的。",
      "现在开始，也来得及。",
      "留一点时间给这顿饭。",
    ],
  },
  [HomepageSegment.Dusk]: {
    label: "傍晚",
    timeRange: "17:00 - 19:59",
    palette: {
      shellBackground: "#1A0F0A",
      base: "#2B160E",
      surface: "#3D2218",
      text: "#FFF0E6",
      muted: "rgba(255, 240, 230, 0.6)",
      accent: "#FF5E33",
      accentHover: "#FF7A55",
      glow: "rgba(255, 94, 51, 0.2)",
      button: "#FF5E33",
      buttonText: "#2B160E",
    },
    copyOptions: [
      "今晚做点热的。",
      "回来以后，认真做一顿。",
      "晚饭还是自己做吧。",
    ],
  },
  [HomepageSegment.Night]: {
    label: "晚上",
    timeRange: "20:00 - 23:59",
    palette: {
      shellBackground: "#090604",
      base: "#120C08",
      surface: "#1E1510",
      text: "#FFFFFF",
      muted: "rgba(255, 255, 255, 0.4)",
      accent: "#FF8200",
      accentHover: "#FFA23A",
      glow: "rgba(255, 130, 0, 0.2)",
      button: "#FF8200",
      buttonText: "#120C08",
    },
    copyOptions: [
      "回来以后，认真做一顿。",
      "今天就做顿热的吧。",
      "晚上也能慢慢开始。",
    ],
  },
};

export function resolveHomepageSegment(hour: number) {
  if (hour >= 0 && hour <= 4) {
    return HomepageSegment.Midnight;
  }

  if (hour <= 8) {
    return HomepageSegment.Morning;
  }

  if (hour <= 11) {
    return HomepageSegment.LateMorning;
  }

  if (hour <= 13) {
    return HomepageSegment.Noon;
  }

  if (hour <= 16) {
    return HomepageSegment.Afternoon;
  }

  if (hour <= 19) {
    return HomepageSegment.Dusk;
  }

  return HomepageSegment.Night;
}

export function getCopyIndexForHour(date: Date) {
  const timezoneDate = getDateInFixedTimezone(date, EAST_8_TIMEZONE_OFFSET_HOURS);
  const seed = Number(
    `${timezoneDate.getUTCFullYear()}${timezoneDate.getUTCMonth() + 1}${timezoneDate.getUTCDate()}${timezoneDate.getUTCHours()}`,
  );

  return Math.abs(seed * 17 + 11) % 3;
}

export function getHomepageThemeState(date: Date): IHomepageThemeState {
  const timezoneDate = getDateInFixedTimezone(date, EAST_8_TIMEZONE_OFFSET_HOURS);
  const segment = resolveHomepageSegment(timezoneDate.getUTCHours());
  const definition = HOMEPAGE_THEME_MAP[segment];
  const copyIndex = getCopyIndexForHour(date);
  const currentTimeLabel = `${String(timezoneDate.getUTCHours()).padStart(2, "0")}:${String(
    timezoneDate.getUTCMinutes(),
  ).padStart(2, "0")}`;

  return {
    ...definition,
    segment,
    copyIndex,
    headline: definition.copyOptions[copyIndex] ?? definition.copyOptions[0],
    currentTimeLabel,
  };
}

export function useHomepageTheme() {
  const initialTimestamp = useState("homepage-theme-initial-timestamp", () =>
    Date.now(),
  );
  const themeState = ref<IHomepageThemeState>(
    getHomepageThemeState(new Date(initialTimestamp.value)),
  );
  let timer: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    themeState.value = getHomepageThemeState(new Date());

    timer = setInterval(() => {
      themeState.value = getHomepageThemeState(new Date());
    }, 60_000);
  });

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer);
    }
  });

  const heroStyle = computed(() => ({
    "--homepage-shell-background": themeState.value.palette.shellBackground,
    "--homepage-base": themeState.value.palette.base,
    "--homepage-surface": themeState.value.palette.surface,
    "--homepage-text": themeState.value.palette.text,
    "--homepage-muted": themeState.value.palette.muted,
    "--homepage-accent": themeState.value.palette.accent,
    "--homepage-accent-hover": themeState.value.palette.accentHover,
    "--homepage-glow": themeState.value.palette.glow,
    "--homepage-button": themeState.value.palette.button,
    "--homepage-button-text": themeState.value.palette.buttonText,
  }));

  return {
    themeState,
    heroStyle,
  };
}
