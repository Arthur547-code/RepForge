import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "nativewind";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/client/migrations";
import { localDb } from "../db/client";
import { getActiveThemeVars } from "@/theme/app-theme";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { success: dbMigrated, error: dbError } = useMigrations(localDb, migrations);
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme ?? "dark"; 

  const isReady = (fontsLoaded || !!fontError) && (dbMigrated || !!dbError);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch((err) => {
        console.warn("Error hiding splash screen:", err);
      });
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  // 1. Injected global design vars using style layout mapping
  // 2. Transformed view using semantic tailwind class 'bg-canvas' instead of hardcoded objects
  return (
    <View style={getActiveThemeVars(scheme)} className="flex-1 bg-canvas">
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </View>
  );
}
