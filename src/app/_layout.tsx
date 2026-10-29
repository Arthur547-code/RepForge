import { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "nativewind";
import NetInfo from "@react-native-community/netinfo";

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

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { useProfile } from "@/features/profile/hooks/useProfileMutations";

// Sync Engine & Background Task imports

import { registerBackgroundSync } from "@/sync/background-sync";
import { syncEngine } from "@/sync/sync-engine/sync-engine";
import { initNetworkSyncListener } from "@/sync/network-listener";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Fix: Instantiating the QueryClient via useState preserves cache persistence across screen re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
      }),
  );

  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false, // Disables render-phase read/write warnings from library internals
  });

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

  // State to track startup sync and background task registration
  const [isSyncReady, setIsSyncReady] = useState(false);

  // 1. Startup Sync & Network Listener Lifecycle
  useEffect(() => {
    // SQLite migration complete hone ke baad hi sync queue access safe hota hai
    if (!dbMigrated) {
      if (dbError) {
        console.warn(
          "Local database migration failed; sync is disabled:",
          dbError,
        );
      }
      return;
    }

    let isMounted = true;

    async function initSyncPipeline() {
      try {
        // Background sync task register karein
        await registerBackgroundSync();

        // Initial launch network check & sync
        const netState = await NetInfo.fetch();
        if (netState.isConnected && netState.isInternetReachable !== false) {
          await syncEngine.sync();
        }

        console.log(`${netState} Sync Successed.`);
      } catch (err) {
        console.warn(
          "Startup sync check failed (offline or network error):",
          err,
        );
      } finally {
        if (isMounted) {
          setIsSyncReady(true);
        }
      }
    }

    initSyncPipeline();

    // 2. Real-time network reconnect listener (App open rehte waqt reconnect par sync)
    const unsubscribeNet = initNetworkSyncListener();

    return () => {
      isMounted = false;
      unsubscribeNet();
    };
  }, [dbMigrated, dbError]);

  // System validation flag checks structural integrity + startup sync before dropping splash screen
  const isReady = (fontsLoaded || !!fontError) && dbMigrated && isSyncReady;

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

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator scheme={scheme} />
    </QueryClientProvider>
  );
}

function RootNavigator({ scheme }: { scheme: "light" | "dark" }) {
  // Fetch authentication status directly via Better Auth client state hooks
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  const { data: profile, isPending: isProfileLoading } = useProfile(
    session?.user.id,
  );

  const isOnboardingComplete = !!profile?.onboardingCompletedAt;

  if (isAuthPending) {
    return null;
  }

  if (session && isProfileLoading) {
    return null;
  }

  return (
    <View style={getActiveThemeVars(scheme)} className="flex-1 bg-canvas">
      {/* Force status bar typography styling indicators based on app theme selection variables */}
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />

      {/* Declarative screen restrictions natively handled by Expo Router tree wrappers */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={!!session && !isOnboardingComplete}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>

        <Stack.Protected guard={!!session && isOnboardingComplete}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
    </View>
  );
}
