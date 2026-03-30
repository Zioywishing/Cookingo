export enum GlobalThemeSegment {
  Midnight = "midnight",
  Morning = "morning",
  LateMorning = "late-morning",
  Noon = "noon",
  Afternoon = "afternoon",
  Dusk = "dusk",
  Night = "night",
}

export interface IGlobalThemeCssVariables {
  "--app-theme-shell-background": string;
  "--app-theme-surface-base": string;
  "--app-theme-surface-elevated": string;
  "--app-theme-text-primary": string;
  "--app-theme-text-secondary": string;
  "--app-theme-accent": string;
  "--app-theme-accent-hover": string;
  "--app-theme-glow": string;
  "--app-theme-action-primary": string;
  "--app-theme-action-primary-text": string;
}

const GLOBAL_THEME_MAP: Record<GlobalThemeSegment, IGlobalThemeCssVariables> = {
  [GlobalThemeSegment.Midnight]: {
    "--app-theme-shell-background": "#050403",
    "--app-theme-surface-base": "#0D0907",
    "--app-theme-surface-elevated": "#18110D",
    "--app-theme-text-primary": "#F7EFE8",
    "--app-theme-text-secondary": "rgba(247, 239, 232, 0.42)",
    "--app-theme-accent": "#FF9A3D",
    "--app-theme-accent-hover": "#FFAE5C",
    "--app-theme-glow": "rgba(255, 154, 61, 0.18)",
    "--app-theme-action-primary": "#FF9A3D",
    "--app-theme-action-primary-text": "#120C08",
  },
  [GlobalThemeSegment.Morning]: {
    "--app-theme-shell-background": "#F8E9E1",
    "--app-theme-surface-base": "#FFF5F0",
    "--app-theme-surface-elevated": "#FFE7D9",
    "--app-theme-text-primary": "#3D2012",
    "--app-theme-text-secondary": "rgba(61, 32, 18, 0.5)",
    "--app-theme-accent": "#FF8260",
    "--app-theme-accent-hover": "#FF6A42",
    "--app-theme-glow": "rgba(255, 130, 96, 0.4)",
    "--app-theme-action-primary": "#FF8260",
    "--app-theme-action-primary-text": "#FFFFFF",
  },
  [GlobalThemeSegment.LateMorning]: {
    "--app-theme-shell-background": "#F5EEE6",
    "--app-theme-surface-base": "#FBF6EF",
    "--app-theme-surface-elevated": "#F4EBDD",
    "--app-theme-text-primary": "#332419",
    "--app-theme-text-secondary": "rgba(51, 36, 25, 0.5)",
    "--app-theme-accent": "#E07B47",
    "--app-theme-accent-hover": "#CC6A37",
    "--app-theme-glow": "rgba(224, 123, 71, 0.26)",
    "--app-theme-action-primary": "#E07B47",
    "--app-theme-action-primary-text": "#FFFFFF",
  },
  [GlobalThemeSegment.Noon]: {
    "--app-theme-shell-background": "#F3EEE7",
    "--app-theme-surface-base": "#FDFBF7",
    "--app-theme-surface-elevated": "#F2EBE1",
    "--app-theme-text-primary": "#271E15",
    "--app-theme-text-secondary": "rgba(39, 30, 21, 0.5)",
    "--app-theme-accent": "#DD6A2A",
    "--app-theme-accent-hover": "#C55C22",
    "--app-theme-glow": "rgba(221, 106, 42, 0.3)",
    "--app-theme-action-primary": "#DD6A2A",
    "--app-theme-action-primary-text": "#FFFFFF",
  },
  [GlobalThemeSegment.Afternoon]: {
    "--app-theme-shell-background": "#E9DDD1",
    "--app-theme-surface-base": "#F2E6D9",
    "--app-theme-surface-elevated": "#E7D4C4",
    "--app-theme-text-primary": "#3B281B",
    "--app-theme-text-secondary": "rgba(59, 40, 27, 0.52)",
    "--app-theme-accent": "#C96A3A",
    "--app-theme-accent-hover": "#B95E31",
    "--app-theme-glow": "rgba(201, 106, 58, 0.24)",
    "--app-theme-action-primary": "#C96A3A",
    "--app-theme-action-primary-text": "#FFFFFF",
  },
  [GlobalThemeSegment.Dusk]: {
    "--app-theme-shell-background": "#1A0F0A",
    "--app-theme-surface-base": "#2B160E",
    "--app-theme-surface-elevated": "#3D2218",
    "--app-theme-text-primary": "#FFF0E6",
    "--app-theme-text-secondary": "rgba(255, 240, 230, 0.6)",
    "--app-theme-accent": "#FF5E33",
    "--app-theme-accent-hover": "#FF7A55",
    "--app-theme-glow": "rgba(255, 94, 51, 0.2)",
    "--app-theme-action-primary": "#FF5E33",
    "--app-theme-action-primary-text": "#2B160E",
  },
  [GlobalThemeSegment.Night]: {
    "--app-theme-shell-background": "#090604",
    "--app-theme-surface-base": "#120C08",
    "--app-theme-surface-elevated": "#1E1510",
    "--app-theme-text-primary": "#FFFFFF",
    "--app-theme-text-secondary": "rgba(255, 255, 255, 0.4)",
    "--app-theme-accent": "#FF8200",
    "--app-theme-accent-hover": "#FFA23A",
    "--app-theme-glow": "rgba(255, 130, 0, 0.2)",
    "--app-theme-action-primary": "#FF8200",
    "--app-theme-action-primary-text": "#120C08",
  },
};

export function resolveGlobalThemeSegment(hour: number) {
  if (hour >= 0 && hour <= 4) {
    return GlobalThemeSegment.Midnight;
  }

  if (hour <= 8) {
    return GlobalThemeSegment.Morning;
  }

  if (hour <= 11) {
    return GlobalThemeSegment.LateMorning;
  }

  if (hour <= 13) {
    return GlobalThemeSegment.Noon;
  }

  if (hour <= 16) {
    return GlobalThemeSegment.Afternoon;
  }

  if (hour <= 19) {
    return GlobalThemeSegment.Dusk;
  }

  return GlobalThemeSegment.Night;
}

export function getGlobalThemeCssVariables(segment: GlobalThemeSegment) {
  return GLOBAL_THEME_MAP[segment];
}

export function buildGlobalThemeBootstrapScript() {
  const serializedThemeMap = JSON.stringify(GLOBAL_THEME_MAP);

  return `(() => {
    const themeMap = ${serializedThemeMap};
    const now = new Date();
    const hour = now.getHours();
    let segment = "${GlobalThemeSegment.Night}";

    if (hour >= 0 && hour <= 4) {
      segment = "${GlobalThemeSegment.Midnight}";
    } else if (hour <= 8) {
      segment = "${GlobalThemeSegment.Morning}";
    } else if (hour <= 11) {
      segment = "${GlobalThemeSegment.LateMorning}";
    } else if (hour <= 13) {
      segment = "${GlobalThemeSegment.Noon}";
    } else if (hour <= 16) {
      segment = "${GlobalThemeSegment.Afternoon}";
    } else if (hour <= 19) {
      segment = "${GlobalThemeSegment.Dusk}";
    }

    const theme = themeMap[segment];

    if (!theme) {
      return;
    }

    for (const [name, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(name, value);
    }
  })();`;
}

export function useGlobalTheme() {
  return {
    buildGlobalThemeBootstrapScript,
  };
}
