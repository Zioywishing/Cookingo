import { computed, onBeforeUnmount, onMounted, ref } from "vue";

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
  background: string;
  text: string;
  accent: string;
  button: string;
  buttonText: string;
  shadow: string;
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
}

const HOMEPAGE_THEME_MAP: Record<HomepageSegment, IHomepageThemeDefinition> = {
  [HomepageSegment.Midnight]: {
    label: "凌晨",
    timeRange: "00:00 - 04:59",
    palette: {
      background:
        "radial-gradient(circle at top left, rgba(255, 255, 255, 0.10), transparent 34%), linear-gradient(180deg, #251e1a 0%, #1b1613 100%)",
      text: "#f0e6dc",
      accent: "#c9b6a6",
      button: "#efe1d2",
      buttonText: "#241d19",
      shadow: "0 10px 24px rgba(17, 12, 9, 0.28)",
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
      background:
        "radial-gradient(circle at top left, rgba(255, 255, 255, 0.96), transparent 34%), linear-gradient(180deg, #fdf4ef 0%, #f7e7df 100%)",
      text: "#332419",
      accent: "#876e5c",
      button: "#70503c",
      buttonText: "#fffaf6",
      shadow: "0 10px 24px rgba(72, 50, 35, 0.12)",
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
      background:
        "radial-gradient(circle at top left, rgba(255, 255, 255, 0.82), transparent 34%), linear-gradient(180deg, #f8eedb 0%, #f0e0c4 100%)",
      text: "#332419",
      accent: "#876e5c",
      button: "#5f4332",
      buttonText: "#fffaf6",
      shadow: "0 10px 24px rgba(72, 50, 35, 0.14)",
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
      background:
        "radial-gradient(circle at top left, rgba(255, 255, 255, 0.88), transparent 34%), linear-gradient(180deg, #fcf0cf 0%, #f4dfb2 100%)",
      text: "#4a2d17",
      accent: "#956942",
      button: "#8d572f",
      buttonText: "#fffaf4",
      shadow: "0 10px 24px rgba(95, 61, 29, 0.16)",
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
      background:
        "radial-gradient(circle at top left, rgba(255, 255, 255, 0.72), transparent 34%), linear-gradient(180deg, #f2e1ce 0%, #e6d0bc 100%)",
      text: "#3d2718",
      accent: "#8c6342",
      button: "#74472b",
      buttonText: "#fffaf4",
      shadow: "0 10px 24px rgba(90, 55, 31, 0.16)",
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
      background:
        "radial-gradient(circle at top left, rgba(255, 255, 255, 0.66), transparent 34%), linear-gradient(180deg, #efd5ca 0%, #dfb9aa 100%)",
      text: "#332419",
      accent: "#905949",
      button: "#844637",
      buttonText: "#fff8f2",
      shadow: "0 10px 24px rgba(95, 50, 37, 0.18)",
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
      background:
        "radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 30%), linear-gradient(180deg, #342820 0%, #271d17 100%)",
      text: "#f4e9de",
      accent: "#d2bdad",
      button: "#f2e7db",
      buttonText: "#2a211b",
      shadow: "0 10px 24px rgba(17, 12, 9, 0.24)",
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
  const seed = Number(
    `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}${date.getHours()}`,
  );

  return Math.abs(seed * 17 + 11) % 3;
}

export function getHomepageThemeState(date: Date): IHomepageThemeState {
  const segment = resolveHomepageSegment(date.getHours());
  const definition = HOMEPAGE_THEME_MAP[segment];
  const copyIndex = getCopyIndexForHour(date);

  return {
    ...definition,
    segment,
    copyIndex,
    headline: definition.copyOptions[copyIndex],
  };
}

export function useHomepageTheme() {
  const themeState = ref<IHomepageThemeState>(
    getHomepageThemeState(new Date("2026-03-27T18:00:00.000Z")),
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
    "--homepage-background": themeState.value.palette.background,
    "--homepage-text": themeState.value.palette.text,
    "--homepage-accent": themeState.value.palette.accent,
    "--homepage-button": themeState.value.palette.button,
    "--homepage-button-text": themeState.value.palette.buttonText,
    "--homepage-shadow": themeState.value.palette.shadow,
  }));

  return {
    themeState,
    heroStyle,
  };
}
