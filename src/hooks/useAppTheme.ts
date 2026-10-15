import { useColorScheme } from "nativewind";
import { appThemeColors, AppThemeColor, AppThemeMode } from "@/theme/app-theme";

export function useAppTheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
  
  const currentScheme: AppThemeMode = colorScheme === "light" ? "light" : "dark";
  const colors = appThemeColors[currentScheme];

  // Helper function to read raw hex code explicitly (useful for charts/native components)
  const getRawColor = (colorKey: AppThemeColor): string => colors[colorKey];

  return {
    scheme: currentScheme,
    colors,
    getRawColor,
    setColorScheme,
    toggleColorScheme,
  };
}
