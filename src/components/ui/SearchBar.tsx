// src\components\ui\SearchBar.tsx
import React, { useEffect, useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/hooks/useAppTheme";

interface SearchBarProps {
  onSearchChange: (debouncedText: string) => void;
  placeholder?: string;
  debounceDelay?: number;
  className?: string;
}

export function SearchBar({
  onSearchChange,
  placeholder = "Search...",
  debounceDelay = 300,
  className = "",
}: SearchBarProps) {
  const [internalText, setInternalText] = useState("");
  const { colors } = useAppTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(internalText);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [internalText, debounceDelay, onSearchChange]);

  const handleClear = () => {
    setInternalText("");
    onSearchChange("");
  };

  return (
    <View
      className={`flex-row items-center rounded-2xl border border-input-border bg-input px-3.5 py-2.5 ${className}`}
    >
      <Ionicons name="search-outline" size={19} color={colors.mutedText} />
      <TextInput
        value={internalText}
        onChangeText={setInternalText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
        className="ml-2 flex-1 py-0 font-inter text-base text-primary-text"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {internalText.length > 0 && (
        <Pressable
          onPress={handleClear}
          hitSlop={8}
          className="ml-2 h-7 w-7 items-center justify-center rounded-full bg-elevated"
        >
          <Text className="font-inter-bold text-lg text-muted-text">x</Text>
        </Pressable>
      )}
    </View>
  );
}
