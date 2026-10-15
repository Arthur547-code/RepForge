import { vars } from "nativewind";

const brand = {
  lime: "#C4F55A",
  limeForeground: "#0B100D",
  success: "#8EDB75",
  warning: "#F6B45C",
  destructive: "#EF4444",
  destructiveForeground: "#FFFFFF",
} as const;

export const appThemeColors = {
  dark: {
    ...brand,
    canvas: "#0B100D",
    surface: "#141B16",
    elevated: "#1B241D",
    border: "#2B382E",
    primaryText: "#F1F5EF",
    mutedText: "#9BA89D",
    card: "#141B16",
    input: "#1B241D",
    inputBorder: "#2B382E",
  },
  light: {
    ...brand,
    canvas: "#F4F7F4",
    surface: "#FFFFFF",
    elevated: "#E8EDE9",
    border: "#D1DDD3",
    primaryText: "#0B100D",
    mutedText: "#5F6D61",
    card: "#FFFFFF",
    input: "#FFFFFF",
    inputBorder: "#D1DDD3",
  },
} as const;

export type AppThemeMode = "light" | "dark";
export type AppThemeColor = keyof (typeof appThemeColors)["dark"];
type ThemeColors = Record<AppThemeColor, string>;

const rgb = (hex: string) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return `${value >> 16} ${(value >> 8) & 255} ${value & 255}`;
};

const createTheme = (colors: ThemeColors) =>
  vars({
    "--color-canvas": rgb(colors.canvas),
    "--color-surface": rgb(colors.surface),
    "--color-elevated": rgb(colors.elevated),
    "--color-border": rgb(colors.border),
    "--color-primary-text": rgb(colors.primaryText),
    "--color-muted-text": rgb(colors.mutedText),
    "--color-lime": rgb(colors.lime),
    "--color-lime-foreground": rgb(colors.limeForeground),
    "--color-success": rgb(colors.success),
    "--color-warning": rgb(colors.warning),
    "--color-destructive": rgb(colors.destructive),
    "--color-destructive-foreground": rgb(colors.destructiveForeground),
    "--color-card": rgb(colors.card),
    "--color-input": rgb(colors.input),
    "--color-input-border": rgb(colors.inputBorder),
  });

export const appThemes = {
  dark: createTheme(appThemeColors.dark),
  light: createTheme(appThemeColors.light),
};

// Clean utility to get theme object outside hook context if needed
export const getActiveThemeVars = (scheme: AppThemeMode | null | undefined) => {
  return appThemes[scheme === "light" ? "light" : "dark"];
};
