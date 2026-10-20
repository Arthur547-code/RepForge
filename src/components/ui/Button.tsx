import { useAppTheme } from "@/hooks/useAppTheme";
import type { ReactNode } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

interface ButtonProps {
  label?: string;
  children?: ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  activeOpacity?: number;
  hitSlop?: TouchableOpacityProps["hitSlop"];
}

export function Button({
  label,
  children,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  activeOpacity = 0.8,
  hitSlop,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const { getRawColor } = useAppTheme();

  // Resolve background and loading indicator tokens dynamically based on the current theme context
  const limeForeground = getRawColor("limeForeground");
  const primaryText = getRawColor("primaryText");

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      disabled={disabled || loading}
      hitSlop={hitSlop}
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
        children ?? (
          <Text
            className={`font-inter-bold text-base ${
              isPrimary ? "text-lime-foreground" : "text-primary-text"
            }`}
          >
            {label}
          </Text>
        )
      )}
    </TouchableOpacity>
  );
}
