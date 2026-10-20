// src\features\auth\components\SignOutButton.tsx
import { Button } from "@/components/ui/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { useSignOutMutation } from "../hooks/useAuthMutations";

const SignOutButton = () => {
  const { colors } = useAppTheme();
  const { mutate: signOut, isPending } = useSignOutMutation();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <Button
      disabled={isPending}
      loading={isPending}
      variant="secondary"
      className="self-start ml-2 h-12 rounded-xl border-destructive/30 bg-destructive/10 px-4"
      onPress={handleSignOut}
    >
      <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
      <Text className="ml-2 font-inter-semibold text-sm text-destructive">
        Sign Out
      </Text>
    </Button>
  );
};

export default SignOutButton;
