// src/components/ui/OptionButton.tsx
import { TouchableOpacity, Text } from "react-native";

interface OptionButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  className?: string;
}

export function OptionButton({
  label,
  isSelected,
  onPress,
  className = "",
}: OptionButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`h-14 rounded-2xl items-center justify-center border transition-all ${
        isSelected
          ? "bg-lime border-lime"
          : "bg-surface border-border"
      } ${className}`}
    >
      <Text
        className={`font-inter-semibold text-sm ${
          isSelected ? "text-lime-foreground" : "text-primary-text"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}