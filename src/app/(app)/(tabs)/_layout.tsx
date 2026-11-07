import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/theme/hooks/useAppTheme";
import { useEffect } from "react";
// 1. Import Reanimated primitives
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const tabIcons: Record<string, IconName> = {
  index: "home-variant-outline",
  history: "calendar-month-outline",
  exercises: "book-open-page-variant-outline",
  profile: "account-circle-outline",
};

function AnimatedWorkoutsIcon({
  focused,
  colors,
}: {
  focused: boolean;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  // 2. Define shared animation values
  const scale = useSharedValue(1);
  const translateY = useSharedValue(-12);

  // 3. Trigger physics-based spring animations when focused state transitions
  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, { mass: 0.5, damping: 12 });
    translateY.value = withSpring(focused ? -20 : -12, {
      mass: 0.5,
      damping: 12,
    });
  }, [focused, scale, translateY]);

  // 4. Map shared values to active UI style layout properties
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          alignItems: "center",
          backgroundColor: focused ? colors.lime : colors.elevated,
          borderColor: colors.surface,
          borderRadius: 30,
          borderWidth: 3,
          height: 52,
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
          width: 52,
        },
        animatedStyle, // Injects live transform properties smoothly
      ]}
    >
      <MaterialCommunityIcons
        color={focused ? colors.limeForeground : colors.primaryText}
        name="dumbbell"
        size={24}
      />
    </Animated.View>
  );
}

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 10,
        },
        tabBarStyle: {
          alignSelf: "center",
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: 28,
          borderWidth: 1,
          bottom: Math.max(insets.bottom, 10),
          elevation: 8,
          height: 70,
          left: 16,
          overflow: "visible",
          paddingBottom: 7,
          paddingHorizontal: 5,
          paddingTop: 7,
          position: "absolute",
          right: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.14,
          shadowRadius: 12,
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={tabIcons[route.name] ?? "circle-outline"}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />

      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ focused }) => (
            // Extracted cleanly into an isolated animated rendering block
            <AnimatedWorkoutsIcon focused={focused} colors={colors} />
          ),
        }}
      />

      <Tabs.Screen name="exercises" options={{ title: "Exercises" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
