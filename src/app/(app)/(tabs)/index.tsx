import SignOutButton from "@/features/auth/components/SignOutButton";
import { Text, View } from "react-native";

export default function HomeTab() {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <Text className="font-inter-semibold text-primary-text">Home</Text>
      <SignOutButton/>
    </View>
  );
}
