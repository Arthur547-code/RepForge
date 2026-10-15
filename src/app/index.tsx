// src/app/index.tsx
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const GYM_BG_IMAGE =
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#0B100D]">
      {/* Locked to light text indicators to match our permanent dark theme */}
      <StatusBar style="light" />

      <ImageBackground
        source={{ uri: GYM_BG_IMAGE }}
        className="flex-1 justify-between"
        resizeMode="cover"
      >
        {/* Top Dark Vignette */}
        <LinearGradient
          colors={["rgba(11, 16, 13, 0.8)", "transparent"]}
          locations={[0, 0.5]}
          className="absolute top-0 left-0 right-0 h-40 z-0"
        />

        {/* Bottom Smooth Dark Fade */}
        <LinearGradient
          colors={[
            "transparent",
            "rgba(11, 16, 13, 0.4)",
            "rgba(11, 16, 13, 0.85)",
            "#0B100D",
          ]}
          locations={[0, 0.25, 0.65, 0.95]}
          className="absolute bottom-0 left-0 right-0 h-[75%] z-0"
        />

        <SafeAreaView className="flex-1 justify-between px-6 py-4 z-10">
          {/* Top Row: Pill Tag + Frosted Theme Toggle Button */}
          <View className="flex-row items-center justify-between mt-2">
            <View className="self-start px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-[#C4F55A] mr-2" />
                <Text className="text-white/90 font-inter-semibold text-xs tracking-wider uppercase">
                  RepForge • Offline-First
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Content Area */}
          <View className="mb-2">
            <View className="mb-8">
              <Text className="text-white text-5xl font-inter-bold tracking-tight leading-snug">
                Rep<Text className="text-[#C4F55A]">Forge</Text>
              </Text>

              <Text className="text-white text-2xl font-inter-bold mt-3 leading-snug">
                Today’s work,{"\n"}
                <Text className="text-[#C4F55A]">stronger tomorrow.</Text>
              </Text>

              <Text className="text-neutral-300 font-inter text-base mt-3 leading-relaxed max-w-[320px]">
                Log sets quickly. Your workout history stays yours, even
                completely offline.
              </Text>

              {/* Feature Pills */}
              <View className="flex-row gap-2 mt-4">
                <View className="bg-black/60 border border-white/10 px-3 py-1 rounded-lg">
                  <Text className="text-neutral-300 font-inter-medium text-xs">
                    ⚡ Zero Lag
                  </Text>
                </View>
                <View className="bg-black/60 border border-white/10 px-3 py-1 rounded-lg">
                  <Text className="text-neutral-300 font-inter-medium text-xs">
                    🔒 Local SQLite
                  </Text>
                </View>
                <View className="bg-black/60 border border-white/10 px-3 py-1 rounded-lg">
                  <Text className="text-neutral-300 font-inter-medium text-xs">
                    📊 Auto Sync
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/(auth)/sign-up" as any)}
                className="h-14 bg-[#C4F55A] rounded-2xl items-center justify-center active:opacity-90"
              >
                <Text className="text-[#0B100D] font-inter-bold text-base">
                  Start workout
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/(auth)/sign-in" as any)}
                className="h-14 bg-black/60 border border-white/15 rounded-2xl items-center justify-center active:bg-white/5"
              >
                <Text className="text-white font-inter-bold text-base">
                  I already have an account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
