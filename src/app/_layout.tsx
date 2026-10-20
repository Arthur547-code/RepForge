import { useEffect, useState } from "react";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Fetch authentication status directly via Better Auth client state hooks
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  // Fix: Instantiating the QueryClient via useState preserves cache persistence across screen re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
      }),
  );

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { success: dbMigrated, error: dbError } = useMigrations(
    localDb,
    migrations,
  );

  const { colorScheme } = useColorScheme();
  const scheme = colorScheme ?? "dark";

  // System validation flag checks structural integrity steps before dropping splash screens
  const isReady = (fontsLoaded || !!fontError) && (dbMigrated || !!dbError);

  useEffect(() => {
    if (isReady && !isAuthPending) {
      SplashScreen.hideAsync().catch((err) => {
        console.warn("Error hiding splash screen:", err);
      });
    }
  }, [isReady, isAuthPending]);

  if (!isReady || isAuthPending) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={getActiveThemeVars(scheme)} className="flex-1 bg-canvas">
        {/* Force status bar typography styling indicators based on app theme selection variables */}
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />

        {/* Declarative screen restrictions natively handled by Expo Router tree wrappers */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!session}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
          </Stack.Protected>

          <Stack.Protected guard={!!session}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
