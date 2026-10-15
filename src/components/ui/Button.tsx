import { useAppTheme } from "@/hooks/useAppTheme";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const { getRawColor } = useAppTheme();

  // Resolve background and loading indicator tokens dynamically based on the current theme context
  const limeForeground = getRawColor("limeForeground");
  const primaryText = getRawColor("primaryText");

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      className={`h-14 rounded-2xl items-center justify-center flex-row px-6 ${
        isPrimary
          ? "bg-lime active:opacity-90"
          : "bg-surface border border-border active:bg-elevated"
      } ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        /* 
          Fixed: Primary button now uses 'limeForeground' string for loading indicators 
          so it remains visible against the neon bright lime background 
        */
        <ActivityIndicator color={isPrimary ? limeForeground : primaryText} />
      ) : (
        <Text
          className={`font-inter-bold text-base ${
            isPrimary ? "text-lime-foreground" : "text-primary-text"
          }`}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
