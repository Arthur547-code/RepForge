// src/features/auth/components/OAuth.tsx
import React from "react";
import { View, Text, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Button } from "@/components/ui/Button";
import { useSocialSignInMutation } from "../hooks/useAuthMutations";

export default function OAuth() {
  const { colors } = useAppTheme();
  const { mutate: socialSignIn, isPending, error } = useSocialSignInMutation();

  return (
    <View className="mt-6">
      {/* Error display agar popup cancel ya fail ho */}
      {error && (
        <View className="mb-4 p-3 bg-destructive/15 border border-destructive/40 rounded-xl">
          <Text className="text-destructive font-inter-medium text-xs">
            {error.message}
          </Text>
        </View>
      )}

      {/* Divider */}
      <View className="flex-row items-center mb-5">
        <View className="flex-1 h-[1px] bg-border" />
        <Text className="text-muted-text font-inter-medium text-xs px-3">
          Or continue with
        </Text>
        <View className="flex-1 h-[1px] bg-border" />
      </View>

      {/* Social Buttons */}
      <View className="flex-row gap-3">
        <Button
          disabled={isPending}
          onPress={() => socialSignIn("google")}
          variant="secondary"
          loading={isPending}
          className="flex-1 h-14 rounded-xl px-0 gap-2"
        >
          <Ionicons name="logo-google" size={18} color={colors.primaryText} />
          <Text className="text-primary-text font-inter-semibold text-sm">
            Google
          </Text>
        </Button>

        <Button
          disabled={isPending}
          onPress={() => Alert.alert("Apple Sign-In", "Apple Sign-In is not implemented yet.")}
          variant="secondary"
          className="flex-1 h-14 rounded-xl px-0 gap-2"
        >
          <Ionicons name="logo-apple" size={20} color={colors.primaryText} />
          <Text className="text-primary-text font-inter-semibold text-sm">
            Apple
          </Text>
        </Button>
      </View>
    </View>
  );
}
