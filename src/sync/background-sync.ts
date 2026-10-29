// src/sync/background-sync.ts
import { Alert, AppState, Platform } from "react-native";
import Constants from "expo-constants";
import { syncEngine } from "./sync-engine/sync-engine";
import { appThemeColors } from "@/theme/app-theme";

export const BACKGROUND_SYNC_TASK = "REPFORGE_BACKGROUND_SYNC_TASK";

type NotificationsType = typeof import("expo-notifications");
type TaskManagerType = typeof import("expo-task-manager");
type BackgroundTaskType = typeof import("expo-background-task");

let Notifications: NotificationsType | null = null;
let TaskManager: TaskManagerType | null = null;
let BackgroundTask: BackgroundTaskType | null = null;
let nativeModulesLoaded = false;

// Async loader jo static require() ko completely avoid karta hai
async function loadNativeModules(): Promise<boolean> {
  if (nativeModulesLoaded) return !!TaskManager && !!BackgroundTask;

  // Expo Go on Android does not ship the native remote-notification module.
  // Avoid importing expo-notifications there: SDK 57 can throw while the
  // module is being evaluated, before the import promise can be handled.
  if (Platform.OS === "android" && Constants.expoGoConfig !== null) {
    return false;
  }

  try {
    const [taskMod, bgMod] = await Promise.all([
      import("expo-task-manager"),
      import("expo-background-task"),
    ]);

    TaskManager = taskMod;
    BackgroundTask = bgMod;

    // Notifications are optional; background sync should still work without them.
    if (!(Platform.OS === "android" && Constants.expoGoConfig !== null)) {
      try {
        Notifications = await import("expo-notifications");
      } catch (error) {
        console.warn("Notifications are unavailable in this build:", error);
      }
    }

    nativeModulesLoaded = true;

    // Notification presentation handler configure karein
    if (Notifications) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }

    // Background task define karein
    // defineTask ka matlab hai background mein kya kaam hona hai uska logic likhna.
    if (!TaskManager.isTaskDefined(BACKGROUND_SYNC_TASK)) {
      TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
        try {
          const result = await syncEngine.sync();

          if (
            result.processed > 0 &&
            AppState.currentState !== "active" &&
            Notifications
          ) {
            await ensureNotificationChannel();
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "RepForge Synced",
                body: "All your offline workout data is now backed up safely.",
                sound: "default",
                ...(Platform.OS === "android"
                  ? { channelId: "sync-status" }
                  : {}),
              },
              trigger: null,
            });
          }

          return BackgroundTask?.BackgroundTaskResult?.Success ?? 1;
        } catch (error) {
          console.warn("[BACKGROUND_SYNC_ERROR]", error);
          return BackgroundTask?.BackgroundTaskResult?.Failed ?? 0;
        }
      });
    }

    return !!TaskManager && !!BackgroundTask;
  } catch {
    nativeModulesLoaded = true;
    console.warn(
      "Native background/notification modules are unavailable in this build.",
    );
    return false;
  }
}

// Android 8.0+ phones ke liye 'Sync Status' naam ka notification channel/category banata hai, jiske bina Android par push notification show nahi hogi.
async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS === "android" && Notifications?.setNotificationChannelAsync) {
    const limeColor = appThemeColors.dark.lime; // "#C4F55A"

    await Notifications.setNotificationChannelAsync("sync-status", {
      name: "Sync Status",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: limeColor,
    });
  }
}

// Yeh function phone ke OS (Android/iOS) ke paas humare background sync task ko register karta hai taaki app band hone par bhi har 15 mins mein data server par automatically chala jaye.
export async function registerBackgroundSync(): Promise<void> {
  const isAvailable = await loadNativeModules();
  if (!isAvailable || !BackgroundTask || !TaskManager) {
    return;
  }

  try {
    if (Notifications) {
      await Notifications.requestPermissionsAsync().catch(() => null);
      await ensureNotificationChannel();
    }

    // registerTaskAsync ka matlab hai us kaam ko phone ke system mein schedule (active) karna taaki wo har 15 min mein chale.
    const isRegistered =
      await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isRegistered) {
      await BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60,
      });
    }
  } catch (err) {
    console.warn(
      "Failed to register background task (requires Dev Build):",
      err,
    );
  }
}

// Yeh function settings screen par ek 'Test' button lagane ke kaam aayega, jisse hum check kar sakein ki notification system phone mein sahi se active hua hai ya nahi.
export async function triggerTestNotification(): Promise<void> {
  try {
    await loadNativeModules();

    if (!Notifications?.scheduleNotificationAsync) {
      Alert.alert(
        "Notifications unavailable",
        "Use a development build to test notifications on Android.",
      );
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Notifications disabled", "Permission was not granted.");
      return;
    }

    await ensureNotificationChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "RepForge Test Alert 🏋️‍♂️",
        body: "Notification system is active!",
        sound: "default",
        ...(Platform.OS === "android" ? { channelId: "sync-status" } : {}),
      },
      trigger: null,
    });
  } catch (error) {
    console.warn("[NOTIFICATION_TEST_ERROR]", error);
    Alert.alert(
      "Notification failed",
      "The test notification could not be scheduled.",
    );
  }
}
