import { onBeforeUnmount, onMounted, ref } from "vue";

export enum HomepageSegment {
  Midnight = "midnight",
  Morning = "morning",
  LateMorning = "late-morning",
  Noon = "noon",
  Afternoon = "afternoon",
  Dusk = "dusk",
  Night = "night",
}

interface IHomepageThemeDefinition {
  label: string;
  timeRange: string;
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
    copyOptions: [
      "现在做一顿，也不晚。",
      "夜里也能慢慢做饭。",
      "这个时间，简单做点热的。",
    ],
  },
  [HomepageSegment.Morning]: {
    label: "早上",
    timeRange: "05:00 - 08:59",
    copyOptions: [
      "早上也可以慢一点。",
      "今天先好好吃饭。",
      "从一顿热的开始。",
    ],
  },
  [HomepageSegment.LateMorning]: {
    label: "上午",
    timeRange: "09:00 - 11:59",
    copyOptions: [
      "从一顿热的开始。",
      "今天做点简单的。",
      "先把这顿饭做好。",
    ],
  },
  [HomepageSegment.Noon]: {
    label: "中午",
    timeRange: "12:00 - 13:59",
    copyOptions: [
      "中午给自己做点吃的。",
      "先把这顿饭解决好。",
      "这个时间，适合做顿简单的。",
    ],
  },
  [HomepageSegment.Afternoon]: {
    label: "下午",
    timeRange: "14:00 - 16:59",
    copyOptions: [
      "下午适合做顿简单的。",
      "现在开始，也来得及。",
      "留一点时间给这顿饭。",
    ],
  },
  [HomepageSegment.Dusk]: {
    label: "傍晚",
    timeRange: "17:00 - 19:59",
    copyOptions: [
      "今晚做点热的。",
      "回来以后，认真做一顿。",
      "晚饭还是自己做吧。",
    ],
  },
  [HomepageSegment.Night]: {
    label: "晚上",
    timeRange: "20:00 - 23:59",
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
  const seed = Number(
    `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}${date.getHours()}`,
  );

  return Math.abs(seed * 17 + 11) % 3;
}

export function getHomepageThemeState(date: Date): IHomepageThemeState {
  const segment = resolveHomepageSegment(date.getHours());
  const definition = HOMEPAGE_THEME_MAP[segment];
  const copyIndex = getCopyIndexForHour(date);
  const currentTimeLabel = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
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

  return {
    themeState,
  };
}
